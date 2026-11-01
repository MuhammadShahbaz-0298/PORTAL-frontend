/* Assignments page: searchable briefs with links into the detail route. */
import { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { Link } from "@tanstack/react-router";
import { Eye, Plus } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataList from "../../components/ui/DataList";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import Toast from "../../components/ui/Toast";
import { hasPermission } from "../../lib/permissions";
import AssignmentActions from "./AssignmentActions";
import AssignmentCard from "./AssignmentCard";
import AssignmentFormModal from "./AssignmentFormModal";
import { getAssignmentStatus } from "./assignmentUtils";

const STATUS_TONES = {
  Active: "success",
  Expired: "warning",
  Closed: "danger",
};

const formatDate = value => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

function AssignmentsPage({
  assignments,
  user,
  load,
  loadBatches,
  setQuery,
  openForm,
  clearMessages,
}) {
  const canCreate = hasPermission(user, "assignments.create", [
    "admin",
    "teacher",
  ]);
  const canEdit = hasPermission(user, "assignments.update", [
    "admin",
    "teacher",
  ]);

  // One mount effect: the list plus the optional batch catalogue for the form.
  useEffect(() => {
    load();
    if (canCreate || canEdit) loadBatches();
  }, [load, loadBatches, canCreate, canEdit]);

  const rows = useMemo(() => {
    const needle = assignments.query.trim().toLowerCase();
    if (!needle) return assignments.items;

    return assignments.items.filter(item =>
      [item.title, item.description, item.batch?.name, item.batch]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(needle))
    );
  }, [assignments.items, assignments.query]);

  const message = assignments.pageError || assignments.notice;
  const countLabel = assignments.query
    ? `Showing ${rows.length} of ${assignments.total} assignments`
    : `Showing ${assignments.total} assignments`;

  const columns = [
    {
      key: "title",
      label: "Assignment",
      render: assignment => (
        <div className="min-w-0">
          <Link
            to="/assignments/$assignmentId"
            params={{ assignmentId: assignment._id || assignment.id }}
            className="font-semibold text-ink underline-offset-4 hover:text-brand hover:underline"
          >
            {assignment.title || "Untitled assignment"}
          </Link>
          <p className="mt-0.5 text-xs text-muted">
            ZIP · {assignment.maxFileSizeMb || 50} MB maximum
          </p>
        </div>
      ),
    },
    {
      key: "batch",
      label: "Batch",
      render: assignment =>
        assignment.batch?.name || assignment.batch || "Unassigned",
    },
    {
      key: "dueDate",
      label: "Due date",
      render: assignment => formatDate(assignment.dueDate),
    },
    {
      key: "status",
      label: "Status",
      render: assignment => {
        const status = getAssignmentStatus(assignment);
        return <Badge tone={STATUS_TONES[status] || "neutral"}>{status}</Badge>;
      },
    },
    {
      key: "view",
      label: "Brief",
      render: assignment => (
        <Link
          to="/assignments/$assignmentId"
          params={{ assignmentId: assignment._id || assignment.id }}
          className="inline-flex min-h-9 items-center gap-1 rounded-control border border-line bg-surface px-2.5 text-xs font-semibold text-ink transition hover:bg-canvas"
        >
          <Eye size={14} aria-hidden="true" />
          View
        </Link>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: assignment => <AssignmentActions assignment={assignment} />,
    },
  ];

  return (
    <div className="font-sans">
      <PageHeader
        eyebrow="Teaching workspace"
        title="Assignments"
        description="Create briefs, keep deadlines visible, and see where learning is landing."
        action={
          canCreate ? (
            <Button onClick={() => openForm(null)}>
              <Plus size={16} aria-hidden="true" />
              New assignment
            </Button>
          ) : null
        }
      />

      <Toast
        message={message}
        tone={assignments.pageError ? "error" : "success"}
        onClose={clearMessages}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={assignments.query}
          onChange={setQuery}
          placeholder="Search title, description, or batch"
          className="sm:max-w-sm"
        />
        <p className="text-sm text-muted">{countLabel}</p>
      </div>

      <DataList
        columns={columns}
        rows={rows}
        rowKey={assignment => assignment._id || assignment.id}
        renderCard={assignment => <AssignmentCard assignment={assignment} />}
        loading={assignments.loading}
        error={assignments.error}
        onRetry={() => load()}
        emptyTitle={
          assignments.query ? "No matching assignments" : "No assignments yet"
        }
        emptyText={
          assignments.query
            ? "Try a different title, description, or batch."
            : "Published assignment briefs will appear here."
        }
      />

      <AssignmentFormModal />
    </div>
  );
}

const mapState = state => ({
  assignments: state.assignments,
  user: state.auth.user,
});

const mapDispatch = dispatch => ({
  load: dispatch.assignments.load,
  loadBatches: dispatch.assignments.loadBatches,
  setQuery: dispatch.assignments.setQuery,
  openForm: dispatch.assignments.openForm,
  clearMessages: dispatch.assignments.clearMessages,
});

export default connect(mapState, mapDispatch)(AssignmentsPage);
