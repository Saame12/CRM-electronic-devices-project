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
  host.innerHTML = `<button class="btn" data-action="cancel-survey-edit">← Quay lại danh sách khảo sát</button><form id="surveyEditor" class="card" data-id="${s.id}" style="margin-top:16px"><h1>Chỉnh sửa khảo sát</h1><p class="muted">Bạn có thể chỉnh sửa toàn bộ câu hỏi và lựa chọn khi khảo sát ở trạng thái DRAFT.</p><label>Tiêu đề<input name="title" required value="${esc(s.title)}"></label><label>Mô tả<textarea name="description" required>${esc(s.description)}</textarea></label><div class="toolbar"><label>Hạn khảo sát<input name="dueDate" type="date" value="${s.due_date ? s.due_date.slice(0, 10) : ''}"></label><label>Trạng thái sau khi lưu<select name="status"><option value="DRAFT">DRAFT - tiếp tục chỉnh sửa</option><option value="OPEN">OPEN - mở cho khách hàng</option><option value="CLOSED">CLOSED - đóng khảo sát</option></select></label></div><div id="questions">${data.questions.map(editorQuestion).join('')}</div><button type="button" class="btn" data-action="add-editor-question">+ Thêm câu hỏi</button><button class="btn primary">Lưu toàn bộ thay đổi</button></form>`;
}

function surveyPage() {
  return `<h1>${surveyFilters.hidden ? 'Khảo sát đã ẩn' : 'Quản lý khảo sát'}</h1><p class="muted">DRAFT được sửa tự do. OPEN chưa có câu trả lời có thể chuyển về DRAFT để sửa. OPEN đã có câu trả lời chỉ có thể đóng ngay. CLOSED dùng để xem lịch sử trả lời. Ẩn chỉ dọn danh sách Quản lý, không đóng khảo sát hoặc xóa dữ liệu.</p><div class="toolbar"><label>Tìm kiếm<input id="surveySearch" value="${esc(surveyFilters.q)}" placeholder="Tiêu đề hoặc mô tả"></label><label>Trạng thái<select id="surveyStatus"><option value="">Tất cả</option>${['DRAFT', 'OPEN', 'CLOSED'].map((v) => `<option${surveyFilters.status === v ? ' selected' : ''}>${v}</option>`).join('')}</select></label><button class="btn primary" data-action="filter-surveys">Lọc</button><button class="btn" data-action="toggle-hidden-surveys" aria-pressed="${surveyFilters.hidden}">${surveyFilters.hidden ? '← Danh sách khảo sát' : 'Xem khảo sát đã ẩn'}</button>${!surveyFilters.hidden ? '<button class="btn" data-action="show-create">Tạo khảo sát</button>' : ''}</div><div id="createSurvey"></div><div class="card table-wrap"><table class="table"><thead><tr><th>Khảo sát</th><th>Hạn</th><th>Trạng thái</th><th>Phản hồi</th><th>Thao tác</th></tr></thead><tbody>${
    surveys
      .map((s) => {
        const answered = Number(s.response_count) > 0;
        const normalActions =
          s.status === 'CLOSED'
            ? `<button class="btn small" data-action="view-responses" data-id="${s.id}">Xem chi tiết</button> <button class="btn small primary" data-action="copy-survey" data-id="${s.id}" title="Sao chép câu hỏi thành một khảo sát mới">Lập khảo sát</button>`
            : s.status === 'DRAFT'
              ? `<button class="btn small" data-action="edit-survey" data-id="${s.id}">Chỉnh sửa</button> <button class="btn small primary" data-action="send-survey" data-id="${s.id}">Gửi khách hàng</button> <button class="btn small danger" data-action="close-survey" data-id="${s.id}">Đóng ngay</button>`
              : answered
                ? `<button class="btn small danger" data-action="close-survey" data-id="${s.id}">Đóng ngay</button>`
                : `<button class="btn small" data-action="edit-survey" data-id="${s.id}">Chuyển DRAFT / sửa</button> <button class="btn small danger" data-action="close-survey" data-id="${s.id}">Đóng ngay</button>`;
        const actions = surveyFilters.hidden
          ? `<button class="btn small primary" data-action="restore-survey" data-id="${esc(s.id)}">Khôi phục khảo sát</button>${s.status === 'CLOSED' ? ` <button class="btn small" data-action="view-responses" data-id="${esc(s.id)}">Xem chi tiết</button>` : ''}`
          : `${normalActions} <button class="btn small" data-action="hide-survey" data-id="${esc(s.id)}">Ẩn khảo sát</button>`;
        return `<tr><td><b>${esc(s.title)}</b><br><span class="muted">${esc(s.description)}</span></td><td>${s.due_date ? new Date(s.due_date).toLocaleDateString('vi-VN') : 'Không đặt'}</td><td><span class="badge ${s.status}">${s.status}</span></td><td>${s.response_count}</td><td>${actions}</td></tr>`;
      })
      .join('') || '<tr><td colspan="5">Chưa có khảo sát phù hợp.</td></tr>'
  }</tbody></table></div>`;
}

function createForm() {
  return `<form id="surveyForm" class="card"><h2>Tạo khảo sát mới</h2><label>Tiêu đề<input name="title" required></label><label>Mô tả<textarea name="description" required></textarea></label><div class="toolbar"><label>Hạn khảo sát<input name="dueDate" type="date"></label><label>Trạng thái<select name="status"><option value="DRAFT">Bản nháp</option><option value="OPEN">Mở ngay</option></select></label></div><div id="questions"><fieldset class="card"><label>Câu hỏi<input name="questionText" required></label><label>Kiểu câu hỏi<select name="questionType"><option value="TEXT">Văn bản</option><option value="RATING">Đánh giá sao</option><option value="ONE">Chọn một</option><option value="MULTI">Chọn nhiều</option></select></label><label>Lựa chọn (mỗi dòng một lựa chọn; chỉ dùng cho chọn một/nhiều)<textarea name="options"></textarea></label><label><input type="checkbox" name="required"> Bắt buộc</label></fieldset></div><button type="button" class="btn" data-action="add-question">Thêm câu hỏi</button><button class="btn primary">Lưu khảo sát</button></form>`;
}

function questionBlock() {
  return `<fieldset class="card"><label>Câu hỏi<input name="questionText" required></label><label>Kiểu câu hỏi<select name="questionType"><option value="TEXT">Văn bản</option><option value="RATING">Đánh giá sao</option><option value="ONE">Chọn một</option><option value="MULTI">Chọn nhiều</option></select></label><label>Lựa chọn (mỗi dòng một lựa chọn)<textarea name="options"></textarea></label><label><input type="checkbox" name="required"> Bắt buộc</label><button type="button" class="btn small danger" data-action="remove-question">Xóa câu hỏi</button></fieldset>`;
}
