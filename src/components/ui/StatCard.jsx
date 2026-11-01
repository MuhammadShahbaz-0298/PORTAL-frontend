/* StatCard: one dashboard metric with a label, value, and note. */
import { classNames } from "../../lib/classNames";

const TONES = {
  neutral: "bg-line",
  brand: "bg-brand",
  success: "bg-success",
  danger: "bg-danger",
  warning: "bg-warning",
};

export default function StatCard({ label, value, note, tone = "neutral" }) {
  return (
    <div className="relative overflow-hidden rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
      <span
        aria-hidden="true"
        className={classNames(
          "absolute inset-y-0 left-0 w-1",
          TONES[tone] || TONES.neutral
        )}
      />
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-ink">
        {value}
      </p>
      {note ? <p className="mt-1 text-xs text-muted">{note}</p> : null}
    </div>
  );
}
