// Synthetic fixtures for the mandatory end-mode and survey lifecycle workflow.
const { randomUUID } = require('node:crypto');
const Base = require('./demo-data'),
  Domain = require('../crm-domain');
const DATASET = 'backline-demo-v3';
const utcAt = (now, days) =>
  new Date(now.getTime() + days * 86400000).toISOString().slice(0, 19).replace('T', ' ');
function buildDemo(now = new Date(), uuid = randomUUID) {
  const data = Base.buildDemo(now, uuid),
    today = Domain.iso(Base.dateAt(now, 0)),
    date = (days) => Base.dateAt(now, days).slice(0, 10);
  const manager = data.users.find((u) => u.role === 'MANAGER'),
    customers = data.users.filter((u) => u.role === 'CUSTOMER'),
    active = customers.filter((u) => u.account_status === 'ACTIVE');
  data.lifecycleHistory = [];
  const log = (s, action, oldDue, newDue, oldStatus, newStatus, days) =>
    data.lifecycleHistory.push({
      id: uuid(),
      survey_id: s.id,
      actor_id: manager.id,
      action,
      old_due_date: oldDue,
      new_due_date: newDue,
      old_status: oldStatus,
      new_status: newStatus,
      created_at: utcAt(now, days)
    });
  for (const s of data.surveys) {
    if (s.status === 'OPEN' && s.due_date && s.due_date < today) {
      s.status = 'CLOSED';
      s.accept_new_customers = false;
      s.auto_closed_at = s.due_date + ' 17:00:00'; // Midnight of the next day in Vietnam, stored as UTC.
    } else s.auto_closed_at = null;
    if (s.status === 'CLOSED' && !s.auto_closed_at)
      log(s, 'CLOSE', s.due_date, s.due_date, 'OPEN', 'CLOSED', -2);
  }
  function add({ title, description, scope, due, created = -8, responded = false }) {
    const s = {
      id: uuid(),
      title,
      description,
      status: 'OPEN',
      audience_config: JSON.stringify(scope),
      accept_new_customers: scope.mode === 'ALL',
      is_hidden: false,
      hidden_at: null,
      auto_closed_at: null,
      created_by: manager.id,
      created_at: Base.dateAt(now, created),
      due_date: due
    };
    data.surveys.push(s);
    const q = {
      id: uuid(),
      survey_id: s.id,
      question_text: 'Bạn góp ý gì để chúng tôi phục vụ tốt hơn?',
      question_type: 'TEXT',
      is_required: true,
      display_order: 1
    };
    data.questions.push(q);
    const targets =
      scope.mode === 'ALL'
        ? active
        : scope.mode === 'SELECTED'
          ? active.filter((u) => scope.customerIds.includes(u.id))
          : active.filter(
              (u) =>
                Domain.matches(
                  {
                    ...u,
                    interests: data.customerInterests
                      .filter((i) => i.customer_id === u.id)
                      .map((i) => i.interest_id)
                  },
                  scope.filters,
                  today
                ) && u.created_at <= Base.dateAt(now, created + 1)
            );
    for (const u of targets)
      data.recipients.push({
        survey_id: s.id,
        customer_id: u.id,
        sent_at: [Base.dateAt(now, created + 1), u.created_at].sort().at(-1)
      });
    if (responded) {
      const u = customers[0];
      if (!targets.some((x) => x.id === u.id))
        throw Error('Primary demo customer is outside lifecycle scope');
      const r = {
        id: uuid(),
        survey_id: s.id,
        customer_id: u.id,
        submitted_at: Base.dateAt(now, -4)
      };
      data.responses.push(r);
      data.details.push({
        id: uuid(),
        response_id: r.id,
        question_id: q.id,
        option_id: null,
        text_answer: 'Tôi mong tiếp tục nhận được hỗ trợ tận tình.',
        rating_value: null
      });
    }
    return s;
  }
  add({
    title: '[Đóng thủ công] Góp ý dịch vụ thường xuyên',
    description:
      'Không đặt ngày kết thúc. Quản lý chủ động Đóng ngay; có một bài đã gửi để kiểm tra không gửi lại.',
    scope: { mode: 'ALL', filters: {}, customerIds: [] },
    due: null,
    responded: true
  });
  add({
    title: '[Hết hạn hôm nay] Xác nhận nhu cầu hỗ trợ',
    description: 'Được trả lời đến hết hôm nay theo giờ Việt Nam; tự đóng từ 00:00 ngày mai.',
    scope: {
      mode: 'SELECTED',
      filters: {},
      customerIds: [customers[0].id, customers[1].id, customers[2].id]
    },
    due: date(0)
  });
  const extended = add({
    title: '[Đã gia hạn] Góp ý nhóm Gaming và Đồ họa',
    description: 'Hạn đã được kéo dài; danh sách người nhận theo bộ lọc vẫn giữ nguyên.',
    scope: {
      mode: 'FILTER',
      filters: { interests: ['gaming', 'design'], minAge: 15, maxAge: 20 },
      customerIds: []
    },
    due: date(14),
    responded: true
  });
  log(extended, 'EXTEND', date(2), date(14), 'OPEN', 'OPEN', -1);
  const reopened = add({
    title: '[Đã mở lại] Đánh giá hỗ trợ sau mua',
    description: 'Đã đóng rồi mở lại; giữ bài đã gửi và bổ sung khách mới thuộc phạm vi Tất cả.',
    scope: { mode: 'ALL', filters: {}, customerIds: [] },
    due: date(10),
    responded: true
  });
  log(reopened, 'CLOSE', date(-3), date(-3), 'OPEN', 'CLOSED', -3);
  log(reopened, 'REOPEN', date(-3), date(10), 'CLOSED', 'OPEN', -1);
  return data;
}
module.exports = { DATASET, buildDemo, credentials: Base.credentials };
