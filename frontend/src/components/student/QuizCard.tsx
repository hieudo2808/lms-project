import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, Clock, Trophy } from 'lucide-react';
import { GET_MY_QUIZ_ATTEMPTS } from '../../graphql/queries/quiz';

interface QuizCardProps {
    quizId: string;
    title: string;
    description?: string;
    passingScore: number;
    isPublished: boolean;
}

interface QuizAttempt {
    attemptId: string;
    passed: boolean;
    percentage: number;
}

export const QuizCard = ({ quizId, title, description, passingScore, isPublished }: QuizCardProps) => {
    const navigate = useNavigate();

    const { data } = useQuery(GET_MY_QUIZ_ATTEMPTS, {
        variables: { quizId },
        fetchPolicy: 'cache-first',
        errorPolicy: 'ignore',
    });

    const attempts: QuizAttempt[] = data?.getMyQuizAttempts || [];
    const attemptCount = attempts.length;
    const hasPassed = attempts.some((a) => a.passed);
    const bestScore = attemptCount > 0 ? Math.max(...attempts.map((a) => a.percentage || 0)) : 0;

    return (
        <div
            className={`p-4 border rounded-lg transition-all flex items-center justify-between ${
                hasPassed
                    ? 'border-green-300 bg-green-50'
                    : attemptCount > 0
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-200 hover:border-purple-400'
            }`}
        >
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{title}</h3>
                    {hasPassed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <CheckCircle size={12} /> Đã đạt
                        </span>
                    )}
                    {!hasPassed && attemptCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            <Clock size={12} /> Chưa đạt
                        </span>
                    )}
                </div>
                {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                    <span>Điểm cần đạt: {passingScore}%</span>
                    {attemptCount > 0 && (
                        <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Trophy size={12} className="text-purple-500" />
                                Điểm cao nhất: {bestScore.toFixed(0)}%
                            </span>
                            <span>•</span>
                            <span>Đã làm {attemptCount} lần</span>
                        </>
                    )}
                </div>
            </div>
            {isPublished ? (
                <button
                    onClick={() => navigate(`/student/quizzes/${quizId}`)}
                    className={`ml-4 px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                        hasPassed
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                >
                    {hasPassed ? 'Làm lại' : attemptCount > 0 ? 'Tiếp tục' : 'Làm bài'}
                    <ChevronRight size={18} />
                </button>
            ) : (
                <div className="ml-4 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg font-medium">Chưa công bố</div>
            )}
        </div>
    );
};
