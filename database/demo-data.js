/* Synthetic, reproducible business fixtures. No real customer information is exported.
 * Dates are relative to installation; data is inserted into MySQL, never used as a UI fallback.
 */
const { randomUUID } = require('node:crypto');
const catalog = require('./catalog');
const definitions = require('./real-surveys');
const DATASET = 'backline-demo-v1';
const credentials = [
  { role: 'ADMIN', email: 'admin@backline.vn', password: 'Admin@123' },
  { role: 'MANAGER', email: 'manager@demo.vn', password: 'Manager@123' },
  { role: 'CUSTOMER', email: 'khach@demo.vn', password: '123456' }
];
const dateAt = (now, offset) =>
  new Date(now.getTime() + offset * 86400000).toISOString().slice(0, 19).replace('T', ' ');
function buildDemo(now = new Date(), uuid = randomUUID) {
  const users = [];
  const staff = [
    ['ADMIN', 'Quản trị viên Demo', 'admin@backline.vn', '0900000000'],
    ['MANAGER', 'Quản lý Demo', 'manager@demo.vn', '0900000001'],
    ['MANAGER', 'Quản lý hỗ trợ Demo', 'manager2@demo.vn', '0900000002']
  ];
  for (const [role, name, email, phone] of staff)
    users.push({
      id: uuid(),
      role,
      full_name: name,
      email,
      phone,
      password: role === 'ADMIN' ? 'Admin@123' : 'Manager@123',
      account_status: 'ACTIVE',
      address: 'Văn phòng demo',
      birth_year: 1990,
      birth_date: '1990-01-15',
      gender: 'Khác',
      need: 'Chưa xác định',
      created_at: dateAt(now, -200)
    });
  const names = [
    'Nguyễn Minh Anh',
    'Trần Hoàng Nam',
    'Lê Thu Hà',
    'Phạm Gia Huy',
    'Võ Ngọc Lan',
    'Đặng Quốc Bảo',
    'Bùi Thanh Mai',
    'Đỗ Đức Minh',
    'Hồ Bảo Ngọc',
    'Ngô Tuấn Kiệt',
    'Dương Thảo Vy',
    'Đinh Văn An'
  ];
  const ages = [25, 19, 31, 44, 52, 17, 28, 36, 23, 41, 34, 27],
    needs = ['Gaming', 'Đồ họa', 'Văn phòng', 'Chưa xác định'];
  for (let i = 0; i < names.length; i++) {
    const year = now.getUTCFullYear() - ages[i],
      birth = year + '-02-15';
    users.push({
      id: uuid(),
      role: 'CUSTOMER',
      full_name: names[i] + ' (Demo)',
      email: i ? 'khach' + (i + 1) + '@demo.vn' : 'khach@demo.vn',
      phone: '09100000' + String(i + 1).padStart(2, '0'),
      password: '123456',
      account_status: i === 10 ? 'LOCKED' : 'ACTIVE',
      address: i === 11 ? '' : 'Địa chỉ giả lập ' + (i + 1) + ', khu dân cư Demo, TP.HCM',
      birth_year: year,
      birth_date: birth,
      gender: ['Nữ', 'Nam', 'Khác'][i % 3],
      need: i === 11 ? 'Chưa xác định' : needs[i % 4],
      created_at: dateAt(now, -170 + i * 6)
    });
  }
  // The primary demo customer can immediately use surveys without the profile-completion gate.
  users[3].phone = '0901234567';
  users[3].need = 'Gaming';
  const customers = users.filter((u) => u.role === 'CUSTOMER'),
    active = customers.filter((u) => u.account_status === 'ACTIVE');
  const products = catalog.map((name) => ({
    id: uuid(),
    name,
    category: name.startsWith('PC') ? 'PC' : 'Laptop'
  }));
  const feedback = [];
  const types = ['Góp ý', 'Khen ngợi', 'Báo lỗi / Khiếu nại', 'Câu hỏi'];
  const bodies = [
    'Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn.',
    'Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn.',
    'Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý.',
    'Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này.'
  ];
  for (let i = 0; i < 36; i++) {
    const status = ['NEW', 'IN_PROGRESS', 'RESOLVED'][i % 3],
      resolved = status === 'RESOLVED';
    feedback.push({
      id: uuid(),
      customer_id: customers[i % customers.length].id,
      product_id: products[i % products.length].id,
      feedback_type: types[i % 4],
      rating: [5, 4, 3, 2, 1][i % 5],
      title: [
        'Đề xuất cải thiện',
        'Đánh giá trải nghiệm',
        'Cần hỗ trợ kỹ thuật',
        'Tư vấn nâng cấp'
      ][i % 4],
      body: bodies[i % 4] + ' [Dữ liệu demo]',
      status,
      reply_content: resolved
        ? 'Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]'
        : null,
      replied_by: resolved ? users[1].id : null,
      replied_at: resolved ? dateAt(now, -83 + i * 2) : null,
      is_hidden: resolved && i % 4 === 2,
      hidden_at: resolved && i % 4 === 2 ? dateAt(now, -82 + i * 2) : null,
      created_at: dateAt(now, -85 + i * 2)
    });
  }
  const specs = [
    { ...definitions[0], status: 'OPEN', created: -15, due: 30, respondents: [] },
    { ...definitions[1], status: 'OPEN', created: -40, due: 45, respondents: [0, 1, 2, 3, 4, 5] },
    {
      ...definitions[2],
      status: 'CLOSED',
      created: -70,
      due: -7,
      respondents: [0, 1, 2, 3, 4, 5, 6, 7]
    },
    {
      title: 'Khảo sát ý tưởng ưu đãi thành viên',
      description: 'Bản nháp để thử chỉnh sửa toàn bộ câu hỏi trước khi gửi.',
      status: 'DRAFT',
      created: -2,
      due: null,
      respondents: [],
      questions: [
        {
          type: 'MULTI',
          text: 'Bạn mong muốn ưu đãi nào?',
          required: true,
          options: ['Giảm giá linh kiện', 'Vệ sinh máy miễn phí', 'Tặng phụ kiện']
        },
        { type: 'TEXT', text: 'Ý tưởng khác của bạn?', required: false }
      ]
    },
    {
      title: 'Đánh giá trải nghiệm mua hàng tháng trước',
      description: 'Khảo sát đã hết hạn, dùng để xem mục quá hạn chưa trả lời.',
      status: 'OPEN',
      created: -35,
      due: -1,
      respondents: [1, 2, 3],
      questions: [
        {
          type: 'RATING',
          text: 'Bạn đánh giá trải nghiệm đặt hàng bao nhiêu sao?',
          required: true
        },
        { type: 'TEXT', text: 'Góp ý về quá trình mua hàng?', required: false }
      ]
    },
    {
      title: 'Khảo sát chương trình chăm sóc khách hàng',
      description: 'Khảo sát đã đóng và chưa có câu trả lời để thử trạng thái dữ liệu rỗng.',
      status: 'CLOSED',
      created: -10,
      due: -2,
      respondents: [],
      questions: [
        {
          type: 'ONE',
          text: 'Bạn muốn nhận thông tin qua kênh nào?',
          required: true,
          options: ['Điện thoại', 'Email', 'Tại cửa hàng']
        }
      ]
    }
  ];
  const surveys = [],
    questions = [],
    options = [],
    recipients = [],
    responses = [],
    details = [];
  for (let si = 0; si < specs.length; si++) {
    const spec = specs[si],
      s = {
        id: uuid(),
        title: spec.title,
        description: spec.description,
        status: spec.status,
        created_by: users[1].id,
        created_at: dateAt(now, spec.created),
        due_date: spec.due === null ? null : dateAt(now, spec.due).slice(0, 10)
      };
    surveys.push(s);
    const qs = spec.questions.map((definition, qi) => {
      const q = {
        id: uuid(),
        survey_id: s.id,
        question_text: definition.text,
        question_type: definition.type,
        is_required: !!definition.required,
        display_order: qi + 1
      };
      questions.push(q);
      const opts = (definition.options || []).map((text, oi) => ({
        id: uuid(),
        question_id: q.id,
        option_text: text,
        display_order: oi + 1
      }));
      options.push(...opts);
      return { ...q, options: opts };
    });
    if (s.status !== 'DRAFT')
      for (const user of active)
        recipients.push({
          survey_id: s.id,
          customer_id: user.id,
          sent_at: dateAt(now, spec.created + 1)
        });
    for (const index of spec.respondents) {
      const response = {
        id: uuid(),
        survey_id: s.id,
        customer_id: customers[index].id,
        submitted_at: dateAt(now, spec.created + 10 + index)
      };
      responses.push(response);
      for (const q of qs) {
        const base = {
          response_id: response.id,
          question_id: q.id,
          option_id: null,
          text_answer: null,
          rating_value: null
        };
        if (q.question_type === 'RATING')
          details.push({ id: uuid(), ...base, rating_value: 3 + (index % 3) });
        else if (q.question_type === 'TEXT')
          details.push({
            id: uuid(),
            ...base,
            text_answer:
              [
                'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm.',
                'Mong cửa hàng cải thiện thời gian hỗ trợ.',
                'Sẽ giới thiệu cửa hàng đến bạn bè.'
              ][index % 3] + ' [Demo]'
          });
        else {
          const chosen =
            q.question_type === 'MULTI'
              ? [q.options[index % q.options.length], q.options[(index + 1) % q.options.length]]
              : [q.options[index % q.options.length]];
          for (const option of chosen) details.push({ id: uuid(), ...base, option_id: option.id });
        }
      }
    }
  }
  const recovery = ['COMPLETED', 'REJECTED'].map((status, i) => ({
    id: uuid(),
    customer_id: customers[i].id,
    email: customers[i].email,
    status,
    reason: 'Lịch sử yêu cầu khôi phục mật khẩu giả lập để trình diễn.',
    verification_note: '[DEMO] Bản ghi lịch sử giả lập, không có mã khôi phục có thể sử dụng.',
    reviewed_by: users[0].id,
    reviewer_name: users[0].full_name,
    created_at: dateAt(now, -6 + i),
    expires_at: dateAt(now, -5 + i),
    reviewed_at: dateAt(now, -5 + i),
    completed_at: status === 'COMPLETED' ? dateAt(now, -4) : null,
    completion_seen: false
  }));
  return {
    users,
    products,
    feedback,
    surveys,
    questions,
    options,
    recipients,
    responses,
    details,
    recovery
  };
}
module.exports = { DATASET, credentials, buildDemo, dateAt };
