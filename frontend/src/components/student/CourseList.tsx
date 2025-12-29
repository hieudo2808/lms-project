import { Link } from 'react-router-dom';
import type { Course } from '../../types';
import { CourseRating } from './CourseRating';
import { UserAvatar } from '../common/UserAvatar';

interface CourseListProps {
    courses: Course[];
    isLoading: boolean;
}

export const CourseList = ({ courses, isLoading }: CourseListProps) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm h-80 animate-pulse">
                        <div className="h-40 bg-gray-200 rounded-t-lg" />
                        <div className="p-4 space-y-3">
                            <div className="h-6 bg-gray-200 rounded w-3/4" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Chưa tìm thấy khóa học nào phù hợp.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
                <Link
                    key={course.id}
                    to={`/courses/${course.slug}`}
                    className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-1"
                >
                    <div className="aspect-video relative overflow-hidden">
                        <img
                            src={course.thumbnailUrl || 'https://via.placeholder.com/400x225'}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-blue-600">
                            {course.level}
                        </div>
                    </div>

                    <div className="p-5">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {course.title}
                        </h3>

                        {course.instructor && (
                            <div className="flex items-center gap-2 mb-3">
                                <UserAvatar
                                    avatarUrl={course.instructor.avatarUrl}
                                    fullName={course.instructor.fullName}
                                    size="sm"
                                />
                                <span className="text-sm text-gray-500 truncate">{course.instructor.fullName}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                            <CourseRating courseId={course.courseId} />
                            <div className="font-bold text-blue-600">
                                {course.price === 0 || !course.price
                                    ? 'Miễn phí'
                                    : `${course.price?.toLocaleString()} đ`}
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};
