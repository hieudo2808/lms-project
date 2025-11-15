# LMS Platform - Frontend

Nền tảng học trực tuyến xây dựng với React, TypeScript và Tailwind CSS.

## 🚀 Các tính năng

- **Trang chủ**: Liệt kê và tìm kiếm khóa học
- **Xác thực**: Đăng nhập, đăng ký, quản lý phiên
- **Chi tiết khóa học**: Xem thông tin khóa học và danh sách bài học
- **Xem video**: Phát video bài học với theo dõi tiến độ
- **Dashboard**: Quản lý các khóa học đã tham gia
- **Responsive Design**: Hoạt động tốt trên thiết bị di động

## 📁 Cấu trúc thư mục

```
src/
├── components/      # React components (Button, Input, CourseCard, etc.)
├── contexts/        # React Context (AuthContext)
├── pages/           # Page components (HomePage, LoginPage, etc.)
├── services/        # API services
├── types/           # TypeScript types
├── App.tsx          # Main routing
├── main.tsx         # Entry point
└── index.css        # Global styles with Tailwind CSS
```

## 🛠️ Cài đặt

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Bước 1: Cài đặt dependencies
```bash
cd frontend
npm install
```

### Bước 2: Cấu hình environment
```bash
cp .env.example .env
```

Cập nhật `VITE_API_URL` nếu backend chạy trên port khác:
```env
VITE_API_URL=http://localhost:8080/api
```

### Bước 3: Chạy development server
```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## 📝 Các route

| Route | Mô tả |
|-------|-------|
| `/` | Trang chủ - Liệt kê khóa học |
| `/login` | Trang đăng nhập |
| `/register` | Trang đăng ký |
| `/courses/:slug` | Chi tiết khóa học |
| `/courses/:slug/lesson/:id` | Xem bài học |
| `/dashboard/my-courses` | Dashboard - Các khóa học của tôi |

## 🎨 Components

### Layout Components
- **Layout**: Component chứa Navbar, Footer, và main content
- **Navbar**: Thanh điều hướng với user menu
- **Footer**: Footer của ứng dụng

### Form Components
- **Input**: Input field với validation
- **Button**: Button với các variants (primary, secondary, accent)

### Course Components
- **CourseCard**: Card hiển thị thông tin khóa học
- **CourseList**: Grid danh sách khóa học

### Media Components
- **VideoPlayer**: Video player cho bài học

## 🔐 Authentication

### Cấu trúc Auth Context
```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}
```

### Sử dụng Auth Context
```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Sử dụng auth state
}
```

## 🔗 API Integration

### API Services
Tất cả API calls được quản lý trong `src/services/api.ts`:

```typescript
// Authen
authAPI.login(email, password)
authAPI.register(fullName, email, password)
authAPI.logout()

// Courses
courseAPI.getAll()
courseAPI.getBySlug(slug)
courseAPI.search(query)

// Lessons
lessonAPI.getProgress(lessonId)
lessonAPI.saveProgress(lessonId, watched, total)

// User
userAPI.getProfile()
userAPI.getCourses()
userAPI.enrollCourse(courseId)
```

### Environment Variables
```env
VITE_API_URL=http://localhost:8080/api
```

## 🔨 Build

### Build production
```bash
npm run build
```

### Preview build
```bash
npm run preview
```

## ✅ Linting

```bash
npm run lint
```

## 📚 Mock Data

Hiện tại, ứng dụng sử dụng mock data để phát triển. Khi backend API sẵn sàng:

1. Cập nhật `src/services/api.ts` với real API endpoints
2. Bỏ comment TODO comments
3. Cập nhật file `.env` với URL backend

## 🎯 TODO - Integration

- [ ] Tích hợp API auth: `/auth/login`, `/auth/register`
- [ ] Tích hợp API courses: `/courses`, `/courses/{slug}`
- [ ] Tích hợp API progress: `/progress`
- [ ] Tích hợp API user: `/me`, `/me/courses`
- [ ] Xử lý lỗi hoàn chỉnh
- [ ] Loading states
- [ ] Toast/Alert notifications
- [ ] Protected routes
- [ ] Unit tests

## 📦 Dependencies

- **react**: ^19.1.1 - UI library
- **react-dom**: ^19.1.1 - React DOM
- **react-router-dom**: ^7.9.5 - Client-side routing
- **tailwindcss**: ^3.x - Utility-first CSS
- **postcss**: ^8.x - CSS processing
- **autoprefixer**: ^10.x - CSS vendor prefixes
- **typescript**: ~5.9.3 - Type safety
- **vite**: ^7.1.7 - Build tool

## 📞 Support

Nếu có bất kỳ vấn đề, vui lòng liên hệ hoặc tạo issue trên GitHub.

## 📄 License

MIT License
