- 🔐 **Xác thực tài khoản:** Đăng ký tài khoản mới và Đăng nhập hệ thống (có sẵn tài khoản demo).
- 👤 **Quản lý thông tin cá nhân (Profile):** Xem và cập nhật họ tên, số điện thoại, địa chỉ, năm sinh, giới tính và nhu cầu sử dụng PC/Laptop.
- 📝 **Khảo sát trực tuyến (Survey):**
  - Nhận các bảng khảo sát do cửa hàng phát động (Đánh giá dịch vụ, Nhu cầu mua sắm, Bảo hành/Hỗ trợ).
  - Hỗ trợ nhiều dạng câu hỏi: Chọn 1 đáp án, Chọn nhiều đáp án, Nhập ý kiến tự do và Đánh giá số sao (Rating).
  - Tự động ghi nhận ngày hoàn thành khảo sát.
- 💬 **Phản hồi sản phẩm (Feedback):**
  - Gửi đánh giá, khiếu nại, khen ngợi hoặc câu hỏi về từng dòng sản phẩm cụ thể.
  - Theo dõi danh sách phản hồi đã gửi kèm câu trả lời chính thức từ phía cửa hàng.
- 🎨 **Giao diện hiện đại (UI/UX):** Hỗ trợ chuẩn Responsive (Mobile/Desktop), tự động chuyển đổi Light/Dark mode và thông báo trạng thái (Toast notification)## 
## Hướng dẫn setup
1. Trong PowerShell, cài Node.js LTS: `winget install OpenJS.NodeJS.LTS`
2. Sau khi cài xong, đóng rồi mở lại Visual Studio/Terminal và kiểm tra:  `node --version`
3. Yêu cầu tạo file .env sao cho :
`
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=backline_crm
DB_USER=root
DB_PASSWORD=mat_khau_mysql_cua_ban
JWT_SECRET=doi_chuoi_bi_mat_dai_va_kho_doan
`
4. Trong Terminal cmd project chạy: `npm run db:setup`
5. Sau đó chạy : `npm start`
6. Mở [http://localhost:3000](http://localhost:3000). cho customer
7. Mở [http://localhost:3000](http://localhost:3000/admin.html) cho admin và manager
