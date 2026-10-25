const test = require('node:test'),
  assert = require('node:assert/strict'),
  vm = require('node:vm'),
  fs = require('node:fs'),
  path = require('node:path');
const { register, ensureSchema } = require('../survey-visibility');
const source = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
function setup() {
  const routes = new Map(),
    calls = [],
    rows = [{ id: 's', status: 'OPEN', is_hidden: false, hidden_at: null, response_count: 2 }];
  const db = {
    execute: async (sql, v = []) => {
      calls.push({ sql, v });
      if (sql.startsWith('SELECT id')) return [[...rows.filter((r) => r.id === v[0])]];
      if (sql.startsWith('UPDATE')) {
        const row = rows.find((r) => r.id === v[2]);
        row.is_hidden = v[0];
        row.hidden_at = v[0] ? row.hidden_at || 'first-hidden' : null;
        return [{ affectedRows: 1 }];
      }
      return [rows.filter((r) => r.is_hidden === v[0] && (!v[3] || r.status === v[3]))];
    }
  };
  const auth = () => {},
    manager = () => {},
    app = {
      get: (p, ...h) => routes.set('GET ' + p, h),
      patch: (p, ...h) => routes.set('PATCH ' + p, h)
    };
  register(app, db, auth, manager, (x) => x);
  async function call(method, p, { query = {}, body = {}, id = 's' } = {}) {
    let data,
      status = 200;
    await routes.get(method + ' ' + p).at(-1)(
      { query, body, params: { id } },
      {
        set() {},
        status(n) {
          status = n;
          return this;
        },
        json(d) {
          data = d;
        }
      }
    );
    return { status, data };
  }
  return { call, routes, calls, rows, auth, manager };
}
test('Visibility APIs require authentication and manager permission, not admin/customer access', () => {
  const s = setup();
  for (const handlers of s.routes.values()) {
    assert.equal(handlers[0], s.auth);
    assert.equal(handlers[1], s.manager);
  }
  assert.match(
    source('server.mysql.js'),
    /SurveyVisibility.register\(app, db, auth, staff, wrap\)/
  );
  assert.match(source('server.mysql.js'), /const staff = .*role === 'MANAGER'/);
});
test('Normal and hidden lists are separated, with parameterized search and status filtering', async () => {
  const s = setup();
  assert.equal((await s.call('GET', '/api/admin/surveys')).data.surveys.length, 1);
  await s.call('PATCH', '/api/admin/surveys/:id/visibility', { body: { hidden: true } });
  assert.equal((await s.call('GET', '/api/admin/surveys')).data.surveys.length, 0);
  assert.equal(
    (
      await s.call('GET', '/api/admin/surveys', {
        query: { hidden: 'true', q: "' OR 1=1", status: 'OPEN' }
      })
    ).data.surveys.length,
    1
  );
  const query = s.calls.at(-1);
  assert.ok(!query.sql.includes("' OR 1=1"));
  assert.deepEqual(query.v, [true, "%' OR 1=1%", "%' OR 1=1%", 'OPEN']);
  assert.equal(
    (await s.call('GET', '/api/admin/surveys', { query: { hidden: 'invalid' } })).status,
    400
  );
});
test('Hide and restore work for all statuses, never change status or response counts, and are idempotent', async () => {
  for (const status of ['DRAFT', 'OPEN', 'CLOSED']) {
    const s = setup();
    s.rows[0].status = status;
    assert.equal(
      (await s.call('PATCH', '/api/admin/surveys/:id/visibility', { body: { hidden: true } }))
        .status,
      200
    );
    await s.call('PATCH', '/api/admin/surveys/:id/visibility', { body: { hidden: true } });
    assert.equal(s.rows[0].hidden_at, 'first-hidden');
    assert.equal(
      (await s.call('PATCH', '/api/admin/surveys/:id/visibility', { body: { hidden: false } }))
        .status,
      200
    );
    assert.equal(s.rows[0].hidden_at, null);
    assert.equal(s.rows[0].status, status);
    assert.equal(s.rows[0].response_count, 2);
    assert.ok(
      s.calls
        .filter((c) => c.sql.startsWith('UPDATE'))
        .every((c) => !c.sql.includes('status=') && !c.sql.includes('DELETE'))
    );
  }
});
test('Malformed visibility values and unknown surveys are rejected', async () => {
  const s = setup();
  for (const hidden of ['false', 0, null])
    assert.equal(
      (await s.call('PATCH', '/api/admin/surveys/:id/visibility', { body: { hidden } })).status,
      400
    );
  assert.equal(
    (
      await s.call('PATCH', '/api/admin/surveys/:id/visibility', {
        id: 'unknown',
        body: { hidden: true }
      })
    ).status,
    404
  );
});
test('Schema migration adds only missing survey columns', async () => {
  const queries = [];
  await ensureSchema({
    query: async (sql) => {
      queries.push(sql);
      return [[{ COLUMN_NAME: 'is_hidden' }]];
    }
  });
  assert.equal(queries.filter((q) => q.startsWith('ALTER')).length, 1);
  assert.ok(queries.at(-1).includes('hidden_at'));
  assert.ok(!queries.some((q) => /DROP|DELETE|TRUNCATE/.test(q)));
});
test('Survey UI exposes hide in main list, restore in hidden list, and preserves hidden mode while filtering', async () => {
  const node = {
    innerHTML: '',
    textContent: '',
    value: '',
    querySelectorAll: () => [],
    classList: { add() {}, remove() {} }
  };
  const c = vm.createContext({
    URLSearchParams,
    document: { querySelector: () => node, querySelectorAll: () => [], addEventListener() {} },
    sessionStorage: { getItem: () => null },
    setTimeout: () => 0,
    clearTimeout() {}
  });
  for (const f of ['admin.js', 'role-ui.js', 'staff-surveys.js', 'staff-controller.js'])
    vm.runInContext(source(f), c);
  vm.runInContext(
    "me={id:'m',role:'MANAGER'};surveys=[{id:'s',title:'Test',status:'OPEN',response_count:2}]",
    c
  );
  let html = vm.runInContext('surveyPage()', c);
  assert.ok(html.includes('data-action="hide-survey"'));
  assert.ok(html.includes('Xem khảo sát đã ẩn'));
  html = vm.runInContext('surveyFilters.hidden=true;surveyPage()', c);
  assert.ok(html.includes('Khôi phục khảo sát'));
  assert.ok(!html.includes('data-action="hide-survey"'));
  assert.ok(!html.includes('data-action="close-survey"'));
  vm.runInContext('loadSurveys=async()=>{}', c);
  await vm.runInContext("staffActions['filter-surveys']()", c);
  assert.equal(vm.runInContext('surveyFilters.hidden', c), true);
});
