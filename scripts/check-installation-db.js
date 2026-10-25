/* Kiểm tra cài mới trong DB ngẫu nhiên riêng; không sửa database cấu hình trong .env.
 * Cần quyền CREATE/DROP DATABASE cho chính DB kiểm thử do lệnh này tạo.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const mysql = require('mysql2/promise');
const { setupDatabase, connectionOptions } = require('./setup-database');
const { initializeDatabase } = require('./setup-project');
const { seedDemo, businessTables } = require('./seed-demo');

async function main() {
  const name = 'crm_install_check_' + crypto.randomBytes(8).toString('hex');
  assert.match(name, /^crm_install_check_[a-f0-9]{16}$/);
  const admin = await mysql.createConnection({ ...connectionOptions(), multipleStatements: false });
  let owned = false,
    connection;
  try {
    // Không dùng IF NOT EXISTS: chỉ nhận quyền cleanup nếu thật sự tạo DB mới thành công.
    await admin.query('CREATE DATABASE `' + name + '` CHARACTER SET utf8mb4');
    owned = true;
    connection = await setupDatabase(name);
    const first = await initializeDatabase(connection, seedDemo, businessTables);
    assert.equal(first.mode, 'seeded');
    assert.equal(first.summary.accounts, 15);
    assert.equal(first.summary.surveys, 6);
    const [[user]] = await connection.execute(
      "SELECT password_hash FROM users WHERE email='manager@demo.vn'"
    );
    const second = await initializeDatabase(connection, seedDemo, businessTables);
    assert.equal(second.mode, 'preserved');
    const [[sameUser]] = await connection.execute(
      "SELECT password_hash FROM users WHERE email='manager@demo.vn'"
    );
    assert.equal(user.password_hash, sameUser.password_hash);
    console.log(
      'PASS: tạo schema, nạp 15 tài khoản/6 khảo sát, chạy lại giữ nguyên dữ liệu và mật khẩu.'
    );
  } finally {
    if (connection) await connection.end();
    try {
      if (owned) {
        await admin.query('DROP DATABASE `' + name + '`');
        console.log('Đã xóa database kiểm thử riêng vừa tạo; database người dùng không thay đổi.');
      }
    } finally {
      await admin.end();
    }
  }
}
if (require.main === module)
  main().catch((error) => {
    console.error('Kiểm tra cài đặt thất bại: ' + (error.code || error.message));
    process.exitCode = 1;
  });
module.exports = { main };
