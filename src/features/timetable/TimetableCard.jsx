/* TimetableCard: one weekly slot with its time and batch immediately visible. */
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { batchName, timeRange } from "./timetableUtils";

export default function TimetableCard({
  entry,
  canManage = false,
  onEdit,
  onArchive,
  archiving = false,
}) {
  return (
    <div className="relative overflow-hidden rounded-control border border-line bg-surface p-3">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-brand"
      />
      <div className="flex items-start justify-between gap-3 pl-1">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {entry.subject || "Class"}
          </p>
          <p className="mt-1 truncate text-xs text-muted">
            {batchName(entry.batch)}
          </p>
        </div>
        <Badge tone="brand">{timeRange(entry)}</Badge>
      </div>
      {canManage ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-2">
          <Button variant="ghost" onClick={() => onEdit?.(entry)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            loading={archiving}
            onClick={() => onArchive?.(entry)}
          >
            Archive
          </Button>
        </div>
      ) : null}
    </div>
  );
}
