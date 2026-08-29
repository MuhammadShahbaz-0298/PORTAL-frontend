/* SearchableSelect: keyboard-friendly typeahead selection for portal forms. */
import { useEffect, useMemo, useRef, useState } from "react";
export default function SearchableSelect({
  label,
  placeholder = "Select…",
  options = [],
  value,
  onChange,
  required = false,
  disabled = false,
  getLabel = option => option.label,
  getValue = option => option.value,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(
    option => String(getValue(option)) === String(value)
  );
  useEffect(() => {
    const handleClick = event => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  const filtered = useMemo(
    () =>
      options.filter(option =>
        getLabel(option).toLowerCase().includes(query.toLowerCase())
      ),
    [options, query, getLabel]
  );
  return (
    <div className="searchable-select" ref={ref}>
      <label>{label}</label>
      <input
        required={required}
        disabled={disabled}
        value={open ? query : selected ? getLabel(selected) : ""}
        placeholder={placeholder}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
        onChange={event => {
          setQuery(event.target.value);
          setOpen(true);
        }}
      />
      <input type="hidden" value={value || ""} required={required} readOnly />
      {open && !disabled && (
        <div className="searchable-options">
          {filtered.length ? (
            filtered.map(option => (
              <button
                type="button"
                key={getValue(option)}
                onClick={() => {
                  onChange(getValue(option));
                  setQuery("");
                  setOpen(false);
                }}
              >
                {getLabel(option)}
              </button>
            ))
          ) : (
            <span className="searchable-empty">No matches</span>
          )}
        </div>
      )}
    </div>
  );
}
