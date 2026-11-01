/* UserActions: reset, activate/deactivate, and archive one account. */
import { Archive, KeyRound, Power, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { classNames } from "../../lib/classNames";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { confirmDialog } from "../../components/ui/ConfirmDialog";
import { hasPermission } from "../../lib/permissions";

export default function UserActions({ user, layout = "table" }) {
  const dispatch = useDispatch();
  const { pendingId } = useSelector(state => state.users);
  const currentUser = useSelector(state => state.auth.user);
  const canManage = hasPermission(currentUser, "users.manage", ["admin"]);
  const id = user._id || user.id;
  const locked = pendingId !== null;
  const busy = String(pendingId) === String(id);
  const archived = Boolean(user.archivedAt);
  const isSelf = [currentUser?.id, currentUser?._id]
    .filter(Boolean)
    .map(String)
    .includes(String(id));
  const name = user.name || user.email || "this user";
  const active = user.active !== false;

  const askReset = async () => {
    const confirmed = await confirmDialog({
      title: "Reset this password?",
      text: `${name} will be signed out and must choose a new password on their next sign-in.`,
      confirmText: "Reset password",
      cancelText: "Keep current",
    });
    if (confirmed) {
      dispatch.users.resetPassword({ id, email: user.email, name: user.name });
    }
  };

  const askArchive = async () => {
    const confirmed = await confirmDialog({
      title: "Archive this user?",
      text: `${name} will lose sign-in access. Their history is kept, and you can restore the account later.`,
      confirmText: "Archive account",
      cancelText: "Keep account",
    });
    if (confirmed) dispatch.users.archive({ id, name: user.name });
  };

  const askDelete = async () => {
    if (
      await confirmDialog({
        title: "Delete this user permanently?",
        text: "Permanent deletion is available only when the account has no linked history. Archive the account to keep its records.",
        confirmText: "Delete permanently",
        cancelText: "Keep account",
      })
    ) {
      dispatch.users.remove({ id, name: user.name });
    }
  };

  const toggleActive = async () => {
    if (!active) {
      dispatch.users.setActive({ id, active: true, name: user.name, archived });
      return;
    }

    const confirmed = await confirmDialog({
      title: "Deactivate this account?",
      text: `${name} will be signed out until you reactivate them. Their history is kept.`,
      confirmText: "Deactivate",
      cancelText: "Keep active",
    });
    if (confirmed)
      dispatch.users.setActive({ id, active: false, name: user.name });
  };

  if (!canManage) return null;

  if (layout === "card") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          onClick={askReset}
          disabled={locked || isSelf}
          className="col-span-2 w-full"
        >
          <KeyRound size={16} aria-hidden="true" />
          Reset password
        </Button>
        <Button
          variant="secondary"
          onClick={toggleActive}
          disabled={locked || isSelf}
        >
          <Power size={16} aria-hidden="true" />
          {archived ? "Restore" : active ? "Deactivate" : "Activate"}
        </Button>
        {!archived ? (
          <Button
            variant="danger"
            onClick={askArchive}
            disabled={locked || isSelf}
          >
            <Archive size={16} aria-hidden="true" />
            Archive
          </Button>
        ) : null}
        <Button
          variant="danger"
          onClick={askDelete}
          disabled={locked || isSelf}
        >
          <Trash2 size={16} aria-hidden="true" />
          Delete
        </Button>
        {busy ? (
          <Spinner
            size="sm"
            label="Updating account"
            className="col-span-2 justify-self-center text-brand"
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {busy ? (
        <Spinner
          size="sm"
          label="Updating account"
          className="mr-1 text-brand"
        />
      ) : null}
      <button
        type="button"
        onClick={askReset}
        disabled={locked || isSelf}
        aria-label={`Reset password for ${name}`}
        title="Reset password"
        className={classNames(
          "grid h-11 w-11 place-items-center rounded-control text-muted transition",
          locked || isSelf
            ? "cursor-not-allowed opacity-40"
            : "hover:bg-brand-soft hover:text-brand"
        )}
      >
        <KeyRound size={17} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={toggleActive}
        disabled={locked || isSelf}
        aria-label={
          archived
            ? `Restore ${name}`
            : active
              ? `Deactivate ${name}`
              : `Activate ${name}`
        }
        title={
          archived ? "Restore account" : active ? "Deactivate" : "Activate"
        }
        className={classNames(
          "grid h-11 w-11 place-items-center rounded-control text-muted transition",
          locked || isSelf
            ? "cursor-not-allowed opacity-40"
            : "hover:bg-brand-soft hover:text-brand"
        )}
      >
        <Power size={17} aria-hidden="true" />
      </button>
      {!archived ? (
        <button
          type="button"
          onClick={askArchive}
          disabled={locked || isSelf}
          aria-label={`Archive ${name}`}
          title="Archive account"
          className={classNames(
            "grid h-11 w-11 place-items-center rounded-control text-muted transition",
            locked || isSelf
              ? "cursor-not-allowed opacity-40"
              : "hover:bg-danger-soft hover:text-danger"
          )}
        >
          <Archive size={17} aria-hidden="true" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={askDelete}
        disabled={locked || isSelf}
        aria-label={`Permanently delete ${name}`}
        title="Delete permanently"
        className={classNames(
          "grid h-11 w-11 place-items-center rounded-control text-muted transition",
          locked || isSelf
            ? "cursor-not-allowed opacity-40"
            : "hover:bg-danger-soft hover:text-danger"
        )}
      >
        <Trash2 size={17} aria-hidden="true" />
      </button>
    </div>
  );
}
