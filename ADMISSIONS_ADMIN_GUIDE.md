# Hướng dẫn sử dụng Admin Panel - Quản lý nội dung Tuyển sinh

## Tổng quan

Admin Panel là công cụ quản lý nội dung trang tuyển sinh, cho phép bạn dễ dàng thêm, sửa, xóa và cập nhật tất cả thông tin hiển thị trên landing page tuyển sinh.

## Cách truy cập

1. Đăng nhập vào hệ thống EduManager
2. Vào "Tuyển Sinh Nâng Cao"
3. Click nút "Quản lý nội dung" (màu tím)
4. Hoặc truy cập trực tiếp: `http://localhost:3000/admissions_admin`

### Lưu ý quan trọng:
- **Trang tuyển sinh standalone**: `http://localhost:3000/admissions.html`
- **Trang trong hệ thống**: `http://localhost:3000/admissions` (cần đăng nhập)
- **Admin Panel**: `http://localhost:3000/admissions_admin` (cần đăng nhập)

## Trang Tuyển Sinh Standalone

### File HTML:
- **Location**: `/public/admissions.html`
- **URL**: `http://localhost:3000/admissions.html`
- **Features**: 
  - Full standalone page (không cần đăng nhập)
  - Responsive design
  - Form đăng ký hoạt động
  - Smooth animations
  - Professional UI

### Content Management:
- **Static content**: Chỉnh sửa trực tiếp trong file HTML
- **Dynamic content**: Quản lý qua Admin Panel (chưa tích hợp)
- **Images**: Upload và cập nhật URLs trong HTML
- **Forms**: JavaScript validation và submission

### Khi sử dụng:
1. **Admin Panel**: Quản lý nội dung trong hệ thống
2. **Standalone HTML**: Trang công khai cho phụ huynh/học sinh
3. **Integration**: Có thể tích hợp data từ Admin Panel vào HTML

## Giao diện chính

### Header Bar
- **Tiêu đề**: "Quản lý nội dung Tuyển sinh"
- **Export dữ liệu**: Tải xuống tất cả nội dung dạng JSON
- **Import dữ liệu**: Tải nội dung từ file JSON
- **Xem trang**: Mở trang tuyển sinh trong tab mới

### Navigation Tabs
1. **Chương trình** - Quản lý các chương trình đào tạo
2. **Khóa học** - Quản lý các khóa học nổi bật
3. **Testimonials** - Quản lý phản hồi từ phụ huynh/học sinh
4. **Thông tin trường** - Cập nhật thông tin cơ bản của trường
5. **Xem trước** - Xem trang tuyển sinh với nội dung mới

## Chức năng chi tiết

### 1. Quản lý Chương trình đào tạo

#### Thêm chương trình mới:
1. Vào tab "Chương trình"
2. Click "Thêm chương trình"
3. Điền thông tin:
   - **Tên chương trình**: Ví dụ: "Chương trình Tú tài"
   - **Khối lớp**: Ví dụ: "Lớp 10-12"
   - **Thời gian**: Ví dụ: "3 năm"
   - **Học phí**: Ví dụ: "15.000.000 VNĐ/năm"
   - **Mô tả**: Mô tả chi tiết về chương trình
   - **URL hình ảnh**: Link đến hình ảnh chương trình
   - **Đặc điểm**: Mỗi dòng một đặc điểm nổi bật
4. Click "Lưu"

#### Chỉnh sửa chương trình:
1. Click icon ✏️ (Edit) bên cạnh chương trình
2. Thay đổi thông tin cần thiết
3. Click "Lưu"

#### Xóa chương trình:
1. Click icon 🗑️ (Delete) bên cạnh chương trình
2. Xác nhận xóa trong dialog

### 2. Quản lý Khóa học

#### Thêm khóa học mới:
1. Vào tab "Khóa học"
2. Click "Thêm khóa học"
3. Điền thông tin:
   - **Tên khóa học**: Ví dụ: "Luyện thi THPT Quốc gia"
   - **Danh mục**: Ví dụ: "Luyện thi", "Ngoại ngữ", "Công nghệ"
   - **Thời lượng**: Ví dụ: "9 tháng"
   - **Trình độ**: Ví dụ: "Nâng cao", "Cơ bản"
   - **Giá**: Ví dụ: "8.000.000 VNĐ"
   - **Giảng viên**: Tên giảng viên
   - **Rating**: Điểm đánh giá (1-5)
   - **Số học viên**: Số lượng học viên đã đăng ký
4. Click "Lưu"

### 3. Quản lý Testimonials

#### Thêm testimonial mới:
1. Vào tab "Testimonials"
2. Click "Thêm testimonial"
3. Điền thông tin:
   - **Tên**: Người phản hồi
   - **Vai trò**: Ví dụ: "Phụ huynh học sinh lớp 10"
   - **Nội dung**: Nội dung phản hồi
   - **Rating**: Điểm đánh giá (1-5)
4. Click "Lưu"

### 4. Quản lý Thông tin trường

#### Cập nhật thông tin cơ bản:
1. Vào tab "Thông tin trường"
2. Chỉnh sửa các trường:
   - **Tên trường**: Tên đầy đủ của trường
   - **Slogan**: Khẩu hiệu của trường
   - **Mô tả**: Mô tả chung về trường
   - **Hero Image URL**: Hình ảnh chính trang chủ
   - **Video URL**: Video giới thiệu trường
   - **Điện thoại**: Số điện thoại liên hệ
   - **Email**: Email tuyển sinh
   - **Địa chỉ**: Địa chỉ trường
3. Thay đổi được lưu tự động

## Import/Export dữ liệu

### Export dữ liệu:
1. Click "Export dữ liệu" ở header
2. File `admissions_data.json` sẽ được tải xuống
3. File chứa tất cả nội dung: programs, courses, testimonials, schoolInfo

### Import dữ liệu:
1. Click "Import dữ liệu" ở header
2. Chọn file JSON đã export
3. Hệ thống sẽ tự động cập nhật tất cả nội dung
4. **Lưu ý**: Import sẽ ghi đè toàn bộ dữ liệu hiện tại

## Hướng dẫn sử dụng hình ảnh

### Kích thước đề xuất:
- **Hero Image**: 1200x600 pixels
- **Program Images**: 400x250 pixels
- **Course Images**: 300x200 pixels

### Upload hình ảnh:
1. Sử dụng các dịch vụ như:
   - Imgur (miễn phí)
   - Cloudinary
   - AWS S3
   - Firebase Storage
2. Copy URL hình ảnh
3. Paste vào trường "URL hình ảnh"

### Video:
- Upload video lên YouTube
- Copy embed URL (ví dụ: `https://www.youtube.com/embed/VIDEO_ID`)
- Paste vào trường "Video URL"

## Mẹo và thủ thuật

### 1. Tối ưu hóa nội dung:
- **Tiêu đề hấp dẫn**: Sử dụng từ khóa mạnh
- **Mô tả ngắn gọn**: Tập trung vào lợi ích
- **Con số cụ thể**: "2,500+ học sinh" thay vì "nhiều học sinh"
- **Call-to-action rõ ràng**: "Đăng ký ngay", "Tìm hiểu thêm"

### 2. SEO Optimization:
- **Keywords**: Bao gồm từ khóa "tuyển sinh", "trường học", tên địa phương
- **Meta descriptions**: Mô tả hấp dẫn dưới 160 ký tự
- **Alt text**: Mô tả hình ảnh cho SEO

### 3. Mobile Optimization:
- **Short paragraphs**: Đoạn văn ngắn (2-3 câu)
- **Bulleted lists**: Sử dụng gạch đầu dòng
- **Large fonts**: Kích thước chữ dễ đọc trên mobile
- **Touch-friendly**: Nút đủ lớn để click

### 4. A/B Testing:
- **Headlines**: Thử nghiệm các tiêu đề khác nhau
- **Images**: Test các hình ảnh khác nhau
- **CTA buttons**: Thử màu sắc và text khác nhau
- **Layout**: Thay đổi thứ tự nội dung

## Backup và Recovery

### Tạo backup định kỳ:
1. **Export dữ liệu** hàng tuần
2. Lưu file vào Google Drive/Dropbox
3. Đặt tên file theo ngày: `admissions_backup_2024-01-15.json`

### Recovery:
1. Nếu có lỗi, import file backup gần nhất
2. Kiểm tra nội dung sau khi import
3. Xuất lại file backup mới

## Troubleshooting

### Vấn đề phổ biến:

#### 1. Hình ảnh không hiển thị:
- **Nguyên nhân**: URL sai hoặc hình ảnh bị xóa
- **Giải pháp**: Kiểm tra lại URL, upload lại hình ảnh

#### 2. Dữ liệu không lưu:
- **Nguyên nhân**: Lỗi kết nối hoặc validation
- **Giải pháp**: Refresh trang, thử lại

#### 3. Import thất bại:
- **Nguyên nhân**: File JSON không đúng định dạng
- **Giải pháp**: Kiểm tra cấu trúc file JSON

#### 4. Trang không cập nhật:
- **Nguyên nhân**: Cache trình duyệt
- **Giải pháp**: Clear cache, hard refresh (Ctrl+F5)

### Contact Support:
- **Email**: support@edumanager.edu.vn
- **Hotline**: 1900-xxxx
- **Documentation**: [Link documentation]

## Security Best Practices

### 1. Access Control:
- Chỉ admin được truy cập Admin Panel
- Đăng xuất sau khi sử dụng xong
- Không chia sẻ tài khoản admin

### 2. Data Validation:
- Kiểm tra thông tin trước khi lưu
- Sử dụng URL hợp lệ cho hình ảnh
- Không nhập HTML/JavaScript vào text fields

### 3. Backup Security:
- Lưu file backup ở nơi an toàn
- Mã hóa dữ liệu nhạy cảm
- Xóa backup cũ định kỳ

## Advanced Features

### 1. Custom CSS:
- Có thể thêm custom CSS cho trang
- Sử dụng class names có sẵn
- Test trên multiple devices

### 2. Analytics Integration:
- Thêm Google Analytics tracking
- Facebook Pixel code
- Custom event tracking

### 3. Multi-language Support:
- Tạo phiên bản tiếng Anh
- Sử dụng translation keys
- Switch language buttons

## Roadmap (Tính năng sắp tới)

### Version 2.0:
- **Drag & Drop**: Kéo thả để sắp xếp nội dung
- **Image Upload**: Upload trực tiếp hình ảnh
- **Preview Mode**: Xem trước thay đổi trước khi lưu
- **Revision History**: Lịch sử thay đổi nội dung
- **Collaboration**: Nhiều người edit cùng lúc

### Version 2.1:
- **AI Content**: Gợi ý nội dung bằng AI
- **Templates**: Mẫu nội dung có sẵn
- **Bulk Operations**: Thao tác hàng loạt
- **Scheduled Updates**: Lên lịch cập nhật nội dung

---

**Lưu ý quan trọng**:
- Luôn backup dữ liệu trước khi thay đổi lớn
- Test thay đổi trên trang preview trước
- Kiểm tra trên mobile và desktop
- Monitor performance sau khi update

Với Admin Panel, bạn có thể quản lý toàn bộ nội dung trang tuyển sinh một cách dễ dàng và chuyên nghiệp! 🎓✨
