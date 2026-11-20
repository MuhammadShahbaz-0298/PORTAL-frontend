/* TimetableControls: select a batch and open the add-entry form.
 * The controls appear only for users who may manage schedules.
 */
import { Plus } from "lucide-react";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { batchName } from "./timetableUtils";

export default function TimetableControls({
  batches,
  batchesLoading,
  batchId,
  onBatchChange,
  onAdd,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label
        htmlFor="timetable-batch"
        className="flex items-center gap-2 text-sm text-muted"
      >
        Batch
        {batchesLoading ? <Spinner size="sm" /> : null}
        <select
          id="timetable-batch"
          value={batchId || ""}
          onChange={event => onBatchChange(event.target.value)}
          className="h-9 rounded-control border border-line bg-surface px-2 text-sm text-ink"
        >
          <option value="">All batches</option>
          {batches.map(batch => (
            <option key={batch._id || batch.id} value={batch._id || batch.id}>
              {batchName(batch)}
            </option>
          ))}
        </select>
      </label>
      <Button onClick={onAdd}>
        <Plus size={16} aria-hidden="true" />
        Add entry
      </Button>
    </div>
  );
}
