# Các mục đạt một phần và chưa đạt của Backline CRM

> **Cập nhật sau khắc phục 01/11/2026:** nội dung phía dưới là đánh giá trước sửa để lưu vết. Kết quả mới xem [KET_QUA_KHAC_PHUC.md](KET_QUA_KHAC_PHUC.md): chín mục kỹ thuật đã triển khai và kiểm chứng; TL01 đã có bản hiệu chỉnh nhưng còn thiếu đề bài/rubric gốc để xác nhận chính thức. Không dùng trạng thái trước sửa bên dưới làm kết luận cho mã nguồn hiện tại.

Ngày kiểm tra: **01/11/2026**, theo giờ Việt Nam.

Tài liệu liệt kê những phần còn cần hoàn thiện sau khi cập nhật database, kèm cách sửa ngay dưới từng mục. Đây là đánh giá kỹ thuật để tổ chức công việc, không phải bảng điểm chính thức của giảng viên.

## 1. Phạm vi và kết quả kiểm tra mới

Đã đọc database được cấu hình trong `.env`, đối chiếu với số liệu API của máy chủ đang chạy, kiểm tra mã nguồn và chạy lại các bài kiểm thử. Việc kiểm tra database hiện tại chỉ đọc dữ liệu tổng hợp. Các phép thử tạo, sửa, xóa và đổi mật khẩu chạy trên database cách ly rồi tự xóa.

| Nội dung | Kết quả hiện tại |
| --- | --- |
| Database đang cấu hình | `backline_crm` |
| Tài khoản | 1 Admin, **2 Quản lý, 12 Khách hàng** |
| Dữ liệu nghiệp vụ | 14 sản phẩm, **6 khảo sát, 36 phản hồi, 17 lượt trả lời** |
| Kết nối máy chủ và MySQL | `/api/health` trả HTTP 200, `ok=true` |
| Tài khoản Quản lý mẫu | Đăng nhập thành công; báo cáo API khớp số lượng đọc trực tiếp từ database |
| Bộ kiểm thử có sẵn | **100/101 đạt**; 1 bài lỗi do thiếu `.env.example` |
| Kiểm tra HTTP và MySQL cách ly | **147/153 đạt**; 6 tình huống không đạt thuộc kiểm tra hồ sơ và đáp án khảo sát |

**Đã bỏ khỏi danh sách thiếu sót:** thiếu số lượng khách demo và không đăng nhập được tài khoản Quản lý mẫu. Hai vấn đề này đã được khắc phục trong lần kiểm tra mới.

Database có một khách thiếu địa chỉ. Đây có thể là dữ liệu chủ ý để minh họa hoàn thiện hồ sơ; không tự coi một hồ sơ thử chưa đủ thông tin là lỗi chức năng hoặc không đạt yêu cầu số lượng demo.

Nguồn yêu cầu hiện có là file **Báo cáo thành quả và đánh giá mức độ hoàn thiện.docx**. Chưa có đề bài gốc và bảng chấm điểm đầy đủ, nên những danh mục hoặc quy tắc được dẫn từ báo cáo cần được đối chiếu lại trước khi thay đổi phạm vi đồ án.

## 2. Danh sách các mục còn lại

Quy ước ưu tiên:

- **P0:** sửa trước để bảo đảm dữ liệu đúng và người khác cài được dự án.
- **P1:** hoàn thiện các yêu cầu còn thiếu hoặc nội dung ảnh hưởng trực tiếp đến nghiệm thu.
- **P2:** cải thiện độ chính xác và khả năng bảo trì sau các luồng bắt buộc.
- **P3:** tùy chọn, thực hiện sau phần bắt buộc.

| Mã | Mục | Đánh giá | Ưu tiên |
| --- | --- | --- | --- |
| BB01 | Phân tích sở thích của khách hàng | Đạt một phần theo yêu cầu được dẫn trong báo cáo | P1 |
| BB02 | Gửi khảo sát cho nhóm khách được chọn | Đạt một phần | P1 |
| BB03 | Phương án sao lưu và phục hồi CSDL | Chưa đạt | P1, chuẩn bị trước khi đổi cấu trúc dữ liệu |
| CL01 | Kiểm tra hồ sơ và đáp án ở backend | Đạt một phần, đã tái hiện lỗi | P0 |
| CL02 | Bộ cấu hình mẫu và cài đặt trên máy mới | Chưa đạt | P0 |
| CL03 | Biểu mẫu Quản lý thêm khách | Đạt một phần so với mô tả trong báo cáo | P1 |
| CL04 | Độ chính xác của báo cáo độ tuổi | Đạt một phần nếu yêu cầu tuổi thực; hiện chỉ ước tính theo năm | P2 |
| CL05 | Tổ chức và bảo trì mã backend | Đạt một phần về tiêu chí chất lượng | P2 |
| TL01 | Độ chính xác của báo cáo tự đánh giá | Chưa đạt về tính nhất quán và bằng chứng | P1 |
| TC01 | Lịch sử tương tác tổng hợp theo khách | Đạt một phần, mục tùy chọn trong báo cáo | P3 |

Các dòng trên gồm yêu cầu nghiệp vụ, chất lượng và tài liệu; có phần liên quan nhau. **Không dùng số dòng này để tính tỷ lệ hoàn thành toàn bộ đề bài.**

## 3. Chi tiết và cách sửa đề xuất

### BB01 — Phân tích sở thích của khách hàng

**Hiện trạng:** mỗi khách có một giá trị `users.need`, gồm Gaming, Đồ họa, Văn phòng hoặc Chưa xác định. Báo cáo đang đếm giá trị đó. Database mới vẫn dùng mô hình một trường nhu cầu, chưa có danh mục sở thích và liên kết nhiều sở thích cho một khách.

**Phần còn thiếu:** nếu đúng như yêu cầu được dẫn trong file đánh giá, một trường nhu cầu chưa đáp ứng việc thu thập và phân tích nhiều sở thích. Các nhóm Lập trình, Học tập, Khác cũng chưa có trong danh mục hiện tại.

**Cách sửa tối ưu và hợp logic:**

1. Chốt với đề bài gốc rằng “sở thích” có cho chọn nhiều giá trị hay không. Không tự mở rộng một yêu cầu chọn một thành chọn nhiều nếu đề bài không yêu cầu.
2. Nếu cần chọn nhiều, giữ `need` cho nhu cầu sử dụng chính; bổ sung `interests` và bảng liên kết `customer_interests(customer_id, interest_id)` với khóa chính kép, khóa ngoại phù hợp.
3. Bổ sung lựa chọn sở thích trong hồ sơ khách và form Quản lý thêm khách; backend chỉ nhận mã sở thích có trong danh mục. Khai báo danh mục dùng chung, tránh ghi nhiều danh sách khác nhau ở từng màn hình.
4. Lưu hồ sơ và các liên kết sở thích trong cùng transaction. Không xóa hoặc tự suy diễn sở thích từ nhu cầu cũ nếu chưa có quy tắc chuyển đổi được thống nhất.
5. Bổ sung lọc và báo cáo sở thích. Đếm khách duy nhất theo từng sở thích, không đếm số dòng join như số khách.

**Điều kiện xác nhận đạt:** khách có thể chọn nhiều sở thích, lưu và đọc lại đúng; lựa chọn trùng không tạo liên kết trùng; mã không hợp lệ bị từ chối; thống kê và xuất dữ liệu khớp dữ liệu gốc. Khi một khách có nhiều sở thích, giải thích rõ tổng tỷ lệ các nhóm có thể vượt 100%.

**Vị trí cần sửa:** `database/schema.sql`, migration bổ sung; `app.js`, `role-ui.js`, `staff-controller.js`, `server.mysql.js`, `reports-service.js`, `reports.js`; dữ liệu mẫu và kiểm thử liên quan.

### BB02 — Gửi khảo sát cho nhóm khách được chọn

**Hiện trạng:** API gửi khảo sát chọn toàn bộ CUSTOMER đang ACTIVE và ghi vào `survey_recipients`. API danh sách của khách vẫn lấy mọi khảo sát OPEN; API nộp bài chưa kiểm tra người gửi có thuộc danh sách nhận hay không.

**Phần còn thiếu:** thiếu bộ chọn nhóm hoặc người nhận; đồng thời danh sách người nhận chưa được dùng để giới hạn quyền xem và trả lời. Chỉ thêm một bộ lọc trên màn hình Quản lý sẽ chưa giải quyết đủ yêu cầu này.

**Cách sửa tối ưu và hợp logic:**

1. Tận dụng `survey_recipients` hiện có, chưa cần xây dựng một hệ thống phân nhóm phức tạp. Cho chọn “Tất cả khách đang hoạt động”, “Lọc theo điều kiện”, hoặc “Chọn khách cụ thể”.
2. Tái sử dụng bộ lọc khách theo nhu cầu, tuổi hoặc sở thích sau khi BB01 và dữ liệu hồ sơ đã ổn định. Hiển thị số lượng và danh sách xem trước trước khi gửi.
3. Backend tự xác minh các ID gửi lên: tồn tại, đúng vai trò CUSTOMER, đang ACTIVE, không trùng. Không tin danh sách hoặc số lượng chỉ do giao diện tính.
4. Chốt danh sách nhận tại thời điểm gửi để mẫu số báo cáo không thay đổi chỉ vì khách sửa hồ sơ về sau. Khách mới phù hợp điều kiện không tự động được thêm vào đợt đã gửi, trừ khi Quản lý thực hiện thêm người nhận theo quy tắc rõ ràng.
5. Trong một transaction, kiểm tra trạng thái phiếu, ghi người nhận và chuyển sang OPEN. Mọi đường mở phiếu — tạo mới, chỉnh sửa hoặc bấm gửi — phải dùng cùng hàm xử lý, tránh một đường cập nhật OPEN nhưng bỏ qua danh sách nhận.
6. API danh sách và API nộp bài đều kiểm tra `survey_recipients` theo ID khách đã xác thực. Với phiếu cũ chưa có người nhận, cần một quy tắc chuyển đổi rõ ràng; không mặc định coi đó là phiếu công khai để vượt kiểm tra.
7. Nếu hỗ trợ gửi bổ sung, ghi thêm người nhận và giữ nguyên kết quả cũ; không vô tình thay toàn bộ danh sách rồi làm sai lịch sử tỷ lệ hoàn thành.

**Điều kiện xác nhận đạt:** khách trong nhóm thấy và nộp được phiếu; khách ngoài nhóm không thấy và không nộp được dù gọi thẳng API; khách LOCKED không được nhận mới; gửi lại không nhân đôi người nhận; báo cáo chỉ dùng đúng tập người nhận đã chốt.

**Vị trí cần sửa:** `staff-surveys.js`, `staff-controller.js`, các route tạo/sửa/gửi/đọc/nộp khảo sát trong `server.mysql.js`; đối chiếu công thức ở `reports-service.js`.

### BB03 — Sao lưu và phục hồi cơ sở dữ liệu

**Hiện trạng:** chưa tìm thấy hướng dẫn hoặc script riêng chứng minh được một bản sao lưu có thể phục hồi hoàn chỉnh. Script tạo schema và nạp demo không thay thế bản sao lưu dữ liệu hiện có.

**Cách sửa tối ưu và hợp logic:**

1. Với quy mô đồ án, trước hết hoàn thành quy trình xuất/nhập MySQL có hướng dẫn; không cần làm màn hình sao lưu trên web nếu đề bài không bắt buộc.
2. Tạo bản sao lưu gồm cấu trúc và dữ liệu nhất quán, bao gồm các bảng khôi phục tài khoản; bao gồm trigger hoặc routine nếu thực tế có sử dụng. Ghi tên database nguồn, thời điểm và phiên bản schema đi kèm.
3. Cấu hình tài khoản kết nối qua cấu hình riêng của máy; không đưa mật khẩu vào mã nguồn hoặc nội dung hướng dẫn để chia sẻ. Tệp dữ liệu thật không được commit lên repository công khai.
4. Phục hồi vào một database mới được chỉ định rõ. Không thiết kế lệnh phục hồi mặc định ghi đè database đang dùng.
5. Đối chiếu số lượng bản ghi, quan hệ dữ liệu và chạy thử đăng nhập, khảo sát, phản hồi, báo cáo sau phục hồi.
6. Khi quy trình thủ công đã được kiểm chứng, mới đóng gói thành `db:backup`, `db:restore` hoặc script tương đương để dùng lại.

**Điều kiện xác nhận đạt:** từ một bản sao lưu, phục hồi được trên database thử trống; số liệu và các luồng chính đúng; có hướng dẫn tái thực hiện. Chỉ có tệp `.sql` chưa đủ bằng chứng đạt.

**Vị trí đề xuất:** thêm `docs/SAO_LUU_VA_PHUC_HOI.md`, các script liên quan nếu cần và đường dẫn hướng dẫn trong `README.md`.

### CL01 — Kiểm tra hồ sơ và đáp án tại backend

**Hiện trạng:** chạy lại 153 tình huống trên database cách ly vẫn có 6 tình huống không đạt:

| Tình huống | Kết quả thực tế | Kết quả cần có |
| --- | --- | --- |
| Hồ sơ thiếu địa chỉ và giới tính | HTTP 200, được lưu | Từ chối khi thực hiện bước lưu hồ sơ đầy đủ |
| Bỏ ONE bắt buộc | HTTP 201 | Từ chối, không tạo lượt nộp |
| Bỏ MULTI bắt buộc | HTTP 201 | Từ chối, không tạo lượt nộp |
| Bỏ RATING bắt buộc | HTTP 201 | Từ chối, không tạo lượt nộp |
| ONE chứa lựa chọn không thuộc câu hỏi | HTTP 201 | Từ chối toàn bộ lượt nộp |
| ONE nhận hai lựa chọn | HTTP 201 | Từ chối vì chỉ được chọn một |

**Cách sửa tối ưu và hợp logic:**

1. Trích hàm kiểm tra dữ liệu thuần, có thể kiểm thử độc lập. Giao diện dùng để hướng dẫn nhập; backend là nơi quyết định dữ liệu có được lưu hay không.
2. Hồ sơ cần có quy tắc riêng cho “tạo tài khoản sơ bộ” và “hoàn thiện hồ sơ”. Có thể cho tạo tài khoản sơ bộ nếu nghiệp vụ cho phép, nhưng bước hoàn thiện phải kiểm tra đúng toàn bộ trường bắt buộc ở backend.
3. Áp dụng quy tắc cho từng loại câu hỏi:

   | Loại | Quy tắc tối thiểu |
   | --- | --- |
   | ONE | Đúng một lựa chọn hợp lệ; không nhận mảng nhiều đáp án |
   | MULTI | Mảng lựa chọn hợp lệ, loại bỏ hoặc từ chối trùng; bắt buộc thì phải có ít nhất một lựa chọn |
   | TEXT | Chuỗi; câu bắt buộc phải còn ký tự sau khi trim |
   | RATING | Số nguyên 1–5; câu bắt buộc không được bỏ trống |

4. Với câu không bắt buộc, cho phép bỏ qua nhưng vẫn từ chối giá trị sai nếu người dùng đã gửi. Đối chiếu lựa chọn với đúng câu hỏi. Có thể giữ hợp đồng API hiện tại để sửa nhanh; nếu chuyển sang `optionId`, cập nhật đồng thời frontend, backend và kiểm thử.
5. Trong transaction nộp bài, đọc và khóa phiếu rồi kiểm tra lại trạng thái, hạn và người nhận; xác thực toàn bộ câu trả lời trước khi ghi lượt nộp và chi tiết. Việc đóng phiếu cũng phải tuân theo cơ chế khóa tương ứng.
6. Giữ ràng buộc UNIQUE khảo sát/khách để chặn nộp trùng. Trả lỗi nhập liệu 400 hoặc 422 có thông báo cụ thể, không để lỗi kiểm tra dữ liệu biến thành lỗi máy chủ 500.

**Lưu ý đã kiểm tra:** điểm sao ngoài 1–5 đang bị ràng buộc MySQL chặn; tạo câu ONE chỉ có một lựa chọn cũng bị rollback. Tuy nhiên cách trả lỗi hiện còn chưa tốt. Cần kiểm tra sớm và trả lỗi nhập liệu rõ ràng, không chỉ dựa vào database từ chối.

**Điều kiện xác nhận đạt:** 6 tình huống trên bị từ chối đúng, không phát sinh lượt nộp hoặc chi tiết dở dang; hồ sơ và bài hợp lệ vẫn lưu được; bổ sung thử MULTI rỗng/trùng, RATING sai kiểu và đóng/nộp đồng thời. Kết quả đồng thời phải theo thứ tự khóa: bài nộp được chấp nhận trước khi đóng hoặc bị từ chối sau khi đóng, không ghi bài mới sau khi lệnh đóng đã hoàn tất.

**Vị trí cần sửa:** `PUT /api/me`, `POST /api/surveys/:id/responses`, API đóng phiếu trong `server.mysql.js`; các validator và bài kiểm thử mới.

### CL02 — Cấu hình mẫu và khả năng cài đặt trên máy mới

**Hiện trạng:** `.env` của máy hiện tại tồn tại và kết nối tốt, nhưng `.env.example` đang thiếu. `npm test` có một bài báo `ENOENT` khi sao chép tệp mẫu. Chạy được trên máy tác giả chưa chứng minh người khác cài được từ source.

**Cách sửa tối ưu và hợp logic:**

1. Khôi phục `.env.example` với đủ tên biến mà `scripts/setup-project.js` kiểm tra, dùng giá trị mẫu thay cho bí mật thật.
2. Giữ cơ chế `npm run config` sinh `JWT_SECRET` riêng và không ghi đè `.env` có sẵn.
3. Thử trong thư mục sạch: cài phụ thuộc, tạo cấu hình, điền kết nối MySQL, setup database mới rồi chạy máy chủ.
4. Kiểm tra lại hướng dẫn Windows và các lệnh `npm.cmd` khi cần; không yêu cầu người nhận mang theo thư mục `node_modules` hoặc `.env` của tác giả.

**Điều kiện xác nhận đạt:** bộ kiểm thử hiện có đạt 101/101 và cài mới từ source thành công trên cấu hình thử. Tệp mẫu không chứa mật khẩu thật hoặc khóa JWT đang dùng.

**Vị trí cần sửa:** `.env.example`, hướng dẫn trong `README.md`; chỉ sửa script setup nếu phép thử phát hiện lỗi khác.

### CL03 — Biểu mẫu Quản lý thêm khách hàng

**Hiện trạng:** báo cáo nói Quản lý nhập cả năm sinh và giới tính, nhưng form hiện chỉ có họ tên, email, điện thoại, mật khẩu, địa chỉ và nhu cầu. API thêm khách còn nhận năm sinh thay vì lưu ngày sinh đầy đủ như form hồ sơ khách.

**Cách sửa tối ưu và hợp logic:**

1. Bổ sung ngày sinh và giới tính trên form nếu đó là trường phải nhập theo đề bài. Tái sử dụng quy tắc ngày sinh có sẵn trong `birth-date.js`.
2. API nhận và kiểm tra `birthDate`, lưu `birth_date`, tính `birth_year` từ ngày sinh để tương thích báo cáo cũ. Không cho hai giá trị được nhập độc lập rồi mâu thuẫn nhau.
3. Dùng chung danh mục nhu cầu/sở thích với hồ sơ khách và bộ lọc báo cáo.
4. Chốt rõ trường bắt buộc khi Quản lý tạo khách. Nếu cho tạo tài khoản sơ bộ, giao diện và báo cáo phải nói rõ khách sẽ hoàn thiện sau, thay vì khẳng định form đã thu đủ mọi thông tin.

**Điều kiện xác nhận đạt:** tạo khách với ngày sinh và giới tính, xem chi tiết và đăng nhập phía khách đều thấy đúng; ngày không hợp lệ hoặc ở tương lai bị chặn; ngày sinh và năm sinh lưu nhất quán.

**Vị trí cần sửa:** `role-ui.js`, `staff-controller.js`, API thêm khách trong `server.mysql.js`, kiểm thử giao diện và API.

### CL04 — Độ chính xác của báo cáo độ tuổi

**Hiện trạng:** nhãn năm nhóm tuổi đã có, nhưng tuổi tính bằng năm hiện tại trừ năm sinh. Khách chưa đến sinh nhật có thể được đưa sang nhóm tuổi mới sớm hơn thực tế. Database mới đã có ngày sinh cho cả 12 khách, nên có thể nâng độ chính xác mà không cần thêm trường dữ liệu.

**Cách sửa tối ưu và hợp logic:**

1. Nếu đề bài chỉ yêu cầu ước tính theo năm sinh, giữ cách tính và ghi rõ giới hạn; không coi đây là lỗi bắt buộc.
2. Nếu yêu cầu tuổi thực, dùng một hàm tính tuổi từ `birth_date` và ngày báo cáo thống nhất với ngày máy chủ/MySQL. Dùng cùng kết quả cho biểu đồ, bộ lọc nhóm nhận khảo sát và CSV.
3. Với dữ liệu cũ không có ngày sinh đầy đủ, đưa vào nhóm chưa đủ dữ liệu hoặc đánh dấu là ước tính. Không tự tạo ngày sinh để làm đẹp thống kê.

**Điều kiện xác nhận đạt:** thử ngay trước, đúng ngày và sau sinh nhật ở mốc 18, 25, 35, 45 tuổi; không xếp sai nhóm; tổng các nhóm cộng đúng tổng khách; bộ lọc và báo cáo không dùng hai cách tính tuổi khác nhau.

**Vị trí cần sửa:** `reports-service.js`, nhãn giải thích và CSV trong `reports.js`, kiểm thử báo cáo; bộ lọc người nhận nếu dùng tuổi.

### CL05 — Khả năng bảo trì mã backend

**Hiện trạng:** backend đã tách một số module, nhưng nhiều route trong `server.mysql.js` còn dồn nhiều thao tác trên một dòng và trộn kiểm tra dữ liệu, SQL, transaction, định dạng kết quả. Đây là điểm yếu về bảo trì, không có nghĩa toàn bộ chức năng đó chưa chạy được.

**Cách sửa tối ưu và hợp logic:**

1. Định dạng lại đoạn cần sửa để dễ đọc; không thay toàn bộ kiến trúc trước khi sửa các lỗi có bằng chứng.
2. Trích validator hồ sơ, validator câu trả lời, hàm xuất bản khảo sát và hàm tính tuổi thành các đơn vị có trách nhiệm rõ ràng.
3. Route chỉ xác thực, phân quyền, gọi xử lý và trả kết quả; các thao tác nhiều bước tiếp tục dùng chung connection và transaction.
4. Tách phần nghiệp vụ vừa sửa trước, chạy kiểm thử sau từng nhóm. Chưa cần thêm ORM, framework hoặc nhiều tầng trung gian chỉ để làm mã trông phức tạp hơn.

**Điều kiện xác nhận đạt:** các quy tắc có một nơi định nghĩa chính, kiểm thử được độc lập; bộ test cũ và kiểm tra tích hợp vẫn đạt sau khi tách; thay danh mục hoặc quy tắc không phải sửa nhiều bản sao khác nhau.

### TL01 — Độ chính xác của báo cáo tự đánh giá

**Hiện trạng:** báo cáo vẫn có nội dung không khớp mã và kết quả kiểm tra. Cập nhật database không tự sửa các khẳng định này.

**Cách sửa tối ưu và hợp logic:**

1. Thay câu “15/17 chức năng bắt buộc đạt đầy đủ” bằng ma trận mã yêu cầu theo đề bài gốc. Bảng hiện tại có 16 dòng: 12 Đạt, 3 Một phần, 1 Chưa có. Bỏ dòng tùy chọn thì còn 15 dòng: 12 Đạt, 2 Một phần, 1 Chưa có. Đây là cách đếm dòng hiện tại, chưa chứng minh tổng số yêu cầu chính thức.
2. Không dùng 48 tác vụ trong tài liệu hướng dẫn làm mẫu số thay cho số yêu cầu của đề bài; hai đơn vị thống kê khác nhau.
3. Bỏ khẳng định có chế độ sáng/tối nếu chưa triển khai. Hiện CSS khai báo chế độ sáng, chưa thấy chức năng chuyển chế độ. Không cần thêm tính năng này chỉ để khớp một câu tự đánh giá nếu đề bài không yêu cầu.
4. Sửa mô tả form thêm khách theo CL03; mô tả tuổi là ước tính cho đến khi CL04 được thực hiện.
5. Cập nhật dữ liệu demo mới và ngày kiểm tra. Tách kết quả 100/101 của bộ test có sẵn khỏi 147/153 của đợt HTTP/MySQL; không cộng thành tỷ lệ hoàn thiện đồ án.
6. Nếu mô tả đầy đủ CSDL, phân biệt 9 bảng nghiệp vụ chính, 2 bảng khôi phục tài khoản và bảng đánh dấu dữ liệu demo. Database vừa kiểm tra có 12 bảng, không chỉ 9 bảng.
7. Mỗi dòng “Đạt” nên kèm mã yêu cầu, phiên bản kiểm tra, cách thử và bằng chứng ngắn. Các lỗi còn lại phải xuất hiện ở phần hạn chế.

**Điều kiện xác nhận đạt:** không có số đếm mâu thuẫn; chức năng được mô tả đúng giao diện và backend; số liệu, ngày kiểm tra và bằng chứng khớp; kết luận hoàn thiện dựa trên đề bài gốc.

### TC01 — Lịch sử tương tác tổng hợp theo từng khách

**Hiện trạng:** có lịch sử phản hồi, câu trả lời khảo sát và lịch sử khôi phục mật khẩu dành cho Admin, nhưng chưa có màn hình dòng thời gian tổng hợp theo một khách. File đánh giá xếp mục này là tùy chọn.

**Cách sửa tối ưu và hợp logic:**

1. Trước mắt tổng hợp dữ liệu sẵn có thành một API chỉ đọc, sắp theo thời gian và có phân trang. Chưa cần bảng nhật ký mới nếu yêu cầu chỉ là xem các tương tác đang lưu.
2. Thêm mục Lịch sử tương tác trong chi tiết khách: phản hồi đã gửi, cửa hàng trả lời, khảo sát đã nộp, thời điểm tạo tài khoản.
3. Giữ đúng quyền xem. Không đưa token, mã khôi phục hoặc nội dung xác minh nội bộ của Admin sang màn hình Quản lý chỉ để làm lịch sử trông đầy đủ.
4. Chỉ bổ sung bảng sự kiện riêng nếu cần truy vết thay đổi trước/sau hoặc các hành động chưa được bảng hiện tại lưu lại.

**Điều kiện xác nhận đạt:** chọn một khách thấy đúng các tương tác của khách đó theo thời gian; không lẫn dữ liệu người khác; có phân trang và kiểm tra phân quyền. Hoàn thành phần bắt buộc trước mục này.

## 4. Phần chưa đủ bằng chứng để kết luận

Chưa có tài liệu để đối chiếu sơ đồ chức năng, sơ đồ ngữ cảnh, DFD, kế hoạch 15 tuần và phân công nhóm. Báo cáo nói các phần này nằm trong tài liệu khác. **Không kết luận chúng chưa làm; trạng thái đúng hiện tại là chưa kiểm chứng.**

Cách hoàn thiện: tập hợp đề bài gốc và phần báo cáo liên quan; gắn mã yêu cầu với chức năng, luồng dữ liệu, kho dữ liệu và bài kiểm tra. Đối chiếu tên tác nhân Khách hàng, Quản lý, Admin cùng ranh giới hệ thống; kiểm tra sự nhất quán giữa các mức DFD và giữa sơ đồ với phần mềm thực tế.

Kiểm thử tải lớn, an ninh chuyên sâu, nhiều trình duyệt/kích thước màn hình và lưu PDF qua máy in thực tế cũng chưa đủ bằng chứng. Chỉ nâng thành yêu cầu bắt buộc nếu đề bài hoặc tiêu chí nghiệm thu có quy định.

## 5. Thứ tự thực hiện đề xuất

| Đợt | Việc thực hiện | Lý do và đầu ra |
| --- | --- | --- |
| 0 | Chốt yêu cầu gốc; tạo bản sao lưu và phục hồi thử theo BB03 | Có cơ sở đánh giá và bản phục hồi trước khi đổi schema |
| 1 | CL02 và CL01; định dạng/trích các hàm cần thiết của CL05 | Cài mới được; chặn dữ liệu sai trước khi mở rộng chức năng |
| 2 | CL03 và BB01, migration giữ dữ liệu cũ | Hoàn thiện nguồn dữ liệu hồ sơ/sở thích dùng cho các bước sau |
| 3 | BB02; dùng chung cách tính tuổi với CL04 nếu lọc theo tuổi | Chọn đúng nhóm, chốt người nhận, thống nhất quyền xem/nộp và mẫu số báo cáo |
| 4 | Hoàn thiện báo cáo/CSV và TL01; chạy vòng nghiệm thu đầy đủ | Số liệu, giao diện, tài liệu và kết quả thử khớp nhau |
| 5 | TC01 và các cải thiện còn lại của CL05 | Bổ sung chất lượng sau khi phần bắt buộc đã ổn định |

Không cần xây lại dự án. Tận dụng `survey_recipients`, hàm ngày sinh, báo cáo và transaction hiện có; bổ sung đúng những quy tắc còn thiếu. Chỉ đổi schema khi có yêu cầu dữ liệu rõ ràng, dùng migration có thể chạy lại an toàn và có phép thử giữ nguyên dữ liệu cũ.

## 6. Checklist xác nhận hoàn thiện

- [ ] Có ma trận yêu cầu theo đề bài gốc, tách phần bắt buộc và tùy chọn.
- [ ] Sao lưu và phục hồi thử thành công trước các migration thay đổi dữ liệu.
- [ ] Có `.env.example` hợp lệ; bộ test có sẵn đạt 101/101.
- [ ] Sáu tình huống lỗi dữ liệu bị từ chối đúng; không phát sinh dữ liệu dở dang.
- [ ] Có kiểm thử mới cho sở thích, ngày sinh, lọc nhóm và quyền người nhận.
- [ ] Mọi đường mở khảo sát đều ghi nhận đúng người nhận và không làm mất lịch sử.
- [ ] Khách ngoài nhóm, khách khóa, phiếu đóng và phiếu quá hạn bị chặn đúng.
- [ ] Đóng/nộp đồng thời không tạo kết quả trái với thứ tự xử lý đã chốt.
- [ ] Báo cáo, CSV, dữ liệu SQL và bộ lọc dùng cùng cách tính.
- [ ] Dữ liệu demo vẫn đủ và tài khoản ba vai trò dùng được sau cập nhật.
- [ ] Báo cáo tự đánh giá được sửa theo bằng chứng mới, không ghi tính năng chưa có.
- [ ] Nếu làm lịch sử tùy chọn, kiểm tra đúng quyền và không lộ dữ liệu khôi phục.

## 7. Bằng chứng để đối chiếu trong repository

- Database sau cập nhật: [database-after-update.json](../outputs/qa/database-after-update.json).
- Bộ kiểm thử có sẵn chạy lại: [tests-after-db-update.txt](../outputs/qa/tests-after-db-update.txt).
- Kết quả 153 tình huống chạy lại cách ly: [detailed-results.json](../outputs/qa/detailed-results.json).
- Kịch bản kiểm tra cách ly: [detailed-system-check.cjs](../outputs/qa/detailed-system-check.cjs).
- Xử lý và phân quyền chính: [server.mysql.js](../server.mysql.js).
- Form nhân sự: [role-ui.js](../role-ui.js), [staff-controller.js](../staff-controller.js), [staff-surveys.js](../staff-surveys.js).
- Công thức và giao diện báo cáo: [reports-service.js](../reports-service.js), [reports.js](../reports.js).
- Cấu trúc nghiệp vụ: [database/schema.sql](../database/schema.sql).

Tài liệu này là danh sách đánh giá và đề xuất sửa. Việc tạo file chưa triển khai các thay đổi nghiệp vụ được đề xuất ở trên.
