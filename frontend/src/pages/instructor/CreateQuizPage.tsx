import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { toast } from 'react-toastify';

import { CREATE_QUIZ } from '../../graphql/mutations/quiz';
import { QuizInfoForm } from '../../components/instructor/QuizInfoForm';

export default function CreateQuizPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [createQuiz, { loading }] = useMutation(CREATE_QUIZ);

  if (!lessonId) {
    return <div className="text-red-500">Thiếu lessonId</div>;
  }

  const handleSubmit = async (form: any) => {
    try {
      const res = await createQuiz({
        variables: {
          input: {
            lessonId,
            title: form.title,
            description: form.description,
            duration: form.duration,
            passingScore: form.passingScore,
          },
        },
      });

      toast.success('Tạo quiz thành công');

      navigate(
        `/instructor/lessons/${lessonId}/quizzes/${res.data.createQuiz.quizId}/edit`
      );
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Tạo Quiz</h1>

      <QuizInfoForm
        onSubmit={handleSubmit}
        submitLabel={loading ? 'Đang tạo...' : 'Tạo quiz'}
      />
    </div>
  );
}
