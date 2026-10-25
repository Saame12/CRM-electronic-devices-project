/* ==========================================
   1. CÁC HÀM TIỆN ÍCH CƠ BẢN & DỮ LIỆU MẪU
   ========================================== */
// Rút gọn hàm querySelector
const $ = (s) => document.querySelector(s);

// Hàm chống lỗi XSS (bảo mật ký tự đặc biệt)
const esc = (s) =>
  String(s == null ? '' : s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

// Lấy ngày hiện tại định dạng kiểu Việt Nam
const today = () => new Date().toLocaleDateString('vi-VN');

// Danh sách nhu cầu, sản phẩm và loại phản hồi mẫu
const NEEDS = ['Gaming', 'Đồ họa', 'Văn phòng', 'Chưa xác định'];
const PRODS = [
  'Dell Inspiron 15 3530',
  'HP 15-fd0231TU',
  'Lenovo IdeaPad Slim 3 15IAH8',
  'ASUS Vivobook 15 X1504',
  'ASUS TUF Gaming F15 FX507',
  'Lenovo LOQ 15IAX9',
  'MSI Thin 15 B13VE',
  'Acer Nitro V 15 ANV15',
  'PC Gaming Backline G1',
  'PC Gaming Backline G2',
  'PC Gaming Backline G3',
  'PC Đồ họa Backline D1',
  'PC Văn phòng Backline O1',
  'PC Văn phòng Backline O2'
];
const FTYPE = ['Góp ý', 'Khen ngợi', 'Báo lỗi / Khiếu nại', 'Câu hỏi'];

// Dữ liệu khách hàng và khảo sát chỉ lấy từ API MySQL.
const FB = {};
const DONE = {};
let SV = [];

// Biến trạng thái ứng dụng hiện tại
let me = null,
  tab = 'survey',
  open = null,
  authTab = 'login',
  profileOpen = false,
  profileNoticeOpen = false,
  onboarding = false,
  onboardingNoticeOpen = false;
const TOKEN_KEY = 'backline_crm_token';
const ONBOARDING_KEY = 'backline_crm_profile_onboarding';
const hiddenSurveyKey = () => `backline_crm_hidden_surveys_${me?.email || ''}`;
let showHiddenSurveys = false;
const hiddenSurveys = () => {
  try {
    const ids = JSON.parse(localStorage.getItem(hiddenSurveyKey()) || '[]');
    return new Set(Array.isArray(ids) ? ids : []);
  } catch (_) {
    return new Set();
  }
};
const hideSurvey = (id) => {
  const ids = hiddenSurveys();
  ids.add(id);
  localStorage.setItem(hiddenSurveyKey(), JSON.stringify([...ids]));
};

async function api(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { credentials: 'same-origin', ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Không thể kết nối đến máy chủ.');
  return data;
}

// LOGIC ĐỌC: Nạp lại feedback, trạng thái hoàn thành và khảo sát từ API; không ghi MySQL.
// FB/DONE/SV chỉ là bản dữ liệu trong RAM của trang, mất khi tải lại rồi được lấy lại từ server.
async function refreshData() {
  const [feedbackResult, surveyResult, surveysResult] = await Promise.all([
    api('/api/feedback'),
    api('/api/survey-status'),
    api('/api/surveys')
  ]);
  FB[me.email] = feedbackResult.feedback;
  DONE[me.email] = surveyResult.completed;
  SV = surveysResult.surveys;
}

async function restoreSession() {
  // Cookie HttpOnly được trình duyệt gửi tự động khi tải lại trang.
  try {
    me = (await api('/api/me')).user;
    applyProfileGate();
    if (!onboarding) await refreshData();
  } catch (_) {
    sessionStorage.removeItem(TOKEN_KEY);
    me = null;
  }
  render();
}

/* ==========================================
   2. CÁC HÀM XỬ LÝ GIAO DIỆN (UI RENDERING)
   ========================================== */
// Hiển thị thông báo nhanh (Toast)
function toast(t) {
  const e = $('#toast');
  e.textContent = t;
  e.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => e.classList.remove('show'), 2800);
}

// Tạo giao diện chọn số sao đánh giá
const stars = (id, v) =>
  `<div class="stars" id="${id}" data-val="${v || 0}" role="group" aria-label="Đánh giá sao">${[1, 2, 3, 4, 5].map((i) => `<button type="button" class="st${i <= v ? ' on' : ''}" data-act="star" data-v="${i}" aria-label="${i} sao">★</button>`).join('')}</div>`;

// Hiển thị số sao tĩnh (Readonly)
const ro = (n) =>
  `<span class="ro" aria-label="${n} sao">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>`;

// Lọc các khảo sát chưa hoàn thành
const dateFromVN = (value) => {
  const m = String(value || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? new Date(+m[3], +m[2] - 1, +m[1], 23, 59, 59) : null;
};
const isExpired = (s) =>
  s.isExpired ||
  Boolean(
    s.dueDate
      ? new Date(`${s.dueDate}T23:59:59`) < new Date()
      : dateFromVN(s.due) && dateFromVN(s.due) < new Date()
  );
const pending = () => SV.filter((s) => !(DONE[me.email] || {})[s.id] && !isExpired(s));
const profileNeedsCompletion = () =>
  Boolean(
    me &&
    (!String(me.name || '').trim() ||
      !/^0\d{9,10}$/.test(String(me.phone || '').trim()) ||
      !String(me.addr || '').trim() ||
      !BirthDate.validISO(me.birthDate) ||
      !['Nam', 'Nữ', 'Khác'].includes(me.gender) ||
      !NEEDS.includes(me.need))
  );
// LOGIC ĐIỀU HƯỚNG: Tính hồ sơ còn thiếu -> chặn giao diện khảo sát và mở thông báo bắt buộc.
// Cờ sessionStorage chỉ hỗ trợ UI; không phải quyền truy cập backend hay dữ liệu hồ sơ trong DB.
function applyProfileGate() {
  onboarding = profileNeedsCompletion();
  onboardingNoticeOpen = onboarding;
  profileOpen = false;
  profileNoticeOpen = false;
  if (onboarding) sessionStorage.setItem(ONBOARDING_KEY, '1');
  else sessionStorage.removeItem(ONBOARDING_KEY);
}

// Hàm render chính để vẽ lại giao diện dựa trên trạng thái đăng nhập
// LOGIC HỒ SƠ: Chỉ header mở pop-up; không lặp đường dẫn hồ sơ ở menu hoặc thẻ bên cạnh.
function render() {
  $('#who').innerHTML = me
    ? `<button class="profile-trigger" data-act="profile" title="Mở thông tin cá nhân"><span class="header-avatar" aria-hidden="true">${esc(
        String(me.name || 'K')
          .trim()
          .charAt(0)
          .toUpperCase()
      )}</span><span class="profile-name">${esc(me.name)}</span><svg class="profile-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg></button><button class="btn sm" data-act="out">Đăng xuất</button>`
    : '';
  $('#app').innerHTML = me ? main() : auth();
  $('#profileModal').innerHTML =
    me && profileOpen
      ? `<div class="modal-backdrop" data-act="profile-close"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="profile-title" onclick="event.stopPropagation()"><div class="modal-head"><div><h1 id="profile-title">Thông tin cá nhân</h1><p class="mu">Cập nhật hồ sơ để nhận tư vấn và hỗ trợ phù hợp hơn.</p></div><button class="btn sm" type="button" data-act="profile-close" aria-label="Đóng">Đóng</button></div>${profView()}</section></div>`
      : '';
  if (me && onboardingNoticeOpen) {
    $('#profileModal').innerHTML =
      `<dialog id="onboardingDialog" class="modal onboarding-notice" aria-labelledby="onboardingTitle" aria-describedby="onboardingMessage"><h1 id="onboardingTitle">Thông báo</h1><p id="onboardingMessage">Vui lòng nhập thông tin cá nhân để có trải nghiệm tốt hơn.</p><button class="btn pri" type="button" data-act="begin-onboarding" autofocus>OK</button></dialog>`;
    const dialog = $('#onboardingDialog');
    dialog.oncancel = (event) => event.preventDefault();
    if (typeof dialog.showModal === 'function') dialog.showModal();
  }
  $('#profileReminder').innerHTML =
    me && profileNoticeOpen && !onboarding
      ? `<aside class="profile-reminder" role="alert"><span>Vui lòng nhập thông tin cá nhân để có trải nghiệm tốt hơn.</span><button type="button" class="reminder-close" data-act="profile-notice-close" aria-label="Đóng thông báo">×</button></aside>`
      : '';
}

const restoreSurvey = (id) => {
  const ids = hiddenSurveys();
  ids.delete(id);
  localStorage.setItem(hiddenSurveyKey(), JSON.stringify([...ids]));
};
function customerPassword(name, autocomplete, placeholder = '') {
  return `<span class="customer-password"><input name="${name}" type="password" autocomplete="${autocomplete}" placeholder="${placeholder}"><button type="button" class="customer-password-eye" data-customer-password-toggle aria-label="Hiện mật khẩu" aria-pressed="false" title="Hiện mật khẩu"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path class="eye-slash" d="m3 3 18 18"/></svg></button></span>`;
}

function customerIcon(name) {
  const paths = {
    survey:
      '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h3"/>',
    chat: '<path d="M21 11a8 8 0 0 1-8 8H8l-5 3V11a9 9 0 0 1 18 0Z"/><path d="M7 10h10M7 14h6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    shield: '<path d="m12 2 8 3v6c0 6-8 11-8 11S4 17 4 11V5l8-3Z"/><path d="m8 11 3 3 5-6"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.survey}</svg>`;
}
function customerEmpty(title, description, icon = 'survey') {
  return `<div class="card empty"><span class="empty-icon">${customerIcon(icon)}</span><strong>${esc(title)}</strong><p>${esc(description)}</p></div>`;
}
function customerWelcome() {
  const completed = Object.keys(DONE[me.email] || {}).length;
  return `<section class="customer-welcome"><div><span class="eyebrow">BACKLINE / KHÔNG GIAN KHÁCH HÀNG</span><h2>Xin chào, ${esc(me.name)}.</h2><p>Mỗi chia sẻ của bạn giúp chúng tôi mang đến trải nghiệm tốt hơn.</p><span class="welcome-caption">${customerIcon('shield')} Đồng hành cùng bạn, từ lựa chọn đến trải nghiệm.</span></div><div class="welcome-art" aria-hidden="true"><div class="art-orbit"></div><span class="art-survey">${customerIcon('survey')}</span><span class="art-check">${customerIcon('check')}</span><span class="art-chat">${customerIcon('chat')}</span></div></section><section class="customer-metrics" aria-label="Tổng quan hoạt động"><article><span class="metric-icon">${customerIcon('survey')}</span><div><strong>${pending().length}</strong><span>Khảo sát đang chờ</span></div></article><article><span class="metric-icon blue">${customerIcon('check')}</span><div><strong>${completed}</strong><span>Khảo sát đã gửi</span></div></article><article><span class="metric-icon amber">${customerIcon('chat')}</span><div><strong>${(FB[me.email] || []).length}</strong><span>Phản hồi đã gửi</span></div></article></section>`;
}

// Giao diện Đăng nhập / Đăng ký
function auth() {
  const L = authTab === 'login';
  return (
    `<div class="auth-layout"><aside class="auth-story"><span class="eyebrow">BACKLINE PC & LAPTOP</span><h2>Trải nghiệm tốt hơn.<br>Bắt đầu từ kết nối.</h2><p>Một không gian để chia sẻ nhu cầu, gửi góp ý và đồng hành cùng Backline.</p><div class="auth-visual" aria-hidden="true"><div class="visual-screen"><span class="visual-dot"></span><span class="visual-line"></span><div class="visual-bars"><i></i><i></i><i></i><i></i><i></i></div><span class="visual-caption">YOUR EXPERIENCE MATTERS</span></div><div class="visual-base"></div><span class="visual-bubble">${customerIcon('check')} Lắng nghe để tốt hơn</span></div><div class="auth-benefits"><span>${customerIcon('survey')} Tham gia khảo sát</span><span>${customerIcon('chat')} Kết nối & phản hồi</span></div></aside><section class="card auth"><div class="tabs"><button class="${L ? 'on' : ''}" data-act="atab" data-v="login">Đăng nhập</button><button class="${L ? '' : 'on'}" data-act="atab" data-v="reg">Đăng ký</button></div><span class="eyebrow">TÀI KHOẢN KHÁCH HÀNG</span><h1>${L ? 'Chào mừng bạn quay lại' : 'Tạo tài khoản Backline'}</h1><p class="auth-subtitle">${L ? 'Đăng nhập để tiếp tục hành trình của bạn.' : 'Kết nối với cửa hàng và chia sẻ điều bạn quan tâm.'}</p>` +
    (L
      ? `<form id="login" novalidate><label>Email<input name="email" type="email" autocomplete="username" placeholder="ten@email.com"></label><label>Mật khẩu${customerPassword('pass', 'current-password')}</label><label class="remember-login"><input name="remember" type="checkbox"> Ghi nhớ đăng nhập trong 7 ngày</label><div class="err" id="err" role="alert"></div><button class="btn pri full">Đăng nhập</button><p class="mu" style="margin:12px 0 0">Dùng thử: khach@demo.vn / 123456</p></form>`
      : `<form id="reg" novalidate><label>Họ và tên<input name="name" autocomplete="name"></label><div class="grid"><label>Email<input name="email" type="email" autocomplete="email"></label><label>Số điện thoại<input name="phone" type="tel" autocomplete="tel" placeholder="0901234567"></label></div><div class="grid"><label>Ngày sinh<input name="birthDate" type="text" inputmode="numeric" autocomplete="bday" placeholder="dd/mm/yyyy" maxlength="10" required aria-describedby="birthDateHint"><small id="birthDateHint">Ví dụ: 21/10/1998</small></label><label>Giới tính<select name="gender" required><option value="">Chọn giới tính</option><option>Nam</option><option>Nữ</option><option>Khác</option></select></label></div><div class="grid"><label>Mật khẩu${customerPassword('pass', 'new-password', 'Ít nhất 6 ký tự')}</label><label>Nhập lại mật khẩu${customerPassword('pass2', 'new-password')}</label></div><div class="err" id="err" role="alert"></div><button class="btn pri full">Tạo tài khoản</button></form>`) +
    '</section></div>'
  );
}

// Giao diện trang chủ sau khi đăng nhập
function main() {
  if (onboarding)
    return `<section class="onboarding"><span class="eyebrow">HOÀN THIỆN TÀI KHOẢN</span><h1>Hoàn thiện thông tin cá nhân</h1><p class="mu">Bạn cần lưu đầy đủ thông tin trước khi sử dụng khảo sát.</p>${profView()}</section>`;
  const n = pending().length;
  const nav = [
    ['survey', 'Khảo sát', 'survey'],
    ['fb', 'Phản hồi sản phẩm', 'chat']
  ];
  const content =
    tab === 'survey' ? (open ? svForm(SV.find((s) => s.id === open)) : svList()) : fbView();
  return `<div class="customer-shell"><aside class="customer-sidebar"><span class="sidebar-caption">KHÔNG GIAN CỦA BẠN</span><nav aria-label="Điều hướng khách hàng">${nav.map(([key, label, icon]) => `<button class="${tab === key ? 'on' : ''}" data-act="tab" data-v="${key}" ${tab === key ? 'aria-current="page"' : ''}>${customerIcon(icon)}<span>${label}</span>${key === 'survey' && n ? `<span class="nav-count">${n}</span>` : ''}</button>`).join('')}</nav></aside><div class="customer-body">${!open ? customerWelcome() : ''}<div class="customer-workspace ${tab !== 'survey' || open ? 'wide' : ''}"><section class="customer-content">${content}</section></div></div></div>`;
}

// Danh sách các phiếu khảo sát
function svList() {
  const done = DONE[me.email] || {},
    hidden = hiddenSurveys();
  const active = SV.filter((s) => !done[s.id] && !isExpired(s));
  const history = SV.filter((s) => done[s.id] || isExpired(s)),
    hiddenCount = history.filter((s) => hidden.has(s.id)).length;
  const completed = history.filter((s) => hidden.has(s.id) === showHiddenSurveys);
  const card = (s, type) => {
    const date = done[s.id],
      isDone = Boolean(date),
      expired = !isDone && isExpired(s),
      minutes = Number(s.min) || Math.max(1, Math.ceil(s.qs.length / 3));
    return `<article class="card survey-card ${type === 'active' ? 'survey-active' : 'survey-completed'}"><div class="survey-card-top"><span class="survey-icon">${customerIcon(isDone ? 'check' : expired ? 'clock' : 'survey')}</span><span class="b ${isDone ? 'ok' : expired ? 'warn' : 'in'}">${isDone ? 'Đã hoàn thành' : expired ? 'Quá hạn chưa trả lời' : 'Khảo sát mới'}</span></div><h2>${esc(s.title)}</h2><p class="survey-description">${esc(s.desc)}</p><div class="survey-meta"><span>${customerIcon('survey')} ${s.qs.length} câu hỏi</span><span>${customerIcon('clock')} Khoảng ${minutes} phút</span></div><div class="survey-card-bottom"><span class="survey-date">${isDone ? 'Đã gửi: ' + esc(date) : 'Hạn: ' + esc(s.due || 'Không đặt hạn')}</span>${type === 'active' ? `<button class="btn pri" data-act="start" data-v="${esc(s.id)}">Thực hiện khảo sát ${customerIcon('arrow')}</button>` : `<button class="btn sm" data-act="${showHiddenSurveys ? 'restore-survey' : 'hide-survey'}" data-v="${esc(s.id)}">${showHiddenSurveys ? 'Bỏ ẩn' : 'Ẩn khảo sát'}</button>`}</div></article>`;
  };
  return `<div class="page-heading"><span class="eyebrow">CHIA SẺ ĐỂ CÙNG TỐT HƠN</span><h1>Khảo sát dành cho bạn</h1><p class="mu">Khảo sát đang mở có thể thực hiện. Các khảo sát quá hạn chưa trả lời được chuyển vào mục đã hoàn thành.</p></div><div class="section-heading"><h2>Khảo sát mới đang mở <span class="section-count">${active.length}</span></h2><span class="section-hint">Sẵn sàng lắng nghe bạn</span></div><div class="survey-grid">${active.length ? active.map((s) => card(s, 'active')).join('') : customerEmpty('Hiện không có khảo sát mới cần thực hiện.', 'Các khảo sát đang mở sẽ xuất hiện tại đây.')}</div><div class="section-heading survey-history-heading"><div><h2>${showHiddenSurveys ? 'Khảo sát đã ẩn' : 'Đã hoàn thành'} <span class="section-count">${completed.length}</span></h2><p class="mu">Gồm khảo sát đã trả lời và quá hạn chưa trả lời.</p></div><button class="btn sm" data-act="toggle-hidden-surveys" aria-pressed="${showHiddenSurveys}">${showHiddenSurveys ? 'Quay lại đã hoàn thành' : 'Xem khảo sát đã ẩn (' + hiddenCount + ')'}</button></div><div class="survey-grid history-grid">${completed.length ? completed.map((s) => card(s, 'completed')).join('') : customerEmpty(showHiddenSurveys ? 'Không có khảo sát đã ẩn.' : 'Chưa có khảo sát hoàn tất hoặc quá hạn.', 'Lịch sử và trạng thái khảo sát của bạn được hiển thị tại đây.', 'check')}</div>`;
}

// Form chi tiết làm một bảng khảo sát
function svForm(s) {
  return (
    `<button class="btn sm" data-act="back" style="margin-bottom:12px">← Danh sách khảo sát</button><form id="sv" class="card survey-form" novalidate><span class="eyebrow">Ý KIẾN CỦA BẠN RẤT QUAN TRỌNG</span><h1>${esc(s.title)}</h1><p class="mu">${esc(s.desc)} Các câu có dấu * là bắt buộc.</p>` +
    s.qs
      .map((q, i) => {
        let c = '';
        if (q.t === 'rate') c = stars('q' + i, 0);
        else if (q.t === 'text')
          c = `<textarea name="q${i}" placeholder="Nhập ý kiến của bạn"></textarea>`;
        else
          c = q.o
            .map(
              (o) =>
                `<label class="opt" style="margin:0;color:var(--tx);font-size:15px"><input type="${q.t === 'one' ? 'radio' : 'checkbox'}" name="q${i}" value="${esc(o)}"> ${esc(o)}</label>`
            )
            .join('');
        return `<div class="q"><span class="question-label">CÂU ${i + 1} / ${s.qs.length}</span><b>${i + 1}. ${esc(q.q)}${q.req ? ' *' : ''}</b>${c}</div>`;
      })
      .join('') +
    `<div class="err" id="err" role="alert"></div><button class="btn pri">Gửi khảo sát</button></form>`
  );
}

// Giao diện Phản hồi sản phẩm
function fbView() {
  const L = FB[me.email] || [];
  return (
    `<div class="feedback-layout"><form id="fb" class="card feedback-form" novalidate><span class="eyebrow">KẾT NỐI VỚI BACKLINE</span><h1>Gửi phản hồi về sản phẩm</h1><p class="mu">Bạn cần tư vấn hoặc hỗ trợ? Gửi phản hồi tại đây và theo dõi câu trả lời của Backline bên cạnh.</p><div class="grid"><label>Sản phẩm<select name="prod"><option value="">Chọn sản phẩm</option>${PRODS.map((p) => `<option>${esc(p)}</option>`).join('')}</select></label><label>Loại phản hồi<select name="type">${FTYPE.map((p) => `<option>${p}</option>`).join('')}</select></label></div><label>Mức độ hài lòng${stars('fbRate', 0)}</label><label>Tiêu đề<input name="title" maxlength="80" placeholder="Tóm tắt ngắn gọn"></label><label>Nội dung<textarea name="body" placeholder="Bạn thấy sản phẩm thế nào? Có vấn đề gì cần hỗ trợ không?"></textarea></label><div class="err" id="err" role="alert"></div><button class="btn pri">Gửi phản hồi</button></form><section class="feedback-history"><div class="section-heading"><h2>Phản hồi đã gửi (${L.length})</h2></div>` +
    (L.length
      ? L.map(
          (f) =>
            `<article class="card feedback-item"><div class="row"><div><b>${esc(f.title || f.type)}</b><div class="mu">${esc(f.prod)} · ${esc(f.type)} · ${f.date}</div></div><span class="b ${f.reply ? 'ok' : 'in'}">${f.reply ? 'Đã phản hồi' : 'Đã tiếp nhận'}</span></div><div style="margin:6px 0">${ro(f.rate)}</div><div>${esc(f.body)}</div>${f.reply ? `<div class="reply"><b>Cửa hàng trả lời:</b> ${esc(f.reply)}</div>` : ''}</article>`
        ).join('')
      : customerEmpty(
          'Bạn chưa gửi phản hồi nào.',
          'Những góp ý và câu trả lời của cửa hàng sẽ xuất hiện tại đây.',
          'chat'
        )) +
    '</section></div>'
  );
}

// Giao diện Thông tin cá nhân (Profile)
function profView() {
  return `<form id="prof" class="card" novalidate><fieldset class="profile-section"><legend>Thông tin cơ bản</legend><label>Email (dùng để đăng nhập)<input value="${esc(me.email)}" readonly></label><div class="grid"><label>Họ và tên<input name="name" value="${esc(me.name)}"></label><label>Số điện thoại<input name="phone" type="tel" value="${esc(me.phone)}"></label></div><label>Địa chỉ<input name="addr" value="${esc(me.addr)}" placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"></label><div class="grid"><label>Ngày sinh<input name="birthDate" type="text" inputmode="numeric" autocomplete="bday" maxlength="10" value="${esc(BirthDate.display(me.birthDate))}" placeholder="dd/mm/yyyy"></label><label>Giới tính<select name="gender">${['', 'Nam', 'Nữ', 'Khác'].map((g) => `<option value="${g}"${me.gender === g ? ' selected' : ''}>${g || 'Chọn giới tính'}</option>`).join('')}</select></label></div></fieldset><fieldset class="profile-section"><legend>Nhu cầu sử dụng</legend><p class="mu">Giúp Backline gợi ý sản phẩm phù hợp với bạn.</p><label>Nhu cầu sử dụng PC / laptop<select name="need" required><option value="" disabled${!NEEDS.includes(me.need) ? ' selected' : ''}>Vui lòng chọn nhu cầu sử dụng</option>${NEEDS.map((g) => `<option value="${g}"${me.need === g ? ' selected' : ''}>${g}</option>`).join('')}</select></label></fieldset><div class="err" id="err" role="alert"></div><button class="btn pri">Lưu thay đổi</button></form>${typeof recoveryCodePanel === 'function' ? recoveryCodePanel() : ''}`;
}

/* ==========================================
   3. XỬ LÝ LOGIC NGHIỆP VỤ & SỰ KIỆN (CONTROLLER)
   ========================================== */
const setErr = (t) => {
  $('#err').textContent = t;
  return false;
};

// Bộ xử lý các form Submit (Đăng nhập, Đăng ký, Cập nhật Profile, Gửi Feedback, Gửi Khảo sát)
const H = {
  // LOGIC: API đăng nhập thành công -> nhận user -> kiểm tra hồ sơ -> tải dữ liệu hoặc bắt hoàn thiện.
  // Cookie HttpOnly do server cấp, JavaScript không đọc được; không lưu mật khẩu vào storage.
  async login(v) {
    const result = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: (v.email || '').trim(),
        password: v.pass || '',
        customerSession: true,
        remember: v.remember === 'on'
      })
    });
    sessionStorage.removeItem(TOKEN_KEY);
    me = result.user;
    showHiddenSurveys = false;
    tab = 'survey';
    open = null;
    applyProfileGate();
    if (!onboarding) await refreshData();
    render();
    if (onboarding) return;
    const n = pending().length;
    toast(n ? `Xin chào ${me.name}. Bạn có ${n} khảo sát mới` : `Xin chào ${me.name}`);
  },
  // LOGIC: Chuẩn hóa ngày dd/mm/yyyy thành ISO, kiểm tra form -> POST đăng ký.
  // Chỉ sau API thành công mới nhận user/mã khôi phục và chuyển sang hoàn thiện hồ sơ.
  async reg(v) {
    const e = v.email.trim().toLowerCase(),
      n = v.name.trim(),
      p = v.phone.trim(),
      birthDate = BirthDate.parse(v.birthDate);
    if (!n) return setErr('Vui lòng nhập họ và tên.');
    if (!/^\S+@\S+\.\S+$/.test(e)) return setErr('Email chưa đúng định dạng.');
    if (!/^0\d{9,10}$/.test(p)) return setErr('Số điện thoại cần 10-11 chữ số và bắt đầu bằng 0.');
    if (!birthDate)
      return setErr('Vui lòng nhập ngày sinh hợp lệ theo dd/mm/yyyy, không nằm trong tương lai.');
    if (!['Nam', 'Nữ', 'Khác'].includes(v.gender)) return setErr('Vui lòng chọn giới tính.');
    if (v.pass.length < 6) return setErr('Mật khẩu cần ít nhất 6 ký tự.');
    if (v.pass !== v.pass2) return setErr('Mật khẩu nhập lại chưa khớp.');
    const result = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: n,
        email: e,
        phone: p,
        birthDate,
        gender: v.gender,
        password: v.pass,
        customerSession: true
      })
    });
    sessionStorage.removeItem(TOKEN_KEY);
    if (typeof setInitialRecoveryCode === 'function')
      setInitialRecoveryCode(result.recoveryCode, result.user.id);
    me = result.user;
    showHiddenSurveys = false;
    tab = 'survey';
    open = null;
    profileOpen = false;
    onboarding = true;
    onboardingNoticeOpen = true;
    profileNoticeOpen = false;
    sessionStorage.setItem(ONBOARDING_KEY, '1');
    render();
  },
  // LOGIC: Kiểm tra đủ thông tin -> PUT /api/me -> lấy user server trả về thay me.
  // Chỉ bỏ chặn onboarding sau khi đã lưu thành công và hồ sơ đủ; render() không tự ghi DB.
  async prof(v) {
    const n = v.name.trim(),
      birthDate = BirthDate.parse(v.birthDate);
    if (!n) return setErr('Họ và tên không được để trống.');
    if (!/^0\d{9,10}$/.test(v.phone.trim()))
      return setErr('Số điện thoại cần 10-11 chữ số và bắt đầu bằng 0.');
    if (!v.addr.trim()) return setErr('Vui lòng nhập địa chỉ.');
    if (!birthDate)
      return setErr('Vui lòng nhập ngày sinh hợp lệ theo dd/mm/yyyy, không nằm trong tương lai.');
    if (!['Nam', 'Nữ', 'Khác'].includes(v.gender)) return setErr('Vui lòng chọn giới tính.');
    if (!NEEDS.includes(v.need)) return setErr('Vui lòng chọn nhu cầu sử dụng.');
    me = (
      await api('/api/me', {
        method: 'PUT',
        body: JSON.stringify({
          name: n,
          phone: v.phone.trim(),
          addr: v.addr.trim(),
          birthDate,
          gender: v.gender,
          need: v.need
        })
      })
    ).user;
    profileNoticeOpen = profileNeedsCompletion();
    if (onboarding && !profileNoticeOpen) {
      onboarding = false;
      onboardingNoticeOpen = false;
      sessionStorage.removeItem(ONBOARDING_KEY);
      tab = 'survey';
      open = null;
      try {
        await refreshData();
      } catch (_) {
        render();
        toast('Đã lưu hồ sơ. Chưa tải được khảo sát, vui lòng tải lại trang.');
        return;
      }
    }
    profileOpen = !onboarding && profileNoticeOpen;
    render();
    toast(
      profileNoticeOpen
        ? 'Vui lòng hoàn thiện các thông tin còn thiếu.'
        : 'Đã lưu thông tin cá nhân'
    );
  },
  // LOGIC: POST trước, sau thành công mới thêm feedback trả về vào đầu FB để hiển thị ngay.
  // Không thêm dữ liệu giả vào danh sách nếu API báo lỗi.
  async fb(v) {
    const r = +$('#fbRate').dataset.val;
    if (!v.prod) return setErr('Vui lòng chọn sản phẩm.');
    if (!r) return setErr('Vui lòng chọn số sao đánh giá.');
    if (v.body.trim().length < 1)
      return setErr('Nội dung phản hồi cần ít nhất 1 ký tự không phải khoảng trắng.');
    const result = await api('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        prod: v.prod,
        type: v.type,
        rate: r,
        title: v.title.trim(),
        body: v.body.trim()
      })
    });
    (FB[me.email] = FB[me.email] || []).unshift(result.feedback);
    render();
    toast('Đã gửi phản hồi. Cảm ơn bạn!');
  },
  // LOGIC: Kiểm tra câu bắt buộc, gom ONE/TEXT, mảng MULTI và số sao -> POST answers.
  // Chỉ khi server lưu thành công mới ghi DONE bằng ngày server trả về và đóng form.
  async sv(v, f) {
    const s = SV.find((x) => x.id === open);
    for (let i = 0; i < s.qs.length; i++) {
      const q = s.qs[i];
      if (!q.req) continue;
      const ok =
        q.t === 'rate'
          ? +$('#q' + i).dataset.val > 0
          : q.t === 'text'
            ? (v['q' + i] || '').trim()
            : f.querySelector(`[name=q${i}]:checked`);
      if (!ok) return setErr(`Vui lòng trả lời câu ${i + 1}.`);
    }
    const answers = { ...v };
    s.qs.forEach((q, i) => {
      if (q.t === 'multi')
        answers['q' + i] = [...f.querySelectorAll(`[name=q${i}]:checked`)].map((x) => x.value);
    });
    s.qs.forEach((q, i) => {
      if (q.t === 'rate') answers['q' + i] = +$('#q' + i).dataset.val;
    });
    const result = await api(`/api/surveys/${s.id}/responses`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
    (DONE[me.email] = DONE[me.email] || {})[s.id] = result.completedAt;
    open = null;
    render();
    toast('Cảm ơn bạn đã hoàn thành khảo sát!');
  }
};

// Lắng nghe sự kiện Submit form
document.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  if (H[f.id])
    Promise.resolve(H[f.id](Object.fromEntries(new FormData(f)), f)).catch((err) =>
      setErr(err.message)
    );
});

// Lắng nghe sự kiện Click chuột tương tác trên giao diện
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act,
    v = b.dataset.v;
  if (onboarding && !['begin-onboarding', 'profile', 'out'].includes(a)) return;
  if (a === 'star') {
    const p = b.parentElement;
    p.dataset.val = v;
    p.querySelectorAll('.st').forEach((x, i) => x.classList.toggle('on', i < +v));
  } else if (a === 'atab') {
    authTab = v;
    render();
  } else if (a === 'profile') {
    if (onboarding) {
      $('#prof input[name="name"]')?.focus();
      return;
    }
    profileOpen = true;
    render();
  } else if (a === 'profile-close') {
    profileOpen = false;
    render();
  } else if (a === 'profile-notice-close') {
    profileNoticeOpen = false;
    render();
  } else if (a === 'begin-onboarding') {
    onboardingNoticeOpen = false;
    render();
    $('#prof input[name="name"]')?.focus();
  } else if (a === 'tab') {
    tab = v;
    open = null;
    if (v === 'survey')
      refreshData()
        .then(render)
        .catch((err) => toast(err.message));
    else render();
  } else if (a === 'start') {
    open = v;
    render();
    scrollTo(0, 0);
  } else if (a === 'hide-survey') {
    // LOGIC: Ẩn phía KHÁCH chỉ ghi danh sách ID vào localStorage theo email, không gọi API/không xóa DB.
    hideSurvey(v);
    render();
    toast('Đã ẩn khảo sát khỏi danh sách của bạn.');
  } else if (a === 'toggle-hidden-surveys') {
    showHiddenSurveys = !showHiddenSurveys;
    render();
  } else if (a === 'restore-survey') {
    // LOGIC: Bỏ ID khỏi danh sách ẩn cục bộ; không mở lại khảo sát hay thay đổi câu trả lời.
    restoreSurvey(v);
    render();
    toast('Đã bỏ ẩn khảo sát.');
  } else if (a === 'back') {
    open = null;
    render();
  } else if (a === 'out') {
    // LOGIC: Gọi server xóa cookie rồi dọn trạng thái UI/token/mã khôi phục đang giữ trong bộ nhớ.
    api('/api/auth/logout', { method: 'POST' })
      .then(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(ONBOARDING_KEY);
        if (typeof clearRecoveryCodeState === 'function') clearRecoveryCodeState();
        me = null;
        open = null;
        authTab = 'login';
        render();
        toast('Bạn đã đăng xuất');
      })
      .catch((err) => toast(err.message));
  }
});

// Đóng pop-up khi bấm nút Đóng hoặc vùng nền, nhưng không đóng khi đang nhập biểu mẫu.
document.addEventListener(
  'click',
  (e) => {
    if (!profileOpen) return;
    if (
      e.target.classList.contains('modal-backdrop') ||
      e.target.matches('[data-act="profile-close"]')
    ) {
      profileOpen = false;
      render();
    }
  },
  true
);

// Chỉ đổi kiểu ô nhập, không render lại để giữ nội dung và vị trí biểu mẫu.
document.addEventListener('click', (e) => {
  const button = e.target.closest('[data-customer-password-toggle]');
  if (!button) return;
  e.preventDefault();
  const input = button.parentElement.querySelector('input');
  const visible = input.type === 'password';
  input.type = visible ? 'text' : 'password';
  button.setAttribute('aria-pressed', String(visible));
  button.setAttribute('aria-label', visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
  button.title = visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu';
  input.focus();
});

// Khởi chạy render lần đầu tiên khi tải trang
render();
restoreSession();
