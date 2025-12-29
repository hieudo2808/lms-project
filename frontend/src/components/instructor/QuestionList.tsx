import { Plus, Edit2, Trash2 } from 'lucide-react';

interface QuestionListProps {
    questions: any[];
    onAdd: () => void;
    onEdit: (q: any) => void;
    onDelete: (questionId: string) => void;
}

export const QuestionList = ({ questions, onAdd, onEdit, onDelete }: QuestionListProps) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Danh sách câu hỏi</h2>
                <button
                    onClick={onAdd}
                    className="btn-primary flex gap-2 items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={16} /> Thêm câu hỏi
                </button>
            </div>

            {questions.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4 border border-dashed rounded-lg">
                    Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên!
                </p>
            )}

            {questions.map((q, idx) => (
                <div
                    key={q.questionId}
                    className="p-4 bg-white border rounded-lg flex justify-between items-start hover:border-blue-300 transition-all shadow-sm"
                >
                    <div>
                        <p className="font-medium text-gray-800">
                            <span className="font-bold mr-2">Câu {idx + 1}:</span>

                            {q.questionText}
                        </p>
                        <div className="flex gap-3 mt-1">
                            <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{q.questionType}</p>
                            <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{q.points} điểm</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(q)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Sửa câu hỏi"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button
                            onClick={() => onDelete(q.questionId)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Xóa câu hỏi"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
