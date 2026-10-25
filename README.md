# Hướng dẫn setup database và chạy Backline CRM

Áp dụng cho Windows, macOS và Linux. Chạy bằng Node.js + MySQL Server, không mở trực tiếp `index.html` hay chạy bằng Live Server. Visual Studio/VS Code là trình soạn thảo, không thay thế Node.js và MySQL.

## Cài nhanh từ repo chính — khuyến nghị cho người tải mới

Repo: https://github.com/Saame12/CRM-electronic-devices-project

Tải Code → Download ZIP rồi giải nén, hoặc clone bằng Git. Trong Visual Studio chọn File → Open → Folder (VS Code: Open Folder), mở thư mục có `package.json`, sau đó mở terminal tại thư mục đó.

```bash
npm ci
npm run config
```

Mở `.env` vừa được tạo, điền tài khoản/mật khẩu MySQL trên máy mình. JWT_SECRET đã được sinh ngẫu nhiên; nếu `.env` đã có thì file không bị ghi đè, cần tự kiểm tra khóa hiện có. Bật MySQL Server rồi chạy:

```bash
npm run setup
npm start
```

`setup` tạo database/bảng theo `.env`. Nếu tất cả bảng nghiệp vụ còn trống, nạp đủ bộ dữ liệu giả lập vào database đó để tương tác ngay (Admin/Quản lý/Khách, khảo sát, phản hồi, báo cáo). Nếu database đã có dữ liệu thì giữ nguyên, không trộn bộ mẫu hoặc reset mật khẩu.

Database mới đã nạp mẫu: Admin `admin@backline.vn / Admin@123`, Quản lý `manager@demo.vn / Manager@123`, Khách `khach@demo.vn / 123456`. Truy cập lần lượt `/admin.html`, `/manager.html`, `/` tại http://localhost:3000. Chỉ dùng tài khoản mặc định để trình diễn local.

Lần sau: bật MySQL → `npm start`. Không cần `.env.demo` trong luồng này. Để chỉ tạo schema: `npm run setup -- --empty`; lưu ý server vẫn bổ sung seed cơ bản khi chạy. Các phần dưới giải thích chi tiết và giữ hướng dẫn chế độ demo cách ly nếu cần.

## 1. Chuẩn bị máy

- Cài Node.js tương thích yêu cầu dự án (README hiện yêu cầu từ 20.19 trở lên; khuyến nghị nhánh 24 LTS), kèm npm.
- Cài MySQL Server 8.0 trở lên và khởi động dịch vụ MySQL. Chỉ có MySQL Workbench thì chưa đủ vì Workbench là công cụ quản trị.
- Biết tài khoản, mật khẩu và cổng MySQL của máy này. Người dùng setup cần quyền tạo database/bảng và quyền cập nhật cấu trúc, đọc/ghi dữ liệu của database dự án.
- Tải ZIP dự án từ GitHub và giải nén, hoặc clone bằng Git.

Mở lại terminal sau khi cài Node, kiểm tra:

```bash
node --version
npm --version
```

Windows dùng PowerShell/CMD; macOS/Linux dùng Terminal. Các lệnh npm trong tài liệu giống nhau trên cả ba hệ điều hành.

## 2. Mở đúng thư mục và cài thư viện

Mở terminal ngay tại thư mục có `package.json`, `package-lock.json` và `server.mysql.js`.

Ví dụ đường dẫn hiện tại trên máy tác giả (máy khác phải thay bằng đường dẫn của mình):

```powershell
cd "C:\Users\sangl\source\repos\CRM-electronic-devices-project"
```

macOS/Linux, ví dụ:

```bash
cd ~/Downloads/CRM-electronic-devices-project
```

Cài thư viện theo phiên bản đã khóa trong dự án:

```bash
npm ci
```

Không cần mang thư mục `node_modules` từ máy tác giả sang. Lệnh này cần mạng để tải thư viện. Nếu báo không thấy `package.json`, bạn đang đứng sai thư mục; nếu thiếu `package-lock.json`, hãy tải bản dự án đầy đủ.

## 3. Tạo file cấu hình cho máy mới

Nếu đã có `.env`, giữ nguyên file và kiểm tra thông tin, không sao chép đè lên cấu hình đang dùng.

Nếu chưa có, sao chép file mẫu:

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Windows CMD:

```bat
copy .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Mở `.env` bằng trình soạn thảo, sửa thành thông tin của máy mới:

```dotenv
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=backline_crm
DB_USER=root
DB_PASSWORD="mat_khau_mysql_cua_may_nay"
JWT_SECRET=thay_bang_chuoi_ngau_nhien_dai
```

- `DB_PASSWORD` là mật khẩu tài khoản MySQL, không phải mật khẩu website. Nếu MySQL thật sự không có mật khẩu thì dùng `DB_PASSWORD=""`.
- `DB_USER` không bắt buộc là root; hãy điền tài khoản MySQL có quyền phù hợp. Trên máy chỉ cho root đăng nhập qua socket, cần cấu hình tài khoản có thể kết nối TCP tới `127.0.0.1`.
- `DB_NAME` là tên database sẽ đọc và ghi. Để tách chính/demo, dùng `backline_crm` cho chính và `backline_crm_demo` cho demo.
- `PORT` là cổng website; `DB_PORT` là cổng MySQL, hai cổng này khác nhau.
- Giá trị có ký tự đặc biệt như `#` nên đặt trong dấu nháy phù hợp để dotenv không hiểu thành comment. Nếu mật khẩu có cả dấu nháy, cần chọn kiểu nháy không làm thay đổi giá trị.

Sinh `JWT_SECRET` bằng lệnh này trên cả ba hệ điều hành:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Dán kết quả vào `JWT_SECRET`. Không sử dụng nguyên chuỗi ví dụ. Không chia sẻ `.env`, `.env.demo`, mật khẩu hoặc khóa bí mật lên GitHub.

## 4. Chọn cách chạy

| Mục đích | File cấu hình | Tạo database | Chạy website |
| --- | --- | --- | --- |
| Luồng chuẩn, có dữ liệu mẫu nếu database trống | `.env` | `npm run setup` | `npm start` |
| Xem đồ án với dữ liệu mẫu hoạt động ngay | `.env.demo` | `npm run demo:setup` | `npm run demo:start` |
| Dùng database chính | `.env` | `npm run db:setup` | `npm start` |

Chỉ chọn một chế độ để chạy tại một thời điểm nếu hai file dùng cùng PORT.

### Cách A — Dữ liệu mẫu để trải nghiệm đồ án

Sau khi đã cấu hình `.env` đúng kết nối MySQL:

```bash
npm run demo:setup
npm run demo:start
```

`demo:setup` thực hiện:

1. Nếu chưa có `.env.demo`: lấy thông tin kết nối từ `.env`, đặt database riêng `backline_crm_demo` và sinh JWT_SECRET riêng.
2. Tạo database, các bảng và nhập dữ liệu giả lập có thể tương tác thật.
3. Nếu bộ demo đã được cài, không nhập trùng hoặc ghi đè các chỉnh sửa demo đã có.

Nếu `.env.demo` đã tồn tại, lệnh không tự ghi đè. Đổi mật khẩu/cổng MySQL trong `.env` không tự sửa `.env.demo`; hãy mở đúng file demo và cập nhật rồi chạy lại setup. Tên DB demo phải có chữ `demo`.

Nếu script từ chối vì database chứa dữ liệu không phải bộ demo, hãy chọn một tên database demo mới trong `.env.demo`; không xóa database đang có dữ liệu để vượt kiểm tra.

Khi thấy thông báo server đang chạy, mở:

| Vai trò | Địa chỉ | Email demo | Mật khẩu demo |
| --- | --- | --- | --- |
| Khách hàng | http://localhost:3000/ | `khach@demo.vn` | `123456` |
| Quản lý | http://localhost:3000/manager.html | `manager@demo.vn` | `Manager@123` |
| Admin | http://localhost:3000/admin.html | `admin@backline.vn` | `Admin@123` |

Đây là tài khoản của bộ demo, không phải mật khẩu đảm bảo cho mọi database sẵn có. Nếu đã đổi mật khẩu thì dùng mật khẩu đã đổi. Không công khai bản demo chứa tài khoản mặc định lên Internet.

Có thể kiểm tra bộ demo bằng:

```bash
npm run demo:check
```

### Cách B — Database chính

Kiểm tra `DB_NAME=backline_crm` trong `.env`, rồi chạy:

```bash
npm run db:setup
npm start
```

- `db:setup` dùng `database/schema.sql` để tạo database/bảng theo tên trong `.env`. Không cần tạo thủ công database trước nếu tài khoản MySQL đủ quyền.
- Script dùng CREATE IF NOT EXISTS, không xóa các bảng/dữ liệu đang có; đây không phải lệnh reset DB hoặc cơ chế nâng cấp mọi cấu trúc cũ. Sao lưu trước khi dùng với dữ liệu quan trọng.
- Server có bước bổ sung một số cột/bảng còn thiếu và seed cơ bản khi khởi động.
- Riêng lệnh `db:setup` chỉ tạo bảng nên database chính mới chưa có đầy đủ bộ mẫu. Seed cơ bản của server tạo sản phẩm, Admin và khách thử nếu chưa tồn tại; không tự tạo Quản lý. Muốn bộ mẫu đầy đủ hãy dùng `npm run setup` trên database trống TRƯỚC lần chạy server đầu tiên; nếu đã có dữ liệu thì giữ lại và thêm MANAGER qua Admin, hoặc chọn database mới trong `.env` để thử bộ mẫu.
- Nếu chưa có Admin, seed tạo `admin@backline.vn` với mật khẩu khởi tạo `Admin@123`. Nếu đã có Admin thì không đặt lại mật khẩu tài khoản cũ.

Không dùng tài khoản mặc định và cấu hình local này như một cấu hình triển khai production hoàn chỉnh.

## 5. Những lần chạy sau

Không cần cài thư viện hoặc tạo database lại mỗi lần. Bật MySQL, mở terminal trong dự án, rồi chọn:

```bash
# Database chính
npm start
```

Hoặc:

```bash
# Database demo
npm run demo:start
```

Giữ terminal chạy trong khi sử dụng web. Nhấn `Ctrl + C` để dừng Node server; dữ liệu MySQL vẫn còn. Nếu sửa `.env`/`.env.demo`, dừng và khởi động lại server để đọc cấu hình mới. Nếu đổi PORT thành 3001, thay 3000 bằng 3001 trong địa chỉ web.

Sau khi tải cập nhật source có thay đổi thư viện, chạy lại `npm ci`. Với thay đổi giao diện, dùng Ctrl + F5 trên Windows/Linux hoặc tải lại bỏ cache trên trình duyệt macOS nếu vẫn thấy bản cũ.

## 6. Kiểm tra và xử lý lỗi

Khi server đã chạy, mở http://localhost:3000/api/health — nếu kết nối DB tốt sẽ trả `{"ok":true}`. Chạy `npm test` để kiểm tra các quy tắc có bài test; đây không thay thế kiểm tra MySQL hoặc thao tác thực tế trên trình duyệt.

| Thông báo/hiện tượng | Cách xử lý |
| --- | --- |
| `node` / `npm` không được nhận diện | Cài Node.js, mở lại terminal/VS Code/Visual Studio, kiểm tra PATH. |
| PowerShell chặn `npm.ps1` | Dùng `npm.cmd` thay `npm`, ví dụ `npm.cmd ci`, `npm.cmd run demo:start`; không cần tắt chính sách bảo vệ toàn hệ thống. |
| `ENOENT ... package.json` | Mở terminal đúng thư mục gốc dự án. |
| `ECONNREFUSED 127.0.0.1:3306` | Kiểm tra MySQL Server đang chạy và DB_HOST/DB_PORT; thường không phải do mạng Internet yếu. |
| `Access denied` | Kiểm tra DB_USER/DB_PASSWORD và quyền tài khoản trên đúng host. Nhớ sửa đúng file của chế độ đang chạy. |
| `Unknown database` | Chạy `db:setup` hoặc `demo:setup` tương ứng, kiểm tra DB_NAME. |
| Không tạo được database/bảng hoặc ALTER bị từ chối | Tài khoản MySQL thiếu quyền; cần người quản trị cấp quyền phù hợp cho database dự án. |
| `JWT_SECRET` thiếu/quá ngắn trong demo | Tạo chuỗi ngẫu nhiên, điền đúng file, khởi động lại server. |
| `EADDRINUSE` / cổng 3000 bị chiếm | Dừng server cũ hoặc đổi PORT trong file cấu hình đang dùng, rồi dùng địa chỉ mới. |
| Demo setup vẫn dùng mật khẩu cũ | `.env.demo` đã tồn tại nên không được tự ghi đè từ `.env`; sửa trực tiếp `.env.demo`. |
| Đăng nhập đúng nhưng sai trang | Admin dùng admin.html, Quản lý dùng manager.html, khách dùng trang gốc. |
| Không có khảo sát như trên máy tác giả | MySQL không đi theo GitHub. Chạy bộ demo để có dữ liệu mẫu hoặc nhập bản sao lưu DB riêng. |

Trên Windows bật MySQL từ Services theo tên dịch vụ thực tế đã cài. Trên macOS/Linux dùng trình quản lý dịch vụ tương ứng với cách cài MySQL của máy; tên dịch vụ và lệnh không giống nhau trên mọi máy. Không cài thêm server thứ hai chỉ vì dịch vụ hiện tại chưa được bật.

## 7. Khi chia sẻ dự án qua GitHub

Đưa source, `package.json`, `package-lock.json`, `.env.example`, thư mục `database` và `scripts` lên repository. Không đưa `.env`, `.env.demo`, `node_modules`, `.vs` hoặc dữ liệu khách hàng thật lên GitHub.

Người tải tạo cấu hình MySQL của chính họ và chạy theo hướng dẫn này. Muốn giữ nguyên dữ liệu đã nhập trên máy tác giả thì phải xuất/nhập bản sao lưu MySQL riêng; `demo:setup` chỉ tạo bộ dữ liệu giả lập của dự án, không sao chép DB máy tác giả.
