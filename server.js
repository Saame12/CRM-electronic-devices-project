const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'crm.json');
const sessions = new Map();

const products = ['Dell Inspiron 15 3530', 'HP 15-fd0231TU', 'Lenovo IdeaPad Slim 3 15IAH8', 'ASUS Vivobook 15 X1504', 'ASUS TUF Gaming F15 FX507', 'Lenovo LOQ 15IAX9', 'MSI Thin 15 B13VE', 'Acer Nitro V 15 ANV15', 'PC Gaming Backline G1', 'PC Gaming Backline G2', 'PC Gaming Backline G3', 'PC Đồ họa Backline D1', 'PC Văn phòng Backline O1', 'PC Văn phòng Backline O2'];
const types = ['Góp ý', 'Khen ngợi', 'Báo lỗi / Khiếu nại', 'Câu hỏi'];
const dateVN = () => new Intl.DateTimeFormat('vi-VN').format(new Date());
const hash = password => crypto.scryptSync(password, 'backline-crm-v1', 64).toString('hex');
const safeUser = ({ passwordHash, ...user }) => user;

function initialData() {
  return {
    users: [{ id: crypto.randomUUID(), email: 'khach@demo.vn', passwordHash: hash('123456'), name: 'Nguyễn Minh Anh', phone: '0901234567', addr: '12 Lê Lợi, Quận 1, TP.HCM', year: 1998, gender: 'Nữ', need: 'Gaming', createdAt: new Date().toISOString() }],
    feedback: [],
    surveyResponses: []
  };
}

function loadData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const db = initialData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
    return db;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
let db = loadData();
const save = () => fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
const json = (res, status, data) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); };
const error = (res, status, message) => json(res, status, { error: message });
const body = req => new Promise((resolve, reject) => {
  let raw = '';
  req.on('data', chunk => { raw += chunk; if (raw.length > 1_000_000) req.destroy(); });
  req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Dữ liệu gửi lên không hợp lệ.')); } });
  req.on('error', reject);
});
const validEmail = email => /^\S+@\S+\.\S+$/.test(email);
const validPhone = phone => /^0\d{9,10}$/.test(phone);

function currentUser(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const id = sessions.get(token);
  return id ? db.users.find(user => user.id === id) : null;
}
function tokenFor(user) { const token = crypto.randomBytes(32).toString('hex'); sessions.set(token, user.id); return token; }
function requireUser(req, res) { const user = currentUser(req); if (!user) { error(res, 401, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'); return null; } return user; }

async function api(req, res, url) {
  const route = url.pathname;
  if (req.method === 'POST' && route === '/api/auth/login') {
    const { email = '', password = '' } = await body(req);
    const user = db.users.find(x => x.email === String(email).trim().toLowerCase());
    if (!user || !crypto.timingSafeEqual(Buffer.from(user.passwordHash, 'hex'), Buffer.from(hash(String(password)), 'hex'))) return error(res, 401, 'Email hoặc mật khẩu không đúng.');
    return json(res, 200, { token: tokenFor(user), user: safeUser(user) });
  }
  if (req.method === 'POST' && route === '/api/auth/register') {
    const { name = '', email = '', phone = '', password = '' } = await body(req);
    const normalizedEmail = String(email).trim().toLowerCase(), normalizedPhone = String(phone).trim();
    if (!String(name).trim()) return error(res, 400, 'Vui lòng nhập họ và tên.');
    if (!validEmail(normalizedEmail)) return error(res, 400, 'Email chưa đúng định dạng.');
    if (!validPhone(normalizedPhone)) return error(res, 400, 'Số điện thoại cần 10-11 chữ số và bắt đầu bằng 0.');
    if (String(password).length < 6) return error(res, 400, 'Mật khẩu cần ít nhất 6 ký tự.');
    if (db.users.some(x => x.email === normalizedEmail)) return error(res, 409, 'Email này đã được đăng ký.');
    if (db.users.some(x => x.phone === normalizedPhone)) return error(res, 409, 'Số điện thoại này đã được đăng ký cho tài khoản khác.');
    const user = { id: crypto.randomUUID(), email: normalizedEmail, passwordHash: hash(String(password)), name: String(name).trim(), phone: normalizedPhone, addr: '', year: '', gender: '', need: 'Chưa xác định', createdAt: new Date().toISOString() };
    db.users.push(user); save(); return json(res, 201, { token: tokenFor(user), user: safeUser(user) });
  }
  if (req.method === 'GET' && route === '/api/me') { const user = requireUser(req, res); if (user) json(res, 200, { user: safeUser(user) }); return; }
  if (req.method === 'PUT' && route === '/api/me') {
    const user = requireUser(req, res); if (!user) return;
    const v = await body(req), name = String(v.name || '').trim(), phone = String(v.phone || '').trim(), year = v.year === '' || v.year == null ? '' : Number(v.year);
    if (!name) return error(res, 400, 'Họ và tên không được để trống.');
    if (!validPhone(phone)) return error(res, 400, 'Số điện thoại cần 10-11 chữ số và bắt đầu bằng 0.');
    if (db.users.some(x => x.id !== user.id && x.phone === phone)) return error(res, 409, 'Số điện thoại này đã được dùng cho tài khoản khác.');
    if (year !== '' && (!Number.isInteger(year) || year < 1940 || year > 2012)) return error(res, 400, 'Năm sinh cần nằm trong khoảng 1940 - 2012.');
    Object.assign(user, { name, phone, addr: String(v.addr || '').trim(), year, gender: ['','Nam','Nữ','Khác'].includes(v.gender) ? v.gender : '', need: String(v.need || 'Chưa xác định') }); save(); return json(res, 200, { user: safeUser(user) });
  }
  if (req.method === 'GET' && route === '/api/feedback') { const user = requireUser(req, res); if (user) json(res, 200, { feedback: db.feedback.filter(x => x.userId === user.id).sort((a,b) => b.createdAt.localeCompare(a.createdAt)) }); return; }
  if (req.method === 'POST' && route === '/api/feedback') {
    const user = requireUser(req, res); if (!user) return; const v = await body(req);
    if (!products.includes(v.prod)) return error(res, 400, 'Vui lòng chọn sản phẩm hợp lệ.');
    if (!types.includes(v.type)) return error(res, 400, 'Loại phản hồi không hợp lệ.');
    if (!Number.isInteger(v.rate) || v.rate < 1 || v.rate > 5) return error(res, 400, 'Vui lòng chọn số sao đánh giá.');
    if (String(v.body || '').trim().length < 10) return error(res, 400, 'Nội dung phản hồi cần ít nhất 10 ký tự.');
    const feedback = { id: crypto.randomUUID(), userId: user.id, prod: v.prod, type: v.type, rate: v.rate, title: String(v.title || '').trim().slice(0, 80), body: String(v.body).trim(), date: dateVN(), reply: '', createdAt: new Date().toISOString() };
    db.feedback.push(feedback); save(); return json(res, 201, { feedback });
  }
  const survey = route.match(/^\/api\/surveys\/([\w-]+)\/responses$/);
  if (req.method === 'GET' && route === '/api/survey-status') { const user = requireUser(req, res); if (user) { const completed = Object.fromEntries(db.surveyResponses.filter(x => x.userId === user.id).map(x => [x.surveyId, x.completedAt])); json(res, 200, { completed }); } return; }
  if (req.method === 'POST' && survey) {
    const user = requireUser(req, res); if (!user) return; const surveyId = survey[1];
    if (!['s1','s2','s3'].includes(surveyId)) return error(res, 404, 'Không tìm thấy khảo sát.');
    if (db.surveyResponses.some(x => x.userId === user.id && x.surveyId === surveyId)) return error(res, 409, 'Khảo sát này đã được hoàn thành.');
    const response = { id: crypto.randomUUID(), userId: user.id, surveyId, answers: (await body(req)).answers || {}, completedAt: dateVN(), createdAt: new Date().toISOString() };
    db.surveyResponses.push(response); save(); return json(res, 201, { completedAt: response.completedAt });
  }
  return error(res, 404, 'Không tìm thấy API.');
}

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };
function staticFile(res, url) {
  const requested = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const file = path.resolve(ROOT, requested);
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return error(res, 404, 'Không tìm thấy trang.');
  res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
}
http.createServer(async (req, res) => { const url = new URL(req.url, `http://${req.headers.host}`); try { if (url.pathname.startsWith('/api/')) await api(req, res, url); else if (req.method === 'GET') staticFile(res, url); else error(res, 405, 'Phương thức không được hỗ trợ.'); } catch (e) { console.error(e); error(res, 500, e.message || 'Lỗi máy chủ.'); } }).listen(PORT, () => console.log(`CRM đang chạy tại http://localhost:${PORT}`));
