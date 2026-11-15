const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../../app.js'), 'utf8');
const start = source.indexOf('  async fb(v) {');
const end = source.indexOf('\n  // LOGIC: Kiểm tra câu bắt buộc', start);
if (start < 0 || end < 0) throw Error('Cannot locate actual feedback handler');
const handler = source.slice(start, end).trim().replace(/,$/, '');
async function test(switched) {
  let resolve;
  const context = vm.createContext({
    me: { id: 'A', email: 'a@example.test' }, FB: {},
    $: () => ({ dataset: { val: '5' } }),
    api: () => new Promise(r => { resolve = r; }),
    render() {}, toast() {}, setErr() {}
  });
  const object = vm.runInContext('({' + handler + '})', context);
  const running = object.fb({ prod: 'Synthetic', body: 'Audit', title: 'Audit', type: 'Góp ý' });
  context.me = switched ? { id: 'B', email: 'b@example.test' } : null;
  resolve({ feedback: { id: 'belongs-to-A' } });
  try {
    await running;
    return { case: 'switch-user-during-submit', previousUserFeedbackAddedToNextUserCache: Boolean(context.FB['b@example.test']?.length) };
  } catch (error) {
    return { case: 'logout-during-submit', failedWithTypeError: error.name === 'TypeError' };
  }
}
(async () => {
  const results = [await test(false), await test(true)];
  fs.writeFileSync(path.join(__dirname, 'frontend-race-results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
})();
