// Schema migration only; all accounts, codes and requests used below live in TEMPORARY tables.
require('dotenv').config({
  path: process.env.CRM_ENV_FILE || require('node:path').join(__dirname, '..', '.env'),
  quiet: true
});
const mysql = require('mysql2/promise'),
  bcrypt = require('bcryptjs'),
  crypto = require('node:crypto'),
  assert = require('node:assert/strict');
const recovery = require('../password-recovery'),
  codes = require('../recovery-codes');
async function main() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'backline_crm'
  });
  try {
    await recovery.ensureSchema(c);
    for (const [temporary, original] of [
      ['code_test_users', 'users'],
      ['code_test_requests', 'password_recovery_requests'],
      ['code_test_codes', 'customer_recovery_codes']
    ])
      await c.query('CREATE TEMPORARY TABLE ' + temporary + ' LIKE ' + original);
    const rewrite = (sql) =>
      sql
        .replace(/\bcustomer_recovery_codes\b/g, 'code_test_codes')
        .replace(/\bpassword_recovery_requests\b/g, 'code_test_requests')
        .replace(/\busers\b/g, 'code_test_users');
    let failCodeWrite = false;
    const execute = (sql, values) => {
      if (failCodeWrite && sql.startsWith('INSERT INTO customer_recovery_codes'))
        throw Error('simulated code storage failure');
      return c.execute(rewrite(sql), values);
    };
    const id = crypto.randomUUID(),
      hash = await bcrypt.hash('before-testing', 4);
    await execute(
      "INSERT INTO users (id,email,password_hash,role,full_name,phone) VALUES (?,?,?,'CUSTOMER',?,?)",
      [id, 'code-test@example.invalid', hash, 'Khách kiểm thử cách ly', '0909999989']
    );
    const db = {
        execute,
        query: (sql, v) => c.query(rewrite(sql), v),
        getConnection: async () => ({
          execute,
          beginTransaction: () => c.beginTransaction(),
          commit: () => c.commit(),
          rollback: () => c.rollback(),
          release() {}
        })
      },
      routes = new Map();
    const app = {
      get: (p, ...h) => routes.set('GET ' + p, h.at(-1)),
      post: (p, ...h) => routes.set('POST ' + p, h.at(-1)),
      patch: (p, ...h) => routes.set('PATCH ' + p, h.at(-1))
    };
    recovery.register(
      app,
      db,
      () => {},
      () => {},
      (x) => x
    );
    codes.register(
      app,
      db,
      () => {},
      (x) => x
    );
    async function call(method, path, body = {}, token = '') {
      let status = 200,
        data;
      await routes.get(method + ' ' + path)(
        {
          body,
          headers: { 'x-recovery-token': token },
          params: {},
          user: { id, role: 'CUSTOMER' }
        },
        {
          status(n) {
            status = n;
            return this;
          },
          set() {
            return this;
          },
          json(value) {
            data = value;
          }
        }
      );
      return { status, data };
    }
    const issued = await call('POST', '/api/me/recovery-code', {
      currentPassword: 'before-testing'
    });
    assert.equal(issued.status, 200);
    const [[stored]] = await execute(
      'SELECT code_hash FROM customer_recovery_codes WHERE customer_id=?',
      [id]
    );
    assert.equal(stored.code_hash, codes.digest(codes.normalize(issued.data.code)));
    assert.notEqual(stored.code_hash, issued.data.code);
    const grant = await call('POST', '/api/password-recovery/code', {
      email: 'code-test@example.invalid',
      recoveryCode: issued.data.code
    });
    assert.equal(grant.status, 201);
    assert.equal(grant.data.status, 'APPROVED');
    const second = await call('POST', '/api/password-recovery/code', {
      email: 'code-test@example.invalid',
      recoveryCode: issued.data.code
    });
    assert.equal(second.status, 201);
    const payload = { password: 'after-testing', confirmation: 'after-testing' };
    const completed = await call(
      'POST',
      '/api/password-recovery/complete',
      payload,
      grant.data.token
    );
    assert.equal(completed.status, 200);
    assert.match(completed.data.recoveryCode, /^(?:[A-F0-9]{4}-){7}[A-F0-9]{4}$/);
    const [[newCode]] = await execute(
      'SELECT code_hash,used_at FROM customer_recovery_codes WHERE customer_id=?',
      [id]
    );
    assert.equal(newCode.code_hash, codes.digest(codes.normalize(completed.data.recoveryCode)));
    assert.equal(newCode.used_at, null);
    assert.notEqual(completed.data.recoveryCode, issued.data.code);
    const newGrant = await call('POST', '/api/password-recovery/code', {
      email: 'code-test@example.invalid',
      recoveryCode: completed.data.recoveryCode
    });
    assert.equal(newGrant.status, 201);
    const [[user]] = await execute('SELECT password_hash,auth_version FROM users WHERE id=?', [id]);
    assert.ok(await bcrypt.compare('after-testing', user.password_hash));
    assert.equal(user.auth_version, 1);
    assert.equal(
      (await call('POST', '/api/password-recovery/complete', payload, second.data.token)).status,
      409
    );
    assert.equal(
      (
        await call('POST', '/api/password-recovery/code', {
          email: 'code-test@example.invalid',
          recoveryCode: issued.data.code
        })
      ).status,
      401
    );
    const history = await call('GET', '/api/admin/password-recovery');
    assert.equal(history.data.unread, 1);
    assert.ok(
      history.data.requests.some(
        (r) => r.status === 'COMPLETED' && r.verification_method === 'RECOVERY_CODE'
      )
    );
    assert.ok(!JSON.stringify(history.data).includes(issued.data.code));
    assert.ok(!JSON.stringify(history.data).includes(completed.data.recoveryCode));
    assert.ok(!JSON.stringify(history.data).includes('after-testing'));
    const replacement = await call('POST', '/api/me/recovery-code', {
      currentPassword: 'after-testing'
    });
    assert.equal(replacement.status, 200);
    assert.notEqual(replacement.data.code, issued.data.code);
    const expiring = await call('POST', '/api/password-recovery/code', {
      email: 'code-test@example.invalid',
      recoveryCode: replacement.data.code
    });
    await execute(
      'UPDATE password_recovery_requests SET expires_at=DATE_SUB(NOW(),INTERVAL 1 MINUTE) WHERE token_hash=?',
      [recovery.digest(expiring.data.token)]
    );
    assert.equal(
      (await call('POST', '/api/password-recovery/complete', payload, expiring.data.token)).status,
      409
    );
    // A failed replacement-code write must roll back password, session version and completion.
    const retryGrant = await call('POST', '/api/password-recovery/code', {
      email: 'code-test@example.invalid',
      recoveryCode: replacement.data.code
    });
    const [[beforeFailure]] = await execute(
      'SELECT password_hash,auth_version FROM users WHERE id=?',
      [id]
    );
    const [[beforeCode]] = await execute(
      'SELECT code_hash,used_at FROM customer_recovery_codes WHERE customer_id=?',
      [id]
    );
    failCodeWrite = true;
    try {
      await assert.rejects(
        call(
          'POST',
          '/api/password-recovery/complete',
          { password: 'must-rollback-password', confirmation: 'must-rollback-password' },
          retryGrant.data.token
        ),
        /simulated code storage failure/
      );
    } finally {
      failCodeWrite = false;
    }
    const [[afterFailure]] = await execute(
      'SELECT password_hash,auth_version FROM users WHERE id=?',
      [id]
    );
    const [[afterCode]] = await execute(
      'SELECT code_hash,used_at FROM customer_recovery_codes WHERE customer_id=?',
      [id]
    );
    assert.deepEqual(afterFailure, beforeFailure);
    assert.deepEqual(afterCode, beforeCode);
    const [[pendingRetry]] = await execute(
      'SELECT status FROM password_recovery_requests WHERE token_hash=?',
      [recovery.digest(retryGrant.data.token)]
    );
    assert.equal(pendingRetry.status, 'APPROVED');
    // Exercise the real registration handler against the same isolated tables.
    const vm = require('node:vm'),
      fs = require('node:fs'),
      path = require('node:path');
    const source = fs.readFileSync(path.join(__dirname, '..', 'server.mysql.js'), 'utf8');
    const start = source.indexOf("app.post('/api/auth/register'"),
      end = source.indexOf("app.post('/api/auth/login'", start);
    let registration;
    const context = vm.createContext({
      app: {
        post: (_path, handler) => {
          registration = handler;
        }
      },
      wrap: (fn) => fn,
      db,
      bcrypt,
      BirthDate: require('../birth-date'),
      RecoveryCodes: codes,
      emailOk: (value) => /^\S+@\S+\.\S+$/.test(value),
      phoneOk: (value) => /^0\d{9,10}$/.test(value),
      uid: () => crypto.randomUUID(),
      CustomerSession: { issue: () => null },
      tokenFor() {},
      publicUser: (user) => ({ id: user.id, email: user.email })
    });
    vm.runInContext(source.slice(start, end), context);
    let registrationData,
      registrationStatus = 200;
    const registrationResponse = {
      status(n) {
        registrationStatus = n;
        return this;
      },
      json(value) {
        registrationData = value;
      }
    };
    const registrationRequest = {
      body: {
        name: 'Khách đăng ký cách ly',
        email: 'register-code@example.invalid',
        phone: '0909999987',
        birthDate: '1994-02-15',
        gender: 'Nữ',
        password: 'register-testing'
      }
    };
    await registration(registrationRequest, registrationResponse);
    assert.equal(registrationStatus, 201);
    assert.match(registrationData.recoveryCode, /^(?:[A-F0-9]{4}-){7}[A-F0-9]{4}$/);
    const [[registered]] = await execute(
      'SELECT code_hash FROM customer_recovery_codes WHERE customer_id=?',
      [registrationData.user.id]
    );
    assert.equal(
      registered.code_hash,
      codes.digest(codes.normalize(registrationData.recoveryCode))
    );
    await registration(registrationRequest, registrationResponse);
    assert.equal(registrationStatus, 409);
    console.log(
      'Recovery-code MySQL checks passed: issuance, digest storage, direct grant, one-use reset, session revocation, history privacy, rotation and expiry. Real customer passwords unchanged.'
    );
  } finally {
    await c.end();
  }
}
main().catch((error) => {
  console.error('Recovery-code checks failed: ' + (error.code || error.message));
  process.exitCode = 1;
});
