const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
const D = require('../crm-domain'),
  V = require('../crm-validation');
test('Age 15–20 uses full birth dates, includes boundaries and excludes 14/21/unknown', () => {
  const f = V.filters({ minAge: '15', maxAge: '20', interests: ['gaming', 'design'] });
  for (const [date, expected] of [
    ['2011-11-03', true],
    ['2011-11-04', false],
    ['2011-11-02', true],
    ['2006-11-03', true],
    ['2005-11-04', true],
    ['2005-11-03', false],
    ['2005-11-02', false],
    ['', false]
  ])
    assert.equal(
      D.matches({ birth_date: date, interests: ['office', 'gaming'] }, f, '2026-11-03'),
      expected,
      date
    );
  assert.equal(
    D.matches({ birth_date: '2010-01-01', interests: ['design', 'office'] }, f, '2026-11-03'),
    true
  );
  assert.equal(
    D.matches({ birth_date: '2010-01-01', interests: ['office', 'learning'] }, f, '2026-11-03'),
    false
  );
  assert.equal(
    D.matches(
      { birth_date: '2010-01-01', interests: ['gaming'], need: 'Văn phòng' },
      { ...f, need: 'Gaming' },
      '2026-11-03'
    ),
    false
  );
  assert.throws(() => V.filters({ interests: ['invalid'] }), V.InputError);
  assert.throws(() => V.filters({ interests: 'gaming' }), V.InputError);
});
function environment() {
  const events = [],
    field = { value: 'SELECTED' },
    list = { innerHTML: '', hidden: true },
    button = {
      expanded: 'false',
      textContent: '',
      getAttribute() {
        return this.expanded;
      },
      setAttribute(k, v) {
        this.expanded = v;
      }
    };
  const form = {
    isConnected: true,
    querySelector: (s) =>
      s === '[data-audience-customers]'
        ? list
        : s === '[name="audienceMode"]'
          ? field
          : s === '[data-audience-fields]'
            ? {}
            : button,
    querySelectorAll: () => []
  };
  button.closest = () => form;
  const c = vm.createContext({
    console,
    URLSearchParams,
    document: {
      querySelector: () => ({ innerHTML: '', classList: { add() {}, remove() {} } }),
      querySelectorAll: () => [],
      addEventListener: (type, fn) => events.push({ type, fn })
    },
    sessionStorage: { getItem: () => null },
    setTimeout() {},
    clearTimeout() {}
  });
  for (const f of ['crm-domain.js', 'customer-fields.js', 'admin.js', 'staff-controller.js'])
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), c);
  c.form = form;
  c.button = button;
  c.values = {
    mode: 'SELECTED',
    filters: { need: '', interests: ['gaming', 'design'], minAge: '15', maxAge: '20' },
    customerIds: ['eligible']
  };
  vm.runInContext("me={id:'manager',role:'MANAGER'};readAudience=()=>values", c);
  return { c, form, list, button, field, events };
}
test('Load button opens filtered list, second click closes without another request and reopening preserves choice', async () => {
  const { c, list, button } = environment();
  const calls = [];
  c.apiMock = async (url, options) => {
    calls.push(JSON.parse(options.body));
    return {
      count: 1,
      asOf: '2026-11-03',
      customers: [
        {
          id: 'eligible',
          name: '<script>',
          email: 'test@invalid',
          age: 15,
          interests: ['gaming', 'office']
        }
      ]
    };
  };
  vm.runInContext('api=apiMock', c);
  await vm.runInContext('staffActions["load-audience-customers"](button)', c);
  assert.equal(calls[0].audience.mode, 'FILTER');
  assert.deepEqual(calls[0].audience.filters.interests, ['gaming', 'design']);
  assert.equal(calls[0].audience.filters.minAge, '15');
  assert.equal(list.hidden, false);
  assert.equal(button.expanded, 'true');
  assert.ok(list.innerHTML.includes(' checked'));
  assert.ok(list.innerHTML.includes('15 tuổi'));
  assert.ok(list.innerHTML.includes('&lt;script&gt;'));
  await vm.runInContext('staffActions["load-audience-customers"](button)', c);
  assert.equal(list.hidden, true);
  assert.equal(button.expanded, 'false');
  assert.equal(calls.length, 1);
  await vm.runInContext('staffActions["load-audience-customers"](button)', c);
  assert.equal(list.hidden, false);
  assert.equal(calls.length, 2);
  assert.ok(list.innerHTML.includes(' checked'));
  const html = vm.runInContext('audienceFields()', c);
  assert.ok(!html.includes('preview-audience'));
  assert.ok(!html.includes('Xem trước người nhận'));
  assert.ok(html.includes('name="audienceInterest"'));
  assert.ok(html.includes('ít nhất một'));
});
test('Changing filters invalidates late results and clears old checkbox selection', async () => {
  const { c, list, field, form } = environment();
  let finish;
  c.delayed = new Promise((r) => (finish = r));
  vm.runInContext('api=()=>delayed', c);
  const pending = vm.runInContext('toggleAudienceCustomers(button)', c);
  c.changedField = { name: 'audienceMinAge', closest: () => form };
  field.value = 'ALL';
  vm.runInContext("values.filters.minAge='16';handleAudienceChange({target:changedField})", c);
  assert.equal(field.value, 'FILTER');
  assert.equal(list.hidden, true);
  assert.equal(list.innerHTML, '');
  finish({ count: 1, asOf: '2026-11-03', customers: [{ id: 'old', name: 'STALE', age: 15 }] });
  await pending;
  assert.ok(!list.innerHTML.includes('STALE'));
});

for (const mode of ['ALL', 'FILTER', 'SELECTED'])
  test(`Loaded checkboxes reflect ${mode} without changing scope or losing choices on reopen`, async () => {
    const { c, list, button } = environment();
    c.values.mode = mode;
    c.values.customerIds = mode === 'SELECTED' ? ['a'] : [];
    if (mode === 'ALL') c.values.filters = { need: '', interests: [], minAge: '', maxAge: '' };
    c.apiMock = async () => ({
      count: 2,
      asOf: '2026-11-04',
      customers: [
        { id: 'a', name: 'A', age: 15 },
        { id: 'b', name: 'B', age: 20 }
      ]
    });
    vm.runInContext('api=apiMock', c);
    await vm.runInContext('toggleAudienceCustomers(button)', c);
    assert.equal((list.innerHTML.match(/ checked/g) || []).length, mode === 'SELECTED' ? 1 : 2);
    assert.ok(list.innerHTML.includes('value="a" checked'));
    assert.equal(list.innerHTML.includes('value="b" checked'), mode !== 'SELECTED');
    assert.equal(c.values.mode, mode);
    await vm.runInContext('toggleAudienceCustomers(button)', c);
    assert.equal(list.hidden, true);
    await vm.runInContext('toggleAudienceCustomers(button)', c);
    assert.equal(button.expanded, 'true');
    assert.equal((list.innerHTML.match(/ checked/g) || []).length, mode === 'SELECTED' ? 1 : 2);
    assert.equal(c.values.mode, mode);
  });
test('Selecting a checkbox switches to SELECTED; changing mode to ALL clears filters', () => {
  const { c, form, field } = environment();
  c.changedField = { name: 'audienceCustomer', closest: () => form };
  field.value = 'FILTER';
  vm.runInContext('handleAudienceChange({target:changedField})', c);
  assert.equal(field.value, 'SELECTED');
  const inputs = [
    { type: 'checkbox', checked: true },
    { type: 'number', value: '15' }
  ];
  form.querySelectorAll = () => inputs;
  field.value = 'ALL';
  c.changedField = { name: 'audienceMode', closest: () => form };
  vm.runInContext('handleAudienceChange({target:changedField})', c);
  assert.equal(inputs[0].checked, false);
  assert.equal(inputs[1].value, '');
});
