/* BottomNav: thumb-reach navigation for phones; desktop uses the sidebar. */
import { Link, useLocation } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { classNames } from "../../lib/classNames";
import {
  BOTTOM_NAV_HEIGHT_CLASS,
  BOTTOM_NAV_SAFE_CLASS,
} from "../../constants/layout";
import { getPrimaryNavItems, isActivePath, NAV_ICONS } from "./navConfig";

export default function BottomNav({ open, onOpenMore }) {
  const { user } = useSelector(state => state.auth);
  const location = useLocation();
  const items = getPrimaryNavItems(user);
  const moreActive =
    open || !items.some(item => isActivePath(location.pathname, item.path));

  return (
    <nav
      aria-label="Primary"
      className={classNames(
        "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface md:hidden",
        BOTTOM_NAV_SAFE_CLASS
      )}
    >
      <ul className={classNames("grid grid-cols-5", BOTTOM_NAV_HEIGHT_CLASS)}>
        {items.map(item => {
          const Icon = NAV_ICONS[item.icon] || NAV_ICONS.dashboard;
          const active = isActivePath(location.pathname, item.path);

          return (
            <li key={item.path}>
              <Link
                to={item.path}
                aria-current={active ? "page" : undefined}
                className={classNames(
                  "flex h-full flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold transition",
                  active ? "text-brand" : "text-muted hover:text-ink"
                )}
              >
                <Icon size={20} aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}

        <li className="col-start-5">
          <button
            type="button"
            onClick={onOpenMore}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={classNames(
              "flex h-full w-full flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold transition",
              moreActive ? "text-brand" : "text-muted hover:text-ink"
            )}
          >
            <MoreHorizontal size={20} aria-hidden="true" />
            <span>More</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
