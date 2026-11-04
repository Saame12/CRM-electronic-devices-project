const test = require('node:test'),
  assert = require('node:assert/strict');
const { ensureSchema, enroll, register } = require('../survey-enrollment');

test('Customer refresh awaits enrollment before fetching visible surveys', async () => {
  const fs = require('node:fs'),
    vm = require('node:vm'),
    path = require('node:path'),
    calls = [];
  let synced = false;
  const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  const context = vm.createContext({
    me: { email: 'own' },
    FB: {},
    DONE: {},
    SV: [],
    api: async (url, options) => {
      calls.push({ url, options });
      if (url === '/api/surveys/sync') {
        synced = true;
        return { added: 1 };
      }
      assert.ok(synced, 'All reads must wait for the sync transaction to finish');
      return url === '/api/feedback'
        ? { feedback: [] }
        : url === '/api/survey-status'
          ? { completed: {} }
          : { surveys: [{ id: 'public' }] };
    }
  });
  vm.runInContext(
    source.slice(
      source.indexOf('async function refreshData()'),
      source.indexOf('async function restoreSession()')
    ),
    context
  );
  await vm.runInContext('refreshData()', context);
  assert.equal(calls[0].url, '/api/surveys/sync');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(vm.runInContext('SV[0].id', context), 'public');
});
test('Legacy migration defaults to private and does not infer audience from existing recipients', async () => {
  const calls = [];
  await ensureSchema({
    query: async (sql) => {
      calls.push(sql);
      return [[]];
    }
  });
  assert.ok(calls[1].includes('DEFAULT FALSE'));
  assert.ok(!calls.some((sql) => /UPDATE surveys SET|INSERT INTO survey_recipients/.test(sql)));
  const present = [];
  await ensureSchema({
    query: async (sql) => {
      present.push(sql);
      return [[{ COLUMN_NAME: 'accept_new_customers' }]];
    }
  });
  assert.equal(present.length, 1);
});
test('Enrollment locks only public OPEN non-expired surveys and inserts the authenticated ACTIVE customer once', async () => {
  const queries = [],
    insertions = [];
  const c = {
    query: async (sql) => {
      queries.push(sql);
      return [[{ id: 'public' }]];
    },
    execute: async (sql, args) => {
      insertions.push({ sql, args });
      return [{ affectedRows: insertions.length === 1 ? 1 : 0 }];
    }
  };
  assert.equal(await enroll(c, 'customer'), 1);
  assert.equal(await enroll(c, 'customer'), 0);
  assert.ok(
    queries.every(
      (sql) =>
        sql.includes("status='OPEN'") &&
        sql.includes('accept_new_customers=TRUE') &&
        sql.includes('due_date>=DATE(UTC_TIMESTAMP() + INTERVAL 7 HOUR)') &&
        sql.includes('FOR UPDATE')
    )
  );
  assert.deepEqual(insertions[0].args, ['public', 'customer']);
  assert.ok(insertions[0].sql.includes("account_status='ACTIVE'"));
  assert.ok(insertions[0].sql.includes("role='CUSTOMER'"));
});
test('Sync endpoint requires CUSTOMER, ignores requested customerId and uses a transaction', async () => {
  let route,
    actor,
    transactions = 0;
  const auth = () => {};
  register(
    { post: (...args) => (route = args) },
    {},
    auth,
    (x) => x,
    async (db, fn) => {
      transactions++;
      return fn({
        query: async () => [[{ id: 's' }]],
        execute: async (sql, args) => {
          actor = args[1];
          return [{ affectedRows: 1 }];
        }
      });
    }
  );
  assert.equal(route[1], auth);
  const res = () => ({
    code: 200,
    set() {},
    status(n) {
      this.code = n;
      return this;
    },
    json(value) {
      this.data = value;
    }
  });
  for (const role of ['ADMIN', 'MANAGER']) {
    const r = res();
    await route.at(-1)({ user: { role, id: 'own' } }, r);
    assert.equal(r.code, 403);
  }
  assert.equal(transactions, 0);
  const r = res();
  await route.at(-1)({ user: { role: 'CUSTOMER', id: 'own' }, body: { customerId: 'other' } }, r);
  assert.equal(actor, 'own');
  assert.equal(transactions, 1);
  assert.equal(r.data.added, 1);
});
