import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

import { CREATE_QUIZ } from '../../graphql/mutations/quiz';
import { GET_QUIZ_BY_LESSON } from '../../graphql/queries/quiz';
import { QuizInfoForm } from '../../components/instructor/QuizInfoForm';

export default function CreateQuizPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const courseId = location.state?.courseId;

  const [createQuiz, { loading }] = useMutation(CREATE_QUIZ, {
    refetchQueries: [
      { query: GET_QUIZ_BY_LESSON, variables: { lessonId } }
    ],
    awaitRefetchQueries: true
  });

  if (!lessonId) {
    return <div className="text-red-500">Thiếu lessonId</div>;
  }

  const handleSubmit = async (form: any) => {
    if (!courseId) {
      toast.error("Lỗi: Mất kết nối dữ liệu khóa học. Vui lòng quay lại trang chỉnh sửa khóa học và thử lại.");
      return;
    }

    try {
      const res = await createQuiz({
        variables: {
          input: {
            lessonId,
            courseId,
            title: form.title,
            description: form.description,
            timeLimit: form.timeLimit,
            passingScore: form.passingScore,
            maxAttempts: form.maxAttempts,
          },
        },
      });

      toast.success('Tạo quiz thành công');

      const newQuizId = res.data.createQuiz.quizId;
      navigate(`/instructor/lessons/${lessonId}/quizzes/${newQuizId}/edit`, { replace: true });

    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (!courseId) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Không tìm thấy thông tin khóa học</h2>
            <p className="text-gray-500 mt-2 mb-6">Dữ liệu bị thiếu do làm mới trang. Vui lòng quay lại.</p>
            <button onClick={() => navigate(-1)} className="btn-primary">
                Quay lại
            </button>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 mb-6">
        <ArrowLeft size={20} /> Quay lại
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Tạo Quiz</h1>
      {loading ? <p>Đang xử lý...</p> : <QuizInfoForm onSubmit={handleSubmit} submitLabel={loading ? 'Đang tạo...' : 'Tạo quiz'} />}
    </div>
  );
}
