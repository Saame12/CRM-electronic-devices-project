/* ==========================================
   1. CÁC HÀM TIỆN ÍCH CƠ BẢN & DỮ LIỆU MẪU
   ========================================== */
// Rút gọn hàm querySelector
const $ = s => document.querySelector(s);

// Hàm chống lỗi XSS (bảo mật ký tự đặc biệt)
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

// Lấy ngày hiện tại định dạng kiểu Việt Nam
const today = () => new Date().toLocaleDateString('vi-VN');

// Danh sách nhu cầu, sản phẩm và loại phản hồi mẫu
const NEEDS = ['Gaming', 'Đồ họa', 'Văn phòng', 'Chưa xác định'];
const PRODS = ['Dell Inspiron 15 3530', 'HP 15-fd0231TU', 'Lenovo IdeaPad Slim 3 15IAH8', 'ASUS Vivobook 15 X1504', 'ASUS TUF Gaming F15 FX507', 'Lenovo LOQ 15IAX9', 'MSI Thin 15 B13VE', 'Acer Nitro V 15 ANV15', 'PC Gaming Backline G1', 'PC Gaming Backline G2', 'PC Gaming Backline G3', 'PC Đồ họa Backline D1', 'PC Văn phòng Backline O1', 'PC Văn phòng Backline O2'];
const FTYPE = ['Góp ý', 'Khen ngợi', 'Báo lỗi / Khiếu nại', 'Câu hỏi'];

// Dữ liệu khách hàng và khảo sát chỉ lấy từ API MySQL.
const FB = {};
const DONE = {};
let SV = [];


// Biến trạng thái ứng dụng hiện tại
let me = null, tab = 'survey', open = null, authTab = 'login', profileOpen = false, profileNoticeOpen = false, onboarding = false, onboardingNoticeOpen = false;
const TOKEN_KEY = 'backline_crm_token';
const ONBOARDING_KEY = 'backline_crm_profile_onboarding';
const hiddenSurveyKey = () => `backline_crm_hidden_surveys_${me?.email || ''}`;
let showHiddenSurveys = false;
const hiddenSurveys = () => { try { const ids = JSON.parse(localStorage.getItem(hiddenSurveyKey()) || '[]'); return new Set(Array.isArray(ids) ? ids : []); } catch (_) { return new Set(); } };
const hideSurvey = id => { const ids = hiddenSurveys(); ids.add(id); localStorage.setItem(hiddenSurveyKey(), JSON.stringify([...ids])); };

async function api(url, options = {}) {
    const headers = {'Content-Type': 'application/json', ...(options.headers || {})};
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, {credentials:'same-origin', ...options, headers});
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Không thể kết nối đến máy chủ.');
    return data;
}

async function refreshData() {
    const [feedbackResult, surveyResult, surveysResult] = await Promise.all([api('/api/feedback'), api('/api/survey-status'), api('/api/surveys')]);
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
    const e = $('#toast'); e.textContent = t; e.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('show'), 2800);
}

// Tạo giao diện chọn số sao đánh giá
const stars = (id, v) => `<div class="stars" id="${id}" data-val="${v || 0}" role="group" aria-label="Đánh giá sao">${[1, 2, 3, 4, 5].map(i => `<button type="button" class="st${i <= v ? ' on' : ''}" data-act="star" data-v="${i}" aria-label="${i} sao">★</button>`).join('')}</div>`;

// Hiển thị số sao tĩnh (Readonly)
const ro = n => `<span class="ro" aria-label="${n} sao">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>`;

// Lọc các khảo sát chưa hoàn thành
const dateFromVN = value => { const m = String(value || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); return m ? new Date(+m[3], +m[2] - 1, +m[1], 23, 59, 59) : null; };
const isExpired = s => s.isExpired || Boolean(s.dueDate ? new Date(`${s.dueDate}T23:59:59`) < new Date() : dateFromVN(s.due) && dateFromVN(s.due) < new Date());
const pending = () => SV.filter(s => !(DONE[me.email] || {})[s.id] && !isExpired(s));
const profileNeedsCompletion = () => Boolean(me && (!String(me.name||'').trim() || !/^0\d{9,10}$/.test(String(me.phone||'').trim()) || !String(me.addr||'').trim() || !BirthDate.validISO(me.birthDate) || !['Nam','Nữ','Khác'].includes(me.gender) || !NEEDS.includes(me.need) || me.need === 'Chưa xác định'));
function applyProfileGate() {
    onboarding = profileNeedsCompletion();
    onboardingNoticeOpen = onboarding;
    profileOpen = false;
    profileNoticeOpen = false;
    if (onboarding) sessionStorage.setItem(ONBOARDING_KEY,'1');
    else sessionStorage.removeItem(ONBOARDING_KEY);
}

// Hàm render chính để vẽ lại giao diện dựa trên trạng thái đăng nhập
function render() {
    $('#who').innerHTML = me ? `<button class="profile-trigger" data-act="profile" title="Mở thông tin cá nhân">${esc(me.name)}</button><button class="btn sm" data-act="out">Đăng xuất</button>` : '';
    $('#app').innerHTML = me ? main() : auth();
    $('#profileModal').innerHTML = me && profileOpen ? `<div class="modal-backdrop" data-act="profile-close"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="profile-title" onclick="event.stopPropagation()"><div class="modal-head"><div><h1 id="profile-title">Thông tin cá nhân</h1><p class="mu">Cập nhật hồ sơ để nhận tư vấn và hỗ trợ phù hợp hơn.</p></div><button class="btn sm" type="button" data-act="profile-close" aria-label="Đóng">Đóng</button></div>${profView()}</section></div>` : '';
    if (me && onboardingNoticeOpen) {
        $('#profileModal').innerHTML = `<dialog id="onboardingDialog" class="modal onboarding-notice" aria-labelledby="onboardingTitle" aria-describedby="onboardingMessage"><h1 id="onboardingTitle">Thông báo</h1><p id="onboardingMessage">Vui lòng nhập thông tin cá nhân để có trải nghiệm tốt hơn.</p><button class="btn pri" type="button" data-act="begin-onboarding" autofocus>OK</button></dialog>`;
        const dialog = $('#onboardingDialog');
        dialog.oncancel = event => event.preventDefault();
        if (typeof dialog.showModal === 'function') dialog.showModal();
    }
    $('#profileReminder').innerHTML = me && profileNoticeOpen && !onboarding ? `<aside class="profile-reminder" role="alert"><span>Vui lòng nhập thông tin cá nhân để có trải nghiệm tốt hơn.</span><button type="button" class="reminder-close" data-act="profile-notice-close" aria-label="Đóng thông báo">×</button></aside>` : '';
}

const restoreSurvey = id => { const ids = hiddenSurveys(); ids.delete(id); localStorage.setItem(hiddenSurveyKey(), JSON.stringify([...ids])); };
function customerPassword(name, autocomplete, placeholder = '') {
    return `<span class="customer-password"><input name="${name}" type="password" autocomplete="${autocomplete}" placeholder="${placeholder}"><button type="button" class="customer-password-eye" data-customer-password-toggle aria-label="Hiện mật khẩu" aria-pressed="false" title="Hiện mật khẩu"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path class="eye-slash" d="m3 3 18 18"/></svg></button></span>`;
}

// Giao diện Đăng nhập / Đăng ký
function auth() {
    const L = authTab === 'login';
    return `<div class="card auth"><div class="tabs"><button class="${L ? 'on' : ''}" data-act="atab" data-v="login">Đăng nhập</button><button class="${L ? '' : 'on'}" data-act="atab" data-v="reg">Đăng ký</button></div>` + (L ?
    `<form id="login" novalidate><label>Email<input name="email" type="email" autocomplete="username" placeholder="ten@email.com"></label><label>Mật khẩu${customerPassword('pass', 'current-password')}</label><label class="remember-login"><input name="remember" type="checkbox"> Ghi nhớ đăng nhập trong 7 ngày</label><div class="err" id="err" role="alert"></div><button class="btn pri full">Đăng nhập</button><p class="mu" style="margin:12px 0 0">Dùng thử: khach@demo.vn / 123456</p></form>` :
    `<form id="reg" novalidate><label>Họ và tên<input name="name" autocomplete="name"></label><div class="grid"><label>Email<input name="email" type="email" autocomplete="email"></label><label>Số điện thoại<input name="phone" type="tel" autocomplete="tel" placeholder="0901234567"></label></div><div class="grid"><label>Ngày sinh<input name="birthDate" type="text" inputmode="numeric" autocomplete="bday" placeholder="dd/mm/yyyy" maxlength="10" required aria-describedby="birthDateHint"><small id="birthDateHint">Ví dụ: 21/10/1998</small></label><label>Giới tính<select name="gender" required><option value="">Chọn giới tính</option><option>Nam</option><option>Nữ</option><option>Khác</option></select></label></div><div class="grid"><label>Mật khẩu${customerPassword('pass', 'new-password', 'Ít nhất 6 ký tự')}</label><label>Nhập lại mật khẩu${customerPassword('pass2', 'new-password')}</label></div><div class="err" id="err" role="alert"></div><button class="btn pri full">Tạo tài khoản</button></form>`) + '</div>';
}

// Giao diện trang chủ sau khi đăng nhập
function main() {
    if (onboarding) return `<section class="onboarding"><h1>Hoàn thiện thông tin cá nhân</h1><p class="mu">Bạn cần lưu đầy đủ thông tin trước khi sử dụng khảo sát.</p>${profView()}</section>`;
    const n = pending().length;
    const T = [['survey', 'Khảo sát' + (n ? `<span class="n">${n}</span>` : '')], ['fb', 'Phản hồi sản phẩm']];
    return `<div class="tabs">${T.map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-act="tab" data-v="${k}">${l}</button>`).join('')}</div>` + (tab === 'survey' ? (open ? svForm(SV.find(s => s.id === open)) : svList()) : fbView());
}

// Danh sách các phiếu khảo sát
function svList() {
    const done = DONE[me.email] || {};
    const hidden = hiddenSurveys();
    const active = SV.filter(s => !done[s.id] && !isExpired(s));
    const history = SV.filter(s => done[s.id] || isExpired(s));
    const hiddenCount = history.filter(s => hidden.has(s.id)).length;
    const completed = history.filter(s => hidden.has(s.id) === showHiddenSurveys);
    const card = (s, type) => { const d = done[s.id], isDone = Boolean(d), isOld = !isDone && isExpired(s); return `<div class="card"><div class="row"><div><h2>${esc(s.title)}</h2><div class="mu">${esc(s.desc)}</div></div><span class="b ${isDone ? 'ok' : isOld ? 'in' : 'wn'}">${isDone ? 'Đã hoàn thành' : isOld ? 'Quá hạn chưa trả lời' : 'Khảo sát mới'}</span></div><div class="row" style="margin-top:12px;align-items:center"><span class="mu">${s.qs.length} câu · khoảng ${s.min} phút · ${isDone ? 'Hoàn thành ngày ' + d : 'Hạn ' + s.due}</span>${type === 'active' ? `<button class="btn pri" data-act="start" data-v="${s.id}">Thực hiện khảo sát</button>` : (isDone || isOld) ? `<button class="btn sm" data-act="${showHiddenSurveys ? 'restore-survey' : 'hide-survey'}" data-v="${s.id}">${showHiddenSurveys ? 'Bỏ ẩn' : 'Ẩn khảo sát'}</button>` : ''}</div></div>`; };
    return `<h1>Khảo sát dành cho bạn</h1><p class="mu">Chỉ khảo sát đang mở mới có thể thực hiện. Khảo sát quá hạn không có câu trả lời được lưu trong mục hoàn tất.</p><h2>Khảo sát mới đang mở (${active.length})</h2>${active.length ? active.map(s => card(s, 'active')).join('') : '<div class="card empty">Hiện không có khảo sát mới cần thực hiện.</div>'}<div class="row survey-history-heading"><h2>${showHiddenSurveys ? 'Khảo sát đã ẩn' : 'Đã hoàn thành'} (${completed.length})</h2><button class="btn sm" data-act="toggle-hidden-surveys" aria-pressed="${showHiddenSurveys}">${showHiddenSurveys ? 'Quay lại đã hoàn thành' : 'Xem khảo sát đã ẩn (' + hiddenCount + ')'}</button></div>${completed.length ? completed.map(s => card(s, 'completed')).join('') : `<div class="card empty">${showHiddenSurveys ? 'Không có khảo sát đã ẩn.' : 'Chưa có khảo sát hoàn tất hoặc quá hạn.'}</div>`}`;
}

// Form chi tiết làm một bảng khảo sát
function svForm(s) {
    return `<button class="btn sm" data-act="back" style="margin-bottom:12px">← Danh sách khảo sát</button><form id="sv" class="card" novalidate><h1>${esc(s.title)}</h1><p class="mu">${esc(s.desc)} Các câu có dấu * là bắt buộc.</p>` + s.qs.map((q, i) => {
        let c = '';
        if (q.t === 'rate') c = stars('q' + i, 0);
        else if (q.t === 'text') c = `<textarea name="q${i}" placeholder="Nhập ý kiến của bạn"></textarea>`;
        else c = q.o.map(o => `<label class="opt" style="margin:0;color:var(--tx);font-size:15px"><input type="${q.t === 'one' ? 'radio' : 'checkbox'}" name="q${i}" value="${esc(o)}"> ${esc(o)}</label>`).join('');
        return `<div class="q"><b>${i + 1}. ${esc(q.q)}${q.req ? ' *' : ''}</b>${c}</div>`;
    }).join('') + `<div class="err" id="err" role="alert"></div><button class="btn pri">Gửi khảo sát</button></form>`;
}

// Giao diện Phản hồi sản phẩm
function fbView() {
    const L = FB[me.email] || [];
    return `<form id="fb" class="card" novalidate><h1>Gửi phản hồi về sản phẩm</h1><p class="mu">Ý kiến của bạn giúp cửa hàng cải thiện sản phẩm và dịch vụ.</p><div class="grid"><label>Sản phẩm<select name="prod"><option value="">Chọn sản phẩm</option>${PRODS.map(p => `<option>${esc(p)}</option>`).join('')}</select></label><label>Loại phản hồi<select name="type">${FTYPE.map(p => `<option>${p}</option>`).join('')}</select></label></div><label>Mức độ hài lòng${stars('fbRate', 0)}</label><label>Tiêu đề<input name="title" maxlength="80" placeholder="Tóm tắt ngắn gọn"></label><label>Nội dung<textarea name="body" placeholder="Bạn thấy sản phẩm thế nào? Có vấn đề gì cần hỗ trợ không?"></textarea></label><div class="err" id="err" role="alert"></div><button class="btn pri">Gửi phản hồi</button></form><h2 style="margin:20px 0 10px">Phản hồi đã gửi (${L.length})</h2>` + (L.length ? L.map(f => `<div class="card"><div class="row"><div><b>${esc(f.title || f.type)}</b><div class="mu">${esc(f.prod)} · ${esc(f.type)} · ${f.date}</div></div><span class="b ${f.reply ? 'ok' : 'in'}">${f.reply ? 'Đã phản hồi' : 'Đã tiếp nhận'}</span></div><div style="margin:6px 0">${ro(f.rate)}</div><div>${esc(f.body)}</div>${f.reply ? `<div class="reply"><b>Cửa hàng trả lời:</b> ${esc(f.reply)}</div>` : ''}</div>`).join('') : '<div class="card empty">Bạn chưa gửi phản hồi nào.</div>');
}

// Giao diện Thông tin cá nhân (Profile)
function profView() {
    return `<form id="prof" class="card" novalidate><h1>Thông tin cá nhân</h1><p class="mu">Thông tin chính xác giúp cửa hàng tư vấn và hỗ trợ bạn tốt hơn.</p><label>Email (dùng để đăng nhập)<input value="${esc(me.email)}" readonly></label><div class="grid"><label>Họ và tên<input name="name" value="${esc(me.name)}"></label><label>Số điện thoại<input name="phone" type="tel" value="${esc(me.phone)}"></label></div><label>Địa chỉ<input name="addr" value="${esc(me.addr)}" placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"></label><div class="grid"><label>Ngày sinh<input name="birthDate" type="text" inputmode="numeric" autocomplete="bday" maxlength="10" value="${esc(BirthDate.display(me.birthDate))}" placeholder="dd/mm/yyyy"></label><label>Giới tính<select name="gender">${['', 'Nam', 'Nữ', 'Khác'].map(g => `<option value="${g}"${me.gender === g ? ' selected' : ''}>${g || 'Chọn giới tính'}</option>`).join('')}</select></label></div><label>Nhu cầu sử dụng PC / laptop<select name="need">${NEEDS.map(g => `<option${me.need === g ? ' selected' : ''}>${g}</option>`).join('')}</select></label><div class="err" id="err" role="alert"></div><button class="btn pri">Lưu thay đổi</button></form>`;
}


/* ==========================================
   3. XỬ LÝ LOGIC NGHIỆP VỤ & SỰ KIỆN (CONTROLLER)
   ========================================== */
const setErr = t => { $('#err').textContent = t; return false; };

// Bộ xử lý các form Submit (Đăng nhập, Đăng ký, Cập nhật Profile, Gửi Feedback, Gửi Khảo sát)
const H = {
    async login(v) {
        const result = await api('/api/auth/login', {method: 'POST', body: JSON.stringify({email: (v.email || '').trim(), password: v.pass || '', customerSession:true, remember:v.remember==='on'})});
        sessionStorage.removeItem(TOKEN_KEY);
        me = result.user; showHiddenSurveys = false; tab = 'survey'; open = null; applyProfileGate();
        if (!onboarding) await refreshData();
        render();
        if (onboarding) return;
        const n = pending().length;
        toast(n ? `Xin chào ${me.name}. Bạn có ${n} khảo sát mới` : `Xin chào ${me.name}`);
    },
    async reg(v) {
        const e = v.email.trim().toLowerCase(), n = v.name.trim(), p = v.phone.trim(), birthDate = BirthDate.parse(v.birthDate);
        if (!n) return setErr('Vui lòng nhập họ và tên.');
        if (!/^\S+@\S+\.\S+$/.test(e)) return setErr('Email chưa đúng định dạng.');
        if (!/^0\d{9,10}$/.test(p)) return setErr('Số điện thoại cần 10-11 chữ số và bắt đầu bằng 0.');
        if (!birthDate) return setErr('Vui lòng nhập ngày sinh hợp lệ theo dd/mm/yyyy, không nằm trong tương lai.');
        if (!['Nam','Nữ','Khác'].includes(v.gender)) return setErr('Vui lòng chọn giới tính.');
        if (v.pass.length < 6) return setErr('Mật khẩu cần ít nhất 6 ký tự.');
        if (v.pass !== v.pass2) return setErr('Mật khẩu nhập lại chưa khớp.');
        const result = await api('/api/auth/register', {method: 'POST', body: JSON.stringify({name: n, email: e, phone: p, birthDate, gender: v.gender, password: v.pass, customerSession:true})});
        sessionStorage.removeItem(TOKEN_KEY);
        me = result.user; tab = 'survey'; open = null; profileOpen = false; onboarding = true; onboardingNoticeOpen = true; profileNoticeOpen = false; sessionStorage.setItem(ONBOARDING_KEY,'1'); render();
    },
    async prof(v) {
        const n = v.name.trim(), birthDate = BirthDate.parse(v.birthDate);
        if (!n) return setErr('Họ và tên không được để trống.');
        if (!/^0\d{9,10}$/.test(v.phone.trim())) return setErr('Số điện thoại cần 10-11 chữ số và bắt đầu bằng 0.');
        if (!v.addr.trim()) return setErr('Vui lòng nhập địa chỉ.');
        if (!birthDate) return setErr('Vui lòng nhập ngày sinh hợp lệ theo dd/mm/yyyy, không nằm trong tương lai.');
        if (!['Nam','Nữ','Khác'].includes(v.gender)) return setErr('Vui lòng chọn giới tính.');
        if (!v.need || v.need === 'Chưa xác định') return setErr('Vui lòng chọn nhu cầu sử dụng.');
        me = (await api('/api/me', {method: 'PUT', body: JSON.stringify({name: n, phone: v.phone.trim(), addr: v.addr.trim(), birthDate, gender: v.gender, need: v.need})})).user;
        profileNoticeOpen = profileNeedsCompletion();
        if (onboarding && !profileNoticeOpen) {
            onboarding = false; onboardingNoticeOpen = false; sessionStorage.removeItem(ONBOARDING_KEY); tab = 'survey'; open = null;
            try { await refreshData(); } catch (_) { render(); toast('Đã lưu hồ sơ. Chưa tải được khảo sát, vui lòng tải lại trang.'); return; }
        }
        profileOpen = !onboarding && profileNoticeOpen;
        render(); toast(profileNoticeOpen ? 'Vui lòng hoàn thiện các thông tin còn thiếu.' : 'Đã lưu thông tin cá nhân');
    },
    async fb(v) {
        const r = +$('#fbRate').dataset.val;
        if (!v.prod) return setErr('Vui lòng chọn sản phẩm.');
        if (!r) return setErr('Vui lòng chọn số sao đánh giá.');
        if (v.body.trim().length < 1) return setErr('Nội dung phản hồi cần ít nhất 1 ký tự không phải khoảng trắng.');
        const result = await api('/api/feedback', {method: 'POST', body: JSON.stringify({prod: v.prod, type: v.type, rate: r, title: v.title.trim(), body: v.body.trim()})});
        (FB[me.email] = FB[me.email] || []).unshift(result.feedback);
        render(); toast('Đã gửi phản hồi. Cảm ơn bạn!');
    },
    async sv(v, f) {
        const s = SV.find(x => x.id === open);
        for (let i = 0; i < s.qs.length; i++) {
            const q = s.qs[i]; if (!q.req) continue;
            const ok = q.t === 'rate' ? +$('#q' + i).dataset.val > 0 : q.t === 'text' ? (v['q' + i] || '').trim() : f.querySelector(`[name=q${i}]:checked`);
            if (!ok) return setErr(`Vui lòng trả lời câu ${i + 1}.`);
        }
        const answers = {...v};
        s.qs.forEach((q, i) => { if (q.t === 'multi') answers['q' + i] = [...f.querySelectorAll(`[name=q${i}]:checked`)].map(x => x.value); });
        s.qs.forEach((q, i) => { if (q.t === 'rate') answers['q' + i] = +$('#q' + i).dataset.val; });
        const result = await api(`/api/surveys/${s.id}/responses`, {method: 'POST', body: JSON.stringify({answers})});
        (DONE[me.email] = DONE[me.email] || {})[s.id] = result.completedAt;
        open = null; render(); toast('Cảm ơn bạn đã hoàn thành khảo sát!');
    }
};

// Lắng nghe sự kiện Submit form
document.addEventListener('submit', e => {
    e.preventDefault(); const f = e.target;
    if (H[f.id]) Promise.resolve(H[f.id](Object.fromEntries(new FormData(f)), f)).catch(err => setErr(err.message));
});

// Lắng nghe sự kiện Click chuột tương tác trên giao diện
document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const a = b.dataset.act, v = b.dataset.v;
    if (onboarding && !['begin-onboarding','profile','out'].includes(a)) return;
    if (a === 'star') {
        const p = b.parentElement; p.dataset.val = v;
        p.querySelectorAll('.st').forEach((x, i) => x.classList.toggle('on', i < +v));
    } else if (a === 'atab') { authTab = v; render(); }
    else if (a === 'profile') { if (onboarding) { $('#prof input[name="name"]')?.focus(); return; } profileOpen = true; render(); }
    else if (a === 'profile-close') { profileOpen = false; render(); }
    else if (a === 'profile-notice-close') { profileNoticeOpen = false; render(); }
    else if (a === 'begin-onboarding') { onboardingNoticeOpen = false; render(); $('#prof input[name="name"]')?.focus(); }
    else if (a === 'tab') { tab = v; open = null; if (v === 'survey') refreshData().then(render).catch(err => toast(err.message)); else render(); }
    else if (a === 'start') { open = v; render(); scrollTo(0, 0); }
    else if (a === 'hide-survey') { hideSurvey(v); render(); toast('Đã ẩn khảo sát khỏi danh sách của bạn.'); }
    else if (a === 'toggle-hidden-surveys') { showHiddenSurveys = !showHiddenSurveys; render(); }
    else if (a === 'restore-survey') { restoreSurvey(v); render(); toast('Đã bỏ ẩn khảo sát.'); }
    else if (a === 'back') { open = null; render(); }
    else if (a === 'out') { api('/api/auth/logout',{method:'POST'}).then(()=>{sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(ONBOARDING_KEY); me = null; open = null; authTab = 'login'; render(); toast('Bạn đã đăng xuất');}).catch(err=>toast(err.message)); }
});

// Đóng pop-up khi bấm nút Đóng hoặc vùng nền, nhưng không đóng khi đang nhập biểu mẫu.
document.addEventListener('click', e => {
    if (!profileOpen) return;
    if (e.target.classList.contains('modal-backdrop') || e.target.matches('[data-act="profile-close"]')) {
        profileOpen = false; render();
    }
}, true);

// Chỉ đổi kiểu ô nhập, không render lại để giữ nội dung và vị trí biểu mẫu.
document.addEventListener('click', e => {
    const button = e.target.closest('[data-customer-password-toggle]'); if (!button) return;
    e.preventDefault();
    const input = button.parentElement.querySelector('input');
    const visible = input.type === 'password'; input.type = visible ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(visible));
    button.setAttribute('aria-label', visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    button.title = visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'; input.focus();
});

// Khởi chạy render lần đầu tiên khi tải trang
render();
restoreSession();
