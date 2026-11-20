/* DashboardOverviewStats: show the current user's top-level work counts.
 * The dashboard computes counts from its role-scoped data.
 */
import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import ErrorState from "../../components/ui/ErrorState";

export default function DashboardOverviewStats({
  role,
  openAssignments,
  awaiting,
  availableQuizzes,
  activeBatches,
  error,
  onRetry,
}) {
  return (
    <>
      {error ? (
        <Card className="mb-4">
          <ErrorState message={error} onRetry={onRetry} />
        </Card>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Open assignments"
          value={openAssignments}
          note="Current learning briefs"
          tone="brand"
        />
        <StatCard
          label={role === "student" ? "In progress" : "Awaiting grading"}
          value={awaiting}
          note={role === "student" ? "Your submitted work" : "Submission queue"}
          tone="warning"
        />
        {role === "student" ? (
          <StatCard
            label="Available quizzes"
            value={availableQuizzes}
            note="Ready for you to take"
            tone="success"
          />
        ) : null}
        {role === "admin" || role === "teacher" ? (
          <StatCard
            label="Active batches"
            value={activeBatches}
            note="Teaching groups"
            tone="success"
          />
        ) : null}
      </div>
    </>
  );
}
