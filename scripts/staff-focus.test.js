const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const theme = read('staff-focus.css');

function luminance(hex) {
  const channels = hex
    .replace('#', '')
    .match(/../g)
    .map((value) => {
      const n = parseInt(value, 16) / 255;
      return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
    });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
const contrast = (text, background) => {
  const a = luminance(text),
    b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

test('Both staff portals load the shared focus theme after other styles and it is publicly served', () => {
  for (const file of ['admin.html', 'manager.html']) {
    const styles = [...read(file).matchAll(/href="([^"]+\.css)"/g)].map((m) => m[1]);
    assert.equal(styles.at(-1), 'staff-focus.css');
  }
  let allowed = false;
  require('../public-assets')(
    { path: '/staff-focus.css', method: 'GET' },
    {
      status() {
        throw Error('Theme blocked');
      }
    },
    () => {
      allowed = true;
    }
  );
  assert.ok(allowed);
});

test('Core text, active navigation, buttons and status labels meet 4.5:1 contrast', () => {
  const pairs = [
    ['#23343b', '#fbfcfa'],
    ['#52646a', '#eef2ef'],
    ['#52646a', '#fbfcfa'],
    ['#3d535b', '#e4ebe6'],
    ['#294e68', '#dce7ed'],
    ['#ffffff', '#365d78'],
    ['#825315', '#fff0d6'],
    ['#34577b', '#e5edf8'],
    ['#286044', '#e6f0e7'],
    ['#52615b', '#e9edeb'],
    ['#a4313d', '#fae9ed']
  ];
  for (const [text, bg] of pairs) {
    assert.ok(contrast(text, bg) >= 4.5, `${text} on ${bg}`);
    if (text !== '#ffffff') assert.ok(theme.includes(text));
    assert.ok(theme.includes(bg));
  }
});

test('Important status classes retain explicit readable styling and table rows are differentiated', () => {
  for (const status of ['NEW', 'IN_PROGRESS', 'RESOLVED', 'OPEN', 'DRAFT', 'CLOSED', 'locked'])
    assert.ok(theme.includes('.badge.' + status));
  assert.ok(theme.includes('.table tbody tr:nth-child(even)'));
  assert.ok(theme.includes('.table tbody tr:hover'));
  assert.ok(theme.includes(':focus-visible'));
});
