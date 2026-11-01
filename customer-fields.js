function interestFields(selected = []) {
  return `<fieldset data-interest-fields><legend>Sở thích (có thể chọn nhiều)</legend>${CrmDomain.interests.map((x) => `<label><input type="checkbox" name="interests" value="${x.id}"${selected.includes(x.id) ? ' checked' : ''}> ${x.name}</label>`).join('')}</fieldset>`;
}
function audienceFields() {
  return `<fieldset><legend>Người nhận khi mở / gửi khảo sát</legend><label>Phạm vi<select name="audienceMode"><option value="ALL">Tất cả khách đang hoạt động</option><option value="FILTER">Theo bộ lọc</option><option value="SELECTED">Chọn từng khách</option></select></label><div class="toolbar"><label>Nhu cầu<select name="audienceNeed"><option value="">Tất cả</option>${CrmDomain.needs.map((x) => `<option>${x}</option>`).join('')}</select></label><label>Sở thích<select name="audienceInterest"><option value="">Tất cả</option>${CrmDomain.interests.map((x) => `<option value="${x.id}">${x.name}</option>`).join('')}</select></label><label>Tuổi từ<input type="number" name="audienceMinAge" min="0" max="120"></label><label>Đến tuổi<input type="number" name="audienceMaxAge" min="0" max="120"></label></div><button type="button" class="btn" data-action="load-audience-customers">Tải danh sách để chọn từng khách</button><div data-audience-customers></div><button type="button" class="btn" data-action="preview-audience">Xem trước người nhận</button><div data-audience-preview aria-live="polite"></div><p class="muted">Bộ lọc chỉ áp dụng ở chế độ “Theo bộ lọc”. Gửi lại chỉ thêm người nhận. Khách ngoài danh sách không được xem hoặc trả lời.</p></fieldset>`;
}
function readAudience(form) {
  const f = new FormData(form);
  return {
    mode: f.get('audienceMode') || 'ALL',
    filters: {
      need: f.get('audienceNeed') || '',
      interest: f.get('audienceInterest') || '',
      minAge: f.get('audienceMinAge') || '',
      maxAge: f.get('audienceMaxAge') || ''
    },
    customerIds: f.getAll('audienceCustomer')
  };
}
