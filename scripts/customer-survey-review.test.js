const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
const { readOwnResponse, register } = require('../customer-survey-review');
test('Read own response uses authenticated customer and returns all question types including skips', async () => {
  const calls = [],
    db = {
      execute: async (sql, args) => {
        calls.push({ sql, args });
        return calls.length === 1
          ? [
              [
                {
                  id: 'r',
                  survey_id: 's',
                  title: 'Title',
                  description: 'Description',
                  status: 'CLOSED',
                  submitted_at: '2026-11-01'
                }
              ]
            ]
          : [
              [
                {
                  id: 'a',
                  question_text: 'One',
                  question_type: 'ONE',
                  option_text: 'A',
                  is_required: 1
                },
                { id: 'b', question_text: 'Multi', question_type: 'MULTI', option_text: 'X' },
                { id: 'b', question_text: 'Multi', question_type: 'MULTI', option_text: 'Y' },
                {
                  id: 'c',
                  question_text: 'Text',
                  question_type: 'TEXT',
                  text_answer: '<script>private</script>'
                },
                { id: 'd', question_text: 'Rating', question_type: 'RATING', rating_value: 5 },
                { id: 'e', question_text: 'Skipped', question_type: 'TEXT', text_answer: null }
              ]
            ];
      }
    };
  const r = await readOwnResponse(db, 's', 'customer');
  assert.deepEqual(calls[0].args, ['s', 'customer']);
  assert.deepEqual(calls[1].args, ['r', 's']);
  assert.deepEqual(
    r.questions.map((q) => q.answers),
    [['A'], ['X', 'Y'], ['<script>private</script>'], [5], []]
  );
  assert.equal(r.survey.status, 'CLOSED');
  assert.ok(calls.every((x) => !/^\s*(INSERT|UPDATE|DELETE)/i.test(x.sql)));
  assert.ok(!JSON.stringify(r).includes('customer_id'));
});
test('Missing own submission stops before querying any answer details', async () => {
  let calls = 0;
  assert.equal(
    await readOwnResponse(
      {
        execute: async () => {
          calls++;
          return [[]];
        }
      },
      's',
      'foreign-customer'
    ),
    null
  );
  assert.equal(calls, 1);
});
test('Review endpoint requires CUSTOMER and ignores forged customerId and responseId', async () => {
  let route,
    queries = 0;
  const auth = () => {};
  register(
    { get: (...args) => (route = args) },
    {
      execute: async (sql, args) => {
        queries++;
        assert.deepEqual(args, ['s', 'own']);
        return [[]];
      }
    },
    auth,
    (x) => x
  );
  assert.equal(route[1], auth);
  const handler = route.at(-1),
    response = () => ({
      code: 200,
      headers: {},
      set(k, v) {
        this.headers[k] = v;
        return this;
      },
      status(n) {
        this.code = n;
        return this;
      },
      json(v) {
        this.data = v;
      }
    });
  for (const role of ['ADMIN', 'MANAGER']) {
    const res = response();
    await handler({ user: { id: 'own', role }, params: { id: 's' } }, res);
    assert.equal(res.code, 403);
  }
  assert.equal(queries, 0);
  const res = response();
  await handler(
    {
      user: { id: 'own', role: 'CUSTOMER' },
      params: { id: 's' },
      query: { customerId: 'other', responseId: 'other' }
    },
    res
  );
  assert.equal(res.code, 404);
  assert.equal(res.headers['Cache-Control'], 'no-store');
});
async function browser() {
  const c = vm.createContext({
    document: {
      querySelector: () => ({
        innerHTML: '',
        textContent: '',
        classList: { add() {}, remove() {} }
      }),
      addEventListener() {}
    },
    sessionStorage: { getItem: () => null, removeItem() {} },
    localStorage: { getItem: () => null },
    setTimeout: () => 0,
    clearTimeout() {}
  });
  for (const f of ['crm-domain.js', 'customer-fields.js', 'birth-date.js', 'app.js'])
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), c);
  await new Promise((r) => setImmediate(r));
  return c;
}
test('Completed cards expose review in normal and hidden lists; skipped expired surveys do not', async () => {
  const c = await browser();
  vm.runInContext(
    "me={id:'c',email:'test@invalid'};DONE[me.email]={done:'01/11/2026'};SV=[{id:'done',title:'Done',status:'CLOSED',qs:[]},{id:'expired',title:'Expired',isExpired:true,qs:[]}]",
    c
  );
  let html = vm.runInContext('svList()', c);
  assert.equal((html.match(/data-act="review-survey"/g) || []).length, 1);
  assert.ok(!html.includes('data-act="start"'));
  vm.runInContext('showHiddenSurveys=true;localStorage.getItem=()=>JSON.stringify(["done"])', c);
  html = vm.runInContext('svList()', c);
  assert.ok(html.includes('Xem câu trả lời đã gửi'));
  assert.ok(html.includes('Bỏ ẩn'));
});
test('Review safely renders answers without editable fields or submit controls', async () => {
  const c = await browser();
  c.fixture = {
    survey: { title: '<img src=x>', description: 'Description', status: 'CLOSED' },
    submittedAt: '2026-11-01',
    questions: [
      { text: '<script>', type: 'TEXT', answers: ['<img onerror=bad>'] },
      { text: 'Multi', type: 'MULTI', answers: ['A', 'B'] },
      { text: 'Rating', type: 'RATING', answers: [5] },
      { text: 'Optional', type: 'TEXT', answers: [] }
    ]
  };
  const html = vm.runInContext('surveyReview={data:fixture};svReview()', c);
  assert.ok(html.includes('Đã đóng'));
  assert.ok(html.includes('5 / 5 sao'));
  assert.ok(html.includes('Chưa trả lời'));
  assert.ok(html.includes('&lt;img'));
  assert.ok(!/<input|<textarea|<form|<script|Gửi khảo sát/.test(html));
});
test('Review requests cannot reveal a late response after navigating away or switching account', async () => {
  for (const action of ['clearSurveyReview()', "me={id:'other'}"]) {
    const c = await browser();
    let resolve;
    c.waiting = new Promise((r) => (resolve = r));
    vm.runInContext("me={id:'own'};api=()=>waiting;render=()=>{}", c);
    const task = vm.runInContext("loadSurveyReview('s')", c);
    vm.runInContext(action, c);
    resolve({ survey: { title: 'private' }, questions: [] });
    await task;
    assert.equal(vm.runInContext('surveyReview?.data', c), undefined);
  }
});
