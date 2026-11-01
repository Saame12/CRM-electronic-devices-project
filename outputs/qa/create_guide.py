from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from pathlib import Path

OUT=Path(__file__).resolve().parents[1]
d=Document(); s=d.sections[0]
s.page_height=Cm(29.7); s.page_width=Cm(21)
s.top_margin=Cm(1.7); s.bottom_margin=Cm(1.7); s.left_margin=Cm(1.8); s.right_margin=Cm(1.8)
for name in ['Normal','Title','Subtitle','Heading 1','Heading 2']:
 st=d.styles[name]; st.font.name='Arial'; st.font.color.rgb=RGBColor(0,0,0)
 st.font.size=Pt({'Normal':10.5,'Title':25,'Subtitle':12,'Heading 1':17,'Heading 2':12}[name])
 st.paragraph_format.space_after=Pt(7)
d.styles['Normal'].paragraph_format.line_spacing=1.12
d.core_properties.title='Chức năng và hướng dẫn sử dụng Backline CRM'
d.core_properties.subject='Thống kê 48 chức năng theo 8 nhóm nghiệp vụ'
d.core_properties.author='Backline CRM'
foot=s.footer.paragraphs[0]; foot.alignment=WD_ALIGN_PARAGRAPH.RIGHT
r=foot.add_run('Backline CRM  |  '); r.font.size=Pt(9)
f=OxmlElement('w:fldSimple'); f.set(qn('w:instr'),'PAGE'); foot._p.append(f)

def p(t,style=None): return d.add_paragraph(t,style)
def h(t): d.add_heading(t,2)
def page(t): d.add_page_break(); d.add_heading(t,1)
def table(headers,rows,widths):
 t=d.add_table(rows=1,cols=len(headers)); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.autofit=False
 for c,w in zip(t.columns,widths): c.width=Cm(w)
 for c,v in zip(t.rows[0].cells,headers): c.text=v
 for row in rows:
  for c,v in zip(t.add_row().cells,row): c.text=str(v)
 for i,row in enumerate(t.rows):
  for j,c in enumerate(row.cells):
   c.width=Cm(widths[j]); c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
   pr=c._tc.get_or_add_tcPr(); borders=OxmlElement('w:tcBorders')
   for side in ['top','left','bottom','right']:
    el=OxmlElement('w:'+side); el.set(qn('w:val'),'single'); el.set(qn('w:sz'),'4'); el.set(qn('w:color'),'D9D9D9'); borders.append(el)
   pr.append(borders); mar=OxmlElement('w:tcMar')
   for side in ['top','left','bottom','right']:
    el=OxmlElement('w:'+side); el.set(qn('w:w'),'90'); el.set(qn('w:type'),'dxa'); mar.append(el)
   pr.append(mar)
   shade=OxmlElement('w:shd'); shade.set(qn('w:fill'),'17365D' if i==0 else ('F2F5F8' if i%2==0 else 'FFFFFF')); pr.append(shade)
   for para in c.paragraphs:
    para.paragraph_format.space_after=Pt(3); para.paragraph_format.space_before=Pt(2); para.paragraph_format.line_spacing=1.05
    if j==0: para.alignment=WD_ALIGN_PARAGRAPH.CENTER
    for run in para.runs:
     run.font.size=Pt(10); run.bold=i==0
     if i==0: run.font.color.rgb=RGBColor(255,255,255)
  no=OxmlElement('w:cantSplit'); row._tr.get_or_add_trPr().append(no)
 repeat=OxmlElement('w:tblHeader'); t.rows[0]._tr.get_or_add_trPr().append(repeat)
 p('')
 return t

p('Chức năng và hướng dẫn sử dụng\nBackline CRM','Title')
p('Hệ thống quản lý quan hệ khách hàng cho cửa hàng PC và laptop','Subtitle')
p('Ngày rà soát 01 tháng 11 năm 2026')
p('Backline CRM giúp khách hàng cập nhật thông tin, trả lời khảo sát và gửi phản hồi; giúp Quản lý chăm sóc khách và phân tích kết quả; giúp Admin quản trị tài khoản và hỗ trợ khôi phục mật khẩu. Tài liệu dành cho người mới sử dụng và người cần giới thiệu đồ án.')
h('48 chức năng trong 8 nhóm')
p('Mỗi chức năng là một tác vụ có mục đích sử dụng riêng, được đánh mã CN01 đến CN48. Các bộ lọc, loại câu hỏi và bước nhập liệu không được đếm thành chức năng riêng. Đây là cách phân nhóm để đọc và bàn giao, không phải số lượng màn hình hoặc API.')
table(['Nhóm chức năng','Số lượng','Trang'],[
('Tài khoản và hồ sơ','7','2'),('Khảo sát và phản hồi của khách','7','3'),('Khôi phục mật khẩu của khách','4','4'),('Quản lý khách hàng','5','5'),('Quản lý khảo sát','8','6'),('Xử lý phản hồi','4','5'),('Tổng quan và báo cáo','6','7'),('Quản trị và hỗ trợ của Admin','7','8'),('Tổng cộng','48','')],[10.9,2.8,3.7])
h('Chọn đúng vai trò để bắt đầu')
p('Khách hàng dùng trang gốc /. Quản lý dùng /manager.html. Admin dùng /admin.html. Với cổng mặc định, thêm đường dẫn vào http://localhost:3000. Máy khác dùng địa chỉ do người vận hành cung cấp.')
p('Trang 9 minh họa các luồng làm việc. Trang 10 ghi kết quả kiểm tra và các giới hạn cần biết trước khi bàn giao.')

page('1 Tài khoản và hồ sơ')
p('7 chức năng dùng trên trang khách hàng. Đăng nhập và đăng xuất cũng có ở các cổng nhân sự nhưng chỉ được tính một lần trong thống kê.')
table(['Mã','Chức năng','Cách hoạt động và kết quả'],[
('CN01','Đăng ký khách hàng','Nhập họ tên, email, điện thoại, ngày sinh, giới tính và mật khẩu. Hệ thống tạo tài khoản khách, cấp phiên đăng nhập và mã khôi phục cá nhân.'),
('CN02','Đăng nhập theo vai trò','Nhập email và mật khẩu tại đúng cổng. Hệ thống kiểm tra mật khẩu, vai trò và trạng thái tài khoản trước khi cho vào.'),
('CN03','Ghi nhớ đăng nhập','Khách chọn Ghi nhớ đăng nhập trong 7 ngày. Nếu không chọn, token có hạn 8 giờ và cookie là cookie phiên.'),
('CN04','Đăng xuất','Bấm Đăng xuất để kết thúc phiên ở trình duyệt đang dùng. Tài khoản và lịch sử nghiệp vụ vẫn được giữ.'),
('CN05','Xem hồ sơ cá nhân','Bấm tên hoặc ảnh đại diện để mở Thông tin cá nhân, xem email, thông tin liên hệ, ngày sinh, giới tính và nhu cầu.'),
('CN06','Cập nhật hồ sơ','Sửa thông tin và bấm Lưu thay đổi. Hệ thống ghi vào MySQL rồi hiển thị dữ liệu đã lưu. Email đăng nhập chỉ đọc trên form.'),
('CN07','Hoàn thiện hồ sơ lần đầu','Khi hồ sơ thiếu, giao diện yêu cầu bổ sung. Bấm OK để đến form; chỉ sau khi lưu đủ thông tin mới tiếp tục luồng khảo sát trên giao diện.')],[1.5,4.4,11.5])
h('Dữ liệu cần nhập đúng')
p('Số điện thoại gồm 10 đến 11 chữ số và bắt đầu bằng 0. Ngày sinh nhập theo dd/mm/yyyy, phải là ngày hợp lệ và không ở tương lai. Email và điện thoại không được trùng tài khoản đã có. Mật khẩu đăng ký cần ít nhất 6 ký tự.')
p('Hồ sơ đầy đủ trên giao diện gồm họ tên, điện thoại, địa chỉ, ngày sinh, giới tính và nhu cầu. Có thể chọn Gaming, Đồ họa, Văn phòng hoặc Chưa xác định. Giá trị Chưa xác định vẫn là một lựa chọn hợp lệ.')
h('Ví dụ sử dụng')
p('Khách đăng ký tài khoản → lưu mã khôi phục được cấp → bổ sung địa chỉ và nhu cầu → bấm Lưu thay đổi → mở danh sách khảo sát. Việc chỉ đóng thông báo hoặc bấm OK chưa lưu hồ sơ.')

page('2 Khảo sát và phản hồi của khách')
p('7 chức năng giúp khách trao đổi với cửa hàng. Người dùng chỉ thấy phản hồi của chính mình.')
table(['Mã','Chức năng','Cách hoạt động và kết quả'],[
('CN08','Xem khảo sát và tình trạng','Mở Khảo sát để xem tiêu đề, hạn, số câu, thời gian ước tính và tình trạng đã gửi hoặc quá hạn. Dữ liệu nguồn là các phiếu đang OPEN.'),
('CN09','Thực hiện khảo sát','Bấm Thực hiện khảo sát; trả lời câu chọn một, chọn nhiều, văn bản hoặc đánh giá sao. Giao diện đánh dấu câu bắt buộc.'),
('CN10','Gửi câu trả lời','Bấm gửi sau khi nhập đủ câu bắt buộc. Hệ thống lưu lượt nộp và câu trả lời; mỗi khách chỉ nộp một lần cho mỗi phiếu, trong thời hạn nhận bài.'),
('CN11','Ẩn khảo sát khỏi lịch sử','Tại nhóm đã hoàn thành, bấm Ẩn khảo sát. Danh sách ẩn lưu riêng trên trình duyệt theo email, không xóa bài nộp.'),
('CN12','Bỏ ẩn khảo sát','Chọn Xem khảo sát đã ẩn rồi Bỏ ẩn. Phiếu quay lại nhóm lịch sử đang hiển thị trên trình duyệt đó.'),
('CN13','Gửi phản hồi sản phẩm','Chọn sản phẩm, loại phản hồi, mức sao và nhập nội dung; bấm Gửi phản hồi. Hệ thống tạo phản hồi mới gắn với tài khoản khách.'),
('CN14','Theo dõi phản hồi và trả lời','Xem Phản hồi đã gửi để đọc nội dung, ngày gửi và câu trả lời của cửa hàng. Nhãn Đã phản hồi xuất hiện khi có nội dung trả lời.')],[1.5,4.4,11.5])
h('Bốn loại câu hỏi khảo sát')
p('Chọn một: một đáp án. Chọn nhiều: nhiều đáp án. Văn bản: nhập ý kiến tự do. Đánh giá sao: chọn mức từ 1 đến 5. Câu có dấu sao bắt buộc cần được hoàn thành trước khi gửi trên giao diện.')
h('Các điểm dễ nhầm')
p('Nhóm Đã hoàn thành chứa cả phiếu đã nộp và phiếu quá hạn chưa trả lời; hãy đọc nhãn trên từng phiếu. Khảo sát bị Quản lý đóng sẽ không còn được danh sách OPEN trả về, nên trang khách chưa phải kho lịch sử đầy đủ các phiếu đã đóng.')
p('Loại phản hồi gồm Góp ý, Khen ngợi, Báo lỗi / Khiếu nại và Câu hỏi. Mức sao hợp lệ là số nguyên từ 1 đến 5; nội dung không được chỉ có khoảng trắng. Không có luồng sửa hoặc xóa phản hồi đã gửi trên giao diện khách.')

page('3 Khôi phục mật khẩu của khách')
p('4 chức năng dành cho tài khoản khách hàng đang hoạt động. Luồng này chưa cung cấp khôi phục mật khẩu riêng cho Admin hoặc Quản lý.')
table(['Mã','Chức năng','Cách hoạt động và kết quả'],[
('CN15','Tạo mã khôi phục mới','Mở Thông tin cá nhân → Bảo mật tài khoản, nhập mật khẩu hiện tại rồi tạo mã. Mã mới thay mã cũ và chỉ được hiển thị một lần để lưu.'),
('CN16','Xác minh bằng mã cá nhân','Tại Quên mật khẩu, nhập email và mã đã lưu. Mã hợp lệ tạo quyền tự đặt mật khẩu trong 15 phút, không cần Admin duyệt.'),
('CN17','Yêu cầu hỗ trợ và theo dõi','Nếu mất mã, nhập email, điện thoại đã đăng ký và lý do từ 5 đến 500 ký tự. Giữ trình duyệt để theo dõi yêu cầu chờ xác minh, có hạn 30 phút.'),
('CN18','Đặt lại mật khẩu','Khi được cho phép, nhập và xác nhận mật khẩu mới. Thành công sẽ vô hiệu phiên đăng nhập cũ, hủy yêu cầu còn hiệu lực khác và cấp mã khôi phục mới.')],[1.5,4.4,11.5])
h('Hai cách khôi phục')
p('Có mã cá nhân → xác minh mã → được phép đổi trong 15 phút → đặt mật khẩu mới → lưu mã mới → đăng nhập lại.')
p('Mất mã → gửi yêu cầu hỗ trợ → Admin xác minh chủ tài khoản qua thông tin liên hệ đã đăng ký → duyệt hoặc từ chối → nếu duyệt, khách có 15 phút để tự đặt mật khẩu.')
h('Trạng thái yêu cầu')
table(['Mã trạng thái','Ý nghĩa'],[('PENDING','Đang chờ Admin hỗ trợ xác minh.'),('APPROVED','Đã cho phép khách tự đặt mật khẩu trong thời hạn.'),('COMPLETED','Khách đã đổi mật khẩu thành công.'),('REJECTED','Admin đã từ chối hỗ trợ.'),('EXPIRED','Yêu cầu đã hết hạn.'),('CANCELLED','Yêu cầu đã bị hủy hiệu lực.')],[4.7,12.7])
p('Mật khẩu mới và xác nhận phải trùng nhau, ít nhất 6 ký tự, tối đa 72 byte. Không có email tự động hoặc mật khẩu tạm trong luồng hiện tại. Admin không xem được mật khẩu hay mã cá nhân dạng gốc.')

page('4 Quản lý khách hàng và phản hồi')
p('Quản lý dùng /manager.html để thực hiện 5 chức năng khách hàng và 4 chức năng xử lý phản hồi. Admin không có quyền vận hành các nhóm này qua luồng phân quyền hiện tại.')
h('Quản lý khách hàng gồm 5 chức năng')
table(['Mã','Chức năng','Cách hoạt động và kết quả'],[
('CN19','Tra cứu khách hàng','Tìm theo tên, email, điện thoại; lọc nhu cầu và trạng thái Hoạt động hoặc Đã khóa.'),
('CN20','Thêm khách hàng','Nhập tên, email, điện thoại và mật khẩu ban đầu; có thể bổ sung địa chỉ, nhu cầu. Tài khoản mới luôn có vai trò Khách hàng.'),
('CN21','Xem chi tiết khách','Mở thông tin khách trong cửa sổ chi tiết. Đây là chức năng xem, chưa có form sửa hồ sơ khách ở đây.'),
('CN22','Khóa và mở khóa khách','Chuyển trạng thái ACTIVE hoặc LOCKED. Khách bị khóa không thể tiếp tục dùng các API cần xác thực; lịch sử vẫn giữ.'),
('CN23','Xóa khách hàng','Chỉ xóa khách chưa có phản hồi hoặc bài khảo sát. Nếu đã có lịch sử, thao tác bị từ chối; có thể dùng khóa tài khoản.')],[1.5,4.4,11.5])
h('Xử lý phản hồi gồm 4 chức năng')
table(['Mã','Chức năng','Cách hoạt động và kết quả'],[
('CN24','Tra cứu phản hồi','Xem nội dung, sản phẩm, khách, mức sao; lọc trạng thái và khoảng ngày. Danh sách chính tách khỏi danh sách đã ẩn.'),
('CN25','Trả lời và cập nhật xử lý','Nhập câu trả lời, chọn trạng thái và Lưu xử lý. Không được lùi trạng thái; Đã xử lý bắt buộc có nội dung trả lời.'),
('CN26','Ẩn phản hồi đã xử lý','Chỉ phản hồi RESOLVED được ẩn. Hệ thống lưu trạng thái ẩn trong MySQL; khách vẫn đọc được và báo cáo vẫn tính.'),
('CN27','Khôi phục phản hồi đã ẩn','Vào Xem phản hồi đã ẩn rồi bấm Khôi phục phản hồi để đưa lại danh sách chính.')],[1.5,4.4,11.5])
p('Tiến độ phản hồi: NEW → IN_PROGRESS → RESOLVED. Có thể chuyển thẳng từ NEW sang RESOLVED nếu có câu trả lời. Bộ lọc ngày dùng ngày trả lời gần nhất nếu có, nếu chưa có thì dùng ngày tiếp nhận.')

page('5 Quản lý khảo sát')
p('8 chức năng dành cho Quản lý. Câu hỏi và lựa chọn được lưu theo từng khảo sát; phiếu sao chép có dữ liệu độc lập với nguồn.')
table(['Mã','Chức năng','Cách hoạt động và kết quả'],[
('CN28','Tra cứu khảo sát','Tìm tiêu đề hoặc mô tả, lọc DRAFT, OPEN, CLOSED; xem hạn và số lượt trả lời. Danh sách đã ẩn được xem riêng.'),
('CN29','Tạo khảo sát','Nhập tiêu đề, mô tả, hạn tùy chọn và ít nhất một câu hỏi. Thêm hoặc bỏ câu hỏi; chọn loại và bắt buộc. Chọn một hoặc nhiều cần ít nhất hai lựa chọn.'),
('CN30','Chỉnh sửa khảo sát','Sửa phiếu DRAFT. Phiếu OPEN chỉ được chuyển về DRAFT để sửa khi chưa có lượt trả lời. Phiếu CLOSED không sửa hoặc mở lại qua luồng hiện tại.'),
('CN31','Lập phiếu từ khảo sát cũ','Bấm Lập khảo sát trên phiếu CLOSED để sao chép nội dung thành bản DRAFT mới. Không mang theo hạn cũ, người nhận hay câu trả lời.'),
('CN32','Mở và gửi khảo sát','Bấm Gửi khách hàng để mở phiếu và ghi nhận người nhận là khách đang hoạt động. Gửi lại không tạo trùng cặp phiếu và người nhận.'),
('CN33','Đóng khảo sát ngay','Đóng phiếu DRAFT hoặc OPEN để ngừng nhận câu trả lời mới. Không cần chờ đủ lượt trả lời; kết quả đã có vẫn được giữ.'),
('CN34','Ẩn khảo sát','Ẩn khỏi danh sách chính của Quản lý, lưu vào MySQL. Không đóng phiếu, không xóa câu trả lời, không loại khỏi báo cáo.'),
('CN35','Khôi phục khảo sát','Đưa phiếu đã ẩn trở lại danh sách chính. Trạng thái và hạn giữ nguyên; phiếu CLOSED không tự mở lại.')],[1.5,4.4,11.5])
h('Quy tắc vòng đời')
p('DRAFT là bản nháp khách chưa thấy. OPEN cho phép trả lời khi còn hạn. OPEN quá hạn không nhận bài mới nhưng không tự đổi trạng thái lưu thành CLOSED. CLOSED là đã đóng; có thể xem chi tiết và lập phiếu mới từ nội dung cũ.')
p('Bấm chuyển OPEN về DRAFT có thể đã thay đổi trạng thái trước khi mở form; hủy form không tự mở lại. Bấm Lập khảo sát tạo bản nháp ngay; hủy form không xóa bản nháp. Nếu tạo phiếu thành công nhưng gửi lỗi, tải lại danh sách để kiểm tra trước khi tạo lại.')

page('6 Tổng quan và báo cáo')
p('6 chức năng dành cho Quản lý. Số liệu được tính từ dữ liệu MySQL; cần bấm Cập nhật hoặc tải lại để đọc số liệu mới.')
table(['Mã','Chức năng','Cách hoạt động và kết quả'],[
('CN36','Xem tổng quan CRM','Màn hình Tổng quan hiển thị tổng khách hàng, phản hồi chưa xử lý và khảo sát có trạng thái OPEN. Chỉ số OPEN có thể gồm phiếu đã quá hạn.'),
('CN37','Báo cáo khách hàng','Xem tổng, hoạt động, đã khóa, mức hoàn thiện hồ sơ, nhóm tuổi, giới tính, nhu cầu và xu hướng phát sinh theo tháng.'),
('CN38','Báo cáo phản hồi','Xem tổng, điểm sao trung bình, tỷ lệ đánh giá 4–5 sao, tỷ lệ xử lý, khiếu nại và phân bố theo trạng thái, loại hoặc sản phẩm.'),
('CN39','Báo cáo kết quả khảo sát','Xem tổng phiếu, trạng thái thực tế gồm quá hạn, người nhận, lượt nộp, người chưa trả lời và tỷ lệ hoàn thành.'),
('CN40','Xem kết quả chi tiết khảo sát','Xem tổng hợp từng câu và danh sách người trả lời cùng nội dung đã nộp. Trên danh sách khảo sát, Xem chi tiết được hiển thị cho phiếu CLOSED.'),
('CN41','Xuất và in báo cáo','Chọn nhóm, khoảng ngày rồi Xuất CSV hoặc In / Lưu PDF. CSV là tệp dữ liệu; PDF dùng hộp thoại in của trình duyệt để lưu.')],[1.5,4.4,11.5])
h('Đọc số liệu đúng cách')
p('Lọc thời gian theo ngày tạo tài khoản, ngày tiếp nhận phản hồi và ngày tạo khảo sát. Kết quả của các phiếu được chọn vẫn tính toàn bộ lượt nộp của phiếu, không chỉ bài nộp trong khoảng ngày lọc. Chi tiết một phiếu đọc toàn bộ lượt trả lời của phiếu đó.')
table(['Chỉ số','Cách tính hoặc giới hạn'],[
('Tỷ lệ xử lý','Phản hồi RESOLVED chia tổng phản hồi trong phạm vi.'),('Tỷ lệ tích cực','Đánh giá 4–5 sao chia số đánh giá hợp lệ từ 1 đến 5.'),('Hoàn thành khảo sát','Người đã nộp thuộc danh sách nhận chia số người nhận; người nộp ngoài danh sách được tách riêng.'),('Câu chọn nhiều','Tỷ lệ từng lựa chọn tính trên người đã trả lời câu đó; tổng có thể vượt 100%.'),('Chưa đủ dữ liệu','Dấu — hoặc Chưa đủ dữ liệu nghĩa là chưa có mẫu số, không phải 0%.')],[5.0,12.4])
p('Báo cáo vẫn tính dữ liệu đã ẩn. Tuổi được ước tính từ năm sinh. Tổng hợp câu văn bản trả tối đa 100 ví dụ; đây không phải giới hạn số câu trả lời được lưu.')

page('7 Quản trị tài khoản và hỗ trợ của Admin')
p('7 chức năng tại /admin.html. Admin quản trị tài khoản và hỗ trợ khôi phục; Quản lý phụ trách khách hàng, phản hồi, khảo sát và báo cáo.')
table(['Mã','Chức năng','Cách hoạt động và kết quả'],[
('CN42','Tra cứu tài khoản','Xem danh sách và tìm theo tên, email, điện thoại; lọc vai trò và trạng thái. Có nút Tải lại dữ liệu.'),
('CN43','Tạo tài khoản','Nhập thông tin liên hệ và mật khẩu; chọn vai trò Quản lý hoặc Khách hàng ngay lúc tạo. Không có lựa chọn tạo Admin trên form này.'),
('CN44','Xóa tài khoản','Xóa khi không vướng điều kiện bảo vệ hoặc ràng buộc dữ liệu. Không tự xóa mình; không xóa Admin cuối cùng hoặc người đã có nghiệp vụ được bảo vệ.'),
('CN45','Xem lịch sử khôi phục','Mở Thông báo & lịch sử tương tác. Tìm tên, email hoặc mã yêu cầu, lọc trạng thái hay chưa đọc; API trả tối đa 200 tương tác mới nhất.'),
('CN46','Duyệt hỗ trợ khôi phục','Với yêu cầu PENDING còn hạn, xác minh khách qua thông tin liên hệ đã đăng ký, ghi chú và tích đã xác minh. Duyệt cấp 15 phút để khách tự đổi.'),
('CN47','Từ chối hỗ trợ khôi phục','Nhập ghi chú cho yêu cầu đang chờ rồi Từ chối. Yêu cầu chuyển REJECTED, không cấp quyền đặt mật khẩu.'),
('CN48','Đánh dấu thông báo đã đọc','Sau khi khách đổi thành công, Admin nhận thông báo hoàn tất. Bấm Đánh dấu đã đọc chỉ đổi trạng thái thông báo, không đổi mật khẩu.')],[1.5,4.4,11.5])
h('Giới hạn quyền cần nhớ')
p('Vai trò tài khoản hiện có không đổi được qua giao diện; API đổi vai trò trả về không hỗ trợ. Không nên mô tả Admin là người có thể thực hiện tất cả thao tác của Quản lý trong phiên bản này.')
p('Admin không đặt mật khẩu mới thay khách trong luồng khôi phục, không nhận mật khẩu tạm và không xem mã cá nhân gốc. Khách có mã hợp lệ được hệ thống xác minh trực tiếp; Admin theo dõi kết quả, không phải duyệt lại bước này.')
h('Khi thao tác xóa bị từ chối')
p('Khách đã có phản hồi hoặc bài khảo sát cần giữ lịch sử; người đã tạo khảo sát hoặc trả lời phản hồi cũng có thể không xóa được. Với khách hàng, Quản lý có thể dùng Khóa tài khoản để ngừng quyền truy cập mà giữ dữ liệu.')

page('8 Các luồng sử dụng điển hình')
h('Luồng 1 Khách bắt đầu sử dụng')
p('Đăng ký hoặc đăng nhập → lưu mã cá nhân nếu vừa được cấp → hoàn thiện hồ sơ → chọn Khảo sát → thực hiện và gửi bài → kiểm tra ngày đã gửi. Nếu chưa có phiếu mới, khách có thể chuyển sang gửi phản hồi về sản phẩm.')
h('Luồng 2 Cửa hàng tiếp nhận và xử lý phản hồi')
p('Khách gửi phản hồi → hệ thống ghi NEW → Quản lý mở Phản hồi và lọc → nhập câu trả lời → chọn IN_PROGRESS hoặc RESOLVED → Lưu xử lý → khách tải lại để đọc câu trả lời → Quản lý có thể ẩn phản hồi đã xử lý.')
h('Luồng 3 Tổ chức một đợt khảo sát')
p('Quản lý tạo DRAFT → thêm câu hỏi và lựa chọn → kiểm tra tiêu đề, mô tả, hạn và câu bắt buộc → gửi khách hàng → khách nộp câu trả lời → Quản lý đóng phiếu khi kết thúc → xem chi tiết hoặc báo cáo → xuất CSV hay in PDF.')
h('Luồng 4 Khách quên mật khẩu và mất mã')
p('Khách gửi yêu cầu hỗ trợ và giữ trình duyệt → Admin mở lịch sử, xác minh và duyệt → khách theo dõi trạng thái rồi đặt mật khẩu trong 15 phút → lưu mã mới → đăng nhập lại → Admin đánh dấu thông báo hoàn tất đã đọc.')
h('Bảng phân biệt các thao tác dễ nhầm')
table(['Thao tác','Phạm vi tác động','Dữ liệu có mất không'],[
('Khách ẩn khảo sát','Riêng trình duyệt và email đang dùng.','Không mất bài nộp; đổi máy có thể thấy khác.'),('Quản lý ẩn khảo sát','Danh sách của Quản lý, lưu MySQL.','Không; phiếu OPEN còn hạn vẫn nhận bài.'),('Quản lý đóng khảo sát','Ngừng nhận câu trả lời mới.','Không mất câu trả lời đã có.'),('Ẩn phản hồi đã xử lý','Danh sách vận hành của Quản lý.','Không; khách và báo cáo vẫn đọc được.'),('Khóa khách','Ngừng quyền truy cập tài khoản khách.','Không mất lịch sử.'),('Xóa tài khoản','Xóa bản ghi nếu điều kiện cho phép.','Có; cần kiểm tra trước khi xác nhận.')],[5.2,6.1,6.1])
h('Khi không thấy dữ liệu mới')
p('Tải lại trang hoặc vào lại mục tương ứng; với báo cáo bấm Cập nhật. Danh sách khảo sát của khách chưa có cơ chế đẩy tức thời bằng WebSocket. Trước khi gửi lại thao tác tạo, kiểm tra bản ghi đã được tạo hay chưa để tránh thao tác trùng.')

page('9 Kết quả rà soát và lưu ý bàn giao')
h('Phạm vi kiểm tra ngày 01 tháng 11 năm 2026')
p('Đã đối chiếu màn hình khách, màn hình nhân sự, các API xử lý, phân quyền, cấu trúc dữ liệu và công thức báo cáo. Có 48 tác vụ được lập danh mục. Việc có mã triển khai không đồng nghĩa mọi tình huống đã được kiểm thử đầu cuối.')
p('Kết quả kiểm thử tự động tại máy rà soát: 83 bài đạt, 3 tệp kiểm thử không chạy được do thiếu thư viện dotenv. Các tệp bị ảnh hưởng là demo-data.test.js, real-surveys.test.js và setup-project.test.js. Không kết luận các nghiệp vụ tương ứng bị lỗi từ kết quả thiếu thư viện này.')
p('Chưa kiểm chứng trực tiếp luồng trình duyệt kết hợp MySQL trong lần rà soát này: thư mục dự án chưa có .env và chưa có bộ thư viện cài hoàn chỉnh. Cần hoàn tất cấu hình và chạy thử với dữ liệu thử trước khi xác nhận vận hành đầy đủ.')
h('Những giới hạn đã xác định từ mã')
p('Danh sách khảo sát OPEN của khách chưa giới hạn theo danh sách người nhận. Người nhận hiện phục vụ ghi nhận gửi và tính báo cáo; không nên dùng danh sách đó làm cam kết ai được phép thấy phiếu.')
p('Kiểm tra hồ sơ đầy đủ nằm chủ yếu trên giao diện; API chưa bắt đầy đủ địa chỉ và giới tính giống form. API nộp khảo sát chưa kiểm tra đầy đủ câu ONE, MULTI, RATING bắt buộc như giao diện; kiểm tra mở phiếu và thao tác đóng đồng thời cần được tăng cường nếu vận hành thực tế.')
p('Ngày trả lời phản hồi được cập nhật khi lưu nội dung trả lời mới, nên có thể là lần trả lời gần nhất. Không nên hiểu nhãn thời gian đó là mốc xử lý xong đầu tiên cố định. Không có quản lý bán hàng, đơn hàng, kho, thanh toán hoặc quy trình bảo hành riêng trong mã hiện tại; nội dung liên quan chỉ có thể được thu qua khảo sát hoặc phản hồi.')
h('Chuẩn bị trước khi cho người khác dùng')
p('Người vận hành cài thư viện bằng npm ci, tạo cấu hình bằng npm run config, điền kết nối MySQL, chạy npm run setup rồi npm start theo README. Kiểm tra /api/health và chạy npm test sau khi cài đủ phụ thuộc. Dùng dữ liệu thử để kiểm tra ba vai trò, một lượt khảo sát, một phản hồi và một luồng khôi phục mật khẩu.')
h('Nguồn đối chiếu trong dự án')
p('Giao diện và thao tác: app.js, role-ui.js, staff-controller.js, staff-surveys.js, recovery-client.js, recovery-admin.js, reports.js. Xử lý dữ liệu và quyền: server.mysql.js, customer-session.js, password-recovery.js, recovery-codes.js, survey-copy.js, survey-visibility.js, reports-service.js. Cấu trúc: database/schema.sql. Kiểm thử: scripts/*.test.js. Hướng dẫn: README.md, LOGIC_HE_THONG.md, REPORTS.md, PASSWORD_RECOVERY.md.')

assert sum([7,7,4,5,8,4,6,7])==48
path=OUT/'Thong_ke_chuc_nang_va_huong_dan_Backline_CRM.docx'
d.save(path)
print(path)
