function interestFields(selected = []) {
  return `<fieldset data-interest-fields><legend>Sở thích (có thể chọn nhiều)</legend>${CrmDomain.interests.map((x) => `<label><input type="checkbox" name="interests" value="${x.id}"${selected.includes(x.id) ? ' checked' : ''}> ${x.name}</label>`).join('')}</fieldset>`;
}
function audienceFields(config = null) {
  const mode = config?.mode || '',
    filters = config?.filters || {},
    ids = config?.customerIds || [];
  const interests = filters.interests || (filters.interest ? [filters.interest] : []);
  return `<fieldset data-audience-fields><legend>Phạm vi người nhận</legend><p class="muted">Bắt buộc chọn phạm vi trước khi mở khảo sát. Có thể lưu bản nháp khi chưa chọn.</p><label>Phạm vi<select name="audienceMode"><option value=""${!mode ? ' selected' : ''}>Chọn phạm vi người nhận</option><option value="ALL"${mode === 'ALL' ? ' selected' : ''}>Tất cả khách hiện tại và đăng ký mới</option><option value="FILTER"${mode === 'FILTER' ? ' selected' : ''}>Theo bộ lọc</option><option value="SELECTED"${mode === 'SELECTED' ? ' selected' : ''}>Chọn từng khách</option></select></label><div class="toolbar"><label>Nhu cầu<select name="audienceNeed"><option value="">Tất cả</option>${CrmDomain.needs.map((x) => `<option${filters.need === x ? ' selected' : ''}>${x}</option>`).join('')}</select></label><label>Tuổi từ<input type="number" name="audienceMinAge" value="${esc(filters.minAge ?? '')}" min="0" max="120" step="1"></label><label>Đến tuổi<input type="number" name="audienceMaxAge" value="${esc(filters.maxAge ?? '')}" min="0" max="120" step="1"></label></div><fieldset><legend>Sở thích (có thể chọn nhiều)</legend><p class="muted">Khách khớp ít nhất một sở thích đã chọn. Không chọn mục nào nghĩa là không lọc sở thích.</p>${CrmDomain.interests.map((x) => `<label><input type="checkbox" name="audienceInterest" value="${x.id}"${interests.includes(x.id) ? ' checked' : ''}> ${x.name}</label>`).join('')}</fieldset><p class="muted">Tuổi tròn tính theo ngày sinh; ví dụ 15–20 gồm từ đủ 15 tuổi đến hết 20 tuổi. Nhu cầu, sở thích và khoảng tuổi phải đồng thời khớp.</p><button type="button" class="btn" data-action="load-audience-customers" aria-expanded="false">Tải danh sách để chọn từng khách</button><div data-audience-customers hidden aria-live="polite">${ids.map((id) => `<input type="hidden" name="audienceCustomer" value="${esc(id)}">`).join('')}</div>${ids.length ? `<p class="muted" data-audience-saved-count>Đã lưu ${ids.length} khách được chọn. Mở danh sách để kiểm tra hoặc thay đổi.</p>` : ''}<p class="muted">Nhấn lần nữa để đóng danh sách. Tất cả và Theo bộ lọc tự tích toàn bộ khách trong danh sách tương ứng. Thay đổi dấu tích sẽ chuyển sang Chọn từng khách. Thay điều kiện lọc sẽ xóa lựa chọn cũ; hãy tải lại danh sách. Chọn Tất cả sẽ bỏ bộ lọc và tự nhận khách mới khi còn mở và chưa quá hạn. Phạm vi được cố định khi mở; không có bước bổ sung sau đó cho khảo sát mới.</p></fieldset>`;
}
function readAudience(form) {
  const f = new FormData(form);
  return {
    mode: f.get('audienceMode') || '',
    filters: {
      need: f.get('audienceNeed') || '',
      interests: f.getAll('audienceInterest'),
      minAge: f.get('audienceMinAge') || '',
      maxAge: f.get('audienceMaxAge') || ''
    },
    customerIds: f.getAll('audienceCustomer')
  };
}
