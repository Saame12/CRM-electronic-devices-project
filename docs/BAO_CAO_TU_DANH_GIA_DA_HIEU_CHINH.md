# Bản tự đánh giá đã hiệu chỉnh — Backline CRM

Ngày cập nhật: 01/11/2026. Bản này dùng để thay nội dung tự đánh giá không còn đúng trong file Word cũ khi lập báo cáo nộp chính thức.

## Phạm vi và cách đếm

Chưa được cung cấp đề bài/rubric gốc nên chưa xác định tổng số yêu cầu bắt buộc chính thức. Không dùng khẳng định “15/17 chức năng bắt buộc đạt đầy đủ”. Bảng trong Word cũ có 16 dòng: 12 Đạt, 3 Một phần, 1 Chưa có; bỏ dòng tùy chọn còn 15 dòng: 12 Đạt, 2 Một phần, 1 Chưa có. Đây là số đếm của bản cũ, không phải kết luận sau sửa.

Tài liệu hướng dẫn từng ghi 48 tác vụ người dùng; tác vụ, yêu cầu đề bài và ca kiểm thử là ba đơn vị khác nhau. Không đổi chúng thành một tỷ lệ hoàn thiện chung.

## Kết quả thực tế sau khắc phục

Hệ thống có ba vai trò: Admin quản lý tài khoản/khôi phục, Quản lý quản lý khách/phản hồi/khảo sát/báo cáo, Khách cập nhật hồ sơ và thực hiện các tương tác cá nhân. API kiểm tra vai trò và trạng thái tài khoản từ database ở mỗi request.

Đã bổ sung nhiều sở thích độc lập với nhu cầu chính; bộ lọc và thống kê tương ứng. Form Quản lý thêm khách có ngày sinh và giới tính; có chính sách hồ sơ ban đầu cần khách hoàn thiện sau. Tuổi báo cáo tính theo ngày sinh, không còn ước tính chỉ bằng năm. Khảo sát có chọn nhóm hoặc từng khách, kiểm soát người nhận ở cả API đọc và nộp, kiểm tra đáp án chặt và xử lý giao dịch đồng thời. Có lịch sử tương tác theo khách và công cụ sao lưu/phục hồi đã kiểm chứng.

Database hiện tại có 14 bảng: 9 bảng nghiệp vụ lõi; 2 bảng sở thích; `password_recovery_requests`, `customer_recovery_codes` và `demo_datasets`. Dữ liệu nghiệp vụ tại thời điểm kiểm tra: 15 tài khoản (12 khách), 14 sản phẩm, 36 phản hồi, 6 khảo sát, 17 lượt trả lời. Không coi dữ liệu mẫu hoặc số bản ghi là số chức năng.

Chi tiết mã nghiệm thu BB01–BB03, CL01–CL05, TC01 và bằng chứng đọc tại [Kết quả khắc phục](KET_QUA_KHAC_PHUC.md). Kết quả số ca kiểm thử lấy từ tệp kết quả lần chạy cuối, không dùng số kiểm thử cũ để mô tả phiên bản mới.

## Hạn chế và việc cần hoàn thiện khi nộp

- Chưa có đối chiếu yêu cầu gốc nên chưa thể kết luận đạt toàn bộ đồ án, hay tự xác nhận DFD, kế hoạch 15 tuần và phân công nhóm đã đúng.
- Giao diện hiện là chế độ sáng; chưa triển khai chuyển sáng/tối. Đã bỏ mô tả sáng/tối không đúng khỏi metadata dự án.
- Hồ sơ cũ chưa tự có sở thích; cần người sử dụng khai báo. Một hồ sơ mẫu đang thiếu địa chỉ là tình huống kiểm tra hoàn thiện hồ sơ.
- Lịch sử tổng hợp dựa trên dữ liệu hiện còn lưu, không theo dõi đầy đủ mọi lần sửa trước đây. Không có bằng chứng kiểm thử tải lớn hoặc nhiều môi trường sản xuất.
- Cổng hoàn thiện hồ sơ có kiểm tra dữ liệu khi lưu; không khẳng định rằng mọi API nghiệp vụ đều đã có middleware riêng bắt hoàn thiện hồ sơ.
- File Word tự đánh giá cũ chưa được sửa trực tiếp. Khi nộp, thay các đoạn tương ứng bằng nội dung đã hiệu chỉnh và ma trận đối chiếu đề bài chính thức.
