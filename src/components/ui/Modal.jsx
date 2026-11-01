/* Modal: a bottom sheet on phones and a centred dialog on larger screens. */
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { classNames } from "../../lib/classNames";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className = "",
}) {
  const titleId = useId();
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    panelRef.current?.focus();
    document.body.style.overflow = "hidden";

    const handleKeyDown = event => {
      if (event.key === "Escape") onCloseRef.current();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused?.focus) previouslyFocused.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-overlay sm:items-center sm:p-4"
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={classNames(
          "flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-sheet bg-surface shadow-sheet outline-none sm:rounded-card sm:shadow-card",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-4 py-3 sm:px-6">
          {title ? (
            <h2
              id={titleId}
              className="pt-2 font-sans text-base font-semibold text-ink sm:text-lg"
            >
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-control text-muted hover:bg-canvas hover:text-ink"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>

        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-line bg-canvas/60 px-4 py-3 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
