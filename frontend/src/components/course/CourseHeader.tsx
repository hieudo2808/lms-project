import { formatDuration } from '../../utils';

interface CourseHeaderProps {
    course: {
        title: string;
        description?: string;
        level?: string;
        totalDuration?: number;
        totalLessons?: number;
        thumbnailUrl?: string;
    };
    averageRating?: number;
}

export const CourseHeader = ({ course, averageRating }: CourseHeaderProps) => {
    return (
        <div className="bg-slate-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div>
                    <h1 className="text-4xl font-bold mb-3 leading-tight">{course.title}</h1>
                    <p className="text-gray-300 text-lg mb-5 line-clamp-3">{course.description}</p>

                    <div className="flex flex-wrap gap-3 text-sm font-medium items-center">
                        <span className="bg-blue-600 px-3 py-1 rounded">Cấp độ: {course.level}</span>
                        <span className="bg-gray-700 px-3 py-1 rounded">⏱ {formatDuration(course.totalDuration)}</span>
                        <span className="bg-gray-700 px-3 py-1 rounded">📚 {course.totalLessons || 0} bài học</span>
                        <span className="bg-amber-500/20 text-amber-200 px-3 py-1 rounded">
                            ⭐ {averageRating?.toFixed(1) || '0.0'} / 5
                        </span>
                    </div>
                </div>
                <div>
                    <img
                        src={course.thumbnailUrl || 'https://via.placeholder.com/600x400'}
                        alt={course.title}
                        className="rounded-xl shadow-2xl w-full object-cover border border-gray-700"
                    />
                </div>
            </div>
        </div>
    );
};
