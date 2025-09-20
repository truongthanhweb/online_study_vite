# Backend Setup Instructions

## 1. Cài đặt Dependencies

```bash
cd backend
npm install
```

## 2. Cài đặt PDF Processing Tools

### Windows:
```bash
# Cài đặt poppler-utils (cần cho pdf-poppler)
# Download từ: https://github.com/oschwartz10612/poppler-windows/releases/
# Giải nén và thêm vào PATH environment variable
```

### Linux/Ubuntu:
```bash
sudo apt-get install poppler-utils
```

### macOS:
```bash
brew install poppler
```

## 3. Cấu hình Database

1. Tạo database trong PostgreSQL:
```sql
CREATE DATABASE online_study_system;
```

2. Chạy schema.sql để tạo tables:
```bash
psql -U postgres -d online_study_system -f ../database/schema.sql
```

## 4. Cấu hình Environment

1. Copy file .env.example thành .env:
```bash
cp .env.example .env
```

2. Cập nhật thông tin trong .env:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=online_study_system
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRES_IN=7d

PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:5173
```

## 5. Tạo thư mục uploads

```bash
mkdir -p uploads/documents
mkdir -p uploads/pages
mkdir -p uploads/thumbnails
mkdir -p uploads/temp
```

## 6. Chạy Server

### Development:
```bash
npm run dev
```

### Production:
```bash
npm start
```

## 7. Test API

Truy cập: http://localhost:5000/health

Kết quả mong đợi:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-20T10:00:00.000Z",
  "environment": "development"
}
```

## 8. API Endpoints

### Authentication:
- POST `/api/auth/login` - Đăng nhập
- POST `/api/auth/register` - Tạo tài khoản (Admin only)
- GET `/api/auth/me` - Thông tin user hiện tại
- POST `/api/auth/change-password` - Đổi mật khẩu

### Documents:
- POST `/api/documents/upload` - Upload tài liệu (Admin only)
- GET `/api/documents/class/:classId` - Lấy tài liệu theo lớp
- GET `/api/documents/:id` - Chi tiết tài liệu
- GET `/api/documents/:id/download` - Download tài liệu
- DELETE `/api/documents/:id` - Xóa tài liệu (Admin only)

## 9. Default Accounts

### Admin:
- Email: admin@school.edu.vn
- Password: admin123

### Teacher:
- Email: teacher1@school.edu.vn
- Password: teacher123

### Student:
- Email: student1@school.edu.vn
- Password: student123

**Lưu ý:** Đổi mật khẩu mặc định sau khi cài đặt!
