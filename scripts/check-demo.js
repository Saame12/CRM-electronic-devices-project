// Read-only HTTP checks against a running local demo server. No business data is modified.
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { loadDemoEnv } = require('./demo-env');
async function main() {
  loadDemoEnv();
  const base = new URL(process.argv[2] || 'http://127.0.0.1:3000');
  if (
    !['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname) ||
    base.protocol !== 'http:' ||
    base.username ||
    base.password
  )
    throw Error('Chỉ kiểm tra HTTP demo trên máy cục bộ.');
  const request = async (path, { body, session, status = 200 } = {}) => {
    const headers = { 'Content-Type': 'application/json' };
    if (session?.token) headers.Authorization = 'Bearer ' + session.token;
    if (session?.cookie) headers.Cookie = session.cookie;
    const response = await fetch(new URL(path, base), {
      method: body ? 'POST' : 'GET',
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    assert.equal(response.status, status, path);
    const data = await response.json();
    const cookie = response.headers.get('set-cookie');
    if (cookie) data.cookie = cookie.split(';')[0];
    return data;
  };
  const admin = await request('/api/auth/login', {
    body: { email: 'admin@backline.vn', password: 'Admin@123', staffPortal: 'ADMIN' }
  });
  // A unique demo JWT secret prevents accidentally running assertions against the main backend.
  jwt.verify(admin.token, process.env.JWT_SECRET);
  assert.equal(admin.user.role, 'ADMIN');
  assert.equal(admin.user.name, 'Quản trị viên Demo');
  const accounts = await request('/api/admin/accounts', { session: admin });
  assert.equal(accounts.accounts.length, 15);
  const manager = await request('/api/auth/login', {
    body: { email: 'manager@demo.vn', password: 'Manager@123', staffPortal: 'MANAGER' }
  });
  const customer = await request('/api/auth/login', {
    body: { email: 'khach@demo.vn', password: '123456', customerSession: true, remember: true }
  });
  assert.ok(customer.cookie);
  assert.ok(customer.user.birthDate);
  assert.notEqual(customer.user.need, 'Chưa xác định');
  const surveys = await request('/api/surveys', { session: customer });
  assert.equal(surveys.surveys.length, 3);
  assert.ok(surveys.surveys.some((s) => s.isExpired));
  assert.ok(surveys.surveys.some((s) => !s.isExpired && s.title === 'Mức độ hài lòng về dịch vụ'));
  const status = await request('/api/survey-status', { session: customer });
  const answered = surveys.surveys.find((s) => s.title === 'Nhu cầu mua sắm PC và laptop');
  assert.ok(status.completed[answered.id]);
  const feedback = await request('/api/feedback', { session: customer });
  assert.equal(feedback.feedback.length, 3);
  const customers = await request('/api/admin/customers', { session: manager });
  assert.equal(customers.customers.length, 12);
  const overview = await request('/api/admin/reports/overview', { session: manager });
  assert.equal(overview.customers.total, 12);
  assert.equal(overview.feedback.total, 36);
  assert.equal(overview.surveys.total, 6);
  assert.equal(overview.surveys.responses, 17);
  assert.ok(overview.feedback.hidden > 0);
  assert.ok(
    overview.surveys.items.every((s) => s.completionRate === null || s.completionRate <= 100)
  );
  const closed = overview.surveys.items.find((s) => s.title === 'Trải nghiệm bảo hành và hỗ trợ');
  const detail = await request('/api/admin/reports/survey-detail/' + closed.id, {
    session: manager
  });
  assert.equal(detail.responses.length, 8);
  assert.ok(detail.questions.length);
  const history = await request('/api/admin/password-recovery', { session: admin });
  assert.equal(history.requests.length, 2);
  assert.ok(history.unread > 0);
  await request('/api/admin/accounts', { session: manager, status: 403 });
  await request('/api/admin/dashboard', { session: admin, status: 403 });
  await request('/api/auth/login', {
    body: { email: 'admin@backline.vn', password: 'Admin@123', staffPortal: 'MANAGER' },
    status: 403
  });
  await request('/api/auth/login', {
    body: { email: 'khach11@demo.vn', password: '123456', customerSession: true },
    status: 403
  });
  console.log(
    'Demo HTTP passed: three-role login, cookie, surveys, feedback, report totals/details and role isolation. No business data changed.'
  );
}
if (require.main === module)
  main().catch((error) => {
    console.error('Demo HTTP failed: ' + error.message);
    process.exitCode = 1;
  });
module.exports = { main };
