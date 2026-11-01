/* Sidebar: desktop-only navigation; phones use the bottom bar and More sheet. */
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Brand from "./Brand";
import Avatar from "../ui/Avatar";
import { classNames } from "../../lib/classNames";
import { getVisibleNavItems, isActivePath, NAV_ICONS } from "./navConfig";

export default function Sidebar() {
  const { user } = useSelector(state => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = getVisibleNavItems(user);

  const signOut = () => {
    dispatch.auth.logout();
    navigate({ to: "/login" });
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface md:flex">
      <div className="px-5 py-5">
        <Brand />
      </div>

      <p className="px-6 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        Workspace
      </p>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 pb-4">
        <ul className="grid gap-1">
          {items.map(item => {
            const Icon = NAV_ICONS[item.icon] || NAV_ICONS.dashboard;
            const active = isActivePath(location.pathname, item.path);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  aria-current={active ? "page" : undefined}
                  className={classNames(
                    "flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-medium transition",
                    active
                      ? "bg-brand-soft text-brand"
                      : "text-ink hover:bg-canvas"
                  )}
                >
                  <Icon
                    size={18}
                    aria-hidden="true"
                    className={active ? "text-brand" : "text-muted"}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2 rounded-control bg-canvas p-2">
          <Avatar name={user?.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">
              {user?.name || "Signed in"}
            </p>
            <p className="truncate text-xs capitalize text-muted">
              {user?.role || "member"}
            </p>
          </div>
          <button
            type="button"
            onClick={signOut}
            aria-label="Sign out"
            title="Sign out"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-control text-muted transition hover:bg-surface hover:text-danger"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
