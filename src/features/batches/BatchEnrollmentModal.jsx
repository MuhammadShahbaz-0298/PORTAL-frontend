/* BatchEnrollmentModal: additive enrollment of students into the chosen cohort. */
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserMinus, UserPlus, Users } from "lucide-react";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Modal from "../../components/ui/Modal";
import SearchSelect from "../../components/ui/SearchSelect";
import Spinner from "../../components/ui/Spinner";
import { confirmDialog } from "../../components/ui/ConfirmDialog";
import { personEmail, personName } from "./batchUtils";

export default function BatchEnrollmentModal() {
  const dispatch = useDispatch();
  const {
    enrollOpen,
    enrollBatch,
    enrolled,
    enrolledLoading,
    enrollError,
    enrolling,
    eligibleStudents,
    eligibleLoading,
    enrollNotice,
    pendingId,
  } = useSelector(state => state.batches);

  const [studentId, setStudentId] = useState("");

  const enrolledIdSet = useMemo(() => {
    return new Set(enrolled.map(student => String(student._id || student.id)));
  }, [enrolled]);

  const availableStudents = useMemo(() => {
    return eligibleStudents.filter(
      student =>
        student.active !== false &&
        !enrolledIdSet.has(String(student._id || student.id))
    );
  }, [eligibleStudents, enrolledIdSet]);

  const studentOptions = useMemo(() => {
    return availableStudents.map(student => ({
      value: student._id || student.id,
      label: `${personName(student)}${student.email ? ` · ${student.email}` : ""}`,
    }));
  }, [availableStudents]);

  const close = () => {
    if (pendingId) return;
    setStudentId("");
    dispatch.batches.closeEnroll();
  };

  const submit = async event => {
    event.preventDefault();
    if (!studentId || enrolling) return;

    const ok = await dispatch.batches.enroll({ studentId });
    if (ok) {
      setStudentId("");
    }
  };

  return (
    <Modal
      open={enrollOpen}
      onClose={close}
      title={`Enroll students · ${enrollBatch?.name || "Batch"}`}
      className="sm:max-w-xl"
      footer={
        <Button
          variant="secondary"
          onClick={close}
          disabled={enrolling || Boolean(pendingId)}
        >
          Done
        </Button>
      }
    >
      <form onSubmit={submit} noValidate className="grid gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <FormField
            label="Student not yet enrolled"
            htmlFor="enroll-student"
            className="flex-1"
            hint={
              eligibleLoading
                ? "Loading eligible students…"
                : availableStudents.length === 0 && !eligibleLoading
                  ? "No eligible students are available. Create an unassigned student account or ask an administrator."
                  : undefined
            }
          >
            <SearchSelect
              id="enroll-student"
              aria-label="Student"
              placeholder={
                eligibleLoading ? "Loading students…" : "Choose a student"
              }
              options={studentOptions}
              value={studentId}
              disabled={
                eligibleLoading || availableStudents.length === 0 || enrolling
              }
              onChange={setStudentId}
            />
          </FormField>

          <Button
            type="submit"
            loading={enrolling}
            disabled={!studentId || eligibleLoading}
            className="shrink-0"
          >
            <UserPlus size={16} aria-hidden="true" />
            Enroll student
          </Button>
        </div>

        {enrollError ? (
          <div
            role="alert"
            className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
          >
            {enrollError}
          </div>
        ) : null}
        {enrollNotice ? (
          <p
            role="status"
            className="rounded-control border border-success/30 bg-success-soft px-3 py-2 text-sm font-medium text-success"
          >
            {enrollNotice}
          </p>
        ) : null}

        <div className="rounded-control border border-line">
          <div className="flex items-center justify-between border-b border-line bg-canvas/70 px-3 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              Currently enrolled
            </p>
            <p className="text-xs text-muted">
              {enrolled.length} learner{enrolled.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto p-2">
            {enrolledLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
                <Spinner
                  size="sm"
                  label="Loading enrolled students"
                  className="text-brand"
                />
                Loading enrolled students…
              </div>
            ) : enrolled.length ? (
              <ul className="divide-y divide-line/60">
                {enrolled.map(student => {
                  const id = student._id || student.id;
                  return (
                    <li
                      key={id}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-ink">
                        {personName(student)}
                      </span>
                      <span className="text-xs text-muted">
                        {personEmail(student) || "—"}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        className="min-h-9 shrink-0 px-2 text-danger hover:bg-danger-soft"
                        loading={pendingId === id}
                        disabled={enrolling || Boolean(pendingId)}
                        onClick={async () => {
                          const confirmed = await confirmDialog({
                            title: "Remove student from this batch?",
                            text: `${personName(student)} will lose access to this batch's quizzes and new work. Existing records will be kept.`,
                            confirmText: "Remove student",
                          });
                          if (confirmed) {
                            await dispatch.batches.removeStudent({
                              studentId: id,
                            });
                          }
                        }}
                        aria-label={`Remove ${personName(student)} from this batch`}
                      >
                        <UserMinus size={15} aria-hidden="true" />
                        Remove
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-canvas text-muted">
                  <Users size={16} aria-hidden="true" />
                </span>
                <p className="text-xs text-muted">
                  No students are enrolled in this batch yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
