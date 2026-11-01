require('dotenv').config({
  path: process.env.CRM_ENV_FILE || require('node:path').join(__dirname, '..', '.env'),
  quiet: true
});
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const mysql = require('mysql2/promise');
const { databaseName, connectionOptions } = require('./setup-database');
function executable(name) {
  const file = process.platform === 'win32' ? name + '.exe' : name;
  const candidates = [
    process.env.MYSQL_BIN_DIR && path.join(process.env.MYSQL_BIN_DIR, file),
    ...(process.env.PATH || '').split(path.delimiter).map((p) => path.join(p, file))
  ];
  if (process.platform === 'win32')
    candidates.push(
      path.join(
        process.env.ProgramFiles || 'C:\\Program Files',
        'MySQL',
        'MySQL Server 8.0',
        'bin',
        file
      )
    );
  const found = candidates.filter(Boolean).find((p) => fs.existsSync(p));
  if (!found)
    throw Error('Không tìm thấy ' + file + '. Đặt MYSQL_BIN_DIR tới thư mục bin của MySQL.');
  return found;
}
const quoted = (value) =>
  '"' +
  String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r') +
  '"';
async function run(name, args, { input, output } = {}) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'crm-mysql-'));
  const config = path.join(temporary, 'client.cnf');
  fs.writeFileSync(
    config,
    '[client]\nhost=' +
      quoted(process.env.DB_HOST || '127.0.0.1') +
      '\nport=' +
      Number(process.env.DB_PORT || 3306) +
      '\nuser=' +
      quoted(process.env.DB_USER || 'root') +
      '\npassword=' +
      quoted(process.env.DB_PASSWORD) +
      '\ndefault-character-set=utf8mb4\n',
    { mode: 0o600 }
  );
  let inputFd, outputFd;
  try {
    inputFd = input ? fs.openSync(input, 'r') : null;
    outputFd = output ? fs.openSync(output, 'wx', 0o600) : null;
    await new Promise((resolve, reject) => {
      const child = spawn(executable(name), ['--defaults-extra-file=' + config, ...args], {
        windowsHide: true,
        stdio: [inputFd ?? 'ignore', outputFd ?? 'ignore', 'pipe']
      });
      let error = '';
      child.stderr.on('data', (chunk) => {
        error += chunk;
      });
      child.on('error', reject);
      child.on('close', (code) =>
        code === 0
          ? resolve()
          : reject(Error(name + ' không hoàn tất (mã ' + code + '): ' + error.slice(0, 600)))
      );
    });
  } finally {
    if (inputFd !== null && inputFd !== undefined) fs.closeSync(inputFd);
    if (outputFd !== null && outputFd !== undefined) fs.closeSync(outputFd);
    fs.rmSync(config, { force: true });
    fs.rmdirSync(temporary);
  }
}
async function counts(name) {
  const c = await mysql.createConnection({
    ...connectionOptions(),
    database: databaseName(name),
    multipleStatements: false
  });
  try {
    const [tables] = await c.query(
      "SELECT TABLE_NAME name FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME"
    );
    const output = {};
    for (const { name: table } of tables) {
      const [[row]] = await c.query('SELECT COUNT(*) n FROM `' + table.replace(/`/g, '``') + '`');
      output[table] = Number(row.n);
    }
    return output;
  } finally {
    await c.end();
  }
}
async function backup(file, source = databaseName()) {
  source = databaseName(source);
  const target = path.resolve(
    file ||
      path.join(
        __dirname,
        '..',
        'data',
        'backups',
        source + '-' + new Date().toISOString().replace(/[:.]/g, '-') + '.sql'
      )
  );
  fs.mkdirSync(path.dirname(target), { recursive: true });
  try {
    await run(
      'mysqldump',
      [
        '--single-transaction',
        '--skip-lock-tables',
        '--routines',
        '--events',
        '--triggers',
        '--hex-blob',
        '--no-tablespaces',
        '--set-gtid-purged=OFF',
        source
      ],
      { output: target }
    );
    const connection = await mysql.createConnection({
      ...connectionOptions(),
      database: source,
      multipleStatements: false
    });
    let mysqlVersion;
    try {
      const [[version]] = await connection.query('SELECT VERSION() version');
      mysqlVersion = version.version;
    } finally {
      await connection.end();
    }
    const metadata = {
      source,
      mysqlVersion,
      applicationSchemaSha256: crypto
        .createHash('sha256')
        .update(fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql')))
        .digest('hex'),
      createdAt: new Date().toISOString(),
      sha256: crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex'),
      counts: await counts(source),
      note: 'Row counts are sampled after export; verification assumes no concurrent business writes during backup/check.'
    };
    fs.writeFileSync(target + '.json', JSON.stringify(metadata, null, 2), {
      flag: 'wx',
      mode: 0o600
    });
    return { file: target, metadata };
  } catch (error) {
    throw error;
  }
}
async function restore(file, target) {
  if (!target) throw Error('Cần chỉ định --target là database mới.');
  target = databaseName(target);
  const sourceFile = path.resolve(file);
  const meta = JSON.parse(fs.readFileSync(sourceFile + '.json', 'utf8'));
  if (target === meta.source || target === databaseName())
    throw Error('Không phục hồi đè database nguồn hoặc database đang cấu hình.');
  if (crypto.createHash('sha256').update(fs.readFileSync(sourceFile)).digest('hex') !== meta.sha256)
    throw Error('Tệp sao lưu không khớp checksum.');
  const c = await mysql.createConnection({ ...connectionOptions(), multipleStatements: false });
  try {
    await c.query(
      'CREATE DATABASE `' + target + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
    );
  } finally {
    await c.end();
  }
  // CREATE without IF NOT EXISTS guarantees an existing database is never imported into.
  await run('mysql', [target], { input: sourceFile });
  const actual = await counts(target);
  if (JSON.stringify(actual) !== JSON.stringify(meta.counts))
    throw Error(
      'Đã nhập vào database mới nhưng số bản ghi khác metadata. Kiểm tra thay đổi đồng thời tại nguồn; giữ database đích để đối chiếu.'
    );
  return { target, counts: actual };
}
async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === 'backup') console.log('Đã sao lưu: ' + (await backup(args[0])).file);
  else if (command === 'restore' && args[1] === '--target')
    console.log(JSON.stringify(await restore(args[0], args[2]), null, 2));
  else
    throw Error(
      'Dùng: node scripts/database-backup.js backup [file.sql] | restore file.sql --target database_moi'
    );
}
if (require.main === module)
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
module.exports = { backup, restore, counts, executable };
