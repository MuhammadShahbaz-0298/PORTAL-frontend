/* ProgressBar: upload and download progress with a plain bar and label. */
import { classNames } from "../../lib/classNames";

export default function ProgressBar({
  value = null,
  label,
  valueLabel,
  completedLabel,
}) {
  const progress = Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : null;
  const complete = progress === 100;
  const status =
    complete && completedLabel
      ? completedLabel
      : progress === null
        ? label
        : `${progress}${valueLabel || "%"}`;

  return (
    <div className="mt-2 grid gap-2 rounded-control border border-line bg-canvas p-3">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-muted">
          {complete
            ? completedLabel || "Complete"
            : progress === null
              ? "In progress"
              : status}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuetext={status}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress ?? undefined}
        className="h-2.5 overflow-hidden rounded-full bg-line"
      >
        <div
          className={classNames(
            "h-full rounded-full bg-brand transition-[width] duration-300",
            progress === null ? "w-1/3 animate-pulse" : ""
          )}
          style={progress === null ? undefined : { width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
