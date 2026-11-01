/* BatchCard: one cohort with its teacher, learner count, and actions. */
import { useDispatch, useSelector } from "react-redux";
import { Archive, Pencil, Trash2, UserPlus, UsersRound } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import { confirmDialog } from "../../components/ui/ConfirmDialog";
import { getLearnerCount, teacherName } from "./batchUtils";

export default function BatchCard({ batch, canEdit, canDelete, canEnroll }) {
  const dispatch = useDispatch();
  const { pendingId } = useSelector(state => state.batches);
  const id = batch._id || batch.id;
  const busy = String(pendingId) === String(id);
  const locked = pendingId !== null;
  const learners = getLearnerCount(batch);

  const askArchive = async () => {
    const confirmed = await confirmDialog({
      title: "Archive batch?",
      text: `${batch.name || "This batch"} will be removed from active batches. Enrollments and history are kept.`,
      confirmText: "Archive batch",
      cancelText: "Keep batch",
    });

    if (confirmed) dispatch.batches.archive({ id });
  };

  const askDelete = async () => {
    const confirmed = await confirmDialog({
      title: "Delete this batch permanently?",
      text: "Permanent deletion is available only when the batch has no linked history. Archive it to preserve enrollments and records.",
      confirmText: "Delete permanently",
      cancelText: "Keep batch",
    });

    if (confirmed) dispatch.batches.remove({ id });
  };

  return (
    <Card className="flex h-full flex-col">
      <div className="flex-1 p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-control bg-brand-soft text-brand">
            <UsersRound size={18} aria-hidden="true" />
          </span>
          <Badge tone="brand">
            {learners} learner{learners === 1 ? "" : "s"}
          </Badge>
        </div>

        <h2 className="mt-3 font-sans text-lg font-semibold tracking-tight text-ink">
          {batch.name || "Untitled batch"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Teacher · {teacherName(batch.teacher)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line p-3">
        {canEnroll ? (
          <Button
            variant="secondary"
            onClick={() => dispatch.batches.openEnroll({ batch })}
            disabled={locked}
          >
            <UserPlus size={15} aria-hidden="true" />
            Enroll
          </Button>
        ) : null}
        {canEdit ? (
          <Button
            variant="secondary"
            onClick={() => dispatch.batches.openForm({ batch })}
            disabled={locked}
          >
            <Pencil size={15} aria-hidden="true" />
            Edit
          </Button>
        ) : null}
        {canDelete ? (
          <>
            <Button
              variant="ghost"
              onClick={askArchive}
              disabled={locked}
              className="text-danger hover:bg-danger-soft"
            >
              <Archive size={15} aria-hidden="true" />
              Archive
            </Button>
            <Button variant="danger" onClick={askDelete} disabled={locked}>
              <Trash2 size={15} aria-hidden="true" />
              Delete
            </Button>
          </>
        ) : null}
        {busy ? (
          <Spinner size="sm" label="Archiving batch" className="text-brand" />
        ) : null}
      </div>
    </Card>
  );
}
