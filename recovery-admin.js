let recoveryAdminPage = 'accounts',
  recoveryAdminData = { requests: [], pending: 0, unread: 0 },
  recoveryAdminReview = null,
  recoveryAdminTimer = null,
  recoveryAdminBusy = false,
  recoveryAdminError = '';
function adminWorkspace() {
  return `${recoveryAdminData.unread ? `<div class="recovery-admin-notice" role="status">Có ${recoveryAdminData.unread} khách hàng đã đổi mật khẩu thành công. <button class="btn small" data-recovery-admin="requests">Xem thông báo</button></div>` : ''}${recoveryAdminError ? `<p class="error" role="alert">${esc(recoveryAdminError)}</p>` : ''}${recoveryAdminPage === 'accounts' ? accountPage() : recoveryAdminContent()}`;
}
function recoveryAdminContent() {
  const names = {
      PENDING: 'Chờ xác minh',
      APPROVED: 'Chờ khách đổi mật khẩu',
      COMPLETED: 'Đã hoàn tất',
      REJECTED: 'Đã từ chối',
      EXPIRED: 'Hết hạn',
      CANCELLED: 'Đã hủy hiệu lực'
    },
    date = (value) => (value ? new Date(value).toLocaleString('vi-VN') : '—'),
    review = recoveryAdminData.requests.find((x) => x.id === recoveryAdminReview);
  return `<section class="recovery-panel"><div class="title"><div><h1>Yêu cầu khôi phục mật khẩu</h1><p class="muted">Xác minh qua số điện thoại đã đăng ký trước khi duyệt. Chỉ sau khi khách lưu mật khẩu mới, hệ thống mới ghi nhận hoàn tất.</p></div><button class="btn" data-recovery-admin="reload">Cập nhật</button></div>${review ? `<form id="recoveryAdminReview" class="card recovery-review" data-id="${esc(review.id)}"><h2>Xử lý yêu cầu: ${esc(review.customer_name || review.email)}</h2><p class="muted">Liên hệ số điện thoại đã đăng ký và yêu cầu khách đọc mã <b>${esc(review.id.slice(0, 8).toUpperCase())}</b> trên màn hình chờ để đối chiếu đúng yêu cầu.</p><p><b>Thông tin liên hệ trong DB:</b> ${esc(review.registered_phone || 'Không tìm thấy tài khoản phù hợp')}</p><label><input type="checkbox" name="verified"> Tôi đã xác minh đúng chủ tài khoản qua thông tin liên hệ đã đăng ký</label><label>Ghi chú xác minh / lý do từ chối<textarea name="note" minlength="5" maxlength="500" required placeholder="Đã liên hệ số điện thoại đăng ký và xác minh chủ tài khoản…"></textarea></label><div class="error" id="recoveryAdminReviewError" role="alert"></div><div class="toolbar"><button class="btn primary" type="submit" name="decision" value="approve" ${!review.customer_name || review.role !== 'CUSTOMER' || review.account_status !== 'ACTIVE' ? 'disabled' : ''}>Cho phép khách tự đổi mật khẩu</button><button class="btn danger" type="submit" name="decision" value="reject">Từ chối</button><button class="btn" type="button" data-recovery-admin="cancel-review">Đóng</button></div></form>` : ''}<p class="muted">Hiển thị 200 yêu cầu gần nhất. Yêu cầu chờ duyệt có hạn 30 phút; sau khi duyệt, khách có 15 phút để tự đổi mật khẩu trên tab gửi yêu cầu.</p><div class="card table-wrap"><table class="table recovery-table"><thead><tr><th>Khách hàng</th><th>Yêu cầu</th><th>Trạng thái</th><th>Thời gian</th><th>Xử lý</th></tr></thead><tbody>${recoveryAdminData.requests.map((r) => `<tr><td><b>${esc(r.customer_name || 'Thông tin chưa khớp tài khoản')}</b><small>${esc(r.email)}</small><small>SĐT đăng ký: ${esc(r.registered_phone || '—')}</small></td><td><small>Mã: ${esc(r.id.slice(0, 8).toUpperCase())}</small>${esc(r.reason)}${r.verification_note ? `<small>Ghi chú: ${esc(r.verification_note)}</small>` : ''}</td><td><span class="recovery-status ${r.status}">${names[r.status] || esc(r.status)}</span>${r.status === 'COMPLETED' && !r.completion_seen ? '<small>Thông báo mới</small>' : ''}</td><td><small>Yêu cầu: ${date(r.created_at)}</small><small>Duyệt/xử lý: ${date(r.reviewed_at)}</small><small>Hoàn tất: ${date(r.completed_at)}</small><small>Admin: ${esc(r.reviewer_name || '—')}</small></td><td>${r.status === 'PENDING' ? `<button class="btn small" data-recovery-admin="review" data-id="${esc(r.id)}">Xác minh / xử lý</button>` : r.status === 'COMPLETED' && !r.completion_seen ? `<button class="btn small" data-recovery-admin="seen" data-id="${esc(r.id)}">Đã đọc</button>` : '—'}</td></tr>`).join('') || '<tr><td colspan="5">Chưa có yêu cầu khôi phục mật khẩu.</td></tr>'}</tbody></table></div></section>`;
}
async function loadRecoveryAdmin(force = false) {
  if (me?.role !== 'ADMIN' || recoveryAdminBusy) return;
  recoveryAdminBusy = true;
  try {
    const data = await api('/api/admin/password-recovery');
    if (me?.role !== 'ADMIN') return;
    const changed = JSON.stringify(data) !== JSON.stringify(recoveryAdminData);
    if (data.unread > recoveryAdminData.unread)
      toast('Có khách hàng đã đổi mật khẩu thành công. Xem mục Yêu cầu đổi mật khẩu.');
    if (data.pending > recoveryAdminData.pending)
      toast('Có yêu cầu khôi phục mật khẩu đang chờ xác minh.');
    recoveryAdminData = data;
    recoveryAdminError = '';
    const typing =
      recoveryAdminReview ||
      document.querySelector('#adminAccountForm')?.contains(document.activeElement) ||
      document.querySelector('#accountFilters')?.contains(document.activeElement);
    if (force || (changed && !typing)) render();
  } catch (error) {
    if (error.staleSession) return;
    recoveryAdminError = error.message;
    if (force) render();
  } finally {
    recoveryAdminBusy = false;
  }
}
function pollRecoveryAdmin() {
  clearTimeout(recoveryAdminTimer);
  if (me?.role !== 'ADMIN') return;
  loadRecoveryAdmin();
  recoveryAdminTimer = setTimeout(pollRecoveryAdmin, 10000);
}
document.addEventListener(
  'click',
  async (e) => {
    const b = e.target.closest('[data-recovery-admin]');
    if (!b) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const action = b.dataset.recoveryAdmin;
    if (['accounts', 'requests'].includes(action)) {
      recoveryAdminPage = action;
      recoveryAdminReview = null;
      render();
      return loadRecoveryAdmin(true);
    }
    if (action === 'review') {
      recoveryAdminReview = b.dataset.id;
      return render();
    }
    if (action === 'cancel-review') {
      recoveryAdminReview = null;
      return render();
    }
    if (action === 'reload') return loadRecoveryAdmin(true);
    if (action === 'seen') {
      try {
        await api(`/api/admin/password-recovery/${b.dataset.id}/seen`, { method: 'POST' });
        await loadRecoveryAdmin(true);
      } catch (error) {
        toast(error.message);
      }
    }
  },
  true
);
document.addEventListener(
  'submit',
  async (e) => {
    if (e.target.id !== 'recoveryAdminReview') return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const form = e.target,
      button = e.submitter;
    if (!button || button.disabled) return;
    const values = Object.fromEntries(new FormData(form)),
      action = button.value;
    if (action === 'approve' && values.verified !== 'on') {
      document.querySelector('#recoveryAdminReviewError').textContent =
        'Cần xác nhận đã xác minh đúng chủ tài khoản.';
      return;
    }
    button.disabled = true;
    try {
      await api(`/api/admin/password-recovery/${form.dataset.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action, note: values.note, verified: values.verified === 'on' })
      });
      recoveryAdminReview = null;
      await loadRecoveryAdmin(true);
      toast(
        action === 'approve' ? 'Đã duyệt. Đang chờ khách tự đổi mật khẩu.' : 'Đã từ chối yêu cầu.'
      );
    } catch (error) {
      document.querySelector('#recoveryAdminReviewError').textContent = error.message;
    } finally {
      button.disabled = false;
    }
  },
  true
);
function resetRecoveryAdmin() {
  clearTimeout(recoveryAdminTimer);
  recoveryAdminPage = 'accounts';
  recoveryAdminData = { requests: [], pending: 0, unread: 0 };
  recoveryAdminReview = null;
  recoveryAdminError = '';
}
