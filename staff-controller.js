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
  handleAudienceChange(event);
  updateDeadlineFields(event);
});
document.addEventListener('input', (event) => {
  handleAudienceChange(event);
  updateDeadlineFields(event);
});

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
      status: $('#customerStatus')?.value || '',
      interest: $('#interestFilter')?.value || '',
      minAge: $('#minAgeFilter')?.value || '',
      maxAge: $('#maxAgeFilter')?.value || ''
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
    const host = $('#createSurvey');
    host.innerHTML = host.querySelector('#surveyForm') ? '' : createForm();
  },
  'survey-lifecycle'(button) {
    const s = surveys.find((s) => s.id === button.dataset.id);
    if (!s || !['OPEN', 'CLOSED'].includes(s.status))
      throw Error('Hãy tải lại danh sách khảo sát.');
    $('#createSurvey').innerHTML = lifecycleForm(s);
    globalThis.scrollTo?.({ top: 0, behavior: 'smooth' });
  },
  async 'survey-lifecycle-history'(button) {
    const actor = me?.id;
    const data = await api('/api/admin/surveys/' + staffId(button) + '/lifecycle');
    if (me?.id !== actor || page !== 'surveys') return;
    const date = (value) =>
      value ? new Date(value + 'Z').toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '';
    const due = (value) => (value ? value.split('-').reverse().join('/') : 'Đóng thủ công');
    $('#createSurvey').innerHTML =
      `<section class="card"><h2>Lịch sử gia hạn / mở lại: ${esc(data.survey.title)}</h2>${data.survey.auto_closed_at ? `<p>Tự đóng do hết hạn: ${esc(date(data.survey.auto_closed_at))} (giờ Việt Nam)</p>` : ''}<table class="table"><thead><tr><th>Thời điểm (VN)</th><th>Người thực hiện</th><th>Thao tác</th><th>Hạn cũ</th><th>Hạn mới</th></tr></thead><tbody>${data.history.map((h) => `<tr><td>${esc(date(h.created_at))}</td><td>${esc(h.actor)}</td><td>${h.action === 'REOPEN' ? 'Mở lại' : h.action === 'CLOSE' ? 'Đóng thủ công' : 'Gia hạn / điều chỉnh'}</td><td>${esc(due(h.oldDueDate))}</td><td>${esc(due(h.newDueDate))}</td></tr>`).join('') || '<tr><td colspan="5">Chưa có thay đổi.</td></tr>'}</tbody></table><button class="btn" data-action="cancel-survey-edit">Đóng lịch sử</button></section>`;
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
  async surveyLifecycleForm(form) {
    await api('/api/admin/surveys/' + encodeURIComponent(form.dataset.id) + '/lifecycle', {
      method: 'POST',
      body: JSON.stringify({ ...formValues(form), action: form.dataset.action })
    });
    toast(
      form.dataset.action === 'REOPEN' ? 'Đã mở lại khảo sát.' : 'Đã cập nhật thời điểm kết thúc.'
    );
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
