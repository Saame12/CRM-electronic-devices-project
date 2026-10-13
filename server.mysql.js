require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const secret = process.env.JWT_SECRET;
const products = ['Dell Inspiron 15 3530', 'HP 15-fd0231TU', 'Lenovo IdeaPad Slim 3 15IAH8', 'ASUS Vivobook 15 X1504', 'ASUS TUF Gaming F15 FX507', 'Lenovo LOQ 15IAX9', 'MSI Thin 15 B13VE', 'Acer Nitro V 15 ANV15', 'PC Gaming Backline G1', 'PC Gaming Backline G2', 'PC Gaming Backline G3', 'PC Đồ họa Backline D1', 'PC Văn phòng Backline O1', 'PC Văn phòng Backline O2'];
const feedbackTypes = ['Góp ý', 'Khen ngợi', 'Báo lỗi / Khiếu nại', 'Câu hỏi'];
const needs = ['Gaming', 'Đồ họa', 'Văn phòng', 'Chưa xác định'];
if (!secret) throw new Error('JWT_SECRET chưa được cấu hình trong .env');

const db = mysql.createPool({ host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD, database: process.env.DB_NAME || 'backline_crm', waitForConnections: true, connectionLimit: 10, charset: 'utf8mb4' });
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

const uid = () => crypto.randomUUID();
const dateVN = value => new Intl.DateTimeFormat('vi-VN').format(new Date(value));
const emailOk = x => /^\S+@\S+\.\S+$/.test(x);
const phoneOk = x => /^0\d{9,10}$/.test(x);
const wrap = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const publicUser = u => ({ id: u.id, email: u.email, name: u.full_name, phone: u.phone, addr: u.address, year: u.birth_year ?? '', gender: u.gender, need: u.need, role: u.role, status: u.account_status });
const tokenFor = u => jwt.sign({ sub: u.id, role: u.role }, secret, { expiresIn: '8h' });

const auth = wrap(async (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Vui lòng đăng nhập.' });
  try {
    const payload = jwt.verify(token, secret);
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [payload.sub]);
    if (!rows[0] || rows[0].account_status !== 'ACTIVE') return res.status(401).json({ error: 'Tài khoản không còn hoạt động.' });
    req.user = rows[0]; next();
  } catch (_) { res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' }); }
});
const admin = (req, res, next) => req.user.role === 'ADMIN' ? next() : res.status(403).json({ error: 'Chức năng chỉ dành cho quản lý.' });

async function seed() {
  for (const name of products) await db.execute('INSERT IGNORE INTO products (id, name, category) VALUES (?, ?, ?)', [uid(), name, name.startsWith('PC') ? 'PC' : 'Laptop']);
  const [admins] = await db.query("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");
  if (!admins.length) await db.execute('INSERT INTO users (id,email,password_hash,role,full_name,phone) VALUES (?,?,?,?,?,?)', [uid(), 'admin@backline.vn', await bcrypt.hash('Admin@123', 12), 'ADMIN', 'Quản lý Backline', '0900000000']);
  const [demo] = await db.query("SELECT id FROM users WHERE email = 'khach@demo.vn' LIMIT 1");
  if (!demo.length) await db.execute('INSERT INTO users (id,email,password_hash,full_name,phone,address,birth_year,gender,need) VALUES (?,?,?,?,?,?,?,?,?)', [uid(), 'khach@demo.vn', await bcrypt.hash('123456', 12), 'Nguyễn Minh Anh', '0901234567', '12 Lê Lợi, Quận 1, TP.HCM', 1998, 'Nữ', 'Gaming']);
  const [s] = await db.query("SELECT id FROM surveys WHERE id = 's1'");
  if (!s.length) {
    const [owner] = await db.query("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");
    for (const [id, title, description, due] of [['s1','Mức độ hài lòng về dịch vụ','Giúp chúng tôi cải thiện chất lượng tư vấn và chăm sóc khách hàng.','2026-10-31'],['s2','Nhu cầu mua sắm PC và laptop','Cho chúng tôi biết dự định của bạn để gợi ý sản phẩm và ưu đãi phù hợp.','2026-10-25'],['s3','Trải nghiệm bảo hành và hỗ trợ','Đánh giá về quá trình bảo hành, sửa chữa tại cửa hàng.','2026-09-30']]) await db.execute("INSERT INTO surveys (id,title,description,due_date,status,created_by) VALUES (?,?,?,?, 'OPEN',?)", [id,title,description,due,owner[0].id]);
  }
}

app.get('/api/health', wrap(async (_req, res) => { await db.query('SELECT 1'); res.json({ ok: true }); }));
app.post('/api/auth/register', wrap(async (req, res) => {
  const name = String(req.body.name || '').trim(), email = String(req.body.email || '').trim().toLowerCase(), phone = String(req.body.phone || '').trim(), password = String(req.body.password || '');
  if (!name) return res.status(400).json({ error: 'Vui lòng nhập họ và tên.' });
  if (!emailOk(email)) return res.status(400).json({ error: 'Email chưa đúng định dạng.' });
  if (!phoneOk(phone)) return res.status(400).json({ error: 'Số điện thoại cần 10-11 chữ số và bắt đầu bằng 0.' });
  if (password.length < 6) return res.status(400).json({ error: 'Mật khẩu cần ít nhất 6 ký tự.' });
  const id = uid();
  try { await db.execute('INSERT INTO users (id,email,password_hash,full_name,phone) VALUES (?,?,?,?,?)', [id, email, await bcrypt.hash(password, 12), name, phone]); }
  catch (e) { if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email hoặc số điện thoại đã được đăng ký.' }); throw e; }
  const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
  res.status(201).json({ token: tokenFor(rows[0]), user: publicUser(rows[0]) });
}));
app.post('/api/auth/login', wrap(async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [String(req.body.email || '').trim().toLowerCase()]); const user = rows[0];
  if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.password_hash))) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
  if (user.account_status !== 'ACTIVE') return res.status(403).json({ error: 'Tài khoản đã bị khóa.' });
  res.json({ token: tokenFor(user), user: publicUser(user) });
}));
app.get('/api/me', auth, (req,res) => res.json({ user: publicUser(req.user) }));
app.put('/api/me', auth, wrap(async (req, res) => {
  const name = String(req.body.name || '').trim(), phone = String(req.body.phone || '').trim(), year = req.body.year === '' || req.body.year == null ? null : Number(req.body.year), gender = ['', 'Nam', 'Nữ', 'Khác'].includes(req.body.gender) ? req.body.gender : '', need = needs.includes(req.body.need) ? req.body.need : 'Chưa xác định';
  if (!name) return res.status(400).json({ error: 'Họ và tên không được để trống.' }); if (!phoneOk(phone)) return res.status(400).json({ error: 'Số điện thoại cần 10-11 chữ số và bắt đầu bằng 0.' }); if (year !== null && (!Number.isInteger(year) || year < 1940 || year > 2012)) return res.status(400).json({ error: 'Năm sinh cần nằm trong khoảng 1940 - 2012.' });
  try { await db.execute('UPDATE users SET full_name=?,phone=?,address=?,birth_year=?,gender=?,need=? WHERE id=?', [name,phone,String(req.body.addr||'').trim(),year,gender,need,req.user.id]); } catch (e) { if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Số điện thoại này đã được dùng cho tài khoản khác.' }); throw e; }
  const [rows] = await db.execute('SELECT * FROM users WHERE id=?', [req.user.id]); res.json({ user: publicUser(rows[0]) });
}));
app.get('/api/feedback', auth, wrap(async (req,res) => { const [rows] = await db.execute('SELECT f.*,p.name product_name FROM feedback f JOIN products p ON p.id=f.product_id WHERE f.customer_id=? ORDER BY f.created_at DESC',[req.user.id]); res.json({ feedback: rows.map(f => ({ id:f.id,prod:f.product_name,type:f.feedback_type,rate:f.rating,title:f.title,body:f.body,date:dateVN(f.created_at),reply:f.reply_content||'' })) }); }));
app.post('/api/feedback', auth, wrap(async (req,res) => {
  const { prod, type, rate } = req.body, title = String(req.body.title||'').trim().slice(0,80), body = String(req.body.body||'').trim();
  if (!products.includes(prod)) return res.status(400).json({ error: 'Vui lòng chọn sản phẩm hợp lệ.' }); if (!feedbackTypes.includes(type)) return res.status(400).json({ error: 'Loại phản hồi không hợp lệ.' }); if (!Number.isInteger(rate) || rate < 1 || rate > 5) return res.status(400).json({ error: 'Vui lòng chọn số sao đánh giá.' }); if (body.length < 10) return res.status(400).json({ error: 'Nội dung phản hồi cần ít nhất 10 ký tự.' });
  const [[product]] = await db.execute('SELECT id FROM products WHERE name=?',[prod]); const id = uid(); await db.execute('INSERT INTO feedback (id,customer_id,product_id,feedback_type,rating,title,body) VALUES (?,?,?,?,?,?,?)',[id,req.user.id,product.id,type,rate,title,body]); res.status(201).json({ feedback:{id,prod,type,rate,title,body,date:dateVN(new Date()),reply:''} });
}));
app.get('/api/survey-status', auth, wrap(async (req,res) => { const [rows] = await db.execute('SELECT survey_id,submitted_at FROM survey_responses WHERE customer_id=?',[req.user.id]); res.json({ completed:Object.fromEntries(rows.map(x=>[x.survey_id,dateVN(x.submitted_at)])) }); }));
app.post('/api/surveys/:id/responses', auth, wrap(async (req,res) => { const [[survey]] = await db.execute("SELECT id FROM surveys WHERE id=? AND status='OPEN'",[req.params.id]); if (!survey) return res.status(404).json({ error:'Không tìm thấy khảo sát đang mở.' }); try { await db.execute('INSERT INTO survey_responses (id,survey_id,customer_id) VALUES (?,?,?)',[uid(),req.params.id,req.user.id]); } catch(e) { if(e.code==='ER_DUP_ENTRY') return res.status(409).json({ error:'Khảo sát này đã được hoàn thành.' }); throw e; } res.status(201).json({ completedAt:dateVN(new Date()) }); }));
app.get('/api/admin/dashboard', auth, admin, wrap(async (_req,res) => { const [[customers]] = await db.query("SELECT COUNT(*) total FROM users WHERE role='CUSTOMER'"), [[feedback]] = await db.query("SELECT COUNT(*) total FROM feedback WHERE status!='RESOLVED'"), [[surveys]] = await db.query("SELECT COUNT(*) total FROM surveys WHERE status='OPEN'"); res.json({customers:customers.total,openFeedback:feedback.total,openSurveys:surveys.total}); }));
app.get('/api/admin/customers', auth, admin, wrap(async (req,res) => { const q=`%${String(req.query.q||'').trim()}%`; const [rows]=await db.execute("SELECT * FROM users WHERE role='CUSTOMER' AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?) ORDER BY created_at DESC",[q,q,q]); res.json({customers:rows.map(publicUser)}); }));
app.patch('/api/admin/customers/:id/status', auth, admin, wrap(async (req,res) => { if(!['ACTIVE','LOCKED'].includes(req.body.status)) return res.status(400).json({error:'Trạng thái không hợp lệ.'}); const [r]=await db.execute("UPDATE users SET account_status=? WHERE id=? AND role='CUSTOMER'",[req.body.status,req.params.id]); if(!r.affectedRows)return res.status(404).json({error:'Không tìm thấy khách hàng.'}); res.json({message:'Đã cập nhật trạng thái tài khoản.'}); }));
app.get('/api/admin/feedback', auth, admin, wrap(async (_req,res) => { const [rows] = await db.query('SELECT f.*, p.name product_name, u.full_name customer_name, u.email customer_email FROM feedback f JOIN products p ON p.id=f.product_id JOIN users u ON u.id=f.customer_id ORDER BY f.created_at DESC'); res.json({feedback:rows}); }));
app.patch('/api/admin/feedback/:id', auth, admin, wrap(async (req,res) => { const status=req.body.status, reply=String(req.body.reply||'').trim(); if(!['NEW','IN_PROGRESS','RESOLVED'].includes(status)) return res.status(400).json({error:'Trạng thái không hợp lệ.'}); const [r]=await db.execute('UPDATE feedback SET status=?, reply_content=?, replied_by=?, replied_at=CASE WHEN ? = \'\' THEN NULL ELSE NOW() END WHERE id=?',[status,reply||null,reply?req.user.id:null,reply,req.params.id]); if(!r.affectedRows)return res.status(404).json({error:'Không tìm thấy phản hồi.'}); res.json({message:'Đã cập nhật phản hồi.'}); }));
app.use('/api', (_req,res) => res.status(404).json({error:'Không tìm thấy API.'}));
app.use((err,_req,res,_next) => { console.error(err); res.status(500).json({error:'Lỗi máy chủ. Hãy kiểm tra MySQL và .env.'}); });
async function start(){ await db.query('SELECT 1'); await seed(); app.listen(PORT,()=>console.log(`CRM đang chạy tại http://localhost:${PORT}`)); }
start().catch(e=>{console.error(`Không thể khởi động: ${e.message}`);process.exit(1);});
