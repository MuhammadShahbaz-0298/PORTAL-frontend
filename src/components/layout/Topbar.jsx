/* Topbar: current page, theme toggle, and account identity.
 * Notification actions are delegated to NotificationMenu.
 */
import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { connect } from "react-redux";
import { Moon, Sun } from "lucide-react";
import Avatar from "../ui/Avatar";
import Brand from "./Brand";
import NotificationMenu from "./NotificationMenu";
import { getVisibleNavItems, isActivePath } from "./navConfig";

function Topbar({ user }) {
  const location = useLocation();
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const current = getVisibleNavItems(user).find(item =>
    isActivePath(location.pathname, item.path)
  );
  const title = current?.label || "Dashboard";

  // Dark mode persistence + apply.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

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
          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={() => setDark(value => !value)}
            className="grid h-9 w-9 place-items-center rounded-control border border-line bg-surface text-muted hover:text-ink"
            aria-label="Toggle dark mode"
          >
            {dark ? (
              <Sun size={16} aria-hidden="true" />
            ) : (
              <Moon size={16} aria-hidden="true" />
            )}
          </button>

          <NotificationMenu />
        </div>
      </div>
    </header>
  );
}

const mapState = state => ({
  user: state.auth.user,
});
export default connect(mapState)(Topbar);
