const test = require('node:test');
const assert = require('node:assert/strict');
const { ensureSchema } = require('../birth-date-schema');

for (const initial of [[], ['birth_year'], ['birth_date'], ['birth_date', 'birth_year']]) {
  test('Birth date migration preserves dates and is repeatable: ' + initial.join(','), async () => {
    const columns = new Set(initial), calls = [];
    const db = { query: async (sql) => {
      calls.push(sql);
      if (sql.startsWith('SELECT')) return [[...columns].map(COLUMN_NAME => ({ COLUMN_NAME }))];
      if (sql.includes('ADD COLUMN birth_date')) columns.add('birth_date');
      else if (sql.includes('DROP COLUMN birth_year')) {
        assert.ok(columns.has('birth_date'));
        columns.delete('birth_year');
      } else assert.fail('Unexpected data mutation: ' + sql);
      return [];
    }};
    await ensureSchema(db);
    assert.deepEqual([...columns], ['birth_date']);
    const before = calls.length;
    await ensureSchema(db);
    assert.equal(calls.length, before + 1);
    assert.ok(!calls.some(sql => /UPDATE|DELETE|DROP COLUMN birth_date/.test(sql)));
  });
}
