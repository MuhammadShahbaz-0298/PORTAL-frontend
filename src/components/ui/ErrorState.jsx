/* ErrorState: the friendly error message with a Retry button. */
import { classNames } from "../../lib/classNames";
import Button from "./Button";

export default function ErrorState({
  message = "Unable to load this section.",
  onRetry,
  className = "",
}) {
  return (
    <div
      className={classNames(
        "flex flex-col items-center gap-3 p-6 text-center",
        className
      )}
    >
      <strong className="text-sm font-medium text-danger">{message}</strong>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
