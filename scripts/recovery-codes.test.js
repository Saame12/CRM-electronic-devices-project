const test = require('node:test'),
  assert = require('node:assert/strict'),
  bcrypt = require('bcryptjs'),
  vm = require('node:vm'),
  fs = require('node:fs'),
  path = require('node:path');
const codes = require('../recovery-codes'),
  recovery = require('../password-recovery');
async function environment() {
  const routes = new Map(),
    calls = [],
    state = {
      user: {
        id: 'customer',
        email: 'customer@test.invalid',
        role: 'CUSTOMER',
        account_status: 'ACTIVE',
        password_hash: await bcrypt.hash('old-password', 4)
      },
      code: null,
      requests: [],
      version: 0
    };
  async function execute(sql, v = []) {
    calls.push({ sql, v });
    if (sql.startsWith('SELECT u.id FROM users'))
      return [
        [
          ...(state.user.account_status === 'ACTIVE' &&
          state.user.email === v[0] &&
          state.code &&
          !state.code.used_at &&
          state.code.code_hash === v[1]
            ? [{ id: 'customer' }]
            : [])
        ]
      ];
    if (sql.startsWith('SELECT used_at')) return [state.code ? [state.code] : []];
    if (sql.includes('FROM users WHERE id=')) return [[state.user]];
    if (sql.startsWith('INSERT INTO customer_recovery_codes')) {
      state.code = { code_hash: v[1], used_at: null };
      return [{ affectedRows: 1 }];
    }
    if (sql.startsWith('INSERT INTO password_recovery_requests')) {
      state.requests.push({
        id: v[0],
        customer_id: v[1],
        email: v[2],
        token_hash: v[3],
        status: 'APPROVED',
        reason: v[4],
        verification_method: 'RECOVERY_CODE',
        recovery_code_hash: v[6],
        valid: 1,
        completion_seen: false
      });
      return [{ affectedRows: 1 }];
    }
    if (sql.includes('WHERE token_hash='))
      return [[...state.requests.filter((r) => r.token_hash === v[0])]];
    if (sql.startsWith('SELECT *,expires_at')) return [[state.requests.find((r) => r.id === v[0])]];
    if (sql.startsWith('SELECT code_hash')) return [state.code ? [state.code] : []];
    if (sql.startsWith('UPDATE customer_recovery_codes') && state.code) state.code.used_at = 'used';
    if (sql.startsWith('UPDATE users')) {
      state.user.password_hash = v[0];
      state.version++;
    }
    if (sql.includes("SET status='COMPLETED'"))
      state.requests.find((r) => r.id === v[0]).status = 'COMPLETED';
    if (sql.includes("SET status='CANCELLED'"))
      for (const r of state.requests)
        if (r.status === 'APPROVED' && r.id !== v[1]) r.status = 'CANCELLED';
    return [{ affectedRows: 1 }];
  }
  const db = {
    execute,
    query: async () => [[]],
    getConnection: async () => ({
      execute,
      beginTransaction: async () => calls.push({ sql: 'begin' }),
      commit: async () => calls.push({ sql: 'commit' }),
      rollback: async () => calls.push({ sql: 'rollback' }),
      release() {}
    })
  };
  const app = {
      get: (p, ...h) => routes.set('GET ' + p, h),
      post: (p, ...h) => routes.set('POST ' + p, h),
      patch: (p, ...h) => routes.set('PATCH ' + p, h)
    },
    auth = (_q, _s, next) => next(),
    admin = auth;
  recovery.register(app, db, auth, admin, (x) => x);
  codes.register(app, db, auth, (x) => x);
  async function call(method, p, body = {}, token = '', extra = {}) {
    let output;
    const req = {
      body,
      headers: { 'x-recovery-token': token },
      user: state.user,
      ip: 'test-ip',
      params: {},
      ...extra
    };
    const res = {
      code: 200,
      status(n) {
        this.code = n;
        return this;
      },
      set() {
        return this;
      },
      json(data) {
        output = { code: this.code, data };
        return this;
      }
    };
    const handlers = routes.get(method + ' ' + p);
    const run = (i) => handlers[i]?.(req, res, () => run(i + 1));
    await run(0);
    return output;
  }
  return { state, calls, call, routes, auth };
}
test('Recovery code has 128-bit entropy, normalization accepts grouped codes, and only its digest is stored', async () => {
  const s = await environment(),
    r = await s.call('POST', '/api/me/recovery-code', { currentPassword: 'old-password' });
  assert.equal(r.code, 200);
  assert.match(r.data.code, /^(?:[A-F0-9]{4}-){7}[A-F0-9]{4}$/);
  assert.equal(s.state.code.code_hash, codes.digest(codes.normalize(r.data.code)));
  assert.ok(!JSON.stringify(s.calls).includes(r.data.code));
  assert.equal(codes.normalize(' ABcd-1234 '), 'abcd1234');
});
test('Issuing or rotating a code needs current password and an active customer account', async () => {
  const s = await environment();
  assert.equal(
    (await s.call('POST', '/api/me/recovery-code', { currentPassword: 'wrong-password' })).code,
    403
  );
  assert.equal(s.state.code, null);
  s.state.user.role = 'ADMIN';
  assert.equal(
    (await s.call('POST', '/api/me/recovery-code', { currentPassword: 'old-password' })).code,
    403
  );
});
test('Correct code directly grants a short reset session; wrong email, wrong or malformed codes do not', async () => {
  const s = await environment(),
    issued = await s.call('POST', '/api/me/recovery-code', { currentPassword: 'old-password' });
  const r = await s.call('POST', '/api/password-recovery/code', {
    email: s.state.user.email,
    recoveryCode: issued.data.code
  });
  assert.equal(r.code, 201);
  assert.equal(r.data.status, 'APPROVED');
  assert.equal(r.data.method, 'RECOVERY_CODE');
  assert.equal(s.state.version, 0);
  assert.equal(s.state.requests[0].token_hash, recovery.digest(r.data.token));
  assert.notEqual(s.state.requests[0].token_hash, r.data.token);
  const wrong = await environment();
  for (const body of [
    { email: 'other@test.invalid', recoveryCode: issued.data.code },
    { email: s.state.user.email, recoveryCode: 'bad' }
  ])
    assert.equal((await wrong.call('POST', '/api/password-recovery/code', body)).code, 401);
});
test('Completion consumes code, hashes new password, revokes sessions and records unread notification atomically', async () => {
  const s = await environment(),
    issued = await s.call('POST', '/api/me/recovery-code', { currentPassword: 'old-password' }),
    r = await s.call('POST', '/api/password-recovery/code', {
      email: s.state.user.email,
      recoveryCode: issued.data.code
    });
  const done = await s.call(
    'POST',
    '/api/password-recovery/complete',
    { password: 'new-password', confirmation: 'new-password' },
    r.data.token
  );
  assert.equal(done.code, 200);
  assert.equal(s.state.code.used_at, null);
  assert.equal(s.state.code.code_hash, codes.digest(codes.normalize(done.data.recoveryCode)));
  assert.notEqual(done.data.recoveryCode, issued.data.code);
  assert.equal(s.state.version, 1);
  assert.ok(await bcrypt.compare('new-password', s.state.user.password_hash));
  assert.equal(s.state.requests[0].status, 'COMPLETED');
  assert.equal(s.state.requests[0].completion_seen, false);
  assert.ok(s.calls.some((c) => c.sql === 'commit'));
  assert.ok(!JSON.stringify(done.data).includes('new-password'));
  assert.equal(
    (
      await s.call(
        'POST',
        '/api/password-recovery/complete',
        { password: 'again-password', confirmation: 'again-password' },
        r.data.token
      )
    ).code,
    409
  );
  assert.equal(
    (
      await s.call('POST', '/api/password-recovery/code', {
        email: s.state.user.email,
        recoveryCode: issued.data.code
      })
    ).code,
    401
  );
});
test('Two reset sessions cannot consume the same personal code twice', async () => {
  const s = await environment(),
    issued = await s.call('POST', '/api/me/recovery-code', { currentPassword: 'old-password' });
  const body = { email: s.state.user.email, recoveryCode: issued.data.code },
    a = await s.call('POST', '/api/password-recovery/code', body),
    b = await s.call('POST', '/api/password-recovery/code', body);
  assert.equal(
    (
      await s.call(
        'POST',
        '/api/password-recovery/complete',
        { password: 'new-password', confirmation: 'new-password' },
        a.data.token
      )
    ).code,
    200
  );
  assert.equal(
    (
      await s.call(
        'POST',
        '/api/password-recovery/complete',
        { password: 'next-password', confirmation: 'next-password' },
        b.data.token
      )
    ).code,
    409
  );
  assert.equal(s.state.version, 1);
});
test('Used, replaced, expired codes/sessions and locked accounts cannot reset a password', async () => {
  for (const kind of ['used', 'replaced', 'expired', 'locked']) {
    const s = await environment(),
      issued = await s.call('POST', '/api/me/recovery-code', { currentPassword: 'old-password' }),
      r = await s.call('POST', '/api/password-recovery/code', {
        email: s.state.user.email,
        recoveryCode: issued.data.code
      });
    if (kind === 'used') s.state.code.used_at = 'used';
    if (kind === 'replaced') s.state.code.code_hash = 'different';
    if (kind === 'expired') s.state.requests[0].valid = 0;
    if (kind === 'locked') s.state.user.account_status = 'LOCKED';
    assert.equal(
      (
        await s.call(
          'POST',
          '/api/password-recovery/complete',
          { password: 'new-password', confirmation: 'new-password' },
          r.data.token
        )
      ).code,
      409,
      kind
    );
    assert.equal(s.state.version, 0);
  }
});
test('Rate limiting includes account and IP and does not issue reset sessions on failed verification', async () => {
  const s = await environment();
  for (let i = 0; i < 5; i++)
    assert.equal(
      (
        await s.call('POST', '/api/password-recovery/code', {
          email: 'x@test.invalid',
          recoveryCode: 'wrong'
        })
      ).code,
      401
    );
  assert.equal(
    (
      await s.call('POST', '/api/password-recovery/code', {
        email: 'different@test.invalid',
        recoveryCode: 'wrong'
      })
    ).code,
    429
  );
  assert.equal(s.state.requests.length, 0);
});
test('Customer UI offers code verification first, manual support separately, and clears raw code from memory', async () => {
  const nodes = new Map(),
    storage = new Map(),
    node = (key) => {
      if (!nodes.has(key))
        nodes.set(key, { innerHTML: '', textContent: '', classList: { add() {}, remove() {} } });
      return nodes.get(key);
    };
  const c = vm.createContext({
    document: { querySelector: node, addEventListener() {} },
    sessionStorage: {
      getItem: (k) => storage.get(k) || null,
      setItem: (k, v) => storage.set(k, v),
      removeItem: (k) => storage.delete(k)
    },
    localStorage: { getItem: () => null },
    setTimeout: () => 0,
    clearTimeout() {}
  });
  for (const f of ['birth-date.js', 'app.js', 'recovery-client.js'])
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), c);
  await new Promise((r) => setImmediate(r));
  const html = vm.runInContext("recoveryView='request';auth()", c);
  assert.ok(html.includes('id="recoveryCodeRequest"'));
  assert.ok(html.includes('data-recovery="support"'));
  assert.ok(!html.includes('name="phone"'));
  vm.runInContext("setInitialRecoveryCode('SECRET-TEST-CODE')", c);
  assert.ok(vm.runInContext('recoveryCodePanel()', c).includes('SECRET-TEST-CODE'));
  assert.equal(storage.size, 0);
  vm.runInContext('clearRecoveryCodeState()', c);
  assert.ok(!vm.runInContext('recoveryCodePanel()', c).includes('SECRET-TEST-CODE'));
});
test('Manual support reset also invalidates the previously issued personal code', async () => {
  const s = await environment();
  const issued = await s.call('POST', '/api/me/recovery-code', { currentPassword: 'old-password' });
  const token = 'a'.repeat(64);
  s.state.requests.push({
    id: 'manual',
    customer_id: 'customer',
    token_hash: recovery.digest(token),
    status: 'APPROVED',
    verification_method: 'MANUAL',
    valid: 1
  });
  const result = await s.call(
    'POST',
    '/api/password-recovery/complete',
    { password: 'supported-password', confirmation: 'supported-password' },
    token
  );
  assert.equal(result.code, 200);
  assert.equal(s.state.code.used_at, null);
  assert.equal(s.state.code.code_hash, codes.digest(codes.normalize(result.data.recoveryCode)));
  assert.notEqual(result.data.recoveryCode, issued.data.code);
});
test('After reset, the new code is shown once before login and never persisted in browser storage', async () => {
  const nodes = new Map(),
    storage = new Map(),
    events = [],
    node = (key) => {
      if (!nodes.has(key))
        nodes.set(key, { innerHTML: '', textContent: '', classList: { add() {}, remove() {} } });
      return nodes.get(key);
    };
  const context = vm.createContext({
    document: {
      querySelector: node,
      addEventListener: (type, handler) => events.push({ type, handler })
    },
    sessionStorage: {
      getItem: (k) => storage.get(k) || null,
      setItem: (k, v) => storage.set(k, v),
      removeItem: (k) => storage.delete(k)
    },
    localStorage: { getItem: () => null },
    setTimeout: () => 0,
    clearTimeout() {},
    FormData: class {
      *[Symbol.iterator]() {
        yield ['password', 'example-pass'];
        yield ['confirmation', 'example-pass'];
      }
    }
  });
  for (const f of ['birth-date.js', 'app.js', 'recovery-client.js'])
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), context);
  await new Promise((r) => setImmediate(r));
  vm.runInContext(
    "recoveryView='status';recoveryAPI=async()=>({status:'COMPLETED',recoveryCode:'NEW-SECRET-CODE',message:'Done'})",
    context
  );
  const form = { id: 'recoveryComplete', querySelector: () => ({ disabled: false }) };
  const submit = events.find(
    (e) => e.type === 'submit' && e.handler.toString().includes('recoveryCodeGenerate')
  ).handler;
  await submit({ target: form, preventDefault() {}, stopImmediatePropagation() {} });
  assert.equal(vm.runInContext('recoveryView', context), 'success');
  assert.ok(vm.runInContext('auth()', context).includes('NEW-SECRET-CODE'));
  assert.ok(!JSON.stringify([...storage]).includes('NEW-SECRET-CODE'));
  const click = events.find(
    (e) => e.type === 'click' && e.handler.toString().includes('ack-reset-code')
  ).handler;
  click({
    target: { closest: () => ({ dataset: { recovery: 'ack-reset-code' } }) },
    preventDefault() {},
    stopImmediatePropagation() {}
  });
  assert.equal(vm.runInContext('recoveryCompletionCode', context), '');
  assert.equal(vm.runInContext('recoveryView', context), '');
  assert.ok(!vm.runInContext('auth()', context).includes('NEW-SECRET-CODE'));
});
