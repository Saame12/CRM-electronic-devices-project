/* Application controller: one dispatcher per event, domain-specific action maps. */
const staffPending = new Set();
const staffLoadVersions = Object.create(null);
const staffId = (button) => encodeURIComponent(button.dataset.id);
const formValues = (form) => Object.fromEntries(new FormData(form));
const canUseStaffAction = (action) =>
  action === 'logout' ||
  (me &&
    ([
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
async function loadSurveys() {
  return loadStaffCollection(
    'surveys',
    '/api/admin/surveys?' + new URLSearchParams(surveyFilters),
    'surveys',
    (value) => {
      surveys = value;
    }
  );
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
      status: $('#customerStatus')?.value || ''
    };
    return loadCustomers();
  },
  async 'delete-customer'(button) {
    if (!confirm('Xóa khách hàng chưa có lịch sử dữ liệu?')) return;
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
  async 'save-feedback'(button) {
    const id = button.dataset.id;
    await api('/api/admin/feedback/' + staffId(button), {
      method: 'PATCH',
      body: JSON.stringify({ status: $('#status-' + id).value, reply: $('#reply-' + id).value })
    });
    toast('Đã lưu phản hồi.');
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
    surveyFilters.hidden = !surveyFilters.hidden;
    return loadSurveys();
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
    surveyFilters = {
      hidden: surveyFilters.hidden,
      q: $('#surveySearch')?.value.trim() || '',
      status: $('#surveyStatus')?.value || ''
    };
    return loadSurveys();
  },
  'show-create'() {
    $('#createSurvey').innerHTML = createForm();
  },
  'add-question'() {
    $('#questions').insertAdjacentHTML('beforeend', questionBlock());
  },
  'remove-question'(button) {
    button.closest('fieldset').remove();
  },
  'add-editor-question'() {
    $('#questions').insertAdjacentHTML('beforeend', editorQuestion());
  },
  'cancel-survey-edit'() {
    page = 'surveys';
    return loadSurveys();
  },
  // LOGIC: Nếu OPEN chưa có câu trả lời, bấm Sửa sẽ gọi API đổi thật về DRAFT trước khi mở editor.
  // Hủy editor không tự hoàn tác trạng thái OPEN; backend từ chối nếu đã có câu trả lời.
  async 'edit-survey'(button) {
    let data = await api('/api/admin/surveys/' + staffId(button));
    if (data.survey.status === 'OPEN') {
      await api('/api/admin/surveys/' + staffId(button), {
        method: 'PATCH',
        body: JSON.stringify({ status: 'DRAFT' })
      });
      data = await api('/api/admin/surveys/' + staffId(button));
    }
    if (data.survey.status !== 'DRAFT')
      throw Error('Chỉ chỉnh sửa nội dung khảo sát ở trạng thái DRAFT.');
    if (me?.role === 'MANAGER' && page === 'surveys') showSurveyEditor(data);
  },
  // LOGIC: Nút Lập khảo sát ghi ngay một bản DRAFT mới vào DB rồi mới mở trang chỉnh sửa.
  async 'copy-survey'(button) {
    const data = await api('/api/admin/surveys/' + staffId(button) + '/copy', { method: 'POST' });
    if (me?.role !== 'MANAGER') return;
    surveys.unshift(data.survey);
    if (page === 'surveys') showSurveyEditor(data);
    toast('Đã lập bản nháp mới. Bạn có thể chỉnh sửa trước khi mở.');
  },
  async 'send-survey'(button) {
    await api('/api/admin/surveys/' + staffId(button) + '/send', { method: 'POST' });
    toast('Đã gửi khảo sát đến khách hàng đang hoạt động.');
    await loadSurveys();
  },
  async 'close-survey'(button) {
    if (!confirm('Đóng khảo sát ngay? Khách hàng sẽ không thể gửi câu trả lời mới.')) return;
    await api('/api/admin/surveys/' + staffId(button) + '/close', { method: 'POST' });
    toast('Đã đóng khảo sát.');
    await loadSurveys();
  },
  async 'view-responses'(button) {
    const data = await api('/api/admin/surveys/' + staffId(button) + '/responses');
    if (me?.role !== 'MANAGER' || page !== 'surveys') return;
    const content = data.responses.length
      ? data.responses
          .map(
            (r) =>
              '<article class="card response-card"><b>' +
              esc(r.full_name) +
              '</b> · ' +
              esc(r.email) +
              '<p class="muted">Hoàn thành: ' +
              new Date(r.submitted_at).toLocaleString('vi-VN') +
              '</p>' +
              r.answers
                .map((a) => '<p><b>' + esc(a.question) + '</b><br>' + esc(a.answer) + '</p>')
                .join('') +
              '</article>'
          )
          .join('')
      : '<p class="muted">Chưa có khách hàng hoàn thành khảo sát này.</p>';
    $('#createSurvey').innerHTML =
      '<section class="survey-results"><h2>Kết quả khảo sát: ' +
      esc(data.survey.title) +
      '</h2>' +
      content +
      '</section>';
    globalThis.scrollTo?.({ top: 0, behavior: 'smooth' });
  }
});

function readSurveyQuestions(form, selector = 'fieldset') {
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
    toast('Đã tạo tài khoản.');
    await loadAccounts();
  },
  async managerCustomerForm(form) {
    await api('/api/admin/customers', { method: 'POST', body: JSON.stringify(formValues(form)) });
    showCustomerCreate = false;
    toast('Đã thêm khách hàng.');
    await loadCustomers();
  },
  // LOGIC: Tạo phiếu trước; nếu chọn OPEN thì gọi thêm /send để ghi người nhận.
  // Đây là HAI request, không phải một transaction chung; lỗi send không tự xóa phiếu vừa tạo.
  async surveyForm(form) {
    const values = formValues(form),
      questions = readSurveyQuestions(form);
    const created = await api('/api/admin/surveys', {
      method: 'POST',
      body: JSON.stringify({ ...values, questions })
    });
    if (values.status === 'OPEN')
      await api('/api/admin/surveys/' + encodeURIComponent(created.id) + '/send', {
        method: 'POST'
      });
    toast(values.status === 'OPEN' ? 'Đã tạo và gửi khảo sát.' : 'Đã lưu bản nháp khảo sát.');
    await loadSurveys();
  },
  // LOGIC: Gửi toàn bộ câu hỏi/lựa chọn lên PATCH; thành công mới quay về danh sách và tải lại.
  async surveyEditor(form) {
    const questions = readSurveyQuestions(form, '.survey-question');
    await api('/api/admin/surveys/' + encodeURIComponent(form.dataset.id), {
      method: 'PATCH',
      body: JSON.stringify({ ...formValues(form), questions })
    });
    toast('Đã lưu toàn bộ khảo sát.');
    page = 'surveys';
    await loadSurveys();
  }
});

function resetStaffViewState() {
  staffSessionVersion++;
  page = 'dashboard';
  customers = [];
  feedback = [];
  surveys = [];
  accounts = [];
  showCustomerCreate = false;
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
