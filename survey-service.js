const { randomUUID: uid } = require('node:crypto');
const V = require('./crm-validation');
const Domain = require('./crm-domain');
const Interests = require('./customer-interests');
const Audience = require('./survey-audience');
const { TODAY_SQL } = require('./survey-expiry');
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
  const [[clock]] = await c.query(`SELECT DATE_FORMAT(${TODAY_SQL},'%Y-%m-%d') today`);
  return clock.today;
}
async function recipients(c, audience = { mode: 'ALL' }, asOf) {
  if (!audience || !['ALL', 'FILTER', 'SELECTED'].includes(audience.mode))
    V.fail('Cách chọn người nhận không hợp lệ.');
  const [users] = await c.query(
    "SELECT id,full_name,email,need,DATE_FORMAT(birth_date,'%Y-%m-%d') birth_date FROM users WHERE role='CUSTOMER' AND account_status='ACTIVE' ORDER BY id"
  );
  await Interests.attach(c, users);
  const filters = V.filters(audience.filters || {});
  if (audience.mode === 'ALL' && Object.keys(filters).length)
    V.fail('Đã chọn điều kiện lọc. Hãy dùng Theo bộ lọc hoặc Chọn từng khách.');
  const date = Object.keys(filters).length ? asOf || (await today(c)) : null;
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
    const selected = users.filter((u) => ids.includes(u.id));
    if (selected.some((u) => !Domain.matches(u, filters, date)))
      V.fail(
        'Danh sách được chọn có khách không khớp sở thích, nhu cầu hoặc khoảng tuổi. Hãy tải lại danh sách đã lọc.'
      );
    return selected;
  }
  if (audience.mode === 'FILTER') {
    if (!Object.keys(filters).length) V.fail('Hãy chọn ít nhất một điều kiện lọc người nhận.');
    return users.filter((u) => Domain.matches(u, filters, date));
  }
  return users;
}
async function publish(c, id, audience) {
  const [[survey]] = await c.execute(
    "SELECT id,status,audience_config,DATE_FORMAT(due_date,'%Y-%m-%d') due FROM surveys WHERE id=? FOR UPDATE",
    [id]
  );
  if (!survey) V.fail('Không tìm thấy khảo sát.', 404);
  if (survey.status === 'CLOSED') V.fail('Khảo sát đã đóng.', 409);
  if (survey.due && survey.due < (await today(c)))
    V.fail('Không thể mở khảo sát đã quá hạn. Hãy sửa hạn trong bản nháp.', 410);
  let config = Audience.parse(survey.audience_config);
  const legacySetup = survey.status === 'OPEN';
  if (survey.status === 'OPEN') {
    if (config)
      V.fail('Khảo sát đã mở với phạm vi đã thiết lập; không hỗ trợ bổ sung lại người nhận.', 409);
    config = Audience.normalize(audience, { required: true });
  } else {
    if (audience !== undefined)
      V.fail('Hãy thiết lập hoặc sửa phạm vi trong bản nháp trước khi mở.', 409);
    config = Audience.normalize(config, { required: true });
  }
  const users = await recipients(c, config);
  if (!users.length) V.fail('Không có khách đang hoạt động phù hợp.');
  if (survey.status === 'DRAFT') {
    const [[count]] = await c.execute(
      'SELECT COUNT(*) total FROM survey_responses WHERE survey_id=?',
      [id]
    );
    if (Number(count.total)) V.fail('Không thể mở lại bản nháp có lịch sử trả lời.', 409);
    await c.execute('DELETE FROM survey_recipients WHERE survey_id=?', [id]);
  }
  for (const u of users)
    await c.execute('INSERT IGNORE INTO survey_recipients(survey_id,customer_id) VALUES (?,?)', [
      id,
      u.id
    ]);
  await c.execute(
    "UPDATE surveys SET status='OPEN',accept_new_customers=?,audience_config=? WHERE id=?",
    [
      config.mode === 'ALL',
      JSON.stringify(legacySetup ? { ...config, preserveLegacyRecipients: true } : config),
      id
    ]
  );
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
  const config = Audience.normalize(body.audience, { required: value.status === 'OPEN' });
  return transaction(db, async (c) => {
    const id = uid();
    await c.execute(
      "INSERT INTO surveys(id,title,description,due_date,status,created_by,audience_config) VALUES (?,?,?,?,'DRAFT',?,?)",
      [
        id,
        value.title,
        value.description,
        value.dueDate,
        actor,
        config ? JSON.stringify(config) : null
      ]
    );
    await writeQuestions(c, id, value.questions);
    if (value.status === 'OPEN') await publish(c, id);
    return id;
  });
}
async function update(db, id, body) {
  return transaction(db, async (c) => {
    const [[survey]] = await c.execute(
      'SELECT id,status,audience_config FROM surveys WHERE id=? FOR UPDATE',
      [id]
    );
    if (!survey) V.fail('Không tìm thấy khảo sát.', 404);
    if (survey.status === 'CLOSED') V.fail('Khảo sát đã đóng và không thể chỉnh sửa.', 409);
    if (survey.status === 'OPEN')
      V.fail(
        'Khảo sát đang mở chỉ được xem. Hãy khóa khẩn cấp trước khi sửa nếu chưa có khách trả lời.',
        409
      );
    const [[count]] = await c.execute(
      'SELECT COUNT(*) total FROM survey_responses WHERE survey_id=?',
      [id]
    );
    const value = V.survey(body);
    if (Number(count.total)) V.fail('Không thể sửa bản nháp đã có lịch sử trả lời.', 409);
    const config = Audience.normalize(
      body.audience === undefined ? Audience.parse(survey.audience_config) : body.audience,
      { required: value.status === 'OPEN' }
    );
    await c.execute(
      'UPDATE surveys SET title=?,description=?,due_date=?,status=?,audience_config=? WHERE id=?',
      [
        value.title,
        value.description,
        value.dueDate,
        value.status === 'OPEN' ? 'DRAFT' : value.status,
        config ? JSON.stringify(config) : null,
        id
      ]
    );
    await c.execute('DELETE FROM survey_questions WHERE survey_id=?', [id]);
    await writeQuestions(c, id, value.questions);
    if (value.status === 'OPEN') await publish(c, id);
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
async function close(db, id, actor) {
  return transaction(db, async (c) => {
    const [[s]] = await c.execute(
      "SELECT status,DATE_FORMAT(due_date,'%Y-%m-%d') due FROM surveys WHERE id=? FOR UPDATE",
      [id]
    );
    if (!s || s.status === 'CLOSED') V.fail('Khảo sát đã đóng hoặc không tồn tại.', 409);
    await c.execute("UPDATE surveys SET status='CLOSED' WHERE id=?", [id]);
    if (actor)
      await c.execute(
        "INSERT INTO survey_lifecycle_history(id,survey_id,actor_id,action,old_due_date,new_due_date,old_status,new_status,created_at) VALUES (?,?,?,'CLOSE',?,?,?,'CLOSED',UTC_TIMESTAMP())",
        [uid(), id, actor, s.due, s.due, s.status]
      );
  });
}
async function emergencyLock(db, id, actor) {
  return transaction(db, async (c) => {
    const [[s]] = await c.execute('SELECT status FROM surveys WHERE id=? FOR UPDATE', [id]);
    if (!s || s.status !== 'OPEN') V.fail('Chỉ khóa khẩn cấp khảo sát đang mở.', 409);
    const [[n]] = await c.execute('SELECT COUNT(*) total FROM survey_responses WHERE survey_id=?', [
      id
    ]);
    if (Number(n.total)) V.fail('Đã có khách trả lời. Hãy dùng Đóng ngay.', 409);
    await c.execute("UPDATE surveys SET status='DRAFT',accept_new_customers=FALSE WHERE id=?", [
      id
    ]);
    await c.execute(
      "INSERT INTO survey_lifecycle_history(id,survey_id,actor_id,action,old_status,new_status,created_at) VALUES (?,?,?,'EMERGENCY_LOCK','OPEN','DRAFT',UTC_TIMESTAMP())",
      [uid(), id, actor]
    );
  });
}
async function removeDraft(db, id) {
  return transaction(db, async (c) => {
    const [[s]] = await c.execute('SELECT status FROM surveys WHERE id=? FOR UPDATE', [id]);
    if (!s || s.status !== 'DRAFT') V.fail('Chỉ được xóa khảo sát bản nháp.', 409);
    const [[n]] = await c.execute('SELECT COUNT(*) total FROM survey_responses WHERE survey_id=?', [
      id
    ]);
    if (Number(n.total)) V.fail('Không xóa khảo sát có bài trả lời.', 409);
    await c.execute('DELETE FROM survey_lifecycle_history WHERE survey_id=?', [id]);
    await c.execute('DELETE FROM survey_recipients WHERE survey_id=?', [id]);
    await c.execute(
      'DELETE o FROM question_options o JOIN survey_questions q ON q.id=o.question_id WHERE q.survey_id=?',
      [id]
    );
    await c.execute('DELETE FROM survey_questions WHERE survey_id=?', [id]);
    await c.execute('DELETE FROM surveys WHERE id=?', [id]);
  });
}
module.exports = {
  transaction,
  today,
  recipients,
  publish,
  create,
  update,
  submit,
  close,
  emergencyLock,
  removeDraft
};
