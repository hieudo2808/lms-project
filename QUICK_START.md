# 🚀 Quick Start Guide - LMS Platform Frontend

## ⚡ Bắt Đầu Nhanh (5 phút)

### 1️⃣ **Cài đặt Dependencies**
```bash
cd frontend
npm install
```

### 2️⃣ **Chạy Development Server**
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:5173**

### 3️⃣ **Truy cập các trang**

| Trang | URL | Mô tả |
|-------|-----|-------|
| 🏠 Trang chủ | http://localhost:5173 | Liệt kê khóa học |
| 🔐 Đăng nhập | http://localhost:5173/login | Xác thực |
| 📝 Đăng ký | http://localhost:5173/register | Tạo tài khoản |
| 📚 Chi tiết khóa học | http://localhost:5173/courses/react-typescript-zero-hero | Xem thông tin |
| 🎬 Xem bài học | http://localhost:5173/courses/react-typescript-zero-hero/lesson/1 | Xem video |
| 📊 Dashboard | http://localhost:5173/dashboard/my-courses | Quản lý khóa học |

## 💻 Các Lệnh Thường Dùng

```bash
# Development
npm run dev          # Chạy dev server

# Build
npm run build        # Build production
npm run preview      # Preview build

# Linting
npm run lint         # Check linting errors
```

## 🎯 File Quan Trọng

| File | Mục đích |
|------|---------|
| `src/App.tsx` | Routing chính |
| `src/main.tsx` | Entry point |
| `src/services/api.ts` | API calls |
| `src/contexts/AuthContext.tsx` | Auth state |
| `tailwind.config.ts` | Tailwind config |
| `.env.example` | Environment template |

## 🔑 Key Features

✅ **7 Pages** - Đầy đủ các màn hình  
✅ **Responsive Design** - Hoạt động trên mobile/tablet/desktop  
✅ **Authentication** - Đăng nhập/Đăng ký  
✅ **Video Player** - Phát video bài học  
✅ **Progress Tracking** - Theo dõi tiến độ  
✅ **Modular Code** - Dễ maintain & extend  
✅ **TypeScript** - Type safe  

## 📝 Tư Duy Cơ Bản

### Cấu trúc thư mục
```
src/
├── pages/           ← Các trang (Home, Login, etc)
├── components/      ← Components tái sử dụng
├── contexts/        ← Auth context (global state)
├── services/        ← API calls
├── types/           ← TypeScript types
└── utils/           ← Helper functions
```

### Dòng chảy Authentication
```
User → LoginPage → AuthContext → Navbar updates → Dashboard
```

### Dòng chảy Course
```
HomePage → CourseList/Card → CourseDetailPage → LessonPage → VideoPlayer
```

## 🐛 Troubleshooting

### Port 5173 đã được sử dụng
```bash
npm run dev -- --port 5174
```

### Build lỗi
```bash
rm -rf node_modules
npm install
npm run build
```

### Clear cache
```bash
npm run dev -- --force
```

## 🔗 Tích hợp API Backend

Khi backend sẵn sàng:

1. Cập nhật `.env`:
```env
VITE_API_URL=http://localhost:8080/api
```

2. Xem chi tiết trong: `API_INTEGRATION_GUIDE.md`

## 📚 Tài liệu

- 📄 **README.md** - Full documentation
- 📄 **PROJECT_SUMMARY.md** - Project overview
- 📄 **API_INTEGRATION_GUIDE.md** - API integration
- 📄 **FRONTEND_COMPLETION_REPORT.md** - Completion report

## 🎨 Styling

Sử dụng **Tailwind CSS** - Tất cả classes đã được cấu hình.

Ví dụ:
```tsx
// Button
<button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
  Submit
</button>

// Form
<input className="w-full px-4 py-2 border border-gray-300 rounded" />

// Card
<div className="bg-white rounded-lg shadow-md p-4">
  Content
</div>
```

## 💡 Pro Tips

1. **Hot Reload** - Vite tự động reload khi bạn sửa code
2. **Mock Data** - Hiện tại có mock data, dễ dàng thay bằng API
3. **Console Logs** - Check browser console (F12) để debug
4. **React DevTools** - Cài extension để debug React
5. **Network Tab** - Check API calls khi tích hợp backend

## 🚀 Deploy

Khi sẵn sàng deploy:

```bash
# Build
npm run build

# Kết quả nằm trong thư mục 'dist/'
# Upload 'dist/' lên hosting (Netlify, Vercel, GitHub Pages, etc)
```

## 📞 Support

Tất cả code được viết rõ ràng với comments.  
Nếu có thắc mắc, kiểm tra:
- Console browser (F12)
- Documentation files
- Comments trong code

## ✨ Next Steps

- [ ] Test tất cả pages
- [ ] Cấu hình backend API URL
- [ ] Tích hợp real API endpoints
- [ ] Thêm error handling
- [ ] Add notifications (toast)
- [ ] Deploy lên production

---

**Happy Coding! 🎉**

Bất kỳ câu hỏi nào, xem files documentation hoặc comments trong code.
