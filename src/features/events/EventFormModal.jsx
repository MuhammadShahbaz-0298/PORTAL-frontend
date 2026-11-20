import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import SearchSelect from "../../components/ui/SearchSelect";
import Textarea from "../../components/ui/Textarea";

const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  endDate: "",
  batchId: "",
};

const toLocalInput = value => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
};

function validate(form, isTeacher) {
  const errors = {};
  if (!form.title.trim()) errors.title = "Give this event a title.";
  if (!form.date) errors.date = "Choose a start date.";
  else if (Number.isNaN(new Date(form.date).getTime()))
    errors.date = "Enter a valid start date.";
  if (
    form.endDate &&
    new Date(form.endDate).getTime() < new Date(form.date).getTime()
  ) {
    errors.endDate = "The end date must be on or after the start date.";
  }
  if (isTeacher && !form.batchId)
    errors.batchId = "Choose one of your batches.";
  return errors;
}

export default function EventFormModal() {
  const dispatch = useDispatch();
  const { formOpen, editing, formError, saving } = useSelector(
    state => state.events
  );
  const { items: batches } = useSelector(state => state.batches);
  const user = useSelector(state => state.auth.user);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const isTeacher = user?.role === "teacher";

  const batchOptions = useMemo(
    () =>
      batches.map(batch => ({
        value: batch._id || batch.id,
        label: batch.name || "Untitled batch",
      })),
    [batches]
  );

  useEffect(() => {
    if (!formOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
      return;
    }
    if (user?.role === "admin" || isTeacher) dispatch.batches.load();
    setForm({
      title: editing?.title || "",
      description: editing?.description || "",
      date: toLocalInput(editing?.date),
      endDate: toLocalInput(editing?.endDate),
      batchId: editing?.batch?._id || editing?.batch || editing?.batchId || "",
    });
    setErrors({});
  }, [formOpen, editing, user, isTeacher, dispatch]);

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: "" }));
    if (formError) dispatch.events.setFormError("");
  };

  const close = () => {
    if (!saving) dispatch.events.closeForm();
  };

  const submit = async event => {
    event.preventDefault();
    const nextErrors = validate(form, isTeacher);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    await dispatch.events.save({
      id: editing?._id || editing?.id,
      values: {
        title: form.title.trim(),
        description: form.description.trim(),
        date: new Date(form.date).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        batchId: form.batchId || null,
      },
    });
  };

  return (
    <Modal
      open={formOpen}
      onClose={close}
      title={editing ? "Edit event" : "Add event"}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="event-form" loading={saving}>
            Save
          </Button>
        </>
      }
    >
      <form
        id="event-form"
        onSubmit={submit}
        noValidate
        className="grid min-w-0 gap-4"
      >
        <FormField
          label="Title"
          htmlFor="event-title"
          required
          error={errors.title}
        >
          <Input
            id="event-title"
            value={form.title}
            invalid={Boolean(errors.title)}
            onChange={event => update("title", event.target.value)}
          />
        </FormField>

        <FormField label="Description" htmlFor="event-description">
          <Textarea
            id="event-description"
            rows={3}
            value={form.description}
            onChange={event => update("description", event.target.value)}
          />
        </FormField>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Starts"
            htmlFor="event-date"
            required
            error={errors.date}
            className="min-w-0"
          >
            <Input
              id="event-date"
              type="datetime-local"
              className="min-w-0"
              value={form.date}
              invalid={Boolean(errors.date)}
              onChange={event => update("date", event.target.value)}
            />
          </FormField>
          <FormField
            label="Ends"
            htmlFor="event-end-date"
            error={errors.endDate}
            className="min-w-0"
          >
            <Input
              id="event-end-date"
              type="datetime-local"
              className="min-w-0"
              value={form.endDate}
              invalid={Boolean(errors.endDate)}
              onChange={event => update("endDate", event.target.value)}
            />
          </FormField>
        </div>

        <FormField
          label="Audience"
          htmlFor="event-batch"
          error={errors.batchId}
          hint={
            isTeacher
              ? "Teachers can post for their own batches."
              : "Leave empty for a school-wide event."
          }
        >
          <SearchSelect
            id="event-batch"
            value={form.batchId}
            onChange={value => update("batchId", value || "")}
            options={batchOptions}
            placeholder={isTeacher ? "Choose your batch" : "Whole school"}
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
