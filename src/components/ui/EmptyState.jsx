/* EmptyState: the friendly message shown when a list has no items. */
import { classNames } from "../../lib/classNames";

export default function EmptyState({
  title = "Nothing here yet.",
  text = "Records will appear here when available.",
  className = "",
}) {
  return (
    <div
      className={classNames(
        "flex flex-col items-center gap-2 p-6 text-center",
        className
      )}
    >
      <strong className="text-sm font-medium text-ink">{title}</strong>
      <span className="text-sm text-muted">{text}</span>
    </div>
  );
}
