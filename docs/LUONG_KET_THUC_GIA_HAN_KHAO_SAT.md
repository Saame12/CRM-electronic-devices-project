# Hướng dẫn kết thúc, gia hạn và mở lại khảo sát

## Chọn cách kết thúc khi tạo hoặc sửa bản nháp

| Lựa chọn | Cách sử dụng | Kết quả |
|---|---|---|
| Có ngày kết thúc | Bắt buộc chọn ngày | Nhận câu trả lời đến hết ngày đó; tự đóng lúc 00:00 ngày tiếp theo theo giờ Việt Nam |
| Đóng thủ công | Không nhập ngày | Nhận câu trả lời cho đến khi Quản lý bấm Đóng ngay |

Khi tạo mới, biểu mẫu để trống phương thức để Quản lý chọn **Có ngày kết thúc** hoặc **Đóng thủ công** trước khi lưu. Khi chỉnh sửa bản nháp, kể cả sau khóa khẩn cấp, biểu mẫu điền sẵn phương thức, ngày kết thúc và phạm vi người nhận đã lưu; không phải thiết lập lại. Thay đổi trong biểu mẫu chỉ được ghi khi nhấn Lưu. Chọn **Có ngày kết thúc** bắt buộc nhập ngày; chọn **Đóng thủ công** sẽ ẩn và vô hiệu hóa ô ngày. Máy chủ từ chối lưu nếu thiếu phương thức. Cả hai cách đều cho phép đóng sớm bằng nút **Đóng ngay**. Phải lưu phạm vi người nhận trước khi mở khảo sát.

## Gia hạn khảo sát đang mở

1. Trong danh sách, chọn **Gia hạn** tại khảo sát đang mở có ngày kết thúc. Khảo sát đóng thủ công không có nút **Đặt ngày kết thúc**; phương thức được chọn ngay khi tạo hoặc chỉnh sửa bản nháp.
2. Chỉ cần chọn ngày kết thúc mới. Biểu mẫu không yêu cầu thiết lập lại phương thức hạn; ngày mới phải muộn hơn hạn hiện tại và không nằm trong quá khứ.
3. Đọc thông báo ngày nhận câu trả lời và nhấn **Xác nhận gia hạn**.

Ngày mới không được nằm trong quá khứ. Gia hạn không cho rút ngắn hạn đang có. Không sửa câu hỏi hoặc thay phạm vi người nhận trong thao tác này.

## Mở lại khảo sát đã đóng

1. Chọn **Mở lại** tại khảo sát CLOSED.
2. Phương thức cũ được điền sẵn. Nếu hạn cũ đã qua, ngày mới mặc định là hôm nay; có thể chọn ngày muộn hơn hoặc chọn **Đóng thủ công**.
3. Kiểm tra hạn hiện tại và thời gian nhận câu trả lời sau khi mở lại, rồi chọn **Mở lại khảo sát**. Nhấn **Hủy** sẽ không lưu. Nếu máy chủ từ chối, lỗi xuất hiện ngay trong khung để sửa lại.

Ví dụ: hạn cũ 03/11/2026, hôm nay 04/11/2026. Đặt hạn mới 10/11/2026 thì khảo sát mở ngay, nhận bài đến hết 10/11 và tự đóng từ 00:00 ngày 11/11.

Khảo sát phải có phạm vi đã lưu và danh sách người nhận từ trước. Bài cũ chưa có phạm vi hoặc chưa từng có người nhận cần được lập thành bản nháp mới, thiết lập phạm vi rồi mở theo quy trình tạo khảo sát.

## Dữ liệu sau khi gia hạn hoặc mở lại

- Giữ nguyên câu hỏi, lựa chọn, câu trả lời và chi tiết câu trả lời đã có.
- Khách đã trả lời chỉ xem được bài đã gửi; không gửi lại lần thứ hai.
- Khách chưa trả lời thuộc danh sách người nhận có thể tiếp tục làm khi khảo sát đang mở.
- Phạm vi **Tất cả** bổ sung khách đang hoạt động đăng ký mới lúc mở lại và tiếp tục nhận khách mới trong thời gian mở.
- Phạm vi **Theo bộ lọc** và **Chọn từng khách** giữ danh sách người nhận ban đầu; không chạy lại bộ lọc hoặc bổ sung người khác.
- Trạng thái ẩn của khảo sát không bị thay đổi bởi gia hạn hoặc mở lại.

## Kết quả khảo sát

Kết quả khảo sát chỉ trình bày thông tin khảo sát, số người nhận, người đã làm, tỷ lệ hoàn thành và thống kê từng câu hỏi; không còn nút hoặc luồng **Lịch sử thay đổi** trong giao diện kết quả.

Việc mở lại chỉ điều chỉnh thời gian và trạng thái, không đổi nội dung. Nếu cần câu hỏi hoặc phạm vi khác, dùng **Lập khảo sát** để tạo bản nháp mới.

## Kiểm chứng

- `npm test`: 171 kiểm thử đạt.
- `node scripts/check-survey-lifecycle-db.js`: 144 kiểm tra HTTP/MySQL trên database cách ly, được dọn sau khi chạy.
- `node scripts/check-survey-workspace-db.js`: 36 kiểm tra phân trang, khoảng thời gian và biên đầu/cuối ngày.
- Đã thực hiện gia hạn và mở lại thành công trên giao diện thật trong môi trường cách ly.
