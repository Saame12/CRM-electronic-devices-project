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
    console.log('Đã bổ sung danh mục và bảng sở thích, giữ nguyên dữ liệu nghiệp vụ.');
  } finally {
    await c.end();
  }
}
if (require.main === module)
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
