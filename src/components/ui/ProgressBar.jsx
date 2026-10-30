export default function ProgressBar({
  value = null,
  label,
  valueLabel,
  completedLabel,
}) {
  let message = label;
  if (value !== null) {
    message = `${value}% ${valueLabel}`;
    if (value === 100 && completedLabel) message = completedLabel;
  }

  return (
    <div className="transfer-progress">
      <div
        className="transfer-progress-track"
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={value ?? undefined}
      >
        <div
          className={`transfer-progress-fill${value === null ? " is-indeterminate" : ""}`}
          style={value === null ? undefined : { width: `${value}%` }}
        />
      </div>
      <small className="transfer-progress-label">{message}</small>
    </div>
  );
}
