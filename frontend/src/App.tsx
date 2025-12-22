import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import các trang từ file index.ts
import { 
  HomePage, 
  LoginPage, 
  RegisterPage, 
  CourseDetailPage,
  NotFoundPage,
  EditCoursePage,
  CreateCoursePage,
  MyCoursesPage,
  AccountSettingsPage,
  CreateQuizPage,
  EditQuizPage
} from './pages';

// Import Layout và Trang Dashboard
import { InstructorLayout } from './layouts/InstructorLayout';
import { DashboardPage } from './pages/instructor/DashboardPage';

import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        
        {/* ================= STUDENT ROUTES ================= */}
        {/* Route dành cho học viên xem các khóa học đã mua */}
        <Route path="/dashboard/my-courses" element={<div>Trang khóa học đã mua của Học viên</div>} />

        {/* ================= INSTRUCTOR ROUTES (DÀNH CHO GIẢNG VIÊN) ================= */}
        {/* InstructorLayout cung cấp Sidebar và Header chứa thông tin thật từ Backend */}
        <Route path="/instructor" element={<InstructorLayout />}>
          
          {/* Mặc định chuyển hướng vào Dashboard khi truy cập /instructor */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Trang quản lý danh sách khóa học của riêng giảng viên */}
          <Route path="my-courses" element={<MyCoursesPage />} />

          {/* Trang tạo khóa học mới với đầy đủ thông tin: Tên, Giá, Trình độ, Danh mục */}
          <Route path="create-course" element={<CreateCoursePage />} />

          {/* Trang chỉnh sửa nội dung khóa học (Curriculum Editor) */}
          <Route path="courses/:slug/edit" element={<EditCoursePage />} />
          <Route path="lessons/:lessonId/quizzes/create" element={<CreateQuizPage />}/>
          <Route path="lessons/:lessonId/quizzes/:quizId/edit" element={<EditQuizPage />}/>
          {/* Các trang Placeholder sẽ được bổ sung chức năng sau */}
          <Route path="students" element={<div className="p-10 text-gray-500 font-medium text-center">Trang quản lý học viên (Đang phát triển)</div>} />
          <Route path="analytics" element={<div className="p-10 text-gray-500 font-medium text-center">Trang phân tích doanh thu (Đang phát triển)</div>} />
          <Route path="reviews" element={<div className="p-10 text-gray-500 font-medium text-center">Trang đánh giá & phản hồi (Đang phát triển)</div>} />
          <Route path="settings" element={<AccountSettingsPage />} />
        </Route>

        {/* ================= 404 NOT FOUND ================= */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;