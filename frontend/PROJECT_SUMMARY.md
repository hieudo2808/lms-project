# LMS Platform Frontend - Project Summary

## 📋 Tổng quan

Đây là frontend của nền tảng học trực tuyến LMS Platform, xây dựng với React 19, TypeScript, Tailwind CSS và Vite.

## ✨ Tính năng chính

### 1. **Trang Chủ** (`/`)
- Hiển thị danh sách khóa học
- Tìm kiếm khóa học theo từ khóa
- Lọc khóa học theo cấp độ
- Responsive grid layout

### 2. **Xác Thực** 
- **Đăng nhập** (`/login`) - Xác thực bằng email/password
- **Đăng ký** (`/register`) - Tạo tài khoản mới
- Lưu token và user info trong localStorage
- Auth Context để chia sẻ state toàn ứng dụng

### 3. **Quản Lý Khóa Học**
- **Chi tiết khóa học** (`/courses/[slug]`) - Xem thông tin chi tiết, danh sách bài học
- **Bài học** (`/courses/[slug]/lesson/[id]`) - Xem video, theo dõi tiến độ
- **Dashboard** (`/dashboard/my-courses`) - Quản lý các khóa học đã tham gia

### 4. **Giao Diện**
- Navbar với user menu
- Footer với thông tin liên kết
- Responsive design cho mobile/tablet/desktop
- Loading states
- 404 Not Found page

## 🗂️ Cấu trúc tệp tin

```
src/
├── components/           # Reusable components
│   ├── Button.tsx        # Tombol dengan variants
│   ├── Input.tsx         # Input field
│   ├── CourseCard.tsx    # Card hiển thị khóa học
│   ├── CourseList.tsx    # Grid danh sách khóa học
│   ├── VideoPlayer.tsx   # Video player
│   ├── Navbar.tsx        # Navigation bar
│   ├── Footer.tsx        # Footer
│   └── Layout.tsx        # Main layout wrapper
│
├── pages/                # Page components
│   ├── HomePage.tsx      # Trang chủ
│   ├── LoginPage.tsx     # Trang đăng nhập
│   ├── RegisterPage.tsx  # Trang đăng ký
│   ├── CourseDetailPage.tsx    # Chi tiết khóa học
│   ├── LessonPage.tsx    # Trang xem bài học
│   ├── MyCoursesPage.tsx # Dashboard
│   └── NotFoundPage.tsx  # 404 page
│
├── contexts/             # React Context
│   └── AuthContext.tsx   # Authentication context
│
├── services/             # API services
│   └── api.ts            # API client & endpoints
│
├── types/                # TypeScript types
│   └── index.ts          # Type definitions
│
├── constants/            # Constants
│   └── index.ts          # App constants
│
├── utils/                # Utility functions
│   └── index.ts          # Helper functions
│
├── hooks/                # Custom hooks
│   └── index.ts          # useLocalStorage, useAsync
│
├── App.tsx               # Main app with routing
├── main.tsx              # Entry point
├── index.css             # Global styles + Tailwind directives
└── App.css               # App specific styles
```

## 🎯 Types & Interfaces

### User
```typescript
interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
}
```

### Course
```typescript
interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  instructor: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  lessonsCount: number;
  rating: number;
  enrolledCount: number;
}
```

### Lesson
```typescript
interface Lesson {
  id: string;
  title: string;
  duration: number; // in minutes
  videoUrl: string;
  description?: string;
  order: number;
}
```

### Progress
```typescript
interface Progress {
  lessonId: string;
  courseId: string;
  completed: boolean;
  watchedDuration: number; // in seconds
  totalDuration: number; // in seconds
  lastWatched: string; // ISO date
}
```

## 🔐 Authentication Flow

```
User Register/Login
    ↓
API Call (authAPI.register/login)
    ↓
Receive User & Token
    ↓
Store in AuthContext & localStorage
    ↓
Update Navbar (show user, logout button)
    ↓
Redirect to Dashboard
```

## 🌐 API Endpoints

### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký

### Courses
- `GET /courses` - Danh sách khóa học
- `GET /courses/{slug}` - Chi tiết khóa học
- `GET /courses/search?q=query` - Tìm kiếm khóa học

### Lessons & Progress
- `GET /progress/{lessonId}` - Lấy tiến độ bài học
- `POST /progress` - Lưu tiến độ bài học

### User
- `GET /me` - Lấy thông tin user
- `GET /me/courses` - Danh sách khóa học của user
- `POST /me/courses` - Đăng ký khóa học

## 🛠️ Development

### Cài đặt
```bash
npm install
```

### Chạy development server
```bash
npm run dev
```

Truy cập `http://localhost:5173`

### Build production
```bash
npm run build
```

### Lint code
```bash
npm run lint
```

### Preview build
```bash
npm run preview
```

## 📦 Dependencies

- **react@^19.1.1** - UI library
- **react-dom@^19.1.1** - React DOM
- **react-router-dom@^7.9.5** - Client-side routing
- **tailwindcss@^3.x** - CSS utility framework
- **typescript@~5.9.3** - Type safety
- **vite@^7.1.7** - Build tool

### Dev Dependencies
- **@vitejs/plugin-react@^5.0.4** - React plugin cho Vite
- **@types/react@^19.1.16** - React types
- **@types/react-dom@^19.1.9** - React DOM types
- **eslint@^9.36.0** - Code linting

## 🎨 Styling

- **Tailwind CSS** cho utility classes
- **Custom CSS components** trong index.css
- Dark mode ready (cấu hình trong tailwind.config.ts)

## 🔄 Components Flow

```
App (Routing)
├── HomePage
│   └── CourseList
│       └── CourseCard
├── LoginPage
├── RegisterPage
├── CourseDetailPage
├── LessonPage
│   └── VideoPlayer
└── MyCoursesPage
    └── CourseList
        └── CourseCard

Layout (wrapper cho mọi page)
├── Navbar
├── main content (children)
└── Footer

Auth Context (global state)
├── LoginPage
├── RegisterPage
├── Navbar
└── LessonPage
```

## 🚀 Deployment

1. **Build**: `npm run build`
2. **Output**: `dist/` folder
3. **Deploy**: Upload `dist/` folder lên hosting (Netlify, Vercel, AWS S3, etc.)
4. **Environment**: Cập nhật `VITE_API_URL` trước build

## ⚠️ Important Notes

1. **Mock Data**: Hiện tại sử dụng mock data. Cần tích hợp với backend API.
2. **Error Handling**: Cần thêm global error boundary và toast notifications.
3. **Protected Routes**: Cần thêm route guards để bảo vệ routes cần authentication.
4. **Testing**: Cần viết unit tests với Jest/Vitest.
5. **Performance**: Cân nhắc code splitting và lazy loading.

## 📝 TODO - Next Steps

- [ ] Tích hợp real API endpoints
- [ ] Thêm error boundary
- [ ] Thêm toast notifications
- [ ] Protected routes
- [ ] Unit tests
- [ ] E2E tests
- [ ] PWA support
- [ ] Offline mode
- [ ] Search with debounce
- [ ] Infinite scroll / Pagination
- [ ] User profile page
- [ ] Course rating & review
- [ ] Wishlist/Favorites
- [ ] Subscription/Payment
- [ ] Certificates
- [ ] Notifications

## 👨‍💻 Developer

Created as part of LMS Platform project.

---

**Last Updated**: November 15, 2025
