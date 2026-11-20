/* QuizAttemptSummary: show the result of a student's single quiz attempt.
 * Scores come from the server's answer-key comparison, not AI.
 */
import { Link } from "@tanstack/react-router";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";

export default function QuizAttemptSummary({ attempt }) {
  const percent = attempt.total
    ? Math.round((attempt.score / attempt.total) * 100)
    : 0;

  return (
    <Card className="grid justify-items-center gap-4 p-8 text-center">
      <div>
        <p className="text-sm font-semibold text-muted">Quiz submitted</p>
        <h2 className="mt-1 text-2xl font-semibold text-ink">Your result</h2>
      </div>
      <Badge tone="brand">
        {attempt.score}/{attempt.total} correct · {percent}%
      </Badge>
      <p className="text-sm text-muted">
        {attempt.focusViolationCount > 2
          ? "This attempt was submitted after two warnings for leaving fullscreen."
          : "This result was calculated automatically from the quiz answer key."}
      </p>
      <Link
        to="/quizzes"
        className="inline-flex min-h-11 items-center justify-center rounded-control border border-line bg-surface px-4 text-sm font-semibold text-ink hover:bg-canvas"
      >
        Back to quizzes
      </Link>
    </Card>
  );
}
