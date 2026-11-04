# Tự đóng khảo sát theo hạn trả lời

- Múi giờ nghiệp vụ: Việt Nam (UTC+7), không phụ thuộc múi giờ máy chủ hoặc MySQL.
- OPEN có hạn 03/11/2026: nhận câu trả lời đến hết ngày 03/11, tự chuyển CLOSED từ 00:00 ngày 04/11.
- OPEN không đặt hạn: tiếp tục nhận câu trả lời cho đến khi Quản lý bấm Đóng ngay.
- DRAFT không tự mở hoặc tự đóng dù ngày hạn đã qua. Muốn mở bản nháp quá hạn, cần sửa hạn trước.
- Giữ nguyên câu hỏi, phạm vi, người nhận, câu trả lời và chi tiết câu trả lời khi tự đóng.
- Khách đã nhận bài tự đóng vẫn thấy trong lịch sử (quá hạn chưa trả lời hoặc xem bài đã gửi). Khách mới không nhận bài đã quá hạn.
- Ghi `auto_closed_at` theo UTC để phân biệt tự đóng với đóng thủ công.

Máy chủ thực hiện kiểm tra khi khởi động, đặt lịch lúc nửa đêm Việt Nam và kiểm tra bù trước API. Nếu máy chủ ngừng hoạt động, dữ liệu được cập nhật khi khởi động lại. Nếu tác vụ nền lỗi kết nối MySQL, hệ thống thử lại sau một phút.

Kiểm thử: `npm test`; `node scripts/check-survey-expiry.js` kiểm thử mốc thời gian bằng bảng tạm MySQL, không thay đổi dữ liệu nghiệp vụ.
