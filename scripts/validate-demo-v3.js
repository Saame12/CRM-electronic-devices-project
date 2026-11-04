const assert = require('node:assert/strict');
async function validate(c) {
  const [[state]] = await c.query(
    "SELECT COUNT(*) total,SUM(status='OPEN' AND due_date IS NULL) manualOpen,SUM(status='OPEN' AND due_date=DATE(UTC_TIMESTAMP()+INTERVAL 7 HOUR)) todayOpen,SUM(status='OPEN' AND due_date<DATE(UTC_TIMESTAMP()+INTERVAL 7 HOUR)) staleOpen,SUM(status='OPEN' AND audience_config IS NULL) missingScope,SUM(auto_closed_at IS NOT NULL AND status='CLOSED') autoClosed FROM surveys"
  );
  assert.equal(Number(state.total), 16);
  assert.ok(Number(state.manualOpen) >= 1);
  assert.ok(Number(state.todayOpen) >= 1);
  assert.equal(Number(state.staleOpen), 0);
  assert.equal(Number(state.missingScope), 0);
  assert.ok(Number(state.autoClosed) >= 1);
  for (const [table, total] of Object.entries({
    users: 21,
    feedback: 54,
    survey_responses: 21,
    response_details: 47,
    survey_lifecycle_history: 5
  })) {
    const [[r]] = await c.query('SELECT COUNT(*) n FROM ' + table);
    assert.equal(Number(r.n), total, table);
  }
  const [[invalid]] = await c.query(
    'SELECT COUNT(*) n FROM survey_responses a LEFT JOIN survey_recipients r ON r.survey_id=a.survey_id AND r.customer_id=a.customer_id WHERE r.customer_id IS NULL'
  );
  assert.equal(Number(invalid.n), 0);
  const [history] = await c.query('SELECT DISTINCT action FROM survey_lifecycle_history');
  for (const action of ['EXTEND', 'REOPEN', 'CLOSE'])
    assert.ok(history.some((h) => h.action === action));
  return state;
}
module.exports = { validate };
