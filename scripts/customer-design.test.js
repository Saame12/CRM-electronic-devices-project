const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function viewContext() {
  const context = vm.createContext({
    document: { addEventListener() {}, querySelector: () => null },
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

test('Customer onboarding stays gated while normal portal keeps feedback and profile controls', () => {
  const run = viewContext();
  const html = run('main()');
  assert.ok(html.includes('aria-label="Điều hướng khách hàng"'));
  assert.ok(html.includes('data-v="fb"'));
  assert.ok(html.includes('data-act="profile"'));
  const gated = run('onboarding=true;main()');
  assert.ok(gated.includes('id="prof"'));
  assert.ok(!gated.includes('Điều hướng khách hàng'));
  assert.ok(!gated.includes('data-act="start"'));
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
