/* MoreSheet: the phone overflow menu, driven by the same route config as the sidebar. */
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { classNames } from "../../lib/classNames";
import { getOverflowNavItems, isActivePath, NAV_ICONS } from "./navConfig";

export default function MoreSheet({ open, onClose }) {
  const { user } = useSelector(state => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = getOverflowNavItems(user);

  const signOut = () => {
    dispatch.auth.logout();
    onClose();
    navigate({ to: "/login" });
  };

  return (
    <Modal open={open} onClose={onClose} title="More">
      <p className="mb-4 text-sm text-muted">
        Every other page in your workspace.
      </p>

      {items.length ? (
        <nav aria-label="More pages">
          <ul className="grid gap-1">
            {items.map(item => {
              const Icon = NAV_ICONS[item.icon] || NAV_ICONS.dashboard;
              const active = isActivePath(location.pathname, item.path);

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={classNames(
                      "flex min-h-12 items-center gap-3 rounded-control px-3 text-sm font-medium transition",
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
      ) : (
        <p className="text-sm text-muted">No extra pages are available.</p>
      )}

      <div className="mt-4 border-t border-line pt-4">
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start text-danger hover:bg-danger-soft"
        >
          <LogOut size={18} aria-hidden="true" />
          Sign out
        </Button>
      </div>
    </Modal>
  );
}
