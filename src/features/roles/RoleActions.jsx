/* RoleActions: shared edit and removal controls for role rows and cards. */
import { Pencil, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import { confirmDialog } from "../../components/ui/ConfirmDialog";
import { isCoreRole } from "./rolesConfig";

export default function RoleActions({ role, layout = "table" }) {
  const dispatch = useDispatch();
  const pendingId = useSelector(state => state.roles.pendingId);
  const id = role._id || role.id;
  const locked = pendingId !== null;
  const busy = String(pendingId) === String(id);
  const canDelete = id && !isCoreRole(role.name);

  const remove = async () => {
    if (
      await confirmDialog({
        title: "Delete this role permanently?",
        text: `${role.label || role.name} will be permanently removed. Built-in roles cannot be deleted.`,
        confirmText: "Delete permanently",
        cancelText: "Keep role",
      })
    ) {
      dispatch.roles.remove({ id, name: role.label || role.name });
    }
  };

  return (
    <div
      className={layout === "card" ? "flex gap-2" : "flex justify-end gap-2"}
    >
      <Button
        variant="secondary"
        disabled={locked}
        onClick={() => dispatch.roles.openForm(role)}
        className={layout === "card" ? "flex-1" : ""}
      >
        <Pencil size={15} aria-hidden="true" />
        Edit
      </Button>
      {canDelete ? (
        <Button
          variant="danger"
          loading={busy}
          disabled={locked}
          onClick={remove}
          className={layout === "card" ? "flex-1" : ""}
        >
          <Trash2 size={15} aria-hidden="true" />
          Delete
        </Button>
      ) : null}
    </div>
  );
}
