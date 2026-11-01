// A customer can only read their own submitted response, regardless of survey status.
async function readOwnResponse(db, surveyId, customerId) {
  const [[response]] = await db.execute(
    `SELECT r.id,r.submitted_at,s.id survey_id,s.title,s.description,s.status
     FROM survey_responses r JOIN surveys s ON s.id=r.survey_id
     WHERE r.survey_id=? AND r.customer_id=?`,
    [surveyId, customerId]
  );
  if (!response) return null;
  const [rows] = await db.execute(
    `SELECT q.id,q.question_text,q.question_type,q.is_required,q.display_order,
            d.text_answer,d.rating_value,o.option_text,o.display_order option_order
     FROM survey_questions q
     LEFT JOIN response_details d ON d.question_id=q.id AND d.response_id=?
     LEFT JOIN question_options o ON o.id=d.option_id
     WHERE q.survey_id=? ORDER BY q.display_order,q.id,o.display_order`,
    [response.id, surveyId]
  );
  const questions = new Map();
  for (const row of rows) {
    if (!questions.has(row.id))
      questions.set(row.id, {
        text: row.question_text,
        type: row.question_type,
        required: Boolean(row.is_required),
        answers: []
      });
    const question = questions.get(row.id);
    const answer =
      row.question_type === 'RATING'
        ? row.rating_value
        : ['ONE', 'MULTI'].includes(row.question_type)
          ? row.option_text
          : row.text_answer;
    if (
      answer !== null &&
      answer !== undefined &&
      String(answer).trim() !== '' &&
      !question.answers.includes(answer)
    )
      question.answers.push(answer);
  }
  return {
    survey: {
      id: response.survey_id,
      title: response.title,
      description: response.description,
      status: response.status
    },
    submittedAt: response.submitted_at,
    questions: [...questions.values()]
  };
}
function register(app, db, auth, wrap) {
  app.get(
    '/api/surveys/:id/my-response',
    auth,
    wrap(async (req, res) => {
      res.set('Cache-Control', 'no-store');
      if (req.user.role !== 'CUSTOMER')
        return res.status(403).json({ error: 'Chỉ khách hàng được xem bài đã gửi của mình.' });
      // Ignore customerId/responseId query parameters; identity comes exclusively from auth.
      const response = await readOwnResponse(db, req.params.id, req.user.id);
      if (!response)
        return res.status(404).json({ error: 'Không tìm thấy bài khảo sát bạn đã gửi.' });
      res.json(response);
    })
  );
}
module.exports = { readOwnResponse, register };
