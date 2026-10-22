require('dotenv').config({
  path: process.env.CRM_ENV_FILE || require('node:path').join(__dirname, '..', '.env'),
  quiet: true
});
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');

function databaseName(value = process.env.DB_NAME || 'backline_crm') {
  if (!/^[a-zA-Z0-9_]{1,64}$/.test(value))
    throw Error('DB_NAME chỉ được gồm chữ, số, dấu gạch dưới và tối đa 64 ký tự.');
  return value;
}
function schemaSQL(name) {
  return fs
    .readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8')
    .replace(/\bbackline_crm\b/g, '`' + databaseName(name) + '`');
}
function connectionOptions() {
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
    charset: 'utf8mb4'
  };
}
async function setupDatabase(name = databaseName()) {
  const connection = await mysql.createConnection(connectionOptions());
  try {
    await connection.query(schemaSQL(name));
    return connection;
  } catch (error) {
    await connection.end();
    throw error;
  }
}
async function main() {
  const name = databaseName(),
    connection = await setupDatabase(name);
  try {
    console.log(
      'Đã kiểm tra / tạo các bảng CRM trong database ' + name + '. Không xóa dữ liệu đang có.'
    );
  } finally {
    await connection.end();
  }
}
if (require.main === module)
  main().catch((error) => {
    console.error('Không thể khởi tạo database: ' + (error.code || error.message));
    process.exitCode = 1;
  });
module.exports = { databaseName, schemaSQL, connectionOptions, setupDatabase };
