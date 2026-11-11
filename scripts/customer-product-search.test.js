const test = require('node:test'),
  assert = require('node:assert/strict');
const vm = require('node:vm'),
  fs = require('node:fs');
function environment() {
  const events = [];
  const c = vm.createContext({
    document: { addEventListener: (type, fn) => events.push({ type, fn }) }
  });
  for (const f of ['crm-domain.js', 'customer-fields.js', 'birth-date.js', 'app.js']) {
    let s = fs.readFileSync(require('node:path').join(__dirname, '..', f), 'utf8');
    if (f === 'app.js') s = s.slice(0, s.indexOf('// Khởi chạy render lần đầu tiên'));
    vm.runInContext(s, c);
  }
  return { c, events };
}
test('Feedback product suggestions match substrings, case, accents and multiple terms', () => {
  const { c } = environment();
  assert.deepEqual(Array.from(vm.runInContext("matchingProducts('LENOVO')", c)), [
    'Lenovo IdeaPad Slim 3 15IAH8',
    'Lenovo LOQ 15IAX9'
  ]);
  assert.deepEqual(Array.from(vm.runInContext("matchingProducts('lenovo loq')", c)), [
    'Lenovo LOQ 15IAX9'
  ]);
  assert.ok(vm.runInContext("matchingProducts('do hoa').includes('PC Đồ họa Backline D1')", c));
  assert.equal(vm.runInContext("matchingProducts('khong-ton-tai').length", c), 0);
  const html = vm.runInContext("productPicker('test','Lenovo LOQ 15IAX9')", c);
  assert.ok(html.includes('role="combobox"'));
  assert.ok(html.includes('role="listbox"'));
  assert.ok(html.includes('name="prod" value="Lenovo LOQ 15IAX9"'));
});
test('Typing a new search clears a previous selection, and selecting a suggestion supplies the exact product', () => {
  const { c, events } = environment(),
    attrs = {};
  const selected = { value: 'Lenovo LOQ 15IAX9' },
    list = { id: 'test-options', hidden: true, innerHTML: '' };
  const input = {
    value: 'dell',
    dataset: {},
    setAttribute: (k, v) => (attrs[k] = v),
    removeAttribute: (k) => delete attrs[k],
    matches: () => true
  };
  const picker = {
    querySelector: (s) =>
      s === '[name="prod"]' ? selected : s === '[role="listbox"]' ? list : input
  };
  input.closest = () => picker;
  events.find((x) => x.type === 'input').fn({ target: input });
  assert.equal(selected.value, '');
  assert.ok(list.innerHTML.includes('Dell Inspiron'));
  assert.ok(!list.innerHTML.includes('Lenovo'));
  assert.equal(list.hidden, false);
  c.picker = picker;
  vm.runInContext("selectProduct(picker,'Dell Inspiron 15 3530')", c);
  assert.equal(selected.value, 'Dell Inspiron 15 3530');
  assert.equal(input.value, selected.value);
  assert.equal(list.hidden, true);
});
