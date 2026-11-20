/* DashboardWorkQueue: show the next work items for the current role.
 * Students see open assignments; staff see submissions awaiting grades.
 */
import { Link } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import { formatDashboardDate } from "./dashboardUtils";

export default function DashboardWorkQueue({ role, queue, loading }) {
  const isStudent = role === "student";

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 border-b border-line p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            Needs your attention
          </p>
          <h2 className="mt-1 font-sans text-lg font-semibold text-ink">
            {isStudent ? "Open assignments" : "Awaiting grading"}
          </h2>
        </div>
        {loading ? (
          <Spinner size="sm" label="Loading queue" className="text-brand" />
        ) : null}
      </div>

      {loading && !queue.length ? (
        <div className="flex justify-center px-5 py-12">
          <Spinner size="lg" label="Loading dashboard" className="text-brand" />
        </div>
      ) : queue.length ? (
        <ul className="divide-y divide-line">
          {queue.slice(0, 5).map(item => {
            const id = item.id || item._id;
            const title = isStudent
              ? item.title || "Assignment"
              : item.assignment?.title || "Submission";
            const detail = isStudent
              ? item.batch?.name || "Your batch"
              : `${item.student?.name || "Learner"} · ${item.batch?.name || "Batch"}`;

            return (
              <li key={id}>
                <Link
                  to={isStudent ? "/assignments/$assignmentId" : "/grading"}
                  params={isStudent ? { assignmentId: id } : undefined}
                  className="flex min-h-16 w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <span
                    aria-hidden="true"
                    className="h-9 w-1 shrink-0 rounded-full bg-brand"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {title}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {isStudent
                        ? `${detail} · due ${formatDashboardDate(item.dueDate)}`
                        : detail}
                    </span>
                  </span>
                  <Badge tone={isStudent ? "brand" : "warning"}>
                    {isStudent ? "open" : item.status || "submitted"}
                  </Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-canvas text-muted">
            <Inbox size={20} aria-hidden="true" />
          </span>
          <p className="text-sm font-medium text-ink">
            {isStudent
              ? "No open assignments right now."
              : "Nothing is waiting for grading."}
          </p>
          <p className="text-sm text-muted">
            New work will appear here as soon as it arrives.
          </p>
        </div>
      )}
    </Card>
  );
}
