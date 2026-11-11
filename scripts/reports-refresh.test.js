const test = require('node:test'),
  assert = require('node:assert/strict'),
  vm = require('node:vm'),
  fs = require('node:fs'),
  path = require('node:path');
test('Report update bypasses cache and reloads the currently open survey detail alongside the overview', async () => {
  const c = vm.createContext({ document: { addEventListener() {} }, URLSearchParams });
  vm.runInContext("let me={id:'manager',role:'MANAGER'},page='reports';function render(){}", c);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'reports.js'), 'utf8'), c);
  const calls = [];
  c.record = async (url, options) => {
    calls.push({ url, options });
    return url.includes('/overview')
      ? { customers: { total: 7 }, generatedAt: 'new' }
      : { survey: { id: 's' }, responses: [{ id: 'new-response' }] };
  };
  vm.runInContext(
    "api=record;reportData={customers:{total:3}};reportDetail={id:'s',data:{responses:[]}};reportFilter={from:'2026-11-01',to:''}",
    c
  );
  await vm.runInContext('fetchReports({keepDetail:true})', c);
  assert.equal(calls.length, 2);
  assert.ok(calls[0].url.includes('from=2026-11-01'));
  assert.ok(calls.every((x) => x.options.cache === 'no-store'));
  assert.equal(vm.runInContext('reportData.customers.total', c), 7);
  assert.equal(vm.runInContext('reportDetail.data.responses[0].id', c), 'new-response');
  assert.equal(vm.runInContext('reportLoading', c), false);
});
