import { useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import { GENERATE_IMAGE_UPLOAD_URL } from '../../graphql/mutations/image';

interface AvatarUploaderProps {
    currentUrl?: string;
    onUploadComplete: (url: string) => void;
    size?: 'sm' | 'md' | 'lg';
}

export const AvatarUploader = ({ currentUrl, onUploadComplete, size = 'md' }: AvatarUploaderProps) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [generateUploadUrl] = useMutation(GENERATE_IMAGE_UPLOAD_URL);

    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ảnh quá lớn! Tối đa 5MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        await handleUpload(file);
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            // 1. Get presigned URL
            const { data } = await generateUploadUrl({
                variables: {
                    fileName: file.name,
                    contentType: file.type,
                },
            });

            const { uploadUrl, publicUrl } = data.generateImageUploadUrl;

            const response = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            // 3. Notify parent with public URL
            onUploadComplete(publicUrl);
            toast.success('Tải ảnh thành công!');
        } catch (err: any) {
            toast.error('Lỗi tải ảnh: ' + (err.message || 'Unknown error'));
            setPreviewUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleClearPreview = () => {
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const displayUrl = previewUrl || currentUrl;

    return (
        <div className="flex items-center gap-4">
            {/* Avatar Display */}
            <div className="relative">
                <div
                    className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center`}
                >
                    {displayUrl ? (
                        <img src={displayUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                    )}

                    {/* Loading overlay */}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                            <Loader2 className="w-6 h-6 animate-spin text-white" />
                        </div>
                    )}
                </div>

                {/* Clear button */}
                {previewUrl && !uploading && (
                    <button
                        onClick={handleClearPreview}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            {/* Upload Button */}
            <div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                <button
                    onClick={handleClick}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                    <Upload size={16} />
                    <span className="text-sm font-medium">{uploading ? 'Đang tải...' : 'Tải ảnh lên'}</span>
                </button>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF. Tối đa 5MB</p>
            </div>
        </div>
    );
};
