# Đồng bộ khảo sát cho khách đăng ký mới

> Quy trình hiện tại: [lưu phạm vi trước khi mở](PHAM_VI_BAT_BUOC_KHAO_SAT.md). Khảo sát mới đã mở không gửi/bổ sung lại; thao tác thiết lập sau khi mở chỉ dành cho phiếu cũ thiếu phạm vi và thực hiện một lần.

Cập nhật **03/11/2026**, theo quy tắc người dùng xác nhận.

## Quy tắc

Ví dụ: khảo sát gửi **Tất cả** ngày 10, khách đăng ký ngày 11. Khách mới được nhận phiếu khi phiếu vẫn **OPEN** và chưa quá hạn (hoặc không đặt hạn).

| Loại phiếu | Khách đăng ký sau có tự nhận không? |
| --- | --- |
| Gửi Tất cả, OPEN, còn hạn | Có |
| DRAFT | Không |
| CLOSED | Không |
| OPEN nhưng quá hạn | Không |
| Gửi theo bộ lọc hoặc chọn từng khách | Không tự thêm; giữ danh sách tại thời điểm gửi |

Khách đã nộp vẫn xem lại bài của chính mình trong lịch sử, kể cả sau khi phiếu đóng. Đây là quyền đọc lịch sử, không phải cấp phiếu mới cho khách đăng ký sau.

## Đã sửa

- Lưu cờ `surveys.accept_new_customers` khi xuất bản bằng Tất cả; các đường tạo OPEN, sửa DRAFT thành OPEN và gửi/bổ sung đều dùng cùng publisher.
- Sau khi tạo user, ghi danh người nhận trong cùng transaction đăng ký. Ghi lỗi thì rollback tài khoản và dữ liệu tạo kèm.
- Khi khách đăng nhập/khôi phục phiên/vào mục Khảo sát hoặc hoàn thiện hồ sơ, frontend chờ `POST /api/surveys/sync` hoàn tất rồi mới tải danh sách. Nhờ vậy tài khoản đã tạo trước bản sửa hoặc gặp trường hợp gửi/đăng ký đồng thời cũng được đồng bộ lại.
- Đồng bộ chỉ dùng ID từ phiên đăng nhập, chỉ nhận CUSTOMER ACTIVE, không mở quyền cho tài khoản khác qua `customerId` giả mạo. INSERT IGNORE không tạo người nhận trùng.
- Khi đóng phiếu, việc đồng bộ khóa cùng hàng khảo sát với thao tác xuất bản/đóng. DRAFT/CLOSED và phiếu quá hạn không được bổ sung người nhận.
- Muốn thay phạm vi, phải về DRAFT khi chưa có ai trả lời, chỉnh phạm vi rồi mở lại. Phiếu Tất cả tiếp tục nhận khách mới theo cấu hình đã lưu; không đổi phạm vi bằng gửi lại khi OPEN.
- Danh sách Quản lý hiển thị **Nhận khách đăng ký mới: Có/Không**. Báo cáo tính người nhận thực tế đã ghi, bao gồm khách mới được đồng bộ; mẫu số có thể tăng khi phiếu công khai còn mở.

## Đối với phiếu cũ

Trước bản sửa, DB chỉ lưu danh sách người nhận, không lưu thao tác Tất cả / Chọn nhóm. Vì vậy không thể suy ra chắc chắn phạm vi gửi ban đầu từ số người nhận. Migration mặc định tắt tự nhận cho phiếu cũ, giữ quyền riêng của nhóm khách đã chọn.

Với phiếu OPEN cũ chưa có phạm vi muốn tiếp tục gửi **Tất cả**, Quản lý thực hiện **Thiết lập phạm vi (dữ liệu cũ) → Tất cả khách hiện tại và đăng ký mới → Xác nhận phạm vi** một lần. Thao tác này giữ người nhận trước đây, bổ sung khách đang bị bỏ sót và bật nhận tài khoản tương lai. Sau khi thiết lập, không còn thao tác gửi/bổ sung lại. Không tạo lại khảo sát và không xóa câu trả lời cũ.

Tại lần kiểm tra database hiện tại có hai phiếu OPEN còn hạn: “Mức độ hài lòng về dịch vụ” và “Nhu cầu mua sắm PC và laptop”; cả hai chưa có metadata phạm vi từ trước. Phiếu “Đánh giá trải nghiệm mua hàng tháng trước” vẫn mang trạng thái OPEN nhưng hạn 31/10/2026 đã qua, nên không cấp mới.

## Kiểm chứng

- `npm test`: **125/125 đạt**.
- HTTP/MySQL cách ly: **172/172 đạt**, gồm SYNC01–SYNC05: phân biệt phạm vi; đăng ký sau thời điểm gửi; hoàn thiện hồ sơ/đồng bộ lặp; nộp được phiếu đã nhận; chặn nhóm riêng/đóng/hết hạn; chặn giả mạo ID và kiểm tra mẫu số báo cáo.
- `npm run setup:check`: đạt cài mới và chạy lại không ghi đè dữ liệu/mật khẩu.
- Đã sao lưu trước migration tại `data/backups/truoc-sua-dong-bo-khao-sat-20261103.sql` và metadata cùng tên `.json`.
- Đối chiếu toàn bộ số bản ghi trước/sau migration khớp; không tự gửi lại hoặc mở rộng phạm vi phiếu cũ. Chi tiết: `outputs/qa/survey-sync-live-results.json`.
- Máy chủ cổng 3000 đã khởi động lại để nạp mã mới. Tải lại trình duyệt để dùng frontend mới.

Nhật ký: `outputs/qa/tests-survey-sync.txt`, `outputs/qa/integration-survey-sync.txt`, `outputs/qa/install-survey-sync.txt`.
