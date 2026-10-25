let recoveryAdminPage = 'accounts',
  recoveryAdminData = { requests: [], pending: 0, unread: 0 },
  recoveryAdminReview = null,
  recoveryAdminTimer = null,
  recoveryAdminBusy = false,
  recoveryAdminError = '';
function adminWorkspace() {
  return `${recoveryAdminData.unread ? `<div class="recovery-admin-notice" role="status">Có ${recoveryAdminData.unread} khách hàng đã đổi mật khẩu thành công. <button class="btn small" data-recovery-admin="requests">Xem thông báo</button></div>` : ''}${recoveryAdminError ? `<p class="error" role="alert">${esc(recoveryAdminError)}</p>` : ''}${recoveryAdminPage === 'accounts' ? accountPage() : recoveryAdminContent()}`;
}
let recoveryHistoryFilter = { q: '', status: '', unread: false };
function recoverySupportContent(date) {
  const pending = recoveryAdminData.requests.filter(
    (r) => r.status === 'PENDING' && r.verification_method !== 'RECOVERY_CODE'
  );
  const review = pending.find((r) => r.id === recoveryAdminReview);
  return `<details class="card recovery-support" ${review ? 'open' : ''}><summary>Hỗ trợ khách chưa có / đã mất mã (${pending.length} chờ xác minh)</summary><p class="muted">Đây là lối hỗ trợ riêng. Chỉ duyệt sau khi liên hệ và xác minh đúng chủ tài khoản; không duyệt chỉ vì thông tin trong biểu mẫu khớp.</p>${review ? `<form id="recoveryAdminReview" class="card recovery-review" data-id="${esc(review.id)}"><h2>Xác minh hỗ trợ: ${esc(review.customer_name || review.email)}</h2><p>Số điện thoại đã đăng ký: ${esc(review.registered_phone || 'Không tìm thấy tài khoản phù hợp')}</p><p class="muted">Đối chiếu mã yêu cầu ${esc(review.id.slice(0, 8).toUpperCase())} với khách khi liên hệ.</p><label><input type="checkbox" name="verified"> Tôi đã xác minh đúng chủ tài khoản qua thông tin liên hệ đã đăng ký</label><label>Ghi chú xác minh / lý do từ chối<textarea name="note" minlength="5" maxlength="500" required></textarea></label><div class="error" id="recoveryAdminReviewError" role="alert"></div><div class="toolbar"><button type="submit" class="btn primary" name="decision" value="approve" ${!review.customer_name || review.role !== 'CUSTOMER' || review.account_status !== 'ACTIVE' ? 'disabled' : ''}>Cho phép khách tự đổi mật khẩu</button><button type="submit" class="btn danger" name="decision" value="reject">Từ chối</button><button type="button" class="btn" data-recovery-admin="cancel-review">Đóng</button></div></form>` : pending.map((r) => `<div class="recovery-support-row"><span><b>${esc(r.customer_name || r.email)}</b> · ${date(r.created_at)}</span><button class="btn small" data-recovery-admin="review" data-id="${esc(r.id)}">Xác minh hỗ trợ</button></div>`).join('') || '<p class="muted">Không có yêu cầu hỗ trợ đang chờ.</p>'}</details>`;
}
function recoveryAdminContent() {
  const names = {
    PENDING: 'Chờ hỗ trợ xác minh',
    APPROVED: 'Chờ khách đặt mật khẩu',
    COMPLETED: 'Đổi mật khẩu thành công',
    REJECTED: 'Hỗ trợ bị từ chối',
    EXPIRED: 'Hết hạn',
    CANCELLED: 'Đã hủy hiệu lực'
  };
  const date = (value) => (value ? new Date(value).toLocaleString('vi-VN') : '—');
  const rows = recoveryAdminData.requests.filter(
    (r) =>
      (!recoveryHistoryFilter.status || r.status === recoveryHistoryFilter.status) &&
      (!recoveryHistoryFilter.unread || (r.status === 'COMPLETED' && !r.completion_seen)) &&
      (!recoveryHistoryFilter.q ||
        [r.email, r.customer_name, r.id].some((v) =>
          String(v || '')
            .toLocaleLowerCase('vi')
            .includes(recoveryHistoryFilter.q.toLocaleLowerCase('vi'))
        ))
  );
  return `<section class="recovery-panel"><div class="title"><div><h1>Thông báo & lịch sử tương tác</h1><p class="muted">Lịch sử khôi phục mật khẩu của khách hàng. Hệ thống xác minh mã cá nhân; Admin nhận thông báo sau khi đổi thành công, không xem được mã hay mật khẩu.</p></div><button class="btn" data-recovery-admin="reload">Cập nhật</button></div><form id="recoveryHistoryFilters" class="toolbar"><label>Tìm khách hàng / mã yêu cầu<input name="q" value="${esc(recoveryHistoryFilter.q)}" placeholder="Tên, email hoặc mã"></label><label>Trạng thái<select name="status"><option value="">Tất cả</option>${Object.entries(
    names
  )
    .map(
      ([value, label]) =>
        `<option value="${value}"${recoveryHistoryFilter.status === value ? ' selected' : ''}>${label}</option>`
    )
    .join(
      ''
    )}</select></label><label><input type="checkbox" name="unread" ${recoveryHistoryFilter.unread ? 'checked' : ''}> Chưa đọc</label><button class="btn primary">Tìm kiếm / lọc</button><button type="button" class="btn" data-recovery-admin="clear-filter">Xóa lọc</button></form><p class="muted">Hiển thị ${rows.length} trong tối đa 200 tương tác gần nhất. Thông báo chưa đọc: ${recoveryAdminData.unread}.</p><div class="card table-wrap"><table class="table recovery-table"><thead><tr><th>Khách hàng</th><th>Tương tác / cách xác minh</th><th>Kết quả</th><th>Thời gian</th><th>Thông báo</th></tr></thead><tbody>${rows.map((r) => `<tr><td><b>${esc(r.customer_name || 'Thông tin chưa khớp tài khoản')}</b><small>${esc(r.email)}</small></td><td><b>${r.verification_method === 'RECOVERY_CODE' ? 'Khôi phục bằng mã cá nhân' : 'Yêu cầu hỗ trợ xác minh'}</b><small>Yêu cầu: ${esc(r.id.slice(0, 8).toUpperCase())}</small>${esc(r.reason)}${r.verification_note ? `<small>${esc(r.verification_note)}</small>` : ''}</td><td><span class="recovery-status ${esc(r.status)}">${esc(names[r.status] || r.status)}</span></td><td><small>Tiếp nhận: ${date(r.created_at)}</small><small>Hoàn tất: ${date(r.completed_at)}</small></td><td>${r.status === 'COMPLETED' && !r.completion_seen ? `<span class="badge">Mới</span><button class="btn small" data-recovery-admin="seen" data-id="${esc(r.id)}">Đánh dấu đã đọc</button>` : r.status === 'COMPLETED' ? 'Đã đọc' : '—'}</td></tr>`).join('') || '<tr><td colspan="5">Không có tương tác phù hợp.</td></tr>'}</tbody></table></div>${recoverySupportContent(date)}</section>`;
}
async function loadRecoveryAdmin(force = false) {
  if (me?.role !== 'ADMIN' || recoveryAdminBusy) return;
  recoveryAdminBusy = true;
  try {
    const data = await api('/api/admin/password-recovery');
    if (me?.role !== 'ADMIN') return;
    const changed = JSON.stringify(data) !== JSON.stringify(recoveryAdminData);
    if (data.unread > recoveryAdminData.unread)
      toast('Khách hàng đã đổi mật khẩu thành công. Xem Thông báo & lịch sử tương tác.');
    if (data.pending > recoveryAdminData.pending) toast('Có khách chưa có mã cần hỗ trợ xác minh.');
    recoveryAdminData = data;
    recoveryAdminError = '';
    const typing =
      recoveryAdminReview ||
      document.querySelector('#adminAccountForm')?.contains(document.activeElement) ||
      document.querySelector('#accountFilters')?.contains(document.activeElement) ||
      document.querySelector('#recoveryHistoryFilters')?.contains(document.activeElement);
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
    if (action === 'clear-filter') {
      recoveryHistoryFilter = { q: '', status: '', unread: false };
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
  recoveryHistoryFilter = { q: '', status: '', unread: false };
}
document.addEventListener(
  'submit',
  (event) => {
    if (event.target.id !== 'recoveryHistoryFilters') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const values = Object.fromEntries(new FormData(event.target));
    recoveryHistoryFilter = {
      q: String(values.q || '').trim(),
      status: values.status || '',
      unread: values.unread === 'on'
    };
    render();
  },
  true
);
