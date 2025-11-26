import { Link } from 'react-router-dom';
import type { Lesson } from '../../types';
import { Button } from '../Button';

interface LessonSidebarProps {
  courseTitle: string;
  lessons: Lesson[];
  currentLessonId: string;
  courseSlug: string;
}

export const LessonSidebar = ({
  courseTitle,
  lessons,
  currentLessonId,
  courseSlug,
}: LessonSidebarProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
      <h3 className="font-bold text-lg text-gray-800 mb-4">
        {courseTitle}
      </h3>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {lessons.map((lesson, index) => {
          const minutes = Math.round(lesson.durationSeconds / 60);
          return (
            <Link
              key={lesson.id}
              to={`/courses/${courseSlug}/lesson/${lesson.id}`}
            >
              <div
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  lesson.id === currentLessonId
                    ? 'bg-blue-100 border border-blue-500'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-gray-400 mt-1">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 line-clamp-2">
                      {lesson.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      ⏱ {minutes} phút
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Link to={`/courses/${courseSlug}`}>
        <Button variant="secondary" className="w-full mt-4">
          Quay lại khóa học
        </Button>
      </Link>
    </div>
  );
};
