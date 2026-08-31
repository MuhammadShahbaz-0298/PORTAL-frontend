import { useEffect } from "react";
import { Check, X } from "lucide-react";

export default function ToastNotification({ message, onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div className="portal-toast" role="status" aria-live="polite">
      <span className="portal-toast-icon">
        <Check size={16} />
      </span>
      <span className="portal-toast-message">{message}</span>
      <button type="button" className="portal-toast-close" onClick={onClose} aria-label="Dismiss notification">
        <X size={16} />
      </button>
    </div>
  );
}
