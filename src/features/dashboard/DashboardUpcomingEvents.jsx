/* DashboardUpcomingEvents: list the next five school calendar events.
 * Event times use the same formatting as assignment deadlines.
 */
import { Link } from "@tanstack/react-router";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import { formatDashboardDate } from "./dashboardUtils";

export default function DashboardUpcomingEvents({ events }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3 border-b border-line p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            Coming up
          </p>
          <h2 className="mt-1 font-sans text-lg font-semibold text-ink">
            Next five events
          </h2>
        </div>
        <Link
          to="/calendar"
          className="text-xs font-semibold text-brand hover:underline"
        >
          View calendar
        </Link>
      </div>
      {events.length ? (
        <ul className="divide-y divide-line">
          {events.map(event => (
            <li
              key={event._id || event.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink">
                  {event.title}
                </span>
                <span className="block text-xs text-muted">
                  {event.batch?.name || "Whole school"}
                </span>
              </span>
              <Badge tone="warning">{formatDashboardDate(event.date)}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-8 text-sm text-muted">
          No upcoming events have been added.
        </p>
      )}
    </Card>
  );
}
