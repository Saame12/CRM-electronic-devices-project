// Exercise server pagination with 100 surveys in an owned, disposable database.
const assert = require('node:assert/strict'),
  crypto = require('node:crypto'),
  mysql = require('mysql2/promise'),
  net = require('node:net');
const { spawn } = require('node:child_process');
const { setupDatabase, connectionOptions } = require('./setup-database');
const { seedCurrentDemo } = require('./current-demo');
const name = 'crm_workspace_qa_' + crypto.randomBytes(8).toString('hex');
let owner,
  c,
  child,
  owned = false;
async function main() {
  owner = await mysql.createConnection({ ...connectionOptions(), multipleStatements: false });
  await owner.query('CREATE DATABASE `' + name + '` CHARACTER SET utf8mb4');
  owned = true;
  c = await setupDatabase(name);
  await seedCurrentDemo(c);
  await c.query('UPDATE surveys SET is_hidden=FALSE,hidden_at=NULL');
  const [[manager]] = await c.query("SELECT id FROM users WHERE role='MANAGER' LIMIT 1");
  const [groups] = await c.query('SELECT status,COUNT(*) n FROM surveys GROUP BY status');
  const needs = { OPEN: 25, CLOSED: 25, DRAFT: 50 };
  for (const g of groups) needs[g.status] -= Number(g.n);
  let index = 0;
  while (Object.values(needs).some((n) => n > 0))
    for (const status of ['OPEN', 'CLOSED', 'DRAFT'])
      if (needs[status] > 0) {
        const id = crypto.randomUUID();
        needs[status]--;
        index++;
        await c.execute(
          "INSERT INTO surveys(id,title,description,status,due_date,created_by,audience_config,created_at) VALUES (?,?,?,?,'2099-12-31',?,?,DATE_SUB(NOW(),INTERVAL ? MINUTE))",
          [
            id,
            'Khảo sát quy mô doanh nghiệp ' + String(index).padStart(3, '0'),
            'Dữ liệu kiểm thử cách ly · Không phải dữ liệu đang sử dụng.',
            status,
            manager.id,
            JSON.stringify({ mode: 'ALL', filters: {}, customerIds: [] }),
            index
          ]
        );
        await c.execute(
          "INSERT INTO survey_questions(id,survey_id,question_text,question_type,is_required,display_order) VALUES (?,?,?,'TEXT',TRUE,1)",
          [crypto.randomUUID(), id, 'Bạn góp ý gì cho dịch vụ?']
        );
      }
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
  child.stderr.on('data', (x) => (startup += x));
  child.stdout.on('data', (x) => (startup += x));
  const base = 'http://127.0.0.1:' + port;
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
  assert.ok(ready, 'Isolated server did not start: ' + startup.slice(-300));
  const login = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'manager@demo.vn',
      password: 'Manager@123',
      staffPortal: 'MANAGER'
    })
  });
  assert.equal(login.status, 200);
  const { token } = await login.json();
  let checks = 0;
  async function get(query, expected = 200) {
    const r = await fetch(base + '/api/admin/surveys?' + new URLSearchParams(query), {
      headers: { Authorization: 'Bearer ' + token }
    });
    assert.equal(r.status, expected);
    checks++;
    return r.json();
  }
  const ids = [];
  for (let page = 1; page <= 5; page++) {
    const d = await get({ page, pageSize: 20 });
    assert.equal(d.surveys.length, 20);
    assert.equal(d.pagination.total, 100);
    assert.deepEqual(d.pagination.counts, { ALL: 100, DRAFT: 50, OPEN: 25, CLOSED: 25 });
    ids.push(...d.surveys.map((s) => s.id));
    checks++;
  }
  assert.equal(new Set(ids).size, 100);
  checks++;
  for (const [status, total] of Object.entries({ OPEN: 25, CLOSED: 25, DRAFT: 50 })) {
    const d = await get({ page: 999, pageSize: 20, status });
    assert.equal(d.pagination.total, total);
    assert.equal(d.pagination.page, Math.ceil(total / 20));
    assert.ok(d.surveys.every((s) => s.status === status));
    checks++;
  }
  const empty = await get({ page: 999, pageSize: 20, q: '__no_matches__' });
  assert.equal(empty.pagination.page, 1);
  assert.equal(empty.pagination.total, 0);
  assert.equal(empty.surveys.length, 0);
  checks++;
  const search = await get({ page: 1, pageSize: 10, q: 'quy mô doanh nghiệp' });
  assert.equal(search.pagination.total, 84);
  assert.equal(search.surveys.length, 10);
  checks++;
  await get({ page: '1;DROP TABLE surveys' }, 400);
  await get({ page: 1, pageSize: 2000 }, 400);
  await get({ page: 1, status: 'broken' }, 400);
  const legacy = await get({});
  assert.equal(legacy.surveys.length, 100);
  checks++;
  const [dated] = await c.query(
    "SELECT id FROM surveys WHERE title LIKE 'Khảo sát quy mô doanh nghiệp %' ORDER BY title LIMIT 3"
  );
  for (let i = 0; i < dated.length; i++)
    await c.execute('UPDATE surveys SET created_at=?,due_date=? WHERE id=?', [
      i === 0 ? '2035-01-01 00:00:00' : i === 1 ? '2035-01-01 23:59:59' : '2035-01-02 00:00:00',
      i < 2 ? '2080-01-01' : '2080-01-02',
      dated[i].id
    ]);
  for (const query of [
    { dateField: 'created', from: '2035-01-01', to: '2035-01-01' },
    { dateField: 'due', from: '2080-01-01', to: '2080-01-01' }
  ]) {
    const result = await get({ page: 1, ...query });
    assert.equal(result.pagination.total, 2);
    assert.equal(result.pagination.counts.ALL, 2);
    assert.equal(result.surveys.length, 2);
    assert.ok(result.surveys.every((s) => dated.slice(0, 2).some((d) => d.id === s.id)));
    checks++;
    const all = await get(query);
    assert.equal(all.surveys.length, 2);
    checks++;
  }
  await get({ page: 1, from: '2026-11-08', to: '2026-11-07' }, 400);
  await get({ page: 1, from: '2026-02-30' }, 400);
  console.log(
    'PASS ' +
      checks +
      ' HTTP/MySQL checks: 100 surveys, 25 OPEN/25 CLOSED/50 DRAFT, stable pages, filters, empty pages, invalid inputs, backwards compatibility.'
  );
  if (process.argv.includes('--serve')) {
    console.log('UI preview: ' + base + '/manager.html');
    await new Promise((resolve) => {
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (s) => {
        if (s.includes('stop')) resolve();
      });
      process.on('SIGINT', resolve);
      process.on('SIGTERM', resolve);
    });
  }
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
        assert.match(name, /^crm_workspace_qa_[a-f0-9]{16}$/);
        await owner.query('DROP DATABASE `' + name + '`');
      }
      await owner.end();
    }
    console.log('Isolated workspace test database cleaned.');
    process.stdin.pause();
  });
