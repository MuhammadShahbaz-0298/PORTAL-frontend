/* Avatar: the single user profile image used by every page. */
import { classNames } from "../../lib/classNames";

export default function Avatar({ src, name, size = "md", className = "" }) {
  const initials = name
    ?.split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase();

  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <div
      className={classNames(
        "inline-flex items-center justify-center overflow-hidden rounded-full bg-brand-soft font-semibold text-brand",
        sizes[size] || sizes.md,
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials || "?"
      )}
    </div>
  );
}
