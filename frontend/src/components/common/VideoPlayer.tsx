import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  duration: number;
  onProgress?: (currentTime: number, totalDuration: number) => void;
}

export const VideoPlayer = ({ videoUrl, title, duration, onProgress }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (onProgress) {
        onProgress(video.currentTime, duration * 60); // Convert minutes to seconds
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [duration, onProgress]);

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
        <p className="text-sm text-gray-500">⏱ {duration} phút</p>
      </div>
    </div>
  );
};