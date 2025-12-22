import { useState } from 'react';

interface QuestionEditorProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const QuestionEditor = ({
  initialData,
  onSubmit,
  onCancel,
}: QuestionEditorProps) => {
  const [content, setContent] = useState(initialData?.content || '');
  const [type, setType] = useState(
    initialData?.type || 'SINGLE_CHOICE'
  );

  const [answers, setAnswers] = useState(
    initialData?.answers || [
      { content: '', isCorrect: false },
    ]
  );

  const addAnswer = () => {
    setAnswers([...answers, { content: '', isCorrect: false }]);
  };

  const updateAnswer = (idx: number, field: string, value: any) => {
    const copy = [...answers];
    copy[idx][field] = value;
    setAnswers(copy);
  };

  const submit = () => {
    if (!content.trim()) {
      alert('Câu hỏi không được trống');
      return;
    }

    if (!answers.some((a: any) => a.isCorrect)) {
      alert('Phải có ít nhất 1 đáp án đúng');
      return;
    }

    onSubmit({
      content,
      type,
      answers,
    });
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-xl border">
      <h3 className="font-bold">
        {initialData ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}
      </h3>

      <textarea
        className="input"
        placeholder="Nội dung câu hỏi"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <select
        className="input"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="SINGLE_CHOICE">Một đáp án</option>
        <option value="MULTIPLE_CHOICE">Nhiều đáp án</option>
      </select>

      <div className="space-y-2">
        {answers.map((a: any, idx: number) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              className="input flex-1"
              placeholder={`Đáp án ${idx + 1}`}
              value={a.content}
              onChange={(e) =>
                updateAnswer(idx, 'content', e.target.value)
              }
            />
            <input
              type={type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
              checked={a.isCorrect}
              onChange={(e) =>
                updateAnswer(idx, 'isCorrect', e.target.checked)
              }
            />
          </div>
        ))}
      </div>

      <button onClick={addAnswer} className="text-sm text-blue-600">
        + Thêm đáp án
      </button>

      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="btn-secondary">
          Hủy
        </button>
        <button onClick={submit} className="btn-primary">
          Lưu câu hỏi
        </button>
      </div>
    </div>
  );
};

