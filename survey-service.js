const { randomUUID: uid } = require('node:crypto');
const V = require('./crm-validation');
const Domain = require('./crm-domain');
const Interests = require('./customer-interests');
async function transaction(db, fn) {
  const c = await db.getConnection();
  try {
    await c.beginTransaction();
    const result = await fn(c);
    await c.commit();
    return result;
  } catch (e) {
    await c.rollback();
    throw e;
  } finally {
    c.release();
  }
}
async function today(c) {
  const [[clock]] = await c.query("SELECT DATE_FORMAT(CURDATE(),'%Y-%m-%d') today");
  return clock.today;
}
async function recipients(c, audience = { mode: 'ALL' }) {
  if (!audience || !['ALL', 'FILTER', 'SELECTED'].includes(audience.mode))
    V.fail('Cách chọn người nhận không hợp lệ.');
  const [users] = await c.query(
    "SELECT id,full_name,email,need,birth_date FROM users WHERE role='CUSTOMER' AND account_status='ACTIVE' ORDER BY id"
  );
  await Interests.attach(c, users);
  if (audience.mode === 'SELECTED') {
    const ids = audience.customerIds;
    if (
      !Array.isArray(ids) ||
      !ids.length ||
      ids.length > 10000 ||
      ids.some((x) => typeof x !== 'string') ||
      new Set(ids).size !== ids.length
    )
      V.fail('Cần danh sách khách được chọn hợp lệ, không trùng.');
    if (ids.some((id) => !users.some((u) => u.id === id)))
      V.fail('Danh sách có khách không tồn tại, sai vai trò hoặc đã khóa.');
    return users.filter((u) => ids.includes(u.id));
  }
  if (audience.mode === 'FILTER') {
    const filters = V.filters(audience.filters || {});
    if (!Object.keys(filters).length) V.fail('Hãy chọn ít nhất một điều kiện lọc người nhận.');
    const date = await today(c);
    return users.filter((u) => Domain.matches(u, filters, date));
  }
  return users;
}
async function publish(c, id, audience) {
  const [[survey]] = await c.execute('SELECT id,status FROM surveys WHERE id=? FOR UPDATE', [id]);
  if (!survey) V.fail('Không tìm thấy khảo sát.', 404);
  if (survey.status === 'CLOSED') V.fail('Khảo sát đã đóng.', 409);
  const users = await recipients(c, audience || { mode: 'ALL' });
  if (!users.length) V.fail('Không có khách đang hoạt động phù hợp.');
  for (const u of users)
    await c.execute('INSERT IGNORE INTO survey_recipients(survey_id,customer_id) VALUES (?,?)', [
      id,
      u.id
    ]);
  await c.execute("UPDATE surveys SET status='OPEN' WHERE id=?", [id]);
  return users.length;
}
async function writeQuestions(c, id, questions) {
  for (const [index, q] of questions.entries()) {
    const qid = uid();
    await c.execute(
      'INSERT INTO survey_questions(id,survey_id,question_text,question_type,is_required,display_order) VALUES (?,?,?,?,?,?)',
      [qid, id, q.text, q.type, q.required, index + 1]
    );
    for (const [i, text] of q.options.entries())
      await c.execute(
        'INSERT INTO question_options(id,question_id,option_text,display_order) VALUES (?,?,?,?)',
        [uid(), qid, text, i + 1]
      );
  }
}
async function create(db, actor, body) {
  const value = V.survey(body, true);
  return transaction(db, async (c) => {
    const id = uid();
    await c.execute(
      "INSERT INTO surveys(id,title,description,due_date,status,created_by) VALUES (?,?,?,?,'DRAFT',?)",
      [id, value.title, value.description, value.dueDate, actor]
    );
    await writeQuestions(c, id, value.questions);
    if (value.status === 'OPEN') await publish(c, id, body.audience);
    return id;
  });
}
async function update(db, id, body) {
  return transaction(db, async (c) => {
    const [[survey]] = await c.execute('SELECT id,status FROM surveys WHERE id=? FOR UPDATE', [id]);
    if (!survey) V.fail('Không tìm thấy khảo sát.', 404);
    if (survey.status === 'CLOSED') V.fail('Khảo sát đã đóng và không thể chỉnh sửa.', 409);
    const [[count]] = await c.execute(
      'SELECT COUNT(*) total FROM survey_responses WHERE survey_id=?',
      [id]
    );
    if (survey.status === 'OPEN') {
      if (Number(count.total) || body.status !== 'DRAFT')
        V.fail('Chỉ chuyển OPEN chưa có câu trả lời về DRAFT để chỉnh sửa.', 409);
      await c.execute("UPDATE surveys SET status='DRAFT' WHERE id=?", [id]);
      return;
    }
    const value = V.survey(body);
    await c.execute('UPDATE surveys SET title=?,description=?,due_date=?,status=? WHERE id=?', [
      value.title,
      value.description,
      value.dueDate,
      value.status === 'OPEN' ? 'DRAFT' : value.status,
      id
    ]);
    await c.execute('DELETE FROM survey_questions WHERE survey_id=?', [id]);
    await writeQuestions(c, id, value.questions);
    if (value.status === 'OPEN') await publish(c, id, body.audience);
  });
}
async function submit(db, id, customer, body) {
  return transaction(db, async (c) => {
    const [[survey]] = await c.execute(
      "SELECT id,status,DATE_FORMAT(due_date,'%Y-%m-%d') due FROM surveys WHERE id=? FOR UPDATE",
      [id]
    );
    if (!survey || survey.status !== 'OPEN') V.fail('Không tìm thấy khảo sát đang mở.', 404);
    if (survey.due && survey.due < (await today(c))) V.fail('Khảo sát đã quá hạn.', 410);
    const [[recipient]] = await c.execute(
      'SELECT customer_id FROM survey_recipients WHERE survey_id=? AND customer_id=?',
      [id, customer]
    );
    if (!recipient) V.fail('Bạn không thuộc danh sách nhận khảo sát.', 403);
    const [questions] = await c.execute(
      'SELECT * FROM survey_questions WHERE survey_id=? ORDER BY display_order',
      [id]
    );
    const [options] = await c.execute(
      'SELECT o.* FROM question_options o JOIN survey_questions q ON q.id=o.question_id WHERE q.survey_id=?',
      [id]
    );
    const details = V.answers(questions, options, body.answers);
    const response = uid();
    await c.execute('INSERT INTO survey_responses(id,survey_id,customer_id) VALUES (?,?,?)', [
      response,
      id,
      customer
    ]);
    for (const d of details)
      await c.execute(
        'INSERT INTO response_details(id,response_id,question_id,option_id,text_answer,rating_value) VALUES (?,?,?,?,?,?)',
        [uid(), response, d.questionId, d.optionId || null, d.text ?? null, d.rating ?? null]
      );
  });
}
async function close(db, id) {
  return transaction(db, async (c) => {
    const [[s]] = await c.execute('SELECT status FROM surveys WHERE id=? FOR UPDATE', [id]);
    if (!s || s.status === 'CLOSED') V.fail('Khảo sát đã đóng hoặc không tồn tại.', 409);
    await c.execute("UPDATE surveys SET status='CLOSED' WHERE id=?", [id]);
  });
}
module.exports = { transaction, today, recipients, publish, create, update, submit, close };
