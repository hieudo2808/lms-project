import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

import { GET_QUIZ_BY_ID } from '../../graphql/queries/quiz';
import {
  UPDATE_QUIZ_MUTATION,
  DELETE_QUESTION_MUTATION,
  CREATE_QUESTION_MUTATION,
  CREATE_ANSWER_MUTATION,
  UPDATE_QUESTION_MUTATION,
  UPDATE_ANSWER_MUTATION,
  DELETE_QUIZ_MUTATION
} from '../../graphql/mutations/instructor';

import { QuizInfoForm } from '../../components/instructor/QuizInfoForm';
import { QuestionList } from '../../components/instructor/QuestionList';
import { QuestionEditor } from '../../components/instructor/QuestionEditor';

export const EditQuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  // 1. Query Data
  const { data, loading, error, refetch } = useQuery(GET_QUIZ_BY_ID, {
    variables: { quizId },
    fetchPolicy: 'network-only'
  });

  // 2. Mutations
  const [updateQuiz, { loading: updating }] = useMutation(UPDATE_QUIZ_MUTATION);
  const [deleteQuestion] = useMutation(DELETE_QUESTION_MUTATION);
  const [createQuestion] = useMutation(CREATE_QUESTION_MUTATION);
  const [createAnswer] = useMutation(CREATE_ANSWER_MUTATION);
  const [updateQuestion] = useMutation(UPDATE_QUESTION_MUTATION);
  const [updateAnswer] = useMutation(UPDATE_ANSWER_MUTATION);
  const [deleteQuiz] = useMutation(DELETE_QUIZ_MUTATION);

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  if (error || !data?.getQuizById) return <div className="p-10 text-center text-red-500">Không tìm thấy Quiz</div>;

  const quiz = data.getQuizById;

  // --- CÁC HÀM XỬ LÝ (HANDLERS) ---

  // 1. Cập nhật thông tin chung Quiz
  const handleUpdateQuiz = async (formData: any) => {
    try {
      await updateQuiz({
        variables: {
          quizId: quizId,
          input: {
            title: formData.title,
            description: formData.description,
            timeLimit: formData.timeLimit,
            passingScore: formData.passingScore,
            maxAttempts: formData.maxAttempts,
            isPublished: formData.isPublished
          }
        }
      });
      toast.success("Đã lưu cấu hình!");
      refetch();
    } catch (err: any) {
      toast.error("Lỗi lưu: " + err.message);
    }
  };

  // 2. Hủy thêm/sửa câu hỏi
  const handleCancelQuestion = () => {
    setIsAddingQuestion(false);
    setIsEditingQuestion(false);
    setEditingQuestion(null);
  };

  // 3. Lưu câu hỏi mới hoặc cập nhật câu hỏi
  const handleCreateQuestion = async (questionData: any) => {
    try {
      if (isEditingQuestion && editingQuestion) {
        // CẬP NHẬT CÂU HỎI
        await updateQuestion({
          variables: {
            questionId: editingQuestion.questionId,
            input: {
              questionText: questionData.questionText,
              questionType: questionData.questionType,
              points: questionData.points,
              explanation: questionData.explanation
            }
          }
        });

        // CẬP NHẬT TỪNG ĐÁP ÁN
        if (questionData.answers && questionData.answers.length > 0) {
          const answerPromises = questionData.answers.map((ans: any) => 
            ans.answerId ? 
              updateAnswer({
                variables: {
                  answerId: ans.answerId,
                  input: {
                    answerId: ans.answerId, // Thêm answerId vào input
                    answerText: ans.answerText,
                    isCorrect: ans.isCorrect
                  }
                }
              }) :
              createAnswer({
                variables: {
                  input: {
                    questionId: editingQuestion.questionId,
                    answerText: ans.answerText,
                    isCorrect: ans.isCorrect
                  }
                }
              })
          );
          await Promise.all(answerPromises);
        }

        toast.success("Đã cập nhật câu hỏi!");
      } else {
        // TẠO CÂU HỎI MỚI
        // BƯỚC 1: Tạo Câu Hỏi (Chưa có đáp án)
        const { data } = await createQuestion({
          variables: {
            input: {
              quizId: quizId, // Gắn ID Quiz vào đây
              questionText: questionData.questionText,
              questionType: questionData.questionType,
              points: questionData.points,
              explanation: questionData.explanation
              // Lưu ý: Không gửi answers ở bước này
            }
          }
        });

        const newQuestionId = data.createQuestion.questionId;

        // BƯỚC 2: Tạo từng đáp án cho câu hỏi đó
        if (questionData.answers && questionData.answers.length > 0) {
          const answerPromises = questionData.answers.map((ans: any) => 
             createAnswer({
               variables: {
                 input: {
                   questionId: newQuestionId, 
                   answerText: ans.answerText,
                   isCorrect: ans.isCorrect
                 }
               }
             })
          );
          await Promise.all(answerPromises);
        }

        toast.success("Thêm câu hỏi thành công!");
      }

      setIsAddingQuestion(false);
      setIsEditingQuestion(false);
      setEditingQuestion(null);
      refetch(); // Tải lại danh sách
    } catch (err: any) {
      console.error(err);
      toast.error(isEditingQuestion ? "Lỗi cập nhật câu hỏi: " + err.message : "Lỗi thêm câu hỏi: " + err.message);
    }
  };

  // 4. Xóa câu hỏi
  const handleDeleteQuestion = async (questionId: string) => {
    if(!window.confirm("Bạn chắc chắn muốn xóa câu hỏi này?")) return;
    try {
      await deleteQuestion({ variables: { questionId } });
      toast.success("Đã xóa câu hỏi.");
      refetch();
    } catch (err: any) {
      toast.error("Lỗi xóa: " + err.message);
    }}
  // 5. Xóa bài quiz
  const handleDeleteQuiz = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài quiz này? Hành động này không thể hoàn tác.")) return;
    try {
      await deleteQuiz({ variables: { quizId } });
      toast.success("Đã xóa bài quiz.");
      navigate(-1); // Quay lại trang trước
    } catch (err: any) {
      toast.error("Lỗi xóa bài quiz: " + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 pb-20">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-50 py-4 z-10">
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium">
            <ArrowLeft size={20} /> Quay lại bài học
         </button>
         
         <div className="flex gap-3">
           <button 
              onClick={handleDeleteQuiz}
              className="btn-danger flex items-center gap-2"
           >
               <Trash2 size={18}/> Xóa bài quiz
           </button>
           <button 
              onClick={() => document.getElementById('btn-submit-config')?.click()} 
              className="btn-primary flex items-center gap-2 shadow-lg"
              disabled={updating}
           >
               <Save size={18}/> {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
           </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột trái: Cấu hình */}
          <div className="lg:col-span-4 space-y-6">
              <h3 className="font-bold text-lg text-gray-800">Cấu hình chung</h3>
              <QuizInfoForm 
                initialData={quiz} 
                onSubmit={handleUpdateQuiz}
                submitLabel="Cập nhật cấu hình"
                submitButtonId="btn-submit-config"
              />
          </div>

          {/* Cột phải: Câu hỏi */}
          <div className="lg:col-span-8">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Nội dung câu hỏi</h3>
              <div className="bg-white p-6 rounded-xl border shadow-sm min-h-[500px]">
                 {isAddingQuestion ? (
                    <QuestionEditor 
                        onCancel={handleCancelQuestion} 
                        onSubmit={handleCreateQuestion} 
                    />
                 ) : isEditingQuestion ? (
                    <QuestionEditor 
                        initialData={editingQuestion}
                        onCancel={handleCancelQuestion} 
                        onSubmit={handleCreateQuestion} 
                    />
                 ) : (
                    <QuestionList 
                        questions={quiz.questions || []}
                        onAdd={() => setIsAddingQuestion(true)}
                        onEdit={(q) => {
                          setIsEditingQuestion(true);
                          setEditingQuestion(q);
                        }}
                        onDelete={handleDeleteQuestion}
                    />
                 )}
              </div>
          </div>
      </div>
    </div>
  );
};