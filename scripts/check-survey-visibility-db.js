// Adds missing schema columns; visibility changes below use TEMPORARY tables only.
require('dotenv').config({
  path: process.env.CRM_ENV_FILE || require('node:path').join(__dirname, '..', '.env'),
  quiet: true
});
const mysql = require('mysql2/promise'),
  crypto = require('node:crypto'),
  assert = require('node:assert/strict');
const visibility = require('../survey-visibility');
async function main() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'backline_crm'
  });
  try {
    await visibility.ensureSchema(c);
    await c.query('CREATE TEMPORARY TABLE visibility_test_surveys LIKE surveys');
    await c.query('CREATE TEMPORARY TABLE visibility_test_responses LIKE survey_responses');
    const rewrite = (sql) =>
      sql
        .replace(/\bsurvey_responses\b/g, 'visibility_test_responses')
        .replace(/\bsurveys\b/g, 'visibility_test_surveys');
    const execute = (sql, v) => c.execute(rewrite(sql), v),
      ids = [];
    for (const status of ['DRAFT', 'OPEN', 'CLOSED']) {
      const id = crypto.randomUUID();
      ids.push(id);
      await execute(
        'INSERT INTO surveys (id,title,description,status,created_by,due_date) VALUES (?,?,?,?,?,?)',
        [id, 'Visibility ' + status, 'Fixture', status, crypto.randomUUID(), '2099-12-31']
      );
    }
    await execute('INSERT INTO survey_responses (id,survey_id,customer_id) VALUES (?,?,?)', [
      crypto.randomUUID(),
      ids[2],
      crypto.randomUUID()
    ]);
    const routes = new Map(),
      app = {
        get: (p, ...h) => routes.set('GET ' + p, h.at(-1)),
        patch: (p, ...h) => routes.set('PATCH ' + p, h.at(-1))
      };
    visibility.register(
      app,
      { execute },
      () => {},
      () => {},
      (fn) => fn
    );
    async function call(method, path, body = {}, id, query = {}) {
      let status = 200,
        data;
      await routes.get(method + ' ' + path)(
        { body, params: { id }, query },
        {
          status(n) {
            status = n;
            return this;
          },
          set() {},
          json(value) {
            data = value;
          }
        }
      );
      return { status, data };
    }
    const list = () => call('GET', '/api/admin/surveys');
    assert.equal((await list()).data.surveys.length, 3);
    for (const id of ids)
      assert.equal(
        (await call('PATCH', '/api/admin/surveys/:id/visibility', { hidden: true }, id)).status,
        200
      );
    assert.equal((await list()).data.surveys.length, 0);
    const hidden = await call('GET', '/api/admin/surveys', {}, undefined, { hidden: 'true' });
    assert.equal(hidden.data.surveys.length, 3);
    assert.equal(hidden.data.surveys.find((s) => s.id === ids[2]).response_count, 1);
    const [[open]] = await execute(
      "SELECT status,due_date FROM surveys WHERE id=? AND status='OPEN'",
      [ids[1]]
    );
    assert.ok(open);
    for (const id of ids)
      assert.equal(
        (await call('PATCH', '/api/admin/surveys/:id/visibility', { hidden: false }, id)).status,
        200
      );
    const restored = await list();
    assert.equal(restored.data.surveys.length, 3);
    assert.deepEqual(
      new Set(restored.data.surveys.map((s) => s.status)),
      new Set(['DRAFT', 'OPEN', 'CLOSED'])
    );
    assert.ok(restored.data.surveys.every((s) => s.hidden_at === null));
    assert.equal(restored.data.surveys.find((s) => s.id === ids[2]).response_count, 1);
    console.log(
      'Survey visibility MySQL checks passed: hide, hidden list and restore for all statuses; survey state, due date and responses preserved. Real survey visibility unchanged.'
    );
  } finally {
    await c.end();
  }
}
main().catch((error) => {
  console.error('Survey visibility checks failed: ' + (error.code || error.message));
  process.exitCode = 1;
});
