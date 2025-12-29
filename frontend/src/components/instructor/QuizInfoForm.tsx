import { useState, useEffect } from 'react';

interface QuizInfoFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    submitLabel?: string;
    submitButtonId?: string;
}

export const QuizInfoForm = ({
    initialData,
    onSubmit,
    submitLabel = 'Tạo quiz',
    submitButtonId,
}: QuizInfoFormProps) => {
    const [form, setForm] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        timeLimit: initialData?.timeLimit || 30,
        passingScore: initialData?.passingScore || 70,
        maxAttempts: initialData?.maxAttempts || 3,
        isPublished: initialData?.isPublished || false,
    });

    const handleSubmit = () => {
        if (!form.title.trim()) {
            alert('Vui lòng nhập tiêu đề bài kiểm tra');
            return;
        }
        if (form.timeLimit <= 0 || form.passingScore <= 0) {
            alert('Thời gian và điểm đạt phải lớn hơn 0');
            return;
        }
        onSubmit(form);
    };

    return (
        <div className="space-y-5 bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề bài kiểm tra <span className="text-red-500">*</span>
                </label>
                <input
                    placeholder="VD: Kiểm tra kiến thức Chương 1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả / Hướng dẫn</label>
                <textarea
                    placeholder="Nhập mô tả hoặc hướng dẫn làm bài..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (phút)</label>
                    <input
                        type="number"
                        min="1"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.timeLimit}
                        onChange={(e) => setForm({ ...form, timeLimit: parseInt(e.target.value) || 0 })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điểm đạt (%)</label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.passingScore}
                        onChange={(e) => setForm({ ...form, passingScore: parseInt(e.target.value) || 0 })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lần thi tối đa</label>
                    <input
                        type="number"
                        min="1"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="VD: 3"
                        value={form.maxAttempts}
                        onChange={(e) => setForm({ ...form, maxAttempts: parseInt(e.target.value) || 0 })}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div>
                    <label className="font-semibold text-gray-800">Xuất bản bài kiểm tra</label>
                    <p className="text-sm text-gray-600 mt-1">
                        Nếu bật, sinh viên sẽ nhìn thấy và có thể làm bài kiểm tra này.
                    </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={form.isPublished}
                        onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    />
                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>

            <div className="flex justify-end pt-2 border-t mt-4">
                <button
                    id={submitButtonId}
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all shadow-sm"
                    onClick={handleSubmit}
                >
                    {submitLabel}
                </button>
            </div>
        </div>
    );
};
