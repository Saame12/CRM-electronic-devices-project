from pathlib import Path
from collections import Counter
import json, re
from PIL import Image

QA=Path(__file__).resolve().parent
# Giữ danh mục 48 tác vụ đã lập, thay toàn bộ kết quả kiểm tra cũ.
src=(QA/'create_guide.py').read_text(encoding='utf-8')
src=src[:src.index("page('9 Kết quả rà soát")]
exec(compile(src,str(QA/'create_guide.py'),'exec'))

from docx.shared import Cm, Pt
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION_START

data=json.loads((QA/'detailed-results.json').read_text(encoding='utf-8'))
live=json.loads((QA/'live-results.json').read_text(encoding='utf-8'))
d.core_properties.subject='48 chức năng và kết quả kiểm tra HTTP MySQL cùng hướng dẫn trực quan'
d.core_properties.comments=''
d.core_properties.keywords='CRM, hướng dẫn sử dụng, kiểm thử chức năng, Backline'
# Nội dung mở đầu và chỉ dẫn đọc theo mục, tránh phụ thuộc số trang khi người nhận đổi máy.
for para in d.paragraphs:
 if para.text=='Ngày rà soát 01 tháng 11 năm 2026':
  para.text='Bản cập nhật sau kiểm thử trực tiếp ngày 01 tháng 11 năm 2026'
 if para.text.startswith('Trang 9 minh họa'):
  para.text='Mục 8 minh họa các luồng làm việc. Mục 9 và 10 trình bày kết quả kiểm tra cùng vấn đề xác nhận được. Mục 12 đến 19 hướng dẫn có ảnh; phụ lục ghi từng tình huống kiểm thử và phạm vi còn lại.'
 if para.text.startswith('Backline CRM giúp khách hàng'):
  para.text+=' Qua kiểm tra, các luồng nghiệp vụ chính chạy được; vẫn còn thiếu kiểm tra dữ liệu ở một số API. Tài liệu tách hướng dẫn sử dụng khỏi các vấn đề cần xử lý trước khi bàn giao.'
# Bảng chỉ dẫn theo số mục giúp ổn định khi cập nhật bố cục.
d.tables[0].cell(0,2).text='Mục'
for row,section in zip(d.tables[0].rows[1:9],['1','2','3','4','5','4','6','7']):row.cells[2].text=section

def bold(t):
 para=p(''); para.add_run(t).bold=True; return para
def step(n,t):
 para=p(''); para.add_run(f'Bước {n}  ').bold=True; para.add_run(t)
def pic(name,caption,max_h=11.5,crop=None):
 source=QA/'screens'/name
 if crop:
  im=Image.open(source); source=QA/'screens'/('doc-'+name); im.crop(crop).save(source)
 im=Image.open(source); w,h0=im.size
 width=min(17.1,max_h*w/h0)
 para=p(''); para.alignment=WD_ALIGN_PARAGRAPH.CENTER
 para.add_run().add_picture(str(source),width=Cm(width))
 para.paragraph_format.space_after=Pt(3)
 cap=p(caption);cap.alignment=WD_ALIGN_PARAGRAPH.CENTER
 for r in cap.runs:r.font.size=Pt(9);r.italic=True

page('9 Kết quả kiểm tra trực tiếp')
p('Đã kiểm tra mã nguồn, máy chủ đang chạy, dữ liệu MySQL, HTTP API và các thao tác trên trình duyệt. Kết quả dưới đây được ghi ngày 01 tháng 11 năm 2026 theo giờ Việt Nam.')
table(['Lớp kiểm tra','Kết quả','Cách hiểu'],[
('Bộ kiểm thử có sẵn','100 / 101 đạt','Một bài thất bại vì tệp .env.example bị thiếu, không còn là lỗi thiếu dotenv như lần rà soát đầu.'),
('HTTP và MySQL cách ly','147 / 153 đạt','6 tình huống biên không đạt: thiếu trường hồ sơ hoặc dữ liệu câu hỏi không được API kiểm tra đầy đủ.'),
('MySQL trên bảng tạm','4 kịch bản đạt','Báo cáo, khôi phục thủ công, mã cá nhân và ẩn khảo sát. Mật khẩu và dữ liệu nghiệp vụ gốc được giữ.'),
('Trình duyệt','Đã thử các luồng chính','Đăng nhập, khảo sát, ẩn/bỏ ẩn, phản hồi hai phía, báo cáo, xuất CSV, thông báo và hỗ trợ Admin.')],[4.3,3.2,9.9])
h('Ảnh chụp số lượng trong hệ thống đang dùng')
table(['Dữ liệu','Số lượng','Ghi nhận'],[
('Tài khoản','8','1 Admin, 1 Quản lý, 6 Khách hàng.'),('Sản phẩm','14','Danh mục dùng để chọn khi gửi phản hồi.'),('Khảo sát','15','Số phiếu trong MySQL hiện tại.'),('Phản hồi','4','Số bản ghi phản hồi hiện tại.'),('Lượt trả lời khảo sát','14','Một lượt là một khách nộp một phiếu.')],[6.0,2.3,9.1])
p('Các số trên là ảnh chụp tại thời điểm kiểm tra, không phải giới hạn của hệ thống. Bộ dữ liệu thử phục vụ ảnh minh họa có số lượng khác, gồm 15 tài khoản, 6 phiếu khảo sát và 36 phản hồi lúc khởi tạo.')
h('Phân biệt môi trường đang dùng và môi trường thử')
p('Máy chủ cổng 3000 trả HTTP 200 và ok=true. Đăng nhập tài khoản mẫu Admin và Khách thành công; tài khoản mẫu Quản lý manager@demo.vn không đăng nhập được với mật khẩu mẫu. Điều này không chứng minh chức năng Quản lý bị lỗi: database hiện có một Quản lý nhưng thông tin đăng nhập có thể khác bộ mẫu. Các chức năng Quản lý đã được kiểm chứng bằng tài khoản hợp lệ trong môi trường cách ly.')
p('Khách mẫu ở database đang dùng thiếu ngày sinh đầy đủ nên giao diện yêu cầu hoàn thiện hồ sơ. Không tự điền thay ngày sinh của khách. Tác vụ ghi/xóa và đổi mật khẩu được thử trên dữ liệu cách ly; database thử HTTP đã được xóa sau khi hoàn tất.')

page('10 Vấn đề đã xác nhận và mức ưu tiên')
p('Sáu tình huống không đạt được nhóm thành bốn vấn đề dữ liệu. Mức ưu tiên dưới đây là đánh giá để sắp xếp xử lý; chưa có thay đổi mã nghiệp vụ trong đợt lập tài liệu này.')
table(['Mã','Vấn đề và bằng chứng','Ảnh hưởng và đề xuất'],[
('KT01','Thiếu địa chỉ và giới tính nhưng PUT /api/me trả 200. Liên quan CN07; 1 tình huống không đạt.','Hồ sơ có thể không đầy đủ nếu gọi API trực tiếp. Bắt buộc kiểm tra tại backend giống quy tắc giao diện. Ưu tiên cao.'),
('KT02','Bỏ trống ONE, MULTI hoặc RATING bắt buộc nhưng API nộp bài trả 201. Liên quan CN10; 3 tình huống không đạt.','Phiếu có thể được ghi là đã nộp dù thiếu câu bắt buộc. Kiểm tra đủ từng loại trước khi INSERT, rollback khi sai. Ưu tiên cao.'),
('KT03','ONE nhận giá trị không nằm trong lựa chọn nhưng API vẫn trả 201. Liên quan CN10; 1 tình huống không đạt.','Lượt nộp được ghi nhưng lựa chọn sai không được lưu thành chi tiết hợp lệ. Từ chối lựa chọn ngoài danh mục. Ưu tiên cao.'),
('KT04','ONE nhận mảng hai đáp án và API vẫn trả 201. Liên quan CN10; 1 tình huống không đạt.','Câu chọn một có thể lưu nhiều lựa chọn và làm lệch phân tích. Chỉ cho đúng một đáp án hợp lệ. Ưu tiên cao.'),
('KT05','Tệp .env.example bị thiếu; một bài setup-project.test.js báo ENOENT.','Cài mới theo hướng dẫn có thể bị gián đoạn. Khôi phục tệp cấu hình mẫu không chứa bí mật rồi chạy lại bộ test. Ưu tiên cao trước khi chia sẻ source.')],[1.6,8.0,7.8])
h('Các điểm khác cần cải thiện')
p('Tạo câu chọn một chỉ có một lựa chọn bị từ chối và transaction rollback, nhưng API trả 500 thay vì lỗi nhập liệu 4xx. Điểm sao ngoài khoảng 1 đến 5 bị ràng buộc MySQL chặn, song cần thêm kiểm tra backend để trả thông báo rõ ràng, không phụ thuộc vào lỗi cơ sở dữ liệu.')
p('Danh sách khách nhận chưa giới hạn quyền thấy phiếu OPEN. Khi cần khảo sát theo nhóm khách, phải bổ sung kiểm tra người nhận ở cả API đọc và API gửi bài. Hiện đây là giới hạn thiết kế đã xác định từ mã, không được diễn giải thành cơ chế gửi khảo sát riêng tư.')
p('Kiểm tra đóng phiếu và nộp bài đồng thời, hiệu năng tải lớn, kiểm thử an ninh chuyên sâu và quy trình sao lưu/phục hồi toàn bộ database chưa nằm trong các kết quả đạt của đợt này. Không dùng tỷ lệ đạt làm cam kết hệ thống sẵn sàng vận hành thực tế ở mọi điều kiện.')

page('11 Hướng dẫn bắt đầu theo vai trò')
p('Người nhận tài liệu nên chọn đúng vai trò và làm theo một quy trình hoàn chỉnh trước khi đọc phụ lục kỹ thuật. Các ảnh từ đây dùng dữ liệu giả lập trên cùng mã nguồn, không dùng mật khẩu hoặc mã khôi phục thật.')
table(['Công việc','Khách hàng','Quản lý','Admin'],[
('Hồ sơ cá nhân, khảo sát và gửi phản hồi','Dùng trang khách','Dùng cổng riêng','Dùng cổng riêng'),
('Tra cứu, thêm, khóa và xóa khách','Không','Có','Không qua nhóm vận hành'),
('Trả lời và ẩn phản hồi','Chỉ đọc trả lời của mình','Có','Không'),
('Tạo, gửi, đóng và sao chép khảo sát','Chỉ thực hiện phiếu','Có','Không'),
('Báo cáo và xuất dữ liệu','Không','Có','Không'),
('Tạo hoặc xóa tài khoản nhiều vai trò','Không','Chỉ quản lý khách','Có'),
('Duyệt hỗ trợ khôi phục mật khẩu','Gửi yêu cầu','Không','Có')],[7.0,3.4,3.4,3.6])
h('Chọn địa chỉ truy cập')
p('Khách dùng http://localhost:3000/. Quản lý dùng http://localhost:3000/manager.html. Admin dùng http://localhost:3000/admin.html. Khi người vận hành đổi cổng hoặc tên máy chủ, dùng địa chỉ do họ cung cấp; localhost của máy người nhận không tự trỏ về máy tác giả.')
h('Một thao tác lưu đi qua những đâu')
p('Nhập thông tin trên giao diện → trình duyệt kiểm tra biểu mẫu → gửi yêu cầu đến máy chủ → máy chủ kiểm tra phiên và quyền → đọc hoặc ghi MySQL → trả kết quả → giao diện cập nhật. Chỉ coi thao tác hoàn tất khi thấy thông báo thành công và có thể tải lại để đọc đúng dữ liệu đã lưu.')
h('Quy ước trong tài liệu')
p('Đạt nghĩa là tình huống có kết quả đúng mong đợi trong môi trường đã ghi. Cần sửa nghĩa là đã tái hiện sự khác biệt. Chưa thử nghĩa là không dùng mã nguồn hoặc một nút có sẵn để suy ra thao tác đã chạy thành công. Các chức năng chỉ được đếm theo tác vụ CN01 đến CN48, không theo từng nút hoặc từng API.')

page('12 Khách hàng đăng nhập và cập nhật hồ sơ')
step(1,'Mở trang khách, đăng ký nếu chưa có tài khoản; nhập ngày sinh theo dd/mm/yyyy. Khi được cấp mã khôi phục, lưu mã ở nơi riêng tư.')
step(2,'Đăng nhập bằng tài khoản khách. Nếu muốn lưu phiên lâu hơn, tích Ghi nhớ đăng nhập trong 7 ngày trước khi bấm Đăng nhập.')
step(3,'Nếu có thông báo yêu cầu hoàn thiện, bấm OK, nhập đủ địa chỉ, ngày sinh, giới tính và nhu cầu còn thiếu rồi Lưu thay đổi. Khi cần sửa sau này, bấm tên ở góc trên.')
step(4,'Đọc lại thông tin sau khi lưu; ngày sinh không được ở tương lai. Email đăng nhập trên form hồ sơ là trường chỉ đọc.')
pic('customer-surveys.png','Hình 1  Màn hình khách sau đăng nhập với hồ sơ đầy đủ',max_h=13,crop=(0,0,1264,960))
p('Đã kiểm chứng: đăng nhập, lưu hồ sơ qua API, khôi phục phiên bằng cookie khi tải lại và yêu cầu hoàn thiện trên hồ sơ thiếu ngày sinh. Lưu ý KT01: giao diện chặn hồ sơ thiếu chặt hơn API hiện tại.')

page('13 Khách hàng thực hiện và quản lý khảo sát')
step(1,'Trong Khảo sát, chọn phiếu còn mở và chưa quá hạn. Kiểm tra tiêu đề, số câu và hạn trước khi bắt đầu.')
step(2,'Chọn đáp án theo từng loại; hoàn thành các câu bắt buộc. Nếu chưa chọn, giao diện hiển thị thông báo như Vui lòng trả lời câu 1.')
step(3,'Bấm Gửi khảo sát và chờ thông báo cảm ơn. Phiếu chuyển sang nhóm đã hoàn thành và có ngày đã gửi; số Khảo sát đã gửi tăng lên.')
step(4,'Có thể Ẩn khảo sát ở lịch sử, mở Xem khảo sát đã ẩn rồi Bỏ ẩn. Thao tác này lưu riêng trong trình duyệt, không xóa bài nộp.')
pic('customer-submitted.png','Hình 2  Phiếu đã nộp được phân biệt với phiếu quá hạn chưa trả lời',max_h=12.5,crop=(220,810,1245,1195))
p('Đã thử trên giao diện: gửi trống bị cảnh báo, gửi đủ được tiếp nhận, ẩn và bỏ ẩn thành công. API từ chối nộp trùng, quá hạn và phiếu CLOSED. Các sai lệch kiểm tra đáp án KT02 đến KT04 vẫn cần sửa.')

page('14 Gửi phản hồi và theo dõi cửa hàng trả lời')
step(1,'Khách chọn Phản hồi sản phẩm, chọn đúng sản phẩm và loại phản hồi. Chọn mức sao từ 1 đến 5, nhập tiêu đề và nội dung rồi gửi.')
step(2,'Quản lý mở Phản hồi. Dòng mới có trạng thái NEW; kiểm tra khách, sản phẩm và nội dung trước khi trả lời.')
step(3,'Nhập câu trả lời và chọn IN_PROGRESS nếu đang xử lý, hoặc RESOLVED khi đã xong. Bấm Lưu xử lý; không được quay về trạng thái trước đó.')
step(4,'Khách tải lại và mở Phản hồi sản phẩm để đọc câu trả lời. Quản lý có thể ẩn phản hồi đã xử lý, sau đó khôi phục từ danh sách đã ẩn.')
pic('manager-feedback.png','Hình 3  Quản lý đã lưu câu trả lời và trạng thái RESOLVED',max_h=11)
p('Đã chạy toàn bộ luồng hai phía: khách gửi phản hồi mới → Quản lý nhìn thấy → trả lời và đánh dấu đã xử lý → khách tải lại đọc được câu trả lời. Khách khác không thấy phản hồi này. Ẩn dữ liệu không làm giảm tổng trong báo cáo.')
p('Ngày xử lý hiển thị có thể thay đổi khi lưu lại nội dung trả lời. Bộ lọc ngày dùng ngày trả lời gần nhất nếu đã trả lời, còn chưa trả lời thì dùng ngày tiếp nhận.')

page('15 Quản lý khách hàng trong công việc hằng ngày')
step(1,'Mở Khách hàng; nhập tên, email hoặc số điện thoại rồi Lọc. Có thể kết hợp nhu cầu và trạng thái Hoạt động hoặc Đã khóa.')
step(2,'Bấm Xem chi tiết để xem hồ sơ, ngày tạo và ngày cập nhật. Cửa sổ này chỉ xem; chưa có thao tác sửa hồ sơ khách ở đây.')
step(3,'Thêm khách hàng bằng tên, email, điện thoại và mật khẩu ban đầu. Vai trò mới luôn là Khách hàng. Khách cần bổ sung hồ sơ khi đăng nhập.')
step(4,'Dùng Khóa hoặc Mở khóa khi cần quản lý quyền truy cập. Chỉ dùng Xóa với khách đủ điều kiện; khách đã có phản hồi hoặc bài khảo sát bị chặn xóa để giữ lịch sử.')
pic('manager-customers.png','Hình 4  Tìm tên khách và xem các thao tác có thể thực hiện',max_h=11)
p('Đã kiểm chứng qua HTTP và MySQL: thêm khách, tìm theo ba loại thông tin, lọc Gaming, lọc khóa, xem chi tiết, khóa chặn đăng nhập, mở khóa đăng nhập lại, xóa khách chưa có lịch sử và chặn xóa khách có lịch sử. Khóa tài khoản còn làm token đang dùng không tiếp tục truy cập được.')

page('16 Quản lý nội dung và vòng đời khảo sát')
step(1,'Tạo khảo sát, nhập tiêu đề, mô tả, hạn tùy chọn. Thêm ít nhất một câu hỏi, chọn đúng loại và cờ bắt buộc. Mỗi dòng là một lựa chọn cho câu ONE hoặc MULTI.')
step(2,'Lưu DRAFT để kiểm tra nội dung. Khi sẵn sàng, Gửi khách hàng để mở và ghi nhận người nhận đang hoạt động.')
step(3,'Nếu phiếu OPEN chưa có bài, có thể chuyển về DRAFT để sửa. Khi đã có bài, đóng phiếu khi kết thúc; không sửa nội dung câu hỏi của phiếu đó.')
step(4,'Với CLOSED, xem chi tiết hoặc Lập khảo sát để tạo bản nháp mới. Ẩn hoặc khôi phục chỉ dọn danh sách; không thay đổi trạng thái và kết quả.')
pic('survey-editor.png','Hình 5  Trình sửa phiếu DRAFT và cấu hình câu hỏi',max_h=10.8)
p('Đã kiểm chứng transaction tạo/sửa, sao chép ID mới, danh sách nhận không nhân đôi khi gửi lại, đóng ngừng nhận bài, ẩn không đóng và báo cáo vẫn tính phiếu ẩn. Nếu tạo thành công nhưng gửi lỗi, tải lại trước khi bấm tạo lần nữa.')
p('Cẩn thận: chuyển về DRAFT và Lập khảo sát có thể đã ghi thay đổi trước khi mở trình sửa. Hủy form không hoàn tác hai thao tác đó.')

page('17 Đọc phân tích và xuất báo cáo')
step(1,'Mở Báo cáo & phân tích; chọn Khách hàng, Phản hồi khách hàng hoặc Kết quả khảo sát.')
step(2,'Chọn Từ ngày và Đến ngày rồi Áp dụng. Lọc theo ngày phát sinh từng nhóm; trạng thái và hồ sơ là dữ liệu hiện tại, không phải lịch sử tại ngày cuối kỳ.')
step(3,'Trong Kết quả khảo sát, bấm Phân tích để xem từng câu, người đã nộp và nội dung chi tiết. Tỷ lệ câu MULTI có thể cộng trên 100%.')
step(4,'Bấm Xuất CSV để tải dữ liệu của nhóm đang chọn. Nút In / Lưu PDF mở chức năng in của trình duyệt; chọn máy in PDF và nơi lưu theo môi trường máy.')
pic('manager-reports.png','Hình 6  Báo cáo khách hàng có chỉ số và biểu đồ phân bố',max_h=10.8)
p('Đã tải và đọc tệp CSV khách hàng thành công: có tiêu đề tiếng Việt, phạm vi thời gian, tổng 12 khách, 11 hoạt động và 1 khóa đúng bộ dữ liệu thử. Đã đối chiếu báo cáo với SQL; tổng phân bố, điểm trung bình và tỷ lệ hoàn thành nhất quán trong các trường hợp thử.')
p('Chưa xác nhận thao tác lưu PDF từ nút in trên mọi trình duyệt hoặc máy in. Đừng nhầm tệp PDF phục vụ kiểm tra bố cục của tài liệu này với PDF do chức năng báo cáo CRM xuất.')

page('18 Admin quản trị tài khoản và hỗ trợ khách')
step(1,'Mở cổng Admin. Trong Tài khoản, dùng bộ lọc để tra cứu; tạo tài khoản mới với vai trò Quản lý hoặc Khách hàng. Vai trò hiện có không đổi được qua luồng này.')
step(2,'Kiểm tra lịch sử trước khi xóa. Hệ thống bảo vệ tài khoản đang đăng nhập, Admin cuối cùng và tài khoản có nghiệp vụ tham chiếu.')
step(3,'Mở Thông báo & lịch sử tương tác để theo dõi yêu cầu khôi phục. Dùng tên, email, mã yêu cầu, trạng thái hoặc Chưa đọc để tìm.')
step(4,'Với hỗ trợ thủ công, liên hệ xác minh chủ tài khoản, ghi chú và xác nhận đã xác minh trước khi duyệt; nếu không phù hợp thì từ chối. Khách tự nhập mật khẩu mới khi được phép.')
pic('admin-history.png','Hình 7  Lịch sử khôi phục và thông báo hoàn tất dành cho Admin',max_h=11)
p('Đã thử giao diện đánh dấu đã đọc: số chưa đọc giảm từ 1 xuống 0. Yêu cầu mới của khách hiện ở nhóm chờ xác minh. API đã được thử riêng cho duyệt, từ chối, hết hạn, hoàn tất và ẩn mật khẩu/mã khỏi dữ liệu Admin.')

page('19 Khôi phục mật khẩu khi cần hỗ trợ')
step(1,'Tại đăng nhập khách, bấm Quên mật khẩu. Nếu có mã cá nhân, nhập email và mã đã lưu để được xác minh trực tiếp.')
step(2,'Nếu mất hoặc chưa có mã, chọn Tôi chưa có hoặc đã mất mã, điền email, điện thoại đã đăng ký và nội dung hỗ trợ. Gửi yêu cầu rồi giữ tab để theo dõi.')
step(3,'Yêu cầu PENDING chờ xác minh trong 30 phút. Khi APPROVED, khách có 15 phút đặt và xác nhận mật khẩu mới. Nếu hết hạn, cần gửi yêu cầu mới theo hướng dẫn.')
step(4,'Sau khi hoàn tất, lưu mã mới được hiển thị một lần và đăng nhập lại. Các token đăng nhập cũ bị từ chối trên máy chủ.')
pic('customer-recovery.png','Hình 8  Khôi phục bằng mã cá nhân trên trang khách',max_h=10.8)
p('Đã kiểm chứng đổi mật khẩu thật trên tài khoản thử riêng: mã cũ vô hiệu sau cấp mã mới; không đổi trước duyệt; mật khẩu xác nhận sai bị chặn; đổi thành công vô hiệu token cũ; cùng phiên không dùng lại được; Admin thấy hoàn tất nhưng không đọc được mã hoặc mật khẩu.')
p('Chỉ thử luồng đổi trên tài khoản cách ly. Không có thay đổi mật khẩu tài khoản thật của người dùng trong đợt kiểm tra này.')

page('20 Phạm vi xác nhận theo chức năng')
p('Bảng này cho biết mức bằng chứng cho từng tác vụ. HTTP là yêu cầu thực đến máy chủ Node kết hợp MySQL; UI là thao tác trên trình duyệt; UT là bài kiểm thử tự động có sẵn. Việc đạt ở đây chỉ áp dụng cho trường hợp đã thử.')
catalog=[]
for t in d.tables:
 for row in t.rows:
  if re.fullmatch(r'CN\d{2}',row.cells[0].text):catalog.append((row.cells[0].text,row.cells[1].text))
catalog=sorted(dict(catalog).items())
coverage={
'CN01':('HTTP + UT','Đăng ký hợp lệ, dữ liệu sai, trùng, hash và mã cấp ban đầu.'),
'CN02':('UI + HTTP + UT','Ba vai trò, sai mật khẩu, sai cổng và phiên không hợp lệ.'),
'CN03':('HTTP + UT','Thời hạn token 8 giờ/7 ngày và thuộc tính cookie.'),
'CN04':('UI + HTTP','Đăng xuất giao diện và header xóa cookie.'),
'CN05':('UI + HTTP','Đọc hồ sơ và xác thực qua cookie.'),
'CN06':('HTTP + UT','Lưu rồi đọc lại, nhu cầu sai và điện thoại trùng.'),
'CN07':('UI + HTTP','UI yêu cầu hoàn thiện; API còn KT01.'),
'CN08':('UI + HTTP','Danh sách OPEN, đã nộp và quá hạn.'),
'CN09':('UI + HTTP','Biểu mẫu, cảnh báo câu bắt buộc và nhập bốn loại qua API.'),
'CN10':('UI + HTTP','Nộp, nộp trùng, quá hạn, đóng; còn KT02 đến KT04.'),
'CN11':('UI + UT','Ẩn lịch sử cục bộ; số đã ẩn tăng.'),
'CN12':('UI + UT','Mở danh sách ẩn và bỏ ẩn.'),
'CN13':('UI + HTTP','Gửi phản hồi và chặn dữ liệu sai.'),
'CN14':('UI + HTTP','Khách đọc được trả lời; không thấy phản hồi khách khác.'),
'CN15':('HTTP + MySQL','Mật khẩu hiện tại, hash mã, quay vòng mã.'),
'CN16':('HTTP + MySQL','Mã hợp lệ cho phép đổi, mã cũ bị từ chối.'),
'CN17':('UI + HTTP','Tạo, theo dõi PENDING và hết hạn.'),
'CN18':('HTTP + MySQL','Hoàn tất hai cách; một lần dùng; token cũ bị hủy.'),
'CN19':('UI + HTTP','Tìm kiếm ba trường, lọc nhu cầu và trạng thái.'),
'CN20':('HTTP + UT','Quản lý thêm khách thành công.'),
'CN21':('UI + HTTP','Đọc cửa sổ chi tiết; không có quyền sửa trong cửa sổ.'),
'CN22':('HTTP + UT','Khóa, mở khóa, phiên cũ và đăng nhập bị chặn.'),
'CN23':('HTTP','Xóa khách trống, chặn xóa khách có lịch sử.'),
'CN24':('UI + HTTP','Đọc danh sách và lọc NEW.'),
'CN25':('UI + HTTP','Lưu xử lý hai phía, không lùi và không đóng khi thiếu trả lời.'),
'CN26':('HTTP','Ẩn RESOLVED, báo cáo và khách vẫn đọc được.'),
'CN27':('HTTP','Khôi phục vào danh sách chính.'),
'CN28':('UI + HTTP','Tìm phiếu, lọc DRAFT và danh sách ẩn.'),
'CN29':('HTTP + UT','Tạo đủ loại, kiểm tra dữ liệu và rollback.'),
'CN30':('UI + HTTP','Trình sửa, DRAFT/OPEN/CLOSED và điều kiện đã có bài.'),
'CN31':('HTTP + UT','ID mới, bản DRAFT, không kế thừa hạn hoặc bài cũ.'),
'CN32':('HTTP','Mở phiếu, ghi người nhận, gửi lại không trùng.'),
'CN33':('HTTP','Đóng ngừng nhận bài, giữ kết quả và chặn mở lại.'),
'CN34':('HTTP + MySQL','Ẩn không đóng, không mất báo cáo hoặc bài nộp.'),
'CN35':('HTTP + MySQL','Bỏ ẩn không đổi trạng thái.'),
'CN36':('UI + HTTP','Ba chỉ số khớp SQL.'),
'CN37':('UI + HTTP','Phân bố cộng đúng tổng, khoảng trống và ngày sai.'),
'CN38':('HTTP + MySQL','Điểm trung bình và tổng xử lý khớp SQL.'),
'CN39':('UI + HTTP','Người nhận, hoàn thành, ngoài danh sách và quá hạn.'),
'CN40':('UI + HTTP','Chi tiết từng câu, người nộp và MULTI cộng trên 100%.'),
'CN41':('UI + UT','CSV đã tải và đọc; lưu PDF từ nút in chưa thử đầu cuối.'),
'CN42':('UI + HTTP + UT','Danh sách, bảo vệ hash và bộ lọc tự động.'),
'CN43':('HTTP + UT','Tạo Quản lý mới; đăng nhập đúng cổng; không đổi vai trò cũ.'),
'CN44':('HTTP','Tự xóa bị chặn; xóa người trống; bảo vệ lịch sử.'),
'CN45':('UI + HTTP','Đọc lịch sử, trạng thái và không lộ mã hoặc mật khẩu.'),
'CN46':('HTTP + MySQL','Không duyệt khi chưa xác minh; duyệt có hạn 15 phút.'),
'CN47':('HTTP + MySQL','Từ chối yêu cầu không khớp và trạng thái REJECTED.'),
'CN48':('UI + HTTP','Đánh dấu đã đọc và số thông báo thay đổi.')}
for offset in range(0,48,16):
 if offset:page('20 Phạm vi xác nhận theo chức năng tiếp theo')
 table(['Mã','Tác vụ','Bằng chứng và kết quả'],[(cn,name,coverage[cn][0]+'\n'+coverage[cn][1])for cn,name in catalog[offset:offset+16]],[1.5,5.0,10.9])

page('21 Cách tái hiện sáu tình huống không đạt')
p('Phần này dành cho người phát triển. Thực hiện trên database thử với tài khoản và phiếu do mình tạo. Không dùng dữ liệu đang vận hành để thử nộp sai hoặc đổi mật khẩu.')
h('KT01 Hồ sơ thiếu thông tin vẫn được lưu')
p('Đăng nhập khách rồi gửi PUT /api/me với họ tên, điện thoại, ngày sinh và nhu cầu hợp lệ, nhưng addr và gender là chuỗi rỗng. Kỳ vọng theo form hoàn thiện: trả lỗi 4xx. Thực tế: HTTP 200 và hồ sơ được lưu. Cần thống nhất các trường bắt buộc trên giao diện và backend.')
h('KT02 Câu bắt buộc bị bỏ trống')
p('Tạo phiếu có ONE, MULTI, TEXT, RATING đều bắt buộc; mở phiếu. Mỗi lần tạo phiếu thử độc lập, chỉ bỏ một câu ONE, MULTI hoặc RATING và vẫn nhập TEXT. Gửi POST /api/surveys/:id/responses. Kỳ vọng: 4xx, không có lượt nộp. Thực tế: cả ba trường hợp đều nhận HTTP 201.')
h('KT03 Chọn đáp án không có trong danh mục')
p('Với ONE có hai lựa chọn A và B, gửi answers.q0 là chuỗi Không có, các câu còn lại hợp lệ. Kỳ vọng: từ chối toàn bộ lượt nộp. Thực tế: HTTP 201; do tìm không ra lựa chọn, chi tiết đó không được ghi hợp lệ nhưng lượt nộp vẫn có thể được coi là hoàn thành.')
h('KT04 Gửi nhiều đáp án cho câu chọn một')
p('Với cùng cấu trúc phiếu mới, gửi answers.q0 là mảng [A, B] cho câu ONE. Kỳ vọng: 4xx vì ONE chỉ nhận một đáp án. Thực tế: HTTP 201 và API lặp mảng để ghi nhiều lựa chọn.')
h('Dữ liệu tối thiểu dùng trong phép thử')
p('Phiếu gồm bốn câu: q0 ONE với A/B; q1 MULTI với X/Y/Z; q2 TEXT; q3 RATING. Bài hợp lệ có q0=A, q1=[X,Y], q2 là ý kiến không trống, q3=5. Một bài hợp lệ tạo năm bản ghi chi tiết vì MULTI có hai lựa chọn.')
h('Vị trí xử lý chính')
p('Hồ sơ: route PUT /api/me trong server.mysql.js. Khảo sát: route POST /api/surveys/:id/responses trong cùng tệp. Bổ sung xác thực kiểu dữ liệu, trường bắt buộc, số lượng lựa chọn và lựa chọn thuộc câu hỏi trước khi ghi; giữ transaction để lỗi không tạo lượt nộp dở dang.')

page('22 Nhật ký 153 tình huống HTTP và MySQL')
p('Mỗi dòng là một phép kiểm tra của đợt chạy cách ly. Đạt ở đây nghĩa là mã trạng thái, kết quả trả về hoặc dữ liệu đọc lại đúng điều kiện của phép thử. Sáu dòng Cần sửa tương ứng bốn vấn đề KT01 đến KT04, không phải 6 chức năng riêng bị hỏng hoàn toàn.')
rows=[]
for i,r in enumerate(data['results'],1):
 rows.append((f'T{i:03d}',r['cn']or'Chung',r['name'],'Đạt'if r['status']=='PASS'else'Cần sửa'))
table(['Ca thử','Mã CN','Điều kiện được kiểm tra','Kết quả'],rows,[1.8,1.8,11.5,2.3])

page('23 Checklist trước khi bàn giao')
p('Checklist giúp người nhận tự thử theo một vòng nghiệp vụ. Các mục có vấn đề cần được xử lý rồi chạy lại, không đánh dấu sẵn là hệ thống đã đạt hoàn toàn.')
table(['Thứ tự','Nội dung cần hoàn thành','Bằng chứng cần lưu'],[
('1','Có đầy đủ source, package-lock.json, database, scripts và .env.example.','Tải source sang thư mục mới và chạy được cấu hình.'),
('2','Cài thư viện, điền MySQL, tạo schema và chạy máy chủ.','/api/health trả ok=true.'),
('3','Chạy lại npm test sau khi khôi phục tệp mẫu.','101/101 đạt hoặc có giải thích lỗi còn lại.'),
('4','Sửa KT01 đến KT04 và chạy lại các tình huống biên.','API trả lỗi rõ, không tạo bản ghi thiếu/sai.'),
('5','Mỗi vai trò đăng nhập đúng cổng và bị chặn ở cổng sai.','Ảnh hoặc nhật ký kiểm tra ba vai trò.'),
('6','Khách hoàn thiện hồ sơ, gửi khảo sát và phản hồi.','Tải lại vẫn đọc đúng dữ liệu đã gửi.'),
('7','Quản lý trả lời, đóng/sao chép khảo sát và xem báo cáo.','Khách đọc được trả lời; dữ liệu báo cáo khớp.'),
('8','Kiểm tra CSV và thao tác lưu PDF trên máy người nhận.','Tệp xuất đọc được tiếng Việt, đúng phạm vi.'),
('9','Thử hỗ trợ khôi phục bằng tài khoản thử riêng.','Chỉ khách nhập mật khẩu mới; phiên cũ vô hiệu.'),
('10','Chuẩn bị tài khoản hợp lệ và hướng dẫn sao lưu/khôi phục.','Không chia sẻ .env, token hoặc mã cá nhân trong tài liệu.')],[1.8,9.1,6.5])
h('Phạm vi chưa xác nhận')
p('Chưa thử tải lớn, xung đột đóng/nộp đồng thời, mọi tổ hợp trình duyệt và kích thước màn hình, máy in PDF thực tế, khôi phục mật khẩu Admin/Quản lý, kiểm thử xâm nhập chuyên sâu hoặc sao lưu/khôi phục toàn bộ database. Hệ thống không có phân hệ đơn hàng, thanh toán, tồn kho hoặc phiếu bảo hành riêng trong mã hiện tại.')

page('24 Giải đáp nhanh cho người sử dụng')
for title,text in [
('Tại sao đăng nhập rồi vẫn phải nhập hồ sơ','Tài khoản có thể thiếu ngày sinh đầy đủ hoặc trường bắt buộc. Nhập và Lưu thay đổi; bấm OK ở thông báo chỉ đưa đến form.'),
('Tại sao không thấy phiếu đã làm trước đây','Trang khách chỉ lấy các phiếu OPEN. Phiếu đã CLOSED không được endpoint danh sách hiện tại trả về; danh sách này chưa phải kho lịch sử đầy đủ.'),
('Ẩn phiếu có ngăn khách trả lời không','Không. Quản lý muốn dừng nhận câu trả lời phải Đóng ngay; chỉ ẩn sẽ không dừng phiếu OPEN còn hạn.'),
('Tại sao số đã gửi và số trong nhóm hoàn thành khác nhau','Nhóm hoàn thành chứa cả quá hạn chưa trả lời. Bộ đếm đã gửi chỉ tính phiếu đã nộp.'),
('Tại sao không xóa được khách','Khách có phản hồi hoặc bài khảo sát được bảo vệ để giữ lịch sử. Quản lý có thể khóa khi cần ngừng truy cập.'),
('Tại sao mật khẩu mẫu Quản lý không đăng nhập được','Database hiện có có thể dùng tài khoản hoặc mật khẩu khác bộ demo. Dùng thông tin do người vận hành cấp; không tự đặt lại mật khẩu người đang dùng.'),
('Đổi máy có giữ danh sách khảo sát khách đã ẩn không','Không đảm bảo. Danh sách đó lưu cục bộ theo email trên trình duyệt, khác với trạng thái ẩn của Quản lý lưu trong MySQL.'),
('Mã khôi phục bị mất sau khi đóng trang phải làm gì','Nếu còn đăng nhập, tạo mã mới trong Bảo mật tài khoản bằng mật khẩu hiện tại. Nếu đã quên mật khẩu và mất mã, gửi hỗ trợ xác minh.'),
('Tại sao báo cáo không hiện tỷ lệ mà hiện dấu gạch','Chưa có mẫu số hợp lệ để tính; không được diễn giải thành 0%.'),
('Gửi khảo sát có đồng nghĩa gửi email không','Không. Luồng hiện tại ghi người nhận và mở phiếu trên hệ thống; không có gửi email tự động trong mã này.')]:h(title);p(text)

page('25 Nguồn đối chiếu và cách tiếp tục kiểm tra')
h('Mã triển khai')
p('Khách hàng: app.js, birth-date.js, customer-session.js, recovery-client.js. Nhân sự: admin.js, role-ui.js, staff-controller.js, staff-surveys.js, customer-details.js, recovery-admin.js. Báo cáo: reports.js và reports-service.js. Backend chính: server.mysql.js. Khôi phục: password-recovery.js và recovery-codes.js. Khảo sát: survey-copy.js và survey-visibility.js. Cấu trúc dữ liệu: database/schema.sql.')
h('Bằng chứng kiểm tra')
p('Bộ test sẵn có chạy bằng npm test, ghi tại outputs/qa/tests-current.txt. Kịch bản HTTP cách ly nằm ở outputs/qa/detailed-system-check.cjs, kết quả từng ca ở detailed-results.json. Ảnh chụp số lượng và kết nối máy đang chạy ở live-results.json. Các tệp này phục vụ đối chiếu trong thư mục dự án, không cần gửi kèm cho người sử dụng thông thường.')
p('Kiểm tra MySQL đã chạy: scripts/check-reports-db.js ở chế độ đọc; scripts/check-recovery-db.js, check-recovery-codes-db.js và check-survey-visibility-db.js sử dụng bảng tạm cho thay đổi nghiệp vụ. Các phép thử HTTP tạo database có tên ngẫu nhiên riêng và xóa sau khi chạy, không ghi dữ liệu thử vào database đang dùng.')
h('Cách đọc tài liệu cùng người dùng mới')
p('Giới thiệu mục đích và ba vai trò → chọn các mã CN cần sử dụng → thực hiện theo mục 12 đến 19 → giải thích bảng phân biệt ẩn, đóng, khóa và xóa ở mục 8 → dùng mục 24 xử lý câu hỏi thường gặp. Người phát triển đọc thêm mục 10, 20, 21 và nhật ký mục 22 trước khi sửa lỗi hoặc nghiệm thu.')
h('Kết luận tại thời điểm rà soát')
p('Hệ thống đã thể hiện được luồng CRM cho khách, Quản lý và Admin trong các trường hợp kiểm tra. Danh mục có 48 tác vụ thuộc 8 nhóm. Trước khi chia sẻ như một bản vận hành hoàn chỉnh, cần xử lý kiểm tra dữ liệu API, bổ sung lại tệp cấu hình mẫu và hoàn thành các kiểm tra môi trường đích được nêu trong checklist.')

# Tắt widow/orphan mặc định ở dòng bảng; giữ mỗi hàng liền trang và lặp tiêu đề.
for t in d.tables:
 for row in t.rows:
  for cell in row.cells:
   for para in cell.paragraphs:
    para.paragraph_format.keep_with_next=False
    para.paragraph_format.widow_control=False
for para in d.paragraphs:
 if para.style.name.startswith('Heading'):para.paragraph_format.keep_with_next=True
for style in d.styles:
 if style.type==1 or style.type==2:
  if style.font.name or style.name in ['Normal','Title','Subtitle'] or style.name.startswith('Heading'):
   style.font.name='Arial'
   rpr=style.element.find(qn('w:rPr'))
   if rpr is not None:
    rf=rpr.find(qn('w:rFonts'))
    if rf is not None:
     for key in list(rf.attrib):
      if 'theme' in key.lower():del rf.attrib[key]
     for key in ['ascii','hAnsi','eastAsia','cs']:rf.set(qn('w:'+key),'Arial')
  for border in list(style.element.iter(qn('w:pBdr'))):border.getparent().remove(border)
for para in d.paragraphs:
 for border in list(para._p.iter(qn('w:pBdr'))):border.getparent().remove(border)
for row in d.tables[0].rows:
 for i,cell in enumerate(row.cells):
  for para in cell.paragraphs:
   if i>0:para.alignment=WD_ALIGN_PARAGRAPH.CENTER
for cell in d.tables[0].rows[0].cells:
 for para in cell.paragraphs:
  for run in para.runs:run.font.color.rgb=RGBColor(255,255,255);run.bold=True;run.font.size=Pt(10)
for pic0 in d.inline_shapes:
 docpr=pic0._inline.docPr
 docpr.set('descr','Ảnh màn hình Backline CRM trên dữ liệu giả lập minh họa thao tác được mô tả ngay phía trên')

out=OUT/'Backline_CRM_Huong_dan_va_kiem_thu_hoan_chinh.docx'
d.save(out)
ids=[row.cells[0].text for t in d.tables for row in t.rows if re.fullmatch(r'CN\d{2}',row.cells[0].text)]
assert set(ids)=={f'CN{i:02d}'for i in range(1,49)}
assert len(catalog)==48
(QA/'document-check.json').write_text(json.dumps({'functions':48,'httpChecks':data['summary'],'screenshots':len(d.inline_shapes),'tables':len(d.tables),'chapters':25},ensure_ascii=False,indent=2),encoding='utf-8')
print(out)
print('Tables:',len(d.tables),'Screenshots:',len(d.inline_shapes))
