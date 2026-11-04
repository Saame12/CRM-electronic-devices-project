# Phạm vi người nhận bắt buộc trước khi mở khảo sát

Cập nhật **03/11/2026**, thay quy trình gửi/bổ sung nhiều lần trước đây.

## Quy trình khảo sát mới

1. Tạo khảo sát và chọn phạm vi **Tất cả / Theo bộ lọc / Chọn từng khách**. Phạm vi không tự chọn Tất cả.
2. Có thể lưu DRAFT khi chưa chọn phạm vi để hoàn thiện sau. Phiếu chưa có phạm vi không có nút mở ở danh sách; API cũng chặn mở.
3. Khi lưu bản nháp có phạm vi, hệ thống lưu cả bộ lọc tuổi/sở thích/nhu cầu hoặc các ID được chọn. Mở lại form sẽ hiển thị cấu hình đã lưu.
4. Chọn OPEN ngay khi tạo hoặc bấm **Mở khảo sát** từ bản nháp đã cấu hình. Hệ thống kiểm tra lại khách đang hoạt động và điều kiện lọc, rồi mở và ghi người nhận trong cùng transaction.
5. Sau khi OPEN, phiếu mới không có nút Bổ sung người nhận. API từ chối gọi gửi lại hoặc thay phạm vi bằng đường gửi cũ, kể cả gửi cùng phạm vi.

Giao diện tạo OPEN chỉ gửi **một request**; đã bỏ lần gọi gửi thừa sau khi API tạo đã mở và ghi người nhận thành công.

Nếu cần sửa phạm vi khi chưa ai trả lời, chuyển về DRAFT, chỉnh cấu hình rồi mở lại. Danh sách người nhận khi mở lại được tạo theo phạm vi mới, thay danh sách chưa có câu trả lời trước đó. Phiếu đã có bài trả lời không được về DRAFT để sửa nội dung/phạm vi. CLOSED không mở lại; có thể sao chép thành bản nháp mới, nhưng bản sao phải chọn phạm vi riêng.

Phạm vi Tất cả vẫn tự nhận khách đăng ký sau khi phiếu còn OPEN và chưa hết hạn. Đây là thực hiện phạm vi đã chốt, không phải thao tác bổ sung phạm vi. FILTER/SELECTED vẫn chốt khách tại thời điểm mở.

## Ngoại lệ cho dữ liệu cũ

Chỉ phiếu **OPEN chưa lưu phạm vi** có nút **Thiết lập phạm vi (dữ liệu cũ)**. Quản lý thực hiện một lần, giữ người nhận và bài trả lời đã có. Sau khi xác nhận, nút biến mất và không thể gọi API để thiết lập lần hai. Danh sách ghi rõ nếu phiếu giữ người nhận cũ ngoài danh sách mới thiết lập.

Không suy diễn phạm vi từ số lượng người nhận. Phiếu cũ có cờ `accept_new_customers=true` đã xác nhận Tất cả từ phiên bản trước được bổ sung metadata ALL; các phiếu không có bằng chứng đó tiếp tục để trống cho Quản lý xác nhận. DRAFT cũ chưa có phạm vi cần chỉnh trong form trước khi mở.

## Triển khai và kiểm thử

- Thêm `surveys.audience_config` kiểu JSON để lưu phạm vi; không đổi mật khẩu, không nạp lại demo hoặc xóa bản ghi nghiệp vụ.
- Đã sao lưu trước migration: `data/backups/truoc-bat-buoc-pham-vi-20261103.sql` và metadata đi kèm.
- Số dòng của toàn bộ bảng trước/sau migration giữ nguyên. Chi tiết `outputs/qa/saved-audience-live-results.json`.
- `npm test`: **134/134 đạt**; kiểm tra validator, lưu/hiển thị phạm vi, nút theo trạng thái và tạo OPEN chỉ có một request.
- HTTP/MySQL cách ly: **182/182 đạt**; SCOPE01–SCOPE06 kiểm tra thiếu phạm vi không tạo phiếu dở, lưu cấu hình nháp, chặn gửi lại, ngoại lệ cũ một lần, mở lại nháp dùng đúng tập mới, bản sao không thừa kế phạm vi và hai request mở đồng thời chỉ một request thành công.
- `npm run setup:check`: đạt cài mới/chạy lại giữ dữ liệu và mật khẩu.

Các nhật ký: `outputs/qa/tests-saved-audience.txt`, `outputs/qa/integration-saved-audience.txt`, `outputs/qa/install-saved-audience.txt`. Tải lại trang sau khi máy chủ được cập nhật để nhận giao diện mới.
