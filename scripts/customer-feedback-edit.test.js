const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

async function editor() {
  const events = [], nodes = new Map();
  const c = vm.createContext({
    document: {
      addEventListener: (type, fn) => events.push({ type, fn }),
      querySelector: s => {
        if (!nodes.has(s)) nodes.set(s, { innerHTML: '', textContent: '', classList: { add() {}, remove() {} } });
        return nodes.get(s);
      }
    },
    FormData: class { constructor(form) { return new Map(Object.entries(form.values)); } },
    sessionStorage: { getItem: () => null, removeItem() {} },
    localStorage: { getItem: () => null }, setTimeout: () => 0, clearTimeout() {}
  });
  for (const name of ['crm-domain.js', 'customer-fields.js', 'birth-date.js', 'app.js'])
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', name), 'utf8'), c);
  await new Promise(r => setImmediate(r));
  const error = { textContent: '' }, button = { disabled: false };
  const form = {
    // Reproduce a named control shadowing the native form.id property.
    id: { name: 'id' }, getAttribute: () => 'fbEdit', dataset: {},
    values: { feedbackId: 'f', revision: '2', prod: 'PC Gaming Backline G2', type: 'Góp ý', rate: '4', title: 'Sửa', body: 'Nội dung mới' },
    querySelector: s => s === '[data-form-error]' ? error : button
  };
  vm.runInContext("me={id:'customer',email:'customer@test.invalid'};feedbackEditing='f';render=()=>{};toast=()=>{}", c);
  return { c, form, error, button, submit: () => events.find(e => e.type === 'submit').fn({ target: form, preventDefault() {} }) };
}

test('Customer edit submits through the actual form dispatcher even when form.id is shadowed', async () => {
  const { c, form, submit } = await editor();
  const calls = [];
  c.record = async (url, options) => {
    calls.push({ url, options });
    return options ? {} : { feedback: [{ id: 'f', body: form.values.body, revision: 3, reply: '', status: 'NEW' }] };
  };
  vm.runInContext('api=record', c);
  const html = vm.runInContext("feedbackEditForm({id:'f',revision:2,rate:4})", c);
  assert.ok(html.includes('name="feedbackId"'));
  assert.ok(!html.includes('name="id"'));
  await submit();
  assert.equal(calls[0].url, '/api/feedback/f');
  assert.equal(calls[0].options.method, 'PATCH');
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.revision, 2);
  assert.equal(body.rate, 4);
  assert.equal(body.body, 'Nội dung mới');
  assert.equal(vm.runInContext('FB[me.email][0].body', c), 'Nội dung mới');
  assert.equal(vm.runInContext('feedbackEditing', c), null);
});

test('Customer edit shows failures inside its own form, retains entered text and permits retry without duplicate submission', async () => {
  const { c, form, error, button, submit } = await editor();
  let reject, calls = 0;
  c.record = () => { calls++; return new Promise((_, fail) => { reject = fail; }); };
  vm.runInContext('api=record', c);
  const pending = submit();
  assert.equal(button.disabled, true);
  submit();
  await new Promise(r => setImmediate(r));
  assert.equal(calls, 1);
  reject(Error('Phản hồi đã thay đổi. Hãy tải lại.'));
  await pending;
  assert.equal(error.textContent, 'Phản hồi đã thay đổi. Hãy tải lại.');
  assert.equal(form.values.body, 'Nội dung mới');
  assert.equal(button.disabled, false);
  assert.equal(vm.runInContext('feedbackEditing', c), 'f');
  form.values.body = '   ';
  await submit();
  assert.ok(error.textContent.includes('không phải khoảng trắng'));
  assert.equal(calls, 1);
});
