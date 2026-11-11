// The default value is not proof that the customer selected a need themselves.
async function ensureSchema(db) {
  const [columns] = await db.query(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND COLUMN_NAME='need_confirmed'"
  );
  if (!columns.length) {
    await db.query('ALTER TABLE users ADD COLUMN need_confirmed BOOLEAN NOT NULL DEFAULT FALSE');
    // Old concrete needs are evidence of a choice. Old default values need confirmation once.
    await db.query(
      "UPDATE users SET need_confirmed=TRUE WHERE need IN ('Gaming','Đồ họa','Văn phòng')"
    );
  }
}
module.exports = { ensureSchema };
