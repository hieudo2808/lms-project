import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import { GET_QUIZ_BY_LESSON } from '../../graphql/queries/quiz';
import { QuestionList } from '../../components/instructor/QuestionList';

export default function EditQuizPage() {
  const { lessonId } = useParams<{ lessonId: string }>();

  const { data, loading, error } = useQuery(GET_QUIZ_BY_LESSON, {
    variables: { lessonId },
    skip: !lessonId,
    fetchPolicy: 'network-only',
  });

  if (loading) return <div>Đang tải quiz...</div>;

  if (error || !data?.getQuizByLesson) {
    return <div className="text-red-500">Không tìm thấy quiz</div>;
  }

  const quiz = data.getQuizByLesson;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold">{quiz.title}</h1>
        <p className="text-gray-500">{quiz.description}</p>
        <p className="text-sm text-gray-400 mt-1">
          {quiz.duration} phút · Điểm đạt {quiz.passingScore}%
        </p>
      </div>

      <QuestionList
        questions={quiz.questions}
        onAdd={() => console.log('ADD QUESTION')}
        onEdit={(q) => console.log('EDIT', q)}
      />
    </div>
  );
}
