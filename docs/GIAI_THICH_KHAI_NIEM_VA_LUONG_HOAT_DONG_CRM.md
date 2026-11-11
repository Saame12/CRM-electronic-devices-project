# Giải thích khái niệm và luồng hoạt động của Backline CRM

Ngày đối chiếu mã nguồn: **09/11/2026**.

Bổ sung ngày **11/11/2026**: khách phải chủ động chọn và lưu nhu cầu; giá trị “Chưa xác định” do hệ thống gán khi tạo không tự hoàn thành bước này. Trường `users.need_confirmed` lưu việc xác nhận. Sở thích vẫn tùy chọn. Tìm sản phẩm trong phản hồi có danh sách gợi ý; nút Cập nhật báo cáo tải mới cả tổng hợp và chi tiết đang xem.

Tài liệu dành cho người đang học cách hệ thống hoạt động, người thuyết trình đồ án và người cần hiểu quy trình trước khi sử dụng. Nội dung mô tả bản triển khai hiện có trong repository, chạy bằng `npm start` qua `server.mysql.js`, sử dụng MySQL.

Đây là tài liệu giải thích theo mã nguồn, không phải biên bản xác nhận mọi chức năng đã được kiểm thử lại trong ngày lập tài liệu. Các chức năng được chia thành **45 mục để dễ học**; số mục này không đồng nghĩa với số hàm, nút hay API của hệ thống.

## Mục lục

- [A. Cách đọc và các khái niệm nền tảng](#a-cách-đọc-và-các-khái-niệm-nền-tảng)
- [B. Đăng ký, đăng nhập, hồ sơ và khôi phục mật khẩu — mục 01–09](#b-đăng-ký-đăng-nhập-hồ-sơ-và-khôi-phục-mật-khẩu)
- [C. Các thao tác nghiệp vụ của khách hàng — mục 10–16](#c-các-thao-tác-nghiệp-vụ-của-khách-hàng)
- [D. Quản trị tài khoản và hỗ trợ của Admin — mục 17–21](#d-quản-trị-tài-khoản-và-hỗ-trợ-của-admin)
- [E. Quản lý khách hàng và phản hồi — mục 22–30](#e-quản-lý-khách-hàng-và-phản-hồi)
- [F. Quản lý khảo sát — mục 31–41](#f-quản-lý-khảo-sát)
- [G. Báo cáo và vận hành kỹ thuật — mục 42–45](#g-báo-cáo-và-vận-hành-kỹ-thuật)
- [H. Những điểm dễ hiểu nhầm](#h-những-điểm-dễ-hiểu-nhầm)
- [I. Bản đồ API để tra cứu](#i-bản-đồ-api-để-tra-cứu)
- [J. Cách diễn đạt khi trình bày đồ án](#j-cách-diễn-đạt-khi-trình-bày-đồ-án)

## A. Cách đọc và các khái niệm nền tảng

### A1. Luồng chung của một thao tác

```text
Người dùng thao tác trên giao diện
                ↓
Frontend tạo request gửi đến API
                ↓
Backend xác thực, phân quyền và kiểm tra dữ liệu
                ↓
Hàm xử lý hoặc service thực hiện nghiệp vụ
                ↓
Đọc/ghi database nếu cần
                ↓
Backend trả response
                ↓
Frontend cập nhật giao diện hoặc hiển thị lỗi
```

Các luồng bên dưới dùng cùng nguyên tắc này. Một số nút chỉ đổi giao diện, không gửi request và không thay đổi database.

Một điểm riêng của bản triển khai: trước các API có bước đối soát khảo sát hết hạn. Vì vậy, khi tài liệu nói một chức năng GET “chỉ đọc”, đó là nói về nghiệp vụ của chức năng đó; middleware dùng chung vẫn có thể chuyển khảo sát đã hết hạn sang CLOSED. Chi tiết ở mục 36.

### A2. Từ điển khái niệm

| Khái niệm | Cách hiểu | Ví dụ trong đồ án |
|---|---|---|
| Client | Bên gửi yêu cầu | Trình duyệt của khách |
| Frontend | Giao diện và JavaScript chạy trên trình duyệt | `app.js`, `role-ui.js` |
| Backend | Chương trình xử lý phía máy chủ | Express trong `server.mysql.js` |
| Server | Chương trình hoặc máy tiếp nhận yêu cầu | Tiến trình Node.js chạy CRM |
| Database | Nơi lưu dữ liệu lâu dài | MySQL lưu tài khoản và câu trả lời |
| Request | Yêu cầu từ client | Gửi email và mật khẩu để đăng nhập |
| Response | Kết quả server trả lại | Thông tin tài khoản hoặc thông báo lỗi |
| API | Giao diện giao tiếp giữa các phần mềm | Giao diện gọi backend để lấy khảo sát |
| Endpoint | Địa chỉ API kèm phương thức | `POST /api/auth/login` |
| Route | Quy tắc chuyển request đến hàm xử lý | Express đăng ký đường dẫn đăng nhập |
| Controller | Phần nhận dữ liệu, gọi xử lý và trả kết quả | Hàm xử lý một route Express |
| Service | Phần chứa logic nghiệp vụ | `survey-service.js`, `feedback-service.js` |
| Repository/DAO | Lớp chuyên truy cập dữ liệu trong một số kiến trúc | Đồ án hiện chưa tách toàn bộ SQL thành lớp riêng này |
| Middleware | Hàm tham gia chuỗi xử lý request | `auth` kiểm tra token trước API nghiệp vụ |
| Validation | Kiểm tra tính hợp lệ của dữ liệu | Ngày sinh có thật, nội dung không được trống |
| Authentication | Xác thực: người gọi là ai? | Kiểm tra email và mật khẩu |
| Authorization | Phân quyền: được làm việc gì? | Chỉ Quản lý được tạo khảo sát |
| Role | Vai trò của tài khoản | `ADMIN`, `MANAGER`, `CUSTOMER` |
| Session | Phiên làm việc giúp nhận biết người dùng qua nhiều request | Trạng thái đăng nhập của khách |
| Token | Chuỗi dùng làm bằng chứng xác thực/cấp quyền | Token được cấp sau đăng nhập |
| JWT | Định dạng token có chữ ký | Token đăng nhập của CRM |
| Cookie | Dữ liệu trình duyệt lưu và tự gửi đến website phù hợp | Cookie đăng nhập khách |
| HttpOnly | Thuộc tính ngăn JavaScript trên trang đọc cookie | Cookie chứa JWT của khách |
| sessionStorage | Bộ nhớ phía trình duyệt gắn với phiên của tab | Lưu token Admin/Quản lý |
| localStorage | Bộ nhớ trình duyệt tồn tại qua nhiều lần mở trang, đến khi bị xóa | Lưu danh sách khảo sát khách tự ẩn |
| Hash/băm | Biến đổi một chiều để kiểm tra dữ liệu | bcrypt dùng cho mật khẩu |
| Encryption/mã hóa | Biến đổi dữ liệu để có thể giải mã bằng khóa | Khác với băm mật khẩu |
| CRUD | Tạo, đọc, sửa, xóa | Tạo hồ sơ, xem hồ sơ, sửa/xóa phản hồi |
| Transaction | Nhóm thao tác dữ liệu cùng thành công hoặc cùng hoàn tác | Lưu khảo sát và các câu hỏi |
| Commit | Xác nhận transaction thành công | Lưu trọn vẹn bài khảo sát |
| Rollback | Hoàn tác transaction khi lỗi | Không để lại khảo sát tạo dở |
| Khóa bản ghi | Ngăn các giao dịch sửa cùng dữ liệu theo cách xung đột | `FOR UPDATE` khi gửi/đóng khảo sát |
| Revision/version | Số phiên bản dữ liệu | Chặn lưu đè phản hồi bằng bản cũ |
| Snapshot | Tập dữ liệu được chốt ở một thời điểm | Danh sách khách nhận khảo sát theo bộ lọc |
| Pagination | Phân trang | Xem 20 khảo sát mỗi trang |

**Session khác service:** session nói về phiên làm việc; service là phần xử lý nghiệp vụ. **Session cũng không phải sessionStorage:** sessionStorage chỉ là nơi lưu dữ liệu ở trình duyệt.

JWT có chữ ký không có nghĩa nội dung JWT được mã hóa bí mật. Hệ thống không cần đưa mật khẩu vào JWT.

### A3. Các phương thức và mã HTTP

| Phương thức | Mục đích thường dùng |
|---|---|
| GET | Đọc dữ liệu |
| POST | Tạo dữ liệu hoặc yêu cầu thực hiện một hành động |
| PUT | Cập nhật tài nguyên theo hợp đồng API; đồ án dùng cho hồ sơ cá nhân |
| PATCH | Chỉnh sửa một phần hoặc đổi trạng thái |
| DELETE | Yêu cầu xóa |

| Mã | Ý nghĩa trong các tình huống thường gặp |
|---|---|
| 200 | Thành công |
| 201 | Tạo thành công |
| 400 | Dữ liệu/yêu cầu không hợp lệ |
| 401 | Chưa xác thực hoặc phiên không hợp lệ |
| 403 | Không đủ quyền hoặc tài khoản bị chặn theo điều kiện của API |
| 404 | Không tìm thấy dữ liệu phù hợp hoặc không được cung cấp dữ liệu đó |
| 409 | Xung đột trạng thái, phiên bản hoặc dữ liệu trùng |
| 410 | Dữ liệu đã hết hiệu lực trong luồng có sử dụng mã này |
| 429 | Gửi quá nhiều yêu cầu trong thời gian giới hạn |
| 500 | Lỗi xử lý phía máy chủ |

### A4. Ba vai trò và nơi lưu dữ liệu

| Vai trò | Trang | Công việc chính |
|---|---|---|
| Khách hàng | `index.html` | Hồ sơ, khảo sát được nhận, phản hồi, khôi phục mật khẩu |
| Quản lý | `manager.html` | Khách hàng, xử lý phản hồi, khảo sát, báo cáo |
| Admin | `admin.html` | Tạo/xóa/tra cứu tài khoản, duyệt hỗ trợ khôi phục mật khẩu |

Tiền tố `/api/admin/` là tên đường dẫn lịch sử; **không có nghĩa Admin được dùng mọi API dưới đó**. Backend phân quyền theo nhóm chức năng: quản trị tài khoản cho Admin, nghiệp vụ khách hàng/phản hồi/khảo sát/báo cáo cho Quản lý.

| Dữ liệu | Nơi lưu |
|---|---|
| Hồ sơ, mật khẩu đã băm, phản hồi, khảo sát, câu trả lời | MySQL |
| Phiên đăng nhập khách | JWT trong cookie HttpOnly |
| Token đăng nhập Admin/Quản lý | sessionStorage của trình duyệt |
| Danh sách phản hồi/khảo sát đang hiển thị | Biến JavaScript; tải lại từ API |
| Khảo sát khách tự ẩn | localStorage, phân biệt theo tài khoản email |
| Trang, tab, vị trí cuộn của không gian khảo sát | Trạng thái giao diện trong phiên sử dụng |

## B. Đăng ký, đăng nhập, hồ sơ và khôi phục mật khẩu

### 01. Khách tự đăng ký tài khoản

**Mục đích:** tạo tài khoản khách để sử dụng hệ thống.

**Luồng:**

1. Khách nhập họ tên, email, số điện thoại, ngày sinh `dd/mm/yyyy`, giới tính, mật khẩu và nhập lại mật khẩu.
2. Frontend kiểm tra thông tin, chuyển ngày sinh sang `yyyy-mm-dd`, gửi `POST /api/auth/register`.
3. Backend kiểm tra dữ liệu và băm mật khẩu bằng bcrypt.
4. Trong cùng transaction: tạo `users`, cấp mã khôi phục cá nhân, ghi người nhận cho các khảo sát công khai còn mở phù hợp.
5. Commit rồi trả thông tin khách, token và mã khôi phục gốc để hiển thị một lần.
6. Giao diện kiểm tra hồ sơ còn thiếu và hướng dẫn hoàn thiện.

**Điều kiện/lỗi:** ngày sinh phải có thật, không ở tương lai; số điện thoại 10–11 chữ số bắt đầu bằng 0; mật khẩu ít nhất 6 ký tự; email hoặc điện thoại trùng bị từ chối.

**Dữ liệu:** `users`, `customer_recovery_codes`, có thể thêm `survey_recipients`.

**Cách trình bày:** “Đăng ký là tạo dữ liệu tài khoản mới; mật khẩu được băm trước khi lưu. Phiên đăng nhập chỉ được cấp sau khi giao dịch tạo tài khoản thành công.”

### 02. Đăng nhập và ghi nhớ đăng nhập

**Mục đích:** xác thực tài khoản đã tồn tại.

```text
Nhập email/mật khẩu → POST /api/auth/login
→ tìm users theo email → bcrypt.compare
→ kiểm tra trạng thái và vai trò → cấp JWT
→ giao diện nhận thông tin người dùng và hiển thị trang phù hợp
```

- Khách nhận JWT qua cookie HttpOnly. Chọn ghi nhớ đăng nhập: thời hạn token/cookie 7 ngày. Không chọn: token 8 giờ, cookie kiểu phiên trình duyệt.
- Admin/Quản lý nhận token để frontend lưu trong sessionStorage; gửi lại bằng `Authorization: Bearer ...`.
- Đăng nhập dùng **email**, không dùng họ tên.
- Backend kiểm tra đúng cổng đăng nhập và vai trò. Trang Admin có luồng chuyển Quản lý sang trang Quản lý.

**Lỗi:** sai email/mật khẩu, tài khoản khóa hoặc sai cổng/vai trò. Thất bại không cấp quyền vào nghiệp vụ.

**Mã nguồn:** route đăng nhập trong `server.mysql.js`; cấp cookie tại `customer-session.js`. Phần kiểm tra đăng nhập hiện viết trong hàm route, chưa tách thành service đăng nhập riêng.

### 03. Khôi phục phiên và kiểm tra quyền ở các yêu cầu tiếp theo

**Mục đích:** tải lại trang vẫn nhận ra người đang đăng nhập; bảo vệ từng API.

1. Frontend gọi `GET /api/me`.
2. Trình duyệt khách tự gửi cookie; frontend nhân viên gửi Bearer token.
3. Middleware `auth` kiểm tra chữ ký và hạn JWT.
4. Backend tra lại tài khoản trong MySQL: phải còn hoạt động, `auth_version` phải khớp token.
5. Gắn người dùng đã xác thực vào `req.user`; middleware phân quyền quyết định có cho chạy API tiếp không.

**Dữ liệu:** đọc `users`, nạp sở thích khi cần; không tạo tài khoản mới.

**Ví dụ:** khách đang đăng nhập bị Quản lý khóa; request bảo vệ tiếp theo sẽ bị từ chối, dù trình duyệt còn cookie.

### 04. Đăng xuất và nút xem mật khẩu

**Đăng xuất:** frontend gọi `POST /api/auth/logout`; server xóa cookie khách. Frontend dọn trạng thái đăng nhập/token tương ứng, quay về màn hình đăng nhập. Không xóa hồ sơ hoặc dữ liệu nghiệp vụ.

**Lưu ý triển khai:** xóa cookie/token ở trình duyệt không phải cơ chế thu hồi toàn bộ bản sao JWT trên mọi thiết bị. Khóa tài khoản hoặc tăng `auth_version` là các cơ chế kiểm tra phía server có tác dụng với token cũ khi gọi API.

**Con mắt mật khẩu:** chỉ đổi ô nhập giữa `password` và `text`. Không giải mã mật khẩu trong database và không gửi API để xem mật khẩu cũ.

### 05. Hoàn thiện và cập nhật hồ sơ cá nhân

**Mục đích:** khách tự bổ sung/sửa thông tin phục vụ CRM và lọc người nhận.

1. Khách bấm tên ở đầu trang để mở thông tin cá nhân; hồ sơ thiếu có luồng thông báo hoàn thiện.
2. Nhập họ tên, điện thoại, địa chỉ, ngày sinh, giới tính, nhu cầu, nhiều sở thích nếu muốn.
3. Frontend chuyển ngày sinh `dd/mm/yyyy` thành ISO, gửi `PUT /api/me`.
4. Backend dùng `V.profile()` kiểm tra dữ liệu và lấy khách hiện tại từ `req.user.id`.
5. Transaction cập nhật `users` và sở thích; trả lại hồ sơ đã lưu để thay dữ liệu trên giao diện.

**Quy tắc:** email trên form là chỉ đọc. Sở thích có thể chọn nhiều; nhu cầu có một giá trị, gồm cả “Chưa xác định”. Không có cơ sở để tự coi “Chưa xác định” là một nhu cầu đã được khách xác nhận cụ thể.

**Phân biệt:** yêu cầu hoàn thiện hồ sơ là điều hướng của giao diện. Không nên mô tả cờ onboarding trong sessionStorage là quyền truy cập phía server.

**Dữ liệu:** `users`, `customer_interests`; năm sinh được suy ra từ ngày sinh.

### 06. Xem trạng thái và cấp lại mã khôi phục cá nhân

**Mục đích:** khách chuẩn bị cách khôi phục mật khẩu nếu quên sau này.

- `GET /api/me/recovery-code`: chỉ trả tình trạng đã cấu hình và thời điểm tạo, không trả lại mã gốc cũ.
- Khách nhập mật khẩu hiện tại rồi gọi `POST /api/me/recovery-code`.
- Backend xác thực mật khẩu, khóa dữ liệu cần thiết trong transaction, tạo mã mới và lưu bản băm.
- Các phiên khôi phục dựa trên mã cũ còn chờ/được duyệt bị hủy. Mã gốc mới chỉ hiển thị lần cấp đó.

**Dữ liệu:** `customer_recovery_codes`, `password_recovery_requests`.

**Ví dụ:** cấp lại mã mới làm mã cũ không còn dùng được, nhưng không tự đổi mật khẩu đăng nhập.

### 07. Quên mật khẩu bằng mã cá nhân

**Mục đích:** tự chứng minh quyền khôi phục bằng mã khách đã lưu.

1. Nhập email và mã khôi phục tại màn hình quên mật khẩu.
2. Gửi `POST /api/password-recovery/code`.
3. Backend kiểm tra tài khoản khách hoạt động và bản băm mã còn hợp lệ, chưa dùng/chưa thay thế.
4. Tạo yêu cầu `APPROVED` và trả token riêng của phiên khôi phục, thời hạn đặt mật khẩu 15 phút.
5. Chuyển sang bước đặt mật khẩu mới ở mục 09.

**Lưu ý:** token khôi phục không phải JWT đăng nhập và không cấp quyền sử dụng toàn bộ CRM. Có giới hạn số lần thử để hạn chế dò mã.

### 08. Quên mật khẩu qua Admin hỗ trợ

**Mục đích:** khách không có mã cá nhân gửi yêu cầu xác minh thủ công.

1. Nhập email, điện thoại đã đăng ký, lý do 5–500 ký tự.
2. `POST /api/password-recovery/requests` tạo yêu cầu `PENDING`, hạn chờ 30 phút.
3. Khách giữ phiên trình duyệt để theo dõi qua `GET /api/password-recovery/status`, gửi token bằng `x-recovery-token`.
4. Admin xác minh ngoài bước kiểm tra thông tin khớp rồi duyệt hoặc từ chối.
5. Được duyệt thì khách có 15 phút để tự đặt mật khẩu mới.

**Lưu ý:** khớp email/điện thoại không tự động được phép đổi mật khẩu. API có thể tiếp nhận yêu cầu dù chưa khớp khách; duyệt yêu cầu cần tài khoản khách phù hợp và đang hoạt động. Đây không phải luồng gửi OTP/email tự động.

**Trạng thái:** chờ, được duyệt, hoàn tất, từ chối, hết hạn hoặc bị hủy. Có giới hạn gửi yêu cầu trong 15 phút.

### 09. Hoàn tất đặt mật khẩu mới

**API:** `POST /api/password-recovery/complete`, dùng token phiên khôi phục.

1. Khách nhập mật khẩu mới và xác nhận trùng nhau; ít nhất 6 ký tự, tối đa 72 byte theo kiểm tra của luồng này.
2. Backend kiểm tra yêu cầu `APPROVED`, chưa hết hạn và tài khoản vẫn hoạt động.
3. Khóa và kiểm tra lại tài khoản/yêu cầu; nếu dùng mã cá nhân thì kiểm tra mã chưa bị thay thế hoặc dùng trước đó.
4. Trong một transaction: lưu bcrypt mới, tăng `auth_version`, đánh dấu `COMPLETED`, hủy yêu cầu khác còn hiệu lực và cấp mã khôi phục mới.
5. Khách đăng nhập bằng mật khẩu mới; Admin thấy thông báo hoàn tất.

**Kết quả:** JWT cũ không còn khớp phiên bản xác thực ở các API bảo vệ. Không tự đăng nhập khách bằng token khôi phục.

## C. Các thao tác nghiệp vụ của khách hàng

### 10. Xem khảo sát được nhận và đồng bộ khách mới

**Mục đích:** chỉ hiển thị khảo sát phù hợp với tài khoản đang đăng nhập.

```text
Mở trang khảo sát → POST /api/surveys/sync
→ thêm khách vào các khảo sát ALL còn mở, chưa quá hạn
→ GET /api/surveys + GET /api/survey-status
→ chia nhóm đang chờ / đã trả lời / quá hạn chưa trả lời
```

- Khảo sát mới dành cho tất cả: khách đăng ký sau ngày mở vẫn được nhận khi khảo sát còn hiệu lực.
- Theo bộ lọc/chọn từng khách: dùng người nhận đã chốt; không tự thêm mọi khách đăng ký sau.
- Khảo sát nháp không hiển thị cho khách.
- Khảo sát tự đóng do hết hạn có thể còn trong lịch sử quá hạn của người nhận chưa trả lời.
- Khảo sát đóng thủ công chưa được khách trả lời không nằm trong danh sách chờ; khách đã trả lời vẫn được xem lịch sử bài gửi.

**Dữ liệu:** `surveys`, `survey_recipients`, `survey_responses`, câu hỏi/lựa chọn. Đồng bộ có thể ghi `survey_recipients`; các API danh sách đọc dữ liệu.

**Ví dụ:** khảo sát ALL mở ngày 10, khách tạo ngày 11 vẫn được nhận nếu ngày 11 khảo sát còn mở và chưa quá hạn.

### 11. Trả lời và gửi khảo sát

**API:** `POST /api/surveys/:id/responses`.

1. Khách mở một khảo sát được nhận, nhập các câu trả lời.
2. Frontend kiểm tra câu bắt buộc; gửi nội dung câu trả lời.
3. Backend khóa bản ghi khảo sát, kiểm tra `OPEN`, hạn trả lời và người gửi có trong `survey_recipients`.
4. Kiểm tra lựa chọn thuộc đúng câu hỏi, kiểu dữ liệu và các câu bắt buộc.
5. Transaction tạo một lượt gửi và các chi tiết câu trả lời; thành công mới đánh dấu đã gửi trên giao diện.

| Loại câu | Cách xử lý |
|---|---|
| Một lựa chọn (`ONE`) | Chọn một phương án hợp lệ |
| Nhiều lựa chọn (`MULTI`) | Lưu các phương án được chọn thuộc đúng câu hỏi |
| Văn bản (`TEXT`) | Lưu nội dung; câu bắt buộc không nhận toàn khoảng trắng |
| Đánh giá (`RATING`) | Nhận số sao hợp lệ từ 1 đến 5 |

**Dữ liệu:** `survey_responses`, `response_details`. Ràng buộc duy nhất theo khảo sát/khách ngăn gửi lần hai. Nếu ghi chi tiết lỗi, rollback cả lượt gửi.

### 12. Xem câu trả lời khảo sát đã gửi

**API:** `GET /api/surveys/:id/my-response`.

1. Khách bấm **Xem câu trả lời đã gửi**.
2. Backend tìm bài trả lời bằng cả mã khảo sát và mã khách lấy từ phiên đăng nhập.
3. Trả nội dung khảo sát, câu hỏi, các lựa chọn khách đã gửi và thời điểm gửi.
4. Giao diện hiển thị chỉ đọc.

**Quy tắc:** không sửa/gửi lại bài khảo sát đã gửi. Khách không được dùng URL này để đọc bài của tài khoản khác. Khảo sát được mở lại không xóa bài cũ và không cho người đã làm gửi thêm lần nữa.

### 13. Khách ẩn và khôi phục khảo sát trong lịch sử

**Mục đích:** thu gọn danh sách cá nhân.

1. Khách bấm ẩn một khảo sát đã trả lời hoặc quá hạn trong lịch sử.
2. Frontend lưu mã khảo sát vào localStorage theo tài khoản.
3. Bấm xem khảo sát đã ẩn để đọc và khôi phục.

**Không gọi API để xóa khảo sát hoặc bài trả lời.** Chỉ thay đổi hiển thị trên trình duyệt đang sử dụng. Xóa localStorage hoặc đổi trình duyệt có thể làm mất lựa chọn ẩn cá nhân này.

### 14. Khách gửi phản hồi sản phẩm

**API:** `POST /api/feedback`.

1. Khách chọn sản phẩm, loại phản hồi, 1–5 sao, tiêu đề nếu cần và nội dung.
2. Frontend kiểm tra sản phẩm, số sao và nội dung không rỗng.
3. Backend kiểm tra vai trò khách, sản phẩm có thật, loại hợp lệ, số sao và độ dài.
4. Lưu `feedback` gắn với `req.user.id`, trạng thái **Tiếp nhận** (`NEW`).
5. Trả bản ghi để giao diện thêm vào lịch sử đã gửi.

**Quy tắc:** tiêu đề tối đa 80 ký tự; nội dung 1–5000 ký tự sau xử lý kiểm tra khoảng trắng. Một khách có thể gửi nhiều phản hồi độc lập; mỗi bản ghi có một nội dung trả lời hiện tại của Quản lý.

### 15. Khách chỉnh sửa phản hồi đã gửi

**API:** `PATCH /api/feedback/:id`.

1. Bấm **Chỉnh sửa** ở phản hồi của mình; frontend điền dữ liệu hiện tại vào form.
2. Bấm **Lưu thay đổi**, gửi dữ liệu cùng `revision` đang xem.
3. Backend khóa phản hồi, kiểm tra đúng chủ sở hữu và phiên bản còn khớp.
4. Kiểm tra sản phẩm/nội dung/số sao rồi cập nhật dữ liệu.
5. Xóa câu trả lời cũ của Quản lý, thông tin người trả lời và thời điểm trả lời; chuyển về **Tiếp nhận**, bỏ cờ ẩn và tăng revision.
6. Frontend tải lại danh sách; lỗi hiện trong form chỉnh sửa, giữ nội dung đang nhập.

**Ví dụ:** Quản lý đã trả lời “Đã xử lý”, khách sửa từ hỏi bảo hành sang báo lỗi máy. Câu trả lời cũ bị xóa để Quản lý tiếp nhận nội dung mới.

**Revision:** nếu Quản lý vừa cập nhật sau khi khách mở form, backend từ chối bản cũ thay vì âm thầm lưu đè.

### 16. Khách xóa phản hồi của mình

**API:** `DELETE /api/feedback/:id`.

1. Khách bấm xóa và xác nhận trên giao diện.
2. Backend xóa đúng bản ghi có mã phản hồi và `customer_id` của người đang đăng nhập.
3. Vì câu trả lời Quản lý nằm trong bản ghi phản hồi, câu trả lời cũng bị xóa theo.
4. Frontend tải lại lịch sử.

**Dữ liệu:** xóa thật bản ghi `feedback`; thống kê dựa vào bản ghi này cũng thay đổi. Đây khác với xóa tài khoản khách: xóa tài khoản giữ lại phản hồi cho Báo cáo.

## D. Quản trị tài khoản và hỗ trợ của Admin

### 17. Admin thêm tài khoản khách

**API:** `POST /api/admin/accounts`, vai trò `CUSTOMER`.

1. Admin bấm **Thêm TK khách**.
2. Nhập họ tên, email, điện thoại, mật khẩu ban đầu, địa chỉ, ngày sinh `dd/mm/yyyy`, giới tính.
3. Backend kiểm tra đủ hồ sơ theo form này, ngày sinh có thật/không tương lai và thông tin đăng nhập hợp lệ.
4. Transaction tạo `users`, băm mật khẩu, đặt nhu cầu **Chưa xác định**, sở thích rỗng và đồng bộ người nhận khảo sát ALL còn mở.
5. Tải lại danh sách tài khoản.

**Không còn Nhu cầu/Sở thích trong form tạo.** Khách có thể tự cập nhật sau trong hồ sơ.

**Phân biệt với tự đăng ký:** đường tạo của Admin không trả mã khôi phục gốc như luồng đăng ký khách; khách có thể cấp mã cá nhân sau khi đăng nhập và xác nhận mật khẩu hiện tại.

### 18. Admin thêm tài khoản Quản lý

**API:** `POST /api/admin/accounts`, vai trò `MANAGER`.

1. Bấm **Thêm TK quản lý**, nhập họ tên, email, điện thoại, mật khẩu.
2. Backend kiểm tra dữ liệu, băm mật khẩu và lưu tài khoản có vai trò Quản lý.
3. Người được cấp dùng tài khoản đó tại trang Quản lý.

**Quy tắc:** không tạo tài khoản Admin từ hai form này; vai trò phải thuộc danh sách backend chấp nhận. Không có chức năng đổi vai trò tài khoản hiện có qua API đổi vai trò: route đó chủ động trả 405.

### 19. Admin tìm và lọc tài khoản

**API tải dữ liệu:** `GET /api/admin/accounts`.

- Server chỉ trả tài khoản chưa được đánh dấu xóa (`erased_at IS NULL`).
- Frontend kết hợp từ khóa tên/email/điện thoại, vai trò và trạng thái để lọc danh sách đã tải.
- Bấm tải lại để lấy dữ liệu mới từ server.

**Dữ liệu:** chỉ đọc `users`, không sửa hồ sơ. Nút lọc danh sách tài khoản hiện dùng lọc phía frontend; khác phân trang khảo sát xử lý ở backend.

### 20. Admin xóa tài khoản

**API:** `DELETE /api/admin/accounts/:id`.

**Nếu là khách:** Admin được xóa trực tiếp, không cần bước khóa trước. `Retention.erase()` xóa khả năng đăng nhập/liên hệ và giữ dữ liệu nghiệp vụ theo mục 26.

**Nếu là nhân viên/Admin:** kiểm tra không tự xóa tài khoản đang dùng, không làm hệ thống mất Admin cuối cùng; không xóa tài khoản đã tạo khảo sát hoặc đã xử lý phản hồi còn được tham chiếu. Được phép thì xóa bản ghi tài khoản.

**Kết quả:** cập nhật danh sách từ server. Không suy luận rằng quyền xóa trực tiếp khách cho phép xóa mọi tài khoản nhân viên có dữ liệu ràng buộc.

### 21. Admin xử lý hỗ trợ quên mật khẩu

**API:** nhóm `/api/admin/password-recovery`.

1. Admin mở danh sách yêu cầu và lịch sử tương tác; frontend có cơ chế cập nhật để hiển thị thông báo.
2. `GET` trả yêu cầu gần đây, số đang chờ và số hoàn tất chưa đọc.
3. Admin xác minh khách, nhập ghi chú 5–500 ký tự rồi duyệt hoặc từ chối bằng `PATCH /:id`.
4. Duyệt cần xác nhận đã xác minh, yêu cầu còn chờ/còn hạn và khách phù hợp đang hoạt động.
5. Duyệt cho khách tự đặt mật khẩu trong 15 phút; Admin không nhập mật khẩu mới thay khách.
6. Khi khách hoàn tất, Admin có thể đánh dấu đã đọc bằng `POST /:id/seen`.

**Dữ liệu:** `password_recovery_requests`. Xem lịch sử không cung cấp mật khẩu hoặc mã khôi phục gốc của khách.

## E. Quản lý khách hàng và phản hồi

### 22. Quản lý thêm khách hàng

**API:** `POST /api/admin/customers`.

1. Bấm **Thêm khách hàng**; nhập họ tên, email, điện thoại, mật khẩu ban đầu và hồ sơ có sẵn.
2. Bắt buộc nhập ngày sinh `dd/mm/yyyy` và chọn giới tính Nam/Nữ/Khác. Địa chỉ có thể bổ sung sau trong luồng Quản lý tạo khách.
3. Backend kiểm tra ngày nếu đã nhập, email, điện thoại, mật khẩu; băm mật khẩu và lưu trong transaction.
4. Nhu cầu mặc định **Chưa xác định**, sở thích rỗng; không có hai trường này trên form tạo.
5. Khách đăng nhập để bổ sung hồ sơ khi cần.

**Phân biệt:** Admin tạo khách yêu cầu hồ sơ đầy đủ hơn ở form của Admin; không nên mô tả hai form có cùng mức bắt buộc. Với khách được tạo từ luồng Quản lý, cơ chế `/api/surveys/sync` khi khách vào hệ thống vẫn bổ sung khảo sát ALL đang hiệu lực.

### 23. Quản lý tìm kiếm và lọc khách

**API:** `GET /api/admin/customers` với tham số tìm/lọc.

1. Nhập tên/email/điện thoại, nhu cầu, trạng thái, sở thích hoặc tuổi từ–đến.
2. Backend truy vấn khách chưa xóa, nạp sở thích và áp dụng quy tắc lọc dùng chung trong `crm-domain.js`.
3. Trả danh sách phù hợp.

**Quy tắc:** tuổi tính theo ngày sinh đầy đủ, có xét đã qua sinh nhật hay chưa. Khoảng 15–20 nhận người đủ 15 đến hết 20 tuổi; khách chưa có ngày sinh hợp lệ không được coi là khớp một khoảng tuổi. Các nhóm điều kiện được kết hợp đồng thời.

**Dữ liệu:** đọc `users`, `customer_interests`. Lọc không làm thay đổi hồ sơ khách.

### 24. Quản lý xem chi tiết và lịch sử khách

**API:** `GET /api/admin/customers/:id` và `GET /api/admin/customers/:id/history`.

- Chi tiết trả thông tin hồ sơ, sở thích và thời điểm tạo/cập nhật; giao diện chỉ đọc.
- Lịch sử tổng hợp sự kiện tạo hồ sơ, gửi phản hồi, được trả lời, gửi khảo sát và phân trang kết quả.
- Không trả mật khẩu đã băm, không cho Quản lý dùng màn hình này sửa hồ sơ khách hiện có.
- Khách đã xóa không được mở chi tiết/lịch sử từ các API vận hành này; dữ liệu còn lại phục vụ Báo cáo.

**Khái niệm:** lịch sử ở đây là tổng hợp các sự kiện đang có, không phải bản lưu mọi phiên bản nội dung trước khi chỉnh sửa.

### 25. Khóa và mở khóa khách

**API:** `PATCH /api/admin/customers/:id/status`.

1. Quản lý chọn khóa hoặc mở khóa.
2. Backend chỉ nhận `ACTIVE` hoặc `LOCKED`, kiểm tra khách chưa bị xóa.
3. Cập nhật `account_status`; tải lại danh sách.

**Khóa:** giữ tài khoản và dữ liệu, nhưng đăng nhập/API bảo vệ sẽ bị chặn. **Mở khóa:** khôi phục khả năng sử dụng cho tài khoản khóa thông thường.

**Không được mở khóa khách đã xóa.** Trạng thái khóa tạm thời và đánh dấu xóa là hai ý nghĩa khác nhau.

### 26. Quản lý xóa khách và lưu trữ dữ liệu

**API:** `DELETE /api/admin/customers/:id`.

```text
Quản lý khóa khách → xác nhận xóa
→ khóa bản ghi users trong transaction
→ xóa thông tin đăng nhập/liên hệ/khôi phục
→ đánh dấu erased_at và vô hiệu hóa truy cập
→ loại khỏi màn hình vận hành, giữ lịch sử cho Báo cáo
```

| Giữ lại | Xóa/thu hồi hoặc làm trống |
|---|---|
| Mã định danh kỹ thuật để liên kết dữ liệu | Email, số điện thoại, mật khẩu đã băm |
| Họ tên, ngày sinh, giới tính | Địa chỉ |
| Nhu cầu, nhiều sở thích | Mã khôi phục và yêu cầu khôi phục liên quan |
| Phản hồi và câu trả lời Quản lý hiện có | Quyền sử dụng tài khoản, tăng `auth_version` |
| Người nhận khảo sát, lượt gửi và chi tiết câu trả lời | Trường năm sinh phụ bị làm rỗng; ngày sinh vẫn giữ |

**Điều kiện:** Quản lý phải khóa khách trước; Admin dùng API tài khoản riêng thì được xóa trực tiếp.

**Sau xóa:** không hiện trong tài khoản, danh sách/chi tiết/lịch sử khách, phản hồi vận hành và tổng khách trên trang Tổng quan. Không thể tiếp tục sửa câu trả lời của phản hồi đã lưu trữ. Database vẫn giữ các bản ghi liên quan và Báo cáo vẫn tính lịch sử.

**Đây không phải xóa toàn bộ bản ghi khách:** còn `users.id`, trạng thái và metadata kỹ thuật để bảo toàn liên kết nghiệp vụ.

### 27. Trang Tổng quan của Quản lý

**API:** `GET /api/admin/dashboard`.

- Đếm khách chưa xóa.
- Đếm phản hồi chưa giải quyết của khách chưa xóa.
- Đếm khảo sát ở trạng thái mở.
- Trả số liệu để hiển thị các thẻ tổng quan.

**Phân biệt:** Tổng quan phục vụ vận hành hiện tại. Báo cáo phục vụ phân tích, còn tính dữ liệu lịch sử của khách đã xóa; hai tổng số có thể khác nhau đúng thiết kế.

### 28. Quản lý xem và lọc phản hồi

**API:** `GET /api/admin/feedback`.

1. Chọn trạng thái **Tiếp nhận/Đã giải quyết**, từ ngày–đến ngày hoặc xem phản hồi đã ẩn.
2. Backend nối phản hồi với sản phẩm/khách, loại khách đã xóa và áp dụng bộ lọc.
3. Trả nội dung, số sao, tên khách, câu trả lời và revision.

**Thời gian lọc hiện có:** dùng thời điểm trả lời nếu đã có, nếu chưa thì dùng thời điểm tiếp nhận (`COALESCE(replied_at, created_at)`). Vì vậy không nên giải thích bộ lọc này luôn là ngày gửi ban đầu.

**Dữ liệu:** chỉ đọc. Trạng thái chỉ còn hai giá trị nghiệp vụ, không có bước “Đang xử lý” độc lập trên giao diện.

### 29. Quản lý trả lời và chỉnh sửa câu trả lời

**API:** `PATCH /api/admin/feedback/:id`.

1. Với phản hồi chưa trả lời: nhập nội dung, bấm **Trả lời và giải quyết**.
2. Với phản hồi đã trả lời: bấm **Chỉnh sửa**, sửa trong ô điền sẵn rồi **Lưu chỉnh sửa** hoặc **Hủy**.
3. Frontend gửi revision; khi sửa gửi thêm `editReply: true`.
4. Service kiểm tra phản hồi còn tồn tại trong vận hành, phiên bản khớp, câu trả lời 1–5000 ký tự.
5. Lưu nội dung, người xử lý, thời điểm trả lời; tăng revision và đặt **Đã giải quyết**.

**Quy tắc:** sửa là thay câu trả lời hiện tại, không tạo chuỗi hội thoại. Bấm gửi mới lên phản hồi đã có câu trả lời mà không đi theo luồng chỉnh sửa sẽ bị từ chối. Khi khách sửa phản hồi, câu trả lời này bị xóa theo mục 15.

### 30. Quản lý ẩn và khôi phục phản hồi

**API:** `PATCH /api/admin/feedback/:id/visibility`.

- Chỉ ẩn/khôi phục phản hồi đã giải quyết và thuộc khách chưa xóa.
- Cập nhật `is_hidden` và `hidden_at`; không xóa bản ghi, không xóa câu trả lời.
- Dữ liệu ẩn vẫn được tính trong Báo cáo.
- Khách sửa phản hồi làm bỏ cờ ẩn, trở về Tiếp nhận.

**Phân biệt:** Quản lý ẩn phản hồi là trạng thái lưu MySQL dùng chung; khách tự ẩn khảo sát là lựa chọn localStorage trên trình duyệt.

## F. Quản lý khảo sát

### 31. Không gian khảo sát: tìm kiếm, phân trang, khung xem

**API:** `GET /api/admin/surveys`.

1. Quản lý chọn tab Tất cả/Nháp/Mở/Đóng, tìm tiêu đề/mô tả, chọn lọc ngày tạo hoặc ngày kết thúc và khoảng thời gian.
2. Frontend gửi điều kiện cùng trang và số dòng; backend lọc, đếm và chỉ trả trang cần hiển thị.
3. Có thể chọn 10/20/50/100 dòng; bộ đếm trạng thái dùng cùng phạm vi tìm kiếm/thời gian.
4. Bấm xem/sửa/gia hạn mở khung dialog riêng. Danh sách phía sau giữ trang/vị trí cuộn, không phải kéo từ đầu danh sách.
5. Khung có mở rộng, đóng, nút thao tác theo trạng thái và cảnh báo khi đóng phần sửa chưa lưu.

**Dữ liệu:** GET chỉ đọc. Tab, vị trí cuộn, đóng/mở khung là trạng thái giao diện. Khảo sát đóng thủ công không có `due_date` nên không khớp khoảng ngày kết thúc khi bộ lọc yêu cầu ngày cụ thể.

### 32. Tạo và chỉnh sửa khảo sát nháp

**API:** `POST /api/admin/surveys`; `PATCH /api/admin/surveys/:id`.

1. Quản lý bấm tạo khảo sát; có thể đóng giao diện tạo bằng thao tác tương ứng.
2. Nhập tiêu đề, mô tả, câu hỏi, lựa chọn, đánh dấu bắt buộc, phương thức hạn và phạm vi nếu đã xác định.
3. Bắt buộc chọn **Có ngày kết thúc** hoặc **Đóng thủ công**. Ngày kết thúc là trường có điều kiện, không phải nút thiết lập riêng sau khi tạo.
4. Chọn lưu Nháp hoặc lưu và Mở theo dữ liệu form.
5. Backend kiểm tra rồi transaction lưu khảo sát/câu hỏi/lựa chọn; mở thì chạy thêm logic người nhận.

**Quy tắc:** cần ít nhất một câu hỏi; câu chọn đáp án cần danh sách lựa chọn hợp lệ. Nháp được lưu khi chưa có phạm vi, nhưng không được mở khi thiếu phạm vi. Khi sửa nháp, server thay bộ câu hỏi theo nội dung đã gửi.

**Chỉ nháp chưa có lịch sử trả lời được sửa nội dung.** Mở chỉ xem; Đóng không sửa trực tiếp. Muốn sửa khảo sát Mở chưa ai làm phải khóa khẩn cấp trước.

### 33. Chọn phạm vi và tải danh sách người nhận

**API tải danh sách phù hợp:** `POST /api/admin/surveys/recipients-preview`. Tên API là preview nhưng giao diện hiện dùng nút **Tải danh sách để chọn từng khách**, không có nút Xem trước riêng.

| Phạm vi | Lúc mở khảo sát | Khách đăng ký sau |
|---|---|---|
| Tất cả (`ALL`) | Khách đang hoạt động; không kèm bộ lọc | Tiếp tục được đồng bộ khi khảo sát còn mở/còn hạn |
| Theo bộ lọc (`FILTER`) | Tất cả khách hoạt động khớp điều kiện lúc chốt | Không tự gia nhập snapshot |
| Chọn từng khách (`SELECTED`) | Chỉ các mã khách được chọn, còn hợp lệ và khớp bộ lọc đi kèm | Không tự gia nhập |

**Quy tắc bộ lọc:** các nhóm nhu cầu, khoảng tuổi, nhóm sở thích phải đồng thời khớp. Trong danh sách nhiều sở thích, khớp ít nhất một sở thích được chọn là đạt nhóm sở thích. Tuổi tính đủ theo ngày sinh, giới hạn hai đầu được tính cả vào khoảng.

**Nút danh sách:** bấm lần đầu mở danh sách đã lọc, bấm tiếp đóng. ALL/FILTER tự tích tất cả khách trong danh sách tương ứng. Bỏ/tích lại một khách sẽ chuyển sang SELECTED; không tự trở về FILTER dù tích lại đủ. Đổi điều kiện lọc làm xóa lựa chọn cũ để tải lại.

**Lưu trữ:** cấu hình ở `surveys.audience_config`; danh sách thực nhận ở `survey_recipients`. Tải danh sách chưa có nghĩa đã mở/gửi khảo sát.

### 34. Mở và gửi khảo sát

**API mở nháp đã cấu hình:** `POST /api/admin/surveys/:id/send`. Tạo/sửa có trạng thái OPEN cũng gọi nghiệp vụ publish trong transaction.

1. Đọc phạm vi đã lưu trong nháp, kiểm tra chưa quá hạn và có khách đang hoạt động phù hợp.
2. Khóa khảo sát; từ chối trạng thái không hợp lệ hoặc nháp có lịch sử trả lời.
3. Ghi danh sách người nhận, chuyển `OPEN`; bật nhận khách mới chỉ khi phạm vi ALL.
4. Khách đủ điều kiện thấy khảo sát sau khi tải/đồng bộ dữ liệu.

**“Gửi khảo sát” trong bản này là cấp quyền nhận trong hệ thống.** Luồng publish không phải gửi email/SMS hàng loạt.

**Dữ liệu cũ:** API còn nhánh thiết lập phạm vi cho khảo sát OPEN cũ chưa có cấu hình. Khảo sát mới đã chốt phạm vi không có bước bổ sung người nhận tùy ý sau mở.

### 35. Xem khảo sát đang mở và điều kiện các nút

**API xem:** `GET /api/admin/surveys/:id` trả thông tin và câu hỏi/lựa chọn, số lượt trả lời.

| Trạng thái trên giao diện | Nút/thao tác hiện có |
|---|---|
| Nháp | Sửa, Xóa, Mở khảo sát; Mở bị chặn khi chưa có phạm vi |
| Mở | Xem khảo sát, Gia hạn, Đóng ngay, Khóa khẩn cấp |
| Đóng | Xem chi tiết, Lập khảo sát, Mở lại, Ẩn khảo sát |
| Danh sách đã ẩn | Xem chi tiết, Khôi phục khảo sát |

Gia hạn bị vô hiệu hóa với khảo sát đóng thủ công không có ngày kết thúc. Khóa khẩn cấp bị vô hiệu hóa nếu đã có bài trả lời. Mở lại bị chặn khi thiếu phạm vi; backend còn kiểm tra danh sách người nhận và các điều kiện khác.

**Chỉ xem không gửi PATCH cập nhật nội dung.** Nút bị khóa trên UI là hướng dẫn thao tác; backend vẫn kiểm tra lại để tránh gọi API vượt quy tắc.

### 36. Đóng ngay và tự đóng khi hết hạn

**Đóng ngay:** Quản lý gọi `POST /api/admin/surveys/:id/close`. Backend đổi trạng thái sang CLOSED, giữ câu hỏi, người nhận và toàn bộ bài gửi. Những lần gửi mới bị chặn.

**Có ngày kết thúc:**

```text
Hạn 10/11/2026
→ nhận câu trả lời đến hết ngày 10/11 theo giờ Việt Nam
→ từ 00:00 ngày 11/11: hết hiệu lực, chuyển CLOSED
```

`survey-expiry.js` tính ngày UTC+7; có bộ hẹn giờ mốc nửa đêm, đối soát khi khởi động và trước API. Nếu máy chủ đang tắt đúng nửa đêm, không thể ghi DB ngay lúc đó; khi chạy lại hệ thống đối soát và thao tác gửi vẫn kiểm tra hạn.

**Đóng thủ công:** không đặt ngày, không tự đóng do ngày; nhận bài đến khi Quản lý chủ động đóng hoặc thay đổi trạng thái theo luồng hợp lệ.

**Lịch sử:** `auto_closed_at` phân biệt tự hết hạn để hiển thị khảo sát quá hạn chưa làm cho khách. Đóng tay không tự biến bài chưa làm thành bài đã gửi.

### 37. Khóa khẩn cấp để quay lại sửa

**API:** `POST /api/admin/surveys/:id/emergency-lock`.

1. Chỉ nhận khảo sát đang OPEN và chưa có khách gửi bài.
2. Transaction khóa khảo sát, đếm lại bài trả lời.
3. Chuyển về DRAFT, tắt nhận khách mới; giữ cấu hình hạn và phạm vi đã lưu.
4. Quản lý mở sửa, thấy lại cấu hình cũ và chỉ thay phần muốn sửa; lưu xong mới có hiệu lực.

**Nếu đã có một bài gửi:** không được quay về sửa nội dung, phải Đóng ngay hoặc lập khảo sát mới. Khi mở lại từ nháp, hệ thống chốt lại người nhận theo cấu hình đã lưu.

### 38. Gia hạn khảo sát

**API:** `POST /api/admin/surveys/:id/lifecycle`, `action: EXTEND`.

1. Quản lý chọn Gia hạn ở khảo sát đang mở có ngày kết thúc.
2. Nhập hạn mới; frontend gửi xác nhận.
3. Backend kiểm tra trạng thái vẫn OPEN, cấu hình phạm vi hợp lệ, ngày mới không trước hôm nay và phải muộn hơn hạn đang có.
4. Lưu hạn mới, giữ câu hỏi/bài gửi/người nhận; ghi lịch sử nội bộ.

**Ví dụ:** đang có hạn 12/11 thì gia hạn sang 15/11; không dùng gia hạn để đặt lại thành 11/11. Nếu khảo sát đã tự đóng, dùng Mở lại thay vì Gia hạn.

### 39. Mở lại khảo sát đã đóng

**API:** `POST /api/admin/surveys/:id/lifecycle`, `action: REOPEN`.

1. Chọn Mở lại từ khảo sát CLOSED.
2. Xác nhận có ngày kết thúc mới từ hôm nay trở đi hoặc đóng thủ công; form điền lại phương thức đã lưu.
3. Backend kiểm tra đã có phạm vi và người nhận, chuyển OPEN, xóa dấu tự đóng cũ.
4. Giữ nội dung và bài gửi. ALL bổ sung khách đang hoạt động mới; FILTER/SELECTED giữ snapshot cũ.

**Khách đã làm không được gửi lần hai.** Khảo sát cũ thiếu phạm vi/người nhận cần lập nháp mới và cấu hình trước, không bỏ qua kiểm tra để mở tùy ý.

### 40. Lập khảo sát mới từ bản cũ và xóa nháp

**Lập khảo sát — `POST /api/admin/surveys/:id/copy`:** transaction sao chép tiêu đề/mô tả/câu hỏi/lựa chọn, tạo mã mới ở mọi cấp. Bản mới là DRAFT độc lập; không sao chép bài gửi, người nhận, phạm vi hoặc hạn cũ. Cần kiểm tra phương thức hạn và phạm vi trước mở.

**Xóa nháp — `DELETE /api/admin/surveys/:id`:** chỉ xóa DRAFT chưa có bài trả lời. Xóa lựa chọn/câu hỏi/người nhận/lịch sử nội bộ liên quan và khảo sát trong cùng transaction.

**Ví dụ:** khảo sát tháng trước đã có kết quả; lập bản mới cho tháng này tạo đợt khảo sát độc lập. Mở lại bản cũ tiếp tục cùng một đợt và không cho người đã làm gửi lại.

### 41. Quản lý ẩn và khôi phục khảo sát

**API:** `PATCH /api/admin/surveys/:id/visibility`.

- Giao diện hiện đặt nút Ẩn ở khảo sát Đóng; có danh sách đã ẩn để xem/khôi phục.
- Backend cập nhật `is_hidden`, `hidden_at`, không đổi trạng thái, hạn hoặc kết quả.
- API visibility tự nó không yêu cầu khảo sát phải CLOSED. Vì vậy không được coi thao tác ẩn là thao tác đóng.
- Khảo sát ẩn vẫn tính trong Báo cáo. Nếu khảo sát OPEN được đặt ẩn qua API thì cờ ẩn phía Quản lý không chặn khách đủ điều kiện trả lời.

**Khác nhau:** ẩn phía Quản lý lưu MySQL, áp dụng danh sách quản lý; khách tự ẩn lịch sử lưu localStorage của khách.

## G. Báo cáo và vận hành kỹ thuật

### 42. Báo cáo tổng hợp khách hàng, phản hồi và khảo sát

**API:** `GET /api/admin/reports/overview`, chỉ Quản lý.

1. Chọn toàn bộ thời gian hoặc từ ngày–đến ngày.
2. Backend kiểm tra khoảng ngày và đọc các nhóm dữ liệu trong transaction nhất quán.
3. Service tính số lượng, tỷ lệ, phân bố và xu hướng; trả dữ liệu cho giao diện.
4. Chuyển tab Khách hàng/Phản hồi/Kết quả khảo sát để xem các góc phân tích.

| Nhóm | Nội dung chính |
|---|---|
| Khách hàng | Tổng, hoạt động/khóa, hồ sơ đầy đủ, nhóm tuổi, giới tính, nhu cầu, nhiều sở thích |
| Phản hồi | Tổng, người gửi, đã giải quyết/chưa giải quyết, điểm trung bình, hài lòng 4–5 sao, khiếu nại, theo sản phẩm |
| Khảo sát | Trạng thái, người nhận, bài gửi, chưa trả lời, tỷ lệ hoàn thành theo khảo sát |
| Xu hướng | Khách mới và phản hồi theo tháng |

**Phạm vi thời gian:** khách theo ngày tạo tài khoản, phản hồi theo ngày tiếp nhận, khảo sát theo ngày tạo. Kết quả của khảo sát được chọn tính toàn bộ thời gian; hồ sơ và trạng thái là dữ liệu hiện tại, không phải ảnh chụp quá khứ tại ngày lọc.

**Dữ liệu lưu trữ:** khách đã xóa và phản hồi/khảo sát đã ẩn vẫn được tính. Không có mẫu số thì tỷ lệ thể hiện chưa đủ dữ liệu, không giả thành 0%. Một khách nhiều sở thích có thể nằm trong nhiều nhóm nên tổng tỷ lệ sở thích có thể vượt 100%.

### 43. Xem chi tiết kết quả một khảo sát

**API:** `GET /api/admin/reports/survey-detail/:id`.

1. Quản lý bấm Xem chi tiết hoặc mở chi tiết từ Báo cáo.
2. Backend đọc khảo sát, người nhận, bài gửi, câu hỏi, lựa chọn và chi tiết trong cùng phiên đọc nhất quán.
3. Tổng hợp số người trả lời/bỏ qua theo từng câu, phân bố lựa chọn, điểm trung bình và nội dung văn bản.
4. Hiển thị từng lượt gửi và câu trả lời để đối chiếu.

**Cách tính:**

- Số người trả lời câu hỏi là số lượt gửi khác nhau có câu trả lời hợp lệ, không phải số dòng chi tiết.
- Câu nhiều lựa chọn: một người chọn hai đáp án tạo hai dòng nhưng chỉ là một người trả lời câu đó.
- Tỷ lệ mỗi lựa chọn tính trên số người đã trả lời câu hỏi; tổng tỷ lệ câu nhiều lựa chọn có thể lớn hơn 100%.
- Câu văn bản: API tổng hợp trả tối đa 100 mục văn bản trong nhóm `texts`; không nên nói phần tổng hợp này luôn liệt kê vô hạn toàn bộ văn bản.

**Khách đã xóa:** bài và họ tên giữ trong Báo cáo; email đã xóa không được khôi phục. Màn hình kết quả không có nút lịch sử thay đổi; bảng/API lịch sử vòng đời khảo sát vẫn tồn tại nội bộ.

### 44. Xuất CSV và In/Lưu PDF

**Mục đích:** lấy số liệu đang xem ra tài liệu để đọc/chia sẻ.

- **Xuất CSV:** frontend chuyển dữ liệu Báo cáo đã tải của nhóm đang chọn thành file CSV để trình duyệt tải xuống.
- **In/Lưu PDF:** mở hộp thoại in của trình duyệt; chọn máy in hoặc lưu PDF.
- Không tạo thêm khách, phản hồi hoặc câu trả lời trong MySQL.
- Nội dung xuất phụ thuộc nhóm báo cáo và phạm vi đã tải; đây không phải bản sao lưu toàn bộ database.

**Phân biệt:** CSV là định dạng bảng dữ liệu; PDF phục vụ trình bày/in; SQL backup phục hồi cấu trúc và dữ liệu hệ thống.

### 45. Cài đặt dữ liệu, khởi động, kiểm tra và sao lưu

Đây là thao tác kỹ thuật qua terminal, không phải chức năng khách hàng bấm trên website.

| Thao tác | Luồng và kết quả |
|---|---|
| `npm run config` | Chuẩn bị cấu hình `.env` nếu chưa có; cần điền kết nối MySQL trên máy sử dụng |
| `npm run setup` | Đọc cấu hình, tạo DB/bảng; nạp bộ demo hiện hành nếu dữ liệu trống, giữ dữ liệu khi đã có |
| `npm run setup -- --empty` | Chuẩn bị cấu trúc theo luồng setup mà không nạp demo |
| `npm start` | Chạy `server.mysql.js`, chuẩn bị schema cần thiết và phục vụ frontend/API |
| `GET /api/health` | Thử truy vấn MySQL và trả trạng thái hoạt động |
| `npm test` | Chạy bộ kiểm thử Node trong `scripts/*.test.js` |
| Các script kiểm tra DB riêng | Tạo dữ liệu thử theo cơ chế từng script, kiểm tra HTTP/MySQL; không coi là nút nghiệp vụ |
| `npm run db:backup` | Công cụ sao lưu tạo SQL và thông tin đối chiếu tương ứng |
| `npm run db:restore -- <file.sql> --target <database_moi>` | Công cụ hiện có phục hồi vào database đích mới, kiểm tra số bản ghi; không nhập đè tùy ý vào DB đang có |

**Lưu ý vận hành:** startup có các bước chuẩn bị/schema và đối soát nên không nên mô tả chạy server là hoàn toàn chỉ đọc DB. Tài khoản/mật khẩu MySQL, khóa ký JWT và bản sao lưu phải được quản lý riêng, không đưa vào tài liệu chia sẻ công khai. Nội dung tài liệu này không chứa giá trị bí mật trong `.env`.

## H. Những điểm dễ hiểu nhầm

| Cách hiểu dễ nhầm | Cách hiểu đúng trong đồ án |
|---|---|
| Bấm Đăng nhập thì gửi session đến hàm đăng nhập | Gửi email/mật khẩu trong request; xác thực thành công mới cấp token cho phiên |
| Hệ thống kiểm tra họ tên và mật khẩu | Đăng nhập tra theo email và kiểm tra mật khẩu |
| Mọi xử lý đều nằm trong một service riêng | Một số route còn trực tiếp truy vấn DB; khảo sát/phản hồi/báo cáo đã có module nghiệp vụ riêng |
| JWT có chữ ký nên nội dung bí mật | Chữ ký bảo vệ tính toàn vẹn; không tự mã hóa bí mật nội dung |
| Đăng xuất thu hồi mọi token trên mọi thiết bị | Luồng hiện tại xóa thông tin đăng nhập ở trình duyệt; khóa tài khoản/đổi auth_version được kiểm tra phía server |
| Tất cả và Theo bộ lọc đều nhận khách mới mãi | Chỉ ALL tự nhận khách mới khi còn mở/còn hạn; FILTER/SELECTED chốt danh sách |
| Chọn hai sở thích thì khách phải có đủ cả hai | Nhóm sở thích khớp ít nhất một; nhóm nhu cầu và tuổi vẫn phải đồng thời khớp |
| Tuổi chỉ lấy năm hiện tại trừ năm sinh | Phải xét cả ngày/tháng để tính tuổi đủ |
| Nút tải người nhận đã gửi khảo sát | Chỉ tải danh sách; mở/publish mới lưu quyền nhận cho đợt khảo sát |
| Khách đã nhận nghĩa là đã trả lời | Người nhận ở survey_recipients; bài đã gửi ở survey_responses |
| Đóng thủ công là bắt buộc đặt hạn sau đó | Có thể không đặt ngày, Quản lý chủ động đóng |
| Hạn 10/11 thì đầu ngày 10/11 bị đóng | Hết ngày 10/11 mới hết hạn; từ 00:00 ngày 11/11 theo UTC+7 |
| Mở lại cho mọi người làm thêm lần nữa | Người đã gửi vẫn không được gửi lại cùng khảo sát |
| Lập khảo sát là mở lại khảo sát cũ | Lập bản sao tạo nháp độc lập với mã mới và không chép bài gửi |
| Ẩn là đóng hoặc xóa | Chỉ thay trạng thái hiển thị theo phạm vi; dữ liệu vẫn còn |
| Xóa khách là xóa hết dữ liệu khách | Xóa đăng nhập/liên hệ, giữ hồ sơ thống kê và nghiệp vụ để Báo cáo sử dụng |
| Xóa phản hồi cũng chỉ ẩn như xóa khách | Xóa phản hồi của khách là xóa thật bản ghi và câu trả lời liên quan |
| Sửa phản hồi giữ nguyên câu trả lời Quản lý | Xóa câu trả lời cũ và trở về Tiếp nhận để xử lý nội dung mới |
| Tổng quan và Báo cáo phải luôn bằng nhau | Tổng quan loại khách đã xóa; Báo cáo giữ lịch sử |
| Bộ lọc thời gian Báo cáo là lịch sử mọi phiên bản | Lọc theo mốc tạo/tiếp nhận, dùng trạng thái/hồ sơ hiện tại; không phải kho phiên bản quá khứ |
| Ẩn nút trên frontend đã đủ phân quyền | Backend vẫn phải kiểm tra token, vai trò và trạng thái tại API |
| Hệ thống có CRM thì mặc nhiên có đơn hàng/thanh toán | Mã hiện tại tập trung tài khoản, hồ sơ, phản hồi, khảo sát và báo cáo; không tự suy ra chức năng bán hàng/thanh toán |

## I. Bản đồ API để tra cứu

`:id` là mã tài khoản/khảo sát/phản hồi tương ứng, không phải chữ cần nhập nguyên dạng vào URL.

| Nhóm | Phương thức và đường dẫn chính |
|---|---|
| Kiểm tra hệ thống | `GET /api/health` |
| Tự đăng ký/đăng nhập/đăng xuất | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` |
| Phiên và hồ sơ | `GET /api/me`, `PUT /api/me` |
| Mã khôi phục cá nhân | `GET /api/me/recovery-code`, `POST /api/me/recovery-code` |
| Khôi phục mật khẩu | `POST /api/password-recovery/code`, `POST /api/password-recovery/requests`, `GET /api/password-recovery/status`, `POST /api/password-recovery/complete` |
| Khách xem/gửi phản hồi | `GET /api/feedback`, `POST /api/feedback`, `PATCH /api/feedback/:id`, `DELETE /api/feedback/:id` |
| Khách xem/đồng bộ khảo sát | `GET /api/surveys`, `GET /api/survey-status`, `POST /api/surveys/sync` |
| Khách gửi/xem bài khảo sát | `POST /api/surveys/:id/responses`, `GET /api/surveys/:id/my-response` |
| Admin quản trị tài khoản | `GET /api/admin/accounts`, `POST /api/admin/accounts`, `DELETE /api/admin/accounts/:id` |
| Đổi vai trò không hỗ trợ | `PATCH /api/admin/accounts/:id/role` trả 405 |
| Admin hỗ trợ mật khẩu | `GET /api/admin/password-recovery`, `PATCH /api/admin/password-recovery/:id`, `POST /api/admin/password-recovery/:id/seen` |
| Tổng quan Quản lý | `GET /api/admin/dashboard` |
| Khách hàng do Quản lý vận hành | `GET /api/admin/customers`, `POST /api/admin/customers`, `GET /api/admin/customers/:id`, `GET /api/admin/customers/:id/history`, `PATCH /api/admin/customers/:id/status`, `DELETE /api/admin/customers/:id` |
| Phản hồi phía Quản lý | `GET /api/admin/feedback`, `PATCH /api/admin/feedback/:id`, `PATCH /api/admin/feedback/:id/visibility` |
| Danh sách/tạo/sửa/xóa khảo sát | `GET /api/admin/surveys`, `POST /api/admin/surveys`, `GET /api/admin/surveys/:id`, `PATCH /api/admin/surveys/:id`, `DELETE /api/admin/surveys/:id` |
| Người nhận/mở khảo sát | `POST /api/admin/surveys/recipients-preview`, `POST /api/admin/surveys/:id/send` |
| Đóng/khóa khẩn cấp | `POST /api/admin/surveys/:id/close`, `POST /api/admin/surveys/:id/emergency-lock` |
| Gia hạn/mở lại | `POST /api/admin/surveys/:id/lifecycle` với action tương ứng |
| Lịch sử vòng đời nội bộ | `GET /api/admin/surveys/:id/lifecycle`; không có nút lịch sử trong giao diện kết quả hiện tại |
| Sao chép/ẩn khảo sát | `POST /api/admin/surveys/:id/copy`, `PATCH /api/admin/surveys/:id/visibility` |
| Danh sách bài trả lời vận hành | `GET /api/admin/surveys/:id/responses`; loại khách đã xóa |
| Báo cáo tổng hợp/chi tiết | `GET /api/admin/reports/overview`, `GET /api/admin/reports/survey-detail/:id`; giữ lịch sử khách đã xóa |

## J. Cách diễn đạt khi trình bày đồ án

### J1. Công thức giải thích một chức năng

> “Người dùng [vai trò] thực hiện [thao tác]. Giao diện gửi request [phương thức/đường dẫn]. Backend xác thực, phân quyền và kiểm tra [điều kiện]. Hàm xử lý/service đọc hoặc cập nhật [dữ liệu]. Thành công thì trả response và giao diện [kết quả]; không hợp lệ thì từ chối mà không lưu dữ liệu dở dang.”

### J2. Ví dụ trình bày đăng nhập

> “Khách nhập email và mật khẩu rồi bấm Đăng nhập. Frontend gửi request đến API đăng nhập. Backend tìm tài khoản trong MySQL, dùng bcrypt kiểm tra mật khẩu, kiểm tra trạng thái và vai trò. Hợp lệ thì cấp JWT trong cookie HttpOnly, trả thông tin khách để giao diện hiển thị trang phù hợp. Những request nghiệp vụ tiếp theo tiếp tục được middleware xác thực và phân quyền.”

### J3. Ví dụ trình bày tạo và gửi khảo sát

> “Quản lý tạo khảo sát, chọn phương thức kết thúc và phạm vi người nhận. Backend kiểm tra nội dung, sau đó lưu khảo sát, câu hỏi, lựa chọn trong transaction. Khi mở, service chốt người nhận hợp lệ rồi chuyển trạng thái Mở. Khách thuộc danh sách được làm khảo sát một lần; khi gửi, backend kiểm tra lại trạng thái, hạn và danh sách nhận trước khi lưu bài cùng chi tiết trả lời.”

### J4. Ví dụ trình bày sửa phản hồi

> “Khách chỉnh sửa phản hồi của mình và gửi kèm revision. Backend kiểm tra chủ sở hữu và phiên bản, lưu nội dung mới, xóa câu trả lời cũ của Quản lý và chuyển về Tiếp nhận. Revision ngăn khách lưu đè lên dữ liệu vừa được cập nhật từ phiên khác.”

### J5. Các file mã nguồn chính đã dùng để đối chiếu

Đường dẫn dưới đây tính từ thư mục gốc repository, để tài liệu vẫn dùng được khi người khác tải repo.

| File | Nội dung liên quan |
|---|---|
| `server.mysql.js` | API chính, đăng ký/đăng nhập, xác thực/phân quyền, hồ sơ, tài khoản, kết nối module |
| `app.js` | Giao diện và điều phối thao tác khách |
| `admin.js`, `role-ui.js`, `staff-controller.js` | Phiên nhân viên, giao diện Admin/Quản lý, điều phối sự kiện |
| `staff-surveys.js` | Không gian khảo sát, khung xem/sửa, nút theo trạng thái |
| `customer-session.js` | Cookie và thời hạn phiên khách |
| `birth-date.js`, `crm-domain.js`, `crm-validation.js` | Ngày sinh, tuổi, danh mục, bộ lọc, kiểm tra dữ liệu |
| `customer-fields.js`, `customer-interests.js` | Biểu mẫu và lưu/nạp nhiều sở thích |
| `feedback-service.js` | Khách sửa/xóa phản hồi, Quản lý trả lời/chỉnh sửa |
| `customer-retention.js`, `customer-history.js` | Xóa tài khoản giữ lịch sử, xem lịch sử khách |
| `customer-survey-review.js` | Khách xem bài khảo sát đã gửi |
| `survey-service.js`, `survey-audience.js`, `survey-enrollment.js` | Nội dung khảo sát, người nhận, mở/gửi bài, nhận khách mới |
| `survey-expiry.js`, `survey-lifecycle.js` | Tự hết hạn, gia hạn, mở lại, lịch sử nội bộ |
| `survey-copy.js`, `survey-visibility.js` | Sao chép, ẩn/khôi phục, tìm/lọc/phân trang khảo sát |
| `password-recovery.js`, `recovery-codes.js` | Hỗ trợ quên mật khẩu và mã cá nhân |
| `recovery-client.js`, `recovery-admin.js` | Giao diện khôi phục phía khách và Admin |
| `reports-service.js`, `reports.js` | Tổng hợp số liệu, chi tiết câu hỏi, CSV, in/PDF |
| `public-assets.js` | Danh sách tài nguyên web được phép phục vụ công khai |
| `scripts/setup-project.js`, `scripts/current-demo.js`, `scripts/database-backup.js` | Chuẩn bị cài đặt, chọn bộ demo, sao lưu/phục hồi |

