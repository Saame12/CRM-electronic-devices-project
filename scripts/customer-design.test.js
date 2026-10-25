const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function viewContext() {
  const nodes = new Map();
  const context = vm.createContext({
    document: {
      addEventListener() {},
      querySelector: (selector) => {
        if (!nodes.has(selector))
          nodes.set(selector, { innerHTML: '', classList: { add() {}, remove() {} } });
        return nodes.get(selector);
      }
    },
    localStorage: { getItem: () => null },
    sessionStorage: { getItem: () => null },
    setTimeout,
    clearTimeout
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'birth-date.js'), 'utf8'), context);
  const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  vm.runInContext(source.slice(0, source.indexOf('// Khởi chạy render lần đầu tiên')), context);
  vm.runInContext(
    `
    me = {name:'Khách <script>',email:'test@example.invalid',need:'Gaming'};
    DONE[me.email] = {answered:'24/10/2026'};
    FB[me.email] = [{title:'Góp ý',prod:'PC',type:'Câu hỏi',date:'24/10/2026',rate:4,body:'Nội dung'}];
    SV = [
      {id:'open',title:'Mới <img>',desc:'Nội dung <script>',qs:[],dueDate:'2099-01-01'},
      {id:'answered',title:'Đã gửi',desc:'',qs:[],dueDate:'2099-01-01'},
      {id:'expired',title:'Quá hạn',desc:'',qs:[],isExpired:true}
    ];
  `,
    context
  );
  return (expression) => vm.runInContext(expression, context);
}

test('Customer dashboard counts actual submissions separately from unanswered expired surveys', () => {
  const run = viewContext();
  const html = run('customerWelcome()');
  for (const label of ['Khảo sát đang chờ', 'Khảo sát đã gửi', 'Phản hồi đã gửi']) {
    assert.ok(html.includes(`<strong>1</strong><span>${label}</span>`));
  }
  assert.ok(html.includes('Khách &lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
});

test('Redesigned survey cards retain start, hide and restore actions and escape content', () => {
  const run = viewContext();
  const html = run('svList()');
  assert.equal((html.match(/data-act="start"/g) || []).length, 1);
  assert.equal((html.match(/data-act="hide-survey"/g) || []).length, 2);
  assert.ok(html.includes('Mới &lt;img&gt;'));
  assert.ok(html.includes('Nội dung &lt;script&gt;'));
  assert.ok(html.includes('Quá hạn chưa trả lời'));
  assert.ok(html.includes('data-act="toggle-hidden-surveys"'));
  assert.ok(run('showHiddenSurveys=true;svList()').includes('Không có khảo sát đã ẩn.'));
});

test('Customer onboarding stays gated while profile entry is only in the header', () => {
  const run = viewContext();
  const html = run('main()');
  assert.ok(html.includes('aria-label="Điều hướng khách hàng"'));
  assert.ok(html.includes('data-v="fb"'));
  assert.ok(!html.includes('data-act="profile"'));
  assert.ok(!html.includes('HỒ SƠ CỦA BẠN'));
  assert.ok(!html.includes('customer-aside'));
  run('render()');
  const header = run("document.querySelector('#who').innerHTML");
  assert.equal((header.match(/data-act="profile"/g) || []).length, 1);
  assert.ok(header.includes('profile-chevron'));
  const gated = run('onboarding=true;main()');
  assert.ok(gated.includes('id="prof"'));
  assert.ok(!gated.includes('Điều hướng khách hàng'));
  assert.ok(!gated.includes('data-act="start"'));
});

test('Profile form groups basic information and needs without a repeated page heading', () => {
  const html = viewContext()('profView()');
  assert.equal((html.match(/<h1/g) || []).length, 0);
  assert.ok(html.includes('<legend>Thông tin cơ bản</legend>'));
  assert.ok(html.includes('<legend>Nhu cầu sử dụng</legend>'));
  assert.ok(html.includes('name="need"'));
  assert.ok(html.includes('Lưu thay đổi'));
});

test('Security is collapsed normally but opens to show a newly issued code once', () => {
  const run = viewContext();
  run(fs.readFileSync(path.join(__dirname, '..', 'recovery-client.js'), 'utf8'));
  const collapsed = run('recoveryCodePanel()');
  assert.ok(collapsed.startsWith('<details'));
  assert.ok(!/<details[^>]* open/.test(collapsed));
  assert.ok(collapsed.includes('Bảo mật tài khoản'));
  const issued = run(
    "me.id='test';setInitialRecoveryCode('NEW-TEST-CODE','test');recoveryCodePanel()"
  );
  assert.ok(/<details[^>]* open/.test(issued));
  assert.ok(issued.includes('NEW-TEST-CODE'));
  assert.ok(!run("me.id='other';recoveryCodePanel()").includes('NEW-TEST-CODE'));
});

test('Customer authentication preserves password visibility, birth date, remember login and recovery insertion anchor', () => {
  const run = viewContext();
  const login = run('auth()');
  assert.ok(login.includes('class="auth-layout"'));
  assert.ok(login.includes('name="remember"'));
  assert.ok(login.includes('data-customer-password-toggle'));
  assert.ok(login.includes('<button class="btn pri full">Đăng nhập</button>'));
  const registration = run('authTab="reg";auth()');
  assert.ok(registration.includes('placeholder="dd/mm/yyyy"'));
  assert.ok(registration.includes('name="gender"'));
  assert.equal((registration.match(/data-customer-password-toggle/g) || []).length, 2);
});
