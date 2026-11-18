// Ngày sinh là nguồn duy nhất; không suy ra ngày/tháng từ năm sinh cũ.
async function ensureSchema(db) {
  const [columns] = await db.query(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND COLUMN_NAME IN ('birth_date','birth_year')"
  );
  const names = new Set(columns.map((column) => column.COLUMN_NAME));
  if (!names.has('birth_date'))
    await db.query('ALTER TABLE users ADD COLUMN birth_date DATE NULL');
  if (names.has('birth_year')) await db.query('ALTER TABLE users DROP COLUMN birth_year');
}
module.exports = { ensureSchema };
