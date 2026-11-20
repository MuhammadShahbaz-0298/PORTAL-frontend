/* NotificationDropdown: show, acknowledge, or clear a user's notifications.
 * The parent menu supplies actions and the current notification state.
 */
import { Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function NotificationDropdown({
  notifications,
  unread,
  onMarkAllRead,
  onClearAll,
  onMarkRead,
}) {
  return (
    <div className="absolute right-0 top-11 z-30 w-[min(20rem,calc(100vw-2rem))] rounded-card border border-line bg-surface p-2 shadow-card">
      <div className="flex items-center justify-between gap-2 px-2 py-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Notifications
        </p>
        <div className="flex items-center gap-2">
          {unread > 0 ? (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Mark all read
            </button>
          ) : null}
          {notifications.items.length ? (
            <button
              type="button"
              onClick={onClearAll}
              disabled={notifications.clearing}
              className="inline-flex items-center gap-1 text-xs font-semibold text-danger hover:underline disabled:opacity-50"
            >
              <Trash2 size={13} aria-hidden="true" />
              {notifications.clearing ? "Clearing…" : "Clear all"}
            </button>
          ) : null}
        </div>
      </div>
      {notifications.error ? (
        <p
          role="alert"
          className="mx-2 my-1 rounded-control bg-danger-soft px-2 py-1 text-xs text-danger"
        >
          {notifications.error}
        </p>
      ) : null}
      <ul className="max-h-72 overflow-auto">
        {notifications.items.length ? (
          notifications.items.map(notification => (
            <li
              key={notification._id || notification.id}
              className="rounded-control px-2 py-2 hover:bg-canvas"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium capitalize text-ink">
                    {String(notification.type || "notification").replace(
                      /[._]/g,
                      " "
                    )}
                  </p>
                  {notification.type === "new.quiz" && notification.link ? (
                    <Link
                      to={notification.link}
                      onClick={() => {
                        if (!notification.read) onMarkRead(notification);
                      }}
                      className="block text-left text-xs text-muted hover:text-brand"
                    >
                      {notification.message || "You have a new notification."}
                    </Link>
                  ) : (
                    <p className="text-xs text-muted">
                      {notification.message || "You have a new notification."}
                    </p>
                  )}
                  <p className="mt-0.5 text-[10px] text-muted">
                    {notification.createdAt
                      ? new Date(notification.createdAt).toLocaleString()
                      : ""}
                  </p>
                </div>
                {!notification.read ? (
                  <button
                    type="button"
                    onClick={() => onMarkRead(notification)}
                    className="shrink-0 text-xs font-semibold text-brand hover:underline"
                    aria-label="Mark notification as read"
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
            </li>
          ))
        ) : (
          <li className="px-2 py-2 text-xs text-muted">No notifications.</li>
        )}
      </ul>
    </div>
  );
}
