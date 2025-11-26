import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { LessonQuiz } from '../components/lesson/LessonQuiz';
import { LessonQuizHistory } from '../components/lesson/LessonQuizHistory';

export const LessonQuizPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <p className="text-gray-500">Không tìm thấy bài học.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <LessonQuiz lessonId={id} />
        <LessonQuizHistory lessonId={id} />
      </div>
    </Layout>
  );
};

