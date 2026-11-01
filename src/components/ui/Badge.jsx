/* Badge: small status pill with a fixed set of tones. */
import { classNames } from "../../lib/classNames";

const TONES = {
  neutral: "bg-canvas text-muted",
  brand: "bg-brand-soft text-brand",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
};

export default function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        TONES[tone] || TONES.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}
