const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const dotenv = require('dotenv');
const root = path.join(__dirname, '..'),
  file = path.join(root, '.env.demo');
function quote(value) {
  const text = String(value ?? '');
  if (/[\r\n]/.test(text))
    throw Error('Cấu hình có ký tự xuống dòng. Vui lòng tạo .env.demo thủ công theo .env.example.');
  for (const delimiter of ["'", '"', '\x60'])
    if (!text.includes(delimiter)) return delimiter + text + delimiter;
  throw Error('Cấu hình có ký tự trích dẫn đặc biệt. Vui lòng cấu hình .env.demo thủ công.');
}
function prepareDemoEnv() {
  if (fs.existsSync(file)) return { file, created: false };
  const original = path.join(root, '.env'),
    base = fs.existsSync(original) ? dotenv.parse(fs.readFileSync(original)) : process.env;
  const config = {
    PORT: base.PORT || 3000,
    DB_HOST: base.DB_HOST || '127.0.0.1',
    DB_PORT: base.DB_PORT || 3306,
    DB_NAME: 'backline_crm_demo',
    DB_USER: base.DB_USER || 'root',
    DB_PASSWORD: base.DB_PASSWORD || '',
    JWT_SECRET: crypto.randomBytes(48).toString('hex')
  };
  const content =
    '# Local demo only. Never commit this file.\n' +
    Object.entries(config)
      .map(([k, v]) => k + '=' + quote(v))
      .join('\n') +
    '\n';
  try {
    fs.writeFileSync(file, content, { flag: 'wx', mode: 0o600 });
    return { file, created: true };
  } catch (error) {
    if (error.code === 'EEXIST') return { file, created: false };
    throw error;
  }
}
function loadDemoEnv() {
  if (!fs.existsSync(file)) throw Error('Chưa có .env.demo. Hãy chạy npm run demo:setup trước.');
  dotenv.config({ path: file, override: true, quiet: true });
  // Never fall back to the main .env, even when a value is missing.
  for (const key of ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'])
    if (process.env[key] === undefined) throw Error('Thiếu ' + key + ' trong .env.demo.');
  if (!process.env.DB_NAME.toLowerCase().includes('demo'))
    throw Error('DB_NAME trong .env.demo phải có chữ demo để tránh dùng nhầm database chính.');
  if (process.env.JWT_SECRET.length < 32)
    throw Error('JWT_SECRET trong .env.demo cần ít nhất 32 ký tự.');
  process.env.CRM_ENV_FILE = file;
}
module.exports = { prepareDemoEnv, loadDemoEnv, quote, file };
