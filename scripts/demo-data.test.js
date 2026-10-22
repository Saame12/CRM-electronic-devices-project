const test = require('node:test'),
  assert = require('node:assert/strict'),
  dotenv = require('dotenv');
const { buildDemo, DATASET } = require('../database/demo-data');
const { seedDemo } = require('./seed-demo');
const { databaseName, schemaSQL } = require('./setup-database');
const { quote } = require('./demo-env');
const now = new Date('2026-10-22T05:00:00Z');

test('Demo contains persistent, varied business scenarios and a ready-to-use primary customer', () => {
  const d = buildDemo(now),
    customer = d.users.find((u) => u.email === 'khach@demo.vn');
  assert.equal(d.users.length, 15);
  assert.equal(d.products.length, 14);
  assert.equal(d.feedback.length, 36);
  assert.equal(d.surveys.length, 6);
  assert.equal(d.responses.length, 17);
  assert.equal(d.questions.length, 15);
  assert.equal(customer.role, 'CUSTOMER');
  assert.equal(customer.account_status, 'ACTIVE');
  assert.ok(customer.address);
  assert.ok(customer.birth_date);
  assert.notEqual(customer.need, 'Chưa xác định');
  assert.deepEqual(new Set(d.surveys.map((s) => s.status)), new Set(['OPEN', 'DRAFT', 'CLOSED']));
  assert.deepEqual(
    new Set(d.questions.map((q) => q.question_type)),
    new Set(['ONE', 'MULTI', 'TEXT', 'RATING'])
  );
  assert.deepEqual(
    new Set(d.feedback.map((f) => f.status)),
    new Set(['NEW', 'IN_PROGRESS', 'RESOLVED'])
  );
  assert.ok(d.feedback.some((f) => f.is_hidden));
  assert.ok(d.users.some((u) => u.account_status === 'LOCKED'));
  assert.ok(d.surveys.some((s) => s.status === 'OPEN' && s.due_date < '2026-10-22'));
  const fresh = d.surveys.find((s) => s.title === 'Mức độ hài lòng về dịch vụ');
  assert.ok(fresh.due_date > '2026-10-22');
  assert.ok(!d.responses.some((r) => r.survey_id === fresh.id && r.customer_id === customer.id));
  const completed = d.surveys.find((s) => s.title === 'Nhu cầu mua sắm PC và laptop');
  assert.ok(d.responses.some((r) => r.survey_id === completed.id && r.customer_id === customer.id));
});
test('Foreign keys, recipient counts, dates and answer types are consistent', () => {
  const d = buildDemo(now),
    users = new Map(d.users.map((u) => [u.id, u])),
    surveys = new Map(d.surveys.map((s) => [s.id, s])),
    questions = new Map(d.questions.map((q) => [q.id, q])),
    options = new Map(d.options.map((o) => [o.id, o])),
    responses = new Map(d.responses.map((r) => [r.id, r]));
  assert.equal(new Set(d.users.map((u) => u.email)).size, d.users.length);
  assert.equal(new Set(d.users.map((u) => u.phone)).size, d.users.length);
  for (const f of d.feedback) {
    assert.equal(users.get(f.customer_id).role, 'CUSTOMER');
    assert.ok(d.products.some((p) => p.id === f.product_id));
    if (f.replied_at) assert.ok(f.replied_at >= f.created_at);
    if (f.is_hidden) assert.equal(f.status, 'RESOLVED');
  }
  const pairs = new Set();
  for (const r of d.responses) {
    const s = surveys.get(r.survey_id);
    assert.notEqual(s.status, 'DRAFT');
    assert.equal(users.get(r.customer_id).role, 'CUSTOMER');
    assert.ok(r.submitted_at >= s.created_at);
    assert.ok(r.submitted_at.slice(0, 10) <= s.due_date);
    const recipient = d.recipients.find(
      (x) => x.survey_id === s.id && x.customer_id === r.customer_id
    );
    assert.ok(recipient);
    assert.ok(recipient.sent_at <= r.submitted_at);
    assert.ok(!pairs.has(r.survey_id + r.customer_id));
    pairs.add(r.survey_id + r.customer_id);
    for (const q of d.questions.filter((q) => q.survey_id === s.id && q.is_required))
      assert.ok(d.details.some((a) => a.response_id === r.id && a.question_id === q.id));
  }
  for (const a of d.details) {
    const q = questions.get(a.question_id),
      r = responses.get(a.response_id);
    assert.equal(q.survey_id, r.survey_id);
    if (a.option_id) {
      assert.equal(options.get(a.option_id).question_id, q.id);
      assert.ok(['ONE', 'MULTI'].includes(q.question_type));
    }
    if (a.rating_value) {
      assert.equal(q.question_type, 'RATING');
      assert.ok(a.rating_value >= 1 && a.rating_value <= 5);
    }
    if (a.text_answer) assert.equal(q.question_type, 'TEXT');
  }
  assert.ok(!d.recipients.some((r) => surveys.get(r.survey_id).status === 'DRAFT'));
});
test('Installation-relative dates remain usable years later', () => {
  const d = buildDemo(new Date('2031-04-05T05:00:00Z'));
  assert.ok(d.surveys.filter((s) => s.status === 'OPEN' && s.due_date > '2031-04-05').length >= 2);
  assert.ok(d.surveys.some((s) => s.status === 'OPEN' && s.due_date < '2031-04-05'));
});
function database({ existing = false, installed = false, fail = false } = {}) {
  const calls = [];
  return {
    calls,
    query: async (sql) => {
      calls.push(sql);
      if (sql === 'SELECT DATABASE() name') return [[{ name: 'backline_crm_demo_test' }]];
      if (sql.startsWith('SELECT COUNT')) return [[{ total: existing ? 1 : 0 }]];
      if (sql.includes('information_schema')) return [[{ COLUMN_NAME: 'auth_version' }]];
      return [[]];
    },
    execute: async (sql, values) => {
      calls.push([sql, values]);
      if (sql.startsWith('SELECT GET_LOCK')) return [[{ acquired: 1 }]];
      if (sql.startsWith('SELECT summary_json'))
        return [installed ? [{ summary_json: JSON.stringify({ accounts: 15 }) }] : []];
      if (fail && sql.startsWith('INSERT INTO feedback')) throw Error('insert failed');
      return [{ affectedRows: 1 }];
    },
    beginTransaction: async () => calls.push('begin'),
    commit: async () => calls.push('commit'),
    rollback: async () => calls.push('rollback')
  };
}
test('Seeding uses hashes, saves a marker atomically and never exports an active recovery token', async () => {
  const db = database(),
    result = await seedDemo(db, { now, hash: async (p) => 'HASH:' + p });
  assert.equal(result.summary.accounts, 15);
  assert.equal(result.alreadyInstalled, false);
  const inserts = db.calls.filter((c) => Array.isArray(c) && c[0].startsWith('INSERT INTO users'));
  assert.equal(inserts.length, 15);
  assert.ok(inserts.every((c) => c[1][2].startsWith('HASH:')));
  assert.ok(inserts.every((c) => !c[0].includes(',password,')));
  assert.ok(
    db.calls.some(
      (c) => Array.isArray(c) && c[0].startsWith('INSERT INTO demo_datasets') && c[1][0] === DATASET
    )
  );
  assert.ok(db.calls.includes('commit'));
  assert.ok(!db.calls.includes('rollback'));
  const requests = db.calls.filter(
    (c) => Array.isArray(c) && c[0].startsWith('INSERT INTO password_recovery_requests')
  );
  assert.equal(requests.length, 2);
  assert.ok(requests.every((c) => ['COMPLETED', 'REJECTED'].includes(c[1][4])));
});
test('Re-running preserves existing demo edits; non-demo data is refused, never cleared', async () => {
  const installed = database({ installed: true }),
    result = await seedDemo(installed, { now });
  assert.equal(result.alreadyInstalled, true);
  assert.ok(!installed.calls.some((c) => Array.isArray(c) && c[0].startsWith('INSERT')));
  const occupied = database({ existing: true });
  await assert.rejects(seedDemo(occupied, { now }), /đã có dữ liệu/);
  assert.ok(!occupied.calls.includes('begin'));
  assert.ok(!occupied.calls.some((c) => /DELETE|TRUNCATE|DROP/.test(Array.isArray(c) ? c[0] : c)));
});
test('Any insert failure rolls back all demo rows and releases its lock', async () => {
  const db = database({ fail: true });
  await assert.rejects(seedDemo(db, { now, hash: async () => 'HASH' }), /insert failed/);
  assert.ok(db.calls.includes('rollback'));
  assert.ok(!db.calls.includes('commit'));
  assert.ok(db.calls.at(-1)[0].startsWith('SELECT RELEASE_LOCK'));
});
test('DB setup honors the selected database safely and is non-destructive', () => {
  assert.throws(() => databaseName('x;DROP DATABASE x'));
  assert.throws(() => databaseName('a'.repeat(65)));
  const sql = schemaSQL('backline_crm_demo_test');
  assert.ok(sql.includes('USE `backline_crm_demo_test`;'));
  assert.ok(!sql.includes('USE backline_crm;'));
  assert.equal((sql.match(/CREATE TABLE IF NOT EXISTS/g) || []).length, 9);
  assert.ok(!/DROP|TRUNCATE/.test(sql));
});
test('Generated dotenv values round trip without leaking or corrupting special characters', () => {
  for (const text of [
    'simple',
    'space # equals= quote"',
    'single quote \x27',
    'both \x27 and " quotes',
    ''
  ]) {
    assert.equal(dotenv.parse('VALUE=' + quote(text)).VALUE, text);
  }
  assert.throws(() => quote('line\nbreak'));
});
