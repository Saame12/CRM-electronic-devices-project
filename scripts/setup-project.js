/* LOGIC CÀI ĐẶT: Cấu hình riêng từng máy -> tạo schema -> chỉ seed khi DB trống.
 * Không sửa .env có sẵn, không reset DB hoặc đặt lại mật khẩu người dùng cũ.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const dotenv = require('dotenv');
const root = path.join(__dirname, '..');

function prepareConfig(directory = root) {
  const file = path.join(directory, '.env');
  if (fs.existsSync(file)) return { file, created: false };
  const template = fs.readFileSync(path.join(directory, '.env.example'), 'utf8');
  const content = template.replace(
    /^JWT_SECRET=.*$/m,
    'JWT_SECRET=' + crypto.randomBytes(48).toString('hex')
  );
  // wx: không ghi đè nếu một tiến trình khác vừa tạo cấu hình.
  try {
    fs.writeFileSync(file, content, { flag: 'wx', mode: 0o600 });
    return { file, created: true };
  } catch (error) {
    if (error.code === 'EEXIST') return { file, created: false };
    throw error;
  }
}

function validateConfig(values) {
  for (const key of [
    'PORT',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET'
  ]) {
    if (values[key] === undefined) throw Error('Thiếu ' + key + ' trong .env.');
  }
  for (const key of ['PORT', 'DB_PORT']) {
    if (!/^\d+$/.test(values[key]) || +values[key] < 1 || +values[key] > 65535)
      throw Error(key + ' phải là cổng từ 1 đến 65535.');
  }
  for (const key of ['DB_HOST', 'DB_USER']) {
    if (!String(values[key]).trim()) throw Error(key + ' không được để trống.');
  }
  if (!/^[a-zA-Z0-9_]{1,64}$/.test(values.DB_NAME))
    throw Error('DB_NAME chỉ được gồm chữ, số, dấu gạch dưới, tối đa 64 ký tự.');
  if (values.JWT_SECRET.length < 32 || /replace_with|thay_bang|doi_chuoi/i.test(values.JWT_SECRET))
    throw Error(
      'JWT_SECRET cần là chuỗi ngẫu nhiên riêng, ít nhất 32 ký tự. Xem HUONG_DAN_CAI_DAT.md.'
    );
  return values;
}

async function initializeDatabase(connection, seed, tables, includeSamples = true) {
  if (!includeSamples) return { mode: 'schema-only' };
  // Chỉ SELECT số lượng; dữ liệu cũ tuyệt đối không bị xóa để nạp mẫu.
  for (const table of tables) {
    const [[row]] = await connection.query('SELECT COUNT(*) total FROM ' + table);
    if (Number(row.total) > 0) return { mode: 'preserved' };
  }
  // seedDemo kiểm tra lại DB dưới GET_LOCK, ghi các bảng trong transaction.
  const result = await seed(connection);
  return { mode: result.alreadyInstalled ? 'preserved' : 'seeded', summary: result.summary };
}

function errorMessage(error) {
  const messages = {
    ECONNREFUSED:
      'Không kết nối được MySQL. Bật MySQL Server và kiểm tra DB_HOST/DB_PORT trong .env.',
    ER_ACCESS_DENIED_ERROR: 'MySQL từ chối đăng nhập. Kiểm tra DB_USER/DB_PASSWORD trong .env.',
    ER_DBACCESS_DENIED_ERROR: 'Tài khoản MySQL chưa có quyền truy cập hoặc tạo database này.',
    ER_TABLEACCESS_DENIED_ERROR: 'Tài khoản MySQL chưa đủ quyền tạo/đọc/ghi bảng.',
    ENOTFOUND: 'Không tìm thấy máy chủ MySQL. Kiểm tra DB_HOST.'
  };
  // Không in SQL, chuỗi kết nối hoặc giá trị cấu hình ra log lỗi.
  return (
    messages[error.code] ||
    (error.code ? 'Lỗi ' + error.code + '. Kiểm tra cấu hình/quyền MySQL.' : error.message)
  );
}

async function main(args = process.argv.slice(2)) {
  if (args.includes('--help')) {
    console.log('npm run config: tạo .env nếu thiếu, giữ nguyên nếu đã có.');
    console.log('npm run setup: tạo database/bảng theo .env; nạp dữ liệu mẫu nếu DB trống.');
    console.log('npm run setup -- --empty: chỉ tạo bảng, không nạp dữ liệu mẫu.');
    console.log('Sau setup chạy npm start. Không dùng .env.demo trong luồng này.');
    return;
  }
  if (args.some((arg) => !['--config-only', '--empty'].includes(arg)))
    throw Error('Tham số không hợp lệ. Chạy npm run setup -- --help.');
  if (process.env.CRM_ENV_FILE)
    throw Error('Hãy bỏ biến CRM_ENV_FILE khỏi terminal này. Luồng setup chuẩn chỉ sử dụng .env.');
  const config = prepareConfig();
  console.log(
    config.created ? 'Đã tạo .env với JWT_SECRET ngẫu nhiên riêng.' : 'Giữ nguyên .env hiện có.'
  );
  if (config.created || args.includes('--config-only')) {
    console.log('Mở .env, điền tài khoản/mật khẩu MySQL của máy này rồi chạy npm run setup.');
    return;
  }
  const values = validateConfig(dotenv.parse(fs.readFileSync(config.file)));
  Object.assign(process.env, values);
  const { setupDatabase } = require('./setup-database');
  const { seedDemo, businessTables } = require('./seed-demo');
  const connection = await setupDatabase(values.DB_NAME);
  try {
    const result = await initializeDatabase(
      connection,
      seedDemo,
      businessTables,
      !args.includes('--empty')
    );
    console.log('Đã chuẩn bị database ' + values.DB_NAME + '.');
    if (result.mode === 'seeded') {
      console.table(result.summary);
      console.log('Dữ liệu mẫu đã lưu thật trong MySQL. Tài khoản chỉ dùng thử trên máy cá nhân:');
      console.log('Admin: admin@backline.vn / Admin@123');
      console.log('Quản lý: manager@demo.vn / Manager@123');
      console.log('Khách: khach@demo.vn / 123456');
    } else if (result.mode === 'preserved') {
      console.log('DB đã có dữ liệu: không nạp mẫu, không ghi đè hoặc đặt lại mật khẩu.');
    } else console.log('Chỉ tạo cấu trúc bảng, không nạp bộ dữ liệu mẫu.');
    console.log('Hoàn tất. Chạy npm start và mở http://localhost:' + values.PORT);
  } finally {
    await connection.end();
  }
}

if (require.main === module)
  main().catch((error) => {
    console.error('Không thể setup: ' + errorMessage(error));
    process.exitCode = 1;
  });
module.exports = { prepareConfig, validateConfig, initializeDatabase, errorMessage, main };
