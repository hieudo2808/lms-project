import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { FileText, Upload, Trash2, X, Download } from 'lucide-react';
import { GET_LESSON_RESOURCES } from '../../graphql/queries/resource';
import {
    GENERATE_RESOURCE_UPLOAD_URL,
    CONFIRM_RESOURCE_UPLOAD,
    DELETE_LESSON_RESOURCE,
} from '../../graphql/mutations/resource';

interface ResourceUploaderProps {
    lessonId: string;
    onClose?: () => void;
}

export const ResourceUploader = ({ lessonId, onClose }: ResourceUploaderProps) => {
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data, refetch } = useQuery(GET_LESSON_RESOURCES, {
        variables: { lessonId },
    });

    const resources = data?.getLessonResources || [];

    const [generateUploadUrl] = useMutation(GENERATE_RESOURCE_UPLOAD_URL);
    const [confirmUpload] = useMutation(CONFIRM_RESOURCE_UPLOAD);
    const [deleteResource] = useMutation(DELETE_LESSON_RESOURCE);

    const getResourceType = (fileName: string): string => {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        if (['pdf'].includes(ext)) return 'pdf';
        if (['doc', 'docx'].includes(ext)) return 'doc';
        if (['xls', 'xlsx'].includes(ext)) return 'excel';
        if (['ppt', 'pptx'].includes(ext)) return 'ppt';
        if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
        return 'other';
    };

    const getContentType = (fileName: string): string => {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        const types: Record<string, string> = {
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ppt: 'application/vnd.ms-powerpoint',
            pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            zip: 'application/zip',
            rar: 'application/x-rar-compressed',
        };
        return types[ext] || 'application/octet-stream';
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                toast.error('File quá lớn! Tối đa 50MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            // 1. Get presigned URL
            const { data: urlData } = await generateUploadUrl({
                variables: {
                    lessonId,
                    fileName: selectedFile.name,
                    contentType: getContentType(selectedFile.name),
                },
            });

            const { uploadUrl, s3Key } = urlData.generateResourceUploadUrl;

            // 2. Upload to S3
            await fetch(uploadUrl, {
                method: 'PUT',
                body: selectedFile,
                headers: {
                    'Content-Type': getContentType(selectedFile.name),
                },
            });

            // 3. Confirm upload
            await confirmUpload({
                variables: {
                    lessonId,
                    s3Key,
                    fileName: selectedFile.name,
                    resourceType: getResourceType(selectedFile.name),
                    fileSize: selectedFile.size,
                },
            });

            toast.success('Upload thành công!');
            setSelectedFile(null);
            refetch();
        } catch (err: any) {
            toast.error('Lỗi upload: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (resourceId: string) => {
        if (!window.confirm('Xóa tài liệu này?')) return;

        try {
            await deleteResource({ variables: { resourceId } });
            toast.success('Đã xóa tài liệu');
            refetch();
        } catch (err: any) {
            toast.error('Lỗi: ' + err.message);
        }
    };

    return (
        <div className="bg-gray-50 border rounded-lg p-4 mt-3">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" />
                    Tài liệu bổ sung
                </h4>
                {onClose && (
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Upload Section */}
            <div className="mb-4">
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        id={`resource-upload-${lessonId}`}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                    />
                    <label
                        htmlFor={`resource-upload-${lessonId}`}
                        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                        <Upload size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                            {selectedFile ? selectedFile.name : 'Chọn file (PDF, DOC, ZIP...)'}
                        </span>
                    </label>
                    {selectedFile && (
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Đang upload...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} /> Upload
                                </>
                            )}
                        </button>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, RAR (max 50MB)
                </p>
            </div>

            {/* Resources List */}
            {resources.length > 0 && (
                <div className="space-y-2">
                    {resources.map((resource: any) => (
                        <div
                            key={resource.resourceId}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded">
                                    <FileText size={16} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{resource.fileName}</p>
                                    <p className="text-xs text-gray-500">
                                        {resource.resourceType?.toUpperCase()}
                                        {resource.fileSize && ` • ${(resource.fileSize / 1024 / 1024).toFixed(2)} MB`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {resource.downloadUrl && (
                                    <a
                                        href={resource.downloadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                        <Download size={16} />
                                    </a>
                                )}
                                <button
                                    onClick={() => handleDelete(resource.resourceId)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {resources.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Chưa có tài liệu nào</p>}
        </div>
    );
};
