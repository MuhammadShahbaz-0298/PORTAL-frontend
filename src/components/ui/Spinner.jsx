/* Spinner: the single loading indicator used by buttons, tables, and pages. */
import { classNames } from "../../lib/classNames";

const SIZES = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-9 w-9 border-[3px]",
};

export default function Spinner({
  size = "md",
  label = "Loading",
  className = "",
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={classNames(
        "inline-block animate-spin rounded-full border-current border-r-transparent",
        SIZES[size] || SIZES.md,
        className
      )}
    />
  );
}
