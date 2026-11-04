const test = require('node:test'),
  assert = require('node:assert/strict');
const Lifecycle = require('../survey-lifecycle'),
  V = require('../crm-validation');
test('End mode is explicit: scheduled needs a date, manual rejects a hidden date', () => {
  const body = {
    title: 'Khảo sát',
    description: 'Mô tả',
    questions: [{ text: 'Ý kiến', type: 'TEXT' }]
  };
  assert.throws(() => V.survey(body), /Bắt buộc chọn phương thức/);
  assert.throws(() => V.survey({ ...body, endMode: '' }), /Bắt buộc chọn phương thức/);
  assert.throws(() => V.survey({ ...body, endMode: 'DATE' }), /ngày kết thúc/);
  assert.throws(
    () => V.survey({ ...body, endMode: 'MANUAL', dueDate: '2026-11-10' }),
    /không có ngày/
  );
  assert.equal(V.survey({ ...body, endMode: 'MANUAL' }).dueDate, null);
  assert.throws(() => V.survey({ ...body, endMode: 'wrong' }), /không hợp lệ/);
});
test('Extension must move forward; reopening accepts today but never yesterday', () => {
  const s = { status: 'OPEN', due: '2026-11-10' };
  assert.equal(
    Lifecycle.ending({ endMode: 'DATE', dueDate: '2026-11-11' }, '2026-11-04', s),
    '2026-11-11'
  );
  for (const dueDate of ['2026-11-10', '2026-11-09', 'bad'])
    assert.throws(() => Lifecycle.ending({ endMode: 'DATE', dueDate }, '2026-11-04', s));
  assert.equal(Lifecycle.ending({ endMode: 'MANUAL' }, '2026-11-04', s), null);
  assert.throws(() =>
    Lifecycle.ending({ endMode: 'MANUAL', dueDate: '2026-11-11' }, '2026-11-04', s)
  );
  const closed = { status: 'CLOSED', due: '2026-11-03' };
  assert.equal(
    Lifecycle.ending({ endMode: 'DATE', dueDate: '2026-11-04' }, '2026-11-04', closed),
    '2026-11-04'
  );
  assert.throws(() =>
    Lifecycle.ending({ endMode: 'DATE', dueDate: '2026-11-03' }, '2026-11-04', closed)
  );
  assert.equal(Lifecycle.ending({ endMode: 'MANUAL' }, '2026-11-04', closed), null);
});
function fixture(mode = 'FILTER', status = 'CLOSED', failLog = false) {
  const calls = [],
    config =
      mode === 'FILTER'
        ? { mode, filters: { need: 'Gaming' } }
        : mode === 'SELECTED'
          ? { mode, customerIds: ['c'], filters: {} }
          : { mode, filters: {} };
  const c = {
    beginTransaction: async () => calls.push('begin'),
    commit: async () => calls.push('commit'),
    rollback: async () => calls.push('rollback'),
    release: () => calls.push('release'),
    query: async () => [[{ today: '2026-11-04' }]],
    execute: async (sql, args) => {
      calls.push({ sql, args });
      if (sql.startsWith('SELECT id,status'))
        return [[{ id: 's', status, due: '2026-11-03', audience_config: config }]];
      if (sql.startsWith('SELECT COUNT')) return [[{ total: 1 }]];
      if (failLog && sql.startsWith('INSERT INTO survey_lifecycle_history'))
        throw Error('audit failed');
      return [{ affectedRows: 1 }];
    }
  };
  return { calls, db: { getConnection: async () => c } };
}
for (const mode of ['ALL', 'FILTER', 'SELECTED'])
  test(`Reopen ${mode} preserves snapshots and answers; ALL alone enrolls active newcomers`, async () => {
    const { db, calls } = fixture(mode);
    await Lifecycle.change(db, 's', 'manager', {
      action: 'REOPEN',
      endMode: 'DATE',
      dueDate: '2026-11-10'
    });
    const sql = calls.filter((x) => x.sql);
    assert.equal(
      sql.some((x) => x.sql.startsWith('INSERT IGNORE INTO survey_recipients')),
      mode === 'ALL'
    );
    assert.ok(
      sql.every((x) => !/DELETE|survey_questions|response_details|survey_responses/.test(x.sql))
    );
    const audit = sql.find((x) => x.sql.startsWith('INSERT INTO survey_lifecycle_history'));
    assert.equal(audit.args[2], 'manager');
    assert.equal(audit.args[3], 'REOPEN');
    assert.equal(audit.args[4], '2026-11-03');
    assert.equal(audit.args[5], '2026-11-10');
    assert.ok(calls.includes('commit'));
  });
test('Concurrent stale operation rejects and audit failure rolls back the entire change', async () => {
  const first = fixture('ALL', 'OPEN');
  await assert.rejects(
    Lifecycle.change(first.db, 's', 'm', { action: 'REOPEN', endMode: 'MANUAL' }),
    /Trạng thái/
  );
  assert.ok(first.calls.includes('rollback'));
  assert.ok(!first.calls.includes('commit'));
  const second = fixture('ALL', 'CLOSED', true);
  await assert.rejects(
    Lifecycle.change(second.db, 's', 'm', { action: 'REOPEN', endMode: 'MANUAL' }),
    /audit failed/
  );
  assert.ok(second.calls.includes('rollback'));
  assert.ok(!second.calls.includes('commit'));
});
test('Lifecycle API requires manager authorization for reads and writes', () => {
  const routes = [],
    auth = () => {},
    manager = () => {};
  Lifecycle.register(
    { post: (...args) => routes.push(args), get: (...args) => routes.push(args) },
    null,
    auth,
    manager,
    (x) => x
  );
  assert.equal(routes.length, 2);
  for (const r of routes) {
    assert.equal(r[1], auth);
    assert.equal(r[2], manager);
  }
});
