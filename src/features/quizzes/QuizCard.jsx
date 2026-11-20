/* QuizCard: show a quiz's batch and question count with role-appropriate actions.
 * Staff can inspect results or archive; students can start an attempt.
 */
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function QuizCard({
  quiz,
  canManage,
  resultsOpen,
  archiving,
  onTake,
  onShowResults,
  onArchive,
}) {
  const quizId = quiz._id || quiz.id;
  const batchName =
    typeof quiz.batch === "object" ? quiz.batch?.name : quiz.batch;
  const questionCount = quiz.questions?.length || 0;

  return (
    <Card className="grid content-start gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-ink">
            {quiz.title || "Untitled quiz"}
          </h2>
          <p className="mt-1 truncate text-sm text-muted">
            {batchName || "Batch unavailable"}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge tone="brand">
            {questionCount} {questionCount === 1 ? "question" : "questions"}
          </Badge>
          {quiz.timeLimitMinutes ? (
            <Badge tone="neutral">{quiz.timeLimitMinutes} min</Badge>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line pt-3">
        {canManage ? (
          <>
            <Button
              variant="secondary"
              onClick={() => onShowResults(quizId)}
              aria-expanded={resultsOpen}
            >
              {resultsOpen ? "Hide results" : "Results"}
            </Button>
            <Button
              variant="danger"
              loading={archiving}
              onClick={() => onArchive(quiz)}
            >
              Archive
            </Button>
          </>
        ) : (
          <Button onClick={() => onTake(quizId)}>Take quiz</Button>
        )}
      </div>
    </Card>
  );
}
