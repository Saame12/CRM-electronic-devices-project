/* Application controller: one dispatcher per event, domain-specific action maps. */
const staffPending = new Set();
const staffLoadVersions = Object.create(null);
const audienceLoadVersions = new WeakMap();
const staffId = (button) => encodeURIComponent(button.dataset.id);
const formValues = (form) => {
  const f = new FormData(form),
    v = Object.fromEntries(f);
  if (form.querySelector?.('[data-interest-fields]')) v.interests = f.getAll('interests');
  return v;
};
function hasAudienceFilters(filters) {
  return Boolean(
    filters.need || filters.interests.length || filters.minAge !== '' || filters.maxAge !== ''
  );
}
function resetAudienceList(form) {
  audienceLoadVersions.set(form, (audienceLoadVersions.get(form) || 0) + 1);
  const list = form.querySelector('[data-audience-customers]');
  const savedCount = form.querySelector('[data-audience-saved-count]');
  if (savedCount) savedCount.textContent = '';
  list.innerHTML = '';
  list.hidden = true;
  const button = form.querySelector('[data-action="load-audience-customers"]');
  button.setAttribute('aria-expanded', 'false');
  button.textContent = 'Tải danh sách để chọn từng khách';
}
async function toggleAudienceCustomers(button) {
  const form = button.closest('form'),
    list = form.querySelector('[data-audience-customers]');
  if (button.getAttribute('aria-expanded') === 'true') {
    audienceLoadVersions.set(form, (audienceLoadVersions.get(form) || 0) + 1);
    list.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'Tải danh sách để chọn từng khách';
    return;
  }
  const audience = readAudience(form),
    filters = audience.filters,
    key = JSON.stringify(filters),
    actor = me?.id;
  const selected = new Set(audience.customerIds),
    selectAll = ['ALL', 'FILTER'].includes(audience.mode),
    version = (audienceLoadVersions.get(form) || 0) + 1;
  audienceLoadVersions.set(form, version);
  list.hidden = false;
  list.innerHTML = '<p>Đang tải danh sách đã lọc…</p>';
  button.setAttribute('aria-expanded', 'true');
  button.textContent = 'Đóng danh sách đã lọc';
  try {
    const data = await api('/api/admin/surveys/recipients-preview', {
      method: 'POST',
      body: JSON.stringify({
        audience: { mode: hasAudienceFilters(filters) ? 'FILTER' : 'ALL', filters }
      })
    });
    if (
      form.isConnected === false ||
      me?.id !== actor ||
      me?.role !== 'MANAGER' ||
      audienceLoadVersions.get(form) !== version ||
      JSON.stringify(readAudience(form).filters) !== key
    )
      return;
    list.innerHTML =
      `<p><b>${esc(data.count)} khách phù hợp</b> · Tuổi tại ngày ${esc(data.asOf)}</p>` +
      data.customers
        .map((u) => {
          const interests =
            CrmDomain.interests
              .filter((x) => (u.interests || []).includes(x.id))
              .map((x) => x.name)
              .join(', ') || 'Chưa khai báo sở thích';
          return `<label><input type="checkbox" name="audienceCustomer" value="${esc(u.id)}"${selectAll || selected.has(u.id) ? ' checked' : ''}> ${esc(u.name)} · ${esc(u.email)} · ${u.age === null ? 'Chưa có ngày sinh hợp lệ' : esc(u.age) + ' tuổi'} · ${esc(interests)}</label>`;
        })
        .join('') +
      (data.count ? '' : '<p>Không có khách đang hoạt động khớp bộ lọc.</p>');
  } catch (error) {
    if (audienceLoadVersions.get(form) === version) resetAudienceList(form);
    throw error;
  }
}
function handleAudienceChange(event) {
  if (me?.role !== 'MANAGER') return;
  const field = event.target,
    name = field.name,
    form = field.closest?.('form');
  if (!form?.querySelector('[data-audience-fields]')) return;
  const mode = form.querySelector('[name="audienceMode"]');
  if (name === 'audienceCustomer') {
    mode.value = 'SELECTED';
    return;
  }
  if (name === 'audienceMode') {
    if (mode.value === 'ALL')
      for (const input of form.querySelectorAll(
        '[name="audienceNeed"],[name="audienceInterest"],[name="audienceMinAge"],[name="audienceMaxAge"]'
      )) {
        if (input.type === 'checkbox') input.checked = false;
        else input.value = '';
      }
  } else if (
    ['audienceNeed', 'audienceInterest', 'audienceMinAge', 'audienceMaxAge'].includes(name)
  ) {
    if (!mode.value || mode.value === 'ALL') mode.value = 'FILTER';
  } else return;
  resetAudienceList(form);
}
document.addEventListener('change', (event) => {
  trackSurveyPanelChange(event);
  if (event.target.id === 'surveyPageSize') {
    surveyWorkspace.pageSize = Number(event.target.value);
    surveyWorkspace.page = 1;
    surveyWorkspace.scrollY = 0;
    return runStaffTask('survey-page-size', event.target, () => loadSurveys({ preserve: false }));
  }
  handleAudienceChange(event);
  updateDeadlineFields(event);
});
document.addEventListener('input', (event) => {
  trackSurveyPanelChange(event);
  handleAudienceChange(event);
  updateDeadlineFields(event);
});

const canUseStaffAction = (action) =>
  action === 'logout' ||
  (me &&
    ([
      'toggle-account-create',
      'reload-accounts',
      'clear-account-filters',
      'delete-account',
      'adminAccountForm',
      'accountFilters'
    ].includes(action)
      ? me.role === 'ADMIN'
      : me.role === 'MANAGER'));

// LOGIC ĐỌC AN TOÀN: Chỉ nhận kết quả của lần tải mới nhất, đúng người đang đăng nhập.
// Tránh request trả chậm của tài khoản trước ghi đè dữ liệu sau đăng xuất/đổi trang.
async function loadStaffCollection(kind, url, key, apply) {
  const actor = me?.id,
    version = (staffLoadVersions[kind] || 0) + 1;
  staffLoadVersions[kind] = version;
  const data = await api(url);
  if (!me || me.id !== actor || version !== staffLoadVersions[kind]) return;
  apply(data[key]);
  const visible = kind === 'accounts' ? me.role === 'ADMIN' : page === kind;
  if (visible) render();
}
async function loadAccounts() {
  return loadStaffCollection('accounts', '/api/admin/accounts', 'accounts', (value) => {
    accounts = value;
  });
}
async function loadCustomers() {
  return loadStaffCollection(
    'customers',
    '/api/admin/customers?' + new URLSearchParams(customerFilters),
    'customers',
    (value) => {
      customers = value;
    }
  );
}
async function loadFeedback() {
  return loadStaffCollection(
    'feedback',
    '/api/admin/feedback?' +
      new URLSearchParams({ ...feedbackFilters, hidden: showHiddenFeedback }),
    'feedback',
    (value) => {
      feedback = value;
    }
  );
}
async function loadSurveys({ preserve = true } = {}) {
  if (preserve && !document.getElementById('surveyWorkspaceDialog')) captureSurveyContext();
  closeSurveyPanel({ force: true, restore: false });
  const actor = me?.id,
    version = (staffLoadVersions.surveys || 0) + 1;
  staffLoadVersions.surveys = version;
  const data = await api(
    '/api/admin/surveys?' +
      new URLSearchParams({
        ...surveyFilters,
        page: surveyWorkspace.page,
        pageSize: surveyWorkspace.pageSize
      })
  );
  if (me?.id !== actor || version !== staffLoadVersions.surveys || page !== 'surveys') return;
  surveys = data.surveys;
  if (data.pagination) Object.assign(surveyWorkspace, data.pagination);
  render();
  restoreSurveyContext(true);
}
async function loadDashboard() {
  if (me?.role === 'ADMIN') return loadAccounts();
  const actor = me?.id;
  const data = await api('/api/admin/dashboard');
  if (!me || me.id !== actor || page !== 'dashboard') return;
  $('#mCustomers').textContent = data.customers;
  $('#mFeedback').textContent = data.openFeedback;
  $('#mSurveys').textContent = data.openSurveys;
}
async function selectPage(next) {
  if (me?.role === 'ADMIN') return loadAccounts();
  if (!['dashboard', 'customers', 'feedback', 'surveys', 'reports'].includes(next)) return;
  if (page === 'surveys') {
    captureSurveyContext();
    closeSurveyPanel({ force: true, restore: false });
  }
  page = next;
  render();
  if (next === 'reports') return fetchReports();
  return {
    dashboard: loadDashboard,
    customers: loadCustomers,
    feedback: loadFeedback,
    surveys: loadSurveys
  }[next]();
}

Object.assign(staffActions, {
  logout() {
    resetStaffSession();
    render();
  },
  'toggle-account-create'(button) {
    const role = button.dataset.role;
    if (!['CUSTOMER', 'MANAGER'].includes(role)) return;
    if ($('#adminAccountForm') && !confirm('Đóng biểu mẫu hiện tại? Nội dung chưa lưu sẽ bị bỏ.'))
      return;
    accountCreateKind = accountCreateKind === role ? null : role;
    render();
  },
  'reload-accounts': loadAccounts,
  'clear-account-filters'() {
    accountFilters = { q: '', role: '', status: '' };
    render();
  },
  async 'delete-account'(button) {
    if (!confirm('Xóa tài khoản này?')) return;
    await api('/api/admin/accounts/' + staffId(button), { method: 'DELETE' });
    toast('Đã xóa tài khoản.');
    await loadAccounts();
  },
  'toggle-customer-create'() {
    showCustomerCreate = !showCustomerCreate;
    render();
  },
  'search-customers'() {
    customerFilters = {
      q: $('#search')?.value.trim() || '',
      need: $('#needFilter')?.value || '',
      status: $('#customerStatus')?.value || '',
      interest: $('#interestFilter')?.value || '',
      minAge: $('#minAgeFilter')?.value || '',
      maxAge: $('#maxAgeFilter')?.value || ''
    };
    return loadCustomers();
  },
  async 'delete-customer'(button) {
    if (
      !confirm(
        'Xóa thông tin liên hệ/đăng nhập của khách đã khóa? Giữ họ tên, ngày sinh, giới tính, nhu cầu, sở thích, phản hồi và dữ liệu khảo sát. Không thể khôi phục thông tin đã xóa.'
      )
    )
      return;
    await api('/api/admin/customers/' + staffId(button), { method: 'DELETE' });
    toast('Đã xóa khách hàng.');
    await loadCustomers();
  },
  async status(button) {
    await api('/api/admin/customers/' + staffId(button) + '/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: button.dataset.status })
    });
    toast('Đã cập nhật trạng thái.');
    await loadCustomers();
  },
  'filter-feedback'() {
    feedbackFilters = {
      status: $('#feedbackStatus')?.value || '',
      from: $('#feedbackFrom')?.value || '',
      to: $('#feedbackTo')?.value || ''
    };
    if (feedbackFilters.from && feedbackFilters.to && feedbackFilters.from > feedbackFilters.to)
      throw Error('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');
    return loadFeedback();
  },
  // LOGIC: Gom trạng thái + câu trả lời -> PATCH -> tải lại từ DB, không chỉ đổi nhãn trên màn hình.
  'edit-feedback-reply'(button) {
    editingFeedbackId = button.dataset.id;
    render();
    $('#reply-' + editingFeedbackId)?.focus();
  },
  'cancel-edit-feedback'() {
    editingFeedbackId = null;
    render();
  },
  async 'save-feedback'(button) {
    const id = button.dataset.id;
    await api('/api/admin/feedback/' + staffId(button), {
      method: 'PATCH',
      body: JSON.stringify({
        revision: feedback.find((f) => f.id === id)?.revision,
        editReply: editingFeedbackId === id,
        reply: $('#reply-' + id).value
      })
    });
    editingFeedbackId = null;
    toast('Đã lưu câu trả lời.');
    await loadFeedback();
  },
  'toggle-hidden-feedback'() {
    showHiddenFeedback = !showHiddenFeedback;
    return loadFeedback();
  },
  async 'hide-feedback'(button) {
    if (!confirm('Ẩn phản hồi này? Bạn có thể xem và khôi phục lại sau.')) return;
    await api('/api/admin/feedback/' + staffId(button) + '/visibility', {
      method: 'PATCH',
      body: JSON.stringify({ hidden: true })
    });
    toast('Đã ẩn phản hồi.');
    await loadFeedback();
  },
  async 'restore-feedback'(button) {
    await api('/api/admin/feedback/' + staffId(button) + '/visibility', {
      method: 'PATCH',
      body: JSON.stringify({ hidden: false })
    });
    toast('Đã khôi phục phản hồi.');
    await loadFeedback();
  },
  'toggle-hidden-surveys'() {
    captureSurveyContext();
    surveyFilters.hidden = !surveyFilters.hidden;
    Object.assign(
      surveyWorkspace,
      surveyWorkspace.positions[surveyViewKey()] || { page: 1, scrollY: 0 }
    );
    return loadSurveys({ preserve: false });
  },
  async 'hide-survey'(button) {
    if (
      !confirm(
        'Ẩn khảo sát khỏi danh sách Quản lý? Khảo sát vẫn giữ trạng thái và câu trả lời; khách vẫn thực hiện được nếu đang mở.'
      )
    )
      return;
    await api('/api/admin/surveys/' + staffId(button) + '/visibility', {
      method: 'PATCH',
      body: JSON.stringify({ hidden: true })
    });
    toast('Đã ẩn khảo sát.');
    await loadSurveys();
  },
  async 'restore-survey'(button) {
    await api('/api/admin/surveys/' + staffId(button) + '/visibility', {
      method: 'PATCH',
      body: JSON.stringify({ hidden: false })
    });
    toast('Đã khôi phục khảo sát.');
    await loadSurveys();
  },
  'filter-surveys'() {
    const from = $('#surveyFrom')?.value || '',
      to = $('#surveyTo')?.value || '';
    if (from && to && from > to) throw Error('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');
    surveyFilters = {
      hidden: surveyFilters.hidden,
      q: $('#surveySearch')?.value.trim() || '',
      status: surveyFilters.status || '',
      from,
      to,
      dateField: $('#surveyDateField')?.value || 'created'
    };
    surveyWorkspace.page = 1;
    surveyWorkspace.scrollY = 0;
    return loadSurveys({ preserve: false });
  },
  'clear-survey-search'() {
    surveyFilters = { ...surveyFilters, q: '', from: '', to: '', dateField: 'created' };
    surveyWorkspace.page = 1;
    surveyWorkspace.scrollY = 0;
    return loadSurveys({ preserve: false });
  },
  'survey-tab'(button) {
    captureSurveyContext();
    surveyFilters.status = button.dataset.status || '';
    Object.assign(
      surveyWorkspace,
      surveyWorkspace.positions[surveyViewKey()] || { page: 1, scrollY: 0 }
    );
    return loadSurveys({ preserve: false });
  },
  'survey-page'(button) {
    surveyWorkspace.page = Number(button.dataset.pageNumber);
    surveyWorkspace.scrollY = 0;
    return loadSurveys({ preserve: false });
  },
  'close-survey-panel'() {
    return closeSurveyPanel();
  },
  'discard-survey-panel'() {
    return closeSurveyPanel({ force: true });
  },
  'continue-survey-panel'() {
    document.querySelector('#surveyWorkspaceDialog .survey-unsaved-warning')?.remove();
  },
  'expand-survey-panel'(button) {
    const dialog = button.closest('dialog'),
      wide = dialog.classList.toggle('survey-panel-expanded');
    button.setAttribute('aria-label', wide ? 'Thu gọn khung xem' : 'Mở rộng khung xem');
  },
  'show-create'() {
    if (document.getElementById('surveyWorkspaceDialog')?.querySelector('#surveyForm'))
      return closeSurveyPanel();
    if (!closeSurveyPanel({ restore: false })) return;
    showSurveyPanel(createForm(), 'Tạo khảo sát', { editing: true });
  },
  'survey-lifecycle'(button) {
    const s = surveys.find((s) => s.id === button.dataset.id);
    if (!s || !['OPEN', 'CLOSED'].includes(s.status))
      throw Error('Hãy tải lại danh sách khảo sát.');
    if (!closeSurveyPanel({ restore: false })) return;
    showSurveyPanel(
      lifecycleForm(s),
      s.status === 'CLOSED' ? 'Mở lại khảo sát' : 'Gia hạn khảo sát',
      { editing: true, id: s.id }
    );
  },
  'add-question'() {
    const dialog = document.getElementById('surveyWorkspaceDialog');
    if (dialog) dialog.dataset.dirty = 'true';
    $('#questions').insertAdjacentHTML('beforeend', questionBlock());
  },
  'remove-question'(button) {
    const dialog = document.getElementById('surveyWorkspaceDialog');
    if (dialog) dialog.dataset.dirty = 'true';
    button.closest('fieldset').remove();
  },
  'add-editor-question'() {
    const dialog = document.getElementById('surveyWorkspaceDialog');
    if (dialog) dialog.dataset.dirty = 'true';
    $('#questions').insertAdjacentHTML('beforeend', editorQuestion());
  },
  'cancel-survey-edit'() {
    return closeSurveyPanel();
  },
  // Chỉ sửa bản nháp. Khảo sát đang mở phải khóa khẩn cấp qua thao tác riêng trước.
  async 'edit-survey'(button) {
    return requestSurveyPanel(
      button,
      '/api/admin/surveys/' + staffId(button),
      'Chỉnh sửa khảo sát',
      (data) => {
        if (data.survey.status !== 'DRAFT') throw Error('Chỉ sửa khảo sát bản nháp.');
        return surveyEditorForm(data);
      },
      { editing: true }
    );
  },
  // LOGIC: Nút Lập khảo sát ghi ngay một bản DRAFT mới vào DB rồi mới mở trang chỉnh sửa.
  async 'copy-survey'(button) {
    const data = await api('/api/admin/surveys/' + staffId(button) + '/copy', { method: 'POST' });
    if (me?.role !== 'MANAGER') return;
    await loadSurveys();
    if (page === 'surveys') showSurveyEditor(data, button.dataset.id);
    toast('Đã lập bản nháp mới. Bạn có thể chỉnh sửa trước khi mở.');
  },
  async 'open-survey'(button) {
    await api('/api/admin/surveys/' + staffId(button) + '/send', {
      method: 'POST',
      body: JSON.stringify({})
    });
    toast('Đã mở khảo sát theo phạm vi đã lưu.');
    await loadSurveys();
  },
  async 'setup-legacy-audience'(button) {
    const data = await api('/api/admin/surveys/' + staffId(button));
    if (data.survey.status !== 'OPEN' || parseSurveyAudience(data.survey.audience_config))
      throw Error('Chỉ khảo sát cũ đang mở và chưa có phạm vi mới cần thiết lập.');
    $('#app').innerHTML =
      `<button class="btn" data-action="cancel-survey-edit">← Danh sách khảo sát</button><form id="legacySurveyAudienceForm" class="card" data-id="${esc(button.dataset.id)}"><h1>Thiết lập phạm vi cho khảo sát cũ</h1><p class="muted">Chỉ thực hiện một lần cho dữ liệu cũ chưa lưu phạm vi. Giữ người nhận và bài trả lời trước đây.</p>${audienceFields()}<button class="btn primary">Xác nhận phạm vi</button></form>`;
  },
  async 'load-audience-customers'(button) {
    return toggleAudienceCustomers(button);
  },
  async 'close-survey'(button) {
    if (!confirm('Đóng khảo sát ngay? Khách hàng sẽ không thể gửi câu trả lời mới.')) return;
    await api('/api/admin/surveys/' + staffId(button) + '/close', { method: 'POST' });
    toast('Đã đóng khảo sát.');
    await loadSurveys();
  },
  async 'view-survey'(button) {
    return requestSurveyPanel(
      button,
      '/api/admin/surveys/' + staffId(button),
      'Xem khảo sát',
      (data) => surveyInspection(data, true)
    );
  },
  async 'delete-survey'(button) {
    if (!confirm('Xóa vĩnh viễn bản nháp và các câu hỏi?')) return;
    await api('/api/admin/surveys/' + staffId(button), { method: 'DELETE' });
    await loadSurveys();
    toast('Đã xóa bản nháp.');
  },
  async 'emergency-lock-survey'(button) {
    if (!confirm('Dừng nhận bài và chuyển về bản nháp? Chỉ thực hiện khi chưa có bài trả lời.'))
      return;
    await api('/api/admin/surveys/' + staffId(button) + '/emergency-lock', { method: 'POST' });
    await loadSurveys();
    toast('Đã khóa khẩn cấp về bản nháp.');
  },
  async 'view-responses'(button) {
    return requestSurveyPanel(
      button,
      '/api/admin/reports/survey-detail/' + staffId(button),
      'Kết quả khảo sát',
      (data) => surveyInspection(data)
    );
  }
});

function readSurveyQuestions(form, selector = '#questions fieldset') {
  const questions = [...form.querySelectorAll(selector)].map((q) => ({
    text: q.querySelector('[name="questionText"]').value,
    type: q.querySelector('[name="questionType"]').value,
    options: q.querySelector('[name="options"]').value,
    required: q.querySelector('[name="required"]').checked
  }));
  if (!questions.length) throw Error('Khảo sát cần ít nhất một câu hỏi.');
  return questions;
}
Object.assign(staffForms, {
  surveySearchForm() {
    return staffActions['filter-surveys']();
  },
  async surveyLifecycleForm(form) {
    await api('/api/admin/surveys/' + encodeURIComponent(form.dataset.id) + '/lifecycle', {
      method: 'POST',
      body: JSON.stringify({ ...formValues(form), action: form.dataset.action })
    });
    toast(form.dataset.action === 'REOPEN' ? 'Đã mở lại khảo sát.' : 'Đã gia hạn khảo sát.');
    await loadSurveys();
  },
  async login(form) {
    const result = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ ...formValues(form), staffPortal: staffPortal() })
    });
    if (staffPortal() === 'MANAGER' && result.user.role !== 'MANAGER')
      throw Error('Trang này chỉ cho phép Quản lý đăng nhập.');
    if (!['ADMIN', 'MANAGER'].includes(result.user.role))
      throw Error('Tài khoản này không có quyền vận hành CRM.');
    sessionStorage.setItem(TOKEN, result.token);
    if (!admitStaff(result.user)) return;
    resetStaffViewState();
    me = result.user;
    render();
    await loadDashboard();
    if (me?.role === 'ADMIN' && typeof pollRecoveryAdmin === 'function') pollRecoveryAdmin();
  },
  accountFilters(form) {
    const values = formValues(form);
    accountFilters = {
      q: String(values.q || '').trim(),
      role: values.role || '',
      status: values.status || ''
    };
    render();
  },
  async adminAccountForm(form) {
    await api('/api/admin/accounts', { method: 'POST', body: JSON.stringify(formValues(form)) });
    accountCreateKind = null;
    toast('Đã tạo tài khoản.');
    await loadAccounts();
  },
  async legacySurveyAudienceForm(form) {
    if (!readAudience(form).mode) throw Error('Vui lòng chọn phạm vi người nhận.');
    await api('/api/admin/surveys/' + encodeURIComponent(form.dataset.id) + '/send', {
      method: 'POST',
      body: JSON.stringify({ audience: readAudience(form) })
    });
    toast('Đã ghi nhận người nhận khảo sát.');
    await loadSurveys();
  },
  async managerCustomerForm(form) {
    await api('/api/admin/customers', { method: 'POST', body: JSON.stringify(formValues(form)) });
    showCustomerCreate = false;
    toast('Đã thêm khách hàng.');
    await loadCustomers();
  },
  // Tạo phiếu, lưu phạm vi và ghi người nhận trong cùng transaction khi mở.
  async surveyForm(form) {
    const values = formValues(form);
    if (values.status === 'OPEN' && !readAudience(form).mode)
      throw Error('Phải chọn phạm vi người nhận trước khi mở khảo sát.');
    const questions = readSurveyQuestions(form);
    await api('/api/admin/surveys', {
      method: 'POST',
      body: JSON.stringify({ ...values, questions, audience: readAudience(form) })
    });
    toast(values.status === 'OPEN' ? 'Đã tạo và gửi khảo sát.' : 'Đã lưu bản nháp khảo sát.');
    await loadSurveys();
  },
  // LOGIC: Gửi toàn bộ câu hỏi/lựa chọn lên PATCH; thành công mới quay về danh sách và tải lại.
  async surveyEditor(form) {
    const questions = readSurveyQuestions(form, '.survey-question');
    if (formValues(form).status === 'OPEN' && !readAudience(form).mode)
      throw Error('Phải chọn phạm vi người nhận trước khi mở khảo sát.');
    await api('/api/admin/surveys/' + encodeURIComponent(form.dataset.id), {
      method: 'PATCH',
      body: JSON.stringify({ ...formValues(form), questions, audience: readAudience(form) })
    });
    toast('Đã lưu toàn bộ khảo sát.');
    page = 'surveys';
    await loadSurveys();
  }
});

function resetStaffViewState() {
  resetSurveyWorkspace();
  staffSessionVersion++;
  page = 'dashboard';
  customers = [];
  feedback = [];
  surveys = [];
  accounts = [];
  showCustomerCreate = false;
  accountCreateKind = null;
  editingFeedbackId = null;
  showHiddenFeedback = false;
  if (typeof resetReports === 'function') resetReports();
  if (typeof resetRecoveryAdmin === 'function') resetRecoveryAdmin();
}

// LOGIC CHỐNG BẤM LẶP: Khóa cùng khóa tác vụ trong tab, disable nút khi chờ, mở lại ở finally.
// Không thay thế UNIQUE/transaction hay kiểm tra quyền trên server.
async function runStaffTask(key, element, task) {
  if (staffPending.has(key)) return;
  staffPending.add(key);
  const wasDisabled = element?.disabled;
  if (element) element.disabled = true;
  try {
    await task();
  } catch (error) {
    if (error.staleSession) return;
    const dialog = document.getElementById?.('surveyWorkspaceDialog');
    if (dialog?.open) {
      let alert = dialog.querySelector('.survey-panel-error');
      if (!alert) {
        alert = document.createElement('p');
        alert.className = 'error survey-panel-error';
        alert.setAttribute('role', 'alert');
        dialog.querySelector('.survey-panel-body').prepend(alert);
      }
      alert.textContent = error.message;
      dialog.querySelector('.survey-panel-body').scrollTop = 0;
      return;
    }
    const field = $('#error');
    if (field) field.textContent = error.message;
    else toast(error.message);
  } finally {
    staffPending.delete(key);
    if (element) element.disabled = wasDisabled;
  }
}

document.addEventListener('click', async (event) => {
  const eye = event.target.closest('[data-password-toggle]');
  if (eye) {
    event.preventDefault();
    const input = document.getElementById(eye.dataset.passwordToggle);
    if (!input) return;
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    eye.setAttribute('aria-pressed', String(visible));
    eye.setAttribute('aria-label', visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    eye.title = visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu';
    input.focus();
    return;
  }
  const button = event.target.closest('[data-action],[data-page]');
  if (!button) return;
  if (button.dataset.page) {
    if (me?.role !== 'MANAGER') return;
    event.preventDefault();
    return runStaffTask('navigate', button, () => selectPage(button.dataset.page));
  }
  const action = button.dataset.action;
  if (!Object.hasOwn(staffActions, action) || !canUseStaffAction(action)) return;
  if (
    page === 'surveys' &&
    button.dataset.id &&
    !document.getElementById?.('surveyWorkspaceDialog')
  )
    captureSurveyContext(button.dataset.id);
  event.preventDefault();
  return runStaffTask(action, button, () => staffActions[action](button));
});

document.addEventListener('submit', async (event) => {
  const form = event.target;
  if (!Object.hasOwn(staffForms, form.id)) return;
  event.preventDefault();
  if (form.id !== 'login' && !canUseStaffAction(form.id)) return;
  return runStaffTask('form:' + form.id, event.submitter, () => staffForms[form.id](form));
});
