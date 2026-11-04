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
  assert.equal(accounts.accounts.length, 21);
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
  const isV3 = surveys.surveys.some(
    (s) => s.title === '[Đóng thủ công] Góp ý dịch vụ thường xuyên'
  );
  assert.equal(surveys.surveys.length, isV3 ? 10 : 6);
  assert.ok(surveys.surveys.some((s) => s.isExpired));
  assert.ok(surveys.surveys.some((s) => !s.isExpired && s.title === 'Mức độ hài lòng về dịch vụ'));
  const status = await request('/api/survey-status', { session: customer });
  const answered = surveys.surveys.find((s) => s.title === 'Nhu cầu mua sắm PC và laptop');
  assert.ok(status.completed[answered.id]);
  const feedback = await request('/api/feedback', { session: customer });
  assert.equal(feedback.feedback.length, 3);
  const customers = await request('/api/admin/customers', { session: manager });
  assert.equal(customers.customers.length, 18);
  const overview = await request('/api/admin/reports/overview', { session: manager });
  assert.equal(overview.customers.total, 18);
  assert.equal(overview.feedback.total, 54);
  assert.equal(overview.surveys.total, isV3 ? 16 : 12);
  assert.equal(overview.surveys.responses, isV3 ? 21 : 18);
  const managerSurveys = (await request('/api/admin/surveys', { session: manager })).surveys;
  const filtered = managerSurveys.find((s) => s.title === 'Khảo sát Gaming/Đồ họa 15–20 tuổi');
  assert.equal(filtered.audience_config.mode, 'FILTER');
  const candidates = await request('/api/admin/surveys/recipients-preview', {
    session: manager,
    body: { audience: filtered.audience_config }
  });
  assert.equal(candidates.count, 7);
  assert.ok(
    candidates.customers.every(
      (u) =>
        u.age >= 15 && u.age <= 20 && u.interests.some((id) => ['gaming', 'design'].includes(id))
    )
  );
  const privateSurvey = managerSurveys.find((s) => s.title === 'Khảo sát khách được chọn riêng');
  assert.equal(privateSurvey.audience_config.customerIds.length, 3);
  for (const mode of ['ALL', 'FILTER', 'SELECTED'])
    assert.ok(managerSurveys.some((s) => s.status === 'DRAFT' && s.audience_config?.mode === mode));
  assert.ok(managerSurveys.some((s) => s.status === 'DRAFT' && !s.audience_config));
  assert.equal(managerSurveys.filter((s) => s.status === 'OPEN' && !s.audience_config).length, 0);
  const lateCustomer = await request('/api/auth/login', {
    body: { email: 'khach18@demo.vn', password: '123456', customerSession: true }
  });
  const lateSurveys = (await request('/api/surveys', { session: lateCustomer })).surveys;
  assert.equal(lateSurveys.length, isV3 ? 4 : 2);
  assert.ok(lateSurveys.every((s) => s.status === 'OPEN' && !s.isExpired));
  assert.ok(!lateSurveys.some((s) => [filtered.id, privateSurvey.id].includes(s.id)));
  if (isV3) {
    const manual = managerSurveys.find(
      (s) => s.title === '[Đóng thủ công] Góp ý dịch vụ thường xuyên'
    );
    assert.equal(manual.due_date, null);
    assert.equal(manual.status, 'OPEN');
    assert.ok(managerSurveys.some((s) => s.status === 'CLOSED' && s.auto_closed_at));
    const extended = managerSurveys.find(
      (s) => s.title === '[Đã gia hạn] Góp ý nhóm Gaming và Đồ họa'
    );
    const audit = await request('/api/admin/surveys/' + extended.id + '/lifecycle', {
      session: manager
    });
    assert.ok(audit.history.some((h) => h.action === 'EXTEND'));
    const reopened = managerSurveys.find((s) => s.title === '[Đã mở lại] Đánh giá hỗ trợ sau mua');
    const reopening = await request('/api/admin/surveys/' + reopened.id + '/lifecycle', {
      session: manager
    });
    assert.ok(reopening.history.some((h) => h.action === 'REOPEN'));
  }
  assert.ok(overview.feedback.hidden > 0);
  assert.ok(
    overview.surveys.items.every((s) => s.completionRate === null || s.completionRate <= 100)
  );
  const closed = overview.surveys.items.find((s) => s.title === 'Trải nghiệm bảo hành và hỗ trợ');
  const detail = await request('/api/admin/reports/survey-detail/' + closed.id, {
    session: manager
  });
  assert.equal(detail.responses.length, 8);
  const own = await request('/api/surveys/' + closed.id + '/my-response', { session: customer });
  assert.equal(own.survey.status, 'CLOSED');
  assert.equal(own.questions.length, 2);
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
