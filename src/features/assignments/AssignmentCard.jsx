/* AssignmentCard: the tappable phone row for one assignment brief. */
import { Link } from "@tanstack/react-router";
import { ChevronRight, FileArchive } from "lucide-react";
import Badge from "../../components/ui/Badge";
import { getAssignmentStatus } from "./assignmentUtils";
import AssignmentActions from "./AssignmentActions";

const STATUS_TONES = {
  Active: "success",
  Expired: "warning",
  Closed: "danger",
};

const formatDate = value => {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No deadline";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function AssignmentCard({ assignment }) {
  const id = assignment._id || assignment.id;
  const status = getAssignmentStatus(assignment);
  const batchName = assignment.batch?.name || assignment.batch || "Unassigned";

  return (
    <div className="grid gap-3">
      <Link
        to="/assignments/$assignmentId"
        params={{ assignmentId: id }}
        className="-m-2 flex items-start gap-3 rounded-control p-2 transition hover:bg-canvas"
        aria-label={`View ${assignment.title || "assignment"} brief`}
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
          <FileArchive size={18} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink">
            {assignment.title || "Untitled assignment"}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted">
            {batchName} · due {formatDate(assignment.dueDate)}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <Badge tone={STATUS_TONES[status] || "neutral"}>{status}</Badge>
          <ChevronRight size={16} aria-hidden="true" className="text-muted" />
        </span>
      </Link>

      <AssignmentActions assignment={assignment} layout="card" />
    </div>
  );
}
