const { prepareDemoEnv, loadDemoEnv } = require('./demo-env');
async function main() {
  const environment = prepareDemoEnv();
  loadDemoEnv();
  const { setupDatabase, databaseName } = require('./setup-database');
  const { seedDemo } = require('./seed-demo');
  const name = databaseName(),
    connection = await setupDatabase(name);
  try {
    const result = await seedDemo(connection);
    console.log(
      result.alreadyInstalled
        ? 'Demo đã được cài: không nhập trùng, không ghi đè chỉnh sửa.'
        : 'Đã cài dữ liệu demo vào MySQL: ' + name
    );
    console.table(result.summary);
    console.log('Chạy npm run demo:start để sử dụng database này.');
    if (environment.created) console.log('Đã tạo .env.demo riêng; file .env chính không thay đổi.');
    console.log(
      'Tài khoản: admin@backline.vn / Admin@123; manager@demo.vn / Manager@123; khach@demo.vn / 123456'
    );
  } finally {
    await connection.end();
  }
}
if (require.main === module)
  main().catch((error) => {
    console.error('Không thể cài demo: ' + (error.code || error.message));
    console.error(
      'Kiểm tra MySQL đang chạy và DB_USER/DB_PASSWORD/DB_PORT trong .env.demo. Không chia sẻ file này lên GitHub.'
    );
    process.exitCode = 1;
  });
module.exports = { main };
