/* TimetableWeekGrid: render independent day cards for the weekly schedule.
 * Cards align to their contents so a busy day cannot stretch its neighbors.
 */
import Card from "../../components/ui/Card";
import TimetableCard from "./TimetableCard";

export default function TimetableWeekGrid({
  groups,
  canManage,
  onEdit,
  onArchive,
  archivingId,
}) {
  return (
    <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {groups.map(group => (
        <Card key={group.day} className="h-fit self-start overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 border-b border-line bg-canvas/70 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-brand-soft text-sm font-bold uppercase text-brand">
                {group.day.slice(0, 1)}
              </span>
              <div>
                <h2 className="text-sm font-semibold capitalize text-ink">
                  {group.day}
                </h2>
                <p className="text-xs text-muted">
                  {group.entries.length
                    ? "Scheduled classes"
                    : "No classes planned"}
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold tabular-nums text-muted">
              {group.entries.length}
            </span>
          </div>
          <div className="grid content-start gap-3 p-3">
            {group.entries.length ? (
              group.entries.map(entry => (
                <TimetableCard
                  key={entry._id || entry.id}
                  entry={entry}
                  canManage={canManage}
                  onEdit={onEdit}
                  onArchive={onArchive}
                  archiving={archivingId === (entry._id || entry.id)}
                />
              ))
            ) : (
              <div className="rounded-control border border-dashed border-line bg-canvas/60 px-3 py-4 text-center text-xs text-muted">
                This day is open.
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
