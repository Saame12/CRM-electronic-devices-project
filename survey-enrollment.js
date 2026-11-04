// Only explicitly public surveys enroll future customers. Legacy scopes remain private by default.
const { TODAY_SQL } = require('./survey-expiry');
async function ensureSchema(db) {
  const [columns] = await db.query(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='surveys' AND COLUMN_NAME='accept_new_customers'"
  );
  if (!columns.length)
    await db.query(
      'ALTER TABLE surveys ADD COLUMN accept_new_customers BOOLEAN NOT NULL DEFAULT FALSE'
    );
}
async function enroll(connection, customerId) {
  // Serialize with publish/close; never add expired, draft or closed surveys.
  const [surveys] = await connection.query(
    `SELECT id FROM surveys WHERE status='OPEN' AND accept_new_customers=TRUE AND (due_date IS NULL OR due_date>=${TODAY_SQL}) ORDER BY id FOR UPDATE`
  );
  let added = 0;
  for (const survey of surveys) {
    const [result] = await connection.execute(
      "INSERT IGNORE INTO survey_recipients(survey_id,customer_id) SELECT ?,id FROM users WHERE id=? AND role='CUSTOMER' AND account_status='ACTIVE'",
      [survey.id, customerId]
    );
    added += result.affectedRows;
  }
  return added;
}
function register(app, db, auth, wrap, transaction) {
  app.post(
    '/api/surveys/sync',
    auth,
    wrap(async (req, res) => {
      res.set('Cache-Control', 'no-store');
      if (req.user.role !== 'CUSTOMER')
        return res.status(403).json({ error: 'Chỉ dành cho khách hàng.' });
      const added = await transaction(db, (c) => enroll(c, req.user.id));
      res.json({ added });
    })
  );
}
module.exports = { ensureSchema, enroll, register };
