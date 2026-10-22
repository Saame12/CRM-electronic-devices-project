# Backline CRM — Node.js & MySQL

## Chạy bản demo sau khi tải từ GitHub

Bản demo là dữ liệu giả lập được lưu thật trong MySQL, không phải dữ liệu khách hàng thật hoặc nội dung giao diện giả.
Dữ liệu MySQL trên máy tác giả không tự đi kèm GitHub; bộ seed trong database/demo-data.js sẽ tạo lại dữ liệu ở máy người tải.

Yêu cầu: Node.js 20.19+ (khuyến nghị Node.js 24 LTS), npm, MySQL 8.0+ đang chạy.
Không thể chạy toàn bộ hệ thống chỉ bằng cách mở index.html hoặc dùng GitHub Pages vì cần backend và MySQL.

Mở Terminal trong thư mục tải về:

```powershell
npm ci
npm run demo:setup
npm run demo:start
```

- demo:setup tự tạo file .env.demo riêng; không ghi đè .env đang có.
- Nếu máy chưa có .env, thông tin mặc định là root, cổng 3306, mật khẩu rỗng.
  Nếu MySQL có mật khẩu hoặc dùng cổng khác, mở .env.demo, sửa DB_USER/DB_PASSWORD/DB_PORT,
  rồi chạy lại npm run demo:setup. Không đưa .env.demo lên GitHub.
- Nếu đã có .env, lần đầu sẽ dùng thông tin kết nối MySQL từ đó nhưng chọn database riêng backline_crm_demo
  và tạo JWT_SECRET ngẫu nhiên riêng. File .env chính không thay đổi.
- Người dùng MySQL cần quyền tạo database/bảng. Có thể đổi DB_NAME trong .env.demo sang database demo khác;
  tên phải có chữ demo để hạn chế dùng nhầm.
- Nếu cổng 3000 đã có chương trình khác, đổi PORT trong .env.demo hoặc dừng server cũ.
- npm run demo:start sử dụng .env.demo; npm start vẫn sử dụng .env của hệ thống chính.

### Tài khoản để tương tác ngay

| Vai trò | Email | Mật khẩu | Địa chỉ mặc định |
| --- | --- | --- | --- |
| Admin | admin@backline.vn | Admin@123 | http://localhost:3000/admin.html |
| Quản lý | manager@demo.vn | Manager@123 | http://localhost:3000/manager.html |
| Khách hàng | khach@demo.vn | 123456 | http://localhost:3000/ |
| Quản lý bổ sung | manager2@demo.vn | Manager@123 | http://localhost:3000/manager.html |
| Khách chưa hoàn thiện hồ sơ | khach12@demo.vn | 123456 | http://localhost:3000/ |
| Khách bị khóa để thử kiểm tra đăng nhập | khach11@demo.vn | 123456 | Bị từ chối đăng nhập |

Các khách còn lại: khach2@demo.vn đến khach12@demo.vn, mật khẩu 123456.
Khách chính khach@demo.vn có hồ sơ đầy đủ và số điện thoại demo 0901234567,
có thể xem khảo sát ngay hoặc tự gửi yêu cầu quên mật khẩu để thử luồng xác minh Admin.
Các thông tin tên, địa chỉ, phản hồi và câu trả lời đều là giả lập. Không liên hệ các số điện thoại demo.

### Bộ dữ liệu bao gồm

- 15 tài khoản: 1 Admin, 2 Quản lý, 12 Khách hàng, gồm khách bị khóa và hồ sơ còn thiếu.
- 14 sản phẩm, 36 phản hồi đủ loại/điểm/trạng thái, có phản hồi đã xử lý và phản hồi đã ẩn.
- 6 khảo sát, 15 câu hỏi đủ bốn loại và các lựa chọn tương ứng.
- 55 lượt gửi, 17 lượt hoàn thành, 52 dòng chi tiết câu trả lời để báo cáo có số liệu.
- 2 bản ghi lịch sử khôi phục mật khẩu giả lập, không chứa token có thể sử dụng.
  Để thử đổi mật khẩu thực sự, gửi một yêu cầu mới từ trang đăng nhập.

Ba khảo sát theo yêu cầu đều nằm thật trong DB:
Mức độ hài lòng về dịch vụ; Nhu cầu mua sắm PC và laptop; Trải nghiệm bảo hành và hỗ trợ.
Ngoài ra có bản nháp để chỉnh sửa/gửi, khảo sát quá hạn chưa trả lời và khảo sát đóng không có câu trả lời.
Ngày tạo/hạn khảo sát được tính theo ngày cài demo, không cố định ở năm 2026.

### Những thao tác có thể thử

1. Admin: xem/tìm/lọc tài khoản, thêm/xóa tài khoản chưa có lịch sử, xác minh yêu cầu đổi mật khẩu mới.
2. Quản lý: xem hồ sơ, thêm/khóa khách, xử lý/ẩn/khôi phục phản hồi, tạo/sửa/gửi/đóng/sao chép khảo sát.
3. Khách: trả lời khảo sát đang mở, gửi phản hồi, cập nhật hồ sơ, ẩn/bỏ ẩn khảo sát.
4. Báo cáo: xem số liệu khách hàng, chất lượng phản hồi, tỷ lệ hoàn thành và chi tiết từng câu trả lời.

Thay đổi trên giao diện được lưu thật vào database demo. Chạy lại demo:setup không nhập trùng,
không mở lại khảo sát đã đóng, không đặt lại mật khẩu và không ghi đè dữ liệu đã chỉnh.
Nếu database có dữ liệu nhưng chưa có dấu cài demo, lệnh sẽ từ chối trộn dữ liệu.
Muốn bộ demo hoàn toàn mới, đổi DB_NAME trong .env.demo sang tên demo khác rồi chạy lại setup;
không cần xóa database cũ.

Kiểm tra backend demo đang chạy:

```powershell
npm run demo:check
# Nếu đổi cổng:
npm run demo:check -- http://127.0.0.1:3001
```

Lệnh kiểm tra chỉ đọc qua API, dành cho database demo chưa thay đổi so với bộ ban đầu.

### Đưa lên GitHub an toàn

Commit mã nguồn, database/schema.sql, database/demo-data.js, database/catalog.js,
database/real-surveys.js, scripts/, package.json, package-lock.json, .env.example và tài liệu.
Không commit .env, .env.demo, file env cũ, node_modules/, .vs/, hoặc bản xuất dữ liệu khách hàng thực.
.gitignore đã khai báo các mục này. Nếu file bí mật từng được Git theo dõi, thêm .gitignore chưa đủ:
cần gỡ khỏi danh sách theo dõi trước khi đẩy và thay các bí mật đã bị lộ.
Bộ tài khoản demo công khai chỉ dùng cho máy cục bộ/đồ án, không triển khai nguyên trạng lên Internet.



## Chạy trong Visual Studio / Terminal

1. Cài Node.js LTS và MySQL. Sau khi cài Node, đóng rồi mở lại Terminal.
2. Chạy npm install trong thư mục dự án.
3. Tạo .env theo cấu hình bên dưới; không đưa .env lên Git.
4. Với cơ sở dữ liệu mới: chạy npm run db:setup. Không chạy lại bước này chỉ để cập nhật giao diện.
5. Khởi động bằng npm start.
6. Khách hàng: http://localhost:3000/
7. Admin: http://localhost:3000/admin.html
8. Quản lý: http://localhost:3000/manager.html

```dotenv
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=backline_crm
DB_USER=root
DB_PASSWORD=mat_khau_mysql_cua_ban
JWT_SECRET=chuoi_bi_mat_dai_va_ngau_nhien
```

Nếu gặp ECONNREFUSED 127.0.0.1:3306, kiểm tra dịch vụ MySQL đang chạy và cổng DB_PORT.
Nếu báo Unknown database, kiểm tra DB_NAME và bước thiết lập cơ sở dữ liệu.
node server.js được giữ làm lối vào tương thích, chạy cùng backend MySQL với npm start;
không còn backend JSON độc lập.

## Phân quyền

- Admin: tài khoản và xác minh yêu cầu khôi phục mật khẩu. Chọn vai trò khi tạo tài khoản, không đổi vai trò tài khoản đang có.
- Quản lý: khách hàng, phản hồi, khảo sát, báo cáo. Hồ sơ cá nhân được xem qua hộp thoại chỉ đọc; không có luồng sửa hồ sơ của khách hàng.
- Khách hàng: trang riêng, cookie HttpOnly, hoàn thiện hồ sơ và thực hiện khảo sát.
- Quản lý đăng nhập từ admin.html được chuyển sang manager.html. manager.html không nhận đăng nhập Admin.
- Kiểm tra quyền API phía máy chủ được giữ độc lập với việc ẩn/hiện nút trên giao diện.

## Cấu trúc Admin / Quản lý

```text
admin.html / manager.html
  admin.js                Phiên, API, phân vai đăng nhập, render dùng chung
  role-ui.js              Giao diện điều hướng, tài khoản, khách hàng, tổng quan, phản hồi
  staff-surveys.js         Giao diện danh sách, tạo và chỉnh sửa khảo sát
  staff-controller.js      Nạp dữ liệu, bản đồ thao tác và biểu mẫu, một bộ xử lý sự kiện chung
  reports.js               Ba nhóm báo cáo, xuất CSV, in, thống kê câu hỏi
  recovery-admin.js        Duyệt yêu cầu khôi phục mật khẩu và thông báo
  customer-details.js      Hộp thoại hồ sơ chỉ đọc
  staff-bootstrap.js       Khởi động sau khi tất cả module đã được tải

admin.css                  Hệ thiết kế chung cho cả hai vai trò
public-assets.js           Danh sách tài nguyên được phục vụ cho trình duyệt
server.mysql.js            Backend Express / MySQL đang sử dụng
reports-service.js         Tổng hợp và truy vấn báo cáo
password-recovery.js       Luồng khôi phục mật khẩu
customer-session.js        Cookie phiên khách hàng
survey-copy.js             Sao chép khảo sát bằng transaction
scripts/*.test.js          Kiểm thử tự động, không cần MySQL thật
```

Các file giao diện sử dụng classic scripts theo thứ tự cố định, không cần bước build.
Không thêm lại các hàm toàn cục trùng tên, không ghi đè main/render/selectPage từ module khác.
Các chức năng báo cáo/khôi phục/hồ sơ có namespace sự kiện riêng; thao tác nghiệp vụ đi qua staffActions/staffForms.

## Kiểm tra và định dạng

```powershell
npm test
npm run check:staff
npm run format:staff
```

Kiểm tra báo cáo trên MySQL thực, chỉ đọc và không tự khởi động server:

```powershell
node scripts/check-reports-db.js
```

Xem docs/REFACTOR-2026-10-22.md để biết các luồng cũ đã loại bỏ và phạm vi kiểm thử.

## Dữ liệu và bảo mật

- Không xóa thư mục data/ hoặc tự nhập dữ liệu JSON cũ vào MySQL.
- Thư mục dự án không còn được công khai toàn bộ: chỉ tài nguyên có trong public-assets.js được tải.
- File backend, SQL, scripts, node_modules, data và .env không được phục vụ cho trình duyệt.
- Thêm file JS/CSS dùng ở trình duyệt phải cập nhật public-assets.js và hai trang tương ứng.
- Không dùng các tài khoản/mật khẩu demo cho môi trường triển khai thật.

