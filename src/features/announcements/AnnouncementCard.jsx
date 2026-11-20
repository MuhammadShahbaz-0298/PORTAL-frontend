/* AnnouncementCard: audience, author, publish time, and permitted archive action.
 * Only admins and the original author can archive an announcement.
 */
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";

const formatDate = value => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function AnnouncementCard({
  announcement,
  currentUser,
  canManage,
  onArchive,
}) {
  const creator =
    typeof announcement.createdBy === "object" ? announcement.createdBy : null;
  const creatorId = creator?._id || creator?.id || announcement.createdBy;
  const canArchive =
    canManage &&
    (currentUser?.role === "admin" ||
      String(creatorId) === String(currentUser?._id || currentUser?.id));
  const isBatch = announcement.scope === "batch";

  return (
    <Card className="grid content-start gap-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Badge tone={isBatch ? "brand" : "success"}>
            {isBatch ? "Batch update" : "School-wide"}
          </Badge>
          {isBatch ? (
            <span className="truncate text-xs text-muted">
              {announcement.batch?.name || "Selected batch"}
            </span>
          ) : null}
        </div>
        <time
          className="text-xs text-muted"
          dateTime={announcement.createdAt || undefined}
        >
          {formatDate(announcement.createdAt)}
        </time>
      </div>
      <div>
        <h2 className="text-base font-semibold text-ink">
          {announcement.title}
        </h2>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted">
          {announcement.body}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
        <p className="truncate text-xs text-muted">
          {creator?.name ? `Posted by ${creator.name}` : "Announcement"}
        </p>
        {canArchive ? (
          <button
            type="button"
            onClick={() => onArchive(announcement._id || announcement.id)}
            className="shrink-0 text-xs font-semibold text-danger hover:underline"
          >
            Archive
          </button>
        ) : null}
      </div>
    </Card>
  );
}
