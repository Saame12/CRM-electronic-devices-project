// One catalogue and age rule shared by Node and the browser.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CrmDomain = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const needs = ['Gaming', 'Đồ họa', 'Văn phòng', 'Chưa xác định'];
  const interests = [
    ['gaming', 'Gaming'],
    ['design', 'Đồ họa'],
    ['office', 'Văn phòng'],
    ['programming', 'Lập trình'],
    ['learning', 'Học tập'],
    ['other', 'Khác']
  ].map(([id, name]) => ({ id, name }));
  const today = () =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  function iso(value) {
    if (value instanceof Date)
      return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
    return typeof value === 'string' ? value.slice(0, 10) : '';
  }
  function age(value, asOf = today()) {
    const birth = iso(value),
      date = iso(asOf);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birth) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || birth > date)
      return null;
    const parsed = new Date(birth + 'T00:00:00Z');
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== birth) return null;
    const years =
      Number(date.slice(0, 4)) -
      Number(birth.slice(0, 4)) -
      (date.slice(5) < birth.slice(5) ? 1 : 0);
    return years >= 0 && years <= 120 ? years : null;
  }
  function interestIds(value = []) {
    if (
      !Array.isArray(value) ||
      value.some((id) => typeof id !== 'string' || !interests.some((x) => x.id === id))
    )
      throw Error('Sở thích không hợp lệ.');
    return [...new Set(value)];
  }
  function matches(customer, filters, asOf = today()) {
    if (filters.need && customer.need !== filters.need) return false;
    if (filters.interest && !(customer.interests || []).includes(filters.interest)) return false;
    const years = age(customer.birth_date || customer.birthDate, asOf);
    if (
      filters.minAge !== undefined &&
      filters.minAge !== '' &&
      (years === null || years < Number(filters.minAge))
    )
      return false;
    if (
      filters.maxAge !== undefined &&
      filters.maxAge !== '' &&
      (years === null || years > Number(filters.maxAge))
    )
      return false;
    return true;
  }
  return { needs, interests, today, iso, age, interestIds, matches };
});
