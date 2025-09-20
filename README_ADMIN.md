# 🎓 Online Study System - Admin Panel

Hệ thống quản lý tài liệu học tập trực tuyến với tính năng admin panel hoàn chỉnh.

## 📋 Tính năng chính

### 🔐 **Hệ thống phân quyền**
- **Admin**: Quản lý toàn hệ thống, upload tài liệu, quản lý người dùng và lớp học
- **Teacher**: Xem tài liệu của lớp mình dạy trong whiteboard
- **Student**: Xem và download tài liệu của lớp mình học

### 📚 **Quản lý tài liệu**
- Upload tài liệu (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX)
- Tự động convert PDF thành ảnh để hiển thị trong whiteboard
- Phân loại tài liệu theo lớp học và ngày học
- Download tài liệu gốc
- Tracking lượt truy cập và download

### 🏫 **Quản lý lớp học**
- Tạo và quản lý lớp học
- Phân công giáo viên chủ nhiệm
- Quản lý danh sách học sinh
- Thống kê số lượng học sinh và tài liệu

### 👥 **Quản lý người dùng**
- Tạo tài khoản cho admin, giáo viên, học sinh
- Kích hoạt/vô hiệu hóa tài khoản
- Thay đổi thông tin và mật khẩu
- Thống kê hoạt động người dùng

### 🎨 **Whiteboard tích hợp**
- Hiển thị tài liệu PDF dưới dạng ảnh
- Vẽ và ghi chú trực tiếp trên tài liệu
- Scroll qua các trang PDF
- Các công cụ vẽ: bút, text, hình học, tẩy xóa

## 🚀 Cài đặt và chạy hệ thống

### 1. **Cài đặt Database (PostgreSQL)**

```bash
# Tạo database
createdb online_study_system

# Chạy schema
psql -U postgres -d online_study_system -f database/schema.sql
```

### 2. **Cài đặt Backend**

```bash
cd backend
npm install

# Cài đặt PDF processing tools
# Windows: Download poppler-utils và thêm vào PATH
# Linux: sudo apt-get install poppler-utils
# macOS: brew install poppler

# Cấu hình environment
cp .env.example .env
# Cập nhật thông tin database trong .env

# Chạy server
npm run dev
```

### 3. **Cài đặt Frontend**

```bash
# Từ thư mục root
npm install

# Cấu hình environment
cp .env.example .env

# Chạy frontend
npm run dev
```

## 🔑 Tài khoản mặc định

### Admin
- **Email**: admin@school.edu.vn
- **Password**: admin123

### Teacher
- **Email**: teacher1@school.edu.vn
- **Password**: teacher123

### Student
- **Email**: student1@school.edu.vn
- **Password**: student123

**⚠️ Lưu ý**: Đổi mật khẩu mặc định sau khi cài đặt!

## 📖 Hướng dẫn sử dụng

### **Admin Panel**
1. Đăng nhập với tài khoản admin
2. Truy cập `/admin` để vào admin panel
3. Sử dụng các tính năng:
   - **Dashboard**: Xem tổng quan hệ thống
   - **Documents**: Upload và quản lý tài liệu
   - **Classes**: Tạo và quản lý lớp học
   - **Users**: Quản lý tài khoản người dùng

### **Upload tài liệu**
1. Vào **Documents** → **Tải lên tài liệu**
2. Điền thông tin: tiêu đề, mô tả, lớp học, ngày học
3. Chọn file tài liệu (tối đa 50MB)
4. Hệ thống sẽ tự động convert PDF thành ảnh

### **Quản lý lớp học**
1. Vào **Classes** → **Tạo lớp học**
2. Điền thông tin lớp và chọn giáo viên
3. Thêm học sinh vào lớp bằng **Quản lý HS**

### **Whiteboard cho giáo viên**
1. Giáo viên đăng nhập và vào whiteboard
2. Chọn **Tải tài liệu** để xem tài liệu của lớp
3. Tài liệu sẽ hiển thị dưới dạng ảnh
4. Sử dụng các công cụ vẽ để ghi chú

## 🛠️ API Endpoints

### **Authentication**
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Tạo tài khoản (Admin only)
- `GET /api/auth/me` - Thông tin user hiện tại

### **Documents**
- `POST /api/documents/upload` - Upload tài liệu (Admin only)
- `GET /api/documents/class/:classId` - Lấy tài liệu theo lớp
- `GET /api/documents/:id` - Chi tiết tài liệu
- `GET /api/documents/:id/download` - Download tài liệu
- `DELETE /api/documents/:id` - Xóa tài liệu (Admin only)

### **Classes**
- `GET /api/classes` - Danh sách lớp học
- `POST /api/classes` - Tạo lớp học (Admin only)
- `PUT /api/classes/:id` - Cập nhật lớp học (Admin only)
- `DELETE /api/classes/:id` - Xóa lớp học (Admin only)
- `GET /api/classes/:id/students` - Danh sách học sinh
- `POST /api/classes/:id/students` - Thêm học sinh (Admin only)

### **Users**
- `GET /api/users` - Danh sách người dùng (Admin only)
- `POST /api/users` - Tạo người dùng (Admin only)
- `PUT /api/users/:id` - Cập nhật người dùng (Admin only)
- `DELETE /api/users/:id` - Xóa người dùng (Admin only)
- `PATCH /api/users/:id/toggle-active` - Kích hoạt/vô hiệu hóa (Admin only)

## 🔧 Cấu trúc thư mục

```
online_study_vite/
├── backend/                 # Backend Node.js
│   ├── config/             # Database config
│   ├── middleware/         # Auth, upload middleware
│   ├── routes/             # API routes
│   ├── utils/              # PDF processing
│   └── uploads/            # File storage
├── database/               # Database schema
├── src/
│   ├── components/admin/   # Admin components
│   ├── pages/admin/        # Admin pages
│   ├── services/           # API services
│   └── store/              # State management
└── README_ADMIN.md         # Hướng dẫn này
```

## 🎯 Workflow sử dụng

### **Quy trình upload và sử dụng tài liệu:**

1. **Admin upload tài liệu**:
   - Chọn lớp học và ngày học
   - Upload file PDF/DOC/PPT
   - Hệ thống tự động convert PDF → ảnh

2. **Giáo viên sử dụng**:
   - Vào whiteboard của lớp
   - Load tài liệu theo ngày
   - Vẽ và ghi chú trên tài liệu

3. **Học sinh sử dụng**:
   - Xem tài liệu trong whiteboard
   - Download file gốc về máy

## 🐛 Troubleshooting

### **Lỗi PDF không convert được**
- Kiểm tra poppler-utils đã cài đặt
- Kiểm tra file PDF không bị corrupt
- Xem log server để biết chi tiết lỗi

### **Lỗi upload file**
- Kiểm tra dung lượng file (< 50MB)
- Kiểm tra định dạng file được hỗ trợ
- Kiểm tra quyền ghi thư mục uploads/

### **Lỗi kết nối database**
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra thông tin kết nối trong .env
- Kiểm tra database đã tạo và chạy schema

## 📞 Hỗ trợ

Nếu gặp vấn đề trong quá trình sử dụng, vui lòng:
1. Kiểm tra log server và browser console
2. Đảm bảo tất cả dependencies đã cài đặt
3. Kiểm tra cấu hình environment variables
4. Liên hệ team phát triển để được hỗ trợ

---

**🎉 Chúc bạn sử dụng hệ thống hiệu quả!**
