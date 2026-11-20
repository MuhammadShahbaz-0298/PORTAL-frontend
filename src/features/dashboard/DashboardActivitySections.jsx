/* DashboardActivitySections: group the work queue and upcoming events.
 * Each section owns its role-specific presentation.
 */
import DashboardUpcomingEvents from "./DashboardUpcomingEvents";
import DashboardWorkQueue from "./DashboardWorkQueue";
import DashboardAvailableQuizzes from "./DashboardAvailableQuizzes";

export default function DashboardActivitySections({
  role,
  queue,
  loading,
  events,
  quizzes,
  quizzesLoading,
  quizzesError,
  onQuizRetry,
}) {
  const isStudent = role === "student";
  return (
    <div
      className={`mt-4 grid items-start gap-4 ${isStudent ? "md:grid-cols-2" : ""}`}
    >
      <DashboardWorkQueue role={role} queue={queue} loading={loading} />
      {isStudent ? (
        <DashboardAvailableQuizzes
          quizzes={quizzes}
          loading={quizzesLoading}
          error={quizzesError}
          onRetry={onQuizRetry}
        />
      ) : null}
      <div className={isStudent ? "md:col-span-2" : ""}>
        <DashboardUpcomingEvents events={events} />
      </div>
    </div>
  );
}
