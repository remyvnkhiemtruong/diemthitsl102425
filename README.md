# Tra cứu điểm tuyển sinh lớp 10 (Phiên bản nâng cấp)

Ứng dụng này cho phép tra cứu điểm thi tuyển sinh lớp 10 với nhiều tính năng nâng cao nhằm cải thiện trải nghiệm người dùng và hiệu quả xử lý dữ liệu.

## Tính năng chính

### 1. Tìm kiếm & trải nghiệm người dùng

* **Tìm kiếm mờ (fuzzy)**: hỗ trợ tìm theo số báo danh (tiền tố) và họ tên không phân biệt dấu/hoa thường.
* **Bộ lọc nâng cao**: lọc theo trường, lớp, kết quả (đạt/trượt), ngưỡng tổng điểm tối thiểu.
* **Sắp xếp & phân trang**: sắp xếp theo SBD, tên hoặc tổng điểm (tăng/giảm dần) và phân trang kết quả.
* **Đường dẫn chia sẻ**: sao chép liên kết chứa tham số tìm kiếm để chia sẻ nhanh.
* **Chế độ tối (dark mode)**: chuyển đổi giao diện sáng/tối, lưu trạng thái vào LocalStorage.
* **A11y**: dùng thẻ label `aria-label`, phân cấp tab hợp lý và chế độ hiển thị bảng phù hợp trên di động.

### 2. Thống kê & trực quan

* **Biểu đồ phân phối**: hiển thị phân phối tổng điểm bằng biểu đồ cột (CSS), cập nhật theo kết quả lọc.
* **Xuất CSV**: xuất danh sách kết quả hiện tại ra file CSV.
* **Xuất PDF**: sử dụng tính năng in của trình duyệt làm giải pháp PDF.

### 3. Dữ liệu & hiệu năng

* **Dữ liệu dạng shard**: dữ liệu học sinh được tách thành nhiều file JSON (`data/shard*.json`) và tải bất đồng bộ.
* **Tiền xử lý & chuẩn hóa**: dữ liệu được chuẩn hóa thành cấu trúc thống nhất khi tải vào bộ nhớ.

### 4. Quản trị nội dung

* **Trang quản trị dữ liệu** (`admin.html`): hỗ trợ tải lên file CSV và xem trước bảng dữ liệu (dạng mô phỏng). Có thể mở rộng để xây dựng JSON và ghi changelog.

### 5. Quốc tế hóa & PWA

* **i18n**: hỗ trợ tiếng Việt và tiếng Anh qua các file `i18n/vi.json` và `i18n/en.json`. Ngôn ngữ có thể chọn qua tham số `?lang=en`.
* **PWA**: `manifest.json` và `service-worker.js` cho phép cài đặt như một ứng dụng web và hoạt động offline cơ bản.

## Cấu trúc thư mục

```
repo/
│  index.html      – trang tra cứu chính
│  admin.html      – trang quản trị dữ liệu
│  404.html        – trang lỗi 404
│  script.js       – logic ứng dụng
│  style.css       – giao diện và dark mode
│  manifest.json   – cấu hình PWA
│  service-worker.js – bộ nhớ đệm tài nguyên cơ bản
│  i18n/           – các file ngôn ngữ
│  data/           – dữ liệu dạng shard (ví dụ)
│  icons/          – biểu tượng PWA
```

## Hướng dẫn sử dụng

1. Mở `index.html` trong trình duyệt. Khi tải lần đầu, dữ liệu sẽ được nạp và bảng kết quả hiển thị.
2. Nhập số báo danh hoặc họ tên, chọn bộ lọc rồi nhấn **Tìm** để tra cứu.
3. Dùng **Sao chép liên kết** để chia sẻ đường dẫn kèm tham số tìm kiếm.
4. Để thay đổi ngôn ngữ, thêm `?lang=en` vào URL.
5. Để truy cập trang quản trị, mở `admin.html`. Đây là bản mô phỏng cho phép xem trước file CSV.

## Ghi chú triển khai

* File dữ liệu trong thư mục `data/` chỉ mang tính minh họa (20 thí sinh). Khi triển khai thực tế, hãy tự động tạo các shard từ dữ liệu gốc và cập nhật hàm `loadData`.
* Tính năng xuất PDF hiện dùng chức năng in của trình duyệt. Có thể tích hợp thư viện jsPDF để tạo PDF chi tiết hơn.
* Biểu đồ được vẽ bằng CSS thuần để giảm phụ thuộc thư viện. Có thể thay thế bằng Chart.js khi có Internet.
* Trang quản trị cần được hoàn thiện thêm: chuyển dữ liệu thành JSON, ghi log thay đổi và checksum.
