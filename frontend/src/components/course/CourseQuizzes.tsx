import { useNavigate } from 'react-router-dom';

interface Quiz {
    quizId: string;
    title: string;
    description?: string;
    timeLimit?: number;
    passingScore?: number;
}

interface Lesson {
    lessonId: string;
    title: string;
}

interface CourseQuizzesProps {
    lessons: Lesson[];
    selectedLessonId: string | null;
    onSelectLesson: (lessonId: string) => void;
    quizzes: Quiz[];
    quizzesLoading: boolean;
    isPreviewMode: boolean;
}

export const CourseQuizzes = ({
    lessons,
    selectedLessonId,
    onSelectLesson,
    quizzes,
    quizzesLoading,
    isPreviewMode,
}: CourseQuizzesProps) => {
    const navigate = useNavigate();
    const selectedLesson = lessons.find((l) => l.lessonId === selectedLessonId);

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quiz theo bài học</h2>
                    <p className="text-sm text-gray-500">Chọn bài học để xem các quiz liên quan.</p>
                </div>
                <select
                    value={selectedLessonId || ''}
                    onChange={(e) => onSelectLesson(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                    <option value="" disabled>
                        Chọn bài học
                    </option>
                    {lessons.map((lesson) => (
                        <option key={lesson.lessonId} value={lesson.lessonId}>
                            {lesson.title}
                        </option>
                    ))}
                </select>
            </div>

            {!selectedLesson && <p className="text-gray-500">Hãy chọn một bài học để xem quiz.</p>}

            {selectedLesson && (
                <div className="space-y-4">
                    {quizzesLoading && <p className="text-gray-500">Đang tải quiz...</p>}
                    {!quizzesLoading && quizzes.length === 0 && <p className="text-gray-500">Bài học chưa có quiz.</p>}

                    {quizzes.map((quiz) => (
                        <div
                            key={quiz.quizId}
                            className="border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4"
                        >
                            <div>
                                <div className="text-lg font-semibold text-gray-900">{quiz.title}</div>
                                <p className="text-sm text-gray-600">{quiz.description}</p>
                                <div className="text-xs text-gray-500 mt-2 flex gap-3">
                                    <span>Thời gian: {quiz.timeLimit || 0} phút</span>
                                    <span>Điểm đạt: {quiz.passingScore}</span>
                                </div>
                            </div>
                            {isPreviewMode ? (
                                <span className="text-amber-600 text-sm italic">👁️ Xem trước</span>
                            ) : (
                                <button
                                    onClick={() => navigate(`/student/quizzes/${quiz.quizId}`)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                                >
                                    Làm quiz
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
