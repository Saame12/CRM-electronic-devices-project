function register(app, db, auth, staff, wrap) {
  app.get(
    '/api/admin/customers/:id/history',
    auth,
    staff,
    wrap(async (req, res) => {
      const page = Number(req.query.page || 1),
        pageSize = Number(req.query.pageSize || 10);
      if (
        !Number.isInteger(page) ||
        page < 1 ||
        page > 100000 ||
        !Number.isInteger(pageSize) ||
        pageSize < 1 ||
        pageSize > 50
      )
        return res
          .status(400)
          .json({ error: 'Trang phải là số nguyên dương; kích thước trang từ 1 đến 50.' });
      const [[user]] = await db.execute("SELECT id FROM users WHERE id=? AND role='CUSTOMER'", [
        req.params.id
      ]);
      if (!user) return res.status(404).json({ error: 'Không tìm thấy khách hàng.' });
      const union = `SELECT id,'PROFILE_CREATED' kind,created_at occurred_at,'Tạo hồ sơ khách hàng' title FROM users WHERE id=?
      UNION ALL SELECT id,'FEEDBACK_SENT',created_at,title FROM feedback WHERE customer_id=?
      UNION ALL SELECT id,'FEEDBACK_REPLIED',replied_at,title FROM feedback WHERE customer_id=? AND replied_at IS NOT NULL
      UNION ALL SELECT r.id,'SURVEY_SUBMITTED',r.submitted_at,s.title FROM survey_responses r JOIN surveys s ON s.id=r.survey_id WHERE r.customer_id=?`;
      const args = Array(4).fill(req.params.id);
      const [[count]] = await db.execute(
        'SELECT COUNT(*) total FROM (' + union + ') history',
        args
      );
      const [events] = await db.query(
        'SELECT * FROM (' + union + ') history ORDER BY occurred_at DESC,kind,id LIMIT ? OFFSET ?',
        [...args, pageSize, (page - 1) * pageSize]
      );
      res.set('Cache-Control', 'no-store');
      res.json({ page, pageSize, total: Number(count.total), events });
    })
  );
}
module.exports = { register };
