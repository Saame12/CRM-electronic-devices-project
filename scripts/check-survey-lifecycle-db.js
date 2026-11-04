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
