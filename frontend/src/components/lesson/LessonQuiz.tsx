import { useEffect, useState } from 'react';
import { quizAPI } from '../../services/api';
import type { Quiz, QuizAttemptResult } from '../../types';
import { Button } from '../Button';

interface LessonQuizProps {
  lessonId: string;
}

const QUIZ_DURATION_SECONDS = 5 * 60; // 5' demo

export const LessonQuiz = ({ lessonId }: LessonQuizProps) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [hasStarted, setHasStarted] = useState(false);

  // load quiz
  useEffect(() => {
    if (!lessonId) return;

    const fetchQuiz = async () => {
      try {
        setIsLoading(true);

        // TODO: dùng API thật
        // const res = await quizAPI.getLessonQuiz(lessonId);
        // setQuiz(res.data);

        const mock: Quiz = {
          id: 'q1',
          lessonId,
          title: 'Quiz ôn tập bài học',
          questions: [
            {
              id: 'q1_1',
              quizId: 'q1',
              text: 'React là gì?',
              answers: [
                {
                  id: 'a1',
                  questionId: 'q1_1',
                  text: 'Thư viện JS cho UI',
                  isCorrect: true,
                },
                {
                  id: 'a2',
                  questionId: 'q1_1',
                  text: 'Framework backend',
                  isCorrect: false,
                },
              ],
            },
            {
              id: 'q1_2',
              quizId: 'q1',
              text: 'Hook useState dùng để làm gì?',
              answers: [
                {
                  id: 'a3',
                  questionId: 'q1_2',
                  text: 'Quản lý state trong function component',
                  isCorrect: true,
                },
                {
                  id: 'a4',
                  questionId: 'q1_2',
                  text: 'Gửi request HTTP',
                  isCorrect: false,
                },
              ],
            },
          ],
        };

        setQuiz(mock);
        setAnswers({});
        setResult(null);
        setTimeLeft(QUIZ_DURATION_SECONDS);
        setHasStarted(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [lessonId]);

  // timer
  useEffect(() => {
    if (!hasStarted || result) return;
    if (timeLeft <= 0) {
      handleSubmit(); // auto nộp
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted, timeLeft, result]);

  const handleSelectAnswer = (questionId: string, answerId: string) => {
    if (!hasStarted) setHasStarted(true);
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async () => {
    if (!quiz || result) return;

    try {
      setIsSubmitting(true);

      const payload = quiz.questions.map((q) => ({
        questionId: q.id,
        answerId: answers[q.id],
      }));

      // TODO: dùng API thật
      // const res = await quizAPI.submitQuiz(lessonId, payload);
      // setResult(res.data);

      const totalQuestions = quiz.questions.length;
      let correctCount = 0;
      quiz.questions.forEach((q) => {
        const selected = answers[q.id];
        const correct = q.answers.find((a) => a.isCorrect);
        if (selected && correct && selected === correct.id) {
          correctCount += 1;
        }
      });
      const score = (correctCount / totalQuestions) * 100;

      const mockResult: QuizAttemptResult = {
        attemptId: crypto.randomUUID?.() || Date.now().toString(),
        score,
        correctCount,
        totalQuestions,
        createdAt: new Date().toISOString(),
      };

      setResult(mockResult);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">Đang tải quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500">
          Bài học này chưa có quiz.
        </p>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">
          📝 {quiz.title}
        </h2>
        {!result && (
          <div className="text-sm font-semibold text-red-600">
            Thời gian: {minutes.toString().padStart(2, '0')}:
            {seconds.toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {quiz.questions.map((q, idx) => (
        <div key={q.id} className="border-t border-gray-200 pt-3">
          <p className="font-medium text-gray-800 mb-2">
            Câu {idx + 1}: {q.text}
          </p>
          <div className="space-y-1 ml-2">
            {q.answers.map((ans) => {
              const selected = answers[q.id] === ans.id;
              const showCorrect = !!result; // chỉ tô màu sau khi nộp

              const isCorrect = ans.isCorrect;
              let extraClasses = '';

              if (showCorrect) {
                if (isCorrect) extraClasses = 'bg-green-50 border-green-400';
                else if (selected && !isCorrect)
                  extraClasses = 'bg-red-50 border-red-400';
              } else if (selected) {
                extraClasses = 'bg-blue-50 border-blue-400';
              }

              return (
                <label
                  key={ans.id}
                  className={`flex items-center gap-2 text-sm text-gray-700 cursor-pointer border rounded-md px-2 py-1 ${extraClasses}`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={ans.id}
                    checked={selected}
                    onChange={() => handleSelectAnswer(q.id, ans.id)}
                    disabled={!!result}
                  />
                  <span>{ans.text}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {!result && (
        <div className="mt-3">
          <Button
            variant="primary"
            className="w-full md:w-auto"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'}
          </Button>
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-semibold text-gray-800 mb-1">
            Kết quả:
          </p>
          <p>
            Điểm: {result.score.toFixed(1)} / 100 (
            {result.correctCount}/{result.totalQuestions} câu đúng)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Lần làm:{' '}
            {new Date(result.createdAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};
