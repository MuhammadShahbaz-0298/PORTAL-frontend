/* MarkAttendanceModal: choose a batch and date, then tick who was present. */
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckSquare, UsersRound } from "lucide-react";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import SearchSelect from "../../components/ui/SearchSelect";
import Spinner from "../../components/ui/Spinner";
import { studentEmail, studentIdOf } from "./attendanceUtils";

export default function MarkAttendanceModal({ studentId }) {
  const dispatch = useDispatch();
  const {
    modalOpen,
    batches,
    batchesLoading,
    batchId,
    date,
    roster,
    presentIds,
    rosterLoading,
    rosterError,
    saving,
  } = useSelector(state => state.attendance);

  const options = useMemo(
    () =>
      batches.map(batch => ({
        value: batch._id || batch.id,
        label: batch.name || "Untitled batch",
      })),
    [batches]
  );

  const presentCount = presentIds.length;

  const close = () => dispatch.attendance.closeForm();

  const submit = async event => {
    event.preventDefault();
    await dispatch.attendance.save({ studentId });
  };

  return (
    <Modal
      open={modalOpen}
      onClose={close}
      title="Mark batch attendance"
      className="sm:max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="mark-attendance-form"
            loading={saving}
            disabled={!roster.length || rosterLoading}
          >
            <CheckSquare size={16} aria-hidden="true" />
            Save attendance
          </Button>
        </>
      }
    >
      <form
        id="mark-attendance-form"
        onSubmit={submit}
        noValidate
        className="grid gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Batch"
            htmlFor="attendance-batch"
            required
            hint={
              batchesLoading
                ? "Loading batches…"
                : "Only your batches appear here."
            }
          >
            <SearchSelect
              id="attendance-batch"
              aria-label="Batch"
              placeholder="Choose a batch"
              options={options}
              value={batchId}
              disabled={batchesLoading || saving}
              onChange={value =>
                dispatch.attendance.selectBatch({ batchId: value })
              }
            />
          </FormField>

          <FormField label="Date" htmlFor="attendance-date" required>
            <Input
              id="attendance-date"
              type="date"
              value={date}
              max={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 10)}
              disabled={saving}
              onChange={event =>
                dispatch.attendance.selectDate({ date: event.target.value })
              }
            />
          </FormField>
        </div>

        <div className="rounded-control border border-line">
          <div className="flex items-center justify-between gap-3 border-b border-line bg-canvas/70 px-3 py-2.5">
            <p className="text-sm font-semibold text-ink">
              Students in the batch
            </p>
            <p className="text-xs text-muted">
              {presentCount} of {roster.length} present
            </p>
          </div>

          <div className="grid gap-2 p-3">
            {rosterLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
                <Spinner
                  size="sm"
                  label="Loading batch roster"
                  className="text-brand"
                />
                Loading the roster…
              </div>
            ) : roster.length ? (
              roster.map(student => {
                const id = studentIdOf(student);
                const present = presentIds.some(
                  value => String(value) === String(id)
                );

                return (
                  <label
                    key={id}
                    className="flex min-h-14 cursor-pointer items-center gap-3 rounded-control border border-line bg-surface px-3 py-2 transition hover:bg-canvas"
                  >
                    <input
                      type="checkbox"
                      checked={present}
                      disabled={saving}
                      onChange={() => dispatch.attendance.togglePresent({ id })}
                      className="h-5 w-5 shrink-0 accent-brand"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">
                        {student.name || "Student"}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {studentEmail(student) || "No email on record"}
                      </span>
                    </span>
                    <span
                      className={
                        present
                          ? "shrink-0 text-xs font-semibold text-success"
                          : "shrink-0 text-xs font-semibold text-muted"
                      }
                    >
                      {present ? "Present" : "Absent"}
                    </span>
                  </label>
                );
              })
            ) : (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-canvas text-muted">
                  <UsersRound size={20} aria-hidden="true" />
                </span>
                <p className="text-sm font-medium text-ink">
                  {batchId
                    ? "No students are enrolled in this batch yet."
                    : "Choose a batch to load its students."}
                </p>
                <p className="text-xs text-muted">
                  Checked students are saved as present and the rest as absent.
                </p>
              </div>
            )}
          </div>
        </div>

        {rosterError ? (
          <div
            role="alert"
            className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
          >
            {rosterError}
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
