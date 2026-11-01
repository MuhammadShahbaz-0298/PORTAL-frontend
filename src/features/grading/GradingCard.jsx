/* GradingCard: the phone row for one submission in the grading queue. */
import { useDispatch } from "react-redux";
import { Pencil } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import {
  assignmentName,
  formatDate,
  personEmail,
  personName,
} from "./gradingUtils";

export default function GradingCard({ submission }) {
  const dispatch = useDispatch();
  const graded = submission.status === "graded";

  return (
    <div className="grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {personName(submission.student)}
          </p>
          <p className="truncate text-xs text-muted">
            {personEmail(submission.student) || "Student record"}
          </p>
        </div>
        <Badge tone={graded ? "success" : "warning"}>
          {submission.status || "submitted"}
        </Badge>
      </div>

      <div className="rounded-control bg-canvas p-3">
        <p className="text-xs text-muted">Assignment</p>
        <p className="mt-0.5 text-sm font-semibold text-ink">
          {assignmentName(submission.assignment)}
        </p>
        <p className="mt-1 text-xs text-muted">
          Submitted {formatDate(submission.submittedAt)}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs text-muted">Marks</dt>
          <dd className="font-semibold text-ink">{submission.grade ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Feedback</dt>
          <dd className="line-clamp-2 text-ink">
            {submission.feedback || "—"}
          </dd>
        </div>
      </dl>

      <Button
        variant="secondary"
        onClick={() => dispatch.grading.openEditor(submission)}
      >
        <Pencil size={15} aria-hidden="true" />
        {graded ? "Edit grade" : "Grade submission"}
      </Button>
    </div>
  );
}
