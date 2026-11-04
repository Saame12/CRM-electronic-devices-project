// Deadlines end at midnight in Vietnam, independently of the host/MySQL timezone.
const TODAY_SQL = 'DATE(UTC_TIMESTAMP() + INTERVAL 7 HOUR)';
async function ensureSchema(db) {
  const [columns] = await db.query(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='surveys' AND COLUMN_NAME='auto_closed_at'"
  );
  if (!columns.length)
    await db.query('ALTER TABLE surveys ADD COLUMN auto_closed_at DATETIME NULL');
}
async function closeExpired(db) {
  const [result] = await db.query(
    `UPDATE surveys SET status='CLOSED',auto_closed_at=UTC_TIMESTAMP() WHERE status='OPEN' AND due_date IS NOT NULL AND due_date < ${TODAY_SQL}`
  );
  return result.affectedRows;
}
function untilMidnight(now = Date.now()) {
  const day = 86400000;
  return day - ((now + 7 * 3600000) % day);
}
function schedule(db, { setTimer = setTimeout, onError = console.error } = {}) {
  let timer, stopped = false;
  function arm(delay) {
    timer = setTimer(async () => {
      try {
        await closeExpired(db);
        if (!stopped) arm(untilMidnight());
      } catch (error) {
        onError('Không thể tự đóng khảo sát hết hạn:', error);
        if (!stopped) arm(60000);
      }
    }, delay);
    timer.unref?.();
  }
  arm(untilMidnight());
  return () => { stopped = true; clearTimeout(timer); };
}
module.exports = { TODAY_SQL, ensureSchema, closeExpired, untilMidnight, schedule };
