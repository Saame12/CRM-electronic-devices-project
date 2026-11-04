# Bộ dữ liệu demo V3 — hạn khảo sát, gia hạn và mở lại

Bộ dữ liệu giả lập mới được nạp ngày 04/11/2026, thay cho bộ đang dùng để kiểm thử. Dữ liệu cũ vẫn tương thích với chương trình nhưng chưa đủ ví dụ cho luồng hạn khảo sát mới. Database cũ được giữ riêng và sao lưu trước khi chuyển cấu hình; không trộn dữ liệu giữa hai bộ.

## Đăng nhập

| Vai trò | Email | Mật khẩu demo |
|---|---|---|
| Admin | admin@backline.vn | Admin@123 |
| Quản lý | manager@demo.vn | Manager@123 |
| Quản lý hỗ trợ | manager2@demo.vn | Manager@123 |
| Khách chính | khach@demo.vn | 123456 |
| Khách mới đăng ký sau khi phát hành | khach18@demo.vn | 123456 |

Khách còn lại: `khach2@demo.vn` đến `khach17@demo.vn`, mật khẩu `123456`. Khách 11 bị khóa; khách 12 thiếu địa chỉ; khách 17 thiếu thông tin hồ sơ để thử yêu cầu bổ sung. Đây là tài khoản và thông tin giả lập.

Sau khi chuyển bộ dữ liệu, đăng xuất và đăng nhập lại. Tài khoản tự tạo và chỉnh sửa của bộ trước không được nhập vào bộ mới; có thể tìm lại ở database cũ hoặc bản sao lưu.

## Quy mô

| Dữ liệu | Số lượng |
|---|---:|
| Tài khoản | 21 — 1 Admin, 2 Quản lý, 18 Khách |
| Sản phẩm | 14 |
| Phản hồi sản phẩm | 54 |
| Khảo sát | 16 |
| Câu hỏi | 28 |
| Lượt người nhận | 127 |
| Bài trả lời khảo sát | 21 |
| Chi tiết trả lời | 47 |
| Lịch sử gia hạn / mở lại / đóng thủ công | 5 |

## Các tình huống nên thử

| Khảo sát / tình huống | Kết quả mong đợi |
|---|---|
| [Đóng thủ công] Góp ý dịch vụ thường xuyên | OPEN, không đặt hạn, không có nút Đặt ngày kết thúc; Quản lý dùng Đóng ngay |
| [Hết hạn hôm nay] Xác nhận nhu cầu hỗ trợ | Được trả lời hết ngày 04/11/2026; tự đóng từ 00:00 ngày 05/11 theo giờ Việt Nam |
| [Đã gia hạn] Góp ý nhóm Gaming và Đồ họa | OPEN, có lịch sử hạn cũ → hạn mới, giữ phạm vi người nhận |
| [Đã mở lại] Đánh giá hỗ trợ sau mua | OPEN, có lịch sử đóng và mở lại; giữ câu trả lời đã gửi |
| Đánh giá trải nghiệm mua hàng tháng trước | CLOSED do hết hạn; khách đã nhận vẫn thấy lịch sử; khách mới không nhận |
| Mức độ hài lòng về dịch vụ | OPEN có hạn, chưa có câu trả lời, dùng thử gia hạn hoặc đóng |
| Khảo sát Gaming/Đồ họa 15–20 tuổi | Lọc đúng tuổi tròn, sở thích Gaming HOẶC Đồ họa; có 7 khách đang hoạt động phù hợp khi tạo bộ |
| Khảo sát khách được chọn riêng | Chỉ 3 khách đã chọn nhận bài; mở lại không chạy lại phạm vi |
| Trải nghiệm bảo hành và hỗ trợ | Khảo sát CLOSED đã ẩn, có 8 bài trả lời, dùng thử báo cáo và xem bài đã gửi |
| Bản nháp ALL / FILTER / SELECTED | Khi chỉnh sửa phải chọn phương thức hạn trước khi lưu; giữ phạm vi đã thiết lập |
| Bản nháp chưa thiết lập phạm vi | Không mở được trước khi lưu phạm vi người nhận |

Đăng nhập khách chính để thử xem bài đã gửi và không gửi lại lần hai. Đăng nhập khách 18 để kiểm tra chỉ nhận bài ALL đang mở còn hiệu lực, không nhận bài hết hạn hoặc phạm vi riêng.

Các ngày được sinh tương đối theo ngày nạp; các ngày nêu trong bảng là ngày của bộ hiện tại. Nếu tạo lại vào ngày khác, hạn được tính lại. Lịch sử trong bộ này là dữ liệu giả lập phục vụ trình diễn; các thao tác mới của người dùng được ghi thật sau khi sử dụng.

## File dữ liệu và kiểm chứng

- SQL: xem đường dẫn `sqlFile` trong `outputs/demo-v3-manifest.json`.
- Bản sao lưu bộ cũ: xem `previousBackup` trong cùng manifest; không chia sẻ các file cấu hình riêng trong `data/backups`.
- Bộ mới đã qua kiểm tra ràng buộc dữ liệu và `npm run demo:check` trên máy chủ đang chạy.
- File SQL đã được khôi phục vào database cách ly, kiểm tra lại số liệu/trạng thái/lịch sử rồi dọn database kiểm thử.
- `npm test`: 156 kiểm thử đạt, gồm kiểm tra bộ V3 ở ngày hiện tại và một ngày tương lai.

Tạo lại một bộ V3 mới: `node scripts/create-demo-v3.js`. Lệnh sao lưu bộ hiện tại, tạo database khác, kiểm tra và cập nhật `.env`/`.env.demo`; cần khởi động lại máy chủ để dùng bộ vừa tạo.
