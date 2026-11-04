// Builds and verifies a fresh database first, then switches the application's local config.
const fs = require('node:fs'),
  path = require('node:path'),
  crypto = require('node:crypto'),
  assert = require('node:assert/strict');
const dotenv = require('dotenv'),
  mysql = require('mysql2/promise');
const root = path.join(__dirname, '..');
dotenv.config({ path: path.join(root, '.env'), quiet: true });
const { setupDatabase, connectionOptions, databaseName } = require('./setup-database');
const { seedDemo } = require('./seed-demo'),
  { backup, counts } = require('./database-backup'),
  { quote } = require('./demo-env');
async function main() {
  const oldName = databaseName(),
    tag =
      new Date().toISOString().replace(/\D/g, '').slice(0, 14) +
      '_' +
      crypto.randomBytes(3).toString('hex'),
    newName = databaseName('backline_crm_demo_v2_' + tag);
  const owner = await mysql.createConnection({ ...connectionOptions(), multipleStatements: false });
  let c;
  const record = {
    createdAt: new Date().toISOString(),
    previousDatabase: oldName,
    database: newName
  };
  try {
    const oldBackup = await backup(
      path.join(root, 'data', 'backups', 'before-demo-v2-' + tag + '.sql'),
      oldName
    );
    record.previousBackup = oldBackup.file;
    await owner.query(
      'CREATE DATABASE `' + newName + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
    );
    c = await setupDatabase(newName);
    const result = await seedDemo(c);
    record.summary = result.summary;
    assert.equal(result.summary.accounts, 21);
    assert.equal(result.summary.customers, 18);
    assert.equal(result.summary.surveys, 12);
    const [[invalid]] = await c.query(
      "SELECT COUNT(*) n FROM surveys WHERE status='OPEN' AND audience_config IS NULL"
    );
    assert.equal(invalid.n, 0);
    const [[orphan]] = await c.query(
      'SELECT COUNT(*) n FROM survey_responses r LEFT JOIN survey_recipients t ON t.survey_id=r.survey_id AND t.customer_id=r.customer_id WHERE t.customer_id IS NULL'
    );
    assert.equal(orphan.n, 0);
    record.counts = await counts(newName);
    const exportFile = path.join(root, 'outputs', 'Du_lieu_demo_CRM_v2_' + tag + '.sql');
    const exported = await backup(exportFile, newName);
    record.sqlFile = exported.file;
    // Keep private config backups for rollback; no secret is logged or included in the public manifest.
    const envFile = path.join(root, '.env'),
      envText = fs.readFileSync(envFile, 'utf8'),
      config = dotenv.parse(envText);
    if (config.DB_NAME !== oldName)
      throw Error('Cấu hình thay đổi trong lúc tạo dữ liệu; chưa chuyển database.');
    const updated = envText.replace(/^DB_NAME\s*=.*$/m, 'DB_NAME=' + newName);
    if (updated === envText) throw Error('Không tìm thấy dòng DB_NAME; chưa đổi cấu hình.');
    fs.writeFileSync(
      path.join(root, 'data', 'backups', 'env-before-demo-v2-' + tag + '.txt'),
      envText,
      { flag: 'wx', mode: 0o600 }
    );
    const demoFile = path.join(root, '.env.demo');
    if (fs.existsSync(demoFile))
      fs.copyFileSync(
        demoFile,
        path.join(root, 'data', 'backups', 'env-demo-before-v2-' + tag + '.txt'),
        fs.constants.COPYFILE_EXCL
      );
    const demoConfig = {
      PORT: config.PORT || '3000',
      DB_HOST: config.DB_HOST || '127.0.0.1',
      DB_PORT: config.DB_PORT || '3306',
      DB_NAME: newName,
      DB_USER: config.DB_USER || 'root',
      DB_PASSWORD: config.DB_PASSWORD || '',
      JWT_SECRET: config.JWT_SECRET
    };
    fs.writeFileSync(
      demoFile,
      '# Local demo v2. Never commit this configuration.\n' +
        Object.entries(demoConfig)
          .map(([k, v]) => k + '=' + quote(v))
          .join('\n') +
        '\n',
      { mode: 0o600 }
    );
    fs.writeFileSync(envFile, updated, { mode: 0o600 });
    record.activated = true;
    fs.writeFileSync(
      path.join(root, 'outputs', 'demo-v2-manifest.json'),
      JSON.stringify(record, null, 2)
    );
    console.log(JSON.stringify(record, null, 2));
  } finally {
    if (c) await c.end();
    await owner.end();
  }
}
if (require.main === module)
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
module.exports = { main };
