import React, { useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertCircle, Loader2, FileVideo, X, MousePointerClick } from 'lucide-react';
import { toast } from 'react-toastify';

import { GENERATE_UPLOAD_URL_MUTATION, CONFIRM_UPLOAD_MUTATION } from '../../graphql/mutations/video';

interface VideoUploaderProps {
    lessonId: string;
    onUploadComplete: (videoUrl?: string) => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ lessonId, onUploadComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [videoDuration, setVideoDuration] = useState<number | null>(null);

    const [uploadProgress, setUploadProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [generateUrl] = useMutation(GENERATE_UPLOAD_URL_MUTATION);
    const [confirmUpload] = useMutation(CONFIRM_UPLOAD_MUTATION);

    const handleFileSelect = (selectedFile: File) => {
        if (!selectedFile.type.startsWith('video/')) {
            toast.error('Vui lòng chỉ chọn file Video (MP4, MOV,...)');
            return;
        }
        if (selectedFile.size > 2 * 1024 * 1024 * 1024) {
            toast.error('File quá lớn! Vui lòng chọn file dưới 2GB.');
            return;
        }

        setFile(selectedFile);
        setStatus('idle');
        setErrorMessage('');

        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            const duration = Math.round(video.duration);
            setVideoDuration(duration);
            console.log('Video duration extracted:', duration, 'seconds');
        };
        video.onerror = () => {
            console.warn('Could not extract video duration');
            setVideoDuration(null);
        };
        video.src = URL.createObjectURL(selectedFile);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setStatus('uploading');
            setUploadProgress(0);

            const { data: urlData } = await generateUrl({
                variables: {
                    input: {
                        lessonId: lessonId,
                        filename: file.name,
                        contentType: file.type,
                        fileSize: file.size,
                    },
                },
            });

            const { uploadUrl, videoId } = urlData.generateVideoUploadUrl;

            await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': file.type },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || file.size));
                    setUploadProgress(percent);
                },
            });

            setStatus('processing');
            await confirmUpload({
                variables: {
                    videoId,
                    durationSeconds: videoDuration,
                },
            });

            setStatus('success');
            toast.success('Upload video thành công!');

            setTimeout(() => {
                onUploadComplete('processing');
            }, 1500);
        } catch (error: any) {
            console.error('Upload error:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-green-50 border border-green-200 rounded-xl animate-in fade-in">
                <div className="bg-green-100 p-3 rounded-full mb-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-green-800 font-bold text-lg">Tải lên thành công!</h3>
                <p className="text-green-600 text-sm">Video đang được xử lý để hiển thị.</p>
            </div>
        );
    }

    if (status === 'processing') {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-blue-50 border border-blue-200 rounded-xl animate-pulse">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                <h3 className="text-blue-800 font-bold">Đang xử lý video...</h3>
                <p className="text-blue-600 text-sm">Vui lòng không tắt trình duyệt.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            
            {!file && (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                    border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all
                    ${
                        isDragging
                            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }
                `}
                >
                    <input
                        type="file"
                        accept="video}
            {file && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm animate-in slide-in-from-bottom-2">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <FileVideo className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p
                                    className="text-sm font-bold text-gray-800 line-clamp-1 max-w-[200px]"
                                    title={file.name}
                                >
                                    {file.name}
                                </p>
                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                        </div>

                        
                        {(status === 'idle' || status === 'error') && (
                            <button
                                onClick={() => setFile(null)}
                                className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    
                    {status === 'idle' && (
                        <button
                            onClick={handleUpload}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
                        >
                            <UploadCloud size={18} /> Tải lên ngay
                        </button>
                    )}

                    
                    {status === 'uploading' && (
                        <div>
                            <div className="flex justify-between text-xs text-blue-600 font-semibold mb-1">
                                <span>Đang tải lên...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    
                    {status === 'error' && (
                        <div className="mt-3 bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
