# Báo cáo CRM dành cho Quản lý

Chạy backend MySQL bằng `npm start`, đăng nhập tài khoản MANAGER tại `/manager.html`, chọn **Báo cáo**.

## Ba nhóm báo cáo

- **Khách hàng:** tổng số, hoạt động/đã khóa, mức hoàn thiện hồ sơ, độ tuổi, giới tính, nhu cầu và số khách mới theo tháng.
- **Phản hồi:** số lượt và số khách gửi, điểm trung bình, tỷ lệ đánh giá 4–5 sao, tiến độ xử lý, khiếu nại và đối chiếu theo sản phẩm. Bao gồm phản hồi đã ẩn.
- **Khảo sát:** phân biệt nháp, mở, quá hạn, đóng; đối chiếu danh sách gửi, người đã trả lời và người chưa trả lời. Có thống kê từng câu hỏi và nội dung trả lời từng người.

## Quy ước số liệu

1. Khoảng ngày gồm cả ngày bắt đầu và ngày kết thúc. Khách hàng lọc theo ngày tạo tài khoản; phản hồi theo ngày tiếp nhận; khảo sát theo ngày tạo khảo sát. Hồ sơ và trạng thái là hiện tại, không phải ảnh chụp lịch sử.
2. Câu trả lời của các khảo sát được chọn tính toàn bộ thời gian. Tỷ lệ hoàn thành = số người trong danh sách gửi đã trả lời / số người trong danh sách gửi. Người trả lời ngoài danh sách được thống kê riêng; không dùng họ để tăng tỷ lệ hoàn thành.
3. Không có mẫu số thì hiển thị “Chưa đủ dữ liệu” hoặc “—”; không giả định là 0%. Tỷ lệ làm tròn một chữ số thập phân.
4. Câu hỏi chọn nhiều tính theo số người trả lời câu đó; tổng tỷ lệ lựa chọn có thể vượt 100%. Câu bị bỏ qua hoặc có dữ liệu không hợp lệ được tách khỏi số câu trả lời hợp lệ.
5. Tuổi chỉ ước tính theo năm sinh. Hồ sơ thiếu hoặc năm sinh ngoài phạm vi 0–120 tuổi được tách riêng, không tự gán vào nhóm tuổi khác.
6. Nhu cầu trong hồ sơ là mục đích sử dụng. Chưa có dữ liệu doanh số nên không suy diễn tỷ lệ lỗi sản phẩm hoặc nhu cầu mua hàng từ số phản hồi.
7. Phần ý kiến văn bản hiển thị tối đa 100 mục gần nhất mỗi câu hỏi, có ghi rõ giới hạn. Danh sách người hoàn thành cho phép mở câu trả lời từng người.
8. Điểm trung bình phản hồi tính từ từng đánh giá hợp lệ (1–5 sao), không lấy trung bình các điểm trung bình sản phẩm. Tỷ lệ tích cực = số đánh giá 4–5 sao / số đánh giá hợp lệ. Tỷ lệ đã xử lý = số phản hồi RESOLVED / số phản hồi tiếp nhận trong kỳ.

## Xuất và kiểm tra

CSV xuất nhóm đang xem, có BOM để mở tiếng Việt bằng Excel; khi đang phân tích một khảo sát, CSV kèm kết quả từng câu hỏi của khảo sát đó. Nút **In / Lưu PDF** mở hộp thoại in của trình duyệt.

`npm run test:reports` kiểm tra các công thức, lọc ngày, phân quyền endpoint và tích hợp mã giao diện.

`node scripts/check-reports-db.js` kiểm tra truy vấn báo cáo với MySQL cấu hình trong `.env`, chỉ đọc, không tạo/xóa dữ liệu.
“Chưa xác định” là một lựa chọn nhu cầu hợp lệ và không làm hồ sơ bị tính là chưa đầy đủ. Chưa chọn nhu cầu là trường trống riêng, được thống kê thành “Chưa chọn / chưa khai báo”.

