import { formatDuration } from '../../utils';

interface Module {
    moduleId: string;
    title: string;
    lessons?: Lesson[];
}

interface Lesson {
    lessonId: string;
    title: string;
    durationSeconds?: number;
}

interface CourseCurriculumProps {
    modules: Module[];
    selectedLessonId: string | null;
    onSelectLesson: (lessonId: string) => void;
    totalLessons: number;
}

export const CourseCurriculum = ({
    modules,
    selectedLessonId,
    onSelectLesson,
    totalLessons,
}: CourseCurriculumProps) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Nội dung bài học</h2>
                <div className="text-sm text-gray-500">{totalLessons} bài học</div>
            </div>

            {modules.length === 0 && <p className="text-gray-500">Chưa có nội dung.</p>}

            <div className="space-y-4">
                {modules.map((module) => (
                    <div key={module.moduleId} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 font-semibold text-gray-800 border-b border-gray-200 flex items-center justify-between">
                            <span>{module.title}</span>
                            <span className="text-xs text-gray-500">{module.lessons?.length || 0} bài</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {module.lessons?.map((lesson) => (
                                <button
                                    key={lesson.lessonId}
                                    onClick={() => onSelectLesson(lesson.lessonId)}
                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors ${
                                        selectedLessonId === lesson.lessonId
                                            ? 'bg-blue-50 border-l-4 border-blue-600'
                                            : ''
                                    }`}
                                >
                                    <span className="text-blue-500">▶</span>
                                    <div className="flex-1">
                                        <div className="text-gray-800 text-sm font-semibold">{lesson.title}</div>
                                        <div className="text-xs text-gray-500">{module.title}</div>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {formatDuration(lesson.durationSeconds)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
