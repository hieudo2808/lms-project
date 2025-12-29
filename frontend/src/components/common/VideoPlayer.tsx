import { useEffect, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Loader2, AlertCircle } from 'lucide-react';

const GET_VIDEO_STREAM_URL = gql`
    query GetVideoStreamUrl($lessonId: UUID!) {
        getVideoStreamUrl(lessonId: $lessonId)
    }
`;

interface VideoPlayerProps {
    videoUrl: string;
    title: string;
    duration?: number;
    onWatchedUpdate?: (watchedSeconds: number, totalDuration: number) => void;
}

export const VideoPlayer = ({ videoUrl, title, duration, onWatchedUpdate }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [actualUrl, setActualUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const lastTimeRef = useRef<number>(0);
    const accumulatedSecondsRef = useRef<number>(0);

    const [getStreamUrl, { data: streamData, error: streamError }] = useLazyQuery(GET_VIDEO_STREAM_URL, {
        fetchPolicy: 'network-only',
    });

    useEffect(() => {
        if (streamData?.getVideoStreamUrl) {
            setActualUrl(streamData.getVideoStreamUrl);
            setIsLoading(false);
        }
    }, [streamData]);

    useEffect(() => {
        if (streamError) {
            setError(streamError.message);
            setIsLoading(false);
        }
    }, [streamError]);

    useEffect(() => {
        if (videoUrl && videoUrl.startsWith('stream:')) {
            const lessonId = videoUrl.replace('stream:', '');
            setIsLoading(true);
            setError(null);
            getStreamUrl({ variables: { lessonId } });
        } else if (videoUrl) {
            setActualUrl(videoUrl);
        }
    }, [videoUrl, getStreamUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !actualUrl) return;

        const handleTimeUpdate = () => {
            const currentTime = video.currentTime;
            const totalDuration = video.duration || 0;

            const timeDelta = currentTime - lastTimeRef.current;
            if (timeDelta > 0 && timeDelta < 2) {
                accumulatedSecondsRef.current += timeDelta;
            }
            lastTimeRef.current = currentTime;

            if (onWatchedUpdate && totalDuration > 0) {
                onWatchedUpdate(Math.round(accumulatedSecondsRef.current), totalDuration);
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, [onWatchedUpdate, actualUrl]);

    if (isLoading) {
        return (
            <div className="w-full bg-black rounded-lg overflow-hidden">
                <div className="aspect-video flex items-center justify-center bg-gray-900">
                    <div className="text-white text-center">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                        <p>Đang tải video...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full bg-black rounded-lg overflow-hidden">
                <div className="aspect-video flex items-center justify-center bg-gray-900">
                    <div className="text-red-400 text-center">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                        <p>Không thể tải video</p>
                        <p className="text-sm text-gray-500 mt-2">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!actualUrl) {
        return (
            <div className="w-full bg-black rounded-lg overflow-hidden">
                <div className="aspect-video flex items-center justify-center bg-gray-900">
                    <div className="text-gray-400 text-center">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                        <p>Video chưa được tải lên</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-black rounded-lg overflow-hidden">
            <div className="aspect-video flex items-center justify-center bg-gray-900">
                <video ref={videoRef} controls className="w-full h-full" style={{ maxHeight: '100%' }}>
                    <source src={actualUrl} type="video/mp4" />
                    Trình duyệt của bạn không hỗ trợ video HTML5
                </video>
            </div>
            <div className="p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800">{title}</h3>
                {duration && <p className="text-sm text-gray-500">⏱ {duration} phút</p>}
            </div>
        </div>
    );
};
