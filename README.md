# 🎓 EduConnect LMS - Hệ thống Học Trực tuyến

Một hệ thống quản lý học tập (LMS) hiện đại được xây dựng với React, TypeScript, và các API sẵn có để hỗ trợ học trực tuyến với video call chất lượng cao, whiteboard tương tác, và quản lý lớp học thông minh.

## ✨ Tính năng chính

### 🎥 Video Call chất lượng cao
- **Jitsi Meet Integration**: Video call miễn phí không giới hạn cho 1-30 người dùng đồng thời
- **Adaptive Bitrate**: Tự động điều chỉnh chất lượng video theo băng thông
- **Screen Sharing**: Chia sẻ màn hình cho giáo viên
- **Audio/Video Controls**: Bật/tắt camera và micro dễ dàng
- **Hoàn toàn miễn phí**: Không giới hạn thời gian sử dụng

### 🎨 Whiteboard tương tác
- **Công cụ vẽ đa dạng**: Bút vẽ, văn bản, hình học, tẩy xóa
- **Laser Pointer**: Chỉ điểm trực tiếp trên bảng
- **Thước kẻ & Compa**: Công cụ hỗ trợ dạy toán học
- **Real-time Sync**: Đồng bộ thời gian thực cho tất cả người dùng

### 👥 Quản lý phân quyền
- **Admin**: Quản lý toàn hệ thống
- **Giáo viên**: Tạo lớp, quản lý học sinh, điều khiển whiteboard
- **Học sinh**: Tham gia lớp, tương tác, xem tài liệu

### 💬 Tương tác thời gian thực
- **Chat**: Tin nhắn trong lớp học
- **Giơ tay**: Học sinh có thể giơ tay phát biểu
- **Tặng quà**: Hệ thống động viên với cúp, ngôi sao
- **Phản hồi**: Đánh giá sau buổi học

### 📁 Quản lý tài liệu
- **Upload đa định dạng**: PDF, hình ảnh, video, slide
- **Phân quyền theo lớp**: Chỉ thành viên lớp mới xem được
- **Quản lý theo ngày**: Tài liệu được sắp xếp theo lịch học

## 🛠️ Tech Stack

### Frontend
- **React 19** + **TypeScript** - UI Framework hiện đại
- **Vite** - Build tool nhanh chóng
- **Tailwind CSS** - Styling utility-first
- **Zustand** - State management đơn giản
- **React Router** - Routing
- **Framer Motion** - Animations

### Backend & APIs
- **Firebase Auth** - Xác thực người dùng
- **Firestore** - Database NoSQL
- **Firebase Storage** - Lưu trữ file
- **Jitsi Meet** - Video calling API (miễn phí)
- **Socket.io** - Real-time communication

### UI Components
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications
- **React Dropzone** - File upload
- **Date-fns** - Date utilities

## 🚀 Cài đặt và Chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình Environment Variables
Sao chép file `.env.example` thành `.env` và cập nhật các giá trị:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Jitsi Meet Configuration (Không cần API key - hoàn toàn miễn phí!)
VITE_JITSI_DOMAIN=meet.jit.si
VITE_JITSI_ROOM_PREFIX=educonnect
```

### 3. Chạy ứng dụng
```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## 📋 Scripts

```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run preview      # Preview production build
npm run lint         # Chạy ESLint
```

## 🏗️ Cấu trúc Project

```
src/
├── components/          # React components
│   ├── ui/             # UI components cơ bản
│   ├── auth/           # Authentication components
│   ├── classroom/      # Classroom components
│   └── layout/         # Layout components
├── pages/              # Page components
├── store/              # Zustand stores
├── services/           # API services
├── types/              # TypeScript types
├── hooks/              # Custom hooks
├── utils/              # Utility functions
└── assets/             # Static assets
```

## 🔧 Cấu hình API

### Firebase Setup
1. Tạo project tại [Firebase Console](https://console.firebase.google.com/)
2. Bật Authentication với Email/Password
3. Tạo Firestore Database
4. Bật Storage
5. Copy config vào `.env`

### Jitsi Meet Setup
1. **Không cần đăng ký** - Jitsi Meet hoàn toàn miễn phí!
2. Sử dụng server công cộng `meet.jit.si` hoặc tự host
3. Không cần API key hay token
4. Chỉ cần cấu hình domain và room prefix trong `.env`

## 📱 Responsive Design

Hệ thống được thiết kế responsive hoàn toàn:
- **Desktop**: Trải nghiệm đầy đủ với sidebar và toolbar
- **Tablet**: Layout tối ưu cho màn hình trung bình
- **Mobile**: UI đơn giản, dễ sử dụng trên điện thoại

## 🔒 Bảo mật

- **HTTPS**: Sử dụng Let's Encrypt cho SSL miễn phí
- **Firebase Security Rules**: Phân quyền truy cập dữ liệu
- **Input Validation**: Kiểm tra dữ liệu đầu vào
- **XSS Protection**: Bảo vệ chống tấn công XSS

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

## 📈 Performance

- **Code Splitting**: Lazy loading components
- **Image Optimization**: Responsive images
- **Caching**: Browser caching strategies
- **Bundle Size**: Optimized với Vite

---

**Được phát triển với ❤️ bởi EduConnect Team**
