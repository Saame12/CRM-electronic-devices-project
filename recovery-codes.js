const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');
const normalize = (value) =>
  String(value || '')
    .replace(/[\s-]/g, '')
    .toLowerCase();
const generate = () =>
  crypto.randomBytes(16).toString('hex').toUpperCase().match(/.{4}/g).join('-');
const schema = `CREATE TABLE IF NOT EXISTS customer_recovery_codes (
 customer_id CHAR(36) PRIMARY KEY, code_hash CHAR(64) NOT NULL UNIQUE,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, used_at DATETIME NULL,
 CONSTRAINT fk_customer_recovery_code FOREIGN KEY(customer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB`;
async function ensureSchema(db) {
  await db.query(schema);
  const [columns] = await db.query(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='password_recovery_requests'"
  );
  const names = new Set(columns.map((c) => c.COLUMN_NAME));
  for (const [name, definition] of [
    ['verification_method', "verification_method VARCHAR(24) NOT NULL DEFAULT 'MANUAL'"],
    ['recovery_code_hash', 'recovery_code_hash CHAR(64) NULL']
  ])
    if (!names.has(name))
      await db.query('ALTER TABLE password_recovery_requests ADD COLUMN ' + definition);
}
// LOGIC: Sinh mã ngẫu nhiên 128-bit, chỉ lưu SHA-256 của mã đã chuẩn hóa; ghi đè hash cũ.
// Hàm dùng connection của bên gọi để tham gia cùng transaction. Mã gốc chỉ trả một lần cho khách.
async function issue(connection, customerId) {
  const code = generate();
  await connection.execute(
    'INSERT INTO customer_recovery_codes (customer_id,code_hash) VALUES (?,?) ON DUPLICATE KEY UPDATE code_hash=VALUES(code_hash),created_at=NOW(),used_at=NULL',
    [customerId, digest(normalize(code))]
  );
  return code;
}
function register(app, db, auth, wrap) {
  const attempts = new Map();
  function limited(req, res, next) {
    const now = Date.now();
    for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
    if (attempts.size > 10000) return res.status(429).json({ error: 'Vui lòng thử lại sau.' });
    const keys = [
      'ip:' + (req.ip || 'local'),
      'account:' +
        digest(
          String(req.body?.email || req.user?.id || '')
            .trim()
            .toLowerCase()
        )
    ];
    for (const key of keys)
      if ((attempts.get(key)?.count || 0) >= 5)
        return res
          .status(429)
          .json({ error: 'Bạn đã thử nhiều lần. Vui lòng thử lại sau 15 phút.' });
    for (const key of keys) {
      const entry = attempts.get(key) || { count: 0, until: now + 15 * 60 * 1000 };
      entry.count++;
      attempts.set(key, entry);
    }
    return next();
  }
  app.get(
    '/api/me/recovery-code',
    auth,
    wrap(async (req, res) => {
      if (req.user.role !== 'CUSTOMER')
        return res.status(403).json({ error: 'Chỉ dành cho khách hàng.' });
      const [[row]] = await db.execute(
        'SELECT used_at,created_at FROM customer_recovery_codes WHERE customer_id=?',
        [req.user.id]
      );
      res.set('Cache-Control', 'no-store');
      res.json({ configured: Boolean(row && !row.used_at), createdAt: row?.created_at || null });
    })
  );
  // LOGIC /me/recovery-code: Xác nhận mật khẩu hiện tại trong transaction -> cấp mã mới -> hủy phiên dùng mã cũ.
  app.post(
    '/api/me/recovery-code',
    auth,
    limited,
    wrap(async (req, res) => {
      if (req.user.role !== 'CUSTOMER')
        return res.status(403).json({ error: 'Chỉ dành cho khách hàng.' });
      const password = String(req.body.currentPassword || '');
      if (!password || Buffer.byteLength(password, 'utf8') > 72)
        return res.status(400).json({ error: 'Vui lòng nhập mật khẩu hiện tại.' });
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const [[user]] = await connection.execute(
          'SELECT id,password_hash,role,account_status FROM users WHERE id=? FOR UPDATE',
          [req.user.id]
        );
        if (
          !user ||
          user.role !== 'CUSTOMER' ||
          user.account_status !== 'ACTIVE' ||
          !(await bcrypt.compare(password, user.password_hash))
        ) {
          await connection.rollback();
          return res
            .status(403)
            .json({ error: 'Mật khẩu hiện tại không đúng hoặc tài khoản không còn hoạt động.' });
        }
        const code = await issue(connection, user.id);
        await connection.execute(
          "UPDATE password_recovery_requests SET status='CANCELLED' WHERE customer_id=? AND verification_method='RECOVERY_CODE' AND status IN ('PENDING','APPROVED')",
          [user.id]
        );
        await connection.commit();
        res.set('Cache-Control', 'no-store');
        res.json({
          code,
          message: 'Mã chỉ hiển thị lần này. Hãy lưu ở nơi an toàn; mã cũ đã hết hiệu lực.'
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    })
  );
  app.post(
    // LOGIC: Email + mã cá nhân hợp lệ -> tạo phiên APPROVED 15 phút; bước này CHƯA đổi mật khẩu.
    '/api/password-recovery/code',
    limited,
    wrap(async (req, res) => {
      const email = String(req.body.email || '')
          .trim()
          .toLowerCase(),
        code = normalize(req.body.recoveryCode);
      const invalid = () =>
        res
          .status(401)
          .json({ error: 'Email hoặc mã khôi phục không hợp lệ, đã dùng hoặc đã bị thay thế.' });
      if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254 || !/^[a-f0-9]{32}$/.test(code))
        return invalid();
      const hash = digest(code);
      const [[customer]] = await db.execute(
        "SELECT u.id FROM users u JOIN customer_recovery_codes c ON c.customer_id=u.id WHERE u.email=? AND u.role='CUSTOMER' AND u.account_status='ACTIVE' AND c.code_hash=? AND c.used_at IS NULL",
        [email, hash]
      );
      if (!customer) return invalid();
      const token = crypto.randomBytes(32).toString('hex'),
        id = crypto.randomUUID();
      await db.execute(
        "INSERT INTO password_recovery_requests (id,customer_id,email,token_hash,status,reason,verification_note,verification_method,recovery_code_hash,expires_at) VALUES (?,?,?,?,'APPROVED',?,?,'RECOVERY_CODE',?,DATE_ADD(NOW(),INTERVAL 15 MINUTE))",
        [
          id,
          customer.id,
          email,
          digest(token),
          'Khách yêu cầu tự khôi phục mật khẩu bằng mã cá nhân.',
          'Hệ thống xác minh mã khôi phục cá nhân.',
          hash
        ]
      );
      res.set('Cache-Control', 'no-store');
      res
        .status(201)
        .json({
          token,
          reference: id.slice(0, 8).toUpperCase(),
          status: 'APPROVED',
          method: 'RECOVERY_CODE',
          message: 'Đã xác minh. Bạn có 15 phút để đặt mật khẩu mới.'
        });
    })
  );
}
module.exports = { ensureSchema, register, issue, normalize, generate, digest, schema };
