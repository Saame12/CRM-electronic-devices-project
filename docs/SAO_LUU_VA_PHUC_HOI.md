# Sao lưu và phục hồi Backline CRM

Đã kiểm chứng ngày 01/11/2026 bằng MySQL đang cài trên máy. Công cụ dùng `mysqldump` và `mysql`, đọc cấu hình trong `.env` (hoặc `CRM_ENV_FILE`). Có thể đặt `MYSQL_BIN_DIR` nếu thư mục bin của MySQL chưa có trong PATH.

## 1. Tạo bản sao lưu

Tạm ngừng nhập/sửa dữ liệu và tránh chạy migration trong lúc xuất và đối chiếu:

```powershell
npm run db:backup
# Hoặc chỉ định tên tệp mới:
npm run db:backup -- data/backups/crm-truoc-thay-doi.sql
```

Kết quả gồm tệp SQL và tệp `.sql.json` đi cùng. Giữ cả hai. Metadata chứa database nguồn, thời điểm, SHA-256 và số bản ghi từng bảng; bản xuất bằng phiên bản script mới còn ghi phiên bản MySQL và dấu vân tay tệp schema ứng dụng. `--single-transaction` chụp dữ liệu InnoDB trong một giao dịch; số dòng đối chiếu được đọc sau xuất, vì vậy không nhập liệu đồng thời khi cần so sánh chính xác. Không thực hiện DDL trong lúc sao lưu.

Xuất toàn bộ bảng, khóa ngoại, chỉ mục, trigger, routine và event nếu có. Không chỉ xuất chín bảng nghiệp vụ. Trên bản hiện tại có thêm bảng sở thích, khôi phục tài khoản và dấu dữ liệu demo.

Tệp đã tồn tại sẽ bị từ chối ghi đè. Khi lệnh xuất thất bại, không dùng tệp dở dang làm bản sao lưu; chỉ dùng cặp SQL/JSON đã xuất thành công. Không commit hoặc chia sẻ công khai `data/backups`: bản sao lưu có dữ liệu và hash xác thực. Thư mục `data/` đã được loại khỏi Git.

## 2. Phục hồi vào database mới

```powershell
npm run db:restore -- data/backups/crm-truoc-thay-doi.sql --target backline_crm_phuc_hoi
```

Database đích phải **chưa tồn tại**, khác database nguồn trong metadata và khác database đang cấu hình. Script xác minh checksum, tạo database mới, nhập SQL và so sánh số dòng tất cả bảng. Script không có chế độ phục hồi đè hoặc tự xóa database đang dùng.

Nếu nhập hoặc đối chiếu thất bại, giữ database đích để kiểm tra; không coi đó là bản phục hồi đã đạt. Khi thử lại, chọn một tên database mới. Khi thành công, cấu hình bản chạy thử riêng trỏ `DB_NAME` tới database vừa phục hồi; chưa đổi kết nối của bản đang dùng trước khi kiểm chứng.

## 3. Kiểm tra sau phục hồi

1. Đối chiếu tên bảng, số dòng và khóa ngoại; kiểm tra bản ghi liên quan không bị mồ côi.
2. Khởi động server cách ly bằng cấu hình database đích và cổng khác.
3. Đăng nhập Admin/Quản lý/khách bằng tài khoản vốn có trong bản sao lưu theo phạm vi cần thử; không tạo lại hoặc đặt lại mật khẩu.
4. Đọc khách hàng, khảo sát và phản hồi; đối chiếu dashboard và báo cáo.
5. Sau khi kiểm chứng mới quyết định dùng database phục hồi. Nếu nâng lên mã nguồn mới, thực hiện migration sau khi đã kiểm tra bản phục hồi ban đầu.

## 4. Bằng chứng đã chạy

Bản trước migration: `data/backups/backline_crm-2026-11-01T05-00-18-129Z.sql` và metadata đi kèm. Phục hồi vào database cách ly mới; đối chiếu cả 12 bảng, không có bản ghi mồ côi trong quan hệ phản hồi/câu trả lời/chi tiết. Đăng nhập Quản lý và khách thành công; đọc khảo sát/phản hồi và đối chiếu báo cáo: 12 khách, 36 phản hồi, 6 khảo sát. Database kiểm thử ngẫu nhiên đã được dọn.

Đã kiểm chứng tiếp bản sau migration `data/backups/backline_crm-sau-nghiem-thu-20261101.sql`: khôi phục đầy đủ **14 bảng**, cùng các luồng đọc chính, kết quả PASS. Metadata ghi MySQL 8.0.46 và dấu vân tay schema ứng dụng. Các database phục hồi do đợt kiểm thử này tạo đã được dọn.

Chi tiết bản sau migration: [`backup-restore-results.json`](../outputs/qa/backup-restore-results.json); bản trước migration: [`backup-restore-pre-migration-results.json`](../outputs/qa/backup-restore-pre-migration-results.json). Kiểm tra cài mới: `npm run setup:check`, tạo DB ngẫu nhiên, chạy setup hai lần để xác minh giữ dữ liệu và mật khẩu, rồi tự dọn DB kiểm thử.

Quyền MySQL cần đủ để đọc/xuất dữ liệu và tạo database khi phục hồi; thiếu quyền sẽ trả lỗi, không tự thay quyền tài khoản.
