/* Dashboard page: live counts and the short queue that needs attention today. */
import { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  Inbox,
  UsersRound,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import ErrorState from "../../components/ui/ErrorState";
import PageHeader from "../../components/ui/PageHeader";
import Spinner from "../../components/ui/Spinner";
import StatCard from "../../components/ui/StatCard";
import { buttonClassName } from "../../components/ui/Button";

const formatDue = value => {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No deadline";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

function DashboardPage({ user, data, loading, error, load }) {
  const role = user?.role;
  const staff = role === "admin" || role === "teacher";

  useEffect(() => {
    load({ role });
  }, [load, role]);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12
      ? "Good Morning."
      : hour < 18
        ? "Good Afternoon."
        : "Good Evening.";
  const dayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);

  const openAssignments = useMemo(
    () =>
      data.assignments
        .filter(
          item =>
            item.active !== false &&
            item.dueDate &&
            new Date(item.dueDate).getTime() > Date.now()
        )
        .sort(
          (left, right) =>
            new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime()
        ),
    [data.assignments]
  );

  const awaiting = useMemo(
    () => data.submissions.filter(item => item.status !== "graded"),
    [data.submissions]
  );

  const queue = role === "student" ? openAssignments : awaiting;

  const quickLinks = [
    { to: "/assignments", label: "Open assignments", icon: ClipboardList },
    staff
      ? { to: "/grading", label: "Grading desk", icon: GraduationCap }
      : { to: "/submissions", label: "Your submissions", icon: Inbox },
    staff
      ? { to: "/batches", label: "Teaching batches", icon: UsersRound }
      : { to: "/attendance", label: "Your attendance", icon: CalendarCheck },
  ];

  return (
    <div className="font-sans">
      <PageHeader
        eyebrow={`${dayName} · overview`}
        title={greeting}
        description="A clear view of the people, work, and signals that need attention today."
        action={
          <Link to="/assignments" className={buttonClassName()}>
            Open workspace
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        }
      />

      {error ? (
        <Card className="mb-4">
          <ErrorState message={error} onRetry={() => load({ role })} />
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Open assignments"
          value={openAssignments.length}
          note="Current learning briefs"
          tone="brand"
        />
        <StatCard
          label={role === "student" ? "In progress" : "Awaiting grading"}
          value={awaiting.length}
          note={role === "student" ? "Your submitted work" : "Submission queue"}
          tone="warning"
        />
        {staff ? (
          <StatCard
            label="Active batches"
            value={data.batches.length}
            note="Teaching groups"
            tone="success"
          />
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <div className="flex items-start justify-between gap-3 border-b border-line p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                Needs your attention
              </p>
              <h2 className="mt-1 font-sans text-lg font-semibold text-ink">
                {role === "student" ? "Open assignments" : "Awaiting grading"}
              </h2>
            </div>
            {loading ? (
              <Spinner size="sm" label="Loading queue" className="text-brand" />
            ) : null}
          </div>

          {loading && !queue.length ? (
            <div className="flex justify-center px-5 py-12">
              <Spinner
                size="lg"
                label="Loading dashboard"
                className="text-brand"
              />
            </div>
          ) : queue.length ? (
            <ul className="divide-y divide-line">
              {queue.slice(0, 5).map(item => {
                const id = item.id || item._id;
                const studentQueue = role === "student";
                const title = studentQueue
                  ? item.title || "Assignment"
                  : item.assignment?.title || "Submission";
                const detail = studentQueue
                  ? item.batch?.name || "Your batch"
                  : `${item.student?.name || "Learner"} · ${item.batch?.name || "Batch"}`;

                return (
                  <li key={id}>
                    <Link
                      to={
                        studentQueue ? "/assignments/$assignmentId" : "/grading"
                      }
                      params={studentQueue ? { assignmentId: id } : undefined}
                      className="flex min-h-16 items-center gap-3 px-5 py-3 transition hover:bg-canvas"
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
                          {studentQueue
                            ? `${detail} · due ${formatDue(item.dueDate)}`
                            : detail}
                        </span>
                      </span>
                      <Badge tone={studentQueue ? "brand" : "warning"}>
                        {studentQueue ? "open" : item.status || "submitted"}
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
                {role === "student"
                  ? "No open assignments right now."
                  : "Nothing is waiting for grading."}
              </p>
              <p className="text-sm text-muted">
                New work will appear here as soon as it arrives.
              </p>
            </div>
          )}
        </Card>

        <Card>
          <div className="border-b border-line p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              Shortcuts
            </p>
            <h2 className="mt-1 font-sans text-lg font-semibold text-ink">
              Jump back in
            </h2>
          </div>
          <ul className="grid gap-1 p-3">
            {quickLinks.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-medium text-ink transition hover:bg-canvas"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-control bg-brand-soft text-brand">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  {label}
                  <ArrowUpRight
                    size={15}
                    aria-hidden="true"
                    className="ml-auto text-muted"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

const mapState = state => ({
  user: state.auth.user,
  data: {
    assignments: state.dashboard.assignments,
    submissions: state.dashboard.submissions,
    batches: state.dashboard.batches,
  },
  loading: state.dashboard.loading,
  error: state.dashboard.error,
});

const mapDispatch = dispatch => ({
  load: dispatch.dashboard.load,
});

export default connect(mapState, mapDispatch)(DashboardPage);
