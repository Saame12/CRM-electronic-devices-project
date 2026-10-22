# Khôi phục mật khẩu do Admin xác minh

Chạy `npm start`. Server tự bổ sung bảng `password_recovery_requests` và cột `users.auth_version` nếu chưa có.

## Cách sử dụng

1. Khách chọn **Quên mật khẩu?** ở trang đăng nhập, nhập email, số điện thoại đã đăng ký và nội dung yêu cầu.
2. Khách giữ tab đang mở và ghi nhận **mã yêu cầu**. Mã này chỉ để đối chiếu khi liên hệ, không phải mật khẩu hay mã truy cập phiên.
3. Admin đăng nhập, mở **Yêu cầu đổi mật khẩu**. Số điện thoại hiển thị là số đã lưu trong DB, không dùng số liên hệ mới do người yêu cầu đưa ra để xác minh.
4. Admin liên hệ chủ tài khoản, xác minh đúng khách và đối chiếu mã yêu cầu khách đang thấy. Sau đó đánh dấu đã xác minh, ghi chú và chọn **Cho phép khách tự đổi mật khẩu**. Nhập đúng email và số điện thoại đơn thuần không được coi là đã xác minh.
5. Trong tối đa 5 giây, tab khách chuyển sang form **Mật khẩu mới / Nhập lại mật khẩu mới**. Khách lưu mật khẩu mới; không dùng mật khẩu tạm.
6. Sau khi cập nhật DB thành công, trạng thái chuyển **Hoàn tất**, có thời gian hoàn thành và thông báo chưa đọc ở Admin. Admin tự cập nhật tối đa mỗi 10 giây; có thể bấm **Cập nhật** ngay.

## Trạng thái và quy tắc

- Chờ xác minh có hạn 30 phút; sau khi duyệt, quyền đổi có hạn 15 phút và chỉ dùng một lần.
- Có thể từ chối yêu cầu với ghi chú. Yêu cầu không khớp tài khoản khách đang hoạt động không được duyệt.
- Phiên đổi mật khẩu được giữ trong sessionStorage của tab gửi yêu cầu. Nếu mất phiên, khách cần gửi yêu cầu mới; biết email hoặc mã đối chiếu không đủ để tự đổi mật khẩu.
- Khi đổi thành công, các yêu cầu khác đang chờ/được duyệt của cùng tài khoản hết hiệu lực; các phiên đăng nhập cũ cũng hết hiệu lực. Khách đăng nhập lại bằng mật khẩu mới.
- Chỉ Admin được xử lý yêu cầu; Quản lý và Khách hàng không được truy cập API quản trị.
- Mật khẩu được băm bcrypt. Admin không xem được mật khẩu mới. Mã phiên yêu cầu chỉ được lưu dạng băm ở DB, không hiển thị cho Admin.
- Không dùng email/SMTP, không tự thay mật khẩu khi khách mới gửi yêu cầu hoặc khi Admin mới duyệt.

## Kiểm tra

`node --test scripts/recovery.test.js scripts/birth-date.test.js scripts/reports.test.js`

`node scripts/check-recovery-db.js` bổ sung cấu trúc còn thiếu, sau đó kiểm tra truy vấn trên bảng TEMPORARY tách riêng; không đổi mật khẩu hoặc dữ liệu tài khoản thật. Bảng kiểm thử tự mất khi đóng kết nối.
