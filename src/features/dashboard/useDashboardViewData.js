/* useDashboardViewData: derive the dashboard's visible queues and events.
 * All date filtering uses the same captured time for a consistent render.
 */
import { useMemo } from "react";

export function useDashboardViewData({
  assignments,
  submissions,
  events,
  quizzes,
  role,
  currentTime,
}) {
  const openAssignments = useMemo(
    () =>
      assignments
        .filter(
          item =>
            item.active !== false &&
            item.dueDate &&
            new Date(item.dueDate).getTime() > currentTime
        )
        .sort(
          (left, right) =>
            new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime()
        ),
    [assignments, currentTime]
  );
  const awaiting = useMemo(
    () => submissions.filter(item => item.status !== "graded"),
    [submissions]
  );
  const upcomingEvents = useMemo(
    () =>
      [...events]
        .filter(item => new Date(item.date).getTime() >= currentTime)
        .sort((left, right) => new Date(left.date) - new Date(right.date))
        .slice(0, 5),
    [events, currentTime]
  );
  const availableQuizzes = role === "student" ? quizzes : [];

  return {
    openAssignments,
    awaiting,
    upcomingEvents,
    availableQuizzes,
    queue: role === "student" ? openAssignments : awaiting,
  };
}
