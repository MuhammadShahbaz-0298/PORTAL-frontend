/* Batches page: manage teaching cohorts, assigned teachers, and enrollment. */
import { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { Inbox, Plus } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
// import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import Spinner from "../../components/ui/Spinner";
import Toast from "../../components/ui/Toast";
import { hasPermission } from "../../lib/permissions";
import BatchCard from "./BatchCard";
import BatchEnrollmentModal from "./BatchEnrollmentModal";
import BatchFormModal from "./BatchFormModal";
import { teacherName } from "./batchUtils";
import EmptyState from "../../components/ui/EmptyState";

function BatchesPage({
  batches,
  user,
  load,
  loadPeople,
  setQuery,
  openForm,
  clearMessages,
}) {
  const canCreate = hasPermission(user, "batches.create", ["admin"]);
  const canEdit = hasPermission(user, "batches.update", ["admin", "teacher"]);
  const canDelete = hasPermission(user, "batches.delete", ["admin"]);
  const canEnroll = hasPermission(user, "batches.enroll", ["admin", "teacher"]);

  // One mount effect: the cohorts, plus the teacher & student rosters when allowed.
  useEffect(() => {
    load();
    if (canCreate || canEdit || canEnroll) {
      loadPeople();
    }
  }, [load, loadPeople, canCreate, canEdit, canEnroll]);

  const rows = useMemo(() => {
    const needle = batches.query.trim().toLowerCase();
    if (!needle) return batches.items;

    return batches.items.filter(batch =>
      [batch.name, teacherName(batch.teacher)]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(needle))
    );
  }, [batches.items, batches.query]);

  const message = batches.pageError || batches.notice;
  const countLabel = batches.query
    ? `Showing ${rows.length} of ${batches.total} batches`
    : `Showing ${batches.total} batches`;

  return (
    <div className="font-sans">
      <PageHeader
        eyebrow="Cohorts"
        title="Batches"
        description="Manage teaching groups, assigned teachers, and enrollment."
        action={
          canCreate ? (
            <Button onClick={() => openForm({ batch: null })}>
              <Plus size={16} aria-hidden="true" />
              New batch
            </Button>
          ) : null
        }
      />

      <Toast
        message={message}
        tone={batches.pageError ? "error" : "success"}
        onClose={clearMessages}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={batches.query}
          onChange={setQuery}
          placeholder="Search by batch name or teacher"
          className="sm:max-w-sm"
        />
        <p className="text-sm text-muted">{countLabel}</p>
      </div>

      {batches.loading ? (
        <Card>
          <div className="flex justify-center px-6 py-16">
            <Spinner size="lg" label="Loading batches" className="text-brand" />
          </div>
        </Card>
      ) : batches.error ? (
        <Card>
          <ErrorState message={batches.error} onRetry={() => load()} />
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            title={batches.query ? "No matching batches" : "No batches yet"}
            text={
              batches.query
                ? "Try searching for a different batch name or teacher."
                : "Create your first batch to start assigning students."
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(batch => (
            <BatchCard
              key={batch._id || batch.id}
              batch={batch}
              canEdit={canEdit}
              canDelete={canDelete}
              canEnroll={canEnroll}
            />
          ))}
        </div>
      )}

      <BatchFormModal />
      <BatchEnrollmentModal />
    </div>
  );
}

const mapState = state => ({
  batches: state.batches,
  user: state.auth.user,
});

const mapDispatch = dispatch => ({
  load: dispatch.batches.load,
  loadPeople: dispatch.batches.loadPeople,
  setQuery: dispatch.batches.setQuery,
  openForm: dispatch.batches.openForm,
  clearMessages: dispatch.batches.clearMessages,
});

export default connect(mapState, mapDispatch)(BatchesPage);
