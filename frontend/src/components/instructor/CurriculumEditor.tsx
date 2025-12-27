import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';

import {
    Plus,
    Edit2,
    Trash2,
    ChevronDown,
    ChevronRight,
    FileVideo,
    GripVertical,
    X,
    Save,
    Paperclip,
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import Mutations
import {
    CREATE_MODULE_MUTATION,
    UPDATE_MODULE_MUTATION,
    DELETE_MODULE_MUTATION,
    REORDER_MODULES_MUTATION,
    CREATE_LESSON_MUTATION,
    UPDATE_LESSON_MUTATION,
    DELETE_LESSON_MUTATION,
    REORDER_LESSONS_MUTATION,
} from '../../graphql/mutations/instructor';

import { VideoUploader } from './VideoUploader';
import { ResourceUploader } from './ResourceUploader';

// === TYPES ===
interface Lesson {
    lessonId: string;
    title: string;
    order: number;
    videoUrl?: string | null;
    durationSeconds?: number;
}

interface Module {
    moduleId: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

interface CurriculumEditorProps {
    courseId: string;
    modules: Module[];
    refetch: () => void;
}

const CurriculumEditor: React.FC<CurriculumEditorProps> = ({ courseId, modules, refetch }) => {
    // State quản lý danh sách local để kéo thả mượt mà (Optimistic UI)
    const navigate = useNavigate();
    const [localModules, setLocalModules] = useState<Module[]>([]);

    // Sync props với state local khi dữ liệu từ server thay đổi
    useEffect(() => {
        // Sắp xếp dữ liệu đầu vào cho chuẩn
        const sortedModules = [...modules]
            .sort((a, b) => a.order - b.order)
            .map((m) => ({
                ...m,
                lessons: [...(m.lessons || [])].sort((a, b) => a.order - b.order),
            }));
        setLocalModules(sortedModules);
    }, [modules]);

    // State UI
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
    const [editModuleTitle, setEditModuleTitle] = useState('');
    const [addingLessonToModuleId, setAddingLessonToModuleId] = useState<string | null>(null);
    const [newLessonTitle, setNewLessonTitle] = useState('');
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
    const [uploadingLessonId, setUploadingLessonId] = useState<string | null>(null);
    const [resourceLessonId, setResourceLessonId] = useState<string | null>(null);

    // === MUTATIONS ===
    const [createModule] = useMutation(CREATE_MODULE_MUTATION);
    const [updateModule] = useMutation(UPDATE_MODULE_MUTATION);
    const [deleteModule] = useMutation(DELETE_MODULE_MUTATION);
    const [reorderModules] = useMutation(REORDER_MODULES_MUTATION);

    const [createLesson] = useMutation(CREATE_LESSON_MUTATION);
    const [deleteLesson] = useMutation(DELETE_LESSON_MUTATION);
    const [reorderLessons] = useMutation(REORDER_LESSONS_MUTATION);

    // === HANDLERS ===
    const toggleModule = (moduleId: string) => {
        setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    // --- DRAG & DROP HANDLER (Logic quan trọng nhất) ---
    const onDragEnd = async (result: DropResult) => {
        const { source, destination, type } = result;
        if (!destination) return; // Kéo ra ngoài thì hủy

        // 1. KÉO THẢ MODULE
        if (type === 'MODULE') {
            const items = Array.from(localModules);
            const [reorderedItem] = items.splice(source.index, 1);
            items.splice(destination.index, 0, reorderedItem);

            setLocalModules(items); // Cập nhật giao diện ngay lập tức

            // Gọi API cập nhật backend
            try {
                await reorderModules({
                    variables: {
                        courseId,
                        moduleIds: items.map((m) => m.moduleId),
                    },
                });
            } catch (err) {
                toast.error('Lỗi sắp xếp chương');
                refetch(); // Hoàn tác nếu lỗi
            }
        }

        // 2. KÉO THẢ LESSON
        if (type === 'LESSON') {
            const sourceModuleId = source.droppableId;
            const destModuleId = destination.droppableId;

            // Chỉ hỗ trợ sắp xếp trong cùng 1 module (để đơn giản logic)
            if (sourceModuleId === destModuleId) {
                const moduleIndex = localModules.findIndex((m) => m.moduleId === sourceModuleId);
                const updatedModule = { ...localModules[moduleIndex] };
                const updatedLessons = Array.from(updatedModule.lessons);

                const [reorderedItem] = updatedLessons.splice(source.index, 1);
                updatedLessons.splice(destination.index, 0, reorderedItem);

                updatedModule.lessons = updatedLessons;

                const newLocalModules = [...localModules];
                newLocalModules[moduleIndex] = updatedModule;
                setLocalModules(newLocalModules);

                // Gọi API
                try {
                    await reorderLessons({
                        variables: {
                            moduleId: sourceModuleId,
                            lessonIds: updatedLessons.map((l) => l.lessonId),
                        },
                    });
                } catch (err) {
                    toast.error('Lỗi sắp xếp bài học');
                    refetch();
                }
            } else {
                toast.warning('Chỉ hỗ trợ sắp xếp bài học trong cùng một chương.');
            }
        }
    };

    // --- CRUD FUNCTIONS ---
    const handleCreateModule = async () => {
        if (!newModuleTitle.trim()) return;
        try {
            const nextOrder = localModules.length > 0 ? Math.max(...localModules.map((m) => m.order)) + 1 : 1;
            await createModule({ variables: { input: { courseId, title: newModuleTitle, order: nextOrder } } });
            toast.success('Thêm chương thành công!');
            setNewModuleTitle('');
            setIsAddingModule(false);
            refetch();
        } catch (error: any) {
            toast.error('Lỗi: ' + error.message);
        }
    };

    const handleUpdateModule = async (moduleId: string) => {
        if (!editModuleTitle.trim()) return;
        try {
            await updateModule({ variables: { moduleId, input: { title: editModuleTitle } } });
            toast.success('Cập nhật thành công!');
            setEditingModuleId(null);
            refetch();
        } catch (error: any) {
            toast.error('Lỗi: ' + error.message);
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!window.confirm('Xóa chương này sẽ mất hết bài học. Tiếp tục?')) return;
        try {
            await deleteModule({ variables: { moduleId } });
            toast.success('Đã xóa chương.');
            refetch();
        } catch (error: any) {
            toast.error('Lỗi: ' + error.message);
        }
    };

    const handleCreateLesson = async (moduleId: string, currentLessons: Lesson[]) => {
        if (!newLessonTitle.trim()) return;
        try {
            const nextOrder = currentLessons.length > 0 ? Math.max(...currentLessons.map((l) => l.order)) + 1 : 1;
            await createLesson({
                variables: { input: { moduleId, title: newLessonTitle, order: nextOrder, content: '', videoUrl: '' } },
            });
            toast.success('Thêm bài học thành công!');
            setNewLessonTitle('');
            setAddingLessonToModuleId(null);
            setExpandedModules((prev) => ({ ...prev, [moduleId]: true }));
            refetch();
        } catch (error: any) {
            toast.error('Lỗi: ' + error.message);
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!window.confirm('Xóa bài học này?')) return;
        try {
            await deleteLesson({ variables: { lessonId } });
            toast.success('Đã xóa bài học.');
            refetch();
        } catch (error: any) {
            toast.error('Lỗi: ' + error.message);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mt-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Nội dung khóa học</h2>
                <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                    <GripVertical className="w-3 h-3 sm:w-4 sm:h-4" /> Kéo thả để sắp xếp vị trí
                </span>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="all-modules" type="MODULE">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                            {/* LIST MODULES */}
                            {localModules.map((module, index) => (
                                <Draggable key={module.moduleId} draggableId={module.moduleId} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden"
                                        >
                                            {/* MODULE HEADER */}
                                            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-100 hover:bg-gray-200 group">
                                                {editingModuleId === module.moduleId ? (
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <input
                                                            className="flex-1 px-2 py-1 border rounded text-sm"
                                                            value={editModuleTitle}
                                                            onChange={(e) => setEditModuleTitle(e.target.value)}
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => handleUpdateModule(module.moduleId)}
                                                            className="text-green-600 flex-shrink-0 p-1.5 hover:bg-green-50 rounded"
                                                        >
                                                            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingModuleId(null)}
                                                            className="text-gray-500 flex-shrink-0 p-1.5 hover:bg-gray-200 rounded"
                                                        >
                                                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="flex items-center gap-2 sm:gap-3 flex-1 cursor-pointer min-w-0"
                                                        onClick={() => toggleModule(module.moduleId)}
                                                    >
                                                        {/* Drag Handle cho Module */}
                                                        <div {...provided.dragHandleProps} className="flex-shrink-0">
                                                            <GripVertical
                                                                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600"
                                                            />
                                                        </div>
                                                        <button className="text-gray-500 flex-shrink-0">
                                                            {expandedModules[module.moduleId] ? (
                                                                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                                                            ) : (
                                                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                                            )}
                                                        </button>
                                                        <div className="font-bold text-gray-800 text-sm sm:text-base truncate">
                                                            Chương {index + 1}: {module.title}
                                                        </div>
                                                    </div>
                                                )}

                                                {editingModuleId !== module.moduleId && (
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setEditingModuleId(module.moduleId);
                                                                setEditModuleTitle(module.title);
                                                            }}
                                                            className="text-blue-500 p-2 hover:bg-blue-50 rounded-full"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteModule(module.moduleId)}
                                                            className="text-red-500 p-2 hover:bg-red-50 rounded-full"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* MODULE CONTENT (LESSONS) */}
                                            {expandedModules[module.moduleId] && (
                                                <div className="p-4 bg-white border-t border-gray-200 space-y-2">
                                                    <Droppable droppableId={module.moduleId} type="LESSON">
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.droppableProps}
                                                                className="space-y-2"
                                                            >
                                                                {module.lessons.map((lesson, lessonIndex) => (
                                                                    <Draggable
                                                                        key={lesson.lessonId}
                                                                        draggableId={lesson.lessonId}
                                                                        index={lessonIndex}
                                                                    >
                                                                        {(provided) => (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                className="border border-gray-100 rounded-lg p-2 sm:p-3 hover:border-blue-200 group/lesson bg-white"
                                                                            >
                                                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                                                                        {/* Drag Handle cho Lesson */}
                                                                                        <div
                                                                                            {...provided.dragHandleProps}
                                                                                            className="flex-shrink-0"
                                                                                        >
                                                                                            <GripVertical
                                                                                                className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600"
                                                                                            />
                                                                                        </div>
                                                                                        <div
                                                                                            className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                                                                                                lesson.videoUrl
                                                                                                    ? 'bg-green-100 text-green-600'
                                                                                                    : 'bg-gray-100 text-gray-500'
                                                                                            }`}
                                                                                        >
                                                                                            <FileVideo className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                                        </div>
                                                                                        <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                                                                                            {lesson.title}
                                                                                        </span>
                                                                                        {lesson.durationSeconds ? (
                                                                                            <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                                                                                                (
                                                                                                {Math.floor(
                                                                                                    lesson.durationSeconds /
                                                                                                        60,
                                                                                                )}
                                                                                                m{' '}
                                                                                                {lesson.durationSeconds %
                                                                                                    60}
                                                                                                s)
                                                                                            </span>
                                                                                        ) : null}
                                                                                    </div>
                                                                                    <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
                                                                                        {/* VIDEO BUTTON */}
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                setResourceLessonId(
                                                                                                    null,
                                                                                                ); // Close resources panel
                                                                                                setUploadingLessonId(
                                                                                                    uploadingLessonId ===
                                                                                                        lesson.lessonId
                                                                                                        ? null
                                                                                                        : lesson.lessonId,
                                                                                                );
                                                                                            }}
                                                                                            className="text-[10px] sm:text-xs font-medium text-blue-600 hover:underline flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded hover:bg-blue-50 whitespace-nowrap"
                                                                                        >
                                                                                            {uploadingLessonId ===
                                                                                            lesson.lessonId ? (
                                                                                                <>
                                                                                                    <X className="w-3 h-3" /> <span className="hidden xs:inline">Đóng</span>
                                                                                                </>
                                                                                            ) : (
                                                                                                <>
                                                                                                    {lesson.videoUrl
                                                                                                        ? 'Đổi'
                                                                                                        : 'Video'}
                                                                                                </>
                                                                                            )}
                                                                                        </button>

                                                                                        {/* QUIZ BUTTON 🔥 */}
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                navigate(
                                                                                                    `/instructor/lessons/${lesson.lessonId}/quizzes/create`,
                                                                                                    {
                                                                                                        state: {
                                                                                                            courseId:
                                                                                                                courseId,
                                                                                                        },
                                                                                                    },
                                                                                                )
                                                                                            }
                                                                                            className="text-[10px] sm:text-xs font-medium text-purple-600 hover:underline flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded hover:bg-purple-50 whitespace-nowrap"
                                                                                        >
                                                                                            🧠 <span className="hidden xs:inline">Quiz</span>
                                                                                        </button>

                                                                                        {/* RESOURCES BUTTON */}
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                setUploadingLessonId(
                                                                                                    null,
                                                                                                ); // Close video panel
                                                                                                setResourceLessonId(
                                                                                                    resourceLessonId ===
                                                                                                        lesson.lessonId
                                                                                                        ? null
                                                                                                        : lesson.lessonId,
                                                                                                );
                                                                                            }}
                                                                                            className="text-[10px] sm:text-xs font-medium text-green-600 hover:underline flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded hover:bg-green-50 whitespace-nowrap"
                                                                                        >
                                                                                            <Paperclip className="w-3 h-3" />
                                                                                            <span className="hidden xs:inline">{resourceLessonId ===
                                                                                            lesson.lessonId
                                                                                                ? 'Đóng'
                                                                                                : 'TL'}</span>
                                                                                        </button>

                                                                                        {/* DELETE */}
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                handleDeleteLesson(
                                                                                                    lesson.lessonId,
                                                                                                )
                                                                                            }
                                                                                            className="sm:opacity-0 sm:group-hover/lesson:opacity-100 text-red-400 hover:text-red-600 p-1 flex-shrink-0"
                                                                                        >
                                                                                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                                {/* VIDEO UPLOADER */}
                                                                                {uploadingLessonId ===
                                                                                    lesson.lessonId && (
                                                                                    <div className="mt-4 pl-10 border-t pt-4">
                                                                                        <VideoUploader
                                                                                            lessonId={lesson.lessonId}
                                                                                            onUploadComplete={(
                                                                                                newVideoUrl,
                                                                                            ) => {
                                                                                                // 1. Đóng form upload
                                                                                                setUploadingLessonId(
                                                                                                    null,
                                                                                                );

                                                                                                // 2. Cập nhật ngay lập tức vào localModules (Optimistic UI)
                                                                                                if (newVideoUrl) {
                                                                                                    setLocalModules(
                                                                                                        (prevModules) =>
                                                                                                            prevModules.map(
                                                                                                                (m) => {
                                                                                                                    if (
                                                                                                                        m.moduleId !==
                                                                                                                        module.moduleId
                                                                                                                    )
                                                                                                                        return m;
                                                                                                                    return {
                                                                                                                        ...m,
                                                                                                                        lessons:
                                                                                                                            m.lessons.map(
                                                                                                                                (
                                                                                                                                    l,
                                                                                                                                ) => {
                                                                                                                                    if (
                                                                                                                                        l.lessonId !==
                                                                                                                                        lesson.lessonId
                                                                                                                                    )
                                                                                                                                        return l;
                                                                                                                                    return {
                                                                                                                                        ...l,
                                                                                                                                        videoUrl:
                                                                                                                                            newVideoUrl,
                                                                                                                                    };
                                                                                                                                },
                                                                                                                            ),
                                                                                                                    };
                                                                                                                },
                                                                                                            ),
                                                                                                    );
                                                                                                }

                                                                                                // 3. Refetch để đồng bộ dữ liệu thật từ server
                                                                                                refetch();
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                )}

                                                                                {/* RESOURCE UPLOADER */}
                                                                                {resourceLessonId ===
                                                                                    lesson.lessonId && (
                                                                                    <div className="mt-4 pl-10">
                                                                                        <ResourceUploader
                                                                                            lessonId={lesson.lessonId}
                                                                                            onClose={() =>
                                                                                                setResourceLessonId(
                                                                                                    null,
                                                                                                )
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                                {provided.placeholder}
                                                            </div>
                                                        )}
                                                    </Droppable>

                                                    {/* ADD LESSON FORM */}
                                                    {addingLessonToModuleId === module.moduleId ? (
                                                        <div className="ml-10 flex gap-2 items-center mt-3 animate-in fade-in">
                                                            <input
                                                                autoFocus
                                                                className="flex-1 border border-blue-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                                                placeholder="Tên bài học..."
                                                                value={newLessonTitle}
                                                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                                                onKeyDown={(e) =>
                                                                    e.key === 'Enter' &&
                                                                    handleCreateLesson(module.moduleId, module.lessons)
                                                                }
                                                            />
                                                            <button
                                                                onClick={() =>
                                                                    handleCreateLesson(module.moduleId, module.lessons)
                                                                }
                                                                className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                                                            >
                                                                Thêm
                                                            </button>
                                                            <button
                                                                onClick={() => setAddingLessonToModuleId(null)}
                                                                className="text-gray-500 px-3 py-2 text-sm hover:bg-gray-100"
                                                            >
                                                                Hủy
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setAddingLessonToModuleId(module.moduleId);
                                                                setNewLessonTitle('');
                                                            }}
                                                            className="ml-10 text-sm text-blue-600 font-medium flex items-center gap-2 hover:bg-blue-50 p-2 rounded w-fit mt-2 transition-colors"
                                                        >
                                                            <Plus size={16} /> Thêm bài học
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* ADD MODULE BUTTON */}
            {!isAddingModule && (
                <button
                    onClick={() => setIsAddingModule(true)}
                    className="w-full mt-4 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-bold hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 transition-all hover:shadow-sm"
                >
                    <Plus size={20} /> Thêm chương mới
                </button>
            )}

            {/* ADD MODULE FORM */}
            {isAddingModule && (
                <div className="mt-4 border-2 border-dashed border-blue-300 bg-blue-50 p-4 rounded-xl flex gap-3 animate-in fade-in">
                    <input
                        autoFocus
                        className="flex-1 border border-blue-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tên chương mới..."
                        value={newModuleTitle}
                        onChange={(e) => setNewModuleTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateModule()}
                    />
                    <button
                        onClick={handleCreateModule}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
                    >
                        Lưu
                    </button>
                    <button
                        onClick={() => setIsAddingModule(false)}
                        className="bg-white border text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                </div>
            )}
        </div>
    );
};

export default CurriculumEditor;
