/* Pure staff views. No network calls, startup or event listeners. */
function main() {
  const isAdmin = me.role === 'ADMIN';
  const nav = isAdmin
    ? [
        ['accounts', 'Tài khoản'],
        ['requests', 'Thông báo & lịch sử tương tác']
      ]
    : [
        ['dashboard', 'Tổng quan'],
        ['customers', 'Khách hàng'],
        ['feedback', 'Phản hồi'],
        ['surveys', 'Khảo sát'],
        ['reports', 'Báo cáo & phân tích']
      ];
  const current = isAdmin
    ? typeof recoveryAdminPage === 'string'
      ? recoveryAdminPage
      : 'accounts'
    : page;
  const content = isAdmin
    ? typeof adminWorkspace === 'function'
      ? adminWorkspace()
      : accountPage()
    : {
        dashboard,
        customers: customerPage,
        feedback: feedbackPage,
        surveys: surveyPage,
        reports: reportPage
      }[page]();
  return `<div class="workspace"><aside class="sidebar"><div class="sidebar-heading"><span class="workspace-mark">B</span><div>BACKLINE CRM<small>${isAdmin ? 'Quản trị hệ thống' : 'Không gian vận hành'}</small></div></div><p class="sidebar-label">KHÔNG GIAN LÀM VIỆC</p><nav class="staff-nav" aria-label="Điều hướng ${isAdmin ? 'Admin' : 'Quản lý'}">${nav.map(([key, label], i) => `<button class="${current === key ? 'on' : ''}" ${current === key ? 'aria-current="page"' : ''} ${isAdmin ? 'data-recovery-admin' : 'data-page'}="${key}"><span class="nav-symbol" aria-hidden="true">${['◈', '▤', '◇', '▦', '◷'][i]}</span>${label}</button>`).join('')}</nav><div class="sidebar-foot"><span class="status-dot"></span> ${isAdmin ? 'Quyền quản trị tài khoản' : 'Quản lý hoạt động CRM'}<small>Dữ liệu trực tiếp từ hệ thống</small></div></aside><section class="workspace-content"><div class="workspace-breadcrumb">BACKLINE / ${isAdmin ? 'ADMIN' : 'QUẢN LÝ'} / ${esc(nav.find((x) => x[0] === current)?.[1] || 'Tổng quan')}</div>${content}</section></div>`;
}

function accountPage() {
  return `<h1>Quản trị tài khoản</h1><p class="muted">Admin tạo, xóa và tra cứu tài khoản. Vai trò được chọn khi thêm tài khoản mới.</p><form id="adminAccountForm" class="card"><h2>Thêm tài khoản</h2><div class="toolbar"><label>Họ tên<input name="name" required></label><label>Email<input name="email" type="email" required></label><label>Số điện thoại<input name="phone" required></label><label>Mật khẩu<span class="account-password"><input id="newAccountPassword" name="password" type="password" autocomplete="new-password" minlength="6" required><button type="button" class="account-password-eye" data-password-toggle="newAccountPassword" aria-label="Hiện mật khẩu" aria-pressed="false" title="Hiện mật khẩu"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path class="eye-slash" d="m3 3 18 18"/></svg></button></span></label><label>Vai trò<select name="role"><option value="CUSTOMER">Khách hàng</option><option value="MANAGER">Quản lý</option></select></label></div><button class="btn primary">Tạo tài khoản</button></form><div class="card table-wrap"><div class="title"><h2>Danh sách tài khoản</h2><button class="btn small" data-action="reload-accounts">Tải lại</button></div><form id="accountFilters" class="toolbar" role="search"><label>Tìm tài khoản<input name="q" value="${esc(accountFilters.q)}" placeholder="Tên, email hoặc số điện thoại"></label><label>Vai trò<select name="role"><option value="">Tất cả</option>${[
    ['ADMIN', 'Admin'],
    ['MANAGER', 'Quản lý'],
    ['CUSTOMER', 'Khách hàng']
  ]
    .map(
      ([v, l]) =>
        `<option value="${v}"${accountFilters.role === v ? ' selected' : ''}>${l}</option>`
    )
    .join(
      ''
    )}</select></label><label>Trạng thái<select name="status"><option value="">Tất cả</option>${[
    ['ACTIVE', 'Hoạt động'],
    ['LOCKED', 'Đã khóa']
  ]
    .map(
      ([v, l]) =>
        `<option value="${v}"${accountFilters.status === v ? ' selected' : ''}>${l}</option>`
    )
    .join(
      ''
    )}</select></label><button class="btn primary">Tìm kiếm / Lọc</button><button type="button" class="btn" data-action="clear-account-filters">Xóa bộ lọc</button></form><p class="muted" role="status">Hiển thị ${filteredAccounts().length} / ${accounts.length} tài khoản</p><table class="table"><thead><tr><th>Tài khoản</th><th>Liên hệ</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${
    filteredAccounts()
      .map(
        (a) =>
          `<tr><td><b>${esc(a.name)}</b><br><span class="muted">${esc(a.email)}</span></td><td>${esc(a.phone)}</td><td><span class="badge">${esc({ ADMIN: 'Admin', MANAGER: 'Quản lý', CUSTOMER: 'Khách hàng' }[a.role] || a.role)}</span></td><td>${a.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}</td><td>${a.id === me.id ? 'Tài khoản hiện tại' : `<button class="btn small danger" data-action="delete-account" data-id="${a.id}">Xóa</button>`}</td></tr>`
      )
      .join('') || '<tr><td colspan="5" class="muted">Không có tài khoản phù hợp.</td></tr>'
  }</tbody></table></div>`;
}

function customerPage() {
  return `<h1>Quản lý khách hàng</h1><div class="toolbar"><label>Tìm kiếm<input id="search" value="${esc(customerFilters.q)}" placeholder="Tên, email hoặc SĐT"></label><label>Nhu cầu<select id="needFilter"><option value="">Tất cả</option>${['Gaming', 'Đồ họa', 'Văn phòng', 'Chưa xác định'].map((x) => `<option${customerFilters.need === x ? ' selected' : ''}>${x}</option>`).join('')}</select></label><label>Trạng thái<select id="customerStatus"><option value="">Tất cả</option><option value="ACTIVE"${customerFilters.status === 'ACTIVE' ? ' selected' : ''}>Hoạt động</option><option value="LOCKED"${customerFilters.status === 'LOCKED' ? ' selected' : ''}>Đã khóa</option></select></label><button class="btn primary" data-action="search-customers">Lọc</button><button class="btn" data-action="toggle-customer-create">Thêm khách hàng</button></div>${showCustomerCreate ? `<form id="managerCustomerForm" class="card"><h2>Thêm khách hàng mới</h2><div class="toolbar"><label>Họ tên<input name="name" required></label><label>Email<input name="email" type="email" required></label><label>Số điện thoại<input name="phone" required></label><label>Mật khẩu ban đầu<input name="password" type="password" minlength="6" required></label><label>Địa chỉ<input name="addr"></label><label>Nhu cầu<select name="need">${['Gaming', 'Đồ họa', 'Văn phòng', 'Chưa xác định'].map((x) => `<option>${x}</option>`).join('')}</select></label></div><button class="btn primary">Lưu khách hàng</button></form>` : ''}<div class="card table-wrap"><table class="table"><thead><tr><th>Khách hàng</th><th>Liên hệ</th><th>Nhu cầu</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${customers.map((u) => `<tr><td><b>${esc(u.name)}</b><br><span class="muted">${esc(u.email)}</span></td><td>${esc(u.phone)}</td><td>${esc(u.need)}</td><td><span class="badge ${u.status === 'LOCKED' ? 'locked' : ''}">${u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}</span></td><td><button class="btn small" data-action="view-customer" data-id="${u.id}">Xem chi tiết</button> <button class="btn small ${u.status === 'ACTIVE' ? 'danger' : ''}" data-action="status" data-id="${u.id}" data-status="${u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE'}">${u.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}</button> <button class="btn small danger" data-action="delete-customer" data-id="${u.id}">Xóa</button></td></tr>`).join('') || '<tr><td colspan="5" class="muted">Chưa có khách hàng phù hợp.</td></tr>'}</tbody></table></div>`;
}

function dashboard() {
  return `<h1>Tổng quan CRM</h1><p class="muted">Các chỉ số cập nhật từ dữ liệu MySQL.</p><section class="cards"><article class="card"><div class="muted">Khách hàng</div><div class="metric" id="mCustomers">–</div></article><article class="card"><div class="muted">Phản hồi cần xử lý</div><div class="metric" id="mFeedback">–</div></article><article class="card"><div class="muted">Khảo sát đang mở</div><div class="metric" id="mSurveys">–</div></article></section>`;
}

function feedbackPage() {
  const levels = ['NEW', 'IN_PROGRESS', 'RESOLVED'];
  return `<h1>${showHiddenFeedback ? 'Phản hồi đã ẩn' : 'Phản hồi khách hàng'}</h1><div class="toolbar"><label>Trạng thái<select id="feedbackStatus"><option value="">Tất cả</option>${[
    ['NEW', 'Mới tiếp nhận'],
    ['IN_PROGRESS', 'Đang xử lý'],
    ['RESOLVED', 'Đã xử lý']
  ]
    .map(
      ([v, l]) =>
        `<option value="${v}"${feedbackFilters.status === v ? ' selected' : ''}>${l}</option>`
    )
    .join(
      ''
    )}</select></label><label>Từ ngày xử lý<input id="feedbackFrom" type="date" value="${esc(feedbackFilters.from)}"></label><label>Đến ngày xử lý<input id="feedbackTo" type="date" value="${esc(feedbackFilters.to)}"></label><button class="btn primary" data-action="filter-feedback">Lọc</button><button class="btn" data-action="toggle-hidden-feedback">${showHiddenFeedback ? '← Quay lại phản hồi chính' : 'Xem phản hồi đã ẩn'}</button></div><section class="feedback">${
    feedback
      .map(
        (f) =>
          `<article class="card"><div class="title"><div><h2>${esc(f.title || f.feedback_type)}</h2><span class="muted">${esc(f.customer_name)} · ${esc(f.product_name)}</span></div><span class="badge ${f.status}">${f.status}</span></div><p>★ ${f.rating}/5 · ${esc(f.feedback_type)}</p><p class="muted">Ngày nhận: ${new Date(f.created_at).toLocaleString('vi-VN')} ${f.replied_at ? `· Xử lý xong: ${new Date(f.replied_at).toLocaleString('vi-VN')}` : ''}${f.hidden_at ? ` · Ẩn: ${new Date(f.hidden_at).toLocaleString('vi-VN')}` : ''}</p><p>${esc(f.body)}</p>${
            showHiddenFeedback
              ? `<button class="btn primary" data-action="restore-feedback" data-id="${f.id}">Khôi phục phản hồi</button>`
              : `<label>Trạng thái<select id="status-${f.id}">${levels
                  .filter((s) => levels.indexOf(s) >= levels.indexOf(f.status))
                  .map((s) => `<option ${f.status === s ? 'selected' : ''}>${s}</option>`)
                  .join(
                    ''
                  )}</select></label><label>Phản hồi khách hàng<textarea id="reply-${f.id}" placeholder="Nhập câu trả lời">${esc(f.reply_content || '')}</textarea></label><button class="btn primary" data-action="save-feedback" data-id="${f.id}">Lưu xử lý</button>${f.status === 'RESOLVED' ? ` <button class="btn danger" data-action="hide-feedback" data-id="${f.id}">Ẩn</button>` : ''}`
          }</article>`
      )
      .join('') || '<p class="muted">Không có phản hồi phù hợp.</p>'
  }</section>`;
}
