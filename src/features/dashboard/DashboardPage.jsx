/* Dashboard feature: summary cards are derived from live domain state. */
import { useEffect, useMemo } from "react";
import { Card, CardBody } from "reactstrap";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useSelector } from "react-redux";
import { useResource, domainTypes } from "../../hooks/useResource";
import { listAssignments } from "../../api/assignments";
import { listSubmissions } from "../../api/submissions";
import { listBatches } from "../../api/batches";
import { PageHeader, StatusBadge } from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
const [ar, as, af] = domainTypes.assignments;
const [sr, ss, sf] = domainTypes.submissions;
const [br, bs, bf] = domainTypes.batches;

export default function DashboardPage() {
  const user = useSelector(state => state.auth.user);
  const role = user?.role;
  const assignments = useResource("assignments", ar, as, af, listAssignments);
  const submissions = useResource("submissions", sr, ss, sf, listSubmissions);
  const batches = useResource("batches", br, bs, bf, listBatches);
  const showBatches = role === "admin" || role === "teacher";

  useEffect(() => {
    assignments.load().catch(() => {});
    submissions.load().catch(() => {});
    if (showBatches) batches.load().catch(() => {});
  }, [role]);

  const openAssignments = useMemo(
    () =>
      (assignments.items || []).filter(
        item =>
          item.active !== false &&
          item.dueDate &&
          new Date(item.dueDate) > new Date()
      ),
    [assignments.items]
  );
  const awaitingSubmissions = useMemo(
    () => (submissions.items || []).filter(item => item.status === "submitted"),
    [submissions.items]
  );
  const dashboardItems =
    role === "student" ? openAssignments : awaitingSubmissions;

  return (
    <>
      <PageHeader
        eyebrow="Monday · school overview"
        title="Good morning."
        description="A clear view of the people, work, and signals that need attention today."
        action={
          <Link className="btn btn-coral" to="/assignments">
            Open workspace <ArrowUpRight size={15} />
          </Link>
        }
      />
      <div className="stats-grid">
        <StatCard
          label="Open assignments"
          value={openAssignments.length}
          note="Current learning briefs"
          tone="coral"
        />
        <StatCard
          label="Awaiting grading"
          value={awaitingSubmissions.length}
          note={role === "student" ? "Your submitted work" : "Submission queue"}
          tone="blue"
        />
        {showBatches && (
          <StatCard
            label="Active batches"
            value={(batches.items || []).length}
            note="Teaching groups"
            tone="olive"
          />
        )}
      </div>
      <div className="dashboard-grid">
        <Card className="work-card">
          <CardBody>
            <div className="eyebrow">Needs your attention</div>
            <h2>
              {role === "student" ? "Open assignments" : "Awaiting grading"}
            </h2>
            {dashboardItems.slice(0, 5).map(item => (
              <div className="queue-item" key={item._id}>
                <span className="queue-accent coral" />
                <div className="queue-copy">
                  <strong>
                    {role === "student"
                      ? item.title
                      : item.assignment?.title || "Submission"}
                  </strong>
                  <span>
                    {role === "student"
                      ? item.batch?.name || "Your batch"
                      : `${item.student?.name || "Learner"} · ${item.batch?.name || "Batch"}`}
                  </span>
                </div>
                <StatusBadge tone="coral">
                  {role === "student" ? "open" : "submitted"}
                </StatusBadge>
              </div>
            ))}
            {!dashboardItems.length && (
              <p className="muted">
                {role === "student"
                  ? "No open assignments right now."
                  : "No submissions are waiting for grading."}
              </p>
            )}
          </CardBody>
        </Card>
        <aside className="context-card">
          <div className="context-copy">
            <div className="eyebrow">Field note</div>
            <h3>Small signals add up.</h3>
            <p>
              Attendance, feedback, and submission status belong in the same
              conversation.
            </p>
            <div className="context-rule" />
            <span>Techzone principle · 04</span>
          </div>
        </aside>
      </div>
    </>
  );
}
