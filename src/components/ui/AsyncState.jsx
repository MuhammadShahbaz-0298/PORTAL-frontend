/* AsyncState: shared loading, error, and empty-state behavior. */
import { Alert, Button, Spinner } from 'reactstrap';
export function LoadingState({ text = 'Loading…' }) { return <div className="loading-state"><Spinner size="sm" /> {text}</div>; }
export function ErrorState({ message = 'Unable to load this section.', onRetry }) { return <Alert color="danger" className="error-state"><span>{message}</span>{onRetry && <Button color="link" className="retry-button" onClick={onRetry}>Try again</Button>}</Alert>; }
export function EmptyState({ title = 'Nothing here yet.', text = 'Records will appear here when available.' }) { return <div className="empty-state"><strong>{title}</strong><span>{text}</span></div>; }
export default function AsyncState({ loading, error, empty, children, onRetry }) { if (loading) return <LoadingState />; if (error) return <ErrorState message={error} onRetry={onRetry} />; if (empty) return <EmptyState {...(typeof empty === 'object' ? empty : {})} />; return children; }
