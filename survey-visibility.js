/* Hidden surveys remain active for customers and are still counted in reports. */
async function ensureSchema(db) {
  const [columns] = await db.query(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='surveys'"
  );
  const names = new Set(columns.map((c) => c.COLUMN_NAME));
  for (const [column, definition] of [
    ['is_hidden', 'is_hidden BOOLEAN NOT NULL DEFAULT FALSE'],
    ['hidden_at', 'hidden_at DATETIME NULL']
  ])
    if (!names.has(column)) await db.query('ALTER TABLE surveys ADD COLUMN ' + definition);
}
function register(app, db, auth, manager, wrap) {
  app.get(
    '/api/admin/surveys',
    auth,
    manager,
    wrap(async (req, res) => {
      const q = '%' + String(req.query.q || '').trim() + '%',
        status = String(req.query.status || ''),
        hidden = String(req.query.hidden ?? 'false');
      if (!['true', 'false'].includes(hidden))
        return res.status(400).json({ error: 'Bộ lọc ẩn không hợp lệ.' });
      let sql =
          'SELECT s.*,COUNT(DISTINCT r.id) response_count FROM surveys s LEFT JOIN survey_responses r ON r.survey_id=s.id WHERE s.is_hidden=? AND (s.title LIKE ? OR s.description LIKE ?)',
        values = [hidden === 'true', q, q];
      if (['DRAFT', 'OPEN', 'CLOSED'].includes(status)) {
        sql += ' AND s.status=?';
        values.push(status);
      }
      sql += ' GROUP BY s.id ORDER BY s.created_at DESC';
      const [rows] = await db.execute(sql, values);
      res.set?.('Cache-Control', 'no-store');
      res.json({ surveys: rows });
    })
  );
  // LOGIC: Ẩn/khôi phục dùng chung cho Quản lý, lưu MySQL. Chỉ đổi is_hidden và hidden_at.
  // Không đổi status/due_date/responses; không ngăn khách làm phiếu OPEN và không loại khỏi báo cáo.
  app.patch(
    '/api/admin/surveys/:id/visibility',
    auth,
    manager,
    wrap(async (req, res) => {
      if (typeof req.body.hidden !== 'boolean')
        return res.status(400).json({ error: 'Trạng thái ẩn phải là true hoặc false.' });
      const [[survey]] = await db.execute('SELECT id FROM surveys WHERE id=?', [req.params.id]);
      if (!survey) return res.status(404).json({ error: 'Không tìm thấy khảo sát.' });
      await db.execute(
        'UPDATE surveys SET is_hidden=?,hidden_at=CASE WHEN ? THEN COALESCE(hidden_at,NOW()) ELSE NULL END WHERE id=?',
        [req.body.hidden, req.body.hidden, req.params.id]
      );
      res.json({
        message: req.body.hidden
          ? 'Đã ẩn khảo sát khỏi danh sách Quản lý. Khảo sát không bị đóng hoặc xóa.'
          : 'Đã khôi phục khảo sát vào danh sách Quản lý.'
      });
    })
  );
}
module.exports = { ensureSchema, register };
