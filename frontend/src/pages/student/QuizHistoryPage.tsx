import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/common/Layout';
import { GET_MY_QUIZ_ATTEMPTS, GET_QUIZ_BY_ID } from '../../graphql/queries/quiz';
import { 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  ArrowLeft,
  Eye,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';

interface QuizAnswer {
  answerId: string;
  question: {
    questionId: string;
    questionText: string;
  } | null;
  selectedAnswerId: string | null;
  isCorrect: boolean;
  pointsAwarded: number;
}

interface QuizAttempt {
  attemptId: string;
  attemptNumber: number;
  startTime: string;
  endTime: string | null;
  totalScore: number;
  maxScore: number;
  percentage: number;
  status: string;
  passed: boolean;
  userAnswers?: QuizAnswer[] | null;
}

export const QuizHistoryPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [selectedAttempt, setSelectedAttempt] = useState<string | null>(null);

  const { data: quizData, loading: quizLoading } = useQuery(GET_QUIZ_BY_ID, {
    variables: { quizId },
    skip: !quizId,
  });

  const { data: attemptsData, loading: attemptsLoading } = useQuery(GET_MY_QUIZ_ATTEMPTS, {
    variables: { quizId },
    skip: !quizId,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  if (quizLoading || attemptsLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải lịch sử...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const quiz = quizData?.getQuizById;
  const attempts: QuizAttempt[] = attemptsData?.getMyQuizAttempts || [];

  if (!quiz) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">Không tìm thấy quiz này.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Statistics
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter(a => a.passed).length;
  const bestScore = totalAttempts > 0 ? Math.max(...attempts.map(a => a.percentage || 0)) : 0;
  const avgScore = totalAttempts > 0 
    ? attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts 
    : 0;

  const selectedAttemptData = attempts.find(a => a.attemptId === selectedAttempt);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại</span>
        </button>

        {/* Quiz Info */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 mb-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-blue-100 mb-4">{quiz.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
              <Target className="w-4 h-4" />
              <span>Điểm đạt: {quiz.passingScore}%</span>
            </div>
            {quiz.maxAttempts && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                <Trophy className="w-4 h-4" />
                <span>Tối đa: {quiz.maxAttempts} lần</span>
              </div>
            )}
            {quiz.timeLimit && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4" />
                <span>Thời gian: {quiz.timeLimit} phút</span>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng số lần</p>
                <p className="text-2xl font-bold text-gray-900">{totalAttempts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Đã đạt</p>
                <p className="text-2xl font-bold text-green-600">{passedAttempts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Điểm cao nhất</p>
                <p className="text-2xl font-bold text-purple-600">{bestScore.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Điểm TB</p>
                <p className="text-2xl font-bold text-orange-600">{avgScore.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attempts List */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">Lịch sử làm bài</h2>
          </div>

          {attempts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">Bạn chưa làm quiz này lần nào</p>
              <Link
                to={`/student/quizzes/${quizId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Làm bài ngay
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {attempts.map((attempt) => (
                <div key={attempt.attemptId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        attempt.passed 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        #{attempt.attemptNumber}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          Lần thứ {attempt.attemptNumber}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(attempt.startTime).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {attempt.endTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {Math.round(
                                  (new Date(attempt.endTime).getTime() - 
                                   new Date(attempt.startTime).getTime()) / 60000
                                )} phút
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">
                          {attempt.percentage?.toFixed(0) || 0}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {attempt.totalScore}/{attempt.maxScore} điểm
                        </div>
                      </div>
                      
                      {attempt.passed ? (
                        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg font-semibold">
                          <CheckCircle className="w-5 h-5" />
                          Đạt
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg font-semibold">
                          <XCircle className="w-5 h-5" />
                          Chưa đạt
                        </div>
                      )}

                      <button
                        onClick={() => setSelectedAttempt(
                          selectedAttempt === attempt.attemptId ? null : attempt.attemptId
                        )}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                        {selectedAttempt === attempt.attemptId ? 'Ẩn' : 'Xem'} chi tiết
                      </button>
                    </div>
                  </div>

                  {/* Attempt Details */}
                  {selectedAttempt === attempt.attemptId && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Chi tiết từng câu hỏi:
                      </h4>
                      
                      {/* Show message if quiz not finished */}
                      {!attempt.endTime || attempt.status === 'IN_PROGRESS' ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                          <p className="text-yellow-800">
                            Bài quiz này chưa được hoàn thành hoặc đang trong quá trình làm bài.
                          </p>
                        </div>
                      ) : (
                      <div className="space-y-3">
                        {attempt.userAnswers && attempt.userAnswers.length > 0 ? (
                          attempt.userAnswers
                            .filter(answer => answer.question !== null)
                            .map((answer, index) => (
                          <div
                            key={answer.answerId}
                            className={`p-4 rounded-lg border-2 ${
                              answer.isCorrect
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold text-gray-700">
                                    Câu {index + 1}:
                                  </span>
                                  {answer.isCorrect ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                  )}
                                </div>
                                <p className="text-gray-900 mb-2">
                                  {answer.question?.questionText || 'Câu hỏi đã bị xóa'}
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                <div className={`text-lg font-bold ${
                                  answer.isCorrect ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {answer.pointsAwarded} điểm
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                        ) : (
                          <div className="text-center text-gray-500 py-4">
                            Không có chi tiết câu hỏi
                          </div>
                        )}
                      </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {quiz.maxAttempts && attempts.length < quiz.maxAttempts && (
          <div className="mt-8 text-center">
            <Link
              to={`/student/quizzes/${quizId}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              <Trophy className="w-6 h-6" />
              Làm lại quiz (Lần {attempts.length + 1}/{quiz.maxAttempts})
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};
