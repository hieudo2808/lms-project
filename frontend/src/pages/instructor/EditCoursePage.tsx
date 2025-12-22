import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, Eye, Globe, Lock, 
  CheckCircle, AlertCircle, FileText, ClipboardList, PlusCircle
} from 'lucide-react';

// Import các GraphQL query & mutation
import { GET_COURSE_BY_SLUG } from '../../graphql/queries/course';
import { 
  PUBLISH_COURSE_MUTATION, 
  UNPUBLISH_COURSE_MUTATION 
} from '../../graphql/mutations/instructor';

// Import Editor Component
import CurriculumEditor from '../../components/instructor/CurriculumEditor'; 
import CourseInfoForm from "../../components/instructor/CourseInfoForm";

export const EditCoursePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // 1. QUERY: Lấy thông tin khóa học
  const { data, loading, error, refetch } = useQuery(GET_COURSE_BY_SLUG, {
    variables: { slug },
    fetchPolicy: 'network-only', // Luôn lấy dữ liệu mới nhất
    notifyOnNetworkStatusChange: true 
  });

  // 2. MUTATION: Xuất bản & Gỡ bỏ
  const [publishCourse, { loading: publishing }] = useMutation(PUBLISH_COURSE_MUTATION);
  const [unpublishCourse, { loading: unpublishing }] = useMutation(UNPUBLISH_COURSE_MUTATION);

  // Xử lý logic nút Xuất bản
  const handleTogglePublish = async () => {
    if (!data?.getCourseBySlug) return;
    const course = data.getCourseBySlug;
    
    try {
      if (course.isPublished) {
        // CASE: Đang Public -> Muốn gỡ xuống (Unpublish)
        if (window.confirm("⚠️ CẢNH BÁO: Bạn có chắc muốn gỡ khóa học này?\n\nHọc viên sẽ không thể tìm thấy hoặc mua khóa học này nữa.")) {
            await unpublishCourse({ variables: { courseId: course.courseId } });
            toast.info("Đã chuyển khóa học về trạng thái NHÁP.");
            refetch();
        }
      } else {
        // CASE: Đang Nháp -> Muốn Public
        // Kiểm tra điều kiện (Ví dụ: phải có ít nhất 1 chương, 1 bài học - Tùy logic của bạn)
        if (!course.modules || course.modules.length === 0) {
            toast.warning("Khoan đã! Khóa học cần ít nhất một chương nội dung để xuất bản.");
            return;
        }

        await publishCourse({ variables: { courseId: course.courseId } });
        toast.success("🎉 Chúc mừng! Khóa học đã được XUẤT BẢN công khai.");
        refetch();
      }
    } catch (err: any) {
      toast.error("Lỗi: " + (err.message || "Không thể thay đổi trạng thái."));
    }
  };

  // Loading State
  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
        <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 font-medium">Đang tải nội dung khóa học...</p>
        </div>
    </div>
  );

  // Error State
  if (error || !data?.getCourseBySlug) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy khóa học!</h2>
        <p className="text-gray-500 mt-2 mb-6">Có thể khóa học đã bị xóa hoặc đường dẫn không đúng.</p>
        <button onClick={() => navigate('/instructor/dashboard')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Quay lại Dashboard
        </button>
    </div>
  );

  const course = data.getCourseBySlug;
  const isBusy = publishing || unpublishing;

  return (
    <div className="max-w-6xl mx-auto pb-20">
        {/* --- HEADER BAR --- */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 -mx-8 mb-8 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/instructor/dashboard')}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    title="Quay lại"
                >
                    <ArrowLeft size={20} />
                </button>
                
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-gray-800 truncate max-w-md" title={course.title}>
                            {course.title}
                        </h1>
                        {/* Status Badge */}
                        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            course.isPublished 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                            {course.isPublished ? <CheckCircle size={12}/> : <FileText size={12}/>}
                            {course.isPublished ? 'ĐANG CÔNG KHAI' : 'BẢN NHÁP'}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Biên tập nội dung & bài học</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                 {/* Nút Xem trước */}
                 <button 
                    onClick={() => window.open(`/courses/${course.slug}`, '_blank')} 
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                 >
                   <Eye size={18} />
                   <span className="hidden sm:inline">Xem trước</span>
                 </button>
                 
                 {/* Nút Xuất bản / Gỡ bỏ */}
                 <button 
                    onClick={handleTogglePublish}
                    disabled={isBusy}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-all transform active:scale-95 ${
                        course.isPublished 
                        ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                    } ${isBusy ? 'opacity-70 cursor-not-allowed' : ''}`}
                 >
                   {isBusy ? (
                     <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"/>
                   ) : (
                     course.isPublished ? <Lock size={18}/> : <Globe size={18}/>
                   )}
                   <span>{course.isPublished ? 'Gỡ xuống' : 'Xuất bản'}</span>
                 </button>
            </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="px-4 md:px-0">
             {/* Thông báo gợi ý nếu chưa xuất bản */}
             {!course.isPublished && (
                <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="text-blue-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-blue-800 text-sm">Khóa học này chưa được công khai</h4>
                        <p className="text-sm text-blue-600 mt-1">
                            Học viên sẽ không thể nhìn thấy khóa học này. Hãy thêm đầy đủ chương và bài học, sau đó nhấn nút 
                            <strong> "Xuất bản"</strong> ở góc phải màn hình để ra mắt khóa học nhé!
                        </p>
                    </div>
                </div>
             )}

            <div className="mb-6">
            <CourseInfoForm course={course} />
            </div>

            {/* ===== QUIZ SECTION (NEW) ===== */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ClipboardList size={20} /> Quiz cho học viên
            </h2>

            <button
              onClick={() =>
                navigate(`/instructor/lessons/{lessonId}/quizzes/create`)
              }
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusCircle size={18} /> Tạo Quiz
            </button>
          </div>

          {course.quizzes && course.quizzes.length > 0 ? (
            <div className="space-y-3">
              {course.quizzes.map((quiz: any) => (
                <div
                  key={quiz.quizId}
                  className="flex items-center justify-between border rounded-lg p-4 hover:border-blue-300"
                >
                  <div>
                    <p className="font-semibold">{quiz.title}</p>
                    <p className="text-xs text-gray-500">
                      {quiz.questions?.length || 0} câu hỏi
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        `/instructor/lessons/{lessonId}/quizzes/{quizId}/edit`
                      )
                    }
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Edit3 size={16} /> Chỉnh sửa
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Chưa có quiz nào cho khóa học này.
            </p>
          )}
        </div>

            {/* Editor Component */}
            <CurriculumEditor 
              courseId={course.courseId} 
              modules={course.modules || []} 
              refetch={refetch} 
            />
        </div>
    </div>
  );
};