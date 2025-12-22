import { Plus, Edit2 } from 'lucide-react';

interface QuestionListProps {
  questions: any[];
  onAdd: () => void;
  onEdit: (q: any) => void;
}

export const QuestionList = ({
  questions,
  onAdd,
  onEdit,
}: QuestionListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Danh sách câu hỏi</h2>
        <button onClick={onAdd} className="btn-primary flex gap-2">
          <Plus size={16} /> Thêm câu hỏi
        </button>
      </div>

      {questions.length === 0 && (
        <p className="text-gray-500 text-sm">Chưa có câu hỏi nào</p>
      )}

      {questions.map((q, idx) => (
        <div
          key={q.questionId}
          className="p-4 bg-white border rounded-lg flex justify-between"
        >
          <div>
            <p className="font-medium">
              {idx + 1}. {q.content}
            </p>
            <p className="text-xs text-gray-400">
              {q.questionType}
            </p>
          </div>

          <button onClick={() => onEdit(q)}>
            <Edit2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

