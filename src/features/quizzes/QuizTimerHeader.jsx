/* QuizTimerHeader: keep progress and the countdown visible during the attempt.
 * The remaining time is calculated from the server's deadline.
 */
import { Clock3 } from "lucide-react";
import Badge from "../../components/ui/Badge";

function formatTime(seconds) {
  if (seconds === null) return "No timer";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  const clockParts = [minutes, remainder];
  if (hours) clockParts.unshift(hours);
  return clockParts.map(part => String(part).padStart(2, "0")).join(":");
}

export default function QuizTimerHeader({
  currentIndex,
  questionCount,
  quizTitle,
  remainingSeconds,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Question {currentIndex + 1} of {questionCount}
        </p>
        <h2 className="truncate text-base font-semibold text-ink">
          {quizTitle}
        </h2>
      </div>
      <Badge
        tone={
          remainingSeconds !== null && remainingSeconds <= 60
            ? "warning"
            : "brand"
        }
      >
        <Clock3 size={14} aria-hidden="true" />
        <span aria-live="polite">{formatTime(remainingSeconds)}</span>
      </Badge>
    </div>
  );
}
