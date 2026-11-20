/* QuizResultsPanel: show submitted quiz scores for staff.
 * Scores are answer-key results; AI is not involved in grading.
 */
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { listAttempts } from "../../api/quizzes";
import { apiError } from "../../api/client";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Spinner from "../../components/ui/Spinner";
import { toCollection } from "../../lib/apiData";

function studentName(student) {
  if (typeof student === "object" && student) {
    return student.name || student.email || "Student";
  }
  return "Student";
}

function scorePercent(attempt) {
  if (!attempt.total) return 0;
  return Math.round((attempt.score / attempt.total) * 100);
}

export default function QuizResultsPanel({ quizId, quizTitle, onClose }) {
  const [attempts, setAttempts] = useState([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let active = true;
    listAttempts(quizId, { page: 1, limit: 100 })
      .then(response => {
        if (!active) return;
        const items = toCollection(response.data);
        const total = Number(response.headers?.["x-total-count"]);
        setAttempts(items);
        setTotalAttempts(Number.isFinite(total) ? total : items.length);
      })
      .catch(requestError => {
        if (!active) return;
        setAttempts([]);
        setTotalAttempts(0);
        setError(apiError(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [quizId, reloadCount]);

  const reload = () => {
    setError("");
    setLoading(true);
    setReloadCount(count => count + 1);
  };

  return (
    <Card className="mt-4 overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            Quiz results
          </p>
          <h2 className="mt-1 text-lg font-semibold text-ink">{quizTitle}</h2>
          <p className="mt-1 text-sm text-muted">
            {totalAttempts} {totalAttempts === 1 ? "attempt" : "attempts"}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={onClose}
          aria-label="Close quiz results"
        >
          <X size={16} aria-hidden="true" />
          Close
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center p-8">
          <Spinner
            size="lg"
            label="Loading quiz results"
            className="text-brand"
          />
        </div>
      ) : error ? (
        <div className="p-5">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : attempts.length ? (
        <>
          <ul className="divide-y divide-line">
            {attempts.map(attempt => (
              <li
                key={attempt._id || attempt.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {studentName(attempt.student)}
                  </p>
                  <p className="text-xs text-muted">
                    {attempt.submittedAt
                      ? new Date(attempt.submittedAt).toLocaleString()
                      : "Submission date unavailable"}
                  </p>
                </div>
                <Badge tone="brand">
                  {attempt.score}/{attempt.total} · {scorePercent(attempt)}%
                </Badge>
              </li>
            ))}
          </ul>
          {totalAttempts > attempts.length ? (
            <p className="border-t border-line px-5 py-3 text-xs text-muted">
              Showing the latest {attempts.length} of {totalAttempts} attempts.
            </p>
          ) : null}
        </>
      ) : (
        <EmptyState
          title="No quiz attempts yet"
          text="Student scores will appear here after they submit this quiz."
        />
      )}
    </Card>
  );
}
