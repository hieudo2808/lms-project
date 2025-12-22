import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';

// === 1. SỬA ĐƯỜNG DẪN IMPORT CHUẨN ===
import { Layout } from '../../components/common/Layout'; 
import { useAuthStore } from '../../lib/store'; 
import { GET_COURSE_BY_SLUG } from '../../graphql/queries/course';
import { ENROLL_COURSE_MUTATION } from '../../graphql/mutations/enrollment';

// === 2. TẠM BỎ CÁC COMPONENT CHƯA CÓ ĐỂ KHÔNG LỖI ===
// import { CourseHero } ...
// import { CourseInfo } ...

export const CourseDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore(); // Sửa 'auth' thành 'user' cho đúng store

  const [courseId, setCourseId] = useState<string | null>(null);

  // 1. Fetch dữ liệu
  const { data, loading, error } = useQuery(GET_COURSE_BY_SLUG, {
    variables: { slug },
    onCompleted: (data) => {
      if (data?.getCourseBySlug) {
        setCourseId(data.getCourseBySlug.courseId);
      }
    }
  });

  // 2. Mutation Đăng ký
  const [enrollMutation, { loading: isEnrollLoading }] = useMutation(ENROLL_COURSE_MUTATION, {
    onCompleted: () => {
      alert('Đăng ký thành công!');
      navigate('/dashboard/my-courses');
    },
    onError: (err) => {
      alert('Lỗi: ' + err.message);
    }
  });

  const handleEnroll = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để đăng ký khóa học.');
      navigate('/login');
      return;
    }
    if (!courseId) return;

    enrollMutation({ variables: { courseId } });
  };

  // Loading & Error UI
  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </Layout>
  );

  if (error || !data?.getCourseBySlug) return (
    <Layout>
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600">Không tìm thấy khóa học</h2>
        <button onClick={() => navigate('/')} className="text-blue-600 underline mt-4">Quay về trang chủ</button>
      </div>
    </Layout>
  );

  const course = data.getCourseBySlug;
  const modules = course.modules || [];

  return (
    <Layout>
      {/* --- PHẦN HEADER (Thay cho CourseHero) --- */}
      <div className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">{course.title}</h1>
            <p className="text-gray-300 text-lg mb-6 line-clamp-3">{course.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm font-medium">
              <span className="bg-blue-600 px-3 py-1 rounded">Cấp độ: {course.level}</span>
              <span className="bg-gray-700 px-3 py-1 rounded">⏱ {Math.floor((course.totalDuration || 0) / 60)} phút</span>
              <span className="bg-gray-700 px-3 py-1 rounded">📚 {course.totalLessons || 0} bài học</span>
            </div>
          </div>
          <div>
            <img 
              src={course.thumbnailUrl || 'https://via.placeholder.com/600x400'} 
              alt={course.title} 
              className="rounded-xl shadow-2xl w-full object-cover border border-gray-700"
            />
          </div>
        </div>
      </div>

      {/* --- PHẦN NỘI DUNG CHÍNH --- */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cột trái: Nội dung khóa học (Thay cho CourseLessonList) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Nội dung bài học</h2>
            
            {modules.length === 0 ? (
              <p className="text-gray-500 italic">Chưa có nội dung.</p>
            ) : (
              <div className="space-y-4">
                {modules.map((module: any) => (
                  <div key={module.moduleId} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-semibold text-gray-800 border-b border-gray-200">
                      {module.title}
                    </div>
                    <div className="divide-y divide-gray-100">
                      {module.lessons?.map((lesson: any) => (
                        <div key={lesson.lessonId} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                          <span className="text-blue-500">▶</span>
                          <span className="text-gray-700 text-sm flex-1">{lesson.title}</span>
                          <span className="text-xs text-gray-400">
                            {Math.floor((lesson.durationSeconds || 0) / 60)}:
                            {((lesson.durationSeconds || 0) % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Giảng viên */}
          {course.instructor && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold mb-4">Giảng viên</h3>
              <div className="flex items-center gap-4">
                <img 
                  src={course.instructor.avatarUrl || 'https://via.placeholder.com/100'} 
                  className="w-16 h-16 rounded-full object-cover"
                  alt="Instructor"
                />
                <div>
                  <div className="font-bold text-lg">{course.instructor.fullName}</div>
                  <div className="text-gray-500 text-sm">{course.instructor.bio || "Giảng viên uy tín tại LMS"}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cột phải: Sidebar Mua khóa học (Thay cho CourseSidebar) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-24">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {course.price === 0 ? 'Miễn phí' : `${course.price?.toLocaleString()} đ`}
            </div>
            <p className="text-gray-500 text-sm mb-6 line-through">
              {(course.price * 1.5).toLocaleString()} đ
            </p>

            <button
              onClick={handleEnroll}
              disabled={isEnrollLoading}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition-all shadow-md active:transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isEnrollLoading ? 'Đang xử lý...' : 'Đăng ký ngay'}
            </button>

            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li className="flex gap-2">✅ Truy cập trọn đời</li>
              <li className="flex gap-2">✅ Học trên mọi thiết bị</li>
              <li className="flex gap-2">✅ Cấp chứng chỉ khi hoàn thành</li>
            </ul>
          </div>
        </div>

      </div>
    </Layout>
  );
};