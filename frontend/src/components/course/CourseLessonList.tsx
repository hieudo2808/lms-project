import { Link } from 'react-router-dom';
import type { CourseDetail } from '../../types';

interface CourseLessonListProps {
  course: CourseDetail;
}

export const CourseLessonList = ({ course }: CourseLessonListProps) => {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        📚 Danh sách bài học ({course.lessons.length})
      </h2>
      <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
        {course.lessons.map((lesson, index) => {
          const minutes = Math.round(lesson.durationSeconds / 60);
          return (
            <Link
              key={lesson.id}
              to={`/courses/${course.slug}/lesson/${lesson.id}`}
            >
              <div className="border-b last:border-b-0 border-gray-200 p-4 hover:bg-blue-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {lesson.content}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-medium text-gray-600">
                      ⏱ {minutes}m
                    </p>
                    <p className="text-xs text-gray-500 mt-1">▶ Xem</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
