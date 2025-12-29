export const AnswerEditor = ({ answer }: any) => (
  <div className="flex items-center gap-2">
    <input type="checkbox" checked={answer.isCorrect} readOnly />
    <span>{answer.content}</span>
  </div>
);
