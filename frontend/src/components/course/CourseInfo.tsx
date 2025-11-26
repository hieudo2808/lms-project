import type { CourseDetail } from '../../types';

interface CourseInfoProps {
  course: CourseDetail;
  totalHours: number;
}

export const CourseInfo = ({ course, totalHours }: CourseInfoProps) => {
  return (
    <>
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Mô tả khóa học
        </h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {course.fullDescription}
        </p>
      </div>

      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-bold text-gray-900 mb-4">
          ℹ️ Thông tin khóa học
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Cấp độ</p>
            <p className="font-semibold text-gray-900">
              {course.level === 'beginner' && '🌱 Cơ bản'}
              {course.level === 'intermediate' && '📈 Trung bình'}
              {course.level === 'advanced' && '🚀 Nâng cao'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Thời lượng</p>
            <p className="font-semibold text-gray-900">{totalHours} giờ</p>
          </div>
        </div>
      </div>
    </>
  );
};
