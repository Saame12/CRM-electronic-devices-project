const test = require('node:test'),
  assert = require('node:assert/strict'),
  { buildDemo } = require('../database/demo-data-v3');
for (const now of [new Date('2026-11-04T14:00:00Z'), new Date('2031-04-05T18:00:00Z')])
  test('V3 covers lifecycle and UTC+7 deadlines at ' + now.toISOString(), () => {
    const d = buildDemo(now),
      today = require('../crm-domain').iso(require('../database/demo-data').dateAt(now, 0));
    assert.equal(d.surveys.length, 16);
    assert.equal(d.lifecycleHistory.length, 5);
    assert.equal(d.responses.length, 21);
    assert.ok(!d.surveys.some((s) => s.status === 'OPEN' && s.due_date && s.due_date < today));
    assert.ok(d.surveys.some((s) => s.status === 'OPEN' && !s.due_date));
    assert.ok(d.surveys.some((s) => s.status === 'OPEN' && s.due_date === today));
    assert.ok(d.surveys.some((s) => s.status === 'CLOSED' && s.auto_closed_at));
    const surveys = new Map(d.surveys.map((s) => [s.id, s]));
    for (const h of d.lifecycleHistory) {
      assert.ok(surveys.has(h.survey_id));
      assert.ok(d.users.some((u) => u.id === h.actor_id && u.role === 'MANAGER'));
    }
    for (const r of d.responses)
      assert.ok(
        d.recipients.some((x) => x.survey_id === r.survey_id && x.customer_id === r.customer_id)
      );
    const late = d.users.find((u) => u.email === 'khach18@demo.vn');
    for (const s of d.surveys.filter(
      (s) => s.status === 'OPEN' && JSON.parse(s.audience_config).mode === 'ALL'
    ))
      assert.ok(d.recipients.some((r) => r.survey_id === s.id && r.customer_id === late.id));
  });
