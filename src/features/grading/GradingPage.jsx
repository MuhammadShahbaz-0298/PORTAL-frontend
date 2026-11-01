/* Grading page: filter the queue, then grade one submission at a time. */
import { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { Pencil, SlidersHorizontal } from "lucide-react";
import Badge from "../../components/ui/Badge";
import DataList from "../../components/ui/DataList";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import Toast from "../../components/ui/Toast";
import { classNames } from "../../lib/classNames";
import GradingCard from "./GradingCard";
import GradingModal from "./GradingModal";
import {
  assignmentName,
  formatDate,
  personEmail,
  personName,
} from "./gradingUtils";

const FILTERS = [
  { value: "all", label: "All records" },
  { value: "needs-review", label: "Needs review" },
  { value: "graded", label: "Graded" },
];

function GradingPage({
  grading,
  load,
  setFilter,
  setQuery,
  openEditor,
  clearMessages,
}) {
  // One mount effect: the grading queue.
  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    const needle = grading.query.trim().toLowerCase();

    return grading.items.filter(item => {
      if (grading.filter === "graded" && item.status !== "graded") return false;
      if (grading.filter === "needs-review" && item.status === "graded")
        return false;
      if (!needle) return true;

      return [
        personName(item.student),
        assignmentName(item.assignment),
        item.feedback,
      ]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(needle));
    });
  }, [grading.items, grading.filter, grading.query]);

  const message = grading.pageError || grading.notice;

  const columns = [
    {
      key: "learner",
      label: "Learner",
      render: submission => (
        <div className="min-w-0">
          <p className="font-semibold text-ink">
            {personName(submission.student)}
          </p>
          <p className="text-xs text-muted">
            {personEmail(submission.student) || "Student record"}
          </p>
        </div>
      ),
    },
    {
      key: "assignment",
      label: "Assignment",
      render: submission => assignmentName(submission.assignment),
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
      key: "marks",
      label: "Marks",
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
      key: "submitted",
      label: "Submitted",
      render: submission => formatDate(submission.submittedAt),
    },
    {
      key: "action",
      label: "Action",
      className: "text-right",
      render: submission => (
        <button
          type="button"
          onClick={() => openEditor(submission)}
          className="inline-flex min-h-9 items-center gap-1 rounded-control px-2 text-xs font-semibold text-brand transition hover:bg-brand-soft"
          aria-label={`${submission.status === "graded" ? "Edit" : "Grade"} ${personName(submission.student)}`}
        >
          <Pencil size={14} aria-hidden="true" />
          {submission.status === "graded" ? "Edit" : "Grade"}
        </button>
      ),
    },
  ];

  return (
    <div className="font-sans">
      <PageHeader
        eyebrow="Assessment desk"
        title="Grading"
        description="Review every submission in one queue and edit marks only when needed."
      />

      <Toast
        message={message}
        tone={grading.pageError ? "error" : "success"}
        onClose={clearMessages}
      />

      <div className="mb-4 grid gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={grading.query}
            onChange={setQuery}
            placeholder="Search learner, assignment, or feedback"
            className="sm:max-w-sm"
          />
          <p className="text-sm text-muted">
            {rows.length} record{rows.length === 1 ? "" : "s"} shown
          </p>
        </div>

        <div
          role="group"
          aria-label="Filter grading records"
          className="flex flex-wrap items-center gap-2"
        >
          <SlidersHorizontal
            size={16}
            aria-hidden="true"
            className="text-muted"
          />
          {FILTERS.map(filter => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={grading.filter === filter.value}
              onClick={() => setFilter(filter.value)}
              className={classNames(
                "min-h-9 rounded-full px-3 text-xs font-semibold transition",
                grading.filter === filter.value
                  ? "bg-ink text-white"
                  : "border border-line bg-surface text-muted hover:text-ink"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <DataList
        columns={columns}
        rows={rows}
        rowKey={submission => submission._id || submission.id}
        renderCard={submission => <GradingCard submission={submission} />}
        loading={grading.loading}
        error={grading.error}
        onRetry={() => load()}
        emptyTitle={
          grading.query
            ? "No matching records"
            : grading.filter === "graded"
              ? "No graded records"
              : grading.filter === "needs-review"
                ? "No submissions need review"
                : "No submissions yet"
        }
        emptyText="Submission records will appear here when learners upload their work."
      />

      <GradingModal />
    </div>
  );
}

const mapState = state => ({
  grading: state.grading,
});

const mapDispatch = dispatch => ({
  load: dispatch.grading.load,
  setFilter: dispatch.grading.setFilter,
  setQuery: dispatch.grading.setQuery,
  openEditor: dispatch.grading.openEditor,
  clearMessages: dispatch.grading.clearMessages,
});

export default connect(mapState, mapDispatch)(GradingPage);
