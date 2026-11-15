// Dùng chung ở giao diện và backend để kiểm tra ngày sinh thống nhất.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else {
    root.BirthDate = factory();
    root.BirthDate.bindDocument(root.document);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function today() {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  }
  function validISO(value, limit = today()) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [y, m, d] = value.split('-').map(Number),
      date = new Date(Date.UTC(y, m - 1, d));
    return (
      y >= 1000 &&
      date.getUTCFullYear() === y &&
      date.getUTCMonth() === m - 1 &&
      date.getUTCDate() === d &&
      value <= limit
    );
  }
  function parse(value, limit = today()) {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(value || '').trim());
    if (!match) return null;
    const iso = `${match[3]}-${match[2]}-${match[1]}`;
    return validBirthISO(iso, limit) ? iso : null;
  }
  function validBirthISO(value, asOf = today()) {
    if (!validISO(value, asOf)) return false;
    const years =
      Number(asOf.slice(0, 4)) -
      Number(value.slice(0, 4)) -
      (asOf.slice(5) < value.slice(5) ? 1 : 0);
    return years >= 0 && years <= 120;
  }
  function error(value, format = 'text', asOf = today()) {
    if (!String(value || '').trim()) return 'Vui lòng nhập ngày sinh.';
    const valid = format === 'iso' ? validBirthISO(value, asOf) : parse(value, asOf);
    return valid
      ? ''
      : 'Tuổi không đúng quy định. Ngày sinh phải đúng dd/mm/yyyy, có thật, không ở tương lai và tuổi từ 0 đến 120.';
  }
  function bindDocument(doc) {
    if (!doc?.addEventListener) return;
    let sequence = 0;
    function validate(field, show) {
      if (!field?.matches?.('input[name="birthDate"], input[name="birthDateText"]')) return;
      const message = error(field.value);
      field.setCustomValidity(message);
      field.setAttribute('aria-invalid', message && show ? 'true' : 'false');
      let hint = field.parentElement.querySelector('[data-birth-error]');
      if (!hint && message && show) {
        hint = doc.createElement('small');
        hint.id = 'birth-error-' + ++sequence;
        hint.className = 'err error';
        hint.setAttribute('data-birth-error', '');
        hint.setAttribute('role', 'alert');
        field.insertAdjacentElement('afterend', hint);
        field.setAttribute(
          'aria-describedby',
          [field.getAttribute('aria-describedby'), hint.id].filter(Boolean).join(' ')
        );
      }
      if (hint) {
        hint.textContent = show ? message : '';
        hint.hidden = !show || !message;
      }
    }
    doc.addEventListener('input', (e) =>
      validate(e.target, !e.target.value || e.target.value.length >= 10)
    );
    doc.addEventListener('focusout', (e) => validate(e.target, true));
    doc.addEventListener('invalid', (e) => validate(e.target, true), true);
  }
  function fromDatabase(value) {
    if (!value) return '';
    if (value instanceof Date)
      return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
    return String(value).slice(0, 10);
  }
  function display(value) {
    const iso = fromDatabase(value);
    return /^\d{4}-\d{2}-\d{2}$/.test(iso)
      ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`
      : '';
  }
  return { parse, validISO, validBirthISO, error, bindDocument, display, fromDatabase };
});
