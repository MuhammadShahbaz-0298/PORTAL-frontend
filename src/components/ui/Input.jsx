/* Input: text input with the shared focus and error styling. */
import { classNames } from "../../lib/classNames";

export default function Input({ invalid = false, className = "", ...props }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={classNames(
        "min-h-11 w-full rounded-control border bg-surface px-3 text-base text-ink placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-canvas",
        invalid
          ? "border-danger focus:border-danger"
          : "border-line focus:border-brand",
        className
      )}
      {...props}
    />
  );
}
