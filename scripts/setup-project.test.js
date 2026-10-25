const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const dotenv = require('dotenv');
const {
  prepareConfig,
  validateConfig,
  initializeDatabase,
  errorMessage
} = require('./setup-project');
const { businessTables } = require('./seed-demo');

const valid = () => ({
  PORT: '3000',
  DB_HOST: '127.0.0.1',
  DB_PORT: '3306',
  DB_NAME: 'crm_test',
  DB_USER: 'tester',
  DB_PASSWORD: '',
  JWT_SECRET: 'a'.repeat(96)
});

test('Fresh download generates a private local env and never overwrites an existing env', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'crm-config-test-'));
  try {
    fs.copyFileSync(
      path.join(__dirname, '..', '.env.example'),
      path.join(directory, '.env.example')
    );
    const first = prepareConfig(directory);
    assert.equal(first.created, true);
    const text = fs.readFileSync(first.file, 'utf8');
    const values = validateConfig(dotenv.parse(text));
    assert.match(values.JWT_SECRET, /^[a-f0-9]{96}$/);
    assert.equal(values.DB_NAME, 'backline_crm');
    assert.equal(values.DB_PASSWORD, '');
    assert.equal(prepareConfig(directory).created, false);
    assert.equal(fs.readFileSync(first.file, 'utf8'), text);
  } finally {
    // Chỉ xóa đúng các file fixture do test tự tạo, không xóa thư mục người dùng.
    for (const name of ['.env', '.env.example'])
      if (fs.existsSync(path.join(directory, name))) fs.unlinkSync(path.join(directory, name));
    fs.rmdirSync(directory);
  }
});

test('Setup rejects missing fields, invalid ports, unsafe DB names and placeholder secrets', () => {
  assert.equal(validateConfig(valid()).DB_PASSWORD, '');
  for (const key of Object.keys(valid())) {
    const values = valid();
    delete values[key];
    assert.throws(() => validateConfig(values), /Thiếu/);
  }
  for (const [key, value] of [
    ['PORT', '0'],
    ['DB_PORT', '65536'],
    ['PORT', 'abc'],
    ['DB_USER', ''],
    ['DB_HOST', ' '],
    ['DB_NAME', 'db;DROP'],
    ['JWT_SECRET', 'short'],
    ['JWT_SECRET', 'replace_with_a_long_random_secret']
  ])
    assert.throws(() => validateConfig({ ...valid(), [key]: value }));
});

test('Setup seeds the complete dataset only after all business tables are empty', async () => {
  const read = [];
  let seeds = 0;
  const connection = {
    query: async (sql) => {
      read.push(sql);
      return [[{ total: 0 }]];
    }
  };
  const result = await initializeDatabase(
    connection,
    async (received) => {
      seeds++;
      assert.equal(received, connection);
      return { alreadyInstalled: false, summary: { accounts: 15 } };
    },
    businessTables
  );
  assert.equal(result.mode, 'seeded');
  assert.equal(seeds, 1);
  assert.equal(read.length, businessTables.length);
  assert.ok(read.every((sql) => sql.startsWith('SELECT COUNT(*)')));
});

test('Setup preserves any occupied business table and never resets user data', async () => {
  for (const occupied of businessTables) {
    let seeds = 0;
    const connection = {
      query: async (sql) => [[{ total: sql.endsWith('FROM ' + occupied) ? 1 : 0 }]]
    };
    const result = await initializeDatabase(
      connection,
      async () => {
        seeds++;
      },
      businessTables
    );
    assert.equal(result.mode, 'preserved', occupied);
    assert.equal(seeds, 0, occupied);
  }
});

test('Schema-only setup never invokes seed or business reads', async () => {
  const unexpected = () => {
    throw Error('Unexpected data access');
  };
  assert.deepEqual(
    await initializeDatabase({ query: unexpected }, unexpected, businessTables, false),
    { mode: 'schema-only' }
  );
});

test('Setup propagates failed seeding, never reports partial installation as success', async () => {
  await assert.rejects(
    initializeDatabase(
      { query: async () => [[{ total: 0 }]] },
      async () => {
        throw Error('seed failed');
      },
      businessTables
    ),
    /seed failed/
  );
});

test('MySQL errors explain configuration without printing raw password or SQL', () => {
  for (const code of ['ECONNREFUSED', 'ER_ACCESS_DENIED_ERROR', 'ER_PARSE_ERROR']) {
    const text = errorMessage({ code, message: 'secret-password SQL INSERT' });
    assert.ok(!text.includes('secret-password'));
    assert.ok(!text.includes('SQL INSERT'));
  }
});
