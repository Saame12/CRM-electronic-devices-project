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
3. Yêu cầu chat GPT tạo file .env sao cho :
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=backline_crm
DB_USER=root
DB_PASSWORD=mat_khau_mysql_cua_ban
JWT_SECRET=doi_chuoi_bi_mat_dai_va_kho_doan
4. Trong Terminal project chạy: `npm run db:setup`
5. Sau đó chạy : `npm start`

📁 Cấu trúc thư mục

## Backend đã tích hợp

Backend chạy bằng Node.js thuần, không cần `npm install`, và tự tạo tệp dữ liệu `data/crm.json` ở lần chạy đầu. Dữ liệu gồm tài khoản, phản hồi và câu trả lời khảo sát; mật khẩu được băm bằng `scrypt`.

Chạy dự án tại thư mục gốc:

```powershell
node server.js
```

Mở [http://localhost:3000](http://localhost:3000). Không nên mở trực tiếp `index.html`, vì giao diện cần gọi API của server. Tài khoản demo: `khach@demo.vn` / `123456`.

Các API chính: `POST /api/auth/register`, `POST /api/auth/login`, `GET/PUT /api/me`, `GET/POST /api/feedback`, `GET /api/survey-status`, và `POST /api/surveys/:id/responses`.

```text
.
├── index.html     # Khung giao diện chính của ứng dụng
├── style.css      # Toàn bộ định dạng giao diện và Dark Mode
├── app.js         # Logic xử lý giao diện, dữ liệu mẫu và sự kiện
└── README.md      # Tài liệu hướng dẫn dự án
