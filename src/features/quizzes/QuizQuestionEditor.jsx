/* QuizQuestionEditor: manage the list of question cards for a new quiz.
 * It keeps list-level updates separate from quiz submission.
 */
import { Plus } from "lucide-react";
import Button from "../../components/ui/Button";
import QuizQuestionCard from "./QuizQuestionCard";

export default function QuizQuestionEditor({ questions, onChange }) {
  const removeQuestion = index => {
    onChange(questions.filter((_, currentIndex) => currentIndex !== index));
  };

  const updateQuestion = (index, changes) => {
    onChange(
      questions.map((question, currentIndex) =>
        currentIndex === index ? { ...question, ...changes } : question
      )
    );
  };

  const addQuestion = () => {
    onChange([
      ...questions,
      { text: "", options: ["", ""], correctIndex: null },
    ]);
  };

  return (
    <>
      {questions.map((question, index) => (
        <QuizQuestionCard
          key={index}
          question={question}
          index={index}
          questionCount={questions.length}
          onChange={updateQuestion}
          onRemove={removeQuestion}
        />
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={addQuestion}
        className="justify-self-start"
      >
        <Plus size={16} aria-hidden="true" />
        Add question
      </Button>
    </>
  );
}
