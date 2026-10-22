
## Hướng dẫn cấu hình để chạy chương trình sử dụng MySQL và vstudio 
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
6. Mở [http://localhost:3000](http://localhost:3000) cho customer
7. Mở [http://localhost:3000/admin.html](http://localhost:3000/admin.html) cho admin và manager
