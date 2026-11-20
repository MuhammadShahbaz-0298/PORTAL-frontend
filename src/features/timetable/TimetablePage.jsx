/* TimetablePage: a batch's weekly schedule from the real timetable API. */
import { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import Card from "../../components/ui/Card";
import { confirmDialog } from "../../components/ui/ConfirmDialog";
import ErrorState from "../../components/ui/ErrorState";
import PageHeader from "../../components/ui/PageHeader";
import Spinner from "../../components/ui/Spinner";
import { hasPermission } from "../../lib/permissions";
import TimetableControls from "./TimetableControls";
import TimetableFormModal from "./TimetableFormModal";
import TimetableWeekGrid from "./TimetableWeekGrid";
import { days } from "./timetableUtils";

function TimetablePage({
  timetable,
  user,
  load,
  loadBatches,
  selectBatch,
  openForm,
  archive,
}) {
  const canManage = hasPermission(user, "timetable.manage", [
    "admin",
    "teacher",
  ]);

  useEffect(() => {
    load({ batchId: timetable.batchId });
    if (canManage) loadBatches();
  }, [load, loadBatches, canManage, timetable.batchId]);

  const grouped = useMemo(
    () =>
      days.map(day => ({
        day,
        entries: timetable.items
          .filter(entry => entry.dayOfWeek === day)
          .sort((left, right) =>
            String(left.startTime || "").localeCompare(
              String(right.startTime || "")
            )
          ),
      })),
    [timetable.items]
  );

  const onArchive = async entry => {
    const confirmed = await confirmDialog({
      title: "Archive timetable entry?",
      text: `${entry.subject || "This class"} will be archived from the timetable.`,
      confirmText: "Archive entry",
    });
    if (confirmed)
      await archive({
        id: entry._id || entry.id,
        batchId: timetable.batchId,
      });
  };

  return (
    <div className="font-sans">
      <PageHeader
        eyebrow="Weekly plan"
        title="Timetable"
        description="Scheduled classes for your batch, grouped by day."
        action={
          canManage ? (
            <TimetableControls
              batches={timetable.batches}
              batchesLoading={timetable.batchesLoading}
              batchId={timetable.batchId}
              onBatchChange={selectBatch}
              onAdd={() => openForm(null)}
            />
          ) : null
        }
      />

      {timetable.pageError ? (
        <p
          role="alert"
          className="mb-4 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
        >
          {timetable.pageError}
        </p>
      ) : null}
      {timetable.notice ? (
        <p
          role="status"
          className="mb-4 rounded-control border border-success/30 bg-success-soft px-3 py-2 text-sm font-medium text-success"
        >
          {timetable.notice}
        </p>
      ) : null}

      {timetable.error ? (
        <Card className="mb-4">
          <ErrorState
            message={timetable.error}
            onRetry={() => load({ batchId: timetable.batchId })}
          />
        </Card>
      ) : null}

      {timetable.loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" label="Loading timetable" className="text-brand" />
        </div>
      ) : (
        <TimetableWeekGrid
          groups={grouped}
          canManage={canManage}
          onEdit={openForm}
          onArchive={onArchive}
          archivingId={timetable.archivingId}
        />
      )}

      {canManage && timetable.formOpen ? (
        <TimetableFormModal
          key={
            timetable.editing?._id ||
            timetable.editing?.id ||
            `new-${timetable.batchId || "all"}`
          }
          batchId={timetable.batchId}
        />
      ) : null}
    </div>
  );
}

const mapState = state => ({
  timetable: state.timetable,
  user: state.auth.user,
});

const mapDispatch = dispatch => ({
  load: dispatch.timetable.load,
  loadBatches: dispatch.timetable.loadBatches,
  selectBatch: dispatch.timetable.selectBatch,
  openForm: dispatch.timetable.openForm,
  archive: dispatch.timetable.archive,
});

export default connect(mapState, mapDispatch)(TimetablePage);
