/* Brand: the portal mark and wordmark, used by the sidebar and the phone top bar. */
import { Link } from "@tanstack/react-router";
import { env } from "../../config/env";

export default function Brand({ compact = false }) {
  return (
    <Link
      to="/dashboard"
      aria-label={`${env.appTitle} dashboard`}
      className="flex min-w-0 items-center gap-3 rounded-control"
    >
      <span
        aria-hidden="true"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-brand text-sm font-bold text-white"
      >
        P
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ink">
          {env.appTitle}
        </span>
        {compact ? null : (
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Learning operations
          </span>
        )}
      </span>
    </Link>
  );
}
