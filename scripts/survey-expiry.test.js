const test = require('node:test');
const assert = require('node:assert/strict');
const Expiry = require('../survey-expiry');

test('Expiry clock targets midnight Vietnam even on a UTC host', () => {
  assert.equal(Expiry.untilMidnight(Date.parse('2026-11-03T16:59:59.999Z')), 1);
  assert.equal(Expiry.untilMidnight(Date.parse('2026-11-03T17:00:00Z')), 86400000);
  assert.equal(Expiry.untilMidnight(Date.parse('2026-11-04T00:00:00Z')), 17 * 3600000);
});

test('Expiry changes only status and audit timestamp, with strict day boundary and no deadline exemption', async () => {
  let sql;
  assert.equal(await Expiry.closeExpired({query: async q => {sql=q; return [{affectedRows:2}];}}), 2);
  assert.match(sql, /status='OPEN' AND due_date IS NOT NULL AND due_date < DATE\(UTC_TIMESTAMP\(\) \+ INTERVAL 7 HOUR\)/);
  assert.match(sql, /SET status='CLOSED',auto_closed_at=UTC_TIMESTAMP\(\)/);
  assert.ok(!/DELETE|survey_recipients|survey_responses|response_details/.test(sql));
});

test('Expiry migration is idempotent', async () => {
  const calls=[];
  await Expiry.ensureSchema({query: async q => {calls.push(q); return [[]];}});
  assert.equal(calls.length,2);assert.match(calls[1], /ADD COLUMN auto_closed_at/);
  calls.length=0;
  await Expiry.ensureSchema({query: async q => {calls.push(q); return [[{COLUMN_NAME:'auto_closed_at'}]];}});
  assert.equal(calls.length,1);
});

test('Midnight job repeats after success and retries database failure in one minute', async () => {
  const timers=[],errors=[];let fails=false;
  const stop=Expiry.schedule({query:async()=>{if(fails)throw Error('offline');return [{affectedRows:0}];}}, {
    setTimer:(fn,delay)=>{timers.push({fn,delay});return {unref(){}};},
    onError:(...args)=>errors.push(args)
  });
  assert.ok(timers[0].delay>0&&timers[0].delay<=86400000);
  await timers[0].fn();assert.equal(timers.length,2);
  fails=true;await timers[1].fn();assert.equal(timers[2].delay,60000);assert.equal(errors.length,1);
  stop();await timers[2].fn();assert.equal(timers.length,3);
});
