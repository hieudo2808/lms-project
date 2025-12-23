import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';

import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, FileVideo, GripVertical, X, Save } from 'lucide-react';
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Nội dung khóa học</h2>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                    <GripVertical size={14} /> Kéo thả để sắp xếp vị trí
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
                                            <div className="flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 group">
                                                {editingModuleId === module.moduleId ? (
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <input
                                                            className="flex-1 px-2 py-1 border rounded"
                                                            value={editModuleTitle}
                                                            onChange={(e) => setEditModuleTitle(e.target.value)}
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => handleUpdateModule(module.moduleId)}
                                                            className="text-green-600"
                                                        >
                                                            <Save size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingModuleId(null)}
                                                            className="text-gray-500"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="flex items-center gap-3 flex-1 cursor-pointer"
                                                        onClick={() => toggleModule(module.moduleId)}
                                                    >
                                                        {/* Drag Handle cho Module */}
                                                        <div {...provided.dragHandleProps}>
                                                            <GripVertical
                                                                size={20}
                                                                className="text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600"
                                                            />
                                                        </div>
                                                        <button className="text-gray-500">
                                                            {expandedModules[module.moduleId] ? (
                                                                <ChevronDown size={20} />
                                                            ) : (
                                                                <ChevronRight size={20} />
                                                            )}
                                                        </button>
                                                        <div className="font-bold text-gray-800">
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
                                                                                className="border border-gray-100 rounded-lg p-3 hover:border-blue-200 group/lesson bg-white"
                                                                            >
                                                                                <div className="flex items-center justify-between">
                                                                                    <div className="flex items-center gap-3">
                                                                                        {/* Drag Handle cho Lesson */}
                                                                                        <div
                                                                                            {...provided.dragHandleProps}
                                                                                        >
                                                                                            <GripVertical
                                                                                                size={16}
                                                                                                className="text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500"
                                                                                            />
                                                                                        </div>
                                                                                        <div
                                                                                            className={`p-2 rounded-full ${
                                                                                                lesson.videoUrl
                                                                                                    ? 'bg-green-100 text-green-600'
                                                                                                    : 'bg-gray-100 text-gray-500'
                                                                                            }`}
                                                                                        >
                                                                                            <FileVideo size={16} />
                                                                                        </div>
                                                                                        <span className="text-sm font-medium text-gray-700">
                                                                                            {lesson.title}
                                                                                        </span>
                                                                                        {lesson.durationSeconds ? (
                                                                                            <span className="text-xs text-gray-400">
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
                                                                                    <div className="flex gap-3 items-center">
                                                                                        {/* VIDEO BUTTON */}
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                setUploadingLessonId(
                                                                                                    uploadingLessonId ===
                                                                                                        lesson.lessonId
                                                                                                        ? null
                                                                                                        : lesson.lessonId,
                                                                                                )
                                                                                            }
                                                                                            className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50"
                                                                                        >
                                                                                            {uploadingLessonId ===
                                                                                            lesson.lessonId ? (
                                                                                                <>
                                                                                                    <X size={14} /> Đóng
                                                                                                </>
                                                                                            ) : (
                                                                                                <>
                                                                                                    {lesson.videoUrl
                                                                                                        ? 'Đổi Video'
                                                                                                        : 'Upload Video'}
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
                                                                                            className="text-xs font-medium text-purple-600 hover:underline flex items-center gap-1 px-2 py-1 rounded hover:bg-purple-50"
                                                                                        >
                                                                                            🧠 Tạo Quiz
                                                                                        </button>

                                                                                        {/* DELETE */}
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                handleDeleteLesson(
                                                                                                    lesson.lessonId,
                                                                                                )
                                                                                            }
                                                                                            className="opacity-0 group-hover/lesson:opacity-100 text-red-400 hover:text-red-600 p-1"
                                                                                        >
                                                                                            <Trash2 size={14} />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                                {/* VIDEO UPLOADER */}
                                                                                {uploadingLessonId ===
                                                                                    lesson.lessonId && (
                                                                                    <div className="mt-4 pl-10 border-t pt-4">
                                                                                        <VideoUploader
                                                                                            lessonId={lesson.lessonId}
                                                                                            onUploadComplete={() => {
                                                                                                setUploadingLessonId(
                                                                                                    null,
                                                                                                );
                                                                                                refetch();
                                                                                            }}
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
                    className="w-full mt-4 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 transition-all hover:shadow-sm"
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
