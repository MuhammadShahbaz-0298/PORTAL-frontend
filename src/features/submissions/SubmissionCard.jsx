/* SubmissionCard: the phone row for one submission record. */
import { Link } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import Badge from "../../components/ui/Badge";
import SubmissionDownload from "./SubmissionDownload";

const assignmentId = submission => {
  const assignment = submission.assignment;
  return typeof assignment === "object"
    ? assignment?._id || assignment?.id
    : assignment;
};

const assignmentTitle = submission =>
  typeof submission.assignment === "object"
    ? submission.assignment?.title || "Assignment"
    : submission.assignment || "Assignment";

export default function SubmissionCard({ submission }) {
  const user = useSelector(state => state.auth.user);
  const student = user?.role === "student";
  const id = assignmentId(submission);
  const graded = submission.status === "graded";

  return (
    <div className="grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted">
            {student
              ? "Your submission"
              : submission.student?.name || submission.student || "Learner"}
          </p>
          {student && id ? (
            <Link
              to="/assignments/$assignmentId"
              params={{ assignmentId: id }}
              className="mt-0.5 block truncate text-sm font-semibold text-ink underline-offset-4 hover:text-brand hover:underline"
            >
              {assignmentTitle(submission)}
            </Link>
          ) : (
            <p className="mt-0.5 truncate text-sm font-semibold text-ink">
              {assignmentTitle(submission)}
            </p>
          )}
        </div>
        <Badge tone={graded ? "success" : "warning"}>
          {submission.status || "submitted"}
        </Badge>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-control bg-canvas p-2.5">
          <dt className="text-xs text-muted">Grade</dt>
          <dd className="mt-0.5 font-semibold text-ink">
            {submission.grade ?? "—"}
          </dd>
        </div>
        <div className="rounded-control bg-canvas p-2.5">
          <dt className="text-xs text-muted">Submitted</dt>
          <dd className="mt-0.5 font-semibold text-ink">
            {submission.submittedAt
              ? new Date(submission.submittedAt).toLocaleDateString()
              : "—"}
          </dd>
        </div>
      </dl>

      {submission.feedback ? (
        <p className="line-clamp-3 text-xs leading-5 text-muted">
          {submission.feedback}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <SubmissionDownload submission={submission} />
        {!student ? (
          <Link
            to="/grading"
            className="inline-flex min-h-11 items-center rounded-control px-3 text-sm font-semibold text-brand transition hover:bg-brand-soft"
          >
            Grade
          </Link>
        ) : null}
      </div>
    </div>
  );
}
