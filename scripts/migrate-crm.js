const mysql = require('mysql2/promise');
const { connectionOptions, databaseName } = require('./setup-database');
const Interests = require('../customer-interests');
async function main() {
  const c = await mysql.createConnection({
    ...connectionOptions(),
    database: databaseName(),
    multipleStatements: false
  });
  try {
    await Interests.ensureSchema(c);
    await require('../survey-enrollment').ensureSchema(c);
    await require('../survey-audience').ensureSchema(c);
    await require('../survey-expiry').ensureSchema(c);
    await require('../survey-lifecycle').ensureSchema(c);
    await require('../feedback-service').ensureSchema(c);
    await require('../customer-retention').ensureSchema(c);
    console.log(
      'Đã kiểm tra sở thích, cấu hình nhận khách mới và phạm vi khảo sát; giữ nguyên các bản ghi nghiệp vụ.'
    );
  } finally {
    await c.end();
  }
}
if (require.main === module)
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
