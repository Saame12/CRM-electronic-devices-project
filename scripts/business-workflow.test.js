const test = require('node:test'),
  assert = require('node:assert/strict');
const Retention = require('../customer-retention'),
  Feedback = require('../feedback-service');
function db(row) {
  const calls = [];
  const connection = {
    beginTransaction: async () => calls.push('begin'),
    commit: async () => calls.push('commit'),
    rollback: async () => calls.push('rollback'),
    release: () => calls.push('release'),
    execute: async (sql, args) => {
      calls.push({ sql, args });
      return sql.startsWith('SELECT') ? [[row].filter(Boolean)] : [{ affectedRows: 1 }];
    }
  };
  return { calls, getConnection: async () => connection };
}
test('Customer erasure requires an already locked account and makes no changes on rejection', async () => {
  const c = db({ id: 'c', email: 'private@example.invalid', account_status: 'ACTIVE' });
  await assert.rejects(
    Retention.erase(c, 'c'),
    (e) => e.status === 409 && e.message.includes('khóa')
  );
  assert.ok(c.calls.includes('rollback'));
  assert.ok(!c.calls.some((x) => x.sql && /^(DELETE|UPDATE)/.test(x.sql)));
});
test('Admin may erase an active customer directly while the operation still invalidates access', async () => {
  const c = db({ id: 'c', email: 'private@example.invalid', account_status: 'ACTIVE' });
  await Retention.erase(c, 'c', { requireLocked: false });
  assert.ok(c.calls.includes('commit'));
  assert.ok(c.calls.some(x => x.sql?.includes("account_status='LOCKED'") && x.sql.includes('auth_version=auth_version+1')));
});

test('Erasure removes login, contacts and recovery data while preserving analytics and business history', async () => {
  const c = db({ id: 'c', email: 'private@example.invalid', account_status: 'LOCKED' });
  await Retention.erase(c, 'c');
  const mutations = c.calls.filter((x) => x.sql && /^(DELETE|UPDATE)/.test(x.sql));
  assert.equal(mutations.length, 3);
  assert.ok(mutations[0].sql.includes('password_recovery_requests'));
  assert.ok(mutations[1].sql.includes('customer_recovery_codes'));
  const update = mutations[2].sql;
  for (const field of ['email=NULL', 'phone=NULL', 'password_hash=NULL', "address=''"])
    assert.ok(update.includes(field));
  for (const field of ['full_name=', 'birth_date=', 'gender=', 'need='])
    assert.ok(!update.includes(field));
  assert.ok(
    !mutations.some((x) => /DELETE FROM (feedback|survey_|customer_interests)/.test(x.sql))
  );
  assert.ok(c.calls.includes('commit'));
});
test('Manager reply is mandatory and changes status automatically once, with stale revisions rejected', async () => {
  await assert.rejects(
    Feedback.reply(db(null), 'f', 'm', { reply: '   ', status: 'RESOLVED' }),
    (e) => e.status === 400
  );
  const c = db({ revision: 2, reply_content: null });
  await Feedback.reply(c, 'f', 'm', { revision: 2, reply: 'Đã hỗ trợ.', status: 'NEW' });
  assert.ok(c.calls.some((x) => x.sql && x.sql.includes("status='RESOLVED'")));
  await assert.rejects(
    Feedback.reply(db({ revision: 2, reply_content: null }), 'f', 'm', {
      revision: 1,
      reply: 'Sai phiên bản'
    }),
    (e) => e.status === 409
  );
  await assert.rejects(
    Feedback.reply(db({ revision: 2, reply_content: 'Đã trả lời' }), 'f', 'm', {
      revision: 2,
      reply: 'Lần hai'
    }),
    (e) => e.status === 409
  );
});
test('Manager can explicitly edit an existing reply, preserving resolved state and rejecting stale or missing replies', async () => {
  const c = db({ revision: 2, reply_content: 'Câu trả lời cũ' });
  await Feedback.reply(c, 'f', 'm', { revision: 2, reply: 'Đã chỉnh sửa', editReply: true });
  const update = c.calls.find(x => x.sql?.startsWith('UPDATE'));
  assert.equal(update.args[0], 'Đã chỉnh sửa');
  assert.ok(update.sql.includes("status='RESOLVED'"));
  assert.ok(update.sql.includes('revision=revision+1'));
  for (const row of [{ revision: 3, reply_content: 'Mới' }, { revision: 2, reply_content: null }])
    await assert.rejects(Feedback.reply(db(row), 'f', 'm', { revision: 2, reply: 'Sửa', editReply: true }), e => e.status === 409);
});

test('Legacy feedback statuses are normalized before narrowing the database enum to two states', async () => {
  const calls = [];
  await Feedback.ensureSchema({
    query: async (sql) => {
      calls.push(sql);
      return [
        sql.includes('COLUMN_TYPE')
          ? [{ COLUMN_TYPE: "enum('NEW','IN_PROGRESS','RESOLVED')" }]
          : [{ COLUMN_NAME: 'revision' }]
      ];
    }
  });
  const normalize = calls.findIndex((x) => x.startsWith('UPDATE feedback')),
    alter = calls.findIndex((x) => x.startsWith('ALTER TABLE feedback MODIFY status'));
  assert.ok(normalize >= 0 && alter > normalize);
  assert.ok(calls[alter].includes("ENUM('NEW','RESOLVED')"));
});
