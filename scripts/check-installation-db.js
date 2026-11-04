/* Kiểm tra cài mới trong DB ngẫu nhiên riêng; không sửa database cấu hình trong .env.
 * Cần quyền CREATE/DROP DATABASE cho chính DB kiểm thử do lệnh này tạo.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const mysql = require('mysql2/promise');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { connectionOptions } = require('./setup-database');
const { validate } = require('./validate-demo-v3');
const { quote } = require('./demo-env');

async function main() {
  const name = 'crm_install_check_' + crypto.randomBytes(8).toString('hex');
  assert.match(name, /^crm_install_check_[a-f0-9]{16}$/);
  const admin = await mysql.createConnection({ ...connectionOptions(), multipleStatements: false });
  let owned = false,
    connection,
    checkout;
  try {
    // Không dùng IF NOT EXISTS: chỉ nhận quyền cleanup nếu thật sự tạo DB mới thành công.
    await admin.query('CREATE DATABASE `' + name + '` CHARACTER SET utf8mb4');
    owned = true;
    connection = await mysql.createConnection({
      ...connectionOptions(),
      database: name,
      multipleStatements: false
    });
    // Run the actual setup CLI in a clean folder, with no local .env or old demo data.
    checkout = fs.mkdtempSync(path.join(os.tmpdir(), 'crm-fresh-install-'));
    const root = path.resolve(__dirname, '..');
    for (const entry of fs.readdirSync(root))
      if (entry.endsWith('.js') || entry === '.env.example')
        fs.copyFileSync(path.join(root, entry), path.join(checkout, entry));
    for (const dir of ['scripts', 'database'])
      fs.cpSync(path.join(root, dir), path.join(checkout, dir), { recursive: true });
    const options = connectionOptions();
    fs.writeFileSync(
      path.join(checkout, '.env'),
      Object.entries({
        PORT: '3000',
        DB_HOST: options.host,
        DB_PORT: String(options.port),
        DB_NAME: name,
        DB_USER: options.user,
        DB_PASSWORD: options.password || '',
        JWT_SECRET: crypto.randomBytes(32).toString('hex')
      })
        .map(([key, value]) => key + '=' + quote(value))
        .join('\n') + '\n',
      { mode: 0o600 }
    );
    const env = { ...process.env, NODE_PATH: path.join(root, 'node_modules') };
    delete env.CRM_ENV_FILE;
    const runSetup = (args) =>
      execFileSync(process.execPath, [path.join(checkout, 'scripts/setup-project.js'), ...args], {
        cwd: checkout,
        env,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 120000
      }).toString();
    runSetup(['--empty']);
    const [[empty]] = await connection.query('SELECT COUNT(*) n FROM users');
    assert.equal(empty.n, 0);
    runSetup([]);
    await validate(connection);
    const [[marker]] = await connection.query(
      "SELECT COUNT(*) n FROM demo_datasets WHERE name='backline-demo-v3'"
    );
    assert.equal(marker.n, 1);
    const [[user]] = await connection.execute(
      "SELECT password_hash FROM users WHERE email='manager@demo.vn'"
    );
    assert.ok(runSetup([]).includes('DB đã có dữ liệu'));
    await validate(connection);
    const [[sameUser]] = await connection.execute(
      "SELECT password_hash FROM users WHERE email='manager@demo.vn'"
    );
    assert.equal(user.password_hash, sameUser.password_hash);
    console.log(
      'PASS: chạy CLI setup thật trong thư mục cài sạch, --empty không nạp dữ liệu, mặc định nạp V3 (21 tài khoản/16 khảo sát/21 bài trả lời/5 lịch sử), chạy lại giữ nguyên dữ liệu và mật khẩu.'
    );
  } finally {
    if (connection) await connection.end();
    if (checkout) {
      const target = path.resolve(checkout),
        parent = path.resolve(os.tmpdir());
      assert.equal(path.dirname(target), parent);
      assert.ok(path.basename(target).startsWith('crm-fresh-install-'));
      fs.rmSync(target, { recursive: true, force: true });
    }
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
