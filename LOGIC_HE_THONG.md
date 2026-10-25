# Giải thích logic xử lý và thay đổi dữ liệu Backline CRM

Tài liệu dành cho người học: đọc từ thao tác trên màn hình đến đoạn code xử lý và bảng MySQL bị tác động. Mô tả theo code hiện tại, không phải danh sách tính năng dự kiến. Các ghi chú `LOGIC` trong mã nguồn là điểm bắt đầu để đọc từng luồng.

## 1. Một lần bấm Lưu hoạt động như thế nào?

```text
Người dùng nhập form, bấm Lưu
  -> JavaScript lấy dữ liệu và kiểm tra trên giao diện
  -> fetch gửi JSON đến API của Node/Express
  -> backend xác thực đăng nhập, quyền và dữ liệu
  -> MySQL INSERT / UPDATE / DELETE
  -> backend trả JSON thành công hoặc lỗi
  -> frontend cập nhật dữ liệu trong bộ nhớ hoặc tải lại danh sách
  -> render() vẽ lại HTML
```

Ví dụ: khách sửa tên thành “Nguyễn An”. `H.prof()` trong `app.js` gửi `PUT /api/me`. Backend dùng ID từ phiên đăng nhập để cập nhật `users.full_name`, đọc lại user và trả về. Frontend nhận user đó vào biến `me`, rồi gọi `render()`. Tên trên màn hình đổi vì dữ liệu đã lưu thành công, không phải vì chỉ thay một dòng chữ HTML.

Nếu API báo lỗi, `await api(...)` ném lỗi và không chạy các dòng cập nhật thành công phía sau. Tuy nhiên một chức năng có nhiều request riêng vẫn có thể thành công một phần; xem ví dụ tạo và gửi khảo sát ở mục 6.

## 2. Những từ thường gặp trong code

| Thành phần | Hiểu đơn giản |
| --- | --- |
| `GET` | Đọc dữ liệu; các API lịch sử khôi phục có ngoại lệ cập nhật trạng thái hết hạn khi đọc. |
| `POST` | Tạo bản ghi hoặc thực hiện thao tác như gửi/đóng khảo sát. |
| `PUT` / `PATCH` | Gửi dữ liệu để cập nhật bản ghi. Phạm vi cập nhật thực tế do code API quyết định. |
| `DELETE` | Xóa thật nếu API và ràng buộc DB cho phép. Không đồng nghĩa với ẩn. |
| `req.body` | JSON frontend gửi lên. Phải kiểm tra vì có thể bị sửa ngoài giao diện. |
| `req.params.id` | ID nằm trong đường dẫn, ví dụ `/surveys/abc/close`. |
| `req.user` | User được backend xác thực từ token và đọc lại trong DB. |
| `?` trong SQL | Vị trí tham số, giá trị truyền riêng vào `db.execute(sql, values)`. Không nối trực tiếp nội dung form vào SQL. |
| `affectedRows` | Số bản ghi SQL tác động, dùng để biết cập nhật/xóa có khớp bản ghi hay không. |
| `render()` | Vẽ lại giao diện, tự nó không lưu MySQL. |
| `esc()` | Chuyển ký tự đặc biệt trước khi chèn vào HTML, tránh nội dung khách nhập bị hiểu thành thẻ/script. |

### Transaction: lưu tất cả hoặc không lưu gì

Một khảo sát có phiếu, nhiều câu hỏi và nhiều lựa chọn. Nếu chỉ lưu phiếu mà lỗi khi lưu câu hỏi, dữ liệu sẽ dang dở. Vì vậy code dùng:

```js
await connection.beginTransaction(); // Bắt đầu nhóm thao tác.
// Thực hiện nhiều câu SQL trên CÙNG connection.
await connection.commit();           // Chấp nhận toàn bộ thay đổi.
// Nếu lỗi: await connection.rollback(); -> hủy các thay đổi chưa commit.
// finally: connection.release(); -> trả kết nối về pool, không phải xóa dữ liệu.
```

`FOR UPDATE` khóa bản ghi trong transaction để hạn chế hai thao tác đồng thời tranh nhau sửa. Không phải API nào hiện tại cũng sử dụng khóa; không được suy ra mọi luồng đều chống được mọi xung đột đồng thời.

## 3. Dữ liệu ở đâu? Tắt trình duyệt có mất không?

| Nơi lưu | Ví dụ | Ý nghĩa |
| --- | --- | --- |
| MySQL | `users`, `feedback`, `surveys`, câu trả lời | Dữ liệu dùng chung, tồn tại sau khi đóng trình duyệt/server. |
| Biến JavaScript trong RAM | `me`, `SV`, `DONE`, `FB`, `customers`, `surveys` | Bản dữ liệu đang hiển thị; tải lại trang thì phải lấy lại từ API. |
| `localStorage` | ID khảo sát khách đã ẩn, khóa theo email | Ghi nhớ trên trình duyệt hiện tại, không đồng bộ sang thiết bị khác. |
| `sessionStorage` | Token nhân viên, cờ hoàn thiện hồ sơ, token phiên khôi phục | Theo phiên của tab; không phải bảng dữ liệu nghiệp vụ. |
| Cookie HttpOnly | `backline_customer_session` | Giữ phiên đăng nhập khách; browser gửi tự động, JavaScript không đọc được. |

Mật khẩu không lưu dạng rõ trong DB. `password_hash` là kết quả bcrypt, không phải mật khẩu có thể bấm mắt để đọc lại. Nút mắt chỉ đổi kiểu trường nhập `password`/`text` của dữ liệu người dùng đang gõ.

## 4. Đăng ký, đăng nhập và hồ sơ khách hàng

### Đăng ký

- Bắt đầu ở `H.reg()` trong `app.js`: đọc form, kiểm tra tên/email/điện thoại/ngày sinh/giới tính/mật khẩu nhập lại.
- `BirthDate.parse()` đổi `dd/mm/yyyy` thành `yyyy-mm-dd`; ngày không hợp lệ hoặc trong tương lai bị từ chối.
- `POST /api/auth/register` trong `server.mysql.js` kiểm tra lại dữ liệu, băm mật khẩu bằng bcrypt.
- Transaction tạo `users` và mã khôi phục trong `customer_recovery_codes`. Email/điện thoại trùng trả lỗi `409`.
- Sau commit mới cấp phiên đăng nhập. Mã khôi phục gốc chỉ trả cho khách một lần; DB chỉ giữ hash.
- Giao diện chuyển sang luồng hoàn thiện hồ sơ, không cho dùng khảo sát ngay khi thông tin còn thiếu.

### Đăng nhập và ghi nhớ đăng nhập

`H.login()` gửi `POST /api/auth/login`. Backend tìm email, so sánh mật khẩu với hash, kiểm tra tài khoản `ACTIVE`, cổng đăng nhập và vai trò rồi cấp token.

Trong `customer-session.js`: khách tích ghi nhớ nhận token và cookie 7 ngày. Không tích thì token 8 giờ và cookie phiên. Admin/Quản lý sử dụng Bearer token trong `sessionStorage`, không dùng cookie khách hàng.

Middleware `auth` đọc lại user ở mỗi request: tài khoản bị khóa hoặc token có `auth_version` cũ sẽ bị từ chối. Đăng xuất xóa cookie và dọn trạng thái trên giao diện; không xóa tài khoản, phản hồi hoặc khảo sát đã làm. Xóa cookie không phải cơ chế thu hồi mọi bản sao token; đổi mật khẩu tăng `auth_version` mới làm token cũ mất hiệu lực trên server.

### Hoàn thiện/lưu hồ sơ

`applyProfileGate()` tính hồ sơ còn thiếu và mở thông báo bắt buộc. Bấm OK chỉ chuyển sang form, chưa ghi DB. `H.prof()` mới là nơi gửi lưu:

1. Kiểm tra đủ tên, điện thoại, địa chỉ, ngày sinh, giới tính và nhu cầu.
2. `PUT /api/me` cập nhật user có ID là `req.user.id`; không sửa user khác qua ID tự nhập.
3. Server đọc lại user, frontend thay `me` bằng kết quả đó.
4. Nếu hồ sơ đủ, bỏ chặn, đóng thông báo, tải khảo sát rồi quay lại trang khảo sát.

“Chưa xác định” là một nhu cầu hợp lệ; khác với giá trị rỗng của “Vui lòng chọn nhu cầu sử dụng”.

Lưu ý hiện tại: frontend yêu cầu hồ sơ đầy đủ chặt hơn backend. API có kiểm tra tên/điện thoại/nhu cầu/ngày được gửi nhưng chưa bắt địa chỉ và giới tính phải đầy đủ như giao diện. Cổng hoàn thiện hồ sơ cũng là logic giao diện, chưa phải middleware chặn tất cả API nghiệp vụ. Đây là điểm cần gia cố nếu đưa vào vận hành thật, không phải bảo đảm đã có.

## 5. Admin quản lý tài khoản; Quản lý quản lý khách

Code liên quan: `role-ui.js` dựng màn hình, `staff-controller.js` bắt sự kiện, `server.mysql.js` thực hiện SQL.

| Thao tác | API | Thay đổi dữ liệu |
| --- | --- | --- |
| Admin thêm tài khoản | `POST /api/admin/accounts` | `INSERT users`, role MANAGER/CUSTOMER, mật khẩu băm. |
| Đổi role tài khoản cũ | `PATCH /api/admin/accounts/:id/role` | Không ghi; trả `405`, chức năng đã bỏ. |
| Admin xóa tài khoản | `DELETE /api/admin/accounts/:id` | `DELETE users` nếu không vướng các điều kiện bảo vệ. |
| Quản lý thêm khách | `POST /api/admin/customers` | `INSERT users` với role CUSTOMER. |
| Quản lý xem chi tiết khách | `GET /api/admin/customers/:id` | Chỉ đọc, pop-up không có chức năng sửa hồ sơ. |
| Quản lý khóa/mở khách | `PATCH /api/admin/customers/:id/status` | `UPDATE users.account_status`, không xóa lịch sử. |
| Quản lý xóa khách | `DELETE /api/admin/customers/:id` | Xóa thật khách chưa có phản hồi/lượt trả lời. |

Xóa tài khoản còn bị chặn khi tự xóa chính mình, xóa Admin cuối cùng, khách đã có lịch sử phản hồi/khảo sát hoặc tài khoản đã tạo khảo sát/trả lời phản hồi. Ràng buộc khóa ngoại trong DB cũng có thể từ chối xóa. Với người đã có lịch sử, khóa tài khoản giúp giữ dữ liệu tham chiếu.

**Điểm dễ nhầm:** đường dẫn `/api/admin/...` là tên kỹ thuật cũ. Hàm middleware tên `admin` thực tế phân vai theo `managerOperationRoute()`: nhóm khách hàng/phản hồi/báo cáo/khảo sát dành cho MANAGER, nhóm tài khoản và lịch sử khôi phục dành cho ADMIN. Hàm `staff` hiện cũng chỉ cho MANAGER. Không đoán quyền chỉ dựa vào tên hàm hoặc URL.

Tìm kiếm/lọc không làm đổi bản ghi. Lọc tài khoản diễn ra trên danh sách frontend đã tải; lọc khách/phản hồi/khảo sát gửi query lên API để SELECT theo điều kiện.

## 6. Vòng đời khảo sát

Các bảng chính: `surveys` -> `survey_questions` -> `question_options`. Khi khách trả lời: `survey_responses` -> `response_details`. `survey_recipients` lưu danh sách đã gửi.

| Tình trạng hiện tại | Có thể làm gì? |
| --- | --- |
| DRAFT | Sửa nội dung, mở/gửi hoặc đóng bằng API đóng riêng. Khách không thấy. |
| OPEN, chưa có lượt trả lời | Có thể đổi về DRAFT để sửa; cũng có thể đóng ngay. |
| OPEN, đã có lượt trả lời | Không sửa nội dung/không về DRAFT; vẫn đóng ngay được. |
| OPEN, quá hạn | Không nhận lượt trả lời mới; không tự ghi CLOSED vào DB. |
| CLOSED | Không sửa/mở lại qua luồng hiện tại; xem chi tiết, sao chép, ẩn/khôi phục danh sách. |

### Tạo và gửi

`staffForms.surveyForm()` gom câu hỏi rồi gọi `POST /api/admin/surveys`. Backend transaction ghi phiếu, câu hỏi và lựa chọn. ONE/MULTI cần ít nhất hai lựa chọn; lỗi thì rollback cả phiếu.

Nếu chọn OPEN lúc tạo, frontend gọi thêm `POST /api/admin/surveys/:id/send`. API này chuyển OPEN, tìm CUSTOMER đang ACTIVE và `INSERT IGNORE` vào `survey_recipients`, tránh trùng người nhận khi gửi lại.

Hai request tạo và gửi không nằm trong cùng transaction: nếu tạo thành công nhưng gửi lỗi, phiếu vừa tạo vẫn tồn tại. Không bấm tạo lại ngay mà nên tải lại danh sách để kiểm tra.

Hiện `GET /api/surveys` lấy mọi khảo sát OPEN có câu hỏi, chưa lọc theo `survey_recipients`. Vì vậy danh sách người nhận đang phục vụ ghi nhận gửi/báo cáo, chưa phải danh sách giới hạn ai được thấy phiếu. Khách tải dữ liệu khi đăng nhập, khôi phục phiên hoặc chọn mục Khảo sát; chưa có WebSocket/polling khảo sát liên tục để đẩy tức thời vào tab đang đứng yên.

### Sửa nội dung

`staffActions['edit-survey']` tải chi tiết. Nếu đang OPEN, nó gọi PATCH để chuyển thật về DRAFT trước khi mở editor; backend chỉ cho phép nếu chưa có lượt trả lời. Vì vậy bấm Hủy editor không tự chuyển lại OPEN.

`staffForms.surveyEditor()` gửi toàn bộ nội dung. Backend transaction UPDATE phiếu, DELETE bộ câu hỏi cũ rồi INSERT lại câu hỏi/lựa chọn mới. Đây không phải sửa riêng từng câu. Lỗi giữa chừng rollback sẽ giữ bộ cũ.

### Lập khảo sát từ khảo sát cũ

`survey-copy.js`, hàm `copySurvey()`: khóa phiếu nguồn, đọc câu hỏi/lựa chọn, tạo phiếu mới và UUID mới cho tất cả các cấp. Phiếu mới luôn DRAFT, không có hạn cũ, người nhận hay câu trả lời cũ. Bản sao độc lập với nguồn.

Bấm “Lập khảo sát” đã tạo bản ghi DB trước khi mở editor; hủy editor không xóa bản nháp đó.

### Đóng ngay và ẩn

- `POST .../:id/close`: UPDATE trạng thái DRAFT/OPEN thành CLOSED. Không đợi đủ người trả lời, không xóa kết quả.
- `survey-visibility.js`: PATCH visibility chỉ đổi `is_hidden`, `hidden_at` trong MySQL, dùng chung cho danh sách Quản lý.
- Ẩn không đóng khảo sát. Khách vẫn có thể làm phiếu OPEN chưa quá hạn; báo cáo vẫn tính dữ liệu đã ẩn.
- Khôi phục chỉ đưa lại vào danh sách; không tự mở lại CLOSED hay gia hạn.
- Hiện không có API xóa thật khảo sát trong mã đang chạy. Không xem nút Ẩn như nút DELETE.

### Khách trả lời và ẩn lịch sử

`H.sv()` kiểm tra câu bắt buộc, gom `answers.q0`, `q1`, ...; MULTI là mảng lựa chọn, RATING là số sao. API `POST /api/surveys/:id/responses` kiểm tra OPEN/hạn, tạo lượt gửi và chi tiết trong transaction. UNIQUE cặp khảo sát/khách chặn gửi hai lần. Thành công mới cập nhật `DONE[email][id]` bằng ngày server trả về.

Frontend phân nhóm: chưa trả lời + chưa quá hạn là đang chờ; đã trả lời hoặc quá hạn chưa trả lời là “Đã hoàn thành”. Quá hạn không có nghĩa đã nộp bài, nên thẻ “Khảo sát đã gửi” chỉ đếm `DONE`, không đếm phiếu quá hạn chưa trả lời.

`hideSurvey()` / `restoreSurvey()` chỉ thêm/bỏ ID trong localStorage theo email. Không ghi MySQL, không xóa bài, không đổi trạng thái khảo sát. Xóa dữ liệu trình duyệt hoặc đổi thiết bị có thể làm danh sách ẩn cục bộ khác nhau.

Các nhóm khách chỉ dựng từ danh sách OPEN API trả về. Khi Quản lý đóng phiếu, phiếu đó không còn được endpoint này trả về, kể cả đã làm; không nên hiểu giao diện hiện tại là kho lịch sử đầy đủ mọi phiếu CLOSED.

Giới hạn cần lưu ý: API gửi bài đã kiểm tra TEXT bắt buộc nhưng chưa kiểm tra đầy đủ ONE/MULTI/RATING bắt buộc giống frontend. Kiểm tra OPEN diễn ra trước transaction, chưa khóa phiếu cùng lúc đóng/gửi. Đây là các điểm nên tăng cường kiểm tra backend và đồng thời nếu triển khai thật; tài liệu này chưa sửa hành vi đó.

## 7. Phản hồi của khách và trả lời của Quản lý

`H.fb()` kiểm tra sản phẩm, sao, nội dung rồi POST. Backend kiểm tra sản phẩm/loại hợp lệ, sao nguyên 1–5 và nội dung trim ít nhất 1 ký tự; INSERT `feedback` với `customer_id` từ phiên. Ngày nhận và trạng thái NEW được DB tạo mặc định. Sau thành công frontend mới thêm bản ghi trả về vào `FB`.

`staffActions['save-feedback']` gửi PATCH với `status`, `reply`. Backend dùng thứ tự:

```text
NEW (0) -> IN_PROGRESS (1) -> RESOLVED (2)
```

Không được đi lùi. Code cho phép giữ nguyên trạng thái hoặc đi tiến, kể cả NEW thẳng RESOLVED; không bắt buộc qua từng bước. RESOLVED phải có nội dung trả lời.

Có nội dung trả lời thì ghi `replied_by` và `replied_at = NOW()`. Nếu sửa/lưu lại câu trả lời, thời gian đó được cập nhật lại: hiện nó là **thời điểm trả lời gần nhất**, không phải mốc xử lý xong đầu tiên bất biến. Gửi reply rỗng sẽ ghi nội dung/người trả lời về null nhưng giữ thời gian cũ theo câu SQL hiện tại.

Ẩn/khôi phục phản hồi chỉ áp dụng RESOLVED, cập nhật `is_hidden` và `hidden_at`, không DELETE. Phản hồi vẫn nằm trong báo cáo và khách vẫn đọc được theo API của họ.

Bộ lọc thời gian danh sách dùng `DATE(COALESCE(replied_at, created_at))`: có ngày trả lời thì lọc ngày trả lời, chưa có thì lọc ngày tiếp nhận. Không phải mọi dòng đều lọc theo duy nhất “ngày xử lý xong”.

## 8. Quên mật khẩu và thông báo cho Admin

Code: `recovery-client.js` (khách), `recovery-codes.js` (mã cá nhân), `password-recovery.js` (yêu cầu/đổi), `recovery-admin.js` (Admin).

### Có mã cá nhân

Email + mã -> `POST /api/password-recovery/code` -> so sánh hash, kiểm tra khách ACTIVE và mã chưa dùng -> tạo yêu cầu APPROVED còn 15 phút. Bước này chỉ cấp quyền đổi, chưa đổi mật khẩu.

### Mất/chưa có mã

Gửi email + điện thoại + lý do -> `POST .../requests` tạo PENDING 30 phút. Admin xác minh chủ tài khoản bên ngoài, ghi chú và tích đã xác minh rồi duyệt. Duyệt chuyển APPROVED 15 phút; từ chối chuyển REJECTED. Email/điện thoại trùng không tự chứng minh quyền sở hữu để đổi ngay.

### Khách nhập mật khẩu mới và xác nhận

`POST /api/password-recovery/complete` kiểm tra token yêu cầu, mật khẩu nhập lại, trạng thái/hạn. Trong transaction khóa và kiểm tra lại user/yêu cầu, rồi:

1. Vô hiệu mã khôi phục cũ.
2. UPDATE `users.password_hash`, tăng `auth_version` để các token đăng nhập cũ bị từ chối.
3. Chuyển yêu cầu COMPLETED, ghi `completed_at`, đặt `completion_seen = FALSE`.
4. Hủy các yêu cầu PENDING/APPROVED khác của khách.
5. Cấp mã khôi phục mới, commit, trả mã gốc một lần cho khách lưu.

Admin đọc lịch sử hoàn tất và đánh dấu đã đọc qua `POST .../:id/seen`, chỉ đổi `completion_seen`. Không gửi email, không có mật khẩu tạm, Admin không đọc được mật khẩu/mã gốc. Token phiên khôi phục lưu sessionStorage; mã gốc chỉ ở bộ nhớ giao diện, không lưu localStorage.

Các API đọc trạng thái/danh sách còn gọi hàm chuyển yêu cầu hết hạn thành EXPIRED. Vì vậy riêng nhóm này, GET có thể kèm cập nhật trạng thái hết hạn; không được nói tuyệt đối mọi GET trong dự án chỉ đọc.

## 9. Báo cáo có sửa dữ liệu không?

`reports-service.js` đọc MySQL trong transaction REPEATABLE READ để các số liệu cùng một ảnh chụp nhất quán, sau đó `buildOverview()` / `aggregateQuestion()` tính toán. Không ghi các tỷ lệ ngược vào bảng nghiệp vụ. Commit ở đây là kết thúc transaction đọc, không tạo bản ghi báo cáo mới.

- Báo cáo khách: số lượng, trạng thái, nhóm tuổi/giới tính/nhu cầu; tuổi hiện tính gần đúng theo năm hiện tại trừ năm sinh.
- Báo cáo phản hồi: tổng, điểm sao trung bình, tỷ lệ xử lý, hài lòng (4–5 sao), khiếu nại, phân bố theo sản phẩm.
- Báo cáo khảo sát: phiếu, lượt trả lời, người nhận, hoàn thành và kết quả từng câu.
- Tỷ lệ hoàn thành khảo sát = số người đã trả lời thuộc danh sách nhận / số người nhận. Người trả lời ngoài danh sách được tách riêng.
- ONE/MULTI tính từng lựa chọn trên số người có trả lời câu đó. MULTI có thể tổng vượt 100% vì một người được chọn nhiều phương án.
- Mẫu số bằng 0 trả `null` để thể hiện chưa có cơ sở tính, không bịa 0%.
- Dữ liệu đã ẩn vẫn tính. “Ẩn khỏi danh sách” không đồng nghĩa “loại khỏi báo cáo”.
- Khoảng ngày tổng quan lọc theo ngày tạo của từng nhóm: ngày tạo khách, ngày nhận phản hồi, ngày tạo khảo sát. Lượt trả lời của các khảo sát được chọn vẫn là tổng lượt của phiếu, không tự giới hạn theo ngày nộp bài trong khoảng đó.
- Chi tiết khảo sát đọc toàn bộ lượt nộp của phiếu; ví dụ câu TEXT trong phần tổng hợp giới hạn 100 dòng, không phải toàn bộ dữ liệu đã bị cắt trong DB.

## 10. Cách tìm đúng đoạn để đọc và kiểm tra

| Muốn hiểu | Đọc ở đâu trước? |
| --- | --- |
| Bấm nút khách, gửi form | `app.js`: `H`, các sự kiện `submit`/`click`. |
| Cấu trúc HTML khách | `app.js`: `auth`, `main`, `svList`, `svForm`, `fbView`, `profView`. |
| Bấm nút Admin/Quản lý | `staff-controller.js`: `staffActions`, `staffForms`. |
| Tạo/sửa câu hỏi trên màn hình | `staff-surveys.js`, sau đó `staff-controller.js`. |
| Kiểm tra quyền, SQL chính | `server.mysql.js`: tìm tên endpoint bằng Ctrl+F. |
| Ẩn/sao chép khảo sát | `survey-visibility.js`, `survey-copy.js`. |
| Công thức thống kê | `reports-service.js`; thêm giải thích ở `REPORTS.md`. |
| Quên mật khẩu | `recovery-codes.js`, `password-recovery.js`, `PASSWORD_RECOVERY.md`. |
| Bảng, mặc định và khóa ngoại | `database/schema.sql` và các hàm `ensureSchema` trong module. |
| Khởi tạo dữ liệu mẫu | `seed()` trong server; bộ demo riêng ở `scripts/setup-demo.js`, `scripts/seed-demo.js`, `database/demo-data.js`. |

`staff-controller.js` dùng `runStaffTask()` khóa thao tác cùng khóa để chống bấm lặp trong tab. `loadStaffCollection()` bỏ kết quả tải cũ/sai phiên để không ghi đè màn hình. Đây là cơ chế frontend, không thay thế kiểm tra quyền và transaction backend. Giao diện khách hiện không dùng cùng khóa tác vụ đó.

Khi tìm hiểu một chức năng, bạn có thể làm theo thứ tự: tìm `data-act`/`data-action` hoặc ID form -> tìm handler -> xem URL API và JSON gửi -> tìm route backend -> xác định câu SQL, bảng và điều kiện WHERE -> xem frontend làm gì sau `await` thành công.

Để tự kiểm chứng, dùng dữ liệu thử: mở DevTools > Network, thực hiện thao tác, xem method/URL/status và dữ liệu trả về; kiểm tra đúng bản ghi trong MySQL. Không chia sẻ token, cookie, mật khẩu hoặc mã khôi phục trong ảnh/log. Không dùng tài khoản thật để thử DELETE.

Chạy `npm test` để kiểm tra các quy tắc đã có bài test. Test đạt không đồng nghĩa mọi trường hợp thực tế hoặc mọi xung đột đồng thời đều đã được bao phủ.
