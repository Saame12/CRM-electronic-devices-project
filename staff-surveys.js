let surveyWorkspace = {
  page: 1,
  pageSize: 20,
  total: null,
  totalPages: 1,
  counts: null,
  scrollY: 0,
  lastId: null,
  positions: {}
};
let surveyPanelVersion = 0,
  surveyPanelReturn = null;
function surveyViewKey() {
  return JSON.stringify([
    !!surveyFilters.hidden,
    surveyFilters.q || '',
    surveyFilters.status || '',
    surveyFilters.from || '',
    surveyFilters.to || '',
    surveyFilters.dateField || 'created'
  ]);
}
function captureSurveyContext(id) {
  surveyWorkspace.scrollY = Number(globalThis.scrollY) || 0;
  if (id) surveyWorkspace.lastId = id;
  surveyWorkspace.positions[surveyViewKey()] = {
    page: surveyWorkspace.page,
    scrollY: surveyWorkspace.scrollY
  };
}
function restoreSurveyContext(focus = false) {
  const restore = () => {
    if (page !== 'surveys' || !me) return;
    globalThis.scrollTo?.({ top: surveyWorkspace.scrollY, behavior: 'instant' });
    if (focus) {
      const row = [...document.querySelectorAll('[data-survey-row]')].find(
        (r) => r.dataset.surveyRow === surveyWorkspace.lastId
      );
      (
        row?.querySelector('button') ||
        document.querySelector('[data-action="survey-tab"][aria-selected="true"]')
      )?.focus({ preventScroll: true });
    }
  };
  if (globalThis.requestAnimationFrame) requestAnimationFrame(restore);
  else restore();
}
function closeSurveyPanel({ force = false, restore = true } = {}) {
  const dialog = document.getElementById?.('surveyWorkspaceDialog');
  if (dialog?.dataset.dirty === 'true' && !force) {
    if (!dialog.querySelector('.survey-unsaved-warning')) {
      const warning = document.createElement('section');
      warning.className = 'survey-unsaved-warning';
      warning.setAttribute('role', 'alert');
      warning.innerHTML =
        '<h3>Có thay đổi chưa lưu</h3><p>Bạn muốn tiếp tục chỉnh sửa hay bỏ các thay đổi này?</p><div><button type="button" class="btn primary" data-action="continue-survey-panel">Tiếp tục chỉnh sửa</button><button type="button" class="btn danger" data-action="discard-survey-panel">Bỏ thay đổi và đóng</button></div>';
      dialog.querySelector('.survey-panel-body').prepend(warning);
      dialog.querySelector('.survey-panel-body').scrollTop = 0;
      warning.querySelector('button').focus({ preventScroll: true });
    }
    return false;
  }
  surveyPanelVersion++;
  if (dialog) {
    dialog.close();
    dialog.remove();
    document.body.style.overflow = surveyPanelReturn?.overflow || '';
  }
  if (surveyPanelReturn) {
    surveyWorkspace.scrollY = surveyPanelReturn.scrollY;
    surveyWorkspace.lastId = surveyPanelReturn.id;
  }
  surveyPanelReturn = null;
  if (restore && dialog) restoreSurveyContext(true);
  return true;
}
function resetSurveyWorkspace() {
  closeSurveyPanel({ force: true, restore: false });
  surveyWorkspace = {
    page: 1,
    pageSize: 20,
    total: null,
    totalPages: 1,
    counts: null,
    scrollY: 0,
    lastId: null,
    positions: {}
  };
}
function trackSurveyPanelChange(event) {
  const dialog = event.target.closest?.('#surveyWorkspaceDialog');
  if (dialog?.dataset.editing === 'true') {
    dialog.dataset.dirty = 'true';
    dialog.querySelector('.survey-panel-error')?.remove();
  }
}
function showSurveyPanel(html, title, { editing = false, survey = null, id = null } = {}) {
  let dialog = document.getElementById?.('surveyWorkspaceDialog');
  if (!dialog) {
    captureSurveyContext(id || survey?.id);
    surveyPanelReturn = {
      scrollY: surveyWorkspace.scrollY,
      id: surveyWorkspace.lastId,
      overflow: document.body.style.overflow
    };
    dialog = document.createElement('dialog');
    dialog.id = 'surveyWorkspaceDialog';
    dialog.className = 'survey-panel';
    dialog.setAttribute('aria-labelledby', 'surveyPanelTitle');
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeSurveyPanel();
    });
    document.body.append(dialog);
  }
  dialog.dataset.editing = String(editing);
  dialog.dataset.dirty = 'false';
  dialog.innerHTML = `<header class="survey-panel-header"><div><p class="muted">KHÔNG GIAN KHẢO SÁT</p><h2 id="surveyPanelTitle">${esc(title)}</h2></div><div><button type="button" class="btn small" data-action="expand-survey-panel" aria-label="Mở rộng khung xem">⤢</button><button type="button" class="btn" data-action="close-survey-panel">Đóng ×</button></div></header><div class="survey-panel-body">${html}</div><footer class="survey-panel-footer"></footer>`;
  const form = dialog.querySelector('form');
  const footer = dialog.querySelector('.survey-panel-footer');
  footer.innerHTML =
    editing && form
      ? `<button type="button" class="btn" data-action="close-survey-panel">Hủy</button><button type="submit" form="${esc(form.id)}" class="btn primary">${form.id === 'surveyLifecycleForm' ? (form.dataset.action === 'REOPEN' ? 'Mở lại khảo sát' : 'Xác nhận gia hạn') : 'Lưu khảo sát'}</button>`
      : `${
          survey
            ? surveyRowActions(survey)
                .slice(1)
                .map((x) => surveyActionButton(survey, x))
                .join('')
            : ''
        }<button type="button" class="btn primary" data-action="close-survey-panel">Đóng khung xem</button>`;
  if (!dialog.open) {
    document.body.style.overflow = 'hidden';
    dialog.showModal();
  }
  dialog.querySelector('[data-action="close-survey-panel"]').focus({ preventScroll: true });
  return dialog;
}
async function requestSurveyPanel(button, url, title, view, { editing = false } = {}) {
  if (!closeSurveyPanel({ restore: false })) return;
  const actor = me?.id;
  showSurveyPanel('<p role="status">Đang tải khảo sát…</p>', title, { id: button.dataset.id });
  const version = ++surveyPanelVersion;
  try {
    const data = await api(url);
    if (version !== surveyPanelVersion || me?.id !== actor || page !== 'surveys') return;
    showSurveyPanel(view(data), title, { editing, survey: editing ? null : data.survey });
    return data;
  } catch (error) {
    if (version === surveyPanelVersion && me?.id === actor && page === 'surveys')
      showSurveyPanel(`<p role="alert" class="error">${esc(error.message)}</p>`, title);
    throw error;
  }
}
function surveyRowActions(s) {
  const scope = parseSurveyAudience(s.audience_config),
    answered = Number(s.response_count) > 0;
  if (surveyFilters.hidden)
    return [
      ['view-responses', 'Xem chi tiết'],
      ['restore-survey', 'Khôi phục khảo sát']
    ];
  if (s.status === 'DRAFT')
    return [
      ['edit-survey', 'Sửa'],
      ['delete-survey', 'Xóa'],
      ['open-survey', 'Mở khảo sát', !scope, 'Chọn phạm vi trước khi mở']
    ];
  if (s.status === 'OPEN')
    return [
      ['view-survey', 'Xem khảo sát'],
      [
        'survey-lifecycle',
        'Gia hạn',
        !s.due_date,
        'Khảo sát đóng thủ công không có hạn để gia hạn'
      ],
      ['close-survey', 'Đóng ngay'],
      [
        'emergency-lock-survey',
        'Khóa khẩn cấp',
        answered,
        'Đã có khách trả lời; hãy dùng Đóng ngay'
      ]
    ];
  return [
    ['view-responses', 'Xem chi tiết'],
    ['copy-survey', 'Lập khảo sát'],
    [
      'survey-lifecycle',
      'Mở lại',
      !scope,
      'Khảo sát chưa có phạm vi. Hãy lập khảo sát mới trước khi mở.'
    ],
    ['hide-survey', 'Ẩn khảo sát']
  ];
}
function surveyActionButton(s, [action, label, disabled = false, hint = '']) {
  return `<button type="button" class="btn small${['delete-survey', 'close-survey', 'emergency-lock-survey'].includes(action) ? ' danger' : ''}" data-action="${action}" data-id="${esc(s.id)}"${disabled ? ' disabled' : ''}${hint && disabled ? ` title="${esc(hint)}"` : ''}>${label}</button>`;
}
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
    id = esc(s.id),
    today = CrmDomain.today(),
    due = CrmDomain.iso(s.due_date);
  if (!reopen && !due) throw Error('Khảo sát đóng thủ công không có hạn để gia hạn.');
  const next = new Date((due || today) + 'T00:00:00Z');
  next.setUTCDate(next.getUTCDate() + 1);
  const minimum = [today, next.toISOString().slice(0, 10)].sort().at(-1);
  const manual = !due,
    newDue = due && due >= today ? due : today;
  const fields = reopen
    ? `<fieldset data-deadline-fields><legend>Thời gian nhận câu trả lời sau khi mở lại</legend><label>Cách kết thúc<select name="endMode" required><option value="DATE"${!manual ? ' selected' : ''}>Có ngày kết thúc</option><option value="MANUAL"${manual ? ' selected' : ''}>Đóng thủ công</option></select></label><label data-deadline-date${manual ? ' hidden' : ''}>Ngày kết thúc mới<input name="dueDate" type="date" min="${today}" value="${newDue}"${manual ? ' disabled' : ' required'}></label><p class="muted" data-deadline-summary>${manual ? 'Tiếp tục nhận câu trả lời cho đến khi Quản lý đóng thủ công.' : `Nhận câu trả lời đến hết ngày ${newDue.split('-').reverse().join('/')}, theo giờ Việt Nam.`}</p></fieldset>`
    : `<input type="hidden" name="endMode" value="DATE"><label>Ngày kết thúc mới<input name="dueDate" type="date" min="${minimum}" required></label><p class="muted">Chọn hạn mới từ ${minimum.split('-').reverse().join('/')} trở đi, muộn hơn hạn hiện tại. Tự đóng khi hết ngày đã chọn, theo giờ Việt Nam.</p>`;
  return `<form id="surveyLifecycleForm" class="card" data-id="${id}" data-action="${reopen ? 'REOPEN' : 'EXTEND'}"><h2>${esc(s.title)}</h2><p>Hạn hiện tại: ${due ? esc(due.split('-').reverse().join('/')) : 'Đóng thủ công'}.</p>${fields}<p class="muted">Giữ nguyên câu hỏi, người nhận và câu trả lời đã gửi. Khách đã trả lời không gửi lại.${reopen && parseSurveyAudience(s.audience_config)?.mode === 'ALL' ? ' Phạm vi Tất cả sẽ bổ sung khách đang hoạt động đăng ký mới.' : ''}</p></form>`;
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

function surveyEditorForm(data) {
  const s = data.survey;
  return `<button class="btn" data-action="cancel-survey-edit">← Quay lại danh sách khảo sát</button><form id="surveyEditor" class="card" data-id="${s.id}" style="margin-top:16px"><h1>Chỉnh sửa khảo sát</h1><p class="muted">Bạn có thể chỉnh sửa toàn bộ câu hỏi và lựa chọn khi khảo sát ở trạng thái Bản nháp.</p><label>Tiêu đề<input name="title" required value="${esc(s.title)}"></label><label>Mô tả<textarea name="description" required>${esc(s.description)}</textarea></label><div class="toolbar">${deadlineFields(s)}<label>Trạng thái sau khi lưu<select name="status"><option value="DRAFT">Bản nháp - tiếp tục chỉnh sửa</option><option value="OPEN">Đang mở - mở cho khách hàng</option><option value="CLOSED">Đã đóng - đóng khảo sát</option></select></label></div>${audienceFields(parseSurveyAudience(s.audience_config))}<div id="questions">${data.questions.map(editorQuestion).join('')}</div><button type="button" class="btn" data-action="add-editor-question">+ Thêm câu hỏi</button><button class="btn primary">Lưu toàn bộ thay đổi</button></form>`;
}

function showSurveyEditor(data, anchorId = data.survey.id) {
  showSurveyPanel(surveyEditorForm(data), 'Chỉnh sửa khảo sát', {
    editing: true,
    id: anchorId
  });
}

function surveyStatusLabel(s) {
  return { DRAFT: 'Bản nháp', OPEN: 'Đang mở', CLOSED: 'Đã đóng' }[s] || s;
}
function surveyPage() {
  const counts = surveyWorkspace.counts || {
    ALL: surveys.length,
    DRAFT: surveys.filter((s) => s.status === 'DRAFT').length,
    OPEN: surveys.filter((s) => s.status === 'OPEN').length,
    CLOSED: surveys.filter((s) => s.status === 'CLOSED').length
  };
  const total = surveyWorkspace.total ?? surveys.length,
    start = total ? (surveyWorkspace.page - 1) * surveyWorkspace.pageSize + 1 : 0;
  return `<div class="survey-workspace"><div class="survey-list-heading"><div><h1>${surveyFilters.hidden ? 'Khảo sát đã ẩn' : 'Quản lý khảo sát'}</h1><p class="muted">Xem và thao tác trong khung riêng, giữ nguyên vị trí danh sách.</p></div><div class="toolbar"><button type="button" class="btn" data-action="toggle-hidden-surveys">${surveyFilters.hidden ? '← Danh sách khảo sát' : 'Xem khảo sát đã ẩn'}</button>${!surveyFilters.hidden ? '<button type="button" class="btn primary" data-action="show-create">Tạo khảo sát</button>' : ''}</div></div><nav class="survey-status-tabs" role="tablist" aria-label="Trạng thái khảo sát">${[
    ['', 'Tất cả'],
    ['OPEN', 'Đang mở'],
    ['CLOSED', 'Đã đóng'],
    ['DRAFT', 'Bản nháp']
  ]
    .map(
      ([value, label]) =>
        `<button type="button" class="btn" role="tab" aria-selected="${(surveyFilters.status || '') === value}" data-action="survey-tab" data-status="${value}" aria-controls="surveyList">${label} <span>${counts[value || 'ALL'] || 0}</span></button>`
    )
    .join(
      ''
    )}</nav><div class="survey-list-tools"><form id="surveySearchForm" role="search" class="toolbar"><label>Tìm khảo sát<input id="surveySearch" name="q" value="${esc(surveyFilters.q)}" placeholder="Tiêu đề hoặc mô tả"></label><label>Lọc theo<select id="surveyDateField" name="dateField"><option value="created"${(surveyFilters.dateField || 'created') === 'created' ? ' selected' : ''}>Ngày tạo khảo sát</option><option value="due"${surveyFilters.dateField === 'due' ? ' selected' : ''}>Ngày kết thúc</option></select></label><label>Từ ngày<input type="date" id="surveyFrom" name="from" value="${esc(surveyFilters.from || '')}"></label><label>Đến ngày<input type="date" id="surveyTo" name="to" value="${esc(surveyFilters.to || '')}"></label><button class="btn">Tìm kiếm</button><button type="button" class="btn" data-action="clear-survey-search">Xóa bộ lọc</button></form><label>Số dòng mỗi trang<select id="surveyPageSize">${[10, 20, 50, 100].map((n) => `<option value="${n}"${surveyWorkspace.pageSize === n ? ' selected' : ''}>${n}</option>`).join('')}</select></label></div><div id="surveyList" class="card table-wrap"><table class="table"><thead><tr><th>Khảo sát</th><th>Kết thúc</th><th>Trạng thái</th><th>Số người đã làm</th><th>Thao tác</th></tr></thead><tbody>${
    surveys
      .map((s) => {
        const actions = surveyRowActions(s),
          primary = actions[0];
        return `<tr data-survey-row="${esc(s.id)}"${surveyWorkspace.lastId === s.id ? ' class="survey-last-viewed"' : ''}><td><b>${esc(s.title)}</b><p class="survey-description">${esc(s.description)}</p><small class="muted">Phạm vi: ${esc(surveyAudienceSummary(s.audience_config))}</small></td><td>${s.due_date ? esc(CrmDomain.iso(s.due_date).split('-').reverse().join('/')) : 'Đóng thủ công'}${s.auto_closed_at ? '<br><small>Tự đóng do hết hạn</small>' : ''}</td><td><span class="badge ${s.status}">${surveyStatusLabel(s.status)}</span></td><td>${Number(s.response_count) || 0}</td><td><div class="survey-row-actions">${surveyActionButton(s, primary)}<details class="survey-action-menu"><summary>Thao tác ⋯</summary><div>${actions
          .slice(1)
          .map((action) => surveyActionButton(s, action))
          .join('')}</div></details></div></td></tr>`;
      })
      .join('') || '<tr><td colspan="5">Không có khảo sát phù hợp.</td></tr>'
  }</tbody></table></div><div class="survey-pagination"><p class="muted" role="status">${start}–${total ? Math.min(start + surveys.length - 1, total) : 0} / ${total} khảo sát · Trang ${surveyWorkspace.page}/${surveyWorkspace.totalPages}</p><div><button type="button" class="btn" data-action="survey-page" data-page-number="${surveyWorkspace.page - 1}"${surveyWorkspace.page <= 1 ? ' disabled' : ''}>← Trang trước</button> <button type="button" class="btn" data-action="survey-page" data-page-number="${surveyWorkspace.page + 1}"${surveyWorkspace.page >= surveyWorkspace.totalPages ? ' disabled' : ''}>Trang sau →</button></div></div></div>`;
}

function surveyInspection(data, preview = false) {
  const s = data.survey,
    qs = data.questions || [],
    rs = data.responses || [],
    types = { ONE: 'Chọn một', MULTI: 'Chọn nhiều', TEXT: 'Văn bản', RATING: 'Đánh giá sao' };
  return `<section class="survey-inspection"><div class="title"><div><p class="muted">${preview ? 'XEM KHẢO SÁT · CHỈ ĐỌC' : 'BÁO CÁO KẾT QUẢ KHẢO SÁT'}</p><h1>${esc(s.title)}</h1><span class="badge">${surveyStatusLabel(s.status)}</span></div><button class="btn" data-action="cancel-survey-edit">← Danh sách khảo sát</button></div>${preview ? '<p>Nội dung đang phát hành. Không thể chỉnh sửa tại đây.</p>' : `<p class="muted">${esc(s.description || '')}</p><section class="survey-result-metrics"><article class="card"><p>Số khách nhận khảo sát</p><strong class="metric">${Number(s.recipient_count) || 0}</strong></article><article class="card"><p>Số khách đã làm</p><strong class="metric">${rs.length}</strong></article><article class="card"><p>Tỷ lệ hoàn thành</p><strong class="metric">${Number(s.recipient_count) ? Math.round((rs.length / Number(s.recipient_count)) * 1000) / 10 + '%' : '—'}</strong></article><article class="card"><p>Số câu hỏi</p><strong class="metric">${qs.length}</strong></article></section>`}${qs.map((q, i) => `<article class="card survey-question-result"><div class="title"><h2>Câu ${i + 1}. ${esc(q.text || q.question_text)}</h2><span class="badge">${types[q.type || q.question_type]}</span></div>${preview ? `<p>${q.is_required ? 'Bắt buộc trả lời' : 'Không bắt buộc'}</p><ul>${(q.options || []).map((o) => `<li>${esc(typeof o === 'string' ? o : o.label)}</li>`).join('')}</ul>` : `<p><b>${q.answered} người trả lời</b> · ${q.skipped} người bỏ qua</p>${q.averageRating != null ? `<p>Điểm trung bình: <b>${Number(q.averageRating).toFixed(2)}/5</b></p>` : ''}${q.options?.length ? `<table class="table"><thead><tr><th>Lựa chọn</th><th>Số người chọn</th><th>Tỷ lệ</th></tr></thead><tbody>${q.options.map((o) => `<tr><td>${esc(o.label)}</td><td>${o.total}</td><td>${o.percentage == null ? '—' : o.percentage + '%'}</td></tr>`).join('')}</tbody></table>` : ''}${q.type === 'MULTI' ? '<p class="muted">Một người có thể chọn nhiều đáp án; tỷ lệ tính trên số người trả lời câu hỏi.</p>' : ''}${q.type === 'TEXT' ? `<p>${q.textCount} ý kiến văn bản</p>${q.texts.map((t) => `<blockquote>${esc(t.text)}</blockquote>`).join('')}${q.textCount > q.texts.length ? `<p class="muted">Hiển thị ${q.texts.length}/${q.textCount} ý kiến gần nhất. Xem từng bài trả lời bên dưới để xem đầy đủ.</p>` : ''}` : ''}`}</article>`).join('') || '<p>Chưa có câu hỏi.</p>'}${!preview ? `<details class="card"><summary>Xem từng bài trả lời (${rs.length})</summary>${rs.map((r) => `<article class="card"><h3>${esc(r.full_name)}</h3><p>${esc(r.email || 'Thông tin liên hệ đã xóa')} · ${new Date(r.submitted_at).toLocaleString('vi-VN')}</p>${r.answers.map((a) => `<p><b>${esc(a.question)}</b><br>${esc(a.answer)}</p>`).join('')}</article>`).join('') || '<p>Chưa có bài trả lời.</p>'}</details>` : ''}</section>`;
}
function createForm() {
  return `<form id="surveyForm" class="card"><h2>Tạo khảo sát mới</h2><label>Tiêu đề<input name="title" required></label><label>Mô tả<textarea name="description" required></textarea></label><div class="toolbar">${deadlineFields()}<label>Trạng thái<select name="status"><option value="DRAFT">Bản nháp</option><option value="OPEN">Mở ngay</option></select></label></div>${audienceFields()}<div id="questions"><fieldset class="card"><label>Câu hỏi<input name="questionText" required></label><label>Kiểu câu hỏi<select name="questionType"><option value="TEXT">Văn bản</option><option value="RATING">Đánh giá sao</option><option value="ONE">Chọn một</option><option value="MULTI">Chọn nhiều</option></select></label><label>Lựa chọn (mỗi dòng một lựa chọn; chỉ dùng cho chọn một/nhiều)<textarea name="options"></textarea></label><label><input type="checkbox" name="required"> Bắt buộc</label></fieldset></div><button type="button" class="btn" data-action="add-question">Thêm câu hỏi</button><button class="btn primary">Lưu khảo sát</button></form>`;
}

function questionBlock() {
  return `<fieldset class="card"><label>Câu hỏi<input name="questionText" required></label><label>Kiểu câu hỏi<select name="questionType"><option value="TEXT">Văn bản</option><option value="RATING">Đánh giá sao</option><option value="ONE">Chọn một</option><option value="MULTI">Chọn nhiều</option></select></label><label>Lựa chọn (mỗi dòng một lựa chọn)<textarea name="options"></textarea></label><label><input type="checkbox" name="required"> Bắt buộc</label><button type="button" class="btn small danger" data-action="remove-question">Xóa câu hỏi</button></fieldset>`;
}
