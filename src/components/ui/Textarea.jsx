/* Textarea: a multi-line text input with the shared focus and error styling. */
import { classNames } from "../../lib/classNames";

export default function Textarea({
  invalid = false,
  className = "",
  ...props
}) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={classNames(
        "min-h-[120px] w-full rounded-control border bg-surface px-3 py-2 text-base text-ink placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-canvas",
        invalid
          ? "border-danger focus:border-danger"
          : "border-line focus:border-brand",
        className
      )}
      {...props}
    />
  );
}
