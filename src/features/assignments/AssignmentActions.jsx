/* AssignmentActions: edit and archive controls shared by the table and phone cards. */
import { Archive, Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { confirmDialog } from "../../components/ui/ConfirmDialog";
import { classNames } from "../../lib/classNames";
import { hasPermission } from "../../lib/permissions";

export default function AssignmentActions({ assignment, layout = "table" }) {
  const dispatch = useDispatch();
  const { pendingId } = useSelector(state => state.assignments);
  const user = useSelector(state => state.auth.user);
  const canEdit = hasPermission(user, "assignments.update", [
    "admin",
    "teacher",
  ]);
  const canDelete = hasPermission(user, "assignments.delete", [
    "admin",
    "teacher",
  ]);
  const id = assignment._id || assignment.id;
  const active = assignment.active !== false;
  const busy = String(pendingId) === String(id);
  const locked = pendingId !== null;

  if (!canEdit && !canDelete) return null;
  if (!active) {
    return <span className="text-xs font-medium text-muted">Archived</span>;
  }

  const askArchive = async () => {
    const confirmed = await confirmDialog({
      title: "Archive assignment?",
      text: "This assignment will be archived. Students will no longer be able to upload or edit submissions, and existing work and history are kept.",
      confirmText: "Archive assignment",
      cancelText: "Keep open",
    });

    if (confirmed) dispatch.assignments.archive({ id });
  };

  if (layout === "card") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {canEdit ? (
          <Button
            variant="secondary"
            onClick={() => dispatch.assignments.openForm(assignment)}
            disabled={locked}
          >
            <Pencil size={15} aria-hidden="true" />
            Edit
          </Button>
        ) : null}
        {canDelete ? (
          <Button variant="danger" onClick={askArchive} disabled={locked}>
            <Archive size={15} aria-hidden="true" />
            Archive
          </Button>
        ) : null}
        {busy ? (
          <Spinner
            size="sm"
            label="Updating assignment"
            className="text-brand"
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
          label="Updating assignment"
          className="mr-1 text-brand"
        />
      ) : null}
      {canEdit ? (
        <button
          type="button"
          onClick={() => dispatch.assignments.openForm(assignment)}
          disabled={locked}
          title="Edit assignment"
          aria-label={`Edit ${assignment.title}`}
          className={classNames(
            "grid h-11 w-11 place-items-center rounded-control text-muted transition",
            locked
              ? "cursor-not-allowed opacity-40"
              : "hover:bg-brand-soft hover:text-brand"
          )}
        >
          <Pencil size={17} aria-hidden="true" />
        </button>
      ) : null}
      {canDelete ? (
        <button
          type="button"
          onClick={askArchive}
          disabled={locked}
          title="Archive assignment"
          aria-label={`Archive ${assignment.title}`}
          className={classNames(
            "grid h-11 w-11 place-items-center rounded-control text-muted transition",
            locked
              ? "cursor-not-allowed opacity-40"
              : "hover:bg-danger-soft hover:text-danger"
          )}
        >
          <Archive size={17} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
