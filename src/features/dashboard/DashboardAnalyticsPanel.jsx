/* DashboardAnalyticsPanel: overview and selected-batch performance metrics.
 * Batch metrics use separate cards instead of concatenated raw values.
 */
import Card from "../../components/ui/Card";
import ErrorState from "../../components/ui/ErrorState";
import Spinner from "../../components/ui/Spinner";
import StatCard from "../../components/ui/StatCard";
import DashboardBatchPerformance from "./DashboardBatchPerformance";

export default function DashboardAnalyticsPanel({
  analytics,
  batchOptions,
  selectedBatch,
  selectedBatchAnalytics,
  onBatchChange,
  onRetry,
}) {
  return (
    <Card className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            Insights
          </p>
          <h2 className="mt-1 font-sans text-lg font-semibold text-ink">
            Analytics overview
          </h2>
        </div>
        {analytics.loading ? (
          <Spinner size="sm" label="Loading analytics" className="text-brand" />
        ) : null}
      </div>
      {analytics.error ? (
        <div className="px-5 py-4">
          <ErrorState message={analytics.error} onRetry={onRetry} />
        </div>
      ) : (
        <>
          <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Active users"
              value={analytics.overview?.totalUsers ?? "—"}
              note="Staff and learners"
              tone="brand"
            />
            <StatCard
              label="Active batches"
              value={analytics.overview?.totalBatches ?? "—"}
              note="Teaching groups"
              tone="success"
            />
            <StatCard
              label="Submissions"
              value={analytics.overview?.totalSubmissions ?? "—"}
              note="All submitted work"
              tone="warning"
            />
            <StatCard
              label="Attendance records"
              value={analytics.overview?.totalAttendance ?? "—"}
              note="Marked sessions"
              tone="brand"
            />
          </div>

          <DashboardBatchPerformance
            batchOptions={batchOptions}
            selectedBatch={selectedBatch}
            selectedBatchAnalytics={selectedBatchAnalytics}
            analyticsLoading={analytics.loading}
            onBatchChange={onBatchChange}
          />
        </>
      )}
    </Card>
  );
}
