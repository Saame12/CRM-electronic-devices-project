const test = require('node:test'),
  assert = require('node:assert/strict'),
  vm = require('node:vm'),
  fs = require('node:fs'),
  path = require('node:path');
const Visibility = require('../survey-visibility');
function routes() {
  const calls = [],
    routes = [];
  const c = {
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release() {},
    execute: async (sql, args) => {
      calls.push({ sql, args });
      return sql.includes('GROUP BY status')
        ? [
            [
              { status: 'OPEN', total: 25 },
              { status: 'CLOSED', total: 25 },
              { status: 'DRAFT', total: 50 }
            ]
          ]
        : [[{ id: 'row', status: 'OPEN' }]];
    }
  };
  Visibility.register(
    { get: (...a) => routes.push(a), patch() {} },
    { getConnection: async () => c },
    () => {},
    () => {},
    (x) => x
  );
  return {
    calls,
    call: async (query) => {
      let status = 200,
        data;
      const res = {
        set() {},
        status(n) {
          status = n;
          return this;
        },
        json(x) {
          data = x;
        }
      };
      await routes[0].at(-1)({ query }, res);
      return { status, data };
    }
  };
}
test('Server paging returns filtered totals, all tab counts, stable order and bounded page after last-row removal', async () => {
  const s = routes(),
    r = await s.call({ page: '999', pageSize: '20', status: 'OPEN', q: "' OR 1=1" });
  assert.equal(r.status, 200);
  assert.deepEqual(r.data.pagination, {
    page: 2,
    pageSize: 20,
    total: 25,
    totalPages: 2,
    counts: { ALL: 100, DRAFT: 50, OPEN: 25, CLOSED: 25 }
  });
  const sql = s.calls[1];
  assert.ok(sql.sql.includes('ORDER BY s.created_at DESC,s.id DESC LIMIT 20 OFFSET 20'));
  assert.ok(!sql.sql.includes("' OR 1=1"));
  assert.deepEqual(sql.args, [false, "%' OR 1=1%", "%' OR 1=1%", 'OPEN']);
});
test('Server rejects malformed page, page size and status before executing SQL', async () => {
  for (const query of [
    { page: '0' },
    { page: '1;DROP TABLE surveys' },
    { page: '1.5' },
    { page: '1', pageSize: '10000' },
    { page: '1', status: 'invalid' }
  ]) {
    const s = routes();
    assert.equal((await s.call(query)).status, 400);
    assert.equal(s.calls.length, 0);
  }
});
test('Time search validates dates and applies the same inclusive range to rows and status counts', async () => {
  const s = routes();
  await s.call({
    page: '1',
    status: 'OPEN',
    dateField: 'due',
    from: '2026-11-01',
    to: '2026-11-07'
  });
  for (const call of s.calls) {
    assert.ok(call.sql.includes('s.due_date >= ?'));
    assert.ok(call.sql.includes('s.due_date < DATE_ADD(?,INTERVAL 1 DAY)'));
    assert.deepEqual(call.args.slice(3, 5), ['2026-11-01', '2026-11-07']);
  }
  for (const query of [
    { from: '2026-02-30' },
    { from: '2026-11-08', to: '2026-11-07' },
    { dateField: 's.id;DROP TABLE surveys' }
  ]) {
    const r = routes();
    assert.equal((await r.call({ page: '1', ...query })).status, 400);
    assert.equal(r.calls.length, 0);
  }
  const created = routes();
  await created.call({ page: '1', from: '2026-11-01' });
  assert.ok(created.calls.every((x) => x.sql.includes('s.created_at >= ?')));
});
test('Extend and reopen use purpose-specific valid deadline controls', () => {
  const { c } = browser();
  const extend = vm.runInContext(
    "lifecycleForm({id:'s',title:'Survey',status:'OPEN',due_date:'2099-11-10',audience_config:{mode:'ALL'}})",
    c
  );
  assert.ok(extend.includes('name="endMode" value="DATE"'));
  assert.ok(extend.includes('min="2099-11-11"'));
  assert.ok(!extend.includes('<select'));
  assert.ok(!extend.includes('Gia hạn / Điều chỉnh kết thúc'));
  assert.ok(!extend.includes('Phương thức hạn khảo sát'));
  const today = vm.runInContext('CrmDomain.today()', c);
  const reopened = vm.runInContext(
    "lifecycleForm({id:'s',title:'Survey',status:'CLOSED',due_date:'2000-01-01',audience_config:{mode:'ALL'}})",
    c
  );
  assert.ok(reopened.includes('value="' + today + '" required'));
  assert.ok(reopened.includes('value="DATE" selected'));
  assert.ok(!reopened.includes('value="2000-01-01"'));
  const manual = vm.runInContext("lifecycleForm({id:'s',status:'CLOSED',due_date:null})", c);
  assert.ok(manual.includes('value="MANUAL" selected'));
  assert.ok(manual.includes('disabled'));
});
test('Survey results no longer offer lifecycle-history controls', () => {
  const { c } = browser();
  c.result = {
    survey: { id: 's', title: 'Result', status: 'CLOSED' },
    questions: [],
    responses: []
  };
  const html = vm.runInContext('surveyInspection(result)', c);
  assert.ok(!html.includes('Lịch sử thay đổi'));
  assert.ok(!html.includes('survey-lifecycle-history'));
});
test('Lifecycle failures appear inside the open panel and keep the form available for correction', async () => {
  const { c } = browser();
  let alert,
    closed = false;
  const body = {
    scrollTop: 100,
    prepend(p) {
      alert = p;
    }
  };
  c.document.getElementById = () => ({
    open: true,
    querySelector: (s) => (s === '.survey-panel-body' ? body : alert),
    close() {
      closed = true;
    }
  });
  c.document.createElement = () => ({ setAttribute() {} });
  c.fail = async () => {
    throw Error('Ngày gia hạn phải muộn hơn hạn hiện tại.');
  };
  await vm.runInContext("runStaffTask('form:surveyLifecycleForm',null,fail)", c);
  assert.equal(alert.textContent, 'Ngày gia hạn phải muộn hơn hạn hiện tại.');
  assert.equal(body.scrollTop, 0);
  assert.equal(closed, false);
});
test('Editing preserves saved deadline mode, date and audience instead of requesting setup again', () => {
  const { c } = browser();
  const cases = [
    {
      due_date: '2099-11-10',
      audience_config: {
        mode: 'FILTER',
        filters: { interests: ['gaming', 'design'], minAge: 15, maxAge: 20 }
      }
    },
    {
      due_date: null,
      audience_config: {
        mode: 'SELECTED',
        filters: {},
        customerIds: ['customer-one', 'customer-two']
      }
    },
    { due_date: null, audience_config: { mode: 'ALL', filters: {} } }
  ];
  for (const s of cases) {
    c.saved = { survey: { id: 's', title: 'Đã lưu', ...s }, questions: [] };
    const html = vm.runInContext('surveyEditorForm(saved)', c);
    assert.ok(!html.includes('<option value="" disabled selected>'));
    assert.match(
      html,
      new RegExp('<option value="' + (s.due_date ? 'DATE' : 'MANUAL') + '" selected>')
    );
    assert.match(html, new RegExp('<option value="' + s.audience_config.mode + '" selected>'));
    if (s.due_date) assert.match(html, /value="2099-11-10" required/);
    if (s.audience_config.mode === 'FILTER') {
      assert.match(html, /name="audienceMinAge" value="15"/);
      assert.match(html, /value="gaming" checked/);
      assert.match(html, /value="design" checked/);
    }
    if (s.audience_config.mode === 'SELECTED')
      for (const id of s.audience_config.customerIds)
        assert.ok(html.includes('name="audienceCustomer" value="' + id + '"'));
  }
  const create = vm.runInContext('createForm()', c);
  assert.match(create, /<option value="" disabled selected>/);
});
function browser() {
  const nodes = new Map(),
    scrolls = [];
  const node = (selector) => {
    if (!nodes.has(selector))
      nodes.set(selector, {
        innerHTML: '',
        textContent: '',
        focus() {},
        classList: { add() {}, remove() {} }
      });
    return nodes.get(selector);
  };
  const c = vm.createContext({
    URLSearchParams,
    document: {
      querySelector: node,
      querySelectorAll: () => [],
      getElementById: () => null,
      addEventListener() {},
      body: { style: { overflow: '' } }
    },
    sessionStorage: { getItem: () => null, removeItem() {} },
    setTimeout: () => 0,
    clearTimeout() {},
    scrollY: 936,
    confirm: () => true
  });
  c.scrollTo = ({ top }) => {
    scrolls.push(top);
    c.scrollY = top;
  };
  for (const file of [
    'crm-domain.js',
    'customer-fields.js',
    'admin.js',
    'role-ui.js',
    'staff-surveys.js',
    'staff-controller.js',
    'reports.js'
  ])
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), c);
  vm.runInContext("me={id:'manager',role:'MANAGER'};page='surveys'", c);
  return { c, node, scrolls };
}
test('Refreshing after a mutation retains filter, server-clamped page and scroll position', async () => {
  const { c, scrolls } = browser();
  let url;
  c.respond = async (u) => {
    url = u;
    return {
      surveys: [],
      pagination: {
        page: 4,
        pageSize: 20,
        total: 80,
        totalPages: 4,
        counts: { ALL: 80, OPEN: 0, CLOSED: 30, DRAFT: 50 }
      }
    };
  };
  vm.runInContext(
    "api=respond;surveyFilters={status:'CLOSED',q:'hỗ trợ',hidden:false};surveyWorkspace.page=5",
    c
  );
  await vm.runInContext('loadSurveys()', c);
  assert.ok(url.includes('page=5'));
  assert.ok(url.includes('status=CLOSED'));
  assert.equal(vm.runInContext('surveyWorkspace.page', c), 4);
  assert.equal(vm.runInContext('surveyFilters.q', c), 'hỗ trợ');
  assert.equal(scrolls.at(-1), 936);
});
test('Closing the panel invalidates a pending request so it cannot reopen later', async () => {
  const { c } = browser(),
    shown = [];
  let resolve;
  c.respond = () =>
    new Promise((r) => {
      resolve = r;
    });
  c.show = (html) => shown.push(html);
  vm.runInContext('api=respond;showSurveyPanel=show', c);
  const request = vm.runInContext(
    "requestSurveyPanel({dataset:{id:'s'}},'/survey','Xem',d=>d.title)",
    c
  );
  vm.runInContext('closeSurveyPanel()', c);
  resolve({ title: 'STALE' });
  await request;
  assert.equal(shown.length, 1);
  assert.ok(!shown.includes('STALE'));
});
test('Panel refuses to discard unsaved edits when cancellation is declined', () => {
  const { c } = browser();
  let removed = false;
  const body = { prepend() {}, scrollTop: 120 };
  c.document.createElement = () => ({ setAttribute() {}, querySelector: () => ({ focus() {} }) });
  c.document.getElementById = () => ({
    dataset: { dirty: 'true' },
    querySelector: (s) => (s === '.survey-panel-body' ? body : null),
    close() {
      removed = true;
    },
    remove() {
      removed = true;
    }
  });
  assert.equal(vm.runInContext('closeSurveyPanel()', c), false);
  assert.equal(removed, false);
});
test('Returning to a status tab restores its page, and logout removes remembered workspace state', async () => {
  const { c } = browser();
  vm.runInContext("loadSurveys=async()=>{};surveyFilters.status='OPEN';surveyWorkspace.page=2", c);
  await vm.runInContext("staffActions['survey-tab']({dataset:{status:'DRAFT'}})", c);
  assert.equal(vm.runInContext('surveyWorkspace.page', c), 1);
  c.scrollY = 0;
  await vm.runInContext("staffActions['survey-tab']({dataset:{status:'OPEN'}})", c);
  assert.equal(vm.runInContext('surveyWorkspace.page', c), 2);
  assert.equal(vm.runInContext('surveyWorkspace.scrollY', c), 936);
  vm.runInContext('resetStaffSession()', c);
  assert.equal(vm.runInContext('surveyWorkspace.page', c), 1);
  assert.equal(vm.runInContext('Object.keys(surveyWorkspace.positions).length', c), 0);
});
