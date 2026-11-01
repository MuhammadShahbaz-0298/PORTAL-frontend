/* Submissions page: the review inbox for staff and the upload desk for students. */
import { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { Link } from "@tanstack/react-router";
import { Plus, SlidersHorizontal } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button, { buttonClassName } from "../../components/ui/Button";
import DataList from "../../components/ui/DataList";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import Toast from "../../components/ui/Toast";
import SubmissionCard from "./SubmissionCard";
import SubmissionDownload from "./SubmissionDownload";
import SubmissionUploadModal from "./SubmissionUploadModal";

const assignmentId = submission => {
  const assignment = submission.assignment;
  return typeof assignment === "object"
    ? assignment?._id || assignment?.id
    : assignment;
};

const assignmentTitle = submission =>
  typeof submission.assignment === "object"
    ? submission.assignment?.title || "Assignment"
    : submission.assignment || "Assignment";

const studentName = submission => {
  const student = submission.student;
  if (typeof student === "object" && student) return student.name || "Learner";
  return student || "Learner";
};

function SubmissionsPage({
  submissions,
  user,
  load,
  loadAssignments,
  setQuery,
  openUpload,
  clearMessages,
}) {
  const student = user?.role === "student";

  // One mount effect: the inbox, plus the assignment list used by the upload form.
  useEffect(() => {
    load();
    if (student) loadAssignments();
  }, [load, loadAssignments, student]);

  const rows = useMemo(() => {
    const needle = submissions.query.trim().toLowerCase();
    if (!needle) return submissions.items;

    return submissions.items.filter(item =>
      [studentName(item), assignmentTitle(item), item.status, item.feedback]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(needle))
    );
  }, [submissions.items, submissions.query]);

  const message = submissions.pageError || submissions.notice;
  const countLabel = submissions.query
    ? `Showing ${rows.length} of ${submissions.total} submissions`
    : `Showing ${submissions.total} submissions`;

  const columns = [
    {
      key: "student",
      label: "Learner",
      render: submission => (
        <span className="font-semibold text-ink">
          {studentName(submission)}
        </span>
      ),
    },
    {
      key: "assignment",
      label: "Assignment",
      render: submission => {
        const id = assignmentId(submission);
        return id ? (
          <Link
            to="/assignments/$assignmentId"
            params={{ assignmentId: id }}
            className="text-ink underline-offset-4 hover:text-brand hover:underline"
          >
            {assignmentTitle(submission)}
          </Link>
        ) : (
          assignmentTitle(submission)
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: submission => (
        <Badge tone={submission.status === "graded" ? "success" : "warning"}>
          {submission.status || "submitted"}
        </Badge>
      ),
    },
    {
      key: "grade",
      label: "Grade",
      render: submission => submission.grade ?? "—",
    },
    {
      key: "feedback",
      label: "Feedback",
      className: "max-w-[16rem]",
      render: submission => (
        <span className="line-clamp-2 text-muted">
          {submission.feedback || "—"}
        </span>
      ),
    },
    {
      key: "file",
      label: "File",
      render: submission => <SubmissionDownload submission={submission} />,
    },
    {
      key: "action",
      label: "Action",
      className: "text-right",
      render: submission =>
        student ? null : (
          <Link
            to="/grading"
            className="inline-flex min-h-9 items-center rounded-control px-2 text-xs font-semibold text-brand transition hover:bg-brand-soft"
          >
            Grade
          </Link>
        ),
    },
  ];

  return (
    <div className="font-sans">
      <PageHeader
        eyebrow={student ? "Your work" : "Submission inbox"}
        title="Submissions"
        description={
          student
            ? "Track status, grades, and feedback on your work."
            : "Review learner work and open the grading desk."
        }
        action={
          student ? (
            <Button onClick={openUpload}>
              <Plus size={16} aria-hidden="true" />
              Upload submission
            </Button>
          ) : (
            <Link to="/grading" className={buttonClassName("secondary")}>
              <SlidersHorizontal size={16} aria-hidden="true" />
              Open grading
            </Link>
          )
        }
      />

      <Toast
        message={message}
        tone={submissions.pageError ? "error" : "success"}
        onClose={clearMessages}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={submissions.query}
          onChange={setQuery}
          placeholder="Search learner, assignment, or feedback"
          className="sm:max-w-sm"
        />
        <p className="text-sm text-muted">{countLabel}</p>
      </div>

      <DataList
        columns={columns}
        rows={rows}
        rowKey={submission => submission._id || submission.id}
        renderCard={submission => <SubmissionCard submission={submission} />}
        loading={submissions.loading}
        error={submissions.error}
        onRetry={() => load()}
        emptyTitle={
          submissions.query
            ? "No matching submissions"
            : student
              ? "No submissions yet"
              : "Nothing in the inbox"
        }
        emptyText={
          submissions.query
            ? "Try a different learner, assignment, or status."
            : student
              ? "Upload a ZIP archive to get started."
              : "Learner work will appear here when it is uploaded."
        }
      />

      <SubmissionUploadModal />
    </div>
  );
}

const mapState = state => ({
  submissions: state.submissions,
  user: state.auth.user,
});

const mapDispatch = dispatch => ({
  load: dispatch.submissions.load,
  loadAssignments: dispatch.submissions.loadAssignments,
  setQuery: dispatch.submissions.setQuery,
  openUpload: dispatch.submissions.openUpload,
  clearMessages: dispatch.submissions.clearMessages,
});

export default connect(mapState, mapDispatch)(SubmissionsPage);
