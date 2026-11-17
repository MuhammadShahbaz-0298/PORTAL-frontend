/* StudentSubmissionCard: one student's file, feedback, and replacement form. */
import { useRef, useState } from "react";
import { Edit3, FileArchive, Upload } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import FormField from "../../components/ui/FormField";
import ProgressBar from "../../components/ui/ProgressBar";
import { formatDateTime } from "./assignmentUtils";

export default function StudentSubmissionCard({
  assignmentId,
  submission,
  status,
  openForSubmission,
  canReplace,
  replaceBlockedReason,
  notice,
  error,
  uploading,
  uploadProgress,
  onUpload,
  onClearMessages,
}) {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const submit = async event => {
    event.preventDefault();
    if (!file || !openForSubmission || !canReplace || uploading) return;

    const uploaded = await onUpload({
      assignmentId,
      submissionId: submission?._id || submission?.id,
      file,
    });

    if (uploaded) {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
        Your submission
      </p>
      <h2 className="mt-1 font-sans text-lg font-semibold text-ink">
        {submission ? "Edit submission" : "Upload archive"}
      </h2>

      {submission ? (
        <div className="mt-3 rounded-control border border-line bg-canvas p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <FileArchive size={16} aria-hidden="true" />
            {submission.fileName || "Submitted file"}
          </p>
          <p className="mt-1 text-xs text-muted">
            Submitted {formatDateTime(submission.submittedAt)}
          </p>
          {submission.status === "graded" ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="success">Graded</Badge>
              <span className="text-sm font-semibold text-ink">
                {submission.grade ?? "—"}
              </span>
            </div>
          ) : null}
          {submission.feedback ? (
            <p className="mt-2 text-xs leading-5 text-muted">
              {submission.feedback}
            </p>
          ) : null}
        </div>
      ) : null}

      {!openForSubmission ? (
        <div
          role="status"
          className="mt-3 rounded-control border border-warning/30 bg-warning-soft px-3 py-2 text-sm font-medium text-warning"
        >
          This assignment is {status.toLowerCase()}; new uploads and edits are
          closed.
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mt-3 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
        >
          {error}
        </div>
      ) : null}
      {notice ? (
        <div
          role="status"
          className="mt-3 rounded-control border border-success/30 bg-success-soft px-3 py-2 text-sm font-medium text-success"
        >
          {notice}
          <button
            type="button"
            onClick={onClearMessages}
            className="ml-2 text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {openForSubmission && replaceBlockedReason ? (
        <p className="mt-3 rounded-control border border-line bg-canvas px-3 py-2 text-sm text-muted">
          {replaceBlockedReason}
        </p>
      ) : null}

      {openForSubmission && canReplace ? (
        <form onSubmit={submit} className="mt-4 grid gap-4">
          <FormField
            label={submission ? "Replacement ZIP file" : "ZIP file"}
            htmlFor="submission-file"
            hint="One ZIP archive, up to 50 MB."
          >
            <input
              ref={fileInputRef}
              id="submission-file"
              type="file"
              accept=".zip,application/zip"
              disabled={uploading}
              onChange={event => setFile(event.target.files?.[0] || null)}
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

          <Button
            type="submit"
            loading={uploading}
            disabled={!file}
            className="justify-self-start"
          >
            {submission ? (
              <Edit3 size={16} aria-hidden="true" />
            ) : (
              <Upload size={16} aria-hidden="true" />
            )}
            {submission ? "Edit submission" : "Upload submission"}
          </Button>
        </form>
      ) : null}
    </Card>
  );
}
