/* QuizStartPanel: explain the assessment rules before starting its timer.
 * The browser handles app switching; fullscreen exit is detected and warned.
 */
import { Maximize } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function QuizStartPanel({
  quiz,
  questionCount,
  error,
  starting,
  onStart,
}) {
  return (
    <Card className="grid gap-5 p-6 sm:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Quiz ready
        </p>
        <h2 className="mt-1 text-xl font-semibold text-ink">
          {quiz.title || "Assessment"}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {questionCount} questions ·{" "}
          {quiz.timeLimitMinutes
            ? `${quiz.timeLimitMinutes} minutes`
            : "no time limit"}
        </p>
      </div>
      <div className="rounded-control border border-line bg-canvas p-4 text-sm text-muted">
        Your answers save as you go. Keyboard input is disabled inside the
        assessment. Leaving fullscreen twice shows a warning; a third exit
        submits the saved answers. Browser and operating-system shortcuts cannot
        be fully locked.
      </div>
      {error ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
      <Button
        onClick={onStart}
        loading={starting}
        className="justify-self-start"
      >
        <Maximize size={16} aria-hidden="true" />
        Start quiz in fullscreen
      </Button>
    </Card>
  );
}
