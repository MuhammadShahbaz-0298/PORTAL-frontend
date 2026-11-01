/* SubmissionUploadModal: choose an open assignment and upload its ZIP archive. */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Upload } from "lucide-react";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Modal from "../../components/ui/Modal";
import ProgressBar from "../../components/ui/ProgressBar";
import SearchSelect from "../../components/ui/SearchSelect";

export default function SubmissionUploadModal() {
  const dispatch = useDispatch();
  const {
    uploadOpen,
    assignments,
    assignmentsLoading,
    items,
    formError,
    uploading,
    uploadProgress,
  } = useSelector(state => state.submissions);
  const [assignmentId, setAssignmentId] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});

  const options = useMemo(
    () =>
      assignments
        .filter(
          assignment =>
            assignment.active !== false &&
            (!assignment.dueDate ||
              new Date(assignment.dueDate).getTime() > Date.now())
        )
        .map(assignment => ({
          value: assignment._id || assignment.id,
          label: assignment.title || "Untitled assignment",
        })),
    [assignments]
  );

  const existing = useMemo(
    () =>
      items.find(
        submission =>
          String(
            typeof submission.assignment === "object"
              ? submission.assignment?._id || submission.assignment?.id
              : submission.assignment
          ) === String(assignmentId)
      ) || null,
    [items, assignmentId]
  );

  // Why: every open starts clean, including after a failed upload.
  useEffect(() => {
    if (!uploadOpen) {
      setAssignmentId("");
      setFile(null);
      setErrors({});
    }
  }, [uploadOpen]);

  const close = () => {
    if (!uploading) dispatch.submissions.closeUpload();
  };

  const submit = async event => {
    event.preventDefault();
    const nextErrors = {};

    if (!assignmentId) nextErrors.assignment = "Choose an assignment.";
    if (!file) nextErrors.file = "Choose a ZIP file to upload.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const uploaded = await dispatch.submissions.upload({
      assignmentId,
      submissionId: existing?._id || existing?.id,
      file,
    });

    if (uploaded) {
      setAssignmentId("");
      setFile(null);
    }
  };

  return (
    <Modal
      open={uploadOpen}
      onClose={close}
      title={existing ? "Edit your submission" : "Upload a submission"}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={uploading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="submission-upload-form"
            loading={uploading}
          >
            {existing ? "Replace file" : "Upload submission"}
          </Button>
        </>
      }
    >
      <form
        id="submission-upload-form"
        onSubmit={submit}
        noValidate
        className="grid gap-4"
      >
        <FormField
          label="Assignment"
          htmlFor="submission-assignment"
          required
          error={errors.assignment}
          hint={
            assignmentsLoading
              ? "Loading open assignments…"
              : !options.length
                ? "No open assignments are available right now."
                : undefined
          }
        >
          <SearchSelect
            id="submission-assignment"
            aria-label="Assignment"
            placeholder="Choose an assignment"
            options={options}
            value={assignmentId}
            invalid={Boolean(errors.assignment)}
            disabled={assignmentsLoading}
            onChange={value => {
              setAssignmentId(value);
              setErrors(current => ({ ...current, assignment: "" }));
              if (formError) dispatch.submissions.setFormError("");
            }}
          />
        </FormField>

        {existing ? (
          <p className="rounded-control border border-line bg-canvas px-3 py-2 text-xs leading-5 text-muted">
            You already submitted{" "}
            <strong className="text-ink">
              {existing.fileName || "a file"}
            </strong>
            . Uploading here replaces that submission; it does not create
            another attempt.
          </p>
        ) : null}

        <FormField
          label={existing ? "Replacement ZIP file" : "ZIP file"}
          htmlFor="submission-upload-file"
          required
          error={errors.file}
          hint="One ZIP archive, up to 50 MB."
        >
          <input
            id="submission-upload-file"
            type="file"
            accept=".zip,application/zip"
            disabled={uploading}
            onChange={event => {
              setFile(event.target.files?.[0] || null);
              setErrors(current => ({ ...current, file: "" }));
            }}
            className="block w-full text-sm text-muted file:mr-3 file:min-h-11 file:rounded-control file:border-0 file:bg-brand-soft file:px-4 file:text-sm file:font-semibold file:text-brand"
          />
        </FormField>

        {uploading ? (
          <ProgressBar
            value={uploadProgress}
            label="Uploading submission"
            valueLabel="%"
            completedLabel="Processing submission…"
          />
        ) : null}

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
