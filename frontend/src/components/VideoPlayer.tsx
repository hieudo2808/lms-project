import { useEffect, useRef } from 'react';
import type { Progress } from '../types';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  durationSeconds: number;   
  lessonId: string;
  onProgress?: (progress: Progress) => void;
}

export const VideoPlayer = ({
  videoUrl,
  title,
  durationSeconds,
  lessonId,
  onProgress,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!onProgress) return;

      const watchedSeconds = video.currentTime;
      const totalSeconds = durationSeconds || video.duration || 1;
      const progressPercent = (watchedSeconds / totalSeconds) * 100;
      const completed = progressPercent >= 90;

      onProgress({
        lessonId,
        watchedSeconds,
        totalSeconds,
        progressPercent,
        completed,
        lastWatchedAt: new Date().toISOString(),
      });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [durationSeconds, lessonId, onProgress]);

  const minutes = Math.round(durationSeconds / 60);

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <div className="aspect-video flex items-center justify-center bg-gray-900">
        <video
          ref={videoRef}
          controls
          className="w-full h-full"
          style={{ maxHeight: '100%' }}
        >
          <source src={videoUrl} type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ video HTML5
        </video>
      </div>
      <div className="p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">⏱ {minutes} phút</p>
      </div>
    </div>
  );
};
