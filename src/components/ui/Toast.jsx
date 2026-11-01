/* Toast: fixed, auto-dismissing page notification. */
import { useEffect } from "react";
import { X } from "lucide-react";
import { classNames } from "../../lib/classNames";

const TONES = {
  neutral: "bg-surface text-ink",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  error: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
};

export default function Toast({
  tone = "neutral",
  title,
  message,
  onClose,
  className = "",
}) {
  useEffect(() => {
    if (!title && !message) return undefined;

    const timer = setTimeout(() => onClose?.(), 5000);
    return () => clearTimeout(timer);
  }, [title, message, onClose]);

  if (!title && !message) return null;

  return (
    <div
      role={tone === "error" || tone === "danger" ? "alert" : "status"}
      aria-live={tone === "error" || tone === "danger" ? "assertive" : "polite"}
      className={classNames(
        "pointer-events-auto fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-card border border-line px-4 py-3 shadow-toast sm:right-6 sm:top-6",
        TONES[tone] || TONES.neutral,
        className
      )}
    >
      <div className="flex-1">
        {title ? <p className="text-sm font-semibold">{title}</p> : null}
        {message ? <p className="mt-1 text-sm">{message}</p> : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-control text-muted hover:bg-canvas hover:text-ink"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
