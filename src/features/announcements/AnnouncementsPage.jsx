/* AnnouncementsPage: searchable cards for the announcements visible to a user.
 * The form and individual announcement cards live in focused components.
 */
import { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { Plus } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import PageHeader from "../../components/ui/PageHeader";
import Spinner from "../../components/ui/Spinner";
import Toast from "../../components/ui/Toast";
import { hasPermission } from "../../lib/permissions";
import AnnouncementCard from "./AnnouncementCard";
import AnnouncementFilters from "./AnnouncementFilters";
import AnnouncementFormModal from "./AnnouncementFormModal";

function AnnouncementsPage({
  announcements,
  currentUser,
  load,
  loadBatches,
  setQuery,
  openForm,
  closeForm,
  create,
  archive,
  clearMessages,
}) {
  useEffect(() => {
    load();
  }, [load]);

  const canManage = hasPermission(currentUser, "announcements.manage", [
    "admin",
    "teacher",
  ]);
  const rows = useMemo(() => {
    const needle = announcements.query.trim().toLowerCase();
    if (!needle) return announcements.items;
    return announcements.items.filter(({ title, body }) =>
      [title, body].some(value =>
        String(value || "")
          .toLowerCase()
          .includes(needle)
      )
    );
  }, [announcements.items, announcements.query]);
  const count = announcements.query ? rows.length : announcements.total;

  return (
    <div className="font-sans">
      <PageHeader
        eyebrow="Updates"
        title="Announcements"
        description="School-wide updates and notices for your batches."
        action={
          canManage ? (
            <Button onClick={openForm}>
              <Plus size={16} aria-hidden="true" />
              New announcement
            </Button>
          ) : null
        }
      />
      <Toast
        message={announcements.pageError || announcements.notice}
        tone={announcements.pageError ? "error" : "success"}
        onClose={clearMessages}
      />
      <AnnouncementFilters
        query={announcements.query}
        onQueryChange={setQuery}
        visibleCount={rows.length}
        totalCount={count}
      />
      {announcements.loading ? (
        <Card>
          <div className="flex justify-center px-6 py-16">
            <Spinner
              size="lg"
              label="Loading announcements"
              className="text-brand"
            />
          </div>
        </Card>
      ) : announcements.error ? (
        <Card>
          <ErrorState message={announcements.error} onRetry={load} />
        </Card>
      ) : rows.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {rows.map(announcement => (
            <AnnouncementCard
              key={announcement._id || announcement.id}
              announcement={announcement}
              currentUser={currentUser}
              canManage={canManage}
              onArchive={archive}
            />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title={
              announcements.query
                ? "No matching announcements"
                : "No announcements yet"
            }
            text={
              announcements.query
                ? "Try a different search term."
                : "New announcements will appear here."
            }
          />
        </Card>
      )}
      {announcements.formOpen ? (
        <AnnouncementFormModal
          announcements={announcements}
          currentUser={currentUser}
          loadBatches={loadBatches}
          closeForm={closeForm}
          create={create}
        />
      ) : null}
    </div>
  );
}

const mapState = state => ({
  announcements: state.announcements,
  currentUser: state.auth.user,
});
const mapDispatch = dispatch => ({
  load: dispatch.announcements.load,
  loadBatches: dispatch.announcements.loadBatches,
  setQuery: dispatch.announcements.setQuery,
  openForm: dispatch.announcements.openForm,
  closeForm: dispatch.announcements.closeForm,
  create: dispatch.announcements.create,
  archive: dispatch.announcements.archive,
  clearMessages: dispatch.announcements.clearMessages,
});
export default connect(mapState, mapDispatch)(AnnouncementsPage);
