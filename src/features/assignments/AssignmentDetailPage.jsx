/* Assignment detail page: the brief plus the student's single editable submission. */
import { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarClock,
  Edit3,
  FileArchive,
  FolderOpen,
  Inbox,
  Upload,
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ErrorState from "../../components/ui/ErrorState";
import FormField from "../../components/ui/FormField";
import PageHeader from "../../components/ui/PageHeader";
import ProgressBar from "../../components/ui/ProgressBar";
import Spinner from "../../components/ui/Spinner";
import { buttonClassName } from "../../components/ui/Button";

const formatDateTime = value => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const isExpired = assignment =>
  Boolean(
    assignment?.dueDate && new Date(assignment.dueDate).getTime() <= Date.now()
  );

function AssignmentDetailPage({
  user,
  detail,
  detailLoading,
  detailError,
  submission,
  submissionNotice,
  submissionError,
  uploading,
  uploadProgress,
  loadDetail,
  upload,
  clearDetailMessages,
  resetDetail,
}) {
  const { assignmentId } = useParams({
    from: "/protected/assignments/$assignmentId",
  });
  const student = user?.role === "student";
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // One mount effect: read the brief (and this student's submission), reset on exit.
  useEffect(() => {
    loadDetail({ id: assignmentId, student });
    return () => resetDetail();
  }, [assignmentId, student, loadDetail, resetDetail]);

  const backLink = (
    <Link
      to="/assignments"
      className="mb-4 inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-muted transition hover:text-ink"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      Back to assignments
    </Link>
  );

  if (detailLoading || (!detail && !detailError)) {
    return (
      <div className="font-sans">
        {backLink}
        <Card>
          <div className="flex flex-col items-center gap-3 px-6 py-16">
            <Spinner
              size="lg"
              label="Reading assignment"
              className="text-brand"
            />
            <p className="text-sm text-muted">Reading the assignment brief…</p>
          </div>
        </Card>
      </div>
    );
  }

  if (detailError) {
    return (
      <div className="font-sans">
        {backLink}
        <Card>
          <ErrorState
            message={detailError}
            onRetry={() => loadDetail({ id: assignmentId, student })}
          />
        </Card>
      </div>
    );
  }

  const expired = isExpired(detail);
  const closed = detail.active === false;
  const status = closed ? "Closed" : expired ? "Expired" : "Open";
  const openForSubmission = !closed && !expired;
  const batchName = detail.batch?.name || detail.batch || "Assigned batch";

  const submit = async event => {
    event.preventDefault();
    if (!file || !openForSubmission || uploading) return;

    const uploaded = await upload({
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
    <div className="font-sans">
      {backLink}
      <PageHeader
        eyebrow="Assignment brief"
        title={detail.title || "Untitled assignment"}
        description={`Due ${formatDateTime(detail.dueDate)}`}
        action={
          <Badge tone={status === "Open" ? "success" : "danger"}>
            {status}
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Card className="p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            The brief
          </p>
          <h2 className="mt-1 font-sans text-xl font-semibold tracking-tight text-ink">
            {detail.title || "Untitled assignment"}
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">
            {detail.description || "No description has been provided."}
          </p>

          <dl className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
            <div className="rounded-control bg-canvas p-3">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-muted">
                <FolderOpen size={14} aria-hidden="true" />
                Batch
              </dt>
              <dd className="mt-1 text-sm font-semibold text-ink">
                {batchName}
              </dd>
            </div>
            <div className="rounded-control bg-canvas p-3">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-muted">
                <CalendarClock size={14} aria-hidden="true" />
                Deadline
              </dt>
              <dd className="mt-1 text-sm font-semibold text-ink">
                {formatDateTime(detail.dueDate)}
              </dd>
            </div>
            <div className="rounded-control bg-canvas p-3">
              <dt className="text-xs font-medium text-muted">Status</dt>
              <dd className="mt-1">
                <Badge tone={status === "Open" ? "success" : "danger"}>
                  {status}
                </Badge>
              </dd>
            </div>
            <div className="rounded-control bg-canvas p-3">
              <dt className="text-xs font-medium text-muted">
                Submission rule
              </dt>
              <dd className="mt-1 text-sm font-semibold text-ink">
                One file · edit to replace
              </dd>
            </div>
          </dl>
        </Card>

        {student ? (
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
                This assignment is {status.toLowerCase()}; new uploads and edits
                are closed.
              </div>
            ) : null}

            {submissionError ? (
              <div
                role="alert"
                className="mt-3 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
              >
                {submissionError}
              </div>
            ) : null}
            {submissionNotice ? (
              <div
                role="status"
                className="mt-3 rounded-control border border-success/30 bg-success-soft px-3 py-2 text-sm font-medium text-success"
              >
                {submissionNotice}
                <button
                  type="button"
                  onClick={clearDetailMessages}
                  className="ml-2 text-xs font-semibold underline"
                >
                  Dismiss
                </button>
              </div>
            ) : null}

            {openForSubmission ? (
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
        ) : (
          <Card className="p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              Submission window
            </p>
            <h2 className="mt-1 font-sans text-lg font-semibold text-ink">
              {status}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {status === "Open"
                ? "Learners can submit until the deadline."
                : "Learners can no longer upload to this assignment."}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link to="/submissions" className={buttonClassName("secondary")}>
                <Inbox size={16} aria-hidden="true" />
                Open submission inbox
              </Link>
              <Link to="/grading" className={buttonClassName("secondary")}>
                Go to grading
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

const mapState = state => ({
  user: state.auth.user,
  detail: state.assignments.detail,
  detailLoading: state.assignments.detailLoading,
  detailError: state.assignments.detailError,
  submission: state.assignments.submission,
  submissionNotice: state.assignments.submissionNotice,
  submissionError: state.assignments.submissionError,
  uploading: state.assignments.uploading,
  uploadProgress: state.assignments.uploadProgress,
});

const mapDispatch = dispatch => ({
  loadDetail: dispatch.assignments.loadDetail,
  upload: dispatch.assignments.upload,
  clearDetailMessages: dispatch.assignments.clearDetailMessages,
  resetDetail: dispatch.assignments.resetDetail,
});

export default connect(mapState, mapDispatch)(AssignmentDetailPage);
