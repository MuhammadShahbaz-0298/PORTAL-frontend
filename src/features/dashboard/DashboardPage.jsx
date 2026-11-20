/* DashboardPage: compose role-scoped work, insights, and upcoming events.
 * Focused components keep each dashboard section independently readable.
 */
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import WeightedGradeCard from "../../components/ui/WeightedGradeCard";
import { hasPermission } from "../../lib/permissions";
import DashboardActivitySections from "./DashboardActivitySections";
import DashboardAnalyticsPanel from "./DashboardAnalyticsPanel";
import DashboardHeader from "./DashboardHeader";
import DashboardOverviewStats from "./DashboardOverviewStats";
import { useDashboardAnalyticsSelection } from "./useDashboardAnalyticsSelection";
import { useDashboardViewData } from "./useDashboardViewData";

function DashboardPage({
  user,
  data,
  analytics,
  events,
  batchOptions,
  loading,
  error,
  load,
  loadAnalyticsOverview,
  loadAnalyticsBatch,
  clearAnalyticsBatch,
  loadBatches,
  loadEvents,
  loadQuizzes,
  quizzes,
  quizzesLoading,
  quizzesError,
}) {
  const role = user?.role;
  const canViewAnalytics = hasPermission(user, "analytics.view", [
    "admin",
    "teacher",
  ]);
  const [currentTime] = useState(() => Date.now());
  const { selectedBatch, setSelectedBatch, selectedBatchAnalytics } =
    useDashboardAnalyticsSelection({
      enabled: canViewAnalytics,
      analytics,
      loadOverview: loadAnalyticsOverview,
      loadBatch: loadAnalyticsBatch,
      clearBatch: clearAnalyticsBatch,
      loadBatches,
    });
  const studentId = role === "student" ? user?._id || user?.id : "";
  const assignmentBatch = data.assignments.find(item => item.batch)?.batch;
  const batchId =
    typeof assignmentBatch === "string"
      ? assignmentBatch
      : assignmentBatch?._id || assignmentBatch?.id || "";

  useEffect(() => {
    load({ role });
    loadEvents();
    if (role === "student") loadQuizzes();
  }, [load, loadEvents, loadQuizzes, role]);

  const { openAssignments, awaiting, upcomingEvents, availableQuizzes, queue } =
    useDashboardViewData({
      assignments: data.assignments,
      submissions: data.submissions,
      events: events.items,
      quizzes,
      role,
      currentTime,
    });

  return (
    <div className="font-sans">
      <DashboardHeader date={new Date(currentTime)} />
      <DashboardOverviewStats
        role={role}
        openAssignments={openAssignments.length}
        awaiting={awaiting.length}
        availableQuizzes={availableQuizzes.length}
        activeBatches={data.batches.length}
        error={error}
        onRetry={() => load({ role })}
      />
      {canViewAnalytics ? (
        <DashboardAnalyticsPanel
          analytics={analytics}
          batchOptions={batchOptions}
          selectedBatch={selectedBatch}
          selectedBatchAnalytics={selectedBatchAnalytics}
          onBatchChange={setSelectedBatch}
          onRetry={loadAnalyticsOverview}
        />
      ) : null}
      {studentId && batchId ? (
        <div className="mt-4">
          <WeightedGradeCard studentId={studentId} batchId={batchId} />
        </div>
      ) : null}
      <DashboardActivitySections
        role={role}
        queue={queue}
        loading={loading}
        events={upcomingEvents}
        quizzes={availableQuizzes}
        quizzesLoading={quizzesLoading}
        quizzesError={quizzesError}
        onQuizRetry={loadQuizzes}
      />
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
  analytics: state.analytics,
  events: state.events,
  batchOptions: state.batches.items || [],
  quizzes: state.quizzes.items,
  quizzesLoading: state.quizzes.loading,
  quizzesError: state.quizzes.error,
  loading: state.dashboard.loading,
  error: state.dashboard.error,
});

const mapDispatch = dispatch => ({
  load: dispatch.dashboard.load,
  loadAnalyticsOverview: dispatch.analytics.loadOverview,
  loadAnalyticsBatch: dispatch.analytics.loadBatch,
  clearAnalyticsBatch: dispatch.analytics.clearBatch,
  loadBatches: dispatch.batches.load,
  loadEvents: dispatch.events.load,
  loadQuizzes: dispatch.quizzes.load,
});

export default connect(mapState, mapDispatch)(DashboardPage);
