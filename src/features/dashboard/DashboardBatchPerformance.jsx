/* DashboardBatchPerformance: show one batch's summary metrics.
 * The batch selector stays above a stable row of summary cards.
 */
import StatCard from "../../components/ui/StatCard";

export default function DashboardBatchPerformance({
  batchOptions,
  selectedBatch,
  selectedBatchAnalytics,
  analyticsLoading,
  onBatchChange,
}) {
  return (
    <div className="grid gap-4 border-t border-line p-5">
      <label className="grid max-w-md gap-1.5">
        <span className="text-sm font-semibold text-ink">
          Batch performance
        </span>
        <select
          aria-label="Select batch for analytics"
          value={selectedBatch}
          onChange={event => onBatchChange(event.target.value)}
          className="min-h-11 w-full rounded-control border border-line bg-surface px-3 text-sm text-ink"
        >
          <option value="">Select a batch…</option>
          {batchOptions.map(batch => (
            <option key={batch._id || batch.id} value={batch._id || batch.id}>
              {batch.name || "Untitled batch"}
            </option>
          ))}
        </select>
      </label>
      {selectedBatchAnalytics ? (
        <section
          aria-label={`${selectedBatchAnalytics.batchName} performance`}
          className="grid gap-4"
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Enrolled students"
              value={selectedBatchAnalytics.totalStudents ?? 0}
              note="Currently in this batch"
              tone="brand"
            />
            <StatCard
              label="Students with submissions"
              value={`${selectedBatchAnalytics.submissionRate ?? 0}%`}
              note="At least one submission"
              tone="warning"
            />
            <StatCard
              label="Attendance"
              value={`${selectedBatchAnalytics.attendancePercentage ?? 0}%`}
              note={`${selectedBatchAnalytics.totalAttendanceRecords ?? 0} records`}
              tone="success"
            />
          </div>
        </section>
      ) : (
        <p className="self-center text-sm text-muted" role="status">
          {selectedBatch && analyticsLoading
            ? "Loading batch metrics…"
            : "Select a batch to see its metrics."}
        </p>
      )}
    </div>
  );
}
