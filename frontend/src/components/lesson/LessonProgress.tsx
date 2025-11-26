import type { Progress } from '../../types';

interface LessonProgressProps {
  progress: Progress | null;
}

export const LessonProgress = ({ progress }: LessonProgressProps) => {
  if (!progress || progress.totalSeconds <= 0) return null;

  const percent = Math.round(
    (progress.watchedSeconds / progress.totalSeconds) * 100
  );

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-800">Tiến độ</span>
        <span className="text-sm text-gray-600">{percent}%</span>
      </div>
      <div className="w-full bg-gray-300 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};
