/* TimetableFormModal: create or edit a weekly slot, with errors kept inline. */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { DAYS_OF_WEEK } from "../../constants/app";

const EMPTY_FORM = {
  batchId: "",
  dayOfWeek: "monday",
  startTime: "",
  endTime: "",
  subject: "",
};

const initialForm = (batchId, editing) => ({
  ...EMPTY_FORM,
  batchId: editing ? "" : batchId,
  dayOfWeek: editing?.dayOfWeek || "monday",
  startTime: editing?.startTime || "",
  endTime: editing?.endTime || "",
  subject: editing?.subject || "",
});

function validate(form, editing) {
  const errors = {};
  if (!editing && !form.batchId) errors.batchId = "Choose a batch.";
  if (!DAYS_OF_WEEK.includes(form.dayOfWeek)) errors.dayOfWeek = "Choose a day.";
  if (!form.startTime) errors.startTime = "Enter a start time.";
  if (!form.endTime) errors.endTime = "Enter an end time.";
  else if (form.startTime && form.endTime <= form.startTime)
    errors.endTime = "End time must be after start time.";
  if (!form.subject.trim()) errors.subject = "Enter a subject.";
  return errors;
}

export default function TimetableFormModal({ batchId }) {
  const dispatch = useDispatch();
  const { formOpen, editing, formError, saving, batches } = useSelector(
    state => state.timetable
  );
  const [form, setForm] = useState(() => initialForm(batchId, editing));
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: "" }));
    if (formError) dispatch.timetable.setFormError("");
  };

  const close = () => {
    if (!saving) dispatch.timetable.closeForm();
  };

  const submit = async event => {
    event.preventDefault();
    const nextErrors = validate(form, editing);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const id = editing?._id || editing?.id;
    const payload = id
      ? {
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
          subject: form.subject.trim(),
        }
      : {
          batchId: form.batchId,
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
          subject: form.subject.trim(),
        };

    await dispatch.timetable.save({ entry: editing, payload, batchId });
  };

  return (
    <Modal
      open={formOpen}
      onClose={close}
      title={editing ? "Edit timetable entry" : "Add timetable entry"}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="timetable-form" loading={saving}>
            {editing ? "Save changes" : "Add entry"}
          </Button>
        </>
      }
    >
      <form id="timetable-form" onSubmit={submit} noValidate className="grid gap-4">
        {!editing ? (
          <FormField
            label="Batch"
            htmlFor="timetable-batch"
            required
            error={errors.batchId}
          >
            <select
              id="timetable-batch"
              value={form.batchId}
              aria-invalid={Boolean(errors.batchId)}
              onChange={event => update("batchId", event.target.value)}
              className="h-11 w-full rounded-control border border-line bg-surface px-3 text-base text-ink"
            >
              <option value="">Choose a batch</option>
              {batches.map(batch => (
                <option key={batch._id || batch.id} value={batch._id || batch.id}>
                  {batch.name || "Batch"}
                </option>
              ))}
            </select>
          </FormField>
        ) : null}

        <FormField label="Day" htmlFor="timetable-day" required error={errors.dayOfWeek}>
          <select
            id="timetable-day"
            value={form.dayOfWeek}
            onChange={event => update("dayOfWeek", event.target.value)}
            className="h-11 w-full rounded-control border border-line bg-surface px-3 text-base text-ink"
          >
            {DAYS_OF_WEEK.map(day => (
              <option key={day} value={day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Start time"
            htmlFor="timetable-start"
            required
            error={errors.startTime}
          >
            <Input
              id="timetable-start"
              type="time"
              value={form.startTime}
              invalid={Boolean(errors.startTime)}
              onChange={event => update("startTime", event.target.value)}
            />
          </FormField>
          <FormField
            label="End time"
            htmlFor="timetable-end"
            required
            error={errors.endTime}
          >
            <Input
              id="timetable-end"
              type="time"
              value={form.endTime}
              invalid={Boolean(errors.endTime)}
              onChange={event => update("endTime", event.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Subject" htmlFor="timetable-subject" required error={errors.subject}>
          <Input
            id="timetable-subject"
            value={form.subject}
            invalid={Boolean(errors.subject)}
            onChange={event => update("subject", event.target.value)}
          />
        </FormField>

        {formError ? (
          <div
            role="alert"
            className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
          >
            {formError}
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
