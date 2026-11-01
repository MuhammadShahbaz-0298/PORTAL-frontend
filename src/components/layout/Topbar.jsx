/* Topbar: page context on every screen and account identity on phones. */
import { useLocation } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import Avatar from "../ui/Avatar";
import Brand from "./Brand";
import { getVisibleNavItems, isActivePath } from "./navConfig";

export default function Topbar() {
  const { user } = useSelector(state => state.auth);
  const location = useLocation();
  const current = getVisibleNavItems(user).find(item =>
    isActivePath(location.pathname, item.path)
  );
  const title = current?.label || "Dashboard";

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur md:bg-canvas/85">
      <div className="mx-auto flex h-16 w-full max-w-content items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="md:hidden">
            <Brand compact />
          </span>
          <div className="hidden min-w-0 md:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Workspace
            </p>
            <p className="truncate text-sm font-semibold text-ink">{title}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden rounded-full bg-canvas px-3 py-1 text-xs font-semibold capitalize text-muted sm:inline-flex">
            {user?.role || "member"}
          </span>
          <Avatar name={user?.name} size="sm" />
        </div>
      </div>
    </header>
  );
}
