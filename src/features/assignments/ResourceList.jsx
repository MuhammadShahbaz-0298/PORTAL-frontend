/* ResourceList: file rows with download for everyone and archive for staff. */
import { connect } from "react-redux";
import { Archive, Download } from "lucide-react";
import Button from "../../components/ui/Button";
import { confirmDialog } from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import { formatDateTime } from "./assignmentUtils";

function ResourceList({
  assignmentId,
  items,
  loading,
  error,
  archivingId,
  canManage,
  download,
  archive,
}) {
  const onArchive = async resource => {
    const confirmed = await confirmDialog({
      title: "Archive resource?",
      text: `${resource.fileName} will be archived from this assignment.`,
      confirmText: "Archive resource",
    });
    if (confirmed)
      await archive({ assignmentId, resourceId: resource._id || resource.fileName });
  };

  return (
    <div className="mt-2">
      {error ? (
        <p
          role="alert"
          className="mb-3 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-6">
          <Spinner label="Loading resources" className="text-brand" />
        </div>
      ) : items.length ? (
        <ul className="divide-y divide-line rounded-control border border-line">
          {items.map(resource => {
            const id = resource._id || resource.fileName;
            return (
              <li
                key={id}
                className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {resource.fileName}
                  </p>
                  <p className="text-xs text-muted">
                    Added {formatDateTime(resource.uploadedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      download({
                        assignmentId,
                        resourceId: id,
                        fileName: resource.fileName,
                      })
                    }
                  >
                    <Download size={15} aria-hidden="true" />
                    Download
                  </Button>
                  {canManage ? (
                    <Button
                      variant="ghost"
                      loading={archivingId === id}
                      onClick={() => onArchive(resource)}
                    >
                      <Archive size={15} aria-hidden="true" />
                      Archive
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted">No resources attached yet.</p>
      )}
    </div>
  );
}

const mapState = state => ({
  items: state.assignmentResources.items,
  loading: state.assignmentResources.loading,
  error: state.assignmentResources.error,
  archivingId: state.assignmentResources.archivingId,
});

const mapDispatch = dispatch => ({
  download: dispatch.assignmentResources.download,
  archive: dispatch.assignmentResources.archive,
});

export default connect(mapState, mapDispatch)(ResourceList);
