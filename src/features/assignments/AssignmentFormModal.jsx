/* AssignmentFormModal: create and edit a brief with every error shown inline. */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import SearchSelect from "../../components/ui/SearchSelect";
import Textarea from "../../components/ui/Textarea";

const EMPTY_FORM = { title: "", description: "", dueDate: "", batch: "" };

const toLocalInput = value => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
};

function validate(form) {
  const errors = {};

  if (!form.title.trim()) errors.title = "Give this assignment a title.";
  if (!form.batch) errors.batch = "Choose the batch that receives the brief.";
  if (!form.dueDate) errors.dueDate = "Choose a deadline.";
  else if (Number.isNaN(new Date(form.dueDate).getTime()))
    errors.dueDate = "Enter a valid date and time.";

  return errors;
}

export default function AssignmentFormModal() {
  const dispatch = useDispatch();
  const { formOpen, editing, formError, saving, batches } = useSelector(
    state => state.assignments
  );
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const batchOptions = useMemo(
    () =>
      batches.map(batch => ({
        value: batch._id || batch.id,
        label: batch.name || "Untitled batch",
      })),
    [batches]
  );

  // Why: the modal opens empty for a new brief and prefilled when editing.
  useEffect(() => {
    if (!formOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
      return;
    }

    setForm({
      title: editing?.title || "",
      description: editing?.description || "",
      dueDate: toLocalInput(editing?.dueDate),
      batch: editing?.batch?._id || editing?.batch || "",
    });
    setErrors({});
  }, [formOpen, editing]);

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: "" }));
    if (formError) dispatch.assignments.setFormError("");
  };

  const close = () => {
    if (!saving) dispatch.assignments.closeForm();
  };

  const submit = async event => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    await dispatch.assignments.save({
      id: editing?._id || editing?.id,
      values: {
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: new Date(form.dueDate).toISOString(),
        batch: form.batch,
      },
    });
  };

  return (
    <Modal
      open={formOpen}
      onClose={close}
      title={editing ? "Edit assignment" : "Create assignment"}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="assignment-form" loading={saving}>
            {editing ? "Save changes" : "Create assignment"}
          </Button>
        </>
      }
    >
      <form
        id="assignment-form"
        onSubmit={submit}
        noValidate
        className="grid gap-4"
      >
        <FormField
          label="Title"
          htmlFor="assignment-title"
          required
          error={errors.title}
        >
          <Input
            id="assignment-title"
            value={form.title}
            invalid={Boolean(errors.title)}
            onChange={event => update("title", event.target.value)}
          />
        </FormField>

        <FormField
          label="Description"
          htmlFor="assignment-description"
          hint="Tell learners what success looks like."
        >
          <Textarea
            id="assignment-description"
            rows={4}
            value={form.description}
            onChange={event => update("description", event.target.value)}
          />
        </FormField>

        <FormField
          label="Batch"
          htmlFor="assignment-batch"
          required
          error={errors.batch}
        >
          <SearchSelect
            id="assignment-batch"
            aria-label="Batch"
            placeholder="Choose a batch"
            options={batchOptions}
            value={form.batch}
            invalid={Boolean(errors.batch)}
            onChange={value => update("batch", value)}
          />
        </FormField>

        <FormField
          label="Due date and time"
          htmlFor="assignment-due"
          required
          error={errors.dueDate}
        >
          <Input
            id="assignment-due"
            type="datetime-local"
            value={form.dueDate}
            invalid={Boolean(errors.dueDate)}
            onChange={event => update("dueDate", event.target.value)}
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

        <p className="text-xs text-muted">
          ZIP uploads are capped at 50 MB. Each student can submit once and edit
          that submission before the deadline.
        </p>
      </form>
    </Modal>
  );
}
