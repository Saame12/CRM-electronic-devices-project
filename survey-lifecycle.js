const { randomUUID } = require('node:crypto');
const V = require('./crm-validation');
const Audience = require('./survey-audience');
const Surveys = require('./survey-service');

async function ensureSchema(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS survey_lifecycle_history (
    id CHAR(36) PRIMARY KEY, survey_id CHAR(36) NOT NULL, actor_id CHAR(36) NOT NULL,
    action VARCHAR(20) NOT NULL, old_due_date DATE NULL, new_due_date DATE NULL,
    old_status VARCHAR(10) NOT NULL, new_status VARCHAR(10) NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (survey_id) REFERENCES surveys(id),
    FOREIGN KEY (actor_id) REFERENCES users(id), INDEX idx_survey_history(survey_id,created_at)
  ) ENGINE=InnoDB`);
}
function ending(body, today, survey) {
  if (!['DATE', 'MANUAL'].includes(body.endMode)) V.fail('Hãy chọn cách kết thúc khảo sát.');
  if (body.endMode === 'MANUAL') {
    if (body.dueDate) V.fail('Đóng thủ công không có ngày kết thúc.');
    if (survey.status === 'OPEN' && !survey.due) V.fail('Khảo sát đã được đặt đóng thủ công.', 409);
    return null;
  }
  const date = body.dueDate;
  if (!require('./birth-date').validISO(date, '9999-12-31') || date < today)
    V.fail('Ngày kết thúc phải từ hôm nay trở đi, theo giờ Việt Nam.');
  if (survey.status === 'OPEN' && survey.due && date <= survey.due)
    V.fail('Ngày gia hạn phải muộn hơn hạn hiện tại.');
  return date;
}
async function change(db, id, actor, body) {
  return Surveys.transaction(db, async (c) => {
    const [[s]] = await c.execute(
      "SELECT id,status,audience_config,DATE_FORMAT(due_date,'%Y-%m-%d') due FROM surveys WHERE id=? FOR UPDATE",
      [id]
    );
    if (!s) V.fail('Không tìm thấy khảo sát.', 404);
    if (!['EXTEND', 'REOPEN'].includes(body.action)) V.fail('Thao tác không hợp lệ.');
    if (s.status !== (body.action === 'EXTEND' ? 'OPEN' : 'CLOSED'))
      V.fail('Trạng thái khảo sát đã thay đổi. Hãy tải lại danh sách.', 409);
    const due = ending(body, await Surveys.today(c), s);
    const config = Audience.normalize(Audience.parse(s.audience_config), { required: true });
    if (body.action === 'REOPEN') {
      const [[count]] = await c.execute(
        'SELECT COUNT(*) total FROM survey_recipients WHERE survey_id=?',
        [id]
      );
      if (!Number(count.total))
        V.fail(
          'Khảo sát chưa có người nhận. Hãy lập bản nháp mới để thiết lập và mở khảo sát.',
          409
        );
      // Fixed FILTER/SELECTED snapshots stay intact. ALL includes active newcomers.
      if (config.mode === 'ALL')
        await c.execute(
          "INSERT IGNORE INTO survey_recipients(survey_id,customer_id) SELECT ?,id FROM users WHERE role='CUSTOMER' AND account_status='ACTIVE'",
          [id]
        );
    }
    await c.execute(
      "UPDATE surveys SET status='OPEN',due_date=?,auto_closed_at=NULL,accept_new_customers=? WHERE id=?",
      [due, config.mode === 'ALL', id]
    );
    await c.execute(
      "INSERT INTO survey_lifecycle_history(id,survey_id,actor_id,action,old_due_date,new_due_date,old_status,new_status,created_at) VALUES (?,?,?,?,?,?,?,'OPEN',UTC_TIMESTAMP())",
      [randomUUID(), id, actor, body.action, s.due, due, s.status]
    );
    return { status: 'OPEN', dueDate: due };
  });
}
function register(app, db, auth, manager, wrap) {
  app.post(
    '/api/admin/surveys/:id/lifecycle',
    auth,
    manager,
    wrap(async (req, res) => {
      res.json(await change(db, req.params.id, req.user.id, req.body));
    })
  );
  app.get(
    '/api/admin/surveys/:id/lifecycle',
    auth,
    manager,
    wrap(async (req, res) => {
      const [[survey]] = await db.execute(
        "SELECT id,title,status,DATE_FORMAT(auto_closed_at,'%Y-%m-%dT%H:%i:%s') auto_closed_at FROM surveys WHERE id=?",
        [req.params.id]
      );
      if (!survey) V.fail('Không tìm thấy khảo sát.', 404);
      const [history] = await db.execute(
        "SELECT h.action,DATE_FORMAT(h.old_due_date,'%Y-%m-%d') oldDueDate,DATE_FORMAT(h.new_due_date,'%Y-%m-%d') newDueDate,h.old_status,h.new_status,DATE_FORMAT(h.created_at,'%Y-%m-%dT%H:%i:%s') created_at,u.full_name actor FROM survey_lifecycle_history h JOIN users u ON u.id=h.actor_id WHERE h.survey_id=? ORDER BY h.created_at DESC,h.id DESC",
        [req.params.id]
      );
      res.set('Cache-Control', 'no-store');
      res.json({ survey, history });
    })
  );
}
module.exports = { ensureSchema, ending, change, register };
