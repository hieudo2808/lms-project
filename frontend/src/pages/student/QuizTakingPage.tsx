import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { ArrowLeft, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Layout } from '../../components/common/Layout';
import { GET_QUIZ_BY_ID } from '../../graphql/queries/quiz';
import {
  START_QUIZ_ATTEMPT,
  SUBMIT_QUIZ_ANSWER,
  FINISH_QUIZ_ATTEMPT,
} from '../../graphql/mutations/quiz';

interface QuizQuestion {
  questionId: string;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  points: number;
  answers: Array<{
    answerId: string;
    answerText: string;
    isCorrect: boolean;
  }>;
}

interface QuizData {
  quizId: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  maxAttempts: number;
  isPublished: boolean;
  questions: QuizQuestion[];
}

interface UserAnswer {
  [questionId: string]: string; // ✅ Chỉ lưu 1 answerId (string), không phải mảng
}

export const QuizTakingPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  // State
  const [userAnswers, setUserAnswers] = useState<UserAnswer>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [attemptStarted, setAttemptStarted] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<Record<string, unknown> | null>(null);

  // GraphQL Queries & Mutations
  const { data, loading, error } = useQuery(GET_QUIZ_BY_ID, {
    variables: { quizId: quizId || '' },
    skip: !quizId,
  });

  const [startAttempt] = useMutation(START_QUIZ_ATTEMPT);
  const [submitAnswer] = useMutation(SUBMIT_QUIZ_ANSWER);
  const [finishAttempt] = useMutation(FINISH_QUIZ_ATTEMPT);

  const quiz: QuizData | null = data?.getQuizById || null;
  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const totalQuestions = quiz?.questions.length || 0;

  // Timer effect
  useEffect(() => {
    if (!attemptStarted || !quiz || timeRemaining === null) return;

    if (timeRemaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev !== null && prev - 1 <= 0) {
          return 0;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, attemptStarted, quiz]);

  // Start Quiz
  const handleStartQuiz = async () => {
    if (!quizId) return;

    try {
      const res = await startAttempt({ variables: { quizId } });
      const payload = res.data.startQuizAttempt;
      const quizTimeLimit = payload?.quiz?.timeLimit ?? quiz?.timeLimit ?? 0;

      setAttemptId(payload.attemptId);
      setAttemptStarted(true);
      setTimeRemaining(quizTimeLimit ? quizTimeLimit * 60 : null);
      toast.success('Bắt đầu làm bài quiz');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error('Lỗi bắt đầu quiz: ' + error.message);
    }
  };

  // Handle Answer Selection
  const handleAnswerSelect = (questionId: string, answerId: string) => {
    // ✅ LUÔN GHI ĐÈ - chỉ lưu 1 answerId duy nhất (Radio behavior)
    setUserAnswers({
      ...userAnswers,
      [questionId]: answerId,
    });
  };

  // Handle Text Answer
  const handleTextAnswerChange = (questionId: string, text: string) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: text,
    });
  };

  // Submit Single Answer
  const handleSubmitAnswer = async (questionId: string) => {
    if (!attemptId || !userAnswers[questionId]) {
      toast.warning('Vui lòng chọn câu trả lời');
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ Gửi answerId đơn lẻ (Khớp với Backend hiện tại)
      const selectedAnswerId = userAnswers[questionId];

      await submitAnswer({
        variables: {
          attemptId,
          input: {
            questionId,
            answerId: selectedAnswerId,
          },
        },
      });

      // Move to next question
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error('Lỗi nộp bài: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Finish Quiz
  const handleFinishQuiz = async () => {
    if (!attemptId) return;

    if (
      currentQuestionIndex < totalQuestions - 1 &&
      !window.confirm('Bạn chưa làm hết bài. Bạn có chắc chắn muốn nộp bài?')
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ BƯỚC 1: LƯU ĐÁP ÁN CÂU HIỆN TẠI TRƯỚC (QUAN TRỌNG!)
      const currentQuestion = quiz?.questions[currentQuestionIndex];
      if (currentQuestion && userAnswers[currentQuestion.questionId]) {
        const selectedAnswerId = userAnswers[currentQuestion.questionId];
        
        await submitAnswer({
          variables: {
            attemptId,
            input: {
              questionId: currentQuestion.questionId,
              answerId: selectedAnswerId,
            },
          },
        });
      }

      // ✅ BƯỚC 2: SAU KHI LƯU XONG MỚI KẾT THÚC BÀI THI
      const res = await finishAttempt({ variables: { attemptId } });
      const result = res.data.finishQuizAttempt;

      setQuizResult(result);
      setQuizCompleted(true);
      toast.success('Nộp bài thành công!');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error('Lỗi nộp bài: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading State
  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-8"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error State
  if (error || !quiz) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Không thể tải bài quiz
          </h2>
          <p className="text-gray-600 mb-6">
            {error?.message || 'Bài quiz không tìm thấy'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>
        </div>
      </Layout>
    );
  }

  // Not Published
  if (!quiz.isPublished) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Bài quiz chưa được công bố
          </h2>
          <p className="text-gray-600 mb-6">
            Giảng viên chưa công bố bài quiz này. Vui lòng quay lại sau.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>
        </div>
      </Layout>
    );
  }

  // Completed
  if (quizCompleted && quizResult) {
    const passed = quizResult.passed;
    const percentage = Math.round(quizResult.percentage || 0);

    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {passed ? (
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
            ) : (
              <XCircle className="w-20 h-20 text-red-600 mx-auto mb-4" />
            )}

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {passed ? '🎉 Chúc mừng!' : 'Không đạt'}
            </h2>

            <p className="text-gray-600 mb-6">
              {passed
                ? `Bạn đã hoàn thành bài quiz với điểm số: ${quizResult.totalScore}/${quizResult.maxScore}`
                : `Bạn cần ${quiz.passingScore} điểm để đạt. Bạn nhận được ${quizResult.totalScore}/${quizResult.maxScore}`}
            </p>

            {/* Score Display */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-600 text-sm">Điểm số</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {quizResult.totalScore}/{quizResult.maxScore}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Phần trăm</p>
                  <p className="text-3xl font-bold text-purple-600">{percentage}%</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    passed ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex items-center gap-2"
              >
                <ArrowLeft size={18} /> Quay lại
              </button>
              {quizResult.maxAttempts && quizResult.maxAttempts > 1 && (
                <button
                  onClick={() => {
                    setAttemptStarted(false);
                    setUserAnswers({});
                    setCurrentQuestionIndex(0);
                    setQuizCompleted(false);
                    setQuizResult(null);
                    handleStartQuiz();
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Làm lại
                </button>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Quiz Taking
  if (attemptStarted && currentQuestion) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4 pb-20">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-4 mb-6 sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg ${
                  (timeRemaining || 0) < 60
                    ? 'bg-red-100 text-red-600'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                <Clock size={20} /> {formatTime(timeRemaining || 0)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 font-medium">
                Câu {currentQuestionIndex + 1}/{totalQuestions}
              </span>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {currentQuestion.questionText}
            </h2>

            {/* Answers */}
            <div className="space-y-3">
              {currentQuestion.questionType === 'SHORT_ANSWER' ? (
                <textarea
                  value={(userAnswers[currentQuestion.questionId] as string) || ''}
                  onChange={(e) =>
                    handleTextAnswerChange(currentQuestion.questionId, e.target.value)
                  }
                  placeholder="Nhập câu trả lời của bạn..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  rows={4}
                />
              ) : (
                currentQuestion.answers.map((answer) => {
                  // ✅ So sánh trực tiếp với string (không phải array)
                  const isSelected = userAnswers[currentQuestion.questionId] === answer.answerId;

                  return (
                    <label
                      key={answer.answerId}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {/* ✅ LUÔN LUÔN LÀ RADIO */}
                      <input
                        type="radio"
                        name={currentQuestion.questionId}
                        checked={isSelected}
                        onChange={() =>
                          handleAnswerSelect(currentQuestion.questionId, answer.answerId)
                        }
                        className="w-5 h-5 cursor-pointer"
                      />
                      <span className="text-gray-800 flex-1">{answer.answerText}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Câu trước
            </button>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                onClick={() =>
                  handleSubmitAnswer(currentQuestion.questionId)
                }
                disabled={isSubmitting}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Đang nộp...' : 'Câu tiếp theo →'}
              </button>
            ) : (
              <button
                onClick={handleFinishQuiz}
                disabled={isSubmitting}
                className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold"
              >
                {isSubmitting ? 'Đang nộp...' : '✓ Nộp bài'}
              </button>
            )}
          </div>

          {/* Question Map */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-800 mb-4">Danh sách câu hỏi</h3>
            <div className="grid grid-cols-6 gap-2">
              {quiz.questions.map((q, idx) => (
                <button
                  key={q.questionId}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`p-2 rounded font-bold transition-all ${
                    idx === currentQuestionIndex
                      ? 'bg-blue-600 text-white scale-110'
                      : userAnswers[q.questionId]
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Start Screen
  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{quiz.title}</h1>

          <p className="text-gray-600 mb-6 text-lg">{quiz.description}</p>

          {/* Quiz Info */}
          <div className="grid grid-cols-2 gap-4 mb-8 p-6 bg-gray-50 rounded-lg">
            <div>
              <p className="text-gray-600 text-sm">Số câu hỏi</p>
              <p className="text-2xl font-bold text-blue-600">{totalQuestions}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Thời gian</p>
              <p className="text-2xl font-bold text-purple-600">
                {quiz.timeLimit} phút
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Điểm cần đạt</p>
              <p className="text-2xl font-bold text-green-600">{quiz.passingScore}%</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Số lần làm lại</p>
              <p className="text-2xl font-bold text-orange-600">
                {quiz.maxAttempts === 0 ? '∞' : quiz.maxAttempts}
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-blue-900 mb-3">Hướng dẫn</h3>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>✓ Đọc kỹ từng câu hỏi</li>
              <li>✓ Chọn câu trả lời đúng</li>
              <li>✓ Bạn có {quiz.timeLimit} phút để hoàn thành</li>
              <li>✓ Không thể quay lại sau khi nộp bài</li>
              <li>✓ Cần {quiz.passingScore}% để đạt</li>
            </ul>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartQuiz}
            disabled={loading}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            Bắt đầu làm bài
          </button>
        </div>
      </div>
    </Layout>
  );
};
