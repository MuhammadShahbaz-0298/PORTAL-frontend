/* QuizAttemptQuestion: render one student's multiple-choice question.
 * The correct answer is never included in the student quiz response.
 */
import Card from "../../components/ui/Card";
import { classNames } from "../../lib/classNames";

export default function QuizAttemptQuestion({
  index,
  question,
  selected,
  onSelect,
}) {
  return (
    <Card className="p-5">
      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-semibold text-ink">
          <span className="mr-2 text-brand">Question {index + 1}</span>
          {question.text}
        </legend>
        {question.options.map((option, optionIndex) => (
          <label
            key={optionIndex}
            className={classNames(
              "flex min-h-12 cursor-pointer items-center gap-3 rounded-control border px-4 py-3 text-sm text-ink transition",
              selected === optionIndex
                ? "border-brand bg-brand-soft ring-1 ring-brand"
                : "border-line hover:bg-canvas"
            )}
          >
            <input
              type="radio"
              name={`quiz-question-${index}`}
              checked={selected === optionIndex}
              onChange={() => onSelect(optionIndex)}
              required
            />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
    </Card>
  );
}
