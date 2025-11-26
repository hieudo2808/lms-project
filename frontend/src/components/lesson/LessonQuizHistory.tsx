import { useEffect, useState } from 'react';
import { quizAPI } from '../../services/api';
import type { QuizAttemptDetail, QuizAttemptResult } from '../../types';

interface LessonQuizHistoryProps {
  lessonId: string;
}

export const LessonQuizHistory = ({ lessonId }: LessonQuizHistoryProps) => {
  const [attempts, setAttempts] = useState<QuizAttemptResult[]>([]);
  const [selected, setSelected] = useState<QuizAttemptDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;

    const fetchAttempts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // const res = await quizAPI.getAttempts(lessonId);
        // setAttempts(res.data);

        // MOCK
        const mock: QuizAttemptResult[] = [
          {
            attemptId: 'a1',
            quizId: 'q1',
            lessonId,
            score: 80,
            correctCount: 4,
            totalQuestions: 5,
            createdAt: new Date().toISOString(),
          },
        ];
        setAttempts(mock);
      } catch (err) {
        console.error(err);
        setError('Không tải được lịch sử quiz.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttempts();
  }, [lessonId]);

  const handleViewDetail = async (attemptId: string) => {
    try {
      setIsDetailLoading(true);
      setError(null);

      // const res = await quizAPI.getAttemptDetail(attemptId);
      // setSelected(res.data);

      // MOCK detail
      const mockDetail: QuizAttemptDetail = {
        attemptId,
        quizId: 'q1',
        lessonId,
        score: 80,
        correctCount: 4,
        totalQuestions: 5,
        createdAt: new Date().toISOString(),
        answersReview: [
          {
            questionId: 'q1',
            questionText: 'React là gì?',
            answers: [
              { id: 'a1', questionId: 'q1', text: 'Thư viện JS cho UI' },
              { id: 'a2', questionId: 'q1', text: 'Framework backend' },
            ],
            correctAnswerId: 'a1',
            selectedAnswerId: 'a1',
          },
        ],
      };
      setSelected(mockDetail);
    } catch (err) {
      console.error(err);
      setError('Không tải được chi tiết bài làm.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-10 p-4 bg-white rounded-lg border">
        <p className="text-sm text-gray-500">Đang tải lịch sử quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 p-4 bg-white rounded-lg border">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (attempts.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 p-4 bg-white rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        📊 Lịch sử làm quiz
      </h2>

      <div className="space-y-2 mb-4">
        {attempts.map((a) => (
          <button
            key={a.attemptId}
            type="button"
            onClick={() => handleViewDetail(a.attemptId)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border hover:bg-gray-50 text-left"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">
                Điểm: {a.score.toFixed(1)} / 100
              </p>
              <p className="text-xs text-gray-500">
                {a.correctCount}/{a.totalQuestions} câu đúng ·{' '}
                {new Date(a.createdAt).toLocaleString()}
              </p>
            </div>
            <span className="text-xs text-blue-600 font-semibold">
              Xem chi tiết
            </span>
          </button>
        ))}
      </div>

      {isDetailLoading && (
        <p className="text-sm text-gray-500">Đang tải chi tiết...</p>
      )}

      {selected && !isDetailLoading && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            Bài làm ngày {new Date(selected.createdAt).toLocaleString()}
          </h3>
          <p className="text-sm mb-3">
            Điểm: <span className="font-semibold">{selected.score.toFixed(1)}</span>{' '}
            / 100 ({selected.correctCount}/{selected.totalQuestions} câu đúng)
          </p>

          <div className="space-y-3">
            {selected.answersReview.map((q, idx) => (
              <div key={q.questionId} className="border rounded-lg p-3">
                <p className="text-sm font-medium text-gray-800 mb-2">
                  Câu {idx + 1}: {q.questionText}
                </p>
                <ul className="space-y-1 text-sm">
                  {q.answers.map((ans) => {
                    const isCorrect = ans.id === q.correctAnswerId;
                    const isSelected = ans.id === q.selectedAnswerId;
                    return (
                      <li
                        key={ans.id}
                        className={`px-2 py-1 rounded ${
                          isCorrect
                            ? 'bg-green-50 text-green-700'
                            : isSelected
                            ? 'bg-red-50 text-red-700'
                            : ''
                        }`}
                      >
                        {ans.text}
                        {isCorrect && (
                          <span className="ml-2 text-xs font-semibold">
                            (Đúng)
                          </span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="ml-2 text-xs font-semibold">
                            (Bạn chọn)
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
