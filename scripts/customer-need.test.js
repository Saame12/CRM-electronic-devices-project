const test = require('node:test'),
  assert = require('node:assert/strict');
const { ensureSchema } = require('../customer-need');
test('Need confirmation migration backfills concrete legacy choices once without treating the default as confirmed', async () => {
  const calls = [];
  await ensureSchema({
    query: async (sql) => {
      calls.push(sql);
      return [[]];
    }
  });
  assert.equal(calls.length, 3);
  assert.ok(calls[1].includes('DEFAULT FALSE'));
  assert.ok(calls[2].includes("'Gaming','Đồ họa','Văn phòng'"));
  assert.ok(!calls[2].includes('Chưa xác định'));
  assert.ok(!calls.some((sql) => sql.includes('password_hash')));
});
test('Restart never overwrites existing confirmation choices', async () => {
  const calls = [];
  await ensureSchema({
    query: async (sql) => {
      calls.push(sql);
      return [[{ COLUMN_NAME: 'need_confirmed' }]];
    }
  });
  assert.equal(calls.length, 1);
});
