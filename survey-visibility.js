/* Hidden surveys remain active for customers and are still counted in reports. */
function surveyDateFilter(query) {
  const from = String(query.from || ''),
    to = String(query.to || ''),
    field = String(query.dateField || 'created');
  if (!['created', 'due'].includes(field))
    throw Error('Chọn ngày tạo hoặc ngày kết thúc để lọc khảo sát.');
  const valid = require('./birth-date').validISO;
  if (
    (from && !valid(from, '9999-12-31')) ||
    (to && !valid(to, '9999-12-31')) ||
    (from && to && from > to)
  )
    throw Error('Khoảng thời gian không hợp lệ. Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');
  const column = field === 'due' ? 's.due_date' : 's.created_at';
  return {
    sql:
      (from ? ` AND ${column} >= ?` : '') +
      (to ? ` AND ${column} < DATE_ADD(?,INTERVAL 1 DAY)` : ''),
    values: [...(from ? [from] : []), ...(to ? [to] : [])]
  };
}
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
      let dateFilter;
      try {
        dateFilter = surveyDateFilter(req.query);
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
      if (req.query.page !== undefined) {
        const rawPage = String(req.query.page),
          rawSize = String(req.query.pageSize || 20);
        if (
          !/^[1-9]\d{0,6}$/.test(rawPage) ||
          !['10', '20', '50', '100'].includes(rawSize) ||
          !['', 'DRAFT', 'OPEN', 'CLOSED'].includes(status)
        )
          return res
            .status(400)
            .json({ error: 'Trang, số dòng hoặc trạng thái khảo sát không hợp lệ.' });
        const result = await require('./survey-service').transaction(db, async (c) => {
          const [groups] = await c.execute(
            'SELECT status,COUNT(*) total FROM surveys s WHERE is_hidden=? AND (title LIKE ? OR description LIKE ?)' +
              dateFilter.sql +
              ' GROUP BY status',
            [hidden === 'true', q, q, ...dateFilter.values]
          );
          const counts = { ALL: 0, DRAFT: 0, OPEN: 0, CLOSED: 0 };
          for (const row of groups) {
            counts[row.status] = Number(row.total);
            counts.ALL += Number(row.total);
          }
          const total = counts[status || 'ALL'],
            pageSize = Number(rawSize),
            totalPages = Math.max(1, Math.ceil(total / pageSize)),
            page = Math.min(Number(rawPage), totalPages);
          const values = [hidden === 'true', q, q, ...dateFilter.values];
          let sql =
            "SELECT s.*,DATE_FORMAT(s.due_date,'%Y-%m-%d') due_date,(SELECT COUNT(*) FROM survey_responses r WHERE r.survey_id=s.id) response_count FROM surveys s WHERE s.is_hidden=? AND (s.title LIKE ? OR s.description LIKE ?)";
          sql += dateFilter.sql;
          if (status) {
            sql += ' AND s.status=?';
            values.push(status);
          }
          // Integers above are validated and bounded; ties use id for stable paging.
          sql += ` ORDER BY s.created_at DESC,s.id DESC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;
          const [surveys] = await c.execute(sql, values);
          return { surveys, pagination: { page, pageSize, total, totalPages, counts } };
        });
        res.set?.('Cache-Control', 'no-store');
        return res.json(result);
      }
      let sql =
          "SELECT s.*,DATE_FORMAT(s.due_date,'%Y-%m-%d') due_date,COUNT(DISTINCT r.id) response_count FROM surveys s LEFT JOIN survey_responses r ON r.survey_id=s.id WHERE s.is_hidden=? AND (s.title LIKE ? OR s.description LIKE ?)",
        values = [hidden === 'true', q, q, ...dateFilter.values];
      sql += dateFilter.sql;
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
