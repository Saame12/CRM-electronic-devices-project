const bcrypt = require('bcryptjs');
const { randomBytes, createHash } = require('node:crypto');
const { ensureSchema } = require('../password-recovery');
const { DATASET, buildDemo } = require('../database/demo-data');
const businessTables = [
  'users',
  'products',
  'feedback',
  'surveys',
  'survey_questions',
  'question_options',
  'survey_recipients',
  'survey_responses',
  'response_details'
];
const markerSQL =
  'CREATE TABLE IF NOT EXISTS demo_datasets (name VARCHAR(80) PRIMARY KEY, installed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, summary_json JSON NOT NULL) ENGINE=InnoDB';

async function insertRows(connection, table, rows, columns) {
  const sql =
    'INSERT INTO ' +
    table +
    ' (' +
    columns.join(',') +
    ') VALUES (' +
    columns.map(() => '?').join(',') +
    ')';
  for (const row of rows)
    await connection.execute(
      sql,
      columns.map((column) => row[column] ?? null)
    );
}
async function seedDemo(
  connection,
  { now = new Date(), hash = (password) => bcrypt.hash(password, 12) } = {}
) {
  const [[database]] = await connection.query('SELECT DATABASE() name');
  const lockName =
    'crm_demo_' + createHash('sha256').update(database.name).digest('hex').slice(0, 40);
  const [[lock]] = await connection.execute('SELECT GET_LOCK(?,10) acquired', [lockName]);
  if (Number(lock.acquired) !== 1)
    throw Error('Một quá trình tạo demo khác đang chạy. Vui lòng thử lại.');
  let transaction = false;
  try {
    await connection.query(markerSQL);
    const [[installed]] = await connection.execute(
      'SELECT summary_json FROM demo_datasets WHERE name=?',
      [DATASET]
    );
    if (installed)
      return {
        alreadyInstalled: true,
        summary:
          typeof installed.summary_json === 'string'
            ? JSON.parse(installed.summary_json)
            : installed.summary_json
      };
    for (const table of businessTables) {
      const [[count]] = await connection.query('SELECT COUNT(*) total FROM ' + table);
      if (Number(count.total) > 0)
        throw Error(
          'Database đã có dữ liệu. Từ chối nhập demo để tránh trộn hoặc ghi đè. Hãy chọn database demo mới trong .env.demo.'
        );
    }
    await ensureSchema(connection);
    const data = buildDemo(now),
      hashes = new Map();
    for (const user of data.users) {
      if (!hashes.has(user.password)) hashes.set(user.password, await hash(user.password));
      user.password_hash = hashes.get(user.password);
    }
    for (const request of data.recovery) request.token_hash = randomBytes(32).toString('hex');
    await connection.beginTransaction();
    transaction = true;
    await insertRows(connection, 'users', data.users, [
      'id',
      'email',
      'password_hash',
      'role',
      'account_status',
      'full_name',
      'phone',
      'address',
      'birth_year',
      'birth_date',
      'gender',
      'need',
      'created_at'
    ]);
    await insertRows(connection, 'products', data.products, ['id', 'name', 'category']);
    await insertRows(connection, 'feedback', data.feedback, [
      'id',
      'customer_id',
      'product_id',
      'feedback_type',
      'rating',
      'title',
      'body',
      'status',
      'reply_content',
      'replied_by',
      'replied_at',
      'is_hidden',
      'hidden_at',
      'created_at'
    ]);
    await insertRows(connection, 'surveys', data.surveys, [
      'id',
      'title',
      'description',
      'due_date',
      'status',
      'created_by',
      'created_at'
    ]);
    await insertRows(connection, 'survey_questions', data.questions, [
      'id',
      'survey_id',
      'question_text',
      'question_type',
      'is_required',
      'display_order'
    ]);
    await insertRows(connection, 'question_options', data.options, [
      'id',
      'question_id',
      'option_text',
      'display_order'
    ]);
    await insertRows(connection, 'survey_recipients', data.recipients, [
      'survey_id',
      'customer_id',
      'sent_at'
    ]);
    await insertRows(connection, 'survey_responses', data.responses, [
      'id',
      'survey_id',
      'customer_id',
      'submitted_at'
    ]);
    await insertRows(connection, 'response_details', data.details, [
      'id',
      'response_id',
      'question_id',
      'option_id',
      'text_answer',
      'rating_value'
    ]);
    await insertRows(connection, 'password_recovery_requests', data.recovery, [
      'id',
      'customer_id',
      'email',
      'token_hash',
      'status',
      'reason',
      'verification_note',
      'reviewed_by',
      'reviewer_name',
      'created_at',
      'expires_at',
      'reviewed_at',
      'completed_at',
      'completion_seen'
    ]);
    const summary = {
      accounts: data.users.length,
      customers: data.users.filter((u) => u.role === 'CUSTOMER').length,
      products: data.products.length,
      feedback: data.feedback.length,
      surveys: data.surveys.length,
      questions: data.questions.length,
      responses: data.responses.length,
      answerDetails: data.details.length,
      recipients: data.recipients.length,
      recoveryHistory: data.recovery.length
    };
    await connection.execute('INSERT INTO demo_datasets (name,summary_json) VALUES (?,?)', [
      DATASET,
      JSON.stringify(summary)
    ]);
    await connection.commit();
    transaction = false;
    return { alreadyInstalled: false, summary };
  } catch (error) {
    if (transaction) await connection.rollback();
    throw error;
  } finally {
    await connection.execute('SELECT RELEASE_LOCK(?)', [lockName]);
  }
}
module.exports = { seedDemo, insertRows, businessTables };
