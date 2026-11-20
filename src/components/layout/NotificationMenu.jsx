/* NotificationMenu: poll and display the current user's messages.
 * The dropdown handles list rendering; this component owns menu actions.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell } from "lucide-react";
import Toast from "../ui/Toast";
import { confirmDialog } from "../ui/ConfirmDialog";
import { NOTIFICATION_POLL_INTERVAL_MS } from "../../constants/app";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationMenu() {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notifications);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { popup } = notifications;

  useEffect(() => {
    dispatch.notifications.load();
    const interval = setInterval(
      () => dispatch.notifications.load(),
      NOTIFICATION_POLL_INTERVAL_MS
    );
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const handler = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = useCallback(async () => {
    await Promise.all(
      notifications.items
        .filter(notification => !notification.read)
        .map(notification =>
          dispatch.notifications.markRead(notification._id || notification.id)
        )
    );
  }, [dispatch, notifications.items]);

  const clearAll = useCallback(async () => {
    const confirmed = await confirmDialog({
      title: "Clear all notifications?",
      text: "This permanently removes notifications from your account.",
      confirmText: "Clear all",
    });
    if (confirmed) await dispatch.notifications.clearAll();
  }, [dispatch]);

  const markRead = useCallback(
    notification =>
      dispatch.notifications.markRead(notification._id || notification.id),
    [dispatch]
  );

  const dismissPopup = useCallback(() => {
    if (popup?._id || popup?.id) {
      dispatch.notifications.markRead(popup._id || popup.id);
    }
    dispatch.notifications.clearPopup();
  }, [dispatch, popup]);

  const unread = notifications.unread || 0;

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen(value => !value)}
          className="relative grid h-9 w-9 place-items-center rounded-control border border-line bg-surface text-muted hover:text-ink"
          aria-label="Notifications"
          aria-expanded={open}
        >
          <Bell size={16} aria-hidden="true" />
          {unread > 0 ? (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          ) : null}
        </button>
        {open ? (
          <NotificationDropdown
            notifications={notifications}
            unread={unread}
            onMarkAllRead={markAllRead}
            onClearAll={clearAll}
            onMarkRead={markRead}
          />
        ) : null}
      </div>
      {popup ? (
        <Toast
          title={popup.title || "New notification"}
          message={popup.message || "You have a new notification."}
          onClose={dismissPopup}
        />
      ) : null}
    </>
  );
}
