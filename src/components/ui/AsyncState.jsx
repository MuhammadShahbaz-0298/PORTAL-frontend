/* AsyncState: shared loading, error, and empty-state behavior. */
import { Spinner } from "reactstrap";
import ToastNotification from "./ToastNotification";
export function LoadingState({ text = "Loading…" }) {
  return (
    <div className="loading-state">
      <Spinner size="sm" /> {text}
    </div>
  );
}
export function ErrorState({
  message = "Unable to load this section.",
  onRetry,
}) {
  return (
    <>
      <ToastNotification message={message} variant="error" onClose={() => {}} />
      {onRetry && onRetry()}
    </>
  );
}
export function EmptyState({
  title = "Nothing here yet.",
  text = "Records will appear here when available.",
}) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}
export default function AsyncState({
  loading,
  error,
  empty,
  children,
  onRetry,
}) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (empty)
    return <EmptyState {...(typeof empty === "object" ? empty : {})} />;
  return children;
}
