# Bộ dữ liệu thử Backline CRM v2

Ngày nạp: **04/11/2026**. Đã thay bộ dữ liệu đang chạy và khởi động lại chương trình tại **http://localhost:3000**. Đăng xuất/tải lại trang rồi đăng nhập bằng tài khoản mẫu bên dưới để tránh dùng phiên của bộ cũ.

## Tài khoản dùng ngay

| Vai trò | Email | Mật khẩu | Trang |
| --- | --- | --- | --- |
| Admin | admin@backline.vn | Admin@123 | /admin.html |
| Quản lý | manager@demo.vn | Manager@123 | /manager.html |
| Quản lý hỗ trợ | manager2@demo.vn | Manager@123 | /manager.html |
| Khách chính, 18 tuổi, Gaming/Lập trình | khach@demo.vn | 123456 | / |
| Khách đăng ký sau lúc khảo sát mở | khach18@demo.vn | 123456 | / |

Các tài khoản khách còn lại dùng `khach2@demo.vn` đến `khach18@demo.vn`, cùng mật khẩu `123456`. Toàn bộ thông tin cá nhân và tương tác là dữ liệu giả lập.

## Quy mô

| Dữ liệu | Số lượng |
| --- | ---: |
| Tài khoản | 21: 1 Admin, 2 Quản lý, 18 khách |
| Sản phẩm | 14 |
| Liên kết sở thích | 32 |
| Phản hồi | 54 |
| Khảo sát | 12 |
| Câu hỏi / lựa chọn | 24 / 32 |
| Người nhận theo từng phiếu | 83 |
| Lượt nộp / chi tiết đáp án | 18 / 44 |

## Các phiếu để thử quy trình

| Phiếu | Trạng thái / phạm vi | Mục đích thử |
| --- | --- | --- |
| Mức độ hài lòng về dịch vụ | OPEN, Tất cả, còn hạn, chưa ai trả lời | Khách đang có và đăng ký mới đều nhận; có thể về DRAFT để sửa |
| Nhu cầu mua sắm PC và laptop | OPEN, Tất cả, có 4 bài | Không sửa nội dung/phạm vi khi đã có bài; khách chính xem lại bài đã gửi |
| Trải nghiệm bảo hành và hỗ trợ | CLOSED, Tất cả, 8 bài; đã ẩn phía Quản lý | Xem khảo sát đã ẩn, xem kết quả và khách xem lại bài sau khi đóng |
| Khảo sát ý tưởng ưu đãi thành viên | DRAFT, đã lưu bộ lọc 15–20 tuổi, Gaming/Đồ họa | Mở editor thấy lại bộ lọc; có thể mở theo phạm vi đã lưu |
| Đánh giá trải nghiệm mua hàng tháng trước | OPEN nhưng đã quá hạn, 3 bài | Chặn nộp mới và không cấp cho khách đăng ký sau |
| Khảo sát chương trình chăm sóc khách hàng | CLOSED, chọn 3 khách, chưa có bài | Xem trạng thái rỗng, sao chép thành nháp mới |
| Khảo sát Gaming/Đồ họa 15–20 tuổi | OPEN, Theo bộ lọc, 7 người nhận, 2 bài | Chỉ đúng tuổi và có ít nhất một sở thích Gaming/Đồ họa |
| Khảo sát khách được chọn riêng | OPEN, chọn đúng 3 khách, 1 bài | Chỉ khach@demo.vn, khach6@demo.vn, khach14@demo.vn nhận |
| [Bản nháp] Chưa thiết lập phạm vi | DRAFT, chưa có phạm vi | Không được mở cho đến khi chọn phạm vi |
| [Bản nháp] Đã chọn Tất cả | DRAFT, Tất cả | Mở trực tiếp từ danh sách, không cần gửi lại lần hai |
| [Bản nháp] Đã chọn từng khách | DRAFT, đã chọn 3 khách | Kiểm tra lưu/khôi phục danh sách được chọn trong editor |
| Khảo sát khách hàng 25–45 tuổi | OPEN, Theo bộ lọc, 4 người nhận | Thử một nhóm tuổi khác, tách khỏi nhóm 15–20 |

**Không có phiếu OPEN thiếu phạm vi trong bộ mới**, nên không xuất hiện bước bổ sung người nhận cho khảo sát mới. Bản nháp có thể chưa có phạm vi, nhưng phải chọn trước khi mở. Ngoại lệ dữ liệu cũ được kiểm thử riêng trong bộ test, không trộn vào dữ liệu dùng thử này.

## Khách và điều kiện lọc đáng thử

Tuổi tính theo ngày sinh tại thời điểm nạp, sau đó tăng theo lịch thực.

| Email | Tình huống |
| --- | --- |
| khach2@demo.vn | 14 tuổi, ngày mai đủ 15: chưa thuộc nhóm 15–20 tại lúc nạp |
| khach3@demo.vn | Vừa đủ 15 tuổi: thuộc nhóm 15–20 |
| khach6@demo.vn | Vừa đủ 20 tuổi: thuộc nhóm 15–20 |
| khach7@demo.vn | 20 tuổi, ngày mai đủ 21: còn thuộc nhóm 15–20 tại lúc nạp |
| khach8@demo.vn | Vừa đủ 21 tuổi: ngoài nhóm 15–20 |
| khach11@demo.vn | 19 tuổi nhưng LOCKED: không đăng nhập và không nằm trong nhóm nhận mới |
| khach12@demo.vn | Thiếu địa chỉ: thử luồng hoàn thiện hồ sơ |
| khach13@demo.vn | 16 tuổi, Học tập/Văn phòng: không khớp bộ lọc Gaming/Đồ họa |
| khach17@demo.vn | Chưa có ngày sinh/sở thích: không bị gán tuổi giả vào nhóm |
| khach18@demo.vn | Tạo sau khi hai phiếu Tất cả được mở: nhận đúng hai phiếu đó, không nhận nhóm riêng hoặc phiếu hết hạn |

Phản hồi có đủ NEW/IN_PROGRESS/RESOLVED, điểm 1–5, các loại phản hồi và trường hợp đã ẩn. Các câu trả lời có đủ ONE/MULTI/TEXT/RATING và câu tùy chọn bỏ trống.

## Tệp dữ liệu, bản sao lưu và kiểm chứng

- SQL bộ mới: `outputs/Du_lieu_demo_CRM_v2_20261104.sql`; metadata checksum/số dòng: tệp `.sql.json` đi kèm. Đây là bản dump cấu trúc và dữ liệu; nếu nhập thủ công, chọn database thử trống trước khi chạy.
- Database đang dùng: `backline_crm_demo_v2_20261104124703_4e1565`. `.env` và `.env.demo` đã cùng trỏ tới database này. MySQL Workbench cần chọn đúng schema mới.
- Database cũ `backline_crm` đã được gỡ theo yêu cầu. Bản cuối đã sao lưu và khôi phục thử thành công tại `data/backups/retired-dataset-157a4acca128bade.sql` cùng metadata; không đưa bản sao lưu dữ liệu cũ lên repository công khai.
- `outputs/demo-v2-manifest.json` ghi phiên bản, số lượng, danh sách phiếu và các đường dẫn trên.
- Kiểm thử mã: **136/136 đạt**. HTTP/MySQL cách ly: **182/182 đạt**. Cài mới/chạy lại giữ dữ liệu: đạt. Kiểm tra trực tiếp máy chủ đang chạy: `npm run demo:check` đạt cả ba vai trò, phạm vi/bộ lọc, đăng ký sau, xem bài đã đóng, số liệu báo cáo và phân quyền.

Nguồn bộ mẫu mới nằm ở `database/demo-data.js`, được seed qua `scripts/seed-demo.js`. Chạy lại setup trên database đã có marker v2 sẽ giữ các chỉnh sửa dùng thử, không nhân đôi dữ liệu. Khi cần tạo một bộ hoàn toàn mới nữa, có thể chạy `node scripts/create-demo-v2.js`, sau đó khởi động lại server; lệnh này tạo database mới và chuyển cấu hình, không trộn các bộ dữ liệu.
