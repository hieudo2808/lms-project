import React, { useMemo, useEffect } from 'react'; // Thêm useMemo để tối ưu
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, Eye, Globe, Lock, 
  CheckCircle, AlertCircle, FileText, ClipboardList, PlusCircle, Edit3
} from 'lucide-react';

import { GET_COURSE_BY_SLUG } from '../../graphql/queries/course';
import { GET_QUIZ_BY_LESSON } from '../../graphql/queries/quiz'; 
import { 
  PUBLISH_COURSE_MUTATION, 
  UNPUBLISH_COURSE_MUTATION 
} from '../../graphql/mutations/instructor';

import CurriculumEditor from '../../components/instructor/CurriculumEditor'; 
import CourseInfoForm from "../../components/instructor/CourseInfoForm";

export const EditCoursePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // 1. QUERY: Lấy thông tin khóa học
  const { data: courseData, loading: courseLoading, error: courseError, refetch: refetchCourse } = useQuery(GET_COURSE_BY_SLUG, {
    variables: { slug },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true 
  });

  // 2. MUTATION: Xuất bản & Gỡ bỏ
  const [publishCourse, { loading: publishing }] = useMutation(PUBLISH_COURSE_MUTATION);
  const [unpublishCourse, { loading: unpublishing }] = useMutation(UNPUBLISH_COURSE_MUTATION);

  // --- TÍNH TOÁN ID ĐỂ FETCH QUIZ (AN TOÀN) ---
  const course = courseData?.getCourseBySlug;
  
  // Dùng useMemo hoặc optional chaining an toàn để lấy ID
  const firstLessonId = course?.modules?.find((m: any) => m.lessons?.length > 0)?.lessons[0]?.lessonId;

  // 3. QUERY PHỤ: Lấy danh sách Quiz
  // QUAN TRỌNG: Hook này PHẢI nằm trước mọi lệnh return
  const [getQuizzes, { data: quizData }] = useLazyQuery(GET_QUIZ_BY_LESSON, {
    fetchPolicy: 'network-only'
  });

  // Gọi query khi firstLessonId có giá trị
  useEffect(() => {
    if (firstLessonId) {
      getQuizzes({ variables: { lessonId: firstLessonId } });
    }
  }, [firstLessonId, getQuizzes]);

  const quizzes = quizData?.getQuizzesByLesson || [];
  const isBusy = publishing || unpublishing;

  // --- BÂY GIỜ MỚI ĐƯỢC PHÉP RETURN GIAO DIỆN LOADING/ERROR ---
  
  if (courseLoading) return (
    <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  if (courseError || !course) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy khóa học!</h2>
        <button onClick={() => navigate('/instructor/dashboard')} className="px-6 py-2 bg-blue-600 text-white rounded-lg mt-4">
          Quay lại Dashboard
        </button>
    </div>
  );

  // --- LOGIC XỬ LÝ SỰ KIỆN ---
  const handleTogglePublish = async () => {
    try {
      if (course.isPublished) {
        if (window.confirm("⚠️ CẢNH BÁO: Bạn có chắc muốn gỡ khóa học này?")) {
            await unpublishCourse({ variables: { courseId: course.courseId } });
            toast.info("Đã chuyển về trạng thái NHÁP.");
            refetchCourse();
        }
      } else {
        if (!course.modules || course.modules.length === 0) {
            toast.warning("Khóa học cần ít nhất một chương nội dung để xuất bản.");
            return;
        }
        await publishCourse({ variables: { courseId: course.courseId } });
        toast.success("🎉 Khóa học đã được XUẤT BẢN công khai.");
        refetchCourse();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
        {/* --- HEADER BAR --- */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 -mx-8 mb-8 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/instructor/dashboard')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-gray-800 truncate max-w-md">{course.title}</h1>
                        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${course.isPublished ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {course.isPublished ? <CheckCircle size={12}/> : <FileText size={12}/>}
                            {course.isPublished ? 'ĐANG CÔNG KHAI' : 'BẢN NHÁP'}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Biên tập nội dung & bài học</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                 <button onClick={() => window.open(`/courses/${course.slug}`, '_blank')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 rounded-lg transition-colors">
                   <Eye size={18} /> <span className="hidden sm:inline">Xem trước</span>
                 </button>
                 <button onClick={handleTogglePublish} disabled={isBusy} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-all ${course.isPublished ? 'bg-white border border-red-200 text-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                   {isBusy ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"/> : (course.isPublished ? <Lock size={18}/> : <Globe size={18}/>)}
                   <span>{course.isPublished ? 'Gỡ xuống' : 'Xuất bản'}</span>
                 </button>
            </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="px-4 md:px-0">
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

            {/* ===== QUIZ SECTION ===== */}
            <div className="bg-white border rounded-xl p-6 mb-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <ClipboardList size={20} className="text-purple-600" /> Quiz của khóa học
                </h2>
                <button
                  onClick={() => {
                    if (!firstLessonId) {
                      toast.error("Vui lòng tạo ít nhất một bài học trước khi tạo Quiz.");
                      return;
                    }
                    navigate(`/instructor/lessons/${firstLessonId}/quizzes/create`, { 
                      state: { courseId: course.courseId } 
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm text-sm font-medium"
                >
                  <PlusCircle size={18} /> Tạo Quiz
                </button>
              </div>

              {quizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizzes.map((quiz: any) => (
                    <div key={quiz.quizId} className="flex items-center justify-between border border-gray-100 rounded-lg p-4 hover:border-purple-200 hover:bg-purple-50 transition-all group">
                      <div>
                        <p className="font-semibold text-gray-800">{quiz.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {quiz.questions?.length || 0} câu hỏi • Điểm đạt {quiz.passingScore}%
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/instructor/lessons/${firstLessonId}/quizzes/${quiz.quizId}/edit`)}
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
                      >
                        <Edit3 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-sm text-gray-500">
                  Chưa có quiz nào cho khóa học này.
                </div>
              )}
            </div>

            {/* Curriculum Editor Component */}
            <CurriculumEditor 
              courseId={course.courseId} 
              modules={course.modules || []} 
              refetch={refetchCourse} 
            />
        </div>
    </div>
  );
};