function deadlineFields(survey = null, requireChoice = survey === null) {
  const due = survey?.due_date ? CrmDomain.iso(survey.due_date) : '',
    manual = survey !== null && !due;
  return `<fieldset class="card" data-deadline-fields><legend>Phương thức hạn khảo sát</legend><label>Cách kết thúc<select name="endMode" required><option value="" disabled${requireChoice ? ' selected' : ''}>Chọn phương thức hạn khảo sát</option><option value="DATE"${!requireChoice && !manual ? ' selected' : ''}>Có ngày kết thúc</option><option value="MANUAL"${!requireChoice && manual ? ' selected' : ''}>Đóng thủ công</option></select></label><label data-deadline-date${requireChoice || manual ? ' hidden' : ''}>Ngày kết thúc<input name="dueDate" type="date" min="${CrmDomain.today()}" value="${esc(due)}"${requireChoice || manual ? ' disabled' : ' required'}></label><p class="muted" data-deadline-summary>${requireChoice ? 'Bắt buộc chọn Có ngày kết thúc hoặc Đóng thủ công trước khi lưu khảo sát.' : manual ? 'Không đặt hạn. Nhận câu trả lời cho đến khi Quản lý bấm Đóng ngay.' : 'Nhận câu trả lời đến hết ngày đã chọn; tự đóng lúc 00:00 ngày tiếp theo, theo giờ Việt Nam.'}</p></fieldset>`;
}
function updateDeadlineFields(event) {
  const field = event.target;
  if (!['endMode', 'dueDate'].includes(field?.name)) return;
  const group = field.closest('[data-deadline-fields]');
  if (!group) return;
  const mode = group.querySelector('[name="endMode"]').value,
    manual = mode === 'MANUAL',
    input = group.querySelector('[name="dueDate"]');
  group.querySelector('[data-deadline-date]').hidden = mode !== 'DATE';
  input.disabled = mode !== 'DATE';
  input.required = mode === 'DATE';
  group.querySelector('[data-deadline-summary]').textContent = !mode
    ? 'Bắt buộc chọn phương thức hạn khảo sát.'
    : manual
      ? 'Không đặt hạn. Nhận câu trả lời cho đến khi Quản lý bấm Đóng ngay.'
      : input.value
        ? `Nhận câu trả lời đến hết ngày ${input.value.split('-').reverse().join('/')}; tự đóng lúc 00:00 ngày tiếp theo, theo giờ Việt Nam.`
        : 'Hãy chọn ngày kết thúc. Thời gian tính theo giờ Việt Nam.';
}
function lifecycleForm(s) {
  const reopen = s.status === 'CLOSED',
    id = esc(s.id);
  return `<form id="surveyLifecycleForm" class="card" data-id="${id}" data-action="${reopen ? 'REOPEN' : 'EXTEND'}"><h2>${reopen ? 'Mở lại khảo sát' : 'Gia hạn / Điều chỉnh kết thúc'}: ${esc(s.title)}</h2><p>Hạn hiện tại: ${s.due_date ? esc(CrmDomain.iso(s.due_date).split('-').reverse().join('/')) : 'Đóng thủ công'}. Giữ nguyên câu hỏi, người nhận và câu trả lời đã gửi. Khách đã trả lời không gửi lại.${reopen && parseSurveyAudience(s.audience_config)?.mode === 'ALL' ? ' Phạm vi Tất cả sẽ bổ sung khách đang hoạt động đăng ký mới.' : ''}</p>${deadlineFields(s)}<button class="btn primary">${reopen ? 'Xác nhận mở lại' : 'Xác nhận thay đổi'}</button> <button type="button" class="btn" data-action="cancel-survey-edit">Hủy</button></form>`;
}
function parseSurveyAudience(value) {
  try {
    const config = typeof value === 'string' ? JSON.parse(value) : value;
    return config && ['ALL', 'FILTER', 'SELECTED'].includes(config.mode) ? config : null;
  } catch {
    return null;
  }
}
function surveyAudienceSummary(value) {
  const config = parseSurveyAudience(value);
  if (!config) return 'Chưa thiết lập phạm vi';
  if (config.preserveLegacyRecipients)
    return (
      'Dữ liệu cũ đã thiết lập ' +
      { ALL: 'Tất cả', FILTER: 'Theo bộ lọc', SELECTED: 'Chọn từng khách' }[config.mode] +
      '; giữ người nhận trước đây'
    );
  if (config.mode === 'ALL') return 'Tất cả khách hiện tại và đăng ký mới';
  if (config.mode === 'SELECTED')
    return 'Chọn từng khách: ' + (config.customerIds || []).length + ' khách';
  const f = config.filters || {},
    interests = f.interests || (f.interest ? [f.interest] : []);
  return (
    'Theo bộ lọc: ' +
    [
      f.need,
      interests.map((id) => CrmDomain.interests.find((x) => x.id === id)?.name || id).join(', '),
      f.minAge !== undefined ? 'Từ ' + f.minAge + ' tuổi' : '',
      f.maxAge !== undefined ? 'Đến ' + f.maxAge + ' tuổi' : ''
    ]
      .filter(Boolean)
      .join(' · ')
  );
}
/* Survey views and actions. One editor; no prompt-based legacy workflow. */
function editorQuestion(q = {}) {
  const type = q.question_type || q.type || 'TEXT',
    options = q.options || [];
  return `<fieldset class="card survey-question"><div class="title"><h2>Câu hỏi</h2><button type="button" class="btn small danger" data-action="remove-question">Xóa câu hỏi</button></div><label>Nội dung câu hỏi<input name="questionText" required value="${esc(q.question_text || q.text || '')}"></label><div class="toolbar"><label>Loại câu hỏi<select name="questionType">${[
    ['TEXT', 'Văn bản'],
    ['RATING', 'Đánh giá sao'],
    ['ONE', 'Chọn một'],
    ['MULTI', 'Chọn nhiều']
  ]
    .map(([v, l]) => `<option value="${v}"${type === v ? ' selected' : ''}>${l}</option>`)
    .join(
      ''
    )}</select></label><label><input type="checkbox" name="required"${q.is_required || q.required ? ' checked' : ''}> Bắt buộc</label></div><label>Lựa chọn (mỗi dòng một lựa chọn; chỉ dùng cho Chọn một/Chọn nhiều)<textarea name="options">${esc(Array.isArray(options) ? options.join('\n') : options)}</textarea></label></fieldset>`;
}

function showSurveyEditor(data) {
  const s = data.survey;
  const host = $('.workspace-content') || $('#app');
  host.innerHTML = `<button class="btn" data-action="cancel-survey-edit">← Quay lại danh sách khảo sát</button><form id="surveyEditor" class="card" data-id="${s.id}" style="margin-top:16px"><h1>Chỉnh sửa khảo sát</h1><p class="muted">Bạn có thể chỉnh sửa toàn bộ câu hỏi và lựa chọn khi khảo sát ở trạng thái DRAFT.</p><label>Tiêu đề<input name="title" required value="${esc(s.title)}"></label><label>Mô tả<textarea name="description" required>${esc(s.description)}</textarea></label><div class="toolbar">${deadlineFields(s, true)}<label>Trạng thái sau khi lưu<select name="status"><option value="DRAFT">DRAFT - tiếp tục chỉnh sửa</option><option value="OPEN">OPEN - mở cho khách hàng</option><option value="CLOSED">CLOSED - đóng khảo sát</option></select></label></div>${audienceFields(parseSurveyAudience(s.audience_config))}<div id="questions">${data.questions.map(editorQuestion).join('')}</div><button type="button" class="btn" data-action="add-editor-question">+ Thêm câu hỏi</button><button class="btn primary">Lưu toàn bộ thay đổi</button></form>`;
}

function surveyPage() {
  return `<h1>${surveyFilters.hidden ? 'Khảo sát đã ẩn' : 'Quản lý khảo sát'}</h1><p class="muted">DRAFT được sửa tự do. OPEN chưa có câu trả lời có thể chuyển về DRAFT để sửa. OPEN được gia hạn hoặc đóng ngay. CLOSED có thể mở lại với hạn mới hoặc đóng thủ công; giữ nguyên câu hỏi và bài đã gửi. Ẩn chỉ dọn danh sách Quản lý, không đóng khảo sát hoặc xóa dữ liệu.</p><div class="toolbar"><label>Tìm kiếm<input id="surveySearch" value="${esc(surveyFilters.q)}" placeholder="Tiêu đề hoặc mô tả"></label><label>Trạng thái<select id="surveyStatus"><option value="">Tất cả</option>${['DRAFT', 'OPEN', 'CLOSED'].map((v) => `<option${surveyFilters.status === v ? ' selected' : ''}>${v}</option>`).join('')}</select></label><button class="btn primary" data-action="filter-surveys">Lọc</button><button class="btn" data-action="toggle-hidden-surveys" aria-pressed="${surveyFilters.hidden}">${surveyFilters.hidden ? '← Danh sách khảo sát' : 'Xem khảo sát đã ẩn'}</button>${!surveyFilters.hidden ? '<button class="btn" data-action="show-create">Tạo khảo sát</button>' : ''}</div><div id="createSurvey"></div><div class="card table-wrap"><table class="table"><thead><tr><th>Khảo sát</th><th>Kết thúc</th><th>Trạng thái</th><th>Phản hồi</th><th>Thao tác</th></tr></thead><tbody>${
    surveys
      .map((s) => {
        const answered = Number(s.response_count) > 0;
        const normalActions =
          s.status === 'CLOSED'
            ? `<button class="btn small" data-action="view-responses" data-id="${s.id}">Xem chi tiết</button> <button class="btn small primary" data-action="copy-survey" data-id="${s.id}" title="Sao chép câu hỏi thành một khảo sát mới">Lập khảo sát</button>`
            : s.status === 'DRAFT'
              ? `<button class="btn small" data-action="edit-survey" data-id="${s.id}">Chỉnh sửa</button> ${parseSurveyAudience(s.audience_config) ? `<button class="btn small primary" data-action="open-survey" data-id="${s.id}">Mở khảo sát</button>` : ''} <button class="btn small danger" data-action="close-survey" data-id="${s.id}">Đóng ngay</button>`
              : answered
                ? `<button class="btn small danger" data-action="close-survey" data-id="${s.id}">Đóng ngay</button>`
                : `<button class="btn small" data-action="edit-survey" data-id="${s.id}">Chuyển DRAFT / sửa</button> <button class="btn small danger" data-action="close-survey" data-id="${s.id}">Đóng ngay</button>`;
        const actions = surveyFilters.hidden
          ? `<button class="btn small primary" data-action="restore-survey" data-id="${esc(s.id)}">Khôi phục khảo sát</button>${s.status === 'CLOSED' ? ` <button class="btn small" data-action="view-responses" data-id="${esc(s.id)}">Xem chi tiết</button>` : ''}`
          : `${normalActions}${s.status === 'CLOSED' || (s.status === 'OPEN' && s.due_date) ? ` <button class="btn small primary" data-action="survey-lifecycle" data-id="${esc(s.id)}">${s.status === 'CLOSED' ? 'Mở lại' : 'Gia hạn'}</button>` : ''} <button class="btn small" data-action="survey-lifecycle-history" data-id="${esc(s.id)}">Lịch sử thay đổi</button>${s.status === 'OPEN' && !parseSurveyAudience(s.audience_config) ? ` <button class="btn small" data-action="setup-legacy-audience" data-id="${esc(s.id)}">Thiết lập phạm vi (dữ liệu cũ)</button>` : ''} <button class="btn small" data-action="hide-survey" data-id="${esc(s.id)}">Ẩn khảo sát</button>`;
        return `<tr><td><b>${esc(s.title)}</b><br><span class="muted">${esc(s.description)}</span><br><small class="muted">Phạm vi: ${esc(surveyAudienceSummary(s.audience_config))}</small></td><td>${s.due_date ? esc(CrmDomain.iso(s.due_date).split('-').reverse().join('/')) + '<br><small>Tự đóng khi hết ngày</small>' : 'Đóng thủ công'}${s.status === 'CLOSED' ? '<br><small>' + (s.auto_closed_at ? 'Tự đóng do hết hạn' : 'Đã đóng thủ công') + '</small>' : ''}</td><td><span class="badge ${s.status}">${s.status}</span></td><td>${s.response_count}</td><td>${actions}</td></tr>`;
      })
      .join('') || '<tr><td colspan="5">Chưa có khảo sát phù hợp.</td></tr>'
  }</tbody></table></div>`;
}

function createForm() {
  return `<form id="surveyForm" class="card"><h2>Tạo khảo sát mới</h2><label>Tiêu đề<input name="title" required></label><label>Mô tả<textarea name="description" required></textarea></label><div class="toolbar">${deadlineFields()}<label>Trạng thái<select name="status"><option value="DRAFT">Bản nháp</option><option value="OPEN">Mở ngay</option></select></label></div>${audienceFields()}<div id="questions"><fieldset class="card"><label>Câu hỏi<input name="questionText" required></label><label>Kiểu câu hỏi<select name="questionType"><option value="TEXT">Văn bản</option><option value="RATING">Đánh giá sao</option><option value="ONE">Chọn một</option><option value="MULTI">Chọn nhiều</option></select></label><label>Lựa chọn (mỗi dòng một lựa chọn; chỉ dùng cho chọn một/nhiều)<textarea name="options"></textarea></label><label><input type="checkbox" name="required"> Bắt buộc</label></fieldset></div><button type="button" class="btn" data-action="add-question">Thêm câu hỏi</button><button class="btn primary">Lưu khảo sát</button></form>`;
}

function questionBlock() {
  return `<fieldset class="card"><label>Câu hỏi<input name="questionText" required></label><label>Kiểu câu hỏi<select name="questionType"><option value="TEXT">Văn bản</option><option value="RATING">Đánh giá sao</option><option value="ONE">Chọn một</option><option value="MULTI">Chọn nhiều</option></select></label><label>Lựa chọn (mỗi dòng một lựa chọn)<textarea name="options"></textarea></label><label><input type="checkbox" name="required"> Bắt buộc</label><button type="button" class="btn small danger" data-action="remove-question">Xóa câu hỏi</button></fieldset>`;
}
