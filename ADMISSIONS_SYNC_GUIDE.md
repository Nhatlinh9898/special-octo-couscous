# Hướng dẫn Đồng bộ Nội dung Trang Tuyển Sinh

## Tổng quan

Hệ thống đã được cập nhật để đồng bộ nội dung giữa Admin Panel và trang tuyển sinh standalone, đảm bảo nội dung luôn nhất nhất trên cả hai nền tảng.

## Cách hoạt động

### 🔄 **Luồng đồng bộ:**

1. **Admin Panel** → Quản lý nội dung trong hệ thống
2. **Đồng bộ dữ liệu** → Tạo file `admissions-data.js`
3. **Copy file** → Đặt vào thư mục `public/`
4. **Trang HTML** → Load data động từ file
5. **Cập nhật tự động** → Nội dung đồng bộ ngay lập tức

### 📁 **Các file liên quan:**

- `AdmissionsAdminPanel.tsx` - Admin Panel quản lý nội dung
- `AdmissionsLandingPage.tsx` - Trang trong hệ thống (React)
- `public/admissions.html` - Trang standalone (HTML)
- `public/admissions-data.js` - File data chia sẻ

## Hướng dẫn sử dụng

### 🎯 **Cách 1: Đồng bộ thủ công (Khuyến khích)**

#### **Bước 1: Cập nhật nội dung trong Admin Panel**
1. Đăng nhập vào hệ thống
2. Vào "Tuyển Sinh Nâng Cao" → "Quản lý nội dung"
3. Chỉnh sửa/thêm/xóa nội dung:
   - Chương trình đào tạo
   - Khóa học nổi bật
   - Testimonials
   - Thông tin trường

#### **Bước 2: Đồng bộ dữ liệu**
1. Click nút **"Đồng bộ dữ liệu"** (màu xanh, icon refresh)
2. File `admissions-data.js` sẽ được tự động tải xuống
3. **Quan trọng**: File này chứa nội dung mới nhất

#### **Bước 3: Copy file vào thư mục public**
1. Copy file `admissions-data.js` vừa tải xuống
2. Paste vào thư mục `c:\Users\nhatl\Downloads\app\public\`
3. Ghi đè file cũ (nếu có)

#### **Bước 4: Kiểm tra kết quả**
1. Mở trang: `http://localhost:3000/admissions.html`
2. Kiểm tra nội dung đã được cập nhật
3. Test các chức năng (form đăng ký, navigation)

### 🎯 **Cách 2: Sử dụng Import/Export**

#### **Export dữ liệu:**
1. Click "Export dữ liệu" trong Admin Panel
2. Lưu file JSON để backup
3. Có thể chia sẻ cho team khác

#### **Import dữ liệu:**
1. Click "Import dữ liệu"
2. Chọn file JSON đã export
3. Nội dung sẽ được tải vào Admin Panel
4. Sau đó thực hiện đồng bộ như Cách 1

## Chi tiết các chức năng

### 🔄 **Nút "Đồng bộ dữ liệu"**

#### **Chức năng:**
- Tạo file `admissions-data.js` từ nội dung hiện tại
- Bao gồm tất cả data: programs, courses, testimonials, school info
- Tự động format JavaScript với proper syntax
- Tải xuống file sẵn sàng để sử dụng

#### **Khi nào sử dụng:**
- Sau khi thay đổi nội dung bất kỳ
- Trước khi publish trang mới
- Khi muốn đồng bộ với trang HTML

#### **Cảnh báo:**
- File sẽ được tải xuống tự động
- Cần copy thủ công vào thư mục `public/`
- Ghi đè file cũ sẽ cập nhật nội dung

### 📊 **Nội dung được đồng bộ:**

#### **School Information:**
- Tên trường, slogan, mô tả
- Hero image, video URL
- Thông tin liên hệ

#### **Programs:**
- Tên chương trình, khối lớp
- Thời gian, học phí
- Features, descriptions
- Images

#### **Courses:**
- Tên khóa học, danh mục
- Thời lượng, level, giá
- Giảng viên, rating
- Số học viên

#### **Testimonials:**
- Tên, vai trò người phản hồi
- Nội dung, rating
- Avatar images

#### **Statistics:**
- Số lượng học sinh
- Tỷ lệ tốt nghiệp
- Số giải thưởng
- Số khóa học

#### **Contact Info:**
- Điện thoại, hotline
- Email addresses
- Địa chỉ, giờ làm việc

#### **SEO Data:**
- Meta title, description
- Keywords
- Open Graph image

## Cấu trúc file admissions-data.js

### 📄 **Format:**
```javascript
window.ADMISSIONS_DATA = {
  school: { ... },
  statistics: [ ... ],
  programs: [ ... ],
  courses: [ ... ],
  testimonials: [ ... ],
  contact: { ... },
  seo: { ... }
};

// Helper functions
window.loadAdmissionsData = function() { ... };
window.updateAdmissionsData = function(newData) { ... };
```

### 🔧 **Functions:**
- `loadAdmissionsData()` - Load data vào trang HTML
- `updateAdmissionsData()` - Update data real-time
- Custom event `admissionsDataUpdated` - Trigger updates

## Troubleshooting

### ⚠️ **Vấn đề phổ biến:**

#### **1. Nội dung không cập nhật:**
- **Nguyên nhân**: Chưa copy file vào thư mục public
- **Giải pháp**: Copy file `admissions-data.js` vào `public/`
- **Check**: M开发者工具 → Network → Kiểm tra file admissions-data.js

#### **2. Lỗi JavaScript:**
- **Nguyên nhân**: File JS có syntax error
- **Giải pháp**: Re-download file từ Admin Panel
- **Check**: Console browser cho error messages

#### **3. Images không hiển thị:**
- **Nguyên nhân**: URL images sai hoặc bị xóa
- **Giải pháp**: Kiểm tra và update URLs trong Admin Panel
- **Check**: Network tab cho 404 errors

#### **4. Form không hoạt động:**
- **Nguyên nhân**: JavaScript conflict
- **Giải pháp**: Clear cache, hard refresh (Ctrl+F5)
- **Check**: Console cho JavaScript errors

### 🔍 **Debug steps:**

1. **Check file existence:**
   ```
   http://localhost:3000/admissions-data.js
   ```

2. **Check data loading:**
   - Mở trang HTML
   - F12 → Console
   - Type: `window.ADMISSIONS_DATA`

3. **Check update events:**
   - Console: `window.dispatchEvent(new CustomEvent('admissionsDataUpdated'))`

4. **Check network requests:**
   - F12 → Network
   - Reload page
   - Check admissions-data.js loaded

## Best Practices

### 🎯 **Workflow đề xuất:**

#### **Daily Updates:**
1. Update content in Admin Panel
2. Click "Đồng bộ dữ liệu"
3. Copy file to public/
4. Test HTML page

#### **Weekly Maintenance:**
1. Export backup data
2. Review all content
3. Update images if needed
4. Test all functionality

#### **Before Publishing:**
1. Review all changes
2. Sync data one final time
3. Test both pages (React & HTML)
4. Check mobile responsiveness

### 📝 **Tips:**

#### **Content Management:**
- Use consistent naming conventions
- Optimize images before upload
- Test links regularly
- Keep backup versions

#### **File Management:**
- Keep original admissions-data.js as backup
- Version control for major changes
- Document all modifications
- Test in staging environment first

#### **Performance:**
- Compress images
- Minimize JavaScript
- Use CDN for static assets
- Enable browser caching

## Advanced Features

### 🚀 **Real-time Updates (Future):**

#### **Auto-sync:**
- File watcher for automatic updates
- WebSocket for real-time sync
- Cloud storage integration
- API endpoints for data management

#### **Version Control:**
- Git integration for file changes
- Rollback functionality
- Change history tracking
- Collaborative editing

#### **Analytics:**
- Track content changes
- Monitor page performance
- User engagement metrics
- A/B testing integration

## Security Considerations

### 🔐 **Best Practices:**

#### **Data Protection:**
- Validate all input data
- Sanitize user content
- XSS prevention
- Secure file handling

#### **Access Control:**
- Admin-only access to sync
- Role-based permissions
- Audit logging
- Session management

#### **Backup Strategy:**
- Regular automated backups
- Off-site storage
- Disaster recovery plan
- Data integrity checks

## Support

### 📞 **Khi cần giúp đỡ:**

#### **Technical Issues:**
- Check console errors first
- Review this guide
- Test in different browsers
- Clear cache and cookies

#### **Content Questions:**
- Refer to content guidelines
- Check SEO best practices
- Review accessibility standards
- Test mobile layouts

#### **Feature Requests:**
- Document requirements
- Provide use cases
- Consider impact analysis
- Plan implementation timeline

---

## Quick Reference

### 🚀 **5 Steps to Sync Content:**

1. **Edit** in Admin Panel
2. **Click** "Đồng bộ dữ liệu"
3. **Download** admissions-data.js
4. **Copy** to public/ folder
5. **Test** HTML page

### 📋 **Checklist Before Publishing:**

- [ ] Content updated in Admin Panel
- [ ] Data synced to admissions-data.js
- [ ] File copied to public/ folder
- [ ] HTML page loads correctly
- [ ] All images display
- [ ] Forms work properly
- [ ] Mobile responsive
- [ ] SEO meta tags updated
- [ ] Links functional
- [ ] No console errors

### 🔗 **Important Links:**

- **Admin Panel**: `http://localhost:3000/admissions_admin`
- **React Page**: `http://localhost:3000/admissions`
- **HTML Page**: `http://localhost:3000/admissions.html`
- **Data File**: `http://localhost:3000/admissions-data.js`

Với hệ thống đồng bộ này, bạn có thể quản lý nội dung tập trung và đảm bảo tính nhất quán trên tất cả các nền tảng! 🎓✨
