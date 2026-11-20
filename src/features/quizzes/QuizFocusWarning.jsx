/* QuizFocusWarning: require an explicit gesture to resume fullscreen.
 * The countdown continues while this warning is visible.
 */
import { Maximize } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function QuizFocusWarning({
  error,
  focusViolationCount,
  onResume,
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-focus-warning"
      className="fixed inset-0 z-[60] grid place-items-center bg-overlay p-4"
    >
      <Card className="grid w-full max-w-md gap-4 p-6">
        <div>
          <h2
            id="quiz-focus-warning"
            className="text-lg font-semibold text-ink"
          >
            Return to the quiz
          </h2>
          <p className="mt-2 text-sm text-muted">
            The timer kept running while the quiz was out of focus. Return to
            fullscreen to continue. Your saved answers are still here.
          </p>
          <p className="mt-2 text-sm font-semibold text-danger">
            {focusViolationCount >= 2
              ? "Warning 2 of 2. Leaving fullscreen again will submit the quiz."
              : "Warning 1 of 2. Leaving fullscreen again will trigger the final warning."}
          </p>
        </div>
        {error ? (
          <p role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        ) : null}
        <Button onClick={onResume}>
          <Maximize size={16} aria-hidden="true" />
          Resume fullscreen
        </Button>
      </Card>
    </div>
  );
}
