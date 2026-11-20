/* DashboardAvailableQuizzes: bring the student's active quizzes onto the home page.
 * The Take action opens the protected quiz attempt route.
 */
import { Link } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import ErrorState from "../../components/ui/ErrorState";
import Spinner from "../../components/ui/Spinner";

export default function DashboardAvailableQuizzes({
  quizzes,
  loading,
  error,
  onRetry,
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3 border-b border-line p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            Assessments
          </p>
          <h2 className="mt-1 font-sans text-lg font-semibold text-ink">
            Available quizzes
          </h2>
        </div>
        <Link
          to="/quizzes"
          className="text-xs font-semibold text-brand hover:underline"
        >
          All quizzes
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center p-8">
          <Spinner size="lg" label="Loading quizzes" className="text-brand" />
        </div>
      ) : error ? (
        <div className="p-5">
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      ) : quizzes.length ? (
        <ul className="divide-y divide-line">
          {quizzes.slice(0, 3).map(quiz => {
            const id = quiz._id || quiz.id;
            const batch =
              typeof quiz.batch === "object" ? quiz.batch?.name : quiz.batch;
            return (
              <li key={id}>
                <Link
                  to="/quizzes/$quizId"
                  params={{ quizId: String(id) }}
                  className="flex min-h-16 items-center gap-3 px-5 py-3 transition hover:bg-canvas"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
                    <ClipboardCheck size={17} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {quiz.title || "Untitled quiz"}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {batch || "Your batch"} · {quiz.questions?.length || 0}{" "}
                      questions
                    </span>
                  </span>
                  <Badge tone="brand">Take quiz</Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="px-5 py-8 text-center">
          <p className="text-sm font-medium text-ink">
            No quizzes are available right now.
          </p>
          <p className="mt-1 text-sm text-muted">
            New quizzes for your batch will appear here and in notifications.
          </p>
        </div>
      )}
    </Card>
  );
}
