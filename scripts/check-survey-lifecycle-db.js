// Full HTTP checks on a disposable database; never alters the active dataset.
const assert = require('node:assert/strict'),
  crypto = require('node:crypto'),
  net = require('node:net');
const { spawn } = require('node:child_process'),
  mysql = require('mysql2/promise'),
  bcrypt = require('bcryptjs');
const { setupDatabase, connectionOptions } = require('./setup-database'),
  { seedDemo } = require('./seed-demo');
const Domain = require('../crm-domain');
const name = 'crm_lifecycle_qa_' + crypto.randomBytes(8).toString('hex');
let owner,
  c,
  child,
  owned = false,
  checks = 0;
async function main() {
  owner = await mysql.createConnection({ ...connectionOptions(), multipleStatements: false });
  await owner.query('CREATE DATABASE `' + name + '` CHARACTER SET utf8mb4');
  owned = true;
  c = await setupDatabase(name);
  await seedDemo(c, { hash: (p) => bcrypt.hash(p, 4) });
  const listener = net.createServer();
  await new Promise((r) => listener.listen(0, '127.0.0.1', r));
  const port = listener.address().port;
  await new Promise((r) => listener.close(r));
  child = spawn(process.execPath, ['server.mysql.js'], {
    cwd: require('node:path').resolve(__dirname, '..'),
    env: {
      ...process.env,
      DB_NAME: name,
      PORT: String(port),
      JWT_SECRET: crypto.randomBytes(32).toString('hex')
    },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let startup = '';
  child.stderr.on('data', (b) => (startup += b));
  child.stdout.on('data', (b) => (startup += b));
  const base = 'http://127.0.0.1:' + port;
  async function req(path, body, token, status = 200, method) {
    const r = await fetch(base + path, {
      method: method || (body ? 'POST' : 'GET'),
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10000)
    });
    const data = await r.json();
    assert.equal(r.status, status, path + ': ' + (data.error || ''));
    checks++;
    return data;
  }
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base + '/api/health')).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  assert.ok(ready, 'Isolated server startup failed: ' + startup.slice(-500));
  const login = (email, password, staffPortal) =>
    req('/api/auth/login', { email, password, ...(staffPortal ? { staffPortal } : {}) });
  const manager = await login('manager@demo.vn', 'Manager@123', 'MANAGER'),
    admin = await login('admin@backline.vn', 'Admin@123', 'ADMIN'),
    customer = await login('khach@demo.vn', '123456');
  const today = Domain.today(),
    later = (days) => {
      const d = new Date(today + 'T00:00:00Z');
      d.setUTCDate(d.getUTCDate() + days);
      return d.toISOString().slice(0, 10);
    };
  const baseBody = {
    title: 'Lifecycle QA',
    description: 'Isolated workflow',
    status: 'OPEN',
    endMode: 'DATE',
    dueDate: later(1),
    audience: { mode: 'ALL' },
    questions: [{ text: 'Ý kiến', type: 'TEXT', required: true }]
  };
  // Both Admin creation paths, strict calendar dates, full profile, and public enrollment.
  const accountBody = {
    role: 'CUSTOMER', name: 'Khách do Admin tạo', email: 'admin-createdAccount@example.invalid',
    phone: '0897777701', password: 'Initial@123', addr: 'Hà Nội',
    birthDateText: '29/02/2000', gender: 'Nữ', need: 'Gaming', interests: ['gaming', 'learning']
  };
  for (const birthDateText of ['31/02/2000', '29/02/2001', '2000-02-29', '01/01/2999', ''])
    await req('/api/admin/accounts', { ...accountBody, birthDateText }, admin.token, 400);
  await req('/api/admin/accounts', { ...accountBody, addr: '' }, admin.token, 400);

  await req('/api/admin/accounts', { ...accountBody, role: 'ADMIN' }, admin.token, 400);
  await req('/api/admin/accounts', accountBody, manager.token, 403);
  const enrollmentSurvey = await req('/api/admin/surveys', baseBody, manager.token, 201);
  await req('/api/admin/accounts', accountBody, admin.token, 201);
  await req('/api/admin/accounts', accountBody, admin.token, 409);
  const [[createdAccount]] = await c.execute('SELECT * FROM users WHERE email=?', [accountBody.email]);
  assert.equal(createdAccount.full_name, accountBody.name);
  assert.equal(createdAccount.address, accountBody.addr);
  assert.equal(createdAccount.need, 'Chưa xác định');
  assert.equal(createdAccount.gender, accountBody.gender);
  assert.equal(require('../birth-date').fromDatabase(createdAccount.birth_date), '2000-02-29');
  assert.ok(await bcrypt.compare(accountBody.password, createdAccount.password_hash));
  const [interests] = await c.execute('SELECT interest_id FROM customer_interests WHERE customer_id=?', [createdAccount.id]);
  assert.deepEqual(interests, []);
  const [[enrolled]] = await c.execute('SELECT COUNT(*) n FROM survey_recipients WHERE survey_id=? AND customer_id=?', [enrollmentSurvey.id, createdAccount.id]);
  assert.equal(enrolled.n, 1);
  checks += 8;
  const customerLogin = await login(accountBody.email, accountBody.password);
  await req('/api/admin/customers/' + createdAccount.id, {}, manager.token, 409, 'DELETE');
  await req('/api/admin/accounts/' + createdAccount.id, {}, admin.token, 200, 'DELETE');
  await req('/api/me', null, customerLogin.token, 401);
  await req('/api/admin/accounts', {
    role: 'MANAGER', name: 'Quản lý mới', email: 'new-manager@example.invalid',
    phone: '0897777702', password: 'Manager@123'
  }, admin.token, 201);
  const newManager = await login('new-manager@example.invalid', 'Manager@123', 'MANAGER');
  assert.equal(newManager.user.role, 'MANAGER'); checks++;
  const managerCustomerBody = { name: 'Ngày sinh nhập tay', email: 'manager-dob@example.invalid', phone: '0897777703', password: 'Initial@123', birthDateText: '29/02/2000' };
  for (const birthDateText of ['31/02/2000', '29/02/2001', '2000-02-29', '01/01/2999'])
    await req('/api/admin/customers', { ...managerCustomerBody, birthDateText }, manager.token, 400);
  const managerCreatedCustomer = await req('/api/admin/customers', managerCustomerBody, manager.token, 201);
  const details = await req('/api/admin/customers/' + managerCreatedCustomer.id, null, manager.token);
  assert.equal(details.customer.birthDate, '2000-02-29'); checks++;
  await req('/api/admin/surveys', { ...baseBody, dueDate: '' }, manager.token, 400);
  await req('/api/admin/surveys', { ...baseBody, endMode: undefined }, manager.token, 400);
  await req('/api/admin/surveys', { ...baseBody, endMode: '' }, manager.token, 400);
  const draft = await req(
    '/api/admin/surveys',
    { ...baseBody, status: 'DRAFT' },
    manager.token,
    201
  );
  await req(
    '/api/admin/surveys/' + draft.id,
    { ...baseBody, status: 'DRAFT', endMode: undefined },
    manager.token,
    400,
    'PATCH'
  );
  await req(
    '/api/admin/surveys/' + draft.id,
    { ...baseBody, status: 'DRAFT', endMode: 'MANUAL', dueDate: '' },
    manager.token,
    200,
    'PATCH'
  );
  await req('/api/admin/surveys', { ...baseBody, endMode: 'MANUAL' }, manager.token, 400);
  await req('/api/admin/surveys', { ...baseBody, dueDate: later(-1) }, manager.token, 410);
  const created = await req('/api/admin/surveys', baseBody, manager.token, 201),
    id = created.id,
    path = '/api/admin/surveys/' + id;
  const change = (body, status = 200, token = manager.token) =>
    req(path + '/lifecycle', body, token, status);
  await change({ action: 'EXTEND', endMode: 'DATE', dueDate: later(2) }, 403, customer.token);
  await change({ action: 'EXTEND', endMode: 'DATE', dueDate: later(2) }, 403, admin.token);
  await req(path + '/lifecycle', null, customer.token, 403);
  await change({ action: 'REOPEN', endMode: 'DATE', dueDate: later(2) }, 409);
  await change({ action: 'EXTEND', endMode: 'DATE', dueDate: later(1) }, 400);
  await change({ action: 'EXTEND', endMode: 'DATE', dueDate: later(-1) }, 400);
  await change({ action: 'EXTEND', endMode: 'DATE', dueDate: later(2) });
  let detail = await req(path, null, manager.token);
  const q = detail.questions[0].id;
  await req(
    '/api/surveys/' + id + '/responses',
    { answers: { q0: 'Giữ nguyên câu trả lời' } },
    customer.token,
    201
  );
  const [[before]] = await c.execute('SELECT COUNT(*) n FROM survey_recipients WHERE survey_id=?', [
    id
  ]);
  await req(path + '/close', {}, manager.token);
  await change({ action: 'REOPEN', endMode: 'DATE', dueDate: later(-1) }, 400);
  await c.query(
    "INSERT INTO users(id,full_name,email,phone,password_hash,role,account_status) SELECT 'lifecycle-new','Khách mới','lifecycle.new@example.invalid','0909988776',password_hash,'CUSTOMER','ACTIVE' FROM users WHERE id=?",
    [customer.user.id]
  );
  await change({ action: 'REOPEN', endMode: 'DATE', dueDate: today });
  await change({ action: 'REOPEN', endMode: 'MANUAL' }, 409);
  const [[after]] = await c.execute('SELECT COUNT(*) n FROM survey_recipients WHERE survey_id=?', [
    id
  ]);
  assert.equal(after.n, before.n + 1);
  checks++;
  await req(
    '/api/surveys/' + id + '/responses',
    { answers: { q0: 'Không được gửi lại' } },
    customer.token,
    409
  );
  const own = await req('/api/surveys/' + id + '/my-response', null, customer.token);
  assert.ok(JSON.stringify(own).includes('Giữ nguyên câu trả lời'));
  checks++;
  detail = await req(path, null, manager.token);
  assert.equal(detail.questions[0].id, q);
  checks++;
  await change({ action: 'EXTEND', endMode: 'MANUAL' });
  detail = await req(path, null, manager.token);
  assert.equal(detail.survey.due_date, null);
  checks++;
  await req(path + '/close', {}, manager.token);
  await change({ action: 'REOPEN', endMode: 'MANUAL' });
  let history = await req(path + '/lifecycle', null, manager.token);
  assert.ok(history.history.some((h) => h.action === 'REOPEN'));
  assert.ok(history.history.some((h) => h.action === 'CLOSE'));
  assert.ok(history.history.some((h) => h.action === 'EXTEND'));
  assert.ok(history.history.every((h) => h.actor === manager.user.name));
  checks++;
  await req(path + '/visibility', { hidden: true }, manager.token, 200, 'PATCH');
  await req(path + '/close', {}, manager.token);
  await change({ action: 'REOPEN', endMode: 'DATE', dueDate: later(3) });
  detail = await req(path, null, manager.token);
  assert.equal(Number(detail.survey.is_hidden), 1);
  checks++;
  for (const audience of [
    { mode: 'SELECTED', customerIds: [customer.user.id] },
    { mode: 'FILTER', filters: { need: customer.user.need } }
  ]) {
    const s = await req('/api/admin/surveys', { ...baseBody, audience }, manager.token, 201),
      p = '/api/admin/surveys/' + s.id;
    const [old] = await c.execute(
      'SELECT customer_id FROM survey_recipients WHERE survey_id=? ORDER BY customer_id',
      [s.id]
    );
    await req(p + '/close', {}, manager.token);
    await req(
      p + '/lifecycle',
      { action: 'REOPEN', endMode: 'DATE', dueDate: later(3) },
      manager.token
    );
    const [current] = await c.execute(
      'SELECT customer_id FROM survey_recipients WHERE survey_id=? ORDER BY customer_id',
      [s.id]
    );
    assert.deepEqual(current, old);
    checks++;
  }
  const [[counts]] = await c.execute('SELECT COUNT(*) n FROM survey_responses WHERE survey_id=?', [
    id
  ]);
  assert.equal(counts.n, 1);
  checks++;
  // Updated feedback workflow: ownership, revision conflicts and reply removal.
  const [{ name: productName }] = (
    await c.query('SELECT name FROM products ORDER BY name LIMIT 1')
  )[0];
  const feedbackBody = {
    prod: productName,
    type: 'Góp ý',
    rate: 4,
    title: 'Kiểm thử phản hồi',
    body: 'Nội dung ban đầu'
  };
  await req('/api/feedback', feedbackBody, manager.token, 403);
  const sent = await req('/api/feedback', feedbackBody, customer.token, 201),
    fid = sent.feedback.id;
  const fpath = '/api/feedback/' + fid,
    replyPath = '/api/admin/feedback/' + fid;
  const other = await login('khach2@demo.vn', '123456');
  await req(fpath, { ...feedbackBody, revision: 0 }, other.token, 404, 'PATCH');
  await req(fpath, {}, other.token, 404, 'DELETE');
  await req(replyPath, { reply: 'Đã tiếp nhận góp ý.', revision: 0 }, manager.token, 200, 'PATCH');
  let [[frow]] = await c.execute('SELECT * FROM feedback WHERE id=?', [fid]);
  assert.equal(frow.status, 'RESOLVED');
  assert.equal(frow.revision, 1);
  checks++;
  await req(replyPath, { reply: 'Trả lời lần hai', revision: 1 }, manager.token, 409, 'PATCH');
  await req(
    fpath,
    { ...feedbackBody, body: 'Nội dung sửa', revision: 0 },
    customer.token,
    409,
    'PATCH'
  );
  await req(
    '/api/admin/feedback/' + fid + '/visibility',
    { hidden: true },
    manager.token,
    200,
    'PATCH'
  );
  await req(
    fpath,
    { ...feedbackBody, body: 'Nội dung sửa', revision: 1 },
    customer.token,
    200,
    'PATCH'
  );
  [[frow]] = await c.execute('SELECT * FROM feedback WHERE id=?', [fid]);
  assert.equal(frow.status, 'NEW');
  assert.equal(frow.reply_content, null);
  assert.equal(frow.replied_by, null);
  assert.equal(frow.replied_at, null);
  assert.equal(Number(frow.is_hidden), 0);
  assert.equal(frow.revision, 2);
  checks++;
  await req(
    replyPath,
    { reply: 'Trả lời cho nội dung cũ', revision: 1 },
    manager.token,
    409,
    'PATCH'
  );
  await req(
    replyPath,
    { reply: 'Đã giải quyết nội dung mới', revision: 2 },
    manager.token,
    200,
    'PATCH'
  );
  await req(replyPath, { reply: 'Nội dung đã chỉnh sửa', revision: 3, editReply: true }, customer.token, 403, 'PATCH');
  await req(replyPath, { reply: ' ', revision: 3, editReply: true }, manager.token, 400, 'PATCH');
  await req(replyPath, { reply: 'Nội dung đã chỉnh sửa', revision: 3, editReply: true }, manager.token, 200, 'PATCH');
  [[frow]] = await c.execute('SELECT * FROM feedback WHERE id=?', [fid]);
  assert.equal(frow.reply_content, 'Nội dung đã chỉnh sửa');
  assert.equal(frow.status, 'RESOLVED');
  assert.equal(frow.revision, 4); checks += 3;
  await req(replyPath, { reply: 'Bản cũ', revision: 3, editReply: true }, manager.token, 409, 'PATCH');
  await req(fpath, {}, customer.token, 200, 'DELETE');
  const [[gone]] = await c.execute('SELECT COUNT(*) n FROM feedback WHERE id=?', [fid]);
  assert.equal(gone.n, 0);
  checks++;
  await req(fpath, {}, customer.token, 404, 'DELETE');
  // Draft deletion and emergency lock enforce state and protect submitted data.
  await req(path + '/emergency-lock', {}, manager.token, 409);
  await req(path, {}, manager.token, 409, 'DELETE');
  const fresh = await req(
      '/api/admin/surveys',
      { ...baseBody, title: 'Khóa khẩn cấp' },
      manager.token,
      201
    ),
    freshPath = '/api/admin/surveys/' + fresh.id;
  await req(freshPath + '/emergency-lock', {}, customer.token, 403);
  await req(freshPath, { status: 'DRAFT' }, manager.token, 409, 'PATCH');
  await req(freshPath + '/emergency-lock', {}, manager.token);
  const locked = await req(freshPath, null, manager.token);
  assert.equal(locked.survey.status, 'DRAFT');
  assert.equal(locked.survey.due_date, baseBody.dueDate);
  assert.equal(locked.survey.audience_config.mode, 'ALL');
  checks++;
  const noLongerOpen = await req('/api/surveys', null, customer.token);
  assert.ok(!noLongerOpen.surveys.some((s) => s.id === fresh.id));
  checks++;
  await req(freshPath, {}, manager.token, 200, 'DELETE');
  await req(freshPath, null, manager.token, 404);
  for (const table of [
    'surveys',
    'survey_questions',
    'survey_recipients',
    'survey_lifecycle_history'
  ]) {
    const [[n]] = await c.execute(
      'SELECT COUNT(*) n FROM ' +
        table +
        ' WHERE ' +
        (table === 'surveys' ? 'id' : 'survey_id') +
        '=?',
      [fresh.id]
    );
    assert.equal(n.n, 0);
    checks++;
  }
  const stats = await req('/api/admin/reports/survey-detail/' + id, null, manager.token);
  assert.equal(stats.responses.length, 1);
  assert.equal(stats.questions[0].answered, 1);
  assert.equal(stats.questions[0].skipped, 0);
  checks++;
  // Erasure keeps analytics and business history, removes contact/auth/recovery.
  for (const config of [
    { endMode: 'MANUAL', dueDate: '', audience: { mode: 'ALL' } },
    {
      endMode: 'DATE',
      dueDate: later(2),
      audience: { mode: 'SELECTED', customerIds: [customer.user.id] }
    },
    {
      endMode: 'DATE',
      dueDate: later(2),
      audience: { mode: 'FILTER', filters: { need: customer.user.need } }
    }
  ]) {
    const body = { ...baseBody, ...config, title: 'Giữ cấu hình sau khóa khẩn cấp' };
    const created = await req('/api/admin/surveys', body, manager.token, 201),
      p = '/api/admin/surveys/' + created.id;
    const before = await req(p, null, manager.token);
    await req(p + '/emergency-lock', {}, manager.token);
    const after = await req(p, null, manager.token);
    assert.equal(after.survey.due_date, before.survey.due_date);
    assert.deepEqual(after.survey.audience_config, before.survey.audience_config);
    assert.deepEqual(after.questions, before.questions);
    checks++;
    await req(p, { ...body, status: 'DRAFT' }, manager.token, 200, 'PATCH');
    const saved = await req(p, null, manager.token);
    assert.equal(saved.survey.due_date, before.survey.due_date);
    assert.deepEqual(saved.survey.audience_config, before.survey.audience_config);
    checks++;
    await req(
      p,
      { ...body, status: 'DRAFT', endMode: 'DATE', dueDate: later(5) },
      manager.token,
      200,
      'PATCH'
    );
    assert.equal((await req(p, null, manager.token)).survey.due_date, later(5));
    checks++;
    await req(
      p,
      { ...body, status: 'DRAFT', endMode: 'MANUAL', dueDate: '' },
      manager.token,
      200,
      'PATCH'
    );
    const manual = await req(p, null, manager.token);
    assert.equal(manual.survey.due_date, null);
    assert.deepEqual(manual.survey.audience_config, before.survey.audience_config);
    checks++;
  }
  const target = customer.user.id,
    [[profile]] = await c.execute('SELECT * FROM users WHERE id=?', [target]);
  const [[archivedFeedback]] = await c.execute('SELECT id,revision FROM feedback WHERE customer_id=? LIMIT 1', [target]);
  const snapshot = async () => {
    const result = {};
    for (const table of [
      'feedback',
      'survey_responses',
      'survey_recipients',
      'customer_interests'
    ]) {
      const [[n]] = await c.execute('SELECT COUNT(*) n FROM ' + table + ' WHERE customer_id=?', [
        target
      ]);
      result[table] = n.n;
    }
    return result;
  };
  const beforeErase = await snapshot();
  await c.execute('INSERT INTO customer_recovery_codes(customer_id,code_hash) VALUES (?,?)', [
    target,
    crypto.randomBytes(32).toString('hex')
  ]);
  await req('/api/admin/customers/' + target, {}, manager.token, 409, 'DELETE');
  await req(
    '/api/admin/customers/' + target + '/status',
    { status: 'LOCKED' },
    manager.token,
    200,
    'PATCH'
  );
  await req('/api/admin/customers/' + target, {}, manager.token, 200, 'DELETE');
  const remainingAccounts = await req('/api/admin/accounts', null, admin.token);
  assert.ok(!remainingAccounts.accounts.some(x => x.id === target)); checks++;
  for (const query of ['', '?status=LOCKED', '?q=' + encodeURIComponent(profile.full_name)]) {
    const remainingCustomers = await req('/api/admin/customers' + query, null, manager.token);
    assert.ok(!remainingCustomers.customers.some(x => x.id === target)); checks++;
  }
  await req('/api/admin/customers/' + target, null, manager.token, 404);
  await req('/api/admin/customers/' + target + '/history', null, manager.token, 404);
  for (const hidden of ['false', 'true']) {
    const remainingFeedback = await req('/api/admin/feedback?hidden=' + hidden, null, manager.token);
    assert.ok(!remainingFeedback.feedback.some(x => x.customer_id === target)); checks++;
  }
  assert.ok(archivedFeedback, 'Fixture has archived feedback to test direct mutation rejection');
  await req('/api/admin/feedback/' + archivedFeedback.id, { revision: archivedFeedback.revision, reply: 'Không được sửa dữ liệu đã lưu trữ', editReply: true }, manager.token, 404, 'PATCH');
  await req('/api/admin/feedback/' + archivedFeedback.id + '/visibility', { hidden: true }, manager.token, 400, 'PATCH');
  const dashboard = await req('/api/admin/dashboard', null, manager.token);
  const [[operational]] = await c.execute("SELECT COUNT(*) n FROM users WHERE role='CUSTOMER' AND erased_at IS NULL");
  assert.equal(dashboard.customers, operational.n); checks++;
  const report = await req('/api/admin/reports/overview', null, manager.token);
  const [[allCustomers]] = await c.execute("SELECT COUNT(*) n FROM users WHERE role='CUSTOMER'");
  assert.equal(report.customers.total, allCustomers.n); checks++;
  const [[erased]] = await c.execute('SELECT * FROM users WHERE id=?', [target]);
  assert.equal(erased.account_status, 'LOCKED');
  for (const key of ['email', 'phone', 'password_hash']) assert.equal(erased[key], null);
  assert.equal(erased.address, '');
  assert.ok(erased.erased_at);
  for (const key of ['full_name', 'gender', 'need']) assert.equal(erased[key], profile[key]);
  assert.equal(String(erased.birth_date), String(profile.birth_date));
  assert.deepEqual(await snapshot(), beforeErase);
  checks++;
  for (const table of ['password_recovery_requests', 'customer_recovery_codes']) {
    const [[n]] = await c.execute('SELECT COUNT(*) n FROM ' + table + ' WHERE customer_id=?', [
      target
    ]);
    assert.equal(n.n, 0);
    checks++;
  }
  await req('/api/me', null, customer.token, 401);
  await req(
    '/api/admin/customers/' + target + '/status',
    { status: 'ACTIVE' },
    manager.token,
    404,
    'PATCH'
  );
  await req('/api/admin/customers/' + target, {}, manager.token, 200, 'DELETE');
  const retained = await req('/api/admin/reports/survey-detail/' + id, null, manager.token);
  assert.equal(retained.responses[0].full_name, profile.full_name);
  assert.equal(retained.responses[0].email, null);
  checks++;
  await req('/api/admin/accounts/' + other.user.id, {}, admin.token, 200, 'DELETE');
  const [[secondErased]] = await c.execute('SELECT email,account_status FROM users WHERE id=?', [
    other.user.id
  ]);
  assert.equal(secondErased.email, null);
  assert.equal(secondErased.account_status, 'LOCKED');
  checks++;
  console.log(
    'PASS ' +
      checks +
      ' isolated HTTP/MySQL checks: modes, permissions, extension, reopen, snapshots, newcomers, immutable answers, history, hidden state.'
  );
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (child && child.exitCode === null) {
      child.kill();
      await new Promise((r) => child.once('exit', r));
    }
    if (c) await c.end();
    if (owner) {
      if (owned) {
        assert.match(name, /^crm_lifecycle_qa_[a-f0-9]{16}$/);
        await owner.query('DROP DATABASE `' + name + '`');
      }
      await owner.end();
    }
  });
