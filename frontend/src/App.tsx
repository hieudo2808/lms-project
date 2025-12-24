import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import {
    LandingPage,
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
    EditQuizPage,
    StudentDashboardPage,
    LessonDetailPage,
    QuizTakingPage,
    CertificatesPage,
    CourseProgressPage,
    ProfileSettingsPage,
} from './pages';

import { QuizHistoryPage } from './pages/student/QuizHistoryPage';

import { InstructorLayout } from './layouts/InstructorLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { DashboardPage } from './pages/instructor/DashboardPage';
import { StudentsPage } from './pages/instructor/StudentsPage';
import { AnalyticsPage } from './pages/instructor/AnalyticsPage';
import { ReviewsPage } from './pages/instructor/ReviewsPage';

import { AdminDashboardPage } from './pages/admin/DashboardPage';
import { UsersPage as AdminUsersPage } from './pages/admin/UsersPage';
import { CoursesPage as AdminCoursesPage } from './pages/admin/CoursesPage';
import { CategoriesPage } from './pages/admin/CategoriesPage';

import { ProtectedRoute, RoleBasedRoute, GuestRoute } from './components/auth';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/courses" element={<HomePage />} />
                <Route path="/courses/:slug" element={<CourseDetailPage />} />

                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard/my-courses" element={<StudentDashboardPage />} />
                    <Route path="/dashboard/settings" element={<ProfileSettingsPage />} />
                    <Route path="/dashboard/certificates" element={<CertificatesPage />} />

                    <Route path="/courses/:slug/progress" element={<CourseProgressPage />} />
                    <Route path="/courses/:slug/lesson/:lessonId" element={<LessonDetailPage />} />
                    <Route path="/student/quizzes/:quizId" element={<QuizTakingPage />} />
                    <Route path="/student/quizzes/:quizId/history" element={<QuizHistoryPage />} />

                    <Route
                        element={
                            <RoleBasedRoute
                                allowedRoles={['INSTRUCTOR', 'ADMIN']}
                                fallbackPath="/dashboard/my-courses"
                            />
                        }
                    >
                        <Route path="/instructor" element={<InstructorLayout />}>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<DashboardPage />} />
                            <Route path="my-courses" element={<MyCoursesPage />} />
                            <Route path="create-course" element={<CreateCoursePage />} />
                            <Route path="courses/:slug/edit" element={<EditCoursePage />} />
                            <Route path="lessons/:lessonId/quizzes/create" element={<CreateQuizPage />} />
                            <Route path="lessons/:lessonId/quizzes/:quizId/edit" element={<EditQuizPage />} />
                            <Route path="settings" element={<AccountSettingsPage />} />

                            {/* Instructor Modules */}
                            <Route path="students" element={<StudentsPage />} />
                            <Route path="analytics" element={<AnalyticsPage />} />
                            <Route path="reviews" element={<ReviewsPage />} />
                        </Route>
                    </Route>

                    <Route element={<RoleBasedRoute allowedRoles={['ADMIN']} fallbackPath="/dashboard/my-courses" />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<AdminDashboardPage />} />
                            <Route path="users" element={<AdminUsersPage />} />
                            <Route path="categories" element={<CategoriesPage />} />
                            <Route path="courses" element={<AdminCoursesPage />} />
                            <Route path="payments" element={<Placeholder text="Quản lý thanh toán" />} />
                            <Route path="settings" element={<Placeholder text="Cài đặt hệ thống" />} />
                        </Route>
                    </Route>
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

const Placeholder = ({ text }: { text: string }) => (
    <div className="p-10 text-center font-medium text-gray-500">{text} (Đang phát triển)</div>
);
