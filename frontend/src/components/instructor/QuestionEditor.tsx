import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, X, HelpCircle } from 'lucide-react';

interface Answer {
  answerId?: string;
  answerText: string;
  isCorrect: boolean;
}

interface QuestionData {
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  points: number;
  explanation: string;
  answers: Answer[];
}

interface QuestionEditorProps {
  initialData?: any; 
  onSubmit: (data: QuestionData) => void;
  onCancel: () => void;
}

export const QuestionEditor = ({
  initialData,
  onSubmit,
  onCancel,
}: QuestionEditorProps) => {
  // === STATE QUẢN LÝ DỮ LIỆU ===
  const [questionText, setQuestionText] = useState(initialData?.questionText || '');
  // ✅ Luôn gán cứng SINGLE CHOICE (MULTIPLE_CHOICE = 1 đáp án đúng)
  const [questionType] = useState<QuestionData['questionType']>('MULTIPLE_CHOICE');
  const [points, setPoints] = useState<number>(initialData?.points || 10); // Mặc định 10 điểm
  const [explanation, setExplanation] = useState(initialData?.explanation || '');
  
  const [answers, setAnswers] = useState<Answer[]>(
    initialData?.answers?.map((a: any) => ({
        answerId: a.answerId,
        answerText: a.answerText || a.content || '', 
        isCorrect: a.isCorrect || false
    })) || [
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false },
    ]
  );

  // Load dữ liệu khi edit
  useEffect(() => {
    if (initialData) {
      setQuestionText(initialData.questionText || '');
      // ✅ Không set questionType nữa vì đã gán cứng
      setPoints(initialData.points || 10);
      setExplanation(initialData.explanation || '');
      setAnswers(
        initialData.answers?.map((a: any) => ({
          answerId: a.answerId,
          answerText: a.answerText || a.content || '',
          isCorrect: a.isCorrect || false
        })) || [
          { answerText: '', isCorrect: false },
          { answerText: '', isCorrect: false },
        ]
      );
    }
  }, [initialData]);

  // Thêm đáp án mới
  const addAnswer = () => {
    setAnswers([...answers, { answerText: '', isCorrect: false }]);
  };

  // Xóa đáp án
  const removeAnswer = (idx: number) => {
    if (answers.length <= 2) {
        alert("Cần tối thiểu 2 đáp án");
        return;
    }
    const newAnswers = answers.filter((_, i) => i !== idx);
    setAnswers(newAnswers);
  };

  // Cập nhật nội dung hoặc trạng thái đúng/sai của đáp án
  const updateAnswer = (idx: number, field: keyof Answer, value: any) => {
    const newAnswers = [...answers];
    
    if (field === 'isCorrect') {
      // ✅ LUÔN LUÔN chỉ cho phép chọn 1 đáp án đúng (Radio behavior)
      // Reset tất cả về false, chỉ idx được click mới là true
      newAnswers.forEach((a, i) => {
        a.isCorrect = i === idx;
      });
    } else {
      // Cập nhật text
      (newAnswers[idx] as any)[field] = value;
    }
    
    setAnswers(newAnswers);
  };

  // Xử lý Submit form
  const submit = () => {
    // 1. Validate dữ liệu
    if (!questionText.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi');
      return;
    }
    if (points <= 0) {
      alert('Điểm số phải lớn hơn 0');
      return;
    }
    
    // Validate đáp án (trừ loại tự luận nếu sau này mở rộng)
    if (questionType !== 'SHORT_ANSWER') {
        if (answers.some(a => !a.answerText.trim())) {
            alert('Nội dung đáp án không được để trống');
            return;
        }
        if (!answers.some((a) => a.isCorrect)) {
            alert('Phải chọn ít nhất 1 đáp án đúng');
            return;
        }
    }

    // 2. Gửi dữ liệu ra ngoài (để parent gọi API)
    onSubmit({
      questionText,
      questionType,
      points,
      explanation,
      answers,
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800">
          {initialData ? '✏️ Chỉnh sửa câu hỏi' : '➕ Thêm câu hỏi mới'}
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Hàng 1: Nội dung câu hỏi */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung câu hỏi</label>
            <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            rows={3}
            placeholder="Nhập câu hỏi của bạn..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            />
        </div>

        {/* Hàng 2: Loại câu hỏi & Điểm số */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại câu hỏi</label>
                {/* ✅ Ẩn select, hiển thị text cố định */}
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-600">
                    Một đáp án đúng (Single Choice)
                </div>
                <input type="hidden" value="MULTIPLE_CHOICE" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Điểm số</label>
                <input
                    type="number"
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                />
            </div>
        </div>

        {/* Hàng 3: Giải thích (Optional) */}
        <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <HelpCircle size={14} /> Giải thích đáp án (Hiện sau khi nộp bài)
            </label>
            <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="VD: Vì A là đáp án chính xác do..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
            />
        </div>

        {/* Danh sách đáp án */}
        {questionType !== 'SHORT_ANSWER' && (
          <div className="space-y-3 mt-4">
              <label className="block text-sm font-medium text-gray-700">Các lựa chọn trả lời:</label>
              {answers.map((a, idx) => (
              <div key={idx} className="flex gap-3 items-center group">
                  {/* Nút chọn đáp án đúng */}
                  <div 
                      className="relative flex items-center justify-center cursor-pointer"
                      onClick={() => updateAnswer(idx, 'isCorrect', !a.isCorrect)}
                      title="Đánh dấu là đáp án đúng"
                  >
                      <input
                          type={questionType === 'MULTIPLE_CHOICE' ? 'radio' : 'checkbox'}
                          className="peer sr-only"
                          name="correctAnswer"
                          checked={a.isCorrect}
                          readOnly
                      />
                      <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all
                          ${a.isCorrect 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 text-transparent hover:border-green-400'
                          }`}
                      >
                          <CheckCircle size={16} fill="currentColor" className={a.isCorrect ? "text-white" : "text-transparent"} />
                      </div>
                  </div>

                  {/* Input nội dung đáp án */}
                  <input
                      className={`flex-1 border rounded-lg px-3 py-2 focus:ring-2 outline-none transition-all
                          ${a.isCorrect ? 'border-green-300 bg-green-50 ring-green-200' : 'border-gray-300 focus:ring-blue-500'}
                      `}
                      placeholder={`Đáp án ${idx + 1}`}
                      value={a.answerText}
                      onChange={(e) => updateAnswer(idx, 'answerText', e.target.value)}
                  />

                  {/* Nút xóa - chỉ hiện khi có thể xóa */}
                  {answers.length > 2 && (
                    <button 
                        onClick={() => removeAnswer(idx)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        title="Xóa đáp án này"
                    >
                        <Trash2 size={18} />
                    </button>
                  )}
              </div>
              ))}
          </div>
        )}

        {questionType !== 'SHORT_ANSWER' && (
          <button 
              onClick={addAnswer} 
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg w-fit transition-colors"
          >
              <Plus size={18} /> Thêm lựa chọn khác
          </button>
        )}

        {/* Footer Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t mt-4">
            <button 
                onClick={onCancel} 
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
            Hủy bỏ
            </button>
            <button 
                onClick={submit} 
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-all transform active:scale-95"
            >
            {initialData ? 'Lưu thay đổi' : 'Tạo câu hỏi'}
            </button>
        </div>
      </div>
    </div>
  );
};
