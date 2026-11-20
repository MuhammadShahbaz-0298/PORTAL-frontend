/* AssignmentFormModal: create and edit a brief with every error shown inline. */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import SearchSelect from "../../components/ui/SearchSelect";
import Textarea from "../../components/ui/Textarea";
import ResourceList from "./ResourceList";
import ResourceUploader from "./ResourceUploader";

const EMPTY_FORM = {
  title: "",
  description: "",
  dueDate: "",
  batch: "",
  resubmissionPolicy: "allowed",
};

const POLICY_OPTIONS = [
  { value: "allowed", label: "Allowed" },
  { value: "disabled", label: "Not allowed" },
];

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
  const { formOpen, editing, formError, saving, batches, uploading } =
    useSelector(state => state.assignments);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileResults, setFileResults] = useState([]);
  const [completed, setCompleted] = useState(false);
  const editingId = editing?._id || editing?.id || "";

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
      setSelectedFiles([]);
      setFileResults([]);
      setCompleted(false);
      return;
    }

    setForm({
      title: editing?.title || "",
      description: editing?.description || "",
      dueDate: toLocalInput(editing?.dueDate),
      batch: editing?.batch?._id || editing?.batch || "",
      resubmissionPolicy: editing?.resubmissionPolicy || "allowed",
    });
    setErrors({});
    setSelectedFiles([]);
    setFileResults([]);
    setCompleted(false);
    if (editingId) dispatch.assignmentResources.load({ assignmentId: editingId });
  }, [formOpen, editing, editingId, dispatch]);

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: "" }));
    if (formError) dispatch.assignments.setFormError("");
  };

  const close = () => {
    if (!saving && !uploading) dispatch.assignments.closeForm();
  };

  const submit = async event => {
    event.preventDefault();
    if (completed) {
      close();
      return;
    }
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const result = await dispatch.assignments.save({
      id: editingId,
      values: {
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: new Date(form.dueDate).toISOString(),
        batch: form.batch,
        resubmissionPolicy: form.resubmissionPolicy,
      },
      keepOpen: !editingId && selectedFiles.length > 0,
    });

    if (!result || editingId || !selectedFiles.length) return;

    const assignmentId = typeof result === "string" ? result : result?.data?._id;
    if (!assignmentId) return;
    setCompleted(true);
    const initial = selectedFiles.map(file => ({
      name: file.name,
      status: "Uploading…",
      error: false,
    }));
    setFileResults(initial);

    for (let index = 0; index < selectedFiles.length; index += 1) {
      const file = selectedFiles[index];
      const uploaded = await dispatch.assignmentResources.upload({
        assignmentId,
        file,
      });
      setFileResults(current =>
        current.map((item, position) =>
          position === index
            ? {
                ...item,
                status: uploaded
                  ? "Uploaded successfully."
                  : "Upload failed. Try again from the assignment detail page.",
                error: !uploaded,
              }
            : item
        )
      );
    }
  };

  return (
    <Modal
      open={formOpen}
      onClose={close}
      title={editing ? "Edit assignment" : "Create assignment"}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={saving || uploading}>
            {completed ? "Close" : "Cancel"}
          </Button>
          <Button type="submit" form="assignment-form" loading={saving || uploading}>
            {completed
              ? "Done"
              : editing
                ? "Save changes"
                : "Create assignment"}
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

        <FormField
          label="Allow students to replace their submission"
          htmlFor="assignment-resubmission"
          hint="Allowed lets a learner upload a replacement before the deadline."
        >
          <SearchSelect
            id="assignment-resubmission"
            aria-label="Allow students to replace their submission"
            placeholder="Choose a policy"
            options={POLICY_OPTIONS}
            value={form.resubmissionPolicy}
            onChange={value => update("resubmissionPolicy", value || "allowed")}
          />
        </FormField>

        <fieldset className="rounded-control border border-line p-3">
          <legend className="px-1 text-sm font-semibold text-ink">
            Attachments
          </legend>
          <ResourceUploader
            assignmentId={editingId}
            selectedFiles={selectedFiles}
            onFilesChange={
              editingId ? undefined : files => setSelectedFiles(files)
            }
            disabled={completed}
          />

          {editingId ? (
            <div className="mt-4">
              <ResourceList assignmentId={editingId} canManage />
            </div>
          ) : null}

          {!editingId && selectedFiles.length ? (
            <ul className="mt-3 grid gap-1">
              {selectedFiles.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 truncate text-ink">{file.name}</span>
                  <button
                    type="button"
                    disabled={completed}
                    onClick={() =>
                      setSelectedFiles(current =>
                        current.filter((_, position) => position !== index)
                      )
                    }
                    className="shrink-0 text-xs font-semibold text-brand hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {fileResults.length ? (
            <ul className="mt-3 grid gap-1 border-t border-line pt-3">
              {fileResults.map((result, index) => (
                <li
                  key={`${result.name}-${index}`}
                  role={result.error ? "alert" : "status"}
                  className={`text-sm ${result.error ? "text-danger" : "text-success"}`}
                >
                  {result.name}: {result.status}
                </li>
              ))}
            </ul>
          ) : null}
        </fieldset>

        {formError ? (
          <div
            role="alert"
            className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
          >
            {formError}
          </div>
        ) : null}

        <p className="text-xs text-muted">
          ZIP uploads are capped at 50 MB. Replacement uploads follow the policy
          above.
        </p>
      </form>
    </Modal>
  );
}
