# Bộ demo khách hàng đủ hồ sơ — 12/11/2026

Đây là bộ V3 hiện hành đã điều chỉnh theo quy định bắt buộc ngày sinh, giới tính và xác nhận nhu cầu. Người cài mới bằng `npm run setup` trên database trống cũng nhận quy tắc dữ liệu này.

## Thông tin khách hàng

Cả **18 khách** đều có:

- Họ tên, email riêng, số điện thoại hợp lệ và mật khẩu đã băm khi lưu.
- Địa chỉ, ngày sinh có thật và tuổi tròn trong khoảng 0–120, giới tính Nam/Nữ/Khác.
- Nhu cầu cụ thể, `need_confirmed = TRUE`, ít nhất một sở thích hợp lệ.
- Trạng thái `ACTIVE` để đăng nhập và sử dụng khảo sát/phản hồi ngay.

Không còn tài khoản demo cố ý thiếu ngày sinh, địa chỉ, giới tính hoặc chưa xác nhận nhu cầu. Các ca thiếu dữ liệu/khóa tài khoản vẫn có thể được tạo trong các kiểm thử riêng; không trộn vào bộ dùng thử hiện hành.

| Tài khoản | Mật khẩu demo |
|---|---|
| `khach@demo.vn` | `123456` |
| `khach2@demo.vn` đến `khach18@demo.vn` | `123456` |
| `manager@demo.vn`, `manager2@demo.vn` | `Manager@123` |
| `admin@backline.vn` | `Admin@123` |

Đây là thông tin giả lập để chạy thử cục bộ. Các tài khoản khách đã được kiểm tra đăng nhập và đọc hồ sơ, khảo sát, phản hồi, lịch sử gửi thành công qua API. Không cần hoàn thiện hồ sơ lần đầu đối với bộ demo này.

## Dữ liệu nghiệp vụ đi kèm

| Nội dung | Số lượng khi tạo |
|---|---:|
| Tài khoản | 21 |
| Khách hàng | 18 |
| Sản phẩm | 14 |
| Phản hồi | 54 |
| Khảo sát | 16 |
| Câu hỏi | 28 |
| Lượt trả lời khảo sát | 21 |
| Chi tiết câu trả lời | 47 |
| Quyền nhận khảo sát | 135 |
| Liên kết khách–sở thích | 34 |
| Bản ghi vòng đời khảo sát | 5 |

Giữ các trạng thái Nháp/Mở/Đóng, phạm vi ALL/FILTER/SELECTED, khảo sát có hạn/đóng thủ công, gia hạn và mở lại để thử quy trình. Ngày khảo sát được tính theo thời điểm tạo dữ liệu, không gắn cứng vào một đợt thử cũ.

## Bộ đã nạp và cách khôi phục

- SQL của lần tạo này: [Du_lieu_demo_CRM_v3_20261112060733_436de4.sql](../outputs/Du_lieu_demo_CRM_v3_20261112060733_436de4.sql).
- Metadata kiểm chứng nằm ở file `.sql.json` cùng tên.
- [demo-v3-manifest.json](../outputs/demo-v3-manifest.json) ghi database mới, database trước đó, bản sao lưu và đường dẫn SQL. File manifest sẽ được cập nhật nếu tạo bộ demo lần tiếp theo.
- Database cũ và bản sao lưu được giữ lại; không xóa dữ liệu cũ để tạo bộ mới. Ứng dụng đã được chuyển sang database mới qua cấu hình cục bộ.
- Các file SQL V2/V3 xuất từ những lần trước là dữ liệu lịch sử, có thể còn hồ sơ cố ý thiếu trường. Dùng SQL ở trên cho bộ đủ hồ sơ này.
- `npm run setup` trên database đã có dữ liệu không tự ghi đè thành bộ mới.

Sau khi chuyển bộ dữ liệu, tải lại trang và đăng nhập bằng tài khoản demo; phiên đăng nhập gắn với mã tài khoản của database trước không tiếp tục dùng cho database mới.

## Kết quả kiểm tra

- 187 kiểm thử tự động đạt.
- 231 kiểm tra HTTP/MySQL trên database thử riêng đạt, gồm các trường hợp ngày sinh/tuổi/giới tính không hợp lệ.
- Kiểm tra cài mới và setup lặp lại đạt.
- 180 kiểm tra trên bộ vừa nạp đạt: 18 khách đăng nhập, đủ hồ sơ, xác nhận nhu cầu và truy cập được các API cá nhân, khảo sát, phản hồi.

