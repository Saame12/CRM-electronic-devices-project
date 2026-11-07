# Luồng phản hồi, xóa khách hàng và khảo sát

## Phản hồi của khách hàng

- Khách chỉ sửa hoặc xóa phản hồi của chính mình, kể cả sau khi Quản lý đã trả lời.
- Xóa phản hồi sẽ xóa cả câu trả lời Quản lý nằm trong phản hồi đó.
- Sửa nội dung sẽ xóa câu trả lời cũ, bỏ trạng thái ẩn và chuyển lại **Tiếp nhận**, để tránh giữ câu trả lời không còn phù hợp với nội dung mới.
- Chưa có câu trả lời: **Tiếp nhận**. Quản lý nhập câu trả lời và gửi: tự chuyển **Đã giải quyết**.
- Mỗi phiên bản phản hồi chỉ được Quản lý trả lời một lần. Nếu khách sửa trong lúc Quản lý đang soạn, máy chủ từ chối lưu câu trả lời dựa trên nội dung cũ và yêu cầu tải lại.
- Các trạng thái cũ được quy đổi theo câu trả lời thực tế; database chỉ còn hai trạng thái nghiệp vụ.

## Khóa rồi mới xóa khách hàng

1. Khách đang hoạt động: nhấn **Khóa**. Chưa khóa thì nút Xóa bị vô hiệu hóa; gọi API trực tiếp cũng bị từ chối.
2. Khách đã khóa: nhấn **Xóa**, đọc xác nhận rồi thực hiện.
3. Hệ thống xóa email, số điện thoại, địa chỉ, mật khẩu và dữ liệu khôi phục tài khoản. Tài khoản không thể đăng nhập hoặc mở khóa lại.
4. Giữ họ tên, ngày sinh, giới tính, nhu cầu, sở thích, phản hồi, người nhận khảo sát, câu trả lời và chi tiết trả lời để báo cáo không mất lịch sử.

Bản ghi hồ sơ lưu trữ vẫn giữ mã liên kết và các mốc kỹ thuật cần thiết để nhận diện dữ liệu lịch sử; không còn là tài khoản đăng nhập. Nếu thao tác xóa thất bại, toàn bộ giao dịch được hoàn tác. Quy tắc khóa trước áp dụng cho cả thao tác xóa khách từ Quản lý và xóa tài khoản khách từ Admin.

## Nút theo trạng thái khảo sát

| Trạng thái | Các nút |
|---|---|
| Bản nháp | Sửa, Xóa, Mở khảo sát |
| Đang mở | Đóng ngay, Gia hạn, Khóa khẩn cấp, Xem khảo sát |
| Đã đóng | Xem chi tiết, Lập khảo sát, Mở lại, Ẩn khảo sát |

- **Mở khảo sát:** chỉ khả dụng khi đã lưu phạm vi người nhận.
- **Gia hạn:** vô hiệu hóa nếu khảo sát đóng thủ công, không có hạn để gia hạn.
- **Khóa khẩn cấp:** chỉ thực hiện khi chưa có bài trả lời; chuyển về bản nháp và dừng nhận bài. Sau đó mới được sửa hoặc xóa. API sửa trực tiếp khảo sát đang mở bị từ chối.
- **Xem khảo sát:** chỉ đọc nội dung, không có trường chỉnh sửa.
- **Xem chi tiết:** báo cáo tổng người nhận, người đã làm, tỷ lệ hoàn thành, số câu hỏi; mỗi câu có số người trả lời/bỏ qua, số người chọn và tỷ lệ. Câu đánh giá có điểm trung bình; câu văn bản có ý kiến và phần xem từng bài trả lời.
- **Lập khảo sát:** tạo bản nháp mới từ câu hỏi cũ để chỉnh sửa theo quy trình tạo khảo sát.
- **Ẩn khảo sát:** dọn khỏi danh sách làm việc, không xóa câu hỏi hoặc kết quả. Trong danh sách đã ẩn có thể khôi phục.

Nút khách hàng xem khảo sát đã trả lời được đổi thành **Xem câu trả lời đã gửi**. Nhãn trạng thái trên giao diện và báo cáo hiển thị bằng tiếng Việt; mã kỹ thuật trong API/database không đổi sang tiếng Việt.

## Kiểm chứng

- 161 kiểm thử tự động đạt.
- 102 kiểm tra HTTP/MySQL trên database cách ly đạt, gồm quyền sở hữu phản hồi, phiên bản câu trả lời, khóa trước khi xóa, bảo toàn dữ liệu và thao tác khảo sát.
- Cài mới qua CLI trong thư mục sạch nạp V3 thành công; chạy lại không ghi đè dữ liệu.
- Đã kiểm tra giao diện thật và so sánh số bản ghi nghiệp vụ trước/sau migration. Không xóa khách hay phản hồi đang sử dụng để thử nghiệm.
- Bản sao lưu trước khi áp dụng: `data/backups/before-business-workflow-20261107.sql`. README giữ nguyên.
