/* QuizSettingsCard: enter the quiz title, target batch, and request guidance.
 * The batch list and loading errors come from the batches store.
 */
import Card from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import { QUIZ_MAX_TIME_LIMIT_MINUTES } from "../../constants/app";

export default function QuizSettingsCard({
  title,
  batchId,
  timeLimitMinutes,
  batches,
  onTitleChange,
  onBatchChange,
  onTimeLimitChange,
}) {
  return (
    <Card className="grid gap-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Quiz title" htmlFor="qb-title" required>
          <Input
            id="qb-title"
            value={title}
            onChange={event => onTitleChange(event.target.value)}
            maxLength={160}
            required
          />
        </FormField>
        <FormField label="Batch" htmlFor="qb-batch" required>
          <select
            id="qb-batch"
            value={batchId}
            onChange={event => onBatchChange(event.target.value)}
            required
            className="h-11 w-full rounded-control border border-line bg-surface px-3 text-base text-ink"
          >
            <option value="">Choose a batch</option>
            {batches.items.map(batch => (
              <option key={batch._id || batch.id} value={batch._id || batch.id}>
                {batch.name || "Untitled batch"}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label="Time limit (minutes)"
          htmlFor="qb-time-limit"
          required
          hint={`1–${QUIZ_MAX_TIME_LIMIT_MINUTES.toLocaleString()} minutes. Time starts when a student begins the quiz.`}
        >
          <Input
            id="qb-time-limit"
            type="number"
            min="1"
            max={QUIZ_MAX_TIME_LIMIT_MINUTES}
            step="1"
            value={timeLimitMinutes}
            onChange={event => onTimeLimitChange(event.target.value)}
            required
          />
        </FormField>
      </div>
      {batches.error ? (
        <p role="alert" className="text-sm text-danger">
          Could not load batches: {batches.error}
        </p>
      ) : !batches.loading && !batches.items.length ? (
        <p role="status" className="text-sm text-muted">
          Create or assign a batch before building a quiz.
        </p>
      ) : null}
      <p className="text-sm text-muted">
        Each question needs a prompt, 2–6 answer options, and one correct
        answer. The correct answer is hidden from students. The request sends
        the title, batch ID, and each question&apos;s text, options, and
        correct-option index.
      </p>
    </Card>
  );
}
