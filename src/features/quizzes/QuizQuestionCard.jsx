/* QuizQuestionCard: edit one prompt, its options, and the correct answer.
 * Correct-answer indices are adjusted when an option is removed.
 */
import { Trash2 } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";

export default function QuizQuestionCard({
  question,
  index,
  questionCount,
  onChange,
  onRemove,
}) {
  const update = changes => onChange(index, changes);

  const updateOption = (optionIndex, value) => {
    update({
      options: question.options.map((option, currentIndex) =>
        currentIndex === optionIndex ? value : option
      ),
    });
  };

  const removeOption = optionIndex => {
    update({
      options: question.options.filter(
        (_, currentIndex) => currentIndex !== optionIndex
      ),
      correctIndex:
        question.correctIndex === optionIndex
          ? null
          : question.correctIndex > optionIndex
            ? question.correctIndex - 1
            : question.correctIndex,
    });
  };

  return (
    <Card className="grid gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge tone="brand">Question {index + 1}</Badge>
          <span className="text-xs text-muted">
            {question.options.length} options
          </span>
        </div>
        {questionCount > 1 ? (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-danger hover:underline"
            aria-label={`Remove question ${index + 1}`}
          >
            <Trash2 size={14} aria-hidden="true" />
            Remove
          </button>
        ) : null}
      </div>

      <FormField label="Question" htmlFor={`qb-question-${index}`} required>
        <Textarea
          id={`qb-question-${index}`}
          rows={2}
          value={question.text}
          maxLength={5000}
          onChange={event => update({ text: event.target.value })}
          required
        />
      </FormField>

      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-semibold text-ink">
          Answer options — select the correct answer
        </legend>
        {question.options.map((option, optionIndex) => (
          <div
            key={optionIndex}
            className="flex items-center gap-3 rounded-control border border-line p-2"
          >
            <input
              type="radio"
              name={`qb-correct-${index}`}
              checked={question.correctIndex === optionIndex}
              required={optionIndex === 0}
              onChange={() => update({ correctIndex: optionIndex })}
              aria-label={`Mark option ${optionIndex + 1} as correct`}
            />
            <Input
              aria-label={`Question ${index + 1}, option ${optionIndex + 1}`}
              value={option}
              maxLength={500}
              onChange={event => updateOption(optionIndex, event.target.value)}
              placeholder={`Option ${optionIndex + 1}`}
              required
            />
            {question.options.length > 2 ? (
              <button
                type="button"
                onClick={() => removeOption(optionIndex)}
                className="rounded-control p-2 text-muted hover:bg-canvas hover:text-danger"
                aria-label={`Remove option ${optionIndex + 1}`}
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ))}
        {question.options.length < 6 ? (
          <button
            type="button"
            onClick={() => update({ options: [...question.options, ""] })}
            className="justify-self-start rounded-control border border-line px-3 py-2 text-sm font-semibold text-brand hover:bg-brand-soft"
          >
            Add option
          </button>
        ) : null}
      </fieldset>
    </Card>
  );
}
