const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
const Audience = require('../survey-audience'),
  V = require('../crm-validation');
test('Scope must be explicit before OPEN; draft may omit it and each mode has its own requirements', () => {
  assert.equal(Audience.normalize(undefined), null);
  for (const value of [
    undefined,
    null,
    { mode: '' },
    { mode: 'FILTER' },
    { mode: 'SELECTED', customerIds: [] },
    { mode: 'SELECTED', customerIds: ['a', 'a'] },
    { mode: 'ALL', filters: { minAge: 15 } }
  ])
    assert.throws(() => Audience.normalize(value, { required: true }), V.InputError);
  assert.deepEqual(Audience.normalize({ mode: 'ALL' }, { required: true }), {
    mode: 'ALL',
    filters: {},
    customerIds: []
  });
  assert.deepEqual(
    Audience.normalize({
      mode: 'FILTER',
      filters: { minAge: '15', maxAge: '20', interests: ['gaming'] }
    }).filters,
    { interests: ['gaming'], minAge: 15, maxAge: 20 }
  );
  assert.deepEqual(Audience.parse('{"mode":"ALL"}'), { mode: 'ALL' });
  assert.equal(Audience.parse(null), null);
});
test('Migration preserves unknown legacy scopes and only backfills explicit public flags', async () => {
  const calls = [];
  await Audience.ensureSchema({
    query: async (sql) => {
      calls.push(sql);
      return [[]];
    }
  });
  assert.ok(calls.some((sql) => sql.includes('ADD COLUMN audience_config JSON NULL')));
  const update = calls.find((sql) => sql.startsWith('UPDATE'));
  assert.ok(update.includes('audience_config IS NULL AND accept_new_customers=TRUE'));
  assert.ok(!calls.some((sql) => sql.includes('survey_recipients') || sql.includes('COUNT(')));
});
function environment() {
  const host = { innerHTML: '', classList: { add() {}, remove() {} } };
  const c = vm.createContext({
    document: { querySelector: () => host, querySelectorAll: () => [], addEventListener() {} },
    sessionStorage: { getItem: () => null },
    URLSearchParams,
    setTimeout() {},
    clearTimeout() {},
    FormData: class {
      *[Symbol.iterator]() {
        yield ['status', 'OPEN'];
        yield ['title', 'Scope'];
        yield ['description', 'Scope'];
      }
    }
  });
  for (const f of [
    'crm-domain.js',
    'customer-fields.js',
    'admin.js',
    'staff-surveys.js',
    'staff-controller.js'
  ])
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), c);
  return { c, host };
}
test('Saved scope pre-fills the editor including selected IDs, interests and age zero; default has no ALL selection', () => {
  const { c } = environment();
  c.config = {
    mode: 'SELECTED',
    filters: { interests: ['gaming', 'design'], minAge: 0, maxAge: 20 },
    customerIds: ['customer-one']
  };
  const html = vm.runInContext('audienceFields(config)', c);
  assert.ok(html.includes('value="SELECTED" selected'));
  assert.ok(html.includes('name="audienceMinAge" value="0"'));
  assert.ok(html.includes('value="gaming" checked'));
  assert.ok(html.includes('type="hidden" name="audienceCustomer" value="customer-one"'));
  const empty = vm.runInContext('audienceFields()', c);
  assert.ok(empty.includes('value="" selected'));
  assert.ok(!empty.includes('value="ALL" selected'));
});
test('New OPEN creation sends exactly one request; no implicit scope is submitted', async () => {
  const { c } = environment(),
    calls = [];
  c.form = { querySelector: () => null };
  c.record = async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) });
    return { id: 'new' };
  };
  vm.runInContext(
    "api=record;toast=()=>{};loadSurveys=async()=>{};readSurveyQuestions=()=>[{type:'TEXT',text:'Question'}];readAudience=()=>({mode:'ALL'})",
    c
  );
  await vm.runInContext('staffForms.surveyForm(form)', c);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/api/admin/surveys');
  assert.equal(calls[0].body.audience.mode, 'ALL');
  vm.runInContext("readAudience=()=>({mode:''})", c);
  await assert.rejects(vm.runInContext('staffForms.surveyForm(form)', c), /chọn phạm vi/);
  assert.equal(calls.length, 1);
});
test('UI disables open for unconfigured drafts and keeps OPEN read-only', () => {
  const { c } = environment();
  vm.runInContext("surveyFilters={};surveys=[{id:'s',status:'DRAFT',response_count:0}]", c);
  assert.match(vm.runInContext('surveyPage()', c), /data-action="open-survey"[^>]*disabled/);
  vm.runInContext("surveys[0].audience_config={mode:'ALL'}", c);
  assert.ok(vm.runInContext('surveyPage()', c).includes('data-action="open-survey"'));
  vm.runInContext("surveys[0].status='OPEN'", c);
  let html = vm.runInContext('surveyPage()', c);
  assert.ok(!html.includes('setup-legacy-audience'));
  assert.ok(!html.includes('Bổ sung người nhận'));
  vm.runInContext('surveys[0].audience_config=null', c);
  assert.ok(!vm.runInContext('surveyPage()', c).includes('setup-legacy-audience'));
  assert.ok(vm.runInContext('surveyPage()', c).includes('Khóa khẩn cấp'));
});

test('Question reader excludes audience fieldsets from create forms', () => {
  const { c } = environment();
  const question = {
    querySelector: (s) => ({
      value: {
        '[name="questionText"]': 'Question',
        '[name="questionType"]': 'TEXT',
        '[name="options"]': ''
      }[s],
      checked: true
    })
  };
  c.form = {
    querySelectorAll: (selector) =>
      selector === '#questions fieldset' ? [question] : [{ querySelector: () => null }, question]
  };
  const result = vm.runInContext('readSurveyQuestions(form)', c);
  assert.equal(result.length, 1);
  assert.equal(result[0].text, 'Question');
  assert.equal(result[0].required, true);
});
