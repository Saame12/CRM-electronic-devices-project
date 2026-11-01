let customerDetailSequence = 0;
function closeCustomerDetails() {
  customerDetailSequence++;
  const dialog = document.getElementById('customerDetailDialog');
  if (!dialog) return;
  dialog.close();
  dialog.remove();
}
function showCustomerDetails(customer) {
  const birth = customer.birthDate
    ? customer.birthDate.split('-').reverse().join('/')
    : customer.year
      ? `Chỉ có năm sinh: ${customer.year}`
      : 'Chưa khai báo';
  const date = (value) => (value ? new Date(value).toLocaleString('vi-VN') : 'Chưa ghi nhận');
  const fields = [
    ['Họ và tên', customer.name],
    ['Email', customer.email],
    ['Số điện thoại', customer.phone],
    ['Ngày sinh', birth],
    ['Giới tính', customer.gender || 'Chưa khai báo'],
    ['Địa chỉ', customer.addr || 'Chưa khai báo'],
    ['Nhu cầu sử dụng', customer.need || 'Chưa xác định'],
    ['Trạng thái tài khoản', customer.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'],
    ['Ngày tạo tài khoản', date(customer.createdAt)],
    ['Cập nhật gần nhất', date(customer.updatedAt)]
  ];
  const dialog = document.createElement('dialog');
  dialog.id = 'customerDetailDialog';
  dialog.className = 'customer-detail-dialog';
  dialog.setAttribute('aria-labelledby', 'customerDetailTitle');
  dialog.innerHTML = `<div class="title"><div><h1 id="customerDetailTitle">Thông tin khách hàng</h1><p class="muted">Hồ sơ cá nhân · Chỉ xem</p></div><button class="btn small" type="button" data-close-customer-detail aria-label="Đóng thông tin khách hàng">✕</button></div><dl class="customer-detail-grid">${fields.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value || 'Chưa khai báo')}</dd></div>`).join('')}</dl><div class="customer-detail-footer"><button class="btn primary" type="button" data-close-customer-detail>Đóng</button></div>`;
  const interestNames = (customer.interests || []).map(
    (id) => CrmDomain.interests.find((x) => x.id === id)?.name || id
  );
  dialog
    .querySelector('.customer-detail-grid')
    .insertAdjacentHTML(
      'beforeend',
      `<div><dt>Sở thích</dt><dd>${esc(interestNames.join(', ') || 'Chưa khai báo')}</dd></div>`
    );
  const history = document.createElement('section');
  history.innerHTML =
    '<h2>Lịch sử tương tác</h2><div data-history-content aria-live="polite">Đang tải…</div>';
  dialog.querySelector('.customer-detail-footer').before(history);
  let request = 0;
  async function loadHistory(page = 1) {
    const current = ++request;
    try {
      const data = await api(
        '/api/admin/customers/' + encodeURIComponent(customer.id) + '/history?page=' + page
      );
      if (current !== request || !dialog.isConnected || me?.role !== 'MANAGER') return;
      const kinds = {
        PROFILE_CREATED: 'Tạo hồ sơ',
        FEEDBACK_SENT: 'Gửi phản hồi',
        FEEDBACK_REPLIED: 'Cửa hàng trả lời',
        SURVEY_SUBMITTED: 'Nộp khảo sát'
      };
      history.querySelector('[data-history-content]').innerHTML =
        `<ol>${data.events.map((x) => `<li><b>${esc(kinds[x.kind] || x.kind)}</b> · ${esc(date(x.occurred_at))}<p>${esc(x.title)}</p></li>`).join('') || '<li>Chưa có tương tác.</li>'}</ol><p>${data.total} sự kiện · Trang ${data.page}</p><button class="btn small" data-history-page="${page - 1}"${page <= 1 ? ' disabled' : ''}>Trước</button> <button class="btn small" data-history-page="${page + 1}"${page * data.pageSize >= data.total ? ' disabled' : ''}>Sau</button>`;
    } catch (error) {
      if (dialog.isConnected)
        history.querySelector('[data-history-content]').textContent = error.message;
    }
  }
  history.addEventListener('click', (e) => {
    const b = e.target.closest('[data-history-page]');
    if (b) loadHistory(Number(b.dataset.historyPage));
  });
  document.body.appendChild(dialog);
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  dialog.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-customer-detail]')) closeCustomerDetails();
    if (e.target === dialog) {
      const box = dialog.getBoundingClientRect();
      if (
        e.clientX < box.left ||
        e.clientX > box.right ||
        e.clientY < box.top ||
        e.clientY > box.bottom
      )
        closeCustomerDetails();
    }
  });
  dialog.showModal();
  loadHistory();
}
document.addEventListener(
  'click',
  async (e) => {
    const button = e.target.closest('[data-action="view-customer"]');
    if (!button) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (me?.role !== 'MANAGER') return;
    closeCustomerDetails();
    const sequence = ++customerDetailSequence;
    button.disabled = true;
    try {
      const result = await api('/api/admin/customers/' + encodeURIComponent(button.dataset.id));
      if (sequence === customerDetailSequence && me?.role === 'MANAGER' && page === 'customers')
        showCustomerDetails(result.customer);
    } catch (error) {
      toast(error.message);
    } finally {
      button.disabled = false;
    }
  },
  true
);
