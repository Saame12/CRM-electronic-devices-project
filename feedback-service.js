const V = require('./crm-validation');
const { transaction } = require('./survey-service');
const types = ['Góp ý', 'Khen ngợi', 'Báo lỗi / Khiếu nại', 'Câu hỏi'];
async function ensureSchema(db) {
  const [columns] = await db.query(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='feedback' AND COLUMN_NAME='revision'"
  );
  if (!columns.length)
    await db.query('ALTER TABLE feedback ADD COLUMN revision INT NOT NULL DEFAULT 0');
  await db.query(
    "UPDATE feedback SET status=CASE WHEN TRIM(COALESCE(reply_content,''))='' THEN 'NEW' ELSE 'RESOLVED' END WHERE status='IN_PROGRESS' OR (status='RESOLVED' AND TRIM(COALESCE(reply_content,''))='') OR (status='NEW' AND TRIM(COALESCE(reply_content,''))<>'')"
  );
  const [status] = await db.query(
    "SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='feedback' AND COLUMN_NAME='status'"
  );
  if (status.some((c) => c.COLUMN_TYPE.includes('IN_PROGRESS')))
    await db.query(
      "ALTER TABLE feedback MODIFY status ENUM('NEW','RESOLVED') NOT NULL DEFAULT 'NEW'"
    );
}
function value(body) {
  const title = String(body.title || '').trim(),
    text = String(body.body || '').trim();
  if (
    !types.includes(body.type) ||
    !Number.isInteger(body.rate) ||
    body.rate < 1 ||
    body.rate > 5 ||
    !text ||
    text.length > 5000 ||
    title.length > 80
  )
    V.fail('Sản phẩm, loại, đánh giá hoặc nội dung phản hồi không hợp lệ.');
  return { title, text };
}
async function edit(db, id, customer, body) {
  const v = value(body);
  return transaction(db, async (c) => {
    const [[f]] = await c.execute(
      'SELECT id,revision FROM feedback WHERE id=? AND customer_id=? FOR UPDATE',
      [id, customer]
    );
    if (!f) V.fail('Không tìm thấy phản hồi của bạn.', 404);
    if (body.revision !== f.revision)
      V.fail('Phản hồi đã thay đổi. Hãy tải lại trước khi chỉnh sửa.', 409);
    const [[product]] = await c.execute('SELECT id FROM products WHERE name=?', [body.prod]);
    if (!product) V.fail('Sản phẩm không hợp lệ.');
    await c.execute(
      "UPDATE feedback SET product_id=?,feedback_type=?,rating=?,title=?,body=?,status='NEW',reply_content=NULL,replied_by=NULL,replied_at=NULL,is_hidden=FALSE,hidden_at=NULL,revision=revision+1 WHERE id=?",
      [product.id, body.type, body.rate, v.title, v.text, id]
    );
  });
}
async function reply(db, id, actor, body) {
  const reply = String(body.reply || '').trim();
  if (!reply || reply.length > 5000) V.fail('Cần nhập câu trả lời từ 1 đến 5000 ký tự.');
  return transaction(db, async (c) => {
    const [[f]] = await c.execute(
      'SELECT f.revision,f.reply_content FROM feedback f JOIN users u ON u.id=f.customer_id WHERE f.id=? AND u.erased_at IS NULL FOR UPDATE',
      [id]
    );
    if (!f) V.fail('Không tìm thấy phản hồi.', 404);
    if (body.revision !== f.revision)
      V.fail('Phản hồi hoặc câu trả lời đã thay đổi. Hãy tải lại trước khi lưu.', 409);
    if (body.editReply === true && !f.reply_content)
      V.fail('Chưa có câu trả lời để chỉnh sửa. Hãy tải lại phản hồi.', 409);
    if (f.reply_content && body.editReply !== true)
      V.fail('Phản hồi đã được trả lời. Hãy chọn Chỉnh sửa để cập nhật câu trả lời.', 409);
    await c.execute(
      "UPDATE feedback SET reply_content=?,status='RESOLVED',replied_by=?,replied_at=NOW(),revision=revision+1 WHERE id=?",
      [reply, actor, id]
    );
  });
}
function register(app, db, auth, wrap) {
  const customer = (req, res, next) =>
    req.user.role === 'CUSTOMER'
      ? next()
      : res.status(403).json({ error: 'Chỉ dành cho khách hàng.' });
  app.patch(
    '/api/feedback/:id',
    auth,
    customer,
    wrap(async (req, res) => {
      await edit(db, req.params.id, req.user.id, req.body);
      res.json({ message: 'Đã sửa phản hồi. Câu trả lời cũ được xóa; phản hồi trở về Tiếp nhận.' });
    })
  );
  app.delete(
    '/api/feedback/:id',
    auth,
    customer,
    wrap(async (req, res) => {
      const [r] = await db.execute('DELETE FROM feedback WHERE id=? AND customer_id=?', [
        req.params.id,
        req.user.id
      ]);
      if (!r.affectedRows) V.fail('Không tìm thấy phản hồi của bạn.', 404);
      res.json({ message: 'Đã xóa phản hồi và câu trả lời của Quản lý.' });
    })
  );
}
module.exports = { ensureSchema, value, edit, reply, register };
