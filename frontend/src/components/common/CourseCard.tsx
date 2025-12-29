import { Link } from 'react-router-dom';
import type { Course } from '../../types';
import { CourseRatingBadge } from './CourseRatingBadge';

interface CourseCardProps {
    course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'beginner':
                return 'bg-green-100 text-green-800';
            case 'intermediate':
                return 'bg-blue-100 text-blue-800';
            case 'advanced':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getLevelLabel = (level: string) => {
        switch (level) {
            case 'beginner':
                return '🌱 Cơ bản';
            case 'intermediate':
                return '📈 Trung bình';
            case 'advanced':
                return '🚀 Nâng cao';
            default:
                return level;
        }
    };

    const instructorName =
        typeof course.instructor === 'string' ? course.instructor : course.instructor?.fullName || 'Đang cập nhật';

    return (
        <Link to={`/courses/${course.slug}`}>
            <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 h-full transform hover:scale-105 cursor-pointer border border-gray-100">
                <div className="relative bg-gradient-to-br from-blue-400 to-purple-500 h-48 overflow-hidden">
                    <img
                        src={course.thumbnailUrl || 'https://via.placeholder.com/400x300'}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    <div className="absolute top-3 right-3">
                        <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${getLevelColor(course.level || '')}`}
                        >
                            {getLevelLabel(course.level || '')}
                        </span>
                    </div>

                    <CourseRatingBadge courseId={course.courseId} />
                </div>

                <div className="p-4">
                    <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1">
                        👤 {instructorName}
                    </p>

                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                        <span className="flex items-center gap-1">📚 {course.totalLessons || 0} bài</span>
                        <span className="flex items-center gap-1">
                            ⏱ {Math.floor((course.totalDuration || 0) / 3600)}h
                        </span>
                    </div>

                    <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all group-hover:scale-105">
                        Xem khóa học →
                    </button>
                </div>
            </div>
        </Link>
    );
};
