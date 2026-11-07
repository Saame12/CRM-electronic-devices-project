# Quản lý khảo sát với danh sách lớn

## Danh sách và bộ lọc

- Bốn tab: **Tất cả, Đang mở, Đã đóng, Bản nháp**, kèm số lượng.
- Tìm theo tiêu đề hoặc mô tả; nhấn Enter hoặc nút Tìm kiếm.
- Lọc khoảng thời gian: chọn **Ngày tạo khảo sát** hoặc **Ngày kết thúc**, nhập **Từ ngày / Đến ngày** rồi Tìm kiếm. Tính cả đầu và cuối ngày đã chọn, cho phép chỉ nhập một đầu mốc; từ ngày không được lớn hơn đến ngày. Khi lọc ngày kết thúc, khảo sát đóng thủ công không có ngày kết thúc không nằm trong khoảng kết quả.
- Mặc định 20 dòng mỗi trang, có thể chọn 10, 20, 50 hoặc 100. Máy chủ chỉ trả trang được yêu cầu.
- Số đếm của các tab áp dụng đồng thời cho từ khóa, khoảng thời gian và danh sách thường/đã ẩn đang chọn. Xóa bộ lọc để bỏ từ khóa và khoảng ngày; vẫn giữ tab trạng thái.
- Trong phiên sử dụng, quay lại tab sẽ giữ trang và vị trí đã xem của tab đó. Đăng xuất hoặc đổi tài khoản sẽ xóa trạng thái xem và dữ liệu cũ.

## Một nút chính và menu Thao tác

| Trạng thái | Nút chính | Menu Thao tác |
|---|---|---|
| Bản nháp | Sửa | Xóa, Mở khảo sát |
| Đang mở | Xem khảo sát | Gia hạn, Đóng ngay, Khóa khẩn cấp |
| Đã đóng | Xem chi tiết | Lập khảo sát, Mở lại, Ẩn khảo sát |
| Danh sách đã ẩn | Xem chi tiết | Khôi phục khảo sát |

Điều kiện nghiệp vụ được giữ: bản nháp phải có phạm vi trước khi mở; chỉ gia hạn bài có hạn; chỉ khóa khẩn cấp khi chưa có bài trả lời; chỉ xóa bản nháp.

## Khung thao tác riêng

- Xem, báo cáo kết quả, tạo, sửa, gia hạn và mở lại dùng khung bên phải, không chèn lên đầu danh sách.
- Khung có vùng cuộn độc lập. Thanh tiêu đề, nút Đóng và thanh thao tác phía dưới luôn nằm ngoài vùng cuộn nội dung.
- Có thể mở rộng toàn màn hình bằng nút ở góc trên; trên màn hình nhỏ khung tự dùng toàn bộ chiều rộng.
- Đóng khung hoặc nhấn Escape trở về đúng danh sách đang xem, giữ tab, từ khóa, trang và vị trí cuộn.
- Nếu có thay đổi chưa lưu, giao diện yêu cầu chọn **Tiếp tục chỉnh sửa** hoặc **Bỏ thay đổi và đóng**. Chỉ đóng khung không tự lưu.
- Lưu thành công sẽ đóng khung, cập nhật dòng và số lượng, giữ vị trí danh sách. Dòng vừa thao tác được đánh dấu nhẹ khi còn nằm trong kết quả lọc.
- Nếu đóng/ẩn/xóa khiến dòng rời tab hiện tại, danh sách cập nhật theo bộ lọc đang dùng. Nếu trang cuối hết dòng, máy chủ tự chuyển về trang hợp lệ gần nhất.
- Đóng khung trong lúc đang tải sẽ hủy quyền hiển thị của kết quả tải đó; phản hồi đến muộn không tự mở khung trở lại.

## Kiểm chứng

- 166 kiểm thử tự động đạt.
- 102 kiểm tra nghiệp vụ HTTP/MySQL đạt trên database cách ly.
- 26 kiểm tra API phân trang với đúng 100 khảo sát: 25 đang mở, 25 đã đóng, 50 nháp; không lặp dòng giữa 5 trang, đếm đúng theo tab, kiểm tra đầu vào và trang rỗng.
- Đã thao tác trên giao diện thật với bộ 100 khảo sát cách ly: xem ở cuối trang 2 rồi đóng giữ nguyên vị trí cuộn; sửa/lưu dòng cuối danh sách giữ nguyên vị trí; cảnh báo chưa lưu hoạt động.
- Sau kiểm tra đã dọn database và máy chủ cách ly. Database đang sử dụng không được bổ sung các khảo sát kiểm thử.
- Máy chủ đang dùng đã được cập nhật; README giữ nguyên.
