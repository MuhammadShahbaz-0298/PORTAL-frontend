/* SearchSelect: styled native select for reliable mouse, keyboard, and touch use. */
import { classNames } from "../../lib/classNames";

export default function SearchSelect({
  options = [],
  value,
  onChange,
  getLabel = option => option.label,
  getValue = option => option.value,
  placeholder = "Select…",
  disabled = false,
  invalid = false,
  id,
  "aria-label": ariaLabel,
}) {
  return (
    <select
      id={id}
      value={value ?? ""}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      aria-label={ariaLabel}
      onChange={event => {
        const selected = options.find(
          option => String(getValue(option)) === event.target.value
        );
        onChange(selected ? getValue(selected) : null);
      }}
      className={classNames(
        "min-h-11 w-full rounded-control border bg-surface px-3 text-base text-ink focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-canvas",
        invalid
          ? "border-danger focus:border-danger"
          : "border-line focus:border-brand"
      )}
    >
      <option value="">{placeholder}</option>
      {options.map(option => (
        <option key={getValue(option)} value={getValue(option)}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  );
}
