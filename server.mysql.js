require('dotenv').config({
  path: process.env.CRM_ENV_FILE || require('node:path').join(__dirname, '.env')
});
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const BirthDate = require('./birth-date');
const PasswordRecovery = require('./password-recovery');
const RecoveryCodes = require('./recovery-codes');
const SurveyVisibility = require('./survey-visibility');
const CustomerSession = require('./customer-session');
const Domain = require('./crm-domain');
const V = require('./crm-validation');
const Interests = require('./customer-interests');
const Surveys = require('./survey-service');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const secret = process.env.JWT_SECRET;
const products = require('./database/catalog');
const feedbackTypes = ['Góp ý', 'Khen ngợi', 'Báo lỗi / Khiếu nại', 'Câu hỏi'];
const needs = Domain.needs;
if (!secret) throw new Error('JWT_SECRET chưa được cấu hình trong .env');

const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'backline_crm',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});
app.use(express.json({ limit: '1mb' }));
app.use(require('./public-assets'), express.static(__dirname, { dotfiles: 'deny' }));

const uid = () => crypto.randomUUID();
const dateVN = (value) => new Intl.DateTimeFormat('vi-VN').format(new Date(value));
const emailOk = (x) => /^\S+@\S+\.\S+$/.test(x);
const phoneOk = (x) => /^0\d{9,10}$/.test(x);
const wrap = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.full_name,
  phone: u.phone,
  addr: u.address,
  year: u.birth_year ?? '',
  birthDate: BirthDate.fromDatabase(u.birth_date),
  gender: u.gender,
  need: u.need,
  interests: u.interests || [],
  role: u.role,
  status: u.account_status
});
const tokenFor = (u, expiresIn = '8h') =>
  jwt.sign({ sub: u.id, role: u.role, ver: Number(u.auth_version || 0) }, secret, { expiresIn });

// LOGIC: Mỗi API được bảo vệ đều kiểm tra chữ ký token, trạng thái ACTIVE và auth_version trong DB.
// Token cũ mất hiệu lực sau đổi mật khẩu; không tin vai trò do giao diện tự gửi lên.
const auth = wrap(async (req, res, next) => {
  const token =
    (req.headers.authorization || '').replace(/^Bearer\s+/i, '') ||
    CustomerSession.cookieToken(req);
  if (!token) return res.status(401).json({ error: 'Vui lòng đăng nhập.' });
  try {
    const payload = jwt.verify(token, secret);
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [payload.sub]);
    if (!rows[0] || rows[0].account_status !== 'ACTIVE')
      return res.status(401).json({ error: 'Tài khoản không còn hoạt động.' });
    if (!req.headers.authorization && rows[0].role !== 'CUSTOMER')
      return res.status(401).json({
        error: 'Vai trò tài khoản đã thay đổi. Vui lòng đăng nhập lại tại trang phù hợp.'
      });
    if (Number(payload.ver || 0) !== Number(rows[0].auth_version || 0))
      return res.status(401).json({ error: 'Mật khẩu đã thay đổi. Vui lòng đăng nhập lại.' });
    await Interests.attach(db, rows);
    req.user = rows[0];
    next();
  } catch (_) {
    res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
  }
});
// LOGIC PHÂN QUYỀN: Tên admin là tên cũ. Với nhóm customers/feedback/reports/surveys,
// middleware admin chỉ cho MANAGER; các nhóm còn lại chỉ cho ADMIN. staff cũng chỉ cho MANAGER.
// Vì vậy tiền tố /api/admin KHÔNG có nghĩa mọi API dưới đó đều dành cho Admin.
const managerOperationRoute = (path) =>
  path.startsWith('/api/admin/customers') ||
  path.startsWith('/api/admin/feedback') ||
  path.startsWith('/api/admin/reports/') ||
  path.startsWith('/api/admin/surveys');
const admin = (req, res, next) =>
  (req.user.role === 'ADMIN' && !managerOperationRoute(req.path)) ||
  (req.user.role === 'MANAGER' && managerOperationRoute(req.path))
    ? next()
    : res.status(403).json({
        error: managerOperationRoute(req.path)
          ? 'Chức năng chỉ dành cho Quản lý.'
          : 'Chức năng chỉ dành cho Admin.'
      });
const staff = (req, res, next) =>
  req.user.role === 'MANAGER'
    ? next()
    : res.status(403).json({ error: 'Chức năng chỉ dành cho Quản lý.' });

// LOGIC KHỞI ĐỘNG: seed có ghi DB: bổ sung sản phẩm, Admin và khách demo nếu chưa tồn tại.
// Không phải thao tác render; không dùng hàm này để xóa hoặc đặt lại dữ liệu người dùng.
async function seed() {
  for (const name of products)
    await db.execute('INSERT IGNORE INTO products (id, name, category) VALUES (?, ?, ?)', [
      uid(),
      name,
      name.startsWith('PC') ? 'PC' : 'Laptop'
    ]);
  const [admins] = await db.query("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");
  if (!admins.length)
    await db.execute(
      'INSERT INTO users (id,email,password_hash,role,full_name,phone) VALUES (?,?,?,?,?,?)',
      [
        uid(),
        'admin@backline.vn',
        await bcrypt.hash('Admin@123', 12),
        'ADMIN',
        'Quản lý Backline',
        '0900000000'
      ]
    );
  const [demo] = await db.query("SELECT id FROM users WHERE email = 'khach@demo.vn' LIMIT 1");
  if (!demo.length)
    await db.execute(
      'INSERT INTO users (id,email,password_hash,full_name,phone,address,birth_year,gender,need) VALUES (?,?,?,?,?,?,?,?,?)',
      [
        uid(),
        'khach@demo.vn',
        await bcrypt.hash('123456', 12),
        'Nguyễn Minh Anh',
        '0901234567',
        '12 Lê Lợi, Quận 1, TP.HCM',
        1998,
        'Nữ',
        'Gaming'
      ]
    );
}

app.get(
  '/api/health',
  wrap(async (_req, res) => {
    await db.query('SELECT 1');
    res.json({ ok: true });
  })
);
// LOGIC ĐĂNG KÝ: Kiểm tra dữ liệu -> băm mật khẩu bcrypt -> transaction tạo user + mã khôi phục.
// Chỉ commit khi cả hai thành công; trả thông tin an toàn và mã gốc một lần, không trả password_hash.
app.post(
  '/api/auth/register',
  wrap(async (req, res) => {
    const name = String(req.body.name || '').trim(),
      email = String(req.body.email || '')
        .trim()
        .toLowerCase(),
      phone = String(req.body.phone || '').trim(),
      password = String(req.body.password || ''),
      birthDate = String(req.body.birthDate || '').trim(),
      gender = ['Nam', 'Nữ', 'Khác'].includes(req.body.gender) ? req.body.gender : '';
    if (!name) return res.status(400).json({ error: 'Vui lòng nhập họ và tên.' });
    if (!emailOk(email)) return res.status(400).json({ error: 'Email chưa đúng định dạng.' });
    if (!phoneOk(phone))
      return res.status(400).json({ error: 'Số điện thoại cần 10-11 chữ số và bắt đầu bằng 0.' });
    if (!BirthDate.validISO(birthDate))
      return res.status(400).json({
        error: 'Ngày sinh không hợp lệ hoặc nằm trong tương lai. Vui lòng nhập theo dd/mm/yyyy.'
      });
    if (!gender) return res.status(400).json({ error: 'Vui lòng chọn giới tính.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Mật khẩu cần ít nhất 6 ký tự.' });
    const id = uid(),
      connection = await db.getConnection();
    let user, recoveryCode;
    try {
      await connection.beginTransaction();
      await connection.execute(
        'INSERT INTO users (id,email,password_hash,full_name,phone,birth_year,birth_date,gender) VALUES (?,?,?,?,?,?,?,?)',
        [
          id,
          email,
          await bcrypt.hash(password, 12),
          name,
          phone,
          Number(birthDate.slice(0, 4)),
          birthDate,
          gender
        ]
      );
      recoveryCode = await RecoveryCodes.issue(connection, id);
      const [rows] = await connection.execute('SELECT * FROM users WHERE id=?', [id]);
      user = rows[0];
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      if (error.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ error: 'Email hoặc số điện thoại đã được đăng ký.' });
      throw error;
    } finally {
      connection.release();
    }
    const token = CustomerSession.issue(req, res, user, tokenFor);
    res.status(201).json({ token, user: publicUser(user), recoveryCode });
  })
);
// LOGIC ĐĂNG NHẬP: Chỉ đọc user và so sánh hash, kiểm tra đúng cổng/vai trò rồi cấp phiên đăng nhập.
// Đăng nhập không cập nhật hồ sơ; cookie khách hàng được xử lý trong customer-session.js.
app.post(
  '/api/auth/login',
  wrap(async (req, res) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [
      String(req.body.email || '')
        .trim()
        .toLowerCase()
    ]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.password_hash)))
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' });
    if (user.account_status !== 'ACTIVE')
      return res.status(403).json({ error: 'Tài khoản đã bị khóa.' });
    if (req.body.customerSession === true && user.role !== 'CUSTOMER')
      return res
        .status(403)
        .json({ error: 'Vui lòng dùng trang đăng nhập Admin hoặc Quản lý cho tài khoản này.' });
    // Kiểm tra cổng phía máy chủ trước khi cấp token; Admin là cổng vào có chuyển hướng cho Quản lý.
    if (req.body.staffPortal != null) {
      if (!['ADMIN', 'MANAGER'].includes(req.body.staffPortal))
        return res.status(400).json({ error: 'Cổng đăng nhập không hợp lệ.' });
      if (req.body.staffPortal === 'MANAGER' && user.role !== 'MANAGER')
        return res.status(403).json({
          error:
            'Trang này chỉ cho phép Quản lý đăng nhập. Vui lòng dùng trang đăng nhập đúng vai trò.'
        });
      if (req.body.staffPortal === 'ADMIN' && !['ADMIN', 'MANAGER'].includes(user.role))
        return res
          .status(403)
          .json({ error: 'Khách hàng vui lòng đăng nhập tại trang khách hàng.' });
    }
    await Interests.attach(db, [user]);
    const token = CustomerSession.issue(req, res, user, tokenFor);
    res.json({ token, user: publicUser(user) });
  })
);
app.post('/api/auth/logout', (req, res) => {
  CustomerSession.clear(req, res);
  res.json({ message: 'Đã đăng xuất.' });
});
app.get('/api/me', auth, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ user: publicUser(req.user) });
});
// LOGIC LƯU HỒ SƠ: UPDATE đúng req.user.id (người đã xác thực), không lấy ID khách từ form.
// Sau ghi DB, SELECT lại dữ liệu rồi trả về để giao diện thay me bằng kết quả đã lưu thật.
// API xác thực hồ sơ đầy đủ và ghi sở thích trong cùng transaction.
app.put(
  '/api/me',
  auth,
  wrap(async (req, res) => {
    const value = V.profile({
      ...req.body,
      birthDate:
        req.body.birthDate === undefined
          ? BirthDate.fromDatabase(req.user.birth_date)
          : req.body.birthDate
    });
    await Surveys.transaction(db, async (c) => {
      await c.execute(
        'UPDATE users SET full_name=?,phone=?,address=?,birth_year=?,birth_date=?,gender=?,need=? WHERE id=?',
        [
          value.name,
          value.phone,
          value.addr,
          value.year,
          value.birthDate,
          value.gender,
          value.need,
          req.user.id
        ]
      );
      await Interests.save(c, req.user.id, value.interests);
    });
    const [users] = await db.execute('SELECT * FROM users WHERE id=?', [req.user.id]);
    await Interests.attach(db, users);
    res.json({ user: publicUser(users[0]) });
  })
);
app.get(
  '/api/admin/accounts',
  auth,
  admin,
  wrap(async (_req, res) => {
    const [rows] = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json({ accounts: rows.map(publicUser) });
  })
);
// LOGIC TÀI KHOẢN: Admin tạo MANAGER/CUSTOMER; mật khẩu chỉ lưu dạng hash. Email/phone trùng -> 409.
app.post(
  '/api/admin/accounts',
  auth,
  admin,
  wrap(async (req, res) => {
    const name = String(req.body.name || '').trim(),
      email = String(req.body.email || '')
        .trim()
        .toLowerCase(),
      phone = String(req.body.phone || '').trim(),
      password = String(req.body.password || ''),
      role = ['MANAGER', 'CUSTOMER'].includes(req.body.role) ? req.body.role : 'CUSTOMER';
    if (!name || !emailOk(email) || !phoneOk(phone) || password.length < 6)
      return res.status(400).json({
        error: 'Vui lòng nhập họ tên, email, số điện thoại hợp lệ và mật khẩu từ 6 ký tự.'
      });
    try {
      await db.execute(
        'INSERT INTO users (id,email,password_hash,role,full_name,phone) VALUES (?,?,?,?,?,?)',
        [uid(), email, await bcrypt.hash(password, 12), role, name, phone]
      );
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ error: 'Email hoặc số điện thoại đã tồn tại.' });
      throw e;
    }
    res.status(201).json({ message: 'Đã tạo tài khoản.' });
  })
);
// LOGIC: Không đổi vai trò tài khoản đã có; API cố ý trả 405. Vai trò chỉ chọn khi tạo mới.
app.patch('/api/admin/accounts/:id/role', auth, admin, (_req, res) =>
  res.status(405).json({
    error: 'Không hỗ trợ đổi vai trò tài khoản hiện có. Vai trò chỉ được chọn khi thêm tài khoản.'
  })
);
// LOGIC XÓA THẬT: Chặn tự xóa, xóa Admin cuối cùng, khách có lịch sử và người đã tạo/xử lý dữ liệu.
// Nếu được phép mới DELETE users; khác hoàn toàn với khóa tài khoản hoặc ẩn dữ liệu.
app.delete(
  '/api/admin/accounts/:id',
  auth,
  admin,
  wrap(async (req, res) => {
    if (req.params.id === req.user.id)
      return res.status(400).json({ error: 'Không thể xóa chính tài khoản đang đăng nhập.' });
    const [[target]] = await db.execute('SELECT role FROM users WHERE id=?', [req.params.id]);
    if (!target) return res.status(404).json({ error: 'Không tìm thấy tài khoản.' });
    if (target.role === 'ADMIN') {
      const [[count]] = await db.query("SELECT COUNT(*) total FROM users WHERE role='ADMIN'");
      if (count.total <= 1)
        return res.status(409).json({ error: 'Hệ thống cần còn ít nhất một Admin.' });
    }
    if (target.role === 'CUSTOMER') {
      const [[usage]] = await db.execute(
        'SELECT (SELECT COUNT(*) FROM feedback WHERE customer_id=?) + (SELECT COUNT(*) FROM survey_responses WHERE customer_id=?) total',
        [req.params.id, req.params.id]
      );
      if (usage.total)
        return res.status(409).json({
          error:
            'Không thể xóa khách hàng đã có phản hồi hoặc trả lời khảo sát; hãy khóa tài khoản.'
        });
    }
    const [[owned]] = await db.execute(
      'SELECT (SELECT COUNT(*) FROM surveys WHERE created_by=?) + (SELECT COUNT(*) FROM feedback WHERE replied_by=?) total',
      [req.params.id, req.params.id]
    );
    if (owned.total)
      return res
        .status(409)
        .json({ error: 'Không thể xóa tài khoản đã tạo khảo sát hoặc xử lý phản hồi.' });
    const [r] = await db.execute('DELETE FROM users WHERE id=?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Không tìm thấy tài khoản.' });
    res.json({ message: 'Đã xóa tài khoản.' });
  })
);
// LOGIC: Quản lý tạo mới CUSTOMER, không sửa hồ sơ khách hiện có; password vẫn băm bcrypt.
app.post(
  '/api/admin/customers',
  auth,
  staff,
  wrap(async (req, res) => {
    const value = V.profile(req.body, { complete: false }),
      email = String(req.body.email || '')
        .trim()
        .toLowerCase(),
      password = String(req.body.password || '');
    if (!emailOk(email) || password.length < 6) V.fail('Cần email hợp lệ và mật khẩu từ 6 ký tự.');
    const id = uid(),
      hash = await bcrypt.hash(password, 12);
    await Surveys.transaction(db, async (c) => {
      await c.execute(
        "INSERT INTO users(id,email,password_hash,role,full_name,phone,address,birth_year,birth_date,gender,need) VALUES (?,?,?,'CUSTOMER',?,?,?,?,?,?,?)",
        [
          id,
          email,
          hash,
          value.name,
          value.phone,
          value.addr,
          value.year,
          value.birthDate || null,
          value.gender,
          value.need
        ]
      );
      await Interests.save(c, id, value.interests);
    });
    res.status(201).json({
      id,
      message: 'Đã tạo khách hàng. Khách cần hoàn thiện hồ sơ trước khi sử dụng đầy đủ.'
    });
  })
);
app.get(
  '/api/feedback',
  auth,
  wrap(async (req, res) => {
    const [rows] = await db.execute(
      'SELECT f.*,p.name product_name FROM feedback f JOIN products p ON p.id=f.product_id WHERE f.customer_id=? ORDER BY f.created_at DESC',
      [req.user.id]
    );
    res.json({
      feedback: rows.map((f) => ({
        id: f.id,
        prod: f.product_name,
        type: f.feedback_type,
        rate: f.rating,
        title: f.title,
        body: f.body,
        date: dateVN(f.created_at),
        reply: f.reply_content || ''
      }))
    });
  })
);
// LOGIC GỬI PHẢN HỒI: Kiểm tra sản phẩm/loại/sao/nội dung trim >= 1 -> INSERT feedback.
// customer_id lấy từ phiên đăng nhập; trạng thái NEW và ngày tiếp nhận do mặc định bảng tạo.
app.post(
  '/api/feedback',
  auth,
  wrap(async (req, res) => {
    const { prod, type, rate } = req.body,
      title = String(req.body.title || '')
        .trim()
        .slice(0, 80),
      body = String(req.body.body || '').trim();
    if (!products.includes(prod))
      return res.status(400).json({ error: 'Vui lòng chọn sản phẩm hợp lệ.' });
    if (!feedbackTypes.includes(type))
      return res.status(400).json({ error: 'Loại phản hồi không hợp lệ.' });
    if (!Number.isInteger(rate) || rate < 1 || rate > 5)
      return res.status(400).json({ error: 'Vui lòng chọn số sao đánh giá.' });
    if (body.length < 1)
      return res
        .status(400)
        .json({ error: 'Nội dung phản hồi cần ít nhất 1 ký tự không phải khoảng trắng.' });
    const [[product]] = await db.execute('SELECT id FROM products WHERE name=?', [prod]);
    const id = uid();
    await db.execute(
      'INSERT INTO feedback (id,customer_id,product_id,feedback_type,rating,title,body) VALUES (?,?,?,?,?,?,?)',
      [id, req.user.id, product.id, type, rate, title, body]
    );
    res.status(201).json({
      feedback: { id, prod, type, rate, title, body, date: dateVN(new Date()), reply: '' }
    });
  })
);
app.get(
  '/api/surveys',
  auth,
  wrap(async (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (req.user.role !== 'CUSTOMER') V.fail('Chỉ dành cho khách hàng.', 403);
    const [list] = await db.execute(
      "SELECT s.id,s.title,s.description,s.due_date,s.status FROM surveys s WHERE (s.status='OPEN' AND EXISTS (SELECT 1 FROM survey_recipients r WHERE r.survey_id=s.id AND r.customer_id=?)) OR EXISTS (SELECT 1 FROM survey_responses a WHERE a.survey_id=s.id AND a.customer_id=?) ORDER BY s.created_at DESC",
      [req.user.id, req.user.id]
    );
    const surveys = [];
    for (const s of list) {
      const [questions] = await db.execute(
        'SELECT id,question_text,question_type,is_required,display_order FROM survey_questions WHERE survey_id=? ORDER BY display_order',
        [s.id]
      );
      const qs = [];
      for (const q of questions) {
        const [options] = await db.execute(
          'SELECT option_text FROM question_options WHERE question_id=? ORDER BY display_order',
          [q.id]
        );
        qs.push({
          t: { ONE: 'one', MULTI: 'multi', TEXT: 'text', RATING: 'rate' }[q.question_type],
          q: q.question_text,
          req: q.is_required ? 1 : 0,
          o: options.map((x) => x.option_text)
        });
      }
      if (qs.length)
        surveys.push({
          id: s.id,
          title: s.title,
          status: s.status,
          desc: s.description,
          due: s.due_date ? dateVN(s.due_date) : 'Không đặt hạn',
          dueDate: s.due_date ? new Date(s.due_date).toISOString().slice(0, 10) : null,
          isExpired: Boolean(
            s.due_date &&
            new Date(`${new Date(s.due_date).toISOString().slice(0, 10)}T23:59:59`) < new Date()
          ),
          min: Math.max(1, Math.ceil(qs.length / 3)),
          qs
        });
    }
    res.json({ surveys });
  })
);
app.get(
  '/api/survey-status',
  auth,
  wrap(async (req, res) => {
    const [rows] = await db.execute(
      'SELECT survey_id,submitted_at FROM survey_responses WHERE customer_id=?',
      [req.user.id]
    );
    res.json({
      completed: Object.fromEntries(rows.map((x) => [x.survey_id, dateVN(x.submitted_at)]))
    });
  })
);
// LOGIC TRẢ LỜI KHẢO SÁT: Phải OPEN và chưa quá hạn -> transaction tạo lượt gửi + các chi tiết.
// answers.q0 khớp display_order=1; ONE/MULTI tìm option thuộc đúng câu hỏi; TEXT lưu nội dung; RATING lưu sao.
// UNIQUE(survey_id,customer_id) chặn gửi lần hai. Lỗi -> rollback, luôn release connection.
// Kiểm tra toàn bộ câu trả lời trước khi ghi; khóa cùng hàng khảo sát với thao tác đóng/sửa.
app.post(
  '/api/surveys/:id/responses',
  auth,
  wrap(async (req, res) => {
    if (req.user.role !== 'CUSTOMER') V.fail('Chỉ khách hàng được trả lời khảo sát.', 403);
    await Surveys.submit(db, req.params.id, req.user.id, req.body);
    res.status(201).json({ completedAt: dateVN(new Date()) });
  })
);
app.get(
  '/api/admin/dashboard',
  auth,
  staff,
  wrap(async (_req, res) => {
    const [[customers]] = await db.query("SELECT COUNT(*) total FROM users WHERE role='CUSTOMER'"),
      [[feedback]] = await db.query("SELECT COUNT(*) total FROM feedback WHERE status!='RESOLVED'"),
      [[surveys]] = await db.query("SELECT COUNT(*) total FROM surveys WHERE status='OPEN'");
    res.json({
      customers: customers.total,
      openFeedback: feedback.total,
      openSurveys: surveys.total
    });
  })
);
app.get(
  '/api/admin/customers',
  auth,
  staff,
  wrap(async (req, res) => {
    const q = `%${String(req.query.q || '').trim()}%`,
      need = String(req.query.need || ''),
      status = String(req.query.status || '');
    let sql =
        "SELECT * FROM users WHERE role='CUSTOMER' AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)",
      values = [q, q, q];
    if (needs.includes(need)) {
      sql += ' AND need=?';
      values.push(need);
    }
    if (['ACTIVE', 'LOCKED'].includes(status)) {
      sql += ' AND account_status=?';
      values.push(status);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await db.execute(sql, values);
    await Interests.attach(db, rows);
    const filters = V.filters(req.query),
      date = await Surveys.today(db);
    res.json({ customers: rows.filter((u) => Domain.matches(u, filters, date)).map(publicUser) });
  })
);
app.get(
  '/api/admin/customers/:id',
  auth,
  staff,
  wrap(async (req, res) => {
    const [[user]] = await db.execute("SELECT * FROM users WHERE id=? AND role='CUSTOMER'", [
      req.params.id
    ]);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy khách hàng.' });
    await Interests.attach(db, [user]);
    res.set('Cache-Control', 'no-store');
    res.json({
      customer: { ...publicUser(user), createdAt: user.created_at, updatedAt: user.updated_at }
    });
  })
);
// LOGIC: Chỉ xóa thật CUSTOMER chưa có feedback/survey_responses; có lịch sử thì yêu cầu khóa thay vì xóa.
app.delete(
  '/api/admin/customers/:id',
  auth,
  admin,
  wrap(async (req, res) => {
    const [[usage]] = await db.execute(
      'SELECT (SELECT COUNT(*) FROM feedback WHERE customer_id=?) + (SELECT COUNT(*) FROM survey_responses WHERE customer_id=?) total',
      [req.params.id, req.params.id]
    );
    if (usage.total)
      return res.status(409).json({
        error: 'Không thể xóa khách hàng đã có phản hồi hoặc trả lời khảo sát; hãy khóa tài khoản.'
      });
    const [r] = await db.execute("DELETE FROM users WHERE id=? AND role='CUSTOMER'", [
      req.params.id
    ]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Không tìm thấy khách hàng.' });
    res.json({ message: 'Đã xóa khách hàng.' });
  })
);
// LOGIC KHÓA/MỞ: Chỉ UPDATE account_status ACTIVE/LOCKED, giữ toàn bộ dữ liệu và lịch sử.
// auth kiểm tra DB ở mỗi request nên tài khoản LOCKED không gọi tiếp được API được bảo vệ.
app.patch(
  '/api/admin/customers/:id/status',
  auth,
  admin,
  wrap(async (req, res) => {
    if (!['ACTIVE', 'LOCKED'].includes(req.body.status))
      return res.status(400).json({ error: 'Trạng thái không hợp lệ.' });
    const [r] = await db.execute(
      "UPDATE users SET account_status=? WHERE id=? AND role='CUSTOMER'",
      [req.body.status, req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Không tìm thấy khách hàng.' });
    res.json({ message: 'Đã cập nhật trạng thái tài khoản.' });
  })
);
app.get(
  '/api/admin/feedback',
  auth,
  staff,
  wrap(async (req, res) => {
    const status = String(req.query.status || ''),
      from = String(req.query.from || ''),
      to = String(req.query.to || ''),
      hidden = String(req.query.hidden || 'false') === 'true';
    let sql =
        'SELECT f.*, p.name product_name, u.full_name customer_name, u.email customer_email FROM feedback f JOIN products p ON p.id=f.product_id JOIN users u ON u.id=f.customer_id WHERE f.is_hidden=?',
      values = [hidden];
    if (['NEW', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      sql += ' AND f.status=?';
      values.push(status);
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(from)) {
      sql += ' AND DATE(COALESCE(f.replied_at,f.created_at))>=?';
      values.push(from);
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      sql += ' AND DATE(COALESCE(f.replied_at,f.created_at))<=?';
      values.push(to);
    }
    sql += ' ORDER BY f.created_at DESC';
    const [rows] = await db.execute(sql, values);
    res.json({ feedback: rows });
  })
);
// LOGIC XỬ LÝ: NEW(0) -> IN_PROGRESS(1) -> RESOLVED(2), cho phép đi tới/bằng, không lùi.
// RESOLVED phải có câu trả lời. Có reply thì lưu người xử lý và NOW(); đây là ngày trả lời gần nhất.
app.patch(
  '/api/admin/feedback/:id',
  auth,
  staff,
  wrap(async (req, res) => {
    const status = req.body.status,
      reply = String(req.body.reply || '').trim(),
      order = { NEW: 0, IN_PROGRESS: 1, RESOLVED: 2 };
    if (!Object.hasOwn(order, status))
      return res.status(400).json({ error: 'Trạng thái không hợp lệ.' });
    const [[current]] = await db.execute('SELECT status FROM feedback WHERE id=?', [req.params.id]);
    if (!current) return res.status(404).json({ error: 'Không tìm thấy phản hồi.' });
    if (order[status] < order[current.status])
      return res.status(400).json({ error: 'Không thể chuyển phản hồi về trạng thái cũ.' });
    if (status === 'RESOLVED' && !reply)
      return res.status(400).json({ error: 'Cần nhập phản hồi trước khi xác nhận đã xử lý xong.' });
    const [r] = await db.execute(
      "UPDATE feedback SET status=?, reply_content=?, replied_by=?, replied_at=CASE WHEN ? = '' THEN replied_at ELSE NOW() END WHERE id=?",
      [status, reply || null, reply ? req.user.id : null, reply, req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Không tìm thấy phản hồi.' });
    res.json({ message: 'Đã cập nhật phản hồi.' });
  })
);
// LOGIC ẨN PHẢN HỒI: Chỉ RESOLVED mới đổi is_hidden/hidden_at; không DELETE, báo cáo vẫn tính.
app.patch(
  '/api/admin/feedback/:id/visibility',
  auth,
  staff,
  wrap(async (req, res) => {
    const hidden = Boolean(req.body.hidden);
    const [r] = await db.execute(
      "UPDATE feedback SET is_hidden=?, hidden_at=CASE WHEN ? THEN NOW() ELSE NULL END WHERE id=? AND status='RESOLVED'",
      [hidden, hidden, req.params.id]
    );
    if (!r.affectedRows)
      return res
        .status(400)
        .json({ error: 'Chỉ có thể ẩn hoặc khôi phục phản hồi đã xử lý xong.' });
    res.json({ message: hidden ? 'Đã ẩn phản hồi.' : 'Đã khôi phục phản hồi.' });
  })
);
// LOGIC TẠO KHẢO SÁT: Transaction INSERT surveys -> survey_questions -> question_options.
// ONE/MULTI cần >= 2 lựa chọn; lỗi bất kỳ bước nào thì không để lại khảo sát dở dang.
app.post(
  '/api/admin/surveys',
  auth,
  staff,
  wrap(async (req, res) => {
    const id = await Surveys.create(db, req.user.id, req.body);
    res.status(201).json({ id, message: 'Đã tạo khảo sát.' });
  })
);
app.get(
  '/api/admin/surveys/:id',
  auth,
  admin,
  wrap(async (req, res) => {
    const [[survey]] = await db.execute(
      'SELECT s.*, (SELECT COUNT(*) FROM survey_responses r WHERE r.survey_id=s.id) response_count FROM surveys s WHERE s.id=?',
      [req.params.id]
    );
    if (!survey) return res.status(404).json({ error: 'Không tìm thấy khảo sát.' });
    const [questions] = await db.execute(
      'SELECT * FROM survey_questions WHERE survey_id=? ORDER BY display_order',
      [survey.id]
    );
    for (const q of questions) {
      const [options] = await db.execute(
        'SELECT option_text FROM question_options WHERE question_id=? ORDER BY display_order',
        [q.id]
      );
      q.options = options.map((x) => x.option_text);
    }
    res.json({ survey, questions });
  })
);
// LOGIC SỬA: CLOSED bất biến; OPEN có câu trả lời không về DRAFT; OPEN chưa ai trả lời chỉ đổi về DRAFT.
// Khi đã DRAFT: transaction cập nhật phiếu, xóa bộ câu hỏi cũ rồi tạo lại câu hỏi/lựa chọn mới.
// Đây là thay thế toàn bộ nội dung, không cập nhật riêng từng câu hỏi; chỉ chạy khi trạng thái cho phép.
app.patch(
  '/api/admin/surveys/:id',
  auth,
  staff,
  wrap(async (req, res) => {
    await Surveys.update(db, req.params.id, req.body);
    res.json({ message: 'Đã cập nhật khảo sát.' });
  })
);
app.get(
  '/api/admin/surveys/:id/responses',
  auth,
  admin,
  wrap(async (req, res) => {
    const [[survey]] = await db.execute('SELECT title,status FROM surveys WHERE id=?', [
      req.params.id
    ]);
    if (!survey) return res.status(404).json({ error: 'Không tìm thấy khảo sát.' });
    const [rows] = await db.execute(
      'SELECT r.id,r.submitted_at,u.full_name,u.email FROM survey_responses r JOIN users u ON u.id=r.customer_id WHERE r.survey_id=? ORDER BY r.submitted_at DESC',
      [req.params.id]
    );
    for (const row of rows) {
      const [details] = await db.execute(
        'SELECT q.question_text,q.question_type,d.text_answer,d.rating_value,o.option_text FROM response_details d JOIN survey_questions q ON q.id=d.question_id LEFT JOIN question_options o ON o.id=d.option_id WHERE d.response_id=? ORDER BY q.display_order',
        [row.id]
      );
      row.answers = details.map((d) => ({
        question: d.question_text,
        answer: d.rating_value ? `${d.rating_value} sao` : d.option_text || d.text_answer || ''
      }));
    }
    res.json({ survey, responses: rows });
  })
);
// LOGIC ĐÓNG NGAY: DRAFT/OPEN -> CLOSED bằng API riêng, không cần chờ đủ người trả lời.
// Không xóa kết quả; các lần gửi mới kiểm tra trạng thái OPEN sẽ bị từ chối.
app.post(
  '/api/admin/surveys/:id/close',
  auth,
  staff,
  wrap(async (req, res) => {
    await Surveys.close(db, req.params.id);
    res.json({ message: 'Đã đóng khảo sát.' });
  })
);
// LOGIC GỬI: Transaction chuyển OPEN + ghi survey_recipients cho CUSTOMER ACTIVE.
// INSERT IGNORE giữ snapshot cộng dồn; cả đọc và gửi câu trả lời đều kiểm tra recipients.
app.post(
  '/api/admin/surveys/:id/send',
  auth,
  staff,
  wrap(async (req, res) => {
    const selected = await Surveys.transaction(db, (c) =>
      Surveys.publish(c, req.params.id, req.body.audience)
    );
    res.json({
      selected,
      message: 'Đã ghi nhận danh sách người nhận; gửi lại chỉ bổ sung, không xóa người đã nhận.'
    });
  })
);
app.post(
  '/api/admin/surveys/recipients-preview',
  auth,
  staff,
  wrap(async (req, res) => {
    const users = await Surveys.recipients(db, req.body.audience);
    res.set('Cache-Control', 'no-store');
    res.json({
      count: users.length,
      customers: users.map((u) => ({ id: u.id, name: u.full_name, email: u.email }))
    });
  })
);
require('./customer-history').register(app, db, auth, staff, wrap);
require('./customer-survey-review').register(app, db, auth, wrap);
require('./reports-service').registerReports(app, db, auth, staff, wrap);
require('./survey-copy').register(app, db, auth, staff, wrap);
app.use(['/api/password-recovery', '/api/admin/password-recovery'], (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
PasswordRecovery.register(app, db, auth, admin, wrap);
RecoveryCodes.register(app, db, auth, wrap);
SurveyVisibility.register(app, db, auth, staff, wrap);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Không tìm thấy API.' }));
app.use((err, _req, res, _next) => {
  if (err instanceof V.InputError) return res.status(err.status).json({ error: err.message });
  if (err.code === 'ER_DUP_ENTRY')
    return res.status(409).json({ error: 'Dữ liệu đã tồn tại hoặc khảo sát đã được hoàn thành.' });
  console.error(err);
  res.status(500).json({ error: 'Lỗi máy chủ. Hãy kiểm tra MySQL và .env.' });
});
async function addColumnIfMissing(column, definition) {
  const [rows] = await db.execute(
    'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [process.env.DB_NAME || 'backline_crm', 'feedback', column]
  );
  if (!rows.length) await db.query(`ALTER TABLE feedback ADD COLUMN ${definition}`);
}
async function ensureBirthDateColumn() {
  const [rows] = await db.query(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND COLUMN_NAME='birth_date'"
  );
  if (!rows.length)
    await db.query('ALTER TABLE users ADD COLUMN birth_date DATE NULL AFTER birth_year');
}
async function start() {
  await db.query('SELECT 1');
  await db.query(
    "ALTER TABLE users MODIFY role ENUM('ADMIN','MANAGER','CUSTOMER') NOT NULL DEFAULT 'CUSTOMER'"
  );
  await addColumnIfMissing('is_hidden', 'is_hidden BOOLEAN NOT NULL DEFAULT FALSE');
  await addColumnIfMissing('hidden_at', 'hidden_at DATETIME NULL');
  await ensureBirthDateColumn();
  await PasswordRecovery.ensureSchema(db);
  await SurveyVisibility.ensureSchema(db);
  await Interests.ensureSchema(db);
  await seed();
  app.listen(PORT, () => console.log(`CRM đang chạy tại http://localhost:${PORT}`));
}
start().catch((e) => {
  console.error(`Không thể khởi động: ${e.message}`);
  process.exit(1);
});
