/* AssignmentBriefCard: the brief, batch, deadline, status, and submission rule. */
import { CalendarClock, FolderOpen } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import { formatDateTime, resubmissionPolicyLabel } from "./assignmentUtils";

export default function AssignmentBriefCard({ assignment, status }) {
  const batchName =
    assignment.batch?.name || assignment.batch || "Assigned batch";

  return (
    <Card className="p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
        The brief
      </p>
      <h2 className="mt-1 font-sans text-xl font-semibold tracking-tight text-ink">
        {assignment.title || "Untitled assignment"}
      </h2>
      <section
        aria-label="Description"
        className="mt-4 rounded-control border border-line bg-canvas p-4"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Description
        </p>
        <p className="mt-2 whitespace-pre-wrap break-words text-[13px] leading-6 text-ink">
          {assignment.description || "No description has been provided."}
        </p>
      </section>

      <dl className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
        <div className="rounded-control bg-canvas p-3">
          <dt className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <FolderOpen size={14} aria-hidden="true" />
            Batch
          </dt>
          <dd className="mt-1 text-sm font-semibold text-ink">{batchName}</dd>
        </div>
        <div className="rounded-control bg-canvas p-3">
          <dt className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <CalendarClock size={14} aria-hidden="true" />
            Deadline
          </dt>
          <dd className="mt-1 text-sm font-semibold text-ink">
            {formatDateTime(assignment.dueDate)}
          </dd>
        </div>
        <div className="rounded-control bg-canvas p-3">
          <dt className="text-xs font-medium text-muted">Status</dt>
          <dd className="mt-1">
            <Badge tone={status === "Open" ? "success" : "danger"}>
              {status}
            </Badge>
          </dd>
        </div>
        <div className="rounded-control bg-canvas p-3">
          <dt className="text-xs font-medium text-muted">Submission rule</dt>
          <dd className="mt-1 text-sm font-semibold text-ink">
            {resubmissionPolicyLabel(assignment)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
