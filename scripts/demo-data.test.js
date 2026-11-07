const test = require('node:test'),
  assert = require('node:assert/strict'),
  dotenv = require('dotenv');
const { buildDemo, DATASET } = require('../database/demo-data');
const { seedDemo } = require('./seed-demo');
const { databaseName, schemaSQL } = require('./setup-database');
const { quote } = require('./demo-env');
const now = new Date('2026-10-22T05:00:00Z');

test('Demo v2 recipient scopes, interests, age boundaries and signup chronology agree with current rules', () => {
  const D = require('../crm-domain'),
    A = require('../survey-audience'),
    V = require('../crm-validation'),
    d = buildDemo(now),
    asOf = dateAtDay(now);
  function dateAtDay(value) {
    return require('../database/demo-data').dateAt(value, 0).slice(0, 10);
  }
  const customers = d.users.filter((u) => u.role === 'CUSTOMER'),
    active = customers.filter((u) => u.account_status === 'ACTIVE');
  assert.equal(d.customerInterests.length, 32);
  assert.ok(customers.some((u) => u.interests.length >= 2));
  const filtered = d.surveys.find((s) => s.title === 'Khảo sát Gaming/Đồ họa 15–20 tuổi');
  const config = A.parse(filtered.audience_config),
    matched = active
      .filter((u) => D.matches(u, config.filters, asOf))
      .map((u) => u.id)
      .sort();
  assert.equal(matched.length, 7);
  assert.deepEqual(
    d.recipients
      .filter((r) => r.survey_id === filtered.id)
      .map((r) => r.customer_id)
      .sort(),
    matched
  );
  for (const s of d.surveys) {
    const scope = A.parse(s.audience_config),
      recipients = d.recipients.filter((r) => r.survey_id === s.id);
    if (s.status === 'DRAFT') {
      assert.equal(recipients.length, 0);
      continue;
    }
    assert.ok(scope, 'Every non-draft demo survey must have its recipient scope');
    A.normalize(scope, { required: true });
    assert.equal(s.accept_new_customers, s.status === 'OPEN' && scope.mode === 'ALL');
    if (scope.mode === 'SELECTED')
      assert.deepEqual(
        recipients.map((r) => r.customer_id).sort(),
        scope.customerIds.slice().sort()
      );
  }
  assert.equal(d.surveys.filter((s) => s.status === 'OPEN' && !s.audience_config).length, 0);
  const late = customers.at(-1),
    lateRecipients = d.recipients.filter((r) => r.customer_id === late.id);
  assert.equal(lateRecipients.length, 2);
  assert.ok(lateRecipients.every((r) => r.sent_at >= late.created_at));
  for (const r of lateRecipients) {
    const s = d.surveys.find((s) => s.id === r.survey_id);
    assert.ok(s.created_at < late.created_at);
    assert.equal(A.parse(s.audience_config).mode, 'ALL');
    assert.equal(s.status, 'OPEN');
  }
  for (const response of d.responses) {
    const qs = d.questions.filter((q) => q.survey_id === response.survey_id),
      answers = {};
    for (const q of qs) {
      const details = d.details.filter(
        (a) => a.response_id === response.id && a.question_id === q.id
      );
      if (!details.length) continue;
      answers['q' + (q.display_order - 1)] =
        q.question_type === 'TEXT'
          ? details[0].text_answer
          : q.question_type === 'RATING'
            ? details[0].rating_value
            : q.question_type === 'ONE'
              ? d.options.find((o) => o.id === details[0].option_id).option_text
              : details.map((a) => d.options.find((o) => o.id === a.option_id).option_text);
    }
    assert.doesNotThrow(() => V.answers(qs, d.options, answers));
  }
  assert.ok(
    d.feedback.every((f) => f.created_at <= require('../database/demo-data').dateAt(now, 0))
  );
});

test('Demo contains persistent, varied business scenarios and a ready-to-use primary customer', () => {
  const d = buildDemo(now),
    customer = d.users.find((u) => u.email === 'khach@demo.vn');
  assert.equal(d.users.length, 21);
  assert.equal(d.products.length, 14);
  assert.equal(d.feedback.length, 54);
  assert.equal(d.surveys.length, 12);
  assert.equal(d.responses.length, 18);
  assert.equal(d.questions.length, 24);
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
    new Set(['NEW', 'RESOLVED'])
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
  assert.equal(result.summary.accounts, 21);
  assert.equal(result.alreadyInstalled, false);
  const inserts = db.calls.filter((c) => Array.isArray(c) && c[0].startsWith('INSERT INTO users'));
  assert.equal(inserts.length, 21);
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
  assert.equal((sql.match(/CREATE TABLE IF NOT EXISTS/g) || []).length, 12);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS survey_lifecycle_history/);
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
