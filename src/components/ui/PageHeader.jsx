/* Shared UI exports kept filename-compatible with the reference structure. */
import { Alert, Spinner } from "reactstrap";
export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function StatusBadge({ children, tone = "neutral" }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}
export function LoadingState({ text = "Loading…" }) {
  return (
    <div className="loading-state">
      <Spinner size="sm" /> {text}
    </div>
  );
}
export function ErrorState({ message = "Unable to load this section." }) {
  return (
    <Alert color="danger" className="error-state">
      {message}
    </Alert>
  );
}
export default PageHeader;
