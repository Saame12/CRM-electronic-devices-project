const V = require('./crm-validation');
const { transaction } = require('./survey-service');
async function ensureSchema(db) {
  const [cols] = await db.query(
    "SELECT COLUMN_NAME,IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users'"
  );
  if (!cols.some((c) => c.COLUMN_NAME === 'erased_at'))
    await db.query('ALTER TABLE users ADD COLUMN erased_at DATETIME NULL');
  for (const [name, type] of [
    ['email', 'VARCHAR(254)'],
    ['phone', 'VARCHAR(15)'],
    ['password_hash', 'VARCHAR(255)']
  ])
    if (cols.some((c) => c.COLUMN_NAME === name && c.IS_NULLABLE === 'NO'))
      await db.query(`ALTER TABLE users MODIFY ${name} ${type} NULL`);
}
async function erase(db, id, { requireLocked = true } = {}) {
  return transaction(db, async (c) => {
    const [[u]] = await c.execute(
      "SELECT id,email,erased_at,account_status FROM users WHERE id=? AND role='CUSTOMER' FOR UPDATE",
      [id]
    );
    if (!u) V.fail('Không tìm thấy khách hàng.', 404);
    if (u.erased_at) return;
    if (requireLocked && u.account_status !== 'LOCKED')
      V.fail('Phải khóa khách hàng trước khi thực hiện xóa.', 409);
    await c.execute('DELETE FROM password_recovery_requests WHERE customer_id=? OR email=?', [
      id,
      u.email
    ]);
    await c.execute('DELETE FROM customer_recovery_codes WHERE customer_id=?', [id]);
    await c.execute(
      "UPDATE users SET account_status='LOCKED',email=NULL,phone=NULL,password_hash=NULL,address='',birth_year=NULL,auth_version=auth_version+1,erased_at=UTC_TIMESTAMP() WHERE id=?",
      [id]
    );
  });
}
module.exports = { ensureSchema, erase };
