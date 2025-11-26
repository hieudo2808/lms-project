// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LessonPage } from './pages/LessonPage';
import { LessonQuizPage } from './pages/LessonQuizPage';   // 👈 THÊM
import { MyCoursesPage } from './pages/MyCoursesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PaymentHistoryPage } from './pages/PaymentHistoryPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Course Routes */}
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/courses/:slug/lesson/:id" element={<LessonPage />} />
        <Route
          path="/courses/:slug/lesson/:id/quiz"
          element={<LessonQuizPage />}   // 👈 ROUTE QUIZ
        />

        {/* Dashboard Routes */}
        <Route path="/dashboard/my-courses" element={<MyCoursesPage />} />
        <Route path="/dashboard/payments" element={<PaymentHistoryPage />} />


        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

