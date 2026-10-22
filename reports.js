/* Báo cáo đọc dữ liệu thực từ MySQL; dùng chung cho trang vận hành của Quản lý. */
let reportData = null,
  reportSection = 'customers',
  reportFilter = { from: '', to: '' },
  reportLoading = false,
  reportError = '',
  reportDetail = null,
  reportSequence = 0;
const reportNumber = (value) => (value == null ? '—' : Number(value).toLocaleString('vi-VN'));
const reportPct = (value) =>
  value == null ? 'Chưa đủ dữ liệu' : `${reportNumber(Math.round(value * 10) / 10)}%`;
const reportStatus = {
  NEW: 'Mới tiếp nhận',
  IN_PROGRESS: 'Đang xử lý',
  RESOLVED: 'Đã xử lý',
  DRAFT: 'Bản nháp',
  OPEN: 'Đang mở',
  EXPIRED: 'Đã quá hạn',
  CLOSED: 'Đã đóng'
};
const reportDate = (value) => (value ? new Date(value).toLocaleString('vi-VN') : '—');
function reportMetric(label, value, note, tone = '') {
  return `<article class="rpt-metric ${tone}"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></article>`;
}
function reportEmpty(text = 'Chưa có dữ liệu trong phạm vi đã chọn.') {
  return `<p class="rpt-empty">${esc(text)}</p>`;
}
function reportBars(title, rows, note) {
  return `<article class="card rpt-panel"><h2>${esc(title)}</h2><p class="rpt-note">${esc(note)}</p>${rows.some((x) => x.total) ? rows.map((x, i) => `<div class="rpt-bar-row"><div><span>${esc(reportStatus[x.label] || x.label)}</span><b>${reportNumber(x.total)} <small>· ${reportPct(x.percentage)}</small></b></div><div class="rpt-track"><span class="rpt-color-${i % 4}" style="width:${Math.max(0, Math.min(100, Number(x.percentage) || 0))}%"></span></div></div>`).join('') : reportEmpty()}</article>`;
}
function reportTable(headers, rows) {
  return `<div class="table-wrap"><table class="table rpt-table"><thead><tr>${headers.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('') || `<tr><td colspan="${headers.length}">${reportEmpty()}</td></tr>`}</tbody></table></div>`;
}
function reportPage() {
  const labels = {
    customers: 'Khách hàng',
    feedback: 'Phản hồi khách hàng',
    surveys: 'Kết quả khảo sát'
  };
  const d = reportData;
  return `<section class="reports" aria-busy="${reportLoading}"><header class="rpt-heading"><div><p class="rpt-eyebrow">BACKLINE / TRUNG TÂM BÁO CÁO</p><h1>Báo cáo & phân tích CRM</h1><p class="rpt-subtitle">Hiểu khách hàng · Theo dõi chất lượng phục vụ · Đánh giá kết quả khảo sát</p></div><div class="rpt-actions"><button class="btn" data-rpt="print" ${!d || reportLoading ? 'disabled' : ''}>In / Lưu PDF</button><button class="btn primary" data-rpt="export" ${!d || reportLoading ? 'disabled' : ''}>Xuất CSV</button></div></header>
 <form id="reportFilters" class="rpt-filters"><label>Từ ngày<input type="date" name="from" value="${esc(reportFilter.from)}"></label><label>Đến ngày<input type="date" name="to" value="${esc(reportFilter.to)}"></label><button class="btn primary" ${reportLoading ? 'disabled' : ''}>Áp dụng</button><button type="button" class="btn" data-rpt="all" ${reportLoading ? 'disabled' : ''}>Toàn bộ thời gian</button><button type="button" class="btn" data-rpt="reload" ${reportLoading ? 'disabled' : ''}>Cập nhật</button><span class="rpt-update">${d ? 'Cập nhật ' + reportDate(d.generatedAt) : 'Dữ liệu trực tiếp từ hệ thống'}</span></form>
 <p class="rpt-scope"><b>Phạm vi:</b> ${reportFilter.from || 'Từ đầu'} → ${reportFilter.to || 'Hiện tại'}. Khách hàng lọc theo ngày tạo tài khoản; phản hồi theo ngày tiếp nhận; khảo sát theo ngày tạo. Trạng thái và hồ sơ là dữ liệu hiện tại. Kết quả của các khảo sát được chọn tính toàn bộ thời gian.</p>
 <nav class="rpt-tabs" aria-label="Nhóm báo cáo">${Object.entries(labels)
   .map(
     ([key, label], i) =>
       `<button class="${reportSection === key ? 'active' : ''}" data-rpt="section" data-section="${key}" aria-current="${reportSection === key ? 'page' : 'false'}"><span>0${i + 1}</span>${label}</button>`
   )
   .join('')}</nav>
 <div aria-live="polite">${reportLoading ? '<div class="rpt-loading">Đang tổng hợp dữ liệu báo cáo…</div>' : ''}${reportError ? `<div class="rpt-error" role="alert">${esc(reportError)} <button class="btn small" data-rpt="reload">Thử lại</button></div>` : ''}</div>
 ${!reportLoading && !reportError && d ? { customers: customerReportContent, feedback: feedbackReportContent, surveys: surveyReportContent }[reportSection](d) : ''}
 <footer class="rpt-foot">Số liệu được làm tròn 1 chữ số thập phân; tổng tỷ lệ có thể chênh 0,1%. Dấu “—” hoặc “Chưa đủ dữ liệu” nghĩa là chưa có mẫu số để tính, không phải 0%.</footer></section>`;
}
function customerReportContent(d) {
  const c = d.customers;
  return `<div class="rpt-section-title"><div><h2>Chân dung khách hàng</h2><p>Tập khách hàng được tạo trong khoảng thời gian đã chọn; không bao gồm Admin và Quản lý.</p></div><span class="rpt-pill">${reportNumber(c.total)} khách hàng</span></div>
 <div class="rpt-metrics">${reportMetric('Tổng khách hàng', reportNumber(c.total), 'Tài khoản thuộc vai trò Khách hàng')}${reportMetric('Đang hoạt động', reportNumber(c.active), reportPct(c.total ? (c.active * 100) / c.total : null) + ' tổng khách hàng', 'positive')}${reportMetric('Đã khóa', reportNumber(c.locked), 'Trạng thái tài khoản hiện tại', 'warning')}${reportMetric('Hoàn thiện hồ sơ', reportPct(c.completionRate), `${reportNumber(c.complete)} / ${reportNumber(c.total)} hồ sơ đầy đủ`)}</div>
 <div class="rpt-insight"><b>Điểm cần theo dõi</b><p>${c.total ? `Còn ${reportNumber(c.total - c.complete)} khách hàng chưa đủ thông tin để tư vấn theo hồ sơ. Nhóm chưa khai báo vẫn được tính trong tổng khách hàng để tránh làm lệch tỷ lệ.` : 'Chưa có khách hàng trong phạm vi này; hãy mở rộng khoảng ngày để xem dữ liệu.'}</p></div>
 <div class="rpt-grid">${reportBars('Phân bố độ tuổi', c.byAge, 'Tuổi ước tính = năm hiện tại − năm sinh. Mẫu số: toàn bộ khách hàng đã lọc. Năm sinh ngoài khoảng 0–120 tuổi được tách riêng.')}${reportBars('Nhu cầu sử dụng', c.byNeed, 'Mỗi khách hàng có một nhu cầu trong hồ sơ. Đây là nhu cầu sử dụng, chưa phải ý định mua hàng hoặc nhu cầu theo từng sản phẩm.')}${reportBars('Giới tính', c.byGender, 'Mẫu số: toàn bộ khách hàng đã lọc, bao gồm nhóm chưa khai báo.')}<article class="card rpt-panel"><h2>Chất lượng hồ sơ</h2>${reportTable(['Mức độ', 'Số khách', 'Tỷ lệ'], [`<tr><td>Đầy đủ</td><td>${reportNumber(c.complete)}</td><td>${reportPct(c.completionRate)}</td></tr>`, `<tr><td>Còn thiếu / chưa hợp lệ</td><td>${reportNumber(c.total - c.complete)}</td><td>${reportPct(c.total ? 100 - c.completionRate : null)}</td></tr>`])}<p class="rpt-note">Hồ sơ đầy đủ: có địa chỉ, năm sinh hợp lệ, giới tính và nhu cầu khác “Chưa xác định”. Độ tuổi theo nhóm được ước tính từ năm sinh; ngày/tháng sinh được lưu trong hồ sơ cá nhân.</p></article></div>${reportTrend(d)}`;
}
function reportTrend(d) {
  return `<article class="card rpt-panel"><h2>Khách hàng mới & phản hồi theo tháng</h2><p class="rpt-note">Đếm theo ngày tạo tài khoản và ngày nhận phản hồi. Chỉ hiển thị các tháng phát sinh dữ liệu trong phạm vi đã chọn.</p>${reportTable(
    ['Tháng', 'Khách hàng mới', 'Phản hồi tiếp nhận'],
    d.trend.map(
      (x) =>
        `<tr><td>${esc(x.month)}</td><td>${reportNumber(x.customers)}</td><td>${reportNumber(x.feedback)}</td></tr>`
    )
  )}</article>`;
}
function feedbackReportContent(d) {
  const f = d.feedback;
  return `<div class="rpt-section-title"><div><h2>Chất lượng phản hồi & xử lý</h2><p>Phản hồi tiếp nhận trong kỳ; tình trạng xử lý tính đến thời điểm cập nhật.</p></div><span class="rpt-pill">Bao gồm phản hồi đã ẩn</span></div>
 <div class="rpt-metrics">${reportMetric('Phản hồi tiếp nhận', reportNumber(f.total), `${reportNumber(f.respondents)} khách hàng đã gửi`)}${reportMetric('Điểm đánh giá TB', f.averageRating == null ? '—' : `${reportNumber(f.averageRating)} / 5`, `${reportNumber(f.rated)} phản hồi có điểm hợp lệ`)}${reportMetric('Đánh giá tích cực', reportPct(f.satisfactionRate), 'Số đánh giá 4–5 sao / số đánh giá hợp lệ', 'positive')}${reportMetric('Tỷ lệ đã xử lý', reportPct(f.resolutionRate), `${reportNumber(f.resolved)} / ${reportNumber(f.total)} phản hồi`)}${reportMetric('Cần xử lý', reportNumber(f.pending), 'Mới tiếp nhận + đang xử lý', 'warning')}${reportMetric('Khiếu nại / báo lỗi', reportNumber(f.complaints), reportPct(f.complaintRate) + ' tổng phản hồi', 'warning')}</div>
 <div class="rpt-insight"><b>Ưu tiên vận hành</b><p>${f.total ? `Có ${reportNumber(f.pending)} phản hồi chưa xử lý xong. ${reportNumber(f.hidden)} phản hồi đã ẩn vẫn được giữ trong thống kê để lịch sử báo cáo không thay đổi khi ẩn hoặc khôi phục.` : 'Chưa có phản hồi trong phạm vi này. Không thể kết luận mức hài lòng khi chưa có đánh giá.'}</p></div>
 <div class="rpt-grid">${reportBars('Tiến độ xử lý', f.byStatus, 'Mẫu số: tổng phản hồi tiếp nhận trong kỳ, theo trạng thái hiện tại.')}${reportBars(
   'Phân bố đánh giá sao',
   f.byRating.map((x) => ({ ...x, label: x.label + ' sao' })),
   'Mẫu số: phản hồi có điểm từ 1 đến 5. Điểm trung bình được tính trên từng đánh giá, không lấy trung bình của trung bình sản phẩm.'
 )}${reportBars('Cơ cấu loại phản hồi', f.byType, 'Mẫu số: tổng phản hồi trong phạm vi đã chọn.')}</div>
 <article class="card rpt-panel"><h2>Phân tích theo sản phẩm</h2><p class="rpt-note">Tỷ trọng = số phản hồi sản phẩm / tổng phản hồi. Khiếu nại nhiều chưa khẳng định tỷ lệ lỗi cao vì hệ thống chưa có số lượng bán ra.</p>${reportTable(
   ['Sản phẩm', 'Phản hồi', 'Tỷ trọng', 'Điểm TB / 5', 'Báo lỗi / khiếu nại', 'Cần xử lý'],
   f.byProduct.map(
     (p) =>
       `<tr><td><b>${esc(p.name)}</b></td><td>${reportNumber(p.total)}</td><td>${reportPct(p.share)}</td><td>${reportNumber(p.averageRating)}</td><td>${reportNumber(p.complaints)}</td><td>${p.pending ? `<span class="rpt-count-warn">${reportNumber(p.pending)}</span>` : '0'}</td></tr>`
   )
 )}</article>`;
}
function surveyReportContent(d) {
  const s = d.surveys,
    count = (status) => s.byStatus.find((x) => x.label === status)?.total || 0;
  return `<div class="rpt-section-title"><div><h2>Hiệu quả khảo sát</h2><p>Các khảo sát được tạo trong kỳ; câu trả lời và danh sách đã gửi tính toàn bộ thời gian.</p></div><span class="rpt-pill">${reportNumber(s.total)} khảo sát</span></div>
 <div class="rpt-metrics">${reportMetric('Tổng khảo sát', reportNumber(s.total), `${count('DRAFT')} bản nháp · ${count('CLOSED')} đã đóng`)}${reportMetric('Đang nhận câu trả lời', reportNumber(count('OPEN')), 'Trạng thái OPEN và chưa quá hạn', 'positive')}${reportMetric('Quá hạn', reportNumber(count('EXPIRED')), 'OPEN nhưng ngày hết hạn đã qua', 'warning')}${reportMetric('Lượt hoàn thành', reportNumber(s.responses), 'Một lượt = một khách hàng trả lời một khảo sát')}</div>
 <div class="rpt-insight"><b>Cách đọc tỷ lệ hoàn thành</b><p>Tỷ lệ = khách trong danh sách đã gửi có trả lời / số khách trong danh sách đã gửi. Khách trả lời ngoài danh sách được tách riêng. Chưa có danh sách đã gửi thì không tính tỷ lệ; số chưa trả lời không đồng nghĩa với quá hạn.</p></div>
 <article class="card rpt-panel"><h2>Chi tiết từng khảo sát</h2>${reportTable(
   [
     'Khảo sát',
     'Trạng thái',
     'Đã gửi',
     'Tổng trả lời',
     'Trả lời trong danh sách',
     'Chưa trả lời trong danh sách',
     'Ngoài danh sách',
     'Hoàn thành',
     'Kết quả'
   ],
   s.items.map(
     (x) =>
       `<tr><td><b>${esc(x.title)}</b><br><small class="muted">Hạn: ${esc(x.due_day || 'Không đặt')}</small></td><td><span class="rpt-status ${x.effectiveStatus}">${esc(reportStatus[x.effectiveStatus] || x.effectiveStatus)}</span></td><td>${reportNumber(x.recipients)}</td><td>${reportNumber(x.responses)}</td><td>${reportNumber(x.matchedResponses)}</td><td>${reportNumber(x.notAnswered)}</td><td>${reportNumber(x.outsideResponses)}</td><td>${reportPct(x.completionRate)}</td><td><button class="btn small" data-rpt="survey" data-id="${esc(x.id)}">Phân tích</button></td></tr>`
   )
 )}</article>
 ${reportDetail ? surveyDetailContent() : reportEmpty('Chọn “Phân tích” để xem thống kê từng câu hỏi và danh sách người đã trả lời.')}`;
}
function surveyDetailContent() {
  if (reportDetail.loading) return '<div class="rpt-loading">Đang tải kết quả khảo sát…</div>';
  if (reportDetail.error) return `<div class="rpt-error">${esc(reportDetail.error)}</div>`;
  const detail = reportDetail.data;
  return `<section id="reportSurveyDetail" class="rpt-detail"><div class="rpt-section-title"><div><p class="rpt-eyebrow">PHÂN TÍCH CÂU TRẢ LỜI</p><h2>${esc(detail.survey.title)}</h2><p>${reportNumber(detail.responses.length)} lượt hoàn thành · Toàn bộ thời gian · Kết quả đang mở có thể tiếp tục thay đổi.</p></div><button class="btn small" data-rpt="close-detail">Thu gọn</button></div>
 ${detail.questions
   .map(
     (q, i) =>
       `<article class="card rpt-panel"><div class="rpt-question-head"><h3>${i + 1}. ${esc(q.text)}</h3><span class="rpt-pill">${esc({ ONE: 'Chọn một', MULTI: 'Chọn nhiều', TEXT: 'Văn bản', RATING: 'Đánh giá sao' }[q.type] || q.type)}</span></div><p class="rpt-note">${q.required ? 'Bắt buộc' : 'Không bắt buộc'} · ${q.answered} lượt trả lời · ${q.skipped} lượt không có câu trả lời được ghi nhận${q.type === 'RATING' ? ` · Điểm TB: ${reportNumber(q.averageRating)} / 5` : ''}</p>${
         q.type === 'TEXT'
           ? q.texts.length
             ? `<p class="rpt-note">Hiển thị tối đa 100 câu trả lời gần nhất / ${q.textCount} câu trả lời văn bản.</p><div class="rpt-text-answers">${q.texts.map((t) => `<blockquote><p>${esc(t.text)}</p><time>${reportDate(t.at)}</time></blockquote>`).join('')}</div>`
             : reportEmpty('Chưa có ý kiến văn bản.')
           : q.options.some((o) => o.total)
             ? `<p class="rpt-note">${q.type === 'MULTI' ? 'Tỷ lệ mỗi lựa chọn = số người chọn / số người trả lời câu này. Một người có thể chọn nhiều nên tổng tỷ lệ có thể vượt 100%.' : 'Mẫu số: số lượt trả lời hợp lệ cho câu hỏi này.'}</p>${reportTable(
                 ['Lựa chọn', 'Số người chọn', 'Tỷ lệ'],
                 q.options.map(
                   (o) =>
                     `<tr><td>${esc(o.label)}${q.type === 'RATING' ? ' sao' : ''}</td><td>${o.total}</td><td>${reportPct(o.percentage)}</td></tr>`
                 )
               )}`
             : reportEmpty('Chưa có câu trả lời cho câu hỏi này.')
       }</article>`
   )
   .join('')}
 <article class="card rpt-panel"><h2>Người đã hoàn thành khảo sát</h2><p class="rpt-note">Thông tin này chỉ dành cho Quản lý. Bấm “Câu trả lời” để đối chiếu nội dung từng người.</p>${reportTable(
   ['Khách hàng', 'Email', 'Thời điểm hoàn thành', 'Chi tiết'],
   detail.responses.map(
     (r, i) =>
       `<tr><td>${esc(r.full_name)}</td><td>${esc(r.email)}</td><td>${reportDate(r.submitted_at)}</td><td><details><summary>Câu trả lời</summary>${(r.answers || []).map((a) => `<p><b>${esc(a.question)}</b><br>${esc(a.answer)}</p>`).join('') || 'Chưa có nội dung được ghi nhận.'}</details></td></tr>`
   )
 )}</article></section>`;
}
async function fetchReports() {
  const sequence = ++reportSequence;
  reportLoading = true;
  reportError = '';
  reportDetail = null;
  render();
  try {
    const data = await api('/api/admin/reports/overview?' + new URLSearchParams(reportFilter));
    if (sequence !== reportSequence || me?.role !== 'MANAGER') return;
    reportData = data;
  } catch (e) {
    if (sequence === reportSequence) reportError = e.message;
  } finally {
    if (sequence === reportSequence) {
      reportLoading = false;
      if (me?.role === 'MANAGER' && page === 'reports') render();
    }
  }
}
document.addEventListener(
  'submit',
  (e) => {
    if (e.target.id !== 'reportFilters') return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const values = Object.fromEntries(new FormData(e.target));
    if (values.from && values.to && values.from > values.to)
      return toast('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');
    reportFilter = { from: values.from, to: values.to };
    fetchReports();
  },
  true
);
document.addEventListener(
  'click',
  async (e) => {
    const b = e.target.closest('[data-rpt]');
    if (!b) return;
    e.stopImmediatePropagation();
    const action = b.dataset.rpt;
    if (action === 'section') {
      reportSection = b.dataset.section;
      return render();
    }
    if (action === 'all') {
      reportFilter = { from: '', to: '' };
      return fetchReports();
    }
    if (action === 'reload') return fetchReports();
    if (action === 'print')
      return !reportLoading && !reportError && reportData
        ? window.print()
        : toast('Vui lòng tải báo cáo thành công trước khi in.');
    if (action === 'export') return exportReports();
    if (action === 'close-detail') {
      reportDetail = null;
      return render();
    }
    if (action === 'survey') {
      const id = b.dataset.id,
        sequence = reportSequence;
      reportDetail = { id, loading: true };
      render();
      try {
        const data = await api('/api/admin/reports/survey-detail/' + encodeURIComponent(id));
        if (sequence !== reportSequence || reportDetail?.id !== id || me?.role !== 'MANAGER')
          return;
        reportDetail = { id, data };
      } catch (error) {
        if (sequence !== reportSequence || reportDetail?.id !== id) return;
        reportDetail = { id, error: error.message };
      }
      if (page === 'reports') {
        render();
        document
          .querySelector('#reportSurveyDetail')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  },
  true
);
function exportReports() {
  if (!reportData || reportLoading || reportError)
    return toast('Vui lòng tải báo cáo thành công trước khi xuất.');
  const d = reportData,
    rows = [
      ['BÁO CÁO CRM'],
      ['Từ ngày', reportFilter.from || 'Từ đầu'],
      ['Đến ngày', reportFilter.to || 'Hiện tại'],
      ['Cập nhật', d.generatedAt],
      [
        'Phạm vi',
        'Khách hàng: ngày tạo; phản hồi: ngày nhận; khảo sát: ngày tạo, kết quả toàn thời gian.'
      ],
      []
    ];
  const addDistribution = (name, items) => {
    rows.push([name], ['Nhóm', 'Số lượng', 'Tỷ lệ (%)']);
    items.forEach((x) =>
      rows.push([reportStatus[x.label] || x.label, x.total, x.percentage ?? 'Không đủ dữ liệu'])
    );
    rows.push([]);
  };
  if (reportSection === 'customers') {
    rows.push(
      ['KHÁCH HÀNG'],
      ['Tổng', d.customers.total],
      ['Hoạt động', d.customers.active],
      ['Khóa', d.customers.locked],
      ['Hồ sơ đầy đủ', d.customers.complete]
    );
    addDistribution('Độ tuổi', d.customers.byAge);
    addDistribution('Nhu cầu sử dụng', d.customers.byNeed);
    addDistribution('Giới tính', d.customers.byGender);
    rows.push(['Tháng', 'Khách hàng mới', 'Phản hồi']);
    d.trend.forEach((x) => rows.push([x.month, x.customers, x.feedback]));
  }
  if (reportSection === 'feedback') {
    const f = d.feedback;
    rows.push(
      ['PHẢN HỒI'],
      ['Tổng', f.total],
      ['Khách gửi', f.respondents],
      ['Điểm trung bình', f.averageRating ?? 'Không đủ dữ liệu'],
      ['Tỷ lệ tích cực (%)', f.satisfactionRate ?? 'Không đủ dữ liệu'],
      ['Đã xử lý', f.resolved],
      ['Cần xử lý', f.pending],
      ['Khiếu nại', f.complaints],
      ['Đã ẩn', f.hidden]
    );
    addDistribution('Trạng thái', f.byStatus);
    addDistribution('Loại phản hồi', f.byType);
    addDistribution('Số sao', f.byRating);
    rows.push(['Sản phẩm', 'Phản hồi', 'Tỷ trọng (%)', 'Điểm TB', 'Khiếu nại', 'Cần xử lý']);
    f.byProduct.forEach((x) =>
      rows.push([x.name, x.total, x.share, x.averageRating ?? '', x.complaints, x.pending])
    );
  }
  if (reportSection === 'surveys') {
    rows.push(
      ['KẾT QUẢ KHẢO SÁT'],
      [
        'Tên',
        'Trạng thái',
        'Đã gửi',
        'Tổng trả lời',
        'Trả lời trong danh sách',
        'Chưa trả lời',
        'Ngoài danh sách',
        'Hoàn thành (%)'
      ]
    );
    d.surveys.items.forEach((x) =>
      rows.push([
        x.title,
        reportStatus[x.effectiveStatus],
        x.recipients,
        x.responses,
        x.matchedResponses,
        x.notAnswered,
        x.outsideResponses,
        x.completionRate ?? 'Không đủ dữ liệu'
      ])
    );
    if (reportDetail?.data) {
      rows.push([], ['Chi tiết', reportDetail.data.survey.title]);
      reportDetail.data.questions.forEach((q) => {
        rows.push([q.text, q.type, 'Đã trả lời', q.answered, 'Không trả lời', q.skipped]);
        (q.options || []).forEach((o) => rows.push([o.label, o.total, o.percentage ?? '']));
        (q.texts || []).forEach((t) => rows.push([t.text, reportDate(t.at)]));
      });
    }
  }
  const cell = (v) => {
    let text = String(v ?? '');
    if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };
  const blob = new Blob(['\uFEFF' + rows.map((row) => row.map(cell).join(',')).join('\r\n')], {
    type: 'text/csv;charset=utf-8'
  });
  const url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = `bao-cao-${reportSection}-${reportData.asOf}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function resetReports() {
  reportSequence++;
  reportData = null;
  reportDetail = null;
  reportLoading = false;
  reportError = '';
  reportSection = 'customers';
  reportFilter = { from: '', to: '' };
}
