/* Button: one button for every action, with a built-in loading state. */
import { classNames } from "../../lib/classNames";
import Spinner from "./Spinner";

const VARIANTS = {
  primary: "bg-brand text-white hover:bg-brand-hover",
  secondary: "border border-line bg-surface text-ink hover:bg-canvas",
  danger: "bg-danger text-white hover:bg-danger/90",
  ghost: "text-ink hover:bg-brand-soft",
};

const BASE_CLASSES =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

export default function Button({
  variant = "primary",
  type = "button",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classNames(
        BASE_CLASSES,
        VARIANTS[variant] || VARIANTS.primary,
        className
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" label="Working" /> : null}
      {children}
    </button>
  );
}

export function buttonClassName(variant = "primary", extra = "") {
  return classNames(BASE_CLASSES, VARIANTS[variant] || VARIANTS.primary, extra);
}
