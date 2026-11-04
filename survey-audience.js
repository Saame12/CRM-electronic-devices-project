const V = require('./crm-validation');
function parse(value) {
  return value == null ? null : typeof value === 'string' ? JSON.parse(value) : value;
}
function normalize(value, { required = false } = {}) {
  if (value == null || value.mode === '') {
    if (required) V.fail('Phải chọn phạm vi người nhận trước khi mở khảo sát.');
    return null;
  }
  if (typeof value !== 'object' || !['ALL', 'FILTER', 'SELECTED'].includes(value.mode))
    V.fail('Phạm vi người nhận không hợp lệ.');
  const filters = V.filters(value.filters || {});
  if (value.mode === 'ALL' && Object.keys(filters).length)
    V.fail('Phạm vi Tất cả không dùng bộ lọc.');
  if (value.mode === 'FILTER' && !Object.keys(filters).length)
    V.fail('Phạm vi Theo bộ lọc cần ít nhất một điều kiện.');
  let customerIds = [];
  if (value.mode === 'SELECTED') {
    customerIds = value.customerIds;
    if (
      !Array.isArray(customerIds) ||
      !customerIds.length ||
      customerIds.length > 10000 ||
      customerIds.some((id) => typeof id !== 'string' || !id) ||
      new Set(customerIds).size !== customerIds.length
    )
      V.fail('Phải chọn danh sách khách hợp lệ, không trùng trước khi mở.');
  }
  return { mode: value.mode, filters, customerIds };
}
async function ensureSchema(db) {
  const [columns] = await db.query(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='surveys' AND COLUMN_NAME='audience_config'"
  );
  if (!columns.length) await db.query('ALTER TABLE surveys ADD COLUMN audience_config JSON NULL');
  // The prior public flag is explicit evidence of ALL, unlike a mere recipient count.
  await db.query(
    "UPDATE surveys SET audience_config=JSON_OBJECT('mode','ALL','filters',JSON_OBJECT(),'customerIds',JSON_ARRAY()) WHERE audience_config IS NULL AND accept_new_customers=TRUE"
  );
}
module.exports = { parse, normalize, ensureSchema };
