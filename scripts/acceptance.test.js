const test = require('node:test'),
  assert = require('node:assert/strict');
const D = require('../crm-domain'),
  V = require('../crm-validation'),
  { buildOverview } = require('../reports-service');
const profile = {
  name: 'Khách',
  phone: '0901234567',
  addr: 'Hà Nội',
  birthDate: '2000-02-29',
  gender: 'Khác',
  need: 'Chưa xác định'
};
test('CL01 complete profile rejects every missing required field and invalid interests', () => {
  for (const key of ['name', 'phone', 'addr', 'birthDate', 'gender', 'need'])
    assert.throws(() => V.profile({ ...profile, [key]: '' }), V.InputError, key);
  assert.throws(() => V.profile({ ...profile, birthDate: '2999-01-01' }), V.InputError);
  assert.throws(() => V.profile({ ...profile, interests: ['invalid'] }), V.InputError);
  assert.throws(() => V.profile({ ...profile, interests: 'gaming' }), V.InputError);
  assert.equal(V.profile(profile).year, 2000);
  assert.deepEqual(V.profile({ ...profile, interests: ['gaming', 'gaming', 'design'] }).interests, [
    'gaming',
    'design'
  ]);
  assert.equal(V.profile({ name: 'Khách', phone: '0901234567' }, { complete: false }).year, null);
});
test('Manager creation requires birth date and gender while address can be completed later', () => {
  const options = { complete: false, requireBirthDate: true, requireGender: true };
  for (const key of ['birthDate', 'gender'])
    for (const value of ['', undefined])
      assert.throws(() => V.profile({ ...profile, [key]: value }, options), V.InputError);
  for (const birthDate of ['2001-02-29', '2999-01-01', '29/02/2000'])
    assert.throws(() => V.profile({ ...profile, birthDate }, options), V.InputError);
  for (const gender of ['Nam', 'Nữ', 'Khác'])
    assert.equal(V.profile({ ...profile, addr: '', gender }, options).gender, gender);
});

for (const type of ['ONE', 'MULTI', 'TEXT', 'RATING'])
  test('CL01 ' + type + ' validates required answers before persistence', () => {
    const qs = [{ id: 'q', question_type: type, is_required: 1, display_order: 1 }],
      os = [
        { id: 'a', question_id: 'q', option_text: 'A' },
        { id: 'b', question_id: 'q', option_text: 'B' }
      ];
    for (const v of [undefined, null, '', []])
      assert.throws(() => V.answers(qs, os, { q0: v }), V.InputError);
    const invalid = {
      ONE: [['A', 'B'], 'foreign'],
      MULTI: [['A', 'A'], ['foreign'], 'A'],
      TEXT: [42, {}],
      RATING: [0, 6, 2.5, '5']
    };
    for (const v of invalid[type]) assert.throws(() => V.answers(qs, os, { q0: v }), V.InputError);
    const valid = { ONE: 'A', MULTI: ['A', 'B'], TEXT: ' x ', RATING: 5 };
    assert.ok(V.answers(qs, os, { q0: valid[type] }).length);
    assert.throws(() => V.answers(qs, os, { q0: valid[type], q1: 'injected' }), V.InputError);
    assert.throws(() => V.answers(qs, os, []), V.InputError);
  });
for (const threshold of [18, 25, 35, 45])
  test('CL04 birthday boundary ' + threshold + ' matches reporting and filters', () => {
    const birth = `${2026 - threshold}-11-01`,
      u = { birth_date: birth, need: 'Gaming', interests: ['gaming'] };
    for (const [date, expected] of [
      ['2026-10-31', threshold - 1],
      ['2026-11-01', threshold],
      ['2026-11-02', threshold]
    ]) {
      assert.equal(D.age(birth, date), expected);
      assert.equal(D.matches(u, { minAge: threshold }, date), expected >= threshold);
      const r = buildOverview([u], [], [], new Date(date + 'T12:00:00+07:00'));
      const label =
        expected < 18
          ? 'Dưới 18'
          : expected < 25
            ? '18–24'
            : expected < 35
              ? '25–34'
              : expected < 45
                ? '35–44'
                : 'Từ 45 trở lên';
      assert.equal(r.customers.byAge.find((x) => x.label === label).total, 1);
      assert.equal(
        r.customers.byAge.reduce((n, x) => n + x.total, 0),
        1
      );
    }
  });
test('CL04 unknown dates are not invented from year; leap birthday uses calendar comparison', () => {
  assert.equal(D.age('2001-02-29', '2026-11-01'), null);
  assert.equal(D.age(null), null);
  assert.equal(D.age('2000-02-29', '2025-02-28'), 24);
  assert.equal(D.age('2000-02-29', '2025-03-01'), 25);
  assert.equal(D.matches({ birth_year: 2000 }, { minAge: 18 }, '2026-11-01'), false);
});
test('BB01 per-interest reports count distinct customers and allow combined percentage above 100', () => {
  const r = buildOverview(
    [{ interests: ['gaming', 'gaming', 'design'] }, { interests: ['gaming', 'design'] }],
    [],
    []
  ).customers;
  assert.equal(r.byInterest.find((x) => x.label === 'Gaming').total, 2);
  assert.equal(r.byInterest.find((x) => x.label === 'Đồ họa').percentage, 100);
});
test('BB02 malformed or reversed audience filters are rejected', () => {
  for (const f of [
    { minAge: 25, maxAge: 18 },
    { minAge: -1 },
    { maxAge: 121 },
    { interest: 'bad' },
    { need: 'bad' }
  ])
    assert.throws(() => V.filters(f), V.InputError);
});

test('BB02 create/edit expose scope and OPEN offers only the approved operations', () => {
  const vm = require('node:vm'),
    fs = require('node:fs'),
    path = require('node:path'),
    host = { innerHTML: '' };
  const c = vm.createContext({
    $: () => host,
    esc: (x) => String(x),
    surveyFilters: {},
    surveys: [{ id: 's', title: 'Test', description: 'Test', status: 'OPEN', response_count: 1 }]
  });
  for (const f of ['crm-domain.js', 'customer-fields.js', 'staff-surveys.js'])
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), c);
  assert.ok(vm.runInContext('createForm()', c).includes('name="audienceMode"'));
  vm.runInContext(
    "result=surveyEditorForm({survey:{id:'s',title:'Test',description:'Test'},questions:[]})",
    c
  );
  assert.ok(vm.runInContext('result',c).includes('name="audienceMode"'));
  assert.ok(vm.runInContext('surveyPage()', c).includes('Xem khảo sát'));
  assert.ok(!vm.runInContext('surveyPage()', c).includes('setup-legacy-audience'));
  vm.runInContext("surveys[0].audience_config={mode:'ALL',filters:{},customerIds:[]}",c);
  assert.ok(!vm.runInContext('surveyPage()', c).includes('setup-legacy-audience'));
  assert.ok(!vm.runInContext('surveyPage()', c).includes('Bổ sung người nhận'));
});

test('CL01 different representations of the same MULTI option cannot be submitted twice', () => {
  assert.throws(
    () =>
      V.answers(
        [{ id: 'q', question_type: 'MULTI', is_required: 1, display_order: 1 }],
        [{ id: 'option-id', question_id: 'q', option_text: 'A' }],
        { q0: ['A', 'option-id'] }
      ),
    V.InputError
  );
});
