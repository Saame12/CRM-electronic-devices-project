// Only the short-lived reset token is persisted. Personal recovery codes stay in memory.
const RECOVERY_KEY = 'backline_crm_recovery_session';
let recoveryView = sessionStorage.getItem(RECOVERY_KEY) ? 'status' : '',
  recoveryStatus = 'PENDING',
  recoveryMethod = 'MANUAL',
  recoveryExpiry = '',
  recoveryError = '',
  recoveryTimer = null,
  recoveryReference = '',
  issuedRecoveryCode = '',
  issuedRecoveryCodeOwner = '',
  recoveryCompletionCode = '';
const authBeforeRecovery = auth;
function setInitialRecoveryCode(code, owner = me?.id || '') {
  issuedRecoveryCode = String(code || '');
  issuedRecoveryCodeOwner = owner;
}
function clearRecoveryCodeState() {
  recoveryCompletionCode = '';
  issuedRecoveryCode = '';
  issuedRecoveryCodeOwner = '';
  clearTimeout(recoveryTimer);
  sessionStorage.removeItem(RECOVERY_KEY);
  recoveryView = '';
  recoveryError = '';
}
function recoveryCodePanel() {
  const visibleCode = issuedRecoveryCodeOwner === (me?.id || '') ? issuedRecoveryCode : '';
  return `<section class="card recovery-code-panel" id="recoveryCodePanel"><h2>Mã khôi phục tài khoản</h2><p class="mu">Giữ mã ở nơi riêng tư để tự đặt lại mật khẩu khi quên, không cần chờ Admin. Admin không xem được mã này.</p>${
    visibleCode
      ? `<div class="recovery-secret" role="status"><p><b>Hãy lưu mã ngay — mã chỉ hiển thị lần này.</b></p><code>${esc(visibleCode)}</code><p>Mã dùng một lần khi đổi mật khẩu thành công. Mã mới thay thế mã trước đó. Không gửi mã cho người khác.</p><button type="button" class="btn" data-recovery="saved-code">Tôi đã lưu mã</button></div>`
      : `<form id="recoveryCodeGenerate"><label>Mật khẩu hiện tại<span class="recovery-password"><input name="currentPassword" type="password" required autocomplete="current-password"><button class="btn sm" type="button" data-recovery="eye" aria-label="Hiện mật khẩu" aria-pressed="false">👁</button></span></label><p class="mu">Tạo mã mới vô hiệu hóa mã cũ và các phiên khôi phục bằng mã cũ.</p><div class="err" id="recoveryCodeError" role="alert"></div><button class="btn" type="submit">Tạo mã khôi phục mới</button></form>`
  }</section>`;
}
auth = function () {
  if (!recoveryView) {
    const html = authBeforeRecovery();
    return html.replace(
      '<button class="btn pri full">Đăng nhập</button>',
      '<button class="btn pri full">Đăng nhập</button><button class="btn full" type="button" data-recovery="request">Quên mật khẩu?</button>' +
        (sessionStorage.getItem(RECOVERY_KEY)
          ? '<button class="btn full" type="button" data-recovery="resume">Tiếp tục yêu cầu khôi phục</button>'
          : '')
    );
  }
  if (recoveryView === 'success')
    return `<section class="card auth recovery-card"><h1>Đổi mật khẩu thành công</h1><p class="mu">Admin đã nhận thông báo. Hệ thống đã cấp mã khôi phục mới, mã cũ hết hiệu lực.</p><div class="recovery-secret" role="status"><p><b>Hãy lưu mã mới — mã chỉ hiển thị lần này.</b></p><code>${esc(recoveryCompletionCode)}</code><p>Không chia sẻ mã này với Admin hoặc người khác. Nếu tải lại trang trước khi lưu, bạn có thể đăng nhập bằng mật khẩu mới và tạo lại mã trong thông tin cá nhân.</p></div><button class="btn pri full" type="button" data-recovery="ack-reset-code">Tôi đã lưu mã — Đăng nhập</button></section>`;
  const back = '<button type="button" class="btn sm" data-recovery="back">← Đăng nhập</button>';
  if (recoveryView === 'request')
    return `<section class="card auth recovery-card">${back}<h1>Khôi phục bằng mã cá nhân</h1><p class="mu">Nhập email và mã đã lưu khi đăng ký hoặc đã tạo trong hồ sơ. Hệ thống xác minh trực tiếp; không cần Admin duyệt.</p><form id="recoveryCodeRequest"><label>Email đã đăng ký<input name="email" type="email" maxlength="254" required autocomplete="username"></label><label>Mã khôi phục cá nhân<input name="recoveryCode" type="password" maxlength="64" required autocomplete="off" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"></label><div class="err" id="recoveryError" role="alert"></div><button class="btn pri full">Xác minh mã khôi phục</button></form><button class="btn full" type="button" data-recovery="support">Tôi chưa có hoặc đã mất mã</button></section>`;
  if (recoveryView === 'support')
    return `<section class="card auth recovery-card">${back}<h1>Hỗ trợ khi chưa có mã</h1><p class="mu">Nếu còn đăng nhập được, mở thông tin cá nhân để tạo mã. Nếu đã quên mật khẩu, gửi yêu cầu để Admin liên hệ xác minh qua thông tin đăng ký. Không thể tự đổi mật khẩu chỉ bằng email hoặc số điện thoại.</p><form id="recoveryRequest"><label>Email đã đăng ký<input name="email" type="email" maxlength="254" required autocomplete="email"></label><label>Số điện thoại đã đăng ký<input name="phone" type="tel" required autocomplete="tel"></label><label>Nội dung cần hỗ trợ<textarea name="reason" minlength="5" maxlength="500" required placeholder="Tôi chưa có mã khôi phục và đã quên mật khẩu."></textarea></label><div class="err" id="recoveryError" role="alert"></div><button class="btn pri full">Gửi yêu cầu hỗ trợ xác minh</button></form></section>`;
  const names = {
    PENDING: 'Chờ hỗ trợ xác minh',
    APPROVED: 'Đã được phép đổi mật khẩu',
    REJECTED: 'Yêu cầu đã bị từ chối',
    EXPIRED: 'Yêu cầu đã hết hạn',
    CANCELLED: 'Yêu cầu không còn hiệu lực',
    COMPLETED: 'Đã đổi mật khẩu thành công'
  };
  return `<section class="card auth recovery-card">${back}<p class="mu">Mã yêu cầu: <b>${esc(recoveryReference || 'Đang tải…')}</b> · ${recoveryMethod === 'RECOVERY_CODE' ? 'Hệ thống xác minh bằng mã cá nhân' : 'Hỗ trợ xác minh thủ công'}</p><h1>${names[recoveryStatus] || 'Theo dõi yêu cầu'}</h1><p class="mu">${recoveryStatus === 'PENDING' ? 'Giữ tab này để theo dõi. Admin cần xác minh đúng chủ tài khoản trước khi cho phép đổi.' : recoveryStatus === 'APPROVED' ? 'Nhập mật khẩu mới và nhập lại để xác nhận. Sau khi lưu, Admin chỉ nhận thông báo; không xem được mật khẩu hay mã khôi phục.' : 'Bạn có thể quay lại đăng nhập hoặc gửi yêu cầu mới.'}</p>${recoveryExpiry ? `<p class="mu">Hạn đổi mật khẩu: ${esc(new Date(recoveryExpiry).toLocaleString('vi-VN'))}</p>` : ''}${recoveryStatus === 'APPROVED' ? `<form id="recoveryComplete"><label>Mật khẩu mới<span class="recovery-password"><input name="password" type="password" minlength="6" required autocomplete="new-password"><button class="btn sm" type="button" data-recovery="eye" aria-label="Hiện mật khẩu mới" aria-pressed="false">👁</button></span></label><label>Nhập lại mật khẩu mới<span class="recovery-password"><input name="confirmation" type="password" minlength="6" required autocomplete="new-password"><button class="btn sm" type="button" data-recovery="eye" aria-label="Hiện mật khẩu xác nhận" aria-pressed="false">👁</button></span></label><p class="mu">Ít nhất 6 ký tự, tối đa 72 byte. Đổi thành công sẽ tự cấp mã khôi phục mới để bạn lưu.</p><div id="recoveryError" class="err" role="alert">${esc(recoveryError)}</div><button class="btn pri full">Xác nhận đổi mật khẩu</button></form>` : `<div id="recoveryError" class="err" role="alert">${esc(recoveryError)}</div><button type="button" class="btn full" data-recovery="${recoveryStatus === 'PENDING' ? 'refresh' : 'request'}">${recoveryStatus === 'PENDING' ? 'Kiểm tra trạng thái' : 'Bắt đầu yêu cầu mới'}</button>`}</section>`;
};
async function recoveryAPI(path, options = {}) {
  const token = sessionStorage.getItem(RECOVERY_KEY),
    response = await fetch('/api/password-recovery/' + path, {
      credentials: 'same-origin',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Recovery-Token': token } : {})
      }
    }),
    data = await response.json();
  if (!response.ok) throw Error(data.error || 'Không thể xử lý yêu cầu.');
  return data;
}
async function checkRecovery() {
  clearTimeout(recoveryTimer);
  const token = sessionStorage.getItem(RECOVERY_KEY);
  if (!token || me) return;
  try {
    const data = await recoveryAPI('status');
    if (token !== sessionStorage.getItem(RECOVERY_KEY) || me) return;
    const changed =
      recoveryStatus !== data.status ||
      recoveryExpiry !== data.expiresAt ||
      recoveryMethod !== data.method ||
      recoveryError ||
      recoveryReference !== data.reference;
    recoveryReference = data.reference;
    recoveryStatus = data.status;
    recoveryMethod = data.method || 'MANUAL';
    recoveryExpiry = data.expiresAt;
    recoveryError = '';
    if (changed && recoveryView === 'status') render();
  } catch (e) {
    recoveryError = e.message;
    const error = document.querySelector('#recoveryError');
    if (error) error.textContent = e.message;
  } finally {
    if (
      token === sessionStorage.getItem(RECOVERY_KEY) &&
      !me &&
      ['PENDING', 'APPROVED'].includes(recoveryStatus)
    )
      recoveryTimer = setTimeout(checkRecovery, 5000);
  }
}
document.addEventListener(
  'click',
  (e) => {
    const button = e.target.closest('[data-recovery]');
    if (!button) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const action = button.dataset.recovery;
    if (action === 'eye') {
      const input = button.parentElement.querySelector('input'),
        visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      button.setAttribute('aria-pressed', String(visible));
      button.setAttribute('aria-label', visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
      return;
    }
    if (action === 'ack-reset-code') {
      clearRecoveryCodeState();
      authTab = 'login';
      return render();
    }
    if (action === 'saved-code') {
      issuedRecoveryCode = '';
      const panel = document.querySelector('#recoveryCodePanel');
      if (panel) panel.outerHTML = recoveryCodePanel();
      return;
    }
    if (action === 'request' || action === 'support') {
      clearTimeout(recoveryTimer);
      recoveryView = action;
      recoveryError = '';
      return render();
    }
    if (action === 'back') {
      recoveryView = '';
      authTab = 'login';
      return render();
    }
    if (action === 'resume') {
      recoveryView = 'status';
      render();
      return checkRecovery();
    }
    if (action === 'refresh') checkRecovery();
  },
  true
);
document.addEventListener(
  'submit',
  async (e) => {
    const form = e.target;
    if (
      ![
        'recoveryCodeGenerate',
        'recoveryCodeRequest',
        'recoveryRequest',
        'recoveryComplete'
      ].includes(form.id)
    )
      return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const button = form.querySelector('button[type="submit"],button:not([type])');
    if (button?.disabled) return;
    if (button) button.disabled = true;
    const values = Object.fromEntries(new FormData(form));
    try {
      if (form.id === 'recoveryCodeGenerate') {
        if (!me) throw Error('Vui lòng đăng nhập lại.');
        const userId = me.id,
          data = await api('/api/me/recovery-code', {
            method: 'POST',
            body: JSON.stringify(values)
          });
        if (!me || me.id !== userId) return;
        issuedRecoveryCode = data.code;
        issuedRecoveryCodeOwner = userId;
        const panel = document.querySelector('#recoveryCodePanel');
        if (panel) panel.outerHTML = recoveryCodePanel();
        return;
      }
      if (form.id === 'recoveryRequest' || form.id === 'recoveryCodeRequest') {
        const data = await recoveryAPI(form.id === 'recoveryRequest' ? 'requests' : 'code', {
          method: 'POST',
          body: JSON.stringify(values)
        });
        sessionStorage.setItem(RECOVERY_KEY, data.token);
        recoveryReference = data.reference;
        recoveryStatus = data.status;
        recoveryMethod = data.method || 'MANUAL';
        recoveryExpiry = '';
        recoveryError = '';
        recoveryView = 'status';
        render();
        checkRecovery();
      } else {
        if (values.password !== values.confirmation) throw Error('Hai mật khẩu chưa trùng nhau.');
        const data = await recoveryAPI('complete', {
          method: 'POST',
          body: JSON.stringify(values)
        });
        clearRecoveryCodeState();
        sessionStorage.removeItem(TOKEN_KEY);
        recoveryStatus = 'COMPLETED';
        recoveryCompletionCode = data.recoveryCode || '';
        recoveryView = recoveryCompletionCode ? 'success' : '';
        authTab = 'login';
        render();
        toast(data.message);
      }
    } catch (error) {
      const target = document.querySelector(
        form.id === 'recoveryCodeGenerate' ? '#recoveryCodeError' : '#recoveryError'
      );
      if (target) target.textContent = error.message;
    } finally {
      if (button) button.disabled = false;
    }
  },
  true
);
if (!me) {
  render();
  if (sessionStorage.getItem(RECOVERY_KEY)) checkRecovery();
}
