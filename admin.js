/* Staff core: shared session, API, rendering and role-aware login.
 * Page views: role-ui.js. Surveys: staff-surveys.js. Events: staff-controller.js.
 */
const $ = (selector) => document.querySelector(selector);
const TOKEN = 'backline_crm_admin_token';
const esc = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
let me = null,
  page = 'dashboard',
  customers = [],
  feedback = [],
  surveys = [];
let accounts = [],
  showCustomerCreate = false,
  showHiddenFeedback = false;
let accountFilters = { q: '', role: '', status: '' };
let customerFilters = { q: '', need: '', status: '' };
let feedbackFilters = { status: '', from: '', to: '' };
let surveyFilters = { q: '', status: '' };
let staffSessionVersion = 0;
const staffActions = Object.create(null);
const staffForms = Object.create(null);
const filteredAccounts = () =>
  accounts.filter(
    (a) =>
      (!accountFilters.role || a.role === accountFilters.role) &&
      (!accountFilters.status || a.status === accountFilters.status) &&
      (!accountFilters.q ||
        [a.name, a.email, a.phone].some((v) =>
          String(v || '')
            .toLocaleLowerCase('vi')
            .includes(accountFilters.q.toLocaleLowerCase('vi'))
        ))
  );

function staffPortal() {
  return /\/manager\.html$/i.test(globalThis.location?.pathname || '')
    ? 'MANAGER'
    : /\/admin\.html$/i.test(globalThis.location?.pathname || '')
      ? 'ADMIN'
      : null;
}
function admitStaff(user, restoring = false) {
  if (!['ADMIN', 'MANAGER'].includes(user?.role))
    throw Error('Tài khoản này không có quyền vận hành CRM.');
  const portal = staffPortal();
  if (portal === 'MANAGER' && user.role !== 'MANAGER') {
    if (restoring) {
      globalThis.location.replace('admin.html');
      return false;
    }
    throw Error('Trang này chỉ cho phép Quản lý đăng nhập. Vui lòng dùng trang Admin.');
  }
  if (portal === 'ADMIN' && user.role === 'MANAGER') {
    globalThis.location.replace('manager.html');
    return false;
  }
  return true;
}

async function api(url, options = {}) {
  const requestVersion = staffSessionVersion;
  const token = sessionStorage.getItem(TOKEN);
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  if (requestVersion !== staffSessionVersion) {
    const error = Error('Phiên làm việc đã thay đổi.');
    error.staleSession = true;
    throw error;
  }
  if (!response.ok) throw Error(data.error || 'Không thể kết nối máy chủ.');
  return data;
}

function toast(t) {
  const e = $('#toast');
  e.textContent = t;
  e.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => e.classList.remove('show'), 2600);
}

function render() {
  $('#identity').innerHTML = me
    ? `<span class="identity-name">${esc(me.name)} <small>${me.role === 'ADMIN' ? 'Quản trị viên' : 'Quản lý'}</small></span><button class="btn small" data-action="logout">Đăng xuất</button>`
    : '<span class="header-caption">Hệ thống quản trị quan hệ khách hàng</span>';
  $('#app').innerHTML = me ? main() : login();
}

function login() {
  return `<section class="login"><span class="login-eyebrow">BACKLINE WORKSPACE</span><h1>Đăng nhập ${staffPortal() === 'MANAGER' ? 'Quản lý' : 'Admin'}</h1><p>${staffPortal() === 'MANAGER' ? 'Chỉ dành cho tài khoản Quản lý.' : 'Dành cho Admin. Tài khoản Quản lý sẽ được chuyển sang trang Quản lý.'}</p><form id="login"><label>Email<input type="email" name="email" autocomplete="username" required></label><label>Mật khẩu<input type="password" name="password" autocomplete="current-password" required></label><div id="error" class="error"></div><button class="btn primary full">Đăng nhập</button></form></section>`;
}

function resetStaffSession() {
  staffSessionVersion++;
  sessionStorage.removeItem(TOKEN);
  me = null;
  page = 'dashboard';
  customers = [];
  feedback = [];
  surveys = [];
  accounts = [];
  showCustomerCreate = false;
  showHiddenFeedback = false;
  accountFilters = { q: '', role: '', status: '' };
  customerFilters = { q: '', need: '', status: '' };
  feedbackFilters = { status: '', from: '', to: '' };
  surveyFilters = { q: '', status: '' };
  if (typeof resetReports === 'function') resetReports();
  if (typeof resetRecoveryAdmin === 'function') resetRecoveryAdmin();
}
