/* Assignment detail page: the brief plus the student's single editable submission. */
import { useEffect } from "react";
import { connect } from "react-redux";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Inbox } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import ErrorState from "../../components/ui/ErrorState";
import PageHeader from "../../components/ui/PageHeader";
import Spinner from "../../components/ui/Spinner";
import { buttonClassName } from "../../components/ui/Button";
import AssignmentBriefCard from "./AssignmentBriefCard";
import StudentSubmissionCard from "./StudentSubmissionCard";
import { formatDateTime } from "./assignmentUtils";

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
  let status = "Open";
  if (closed) status = "Closed";
  else if (expired) status = "Expired";
  const openForSubmission = !closed && !expired;
  const gradedSubmission = submission?.status === "graded";
  const resubmissionOff = detail.resubmissionPolicy === "disabled";

  // Why: hide the replacement form when the backend would refuse it anyway.
  const canReplace = !submission || (!resubmissionOff && !gradedSubmission);
  let replaceBlockedReason = "";
  if (submission && gradedSubmission) {
    replaceBlockedReason =
      "This submission is already graded and can't be replaced.";
  } else if (submission && resubmissionOff) {
    replaceBlockedReason = "Resubmissions are disabled for this assignment.";
  }

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
        <AssignmentBriefCard assignment={detail} status={status} />

        {student ? (
          <StudentSubmissionCard
            assignmentId={assignmentId}
            submission={submission}
            status={status}
            openForSubmission={openForSubmission}
            canReplace={canReplace}
            replaceBlockedReason={replaceBlockedReason}
            notice={submissionNotice}
            error={submissionError}
            uploading={uploading}
            uploadProgress={uploadProgress}
            onUpload={upload}
            onClearMessages={clearDetailMessages}
          />
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
