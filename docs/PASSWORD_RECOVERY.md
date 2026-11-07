# Khôi phục mật khẩu bằng mã cá nhân

Không cần SMTP/email/SMS. Luồng mặc định xác minh mã bí mật khách đã lưu; Admin nhận thông báo sau khi đổi mật khẩu thành công.

## Cấp và lưu mã

- Đăng ký mới: backend tạo mã cùng transaction tạo tài khoản. Mã hiển thị trong trang thông tin cá nhân sau khi khách bấm OK ở thông báo hoàn thiện hồ sơ.
- Tài khoản cũ hoặc cần mã mới: đăng nhập, bấm tên khách, mở mục Mã khôi phục tài khoản, nhập mật khẩu hiện tại và chọn Tạo mã khôi phục mới.
- Mã có 128 bit ngẫu nhiên, dạng 8 nhóm 4 ký tự; chỉ hiển thị lúc cấp. Bấm Tôi đã lưu mã để ẩn.
- Lưu mã ở nơi riêng tư bên ngoài ứng dụng. Không gửi cho Admin hoặc người khác.
- Không lưu mã thô trong MySQL, localStorage, sessionStorage, tài liệu GitHub hay dữ liệu demo.
- Tạo mã mới vô hiệu hóa mã cũ và các phiên khôi phục bằng mã cũ.

## Khi quên mật khẩu

1. Chọn Quên mật khẩu? và nhập email + mã khôi phục.
2. Hệ thống đối chiếu bản băm với đúng khách hàng đang hoạt động; không cần Admin duyệt.
3. Phiên đặt lại mật khẩu có hạn 15 phút và chỉ dùng một lần. Việc chỉ nhập đúng mã chưa làm thay đổi mật khẩu.
4. Nhập Mật khẩu mới và Nhập lại mật khẩu mới; ít nhất 6 ký tự, tối đa 72 byte.
5. Sau khi lưu thành công, mã cá nhân bị tiêu thụ, các phiên đăng nhập cũ và các yêu cầu đổi mật khẩu khác hết hiệu lực.
6. Hệ thống tự cấp mã khôi phục mới trong cùng giao dịch đổi mật khẩu, áp dụng cả khi Admin hỗ trợ. Mã hiển thị một lần ngay trên trang thành công; lưu mã rồi bấm Tôi đã lưu mã — Đăng nhập.

Nếu tải lại/đóng trang thành công trước khi lưu, không thể lấy lại mã thô từ lịch sử. Khách có thể đăng nhập bằng mật khẩu mới để tạo mã khác trong hồ sơ. Admin không xem được mã mới.

Mã đang lưu không tự hết hạn theo ngày; nó hết hiệu lực khi đã dùng, khi thay mã hoặc khi được hỗ trợ đặt lại mật khẩu.
Nếu người dùng tạo hai phiên từ cùng mã, chỉ lần hoàn tất đầu tiên được chấp nhận.

## Admin

Mở Thông báo & lịch sử tương tác:
- Tên/email khách, mã tham chiếu yêu cầu (không phải mã khôi phục), cách xác minh, thời gian tiếp nhận/hoàn tất, kết quả.
- Thông báo chưa đọc sau khi đổi mật khẩu thành công; nút Đánh dấu đã đọc.
- Tìm kiếm tên/email/mã tham chiếu, lọc trạng thái và chưa đọc.
- Giới hạn 200 tương tác gần nhất; tự cập nhật mỗi 10 giây khi Admin đăng nhập.
- Không hiển thị mật khẩu, token phiên, mã cá nhân hoặc bản băm của chúng.

## Khách cũ chưa có mã hoặc đã mất mã

- Nếu còn đăng nhập được: tạo mã trong thông tin cá nhân.
- Nếu không còn đăng nhập: chọn Tôi chưa có hoặc đã mất mã và gửi yêu cầu hỗ trợ.
- Admin xử lý trong mục Hỗ trợ khách chưa có / đã mất mã, tách khỏi bảng thông báo chính.
- Admin phải liên hệ theo thông tin đã lưu, xác minh đúng chủ tài khoản và đối chiếu mã yêu cầu.
  Việc khớp email, số điện thoại hoặc ngày sinh đơn thuần không đủ để tự duyệt.
- Chỉ sau khi Admin xác minh, khách mới tự nhập mật khẩu mới. Admin không đặt hoặc xem mật khẩu.
- Đặt lại qua hỗ trợ cũng vô hiệu hóa mã cá nhân cũ.

## Cập nhật database

Khởi động lại server. password-recovery.ensureSchema tự bổ sung:
- Bảng customer_recovery_codes: một bản băm mã hiện hành trên mỗi khách, thời gian tạo và thời gian sử dụng.
- Hai cột verification_method và recovery_code_hash trong password_recovery_requests để xác định phương thức và ràng buộc phiên đặt lại.

Không xóa yêu cầu, tài khoản hoặc lịch sử cũ. Các bản ghi cũ mặc định phương thức MANUAL.
Mã cho khách demo không được phát hành công khai: đăng nhập bằng tài khoản demo rồi tự tạo trong hồ sơ.

## Kiểm thử

```powershell
npm test
node scripts/check-recovery-codes-db.js
node scripts/check-recovery-db.js
```

Hai script MySQL chỉ thay đổi mật khẩu/mã của dữ liệu kiểm thử trong bảng TEMPORARY, không thay đổi thông tin đăng nhập khách thật.
Chúng có thể tạo bảng/cột còn thiếu như khi khởi động server.
Bộ kiểm tra mới bao gồm cấp mã, tạo mã lúc đăng ký, rollback đăng ký trùng, mã sai/đã dùng/bị thay thế,
phiên hết hạn, tiêu thụ một lần, thu hồi phiên cũ và thông báo không lộ bí mật.

