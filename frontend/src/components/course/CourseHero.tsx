import type { CourseDetail } from '../../types';

interface CourseHeroProps {
  course: CourseDetail;
  totalHours: number;
}

export const CourseHero = ({ course, totalHours }: CourseHeroProps) => {
  return (
    <div className="relative w-full h-96 overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
      <img
        src={course.thumbnailUrl}
        alt={course.title}
        className="w-full h-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

      <div className="absolute bottom-0 left-0 right-0 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-block mb-4">
            <span className="text-sm font-bold px-3 py-1 bg-yellow-500 text-black rounded-full">
              ⭐ {course.rating.toFixed(1)} · {course.enrolledCount}+ học viên
            </span>
          </div>
          <h1 className="text-5xl font-bold mb-4">{course.title}</h1>
          <p className="text-lg text-gray-200 mb-4">
            Gồm {course.lessonsCount} bài học · {totalHours} giờ
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white">
              <span className="text-2xl">👤</span>
              <div>
                <p className="font-semibold">{course.instructorName}</p>
                <p className="text-sm text-gray-300">Giáo viên</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
