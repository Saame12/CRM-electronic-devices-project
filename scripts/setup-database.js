require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');

async function setup() {
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
    charset: 'utf8mb4'
  });
  try {
    await connection.query(sql);
    console.log('Đã khởi tạo database backline_crm và các bảng CRM.');
  } finally {
    await connection.end();
  }
}

setup().catch(error => {
  console.error(`Không thể khởi tạo database: ${error.message}`);
  process.exit(1);
});
