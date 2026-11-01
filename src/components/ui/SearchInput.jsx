/* SearchInput: the search box every list page uses. */
import { useId } from "react";
import { Search, X } from "lucide-react";
import Input from "./Input";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  label = "Search",
  className = "",
}) {
  const id = useId();

  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <Search
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <Input
          id={id}
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={event => onChange(event.target.value)}
          className="pl-10 pr-12 [&::-webkit-search-cancel-button]:hidden"
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
          >
            <X size={18} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
