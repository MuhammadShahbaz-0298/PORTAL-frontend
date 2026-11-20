import { useEffect } from "react";
import { connect } from "react-redux";
import { Plus } from "lucide-react";
import Button from "../../components/ui/Button";
import DataList from "../../components/ui/DataList";
import PageHeader from "../../components/ui/PageHeader";
import Toast from "../../components/ui/Toast";
import { hasPermission } from "../../lib/permissions";
import EventFormModal from "./EventFormModal";

const formatDate = value =>
  value ? new Date(value).toLocaleString() : "—";

function EventsPage({ user, events, load, openForm, archive, clearMessages }) {
  const canManage = hasPermission(user, "events.manage", ["admin", "teacher"]);

  useEffect(() => {
    load();
    clearMessages();
  }, [load, clearMessages]);

  const columns = [
    {
      key: "title",
      label: "Event",
      render: event => (
        <span className="font-semibold text-ink">{event.title}</span>
      ),
    },
    {
      key: "date",
      label: "When",
      render: event => <span className="text-muted">{formatDate(event.date)}</span>,
    },
    {
      key: "batch",
      label: "Audience",
      render: event =>
        event.batch?.name ? (
          <span className="text-muted">{event.batch.name}</span>
        ) : (
          <span className="text-muted">Whole school</span>
        ),
    },
    ...(canManage
      ? [
          {
            key: "actions",
            label: "Actions",
            className: "text-right",
            render: event => (
              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => openForm(event)}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={events.archivingId === (event._id || event.id)}
                  onClick={() => archive({ id: event._id || event.id })}
                  className="text-xs font-semibold text-brand hover:underline disabled:opacity-50"
                >
                  Archive
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="font-sans">
      <PageHeader
        eyebrow="Schedule"
        title="Events"
        description="School-wide dates and activities for your batches."
        action={
          canManage ? (
            <Button onClick={() => openForm(null)}>
              <Plus size={16} aria-hidden="true" />
              Add event
            </Button>
          ) : null
        }
      />
      <Toast
        message={events.pageError || events.notice}
        tone={events.pageError ? "error" : "success"}
        onClose={clearMessages}
      />
      <DataList
        columns={columns}
        rows={events.items}
        rowKey={event => event._id || event.id}
        loading={events.loading}
        error={events.error}
        onRetry={load}
        emptyTitle="No events yet"
        emptyText="Upcoming events will appear here."
      />
      {canManage ? <EventFormModal /> : null}
    </div>
  );
}

const mapState = state => ({ user: state.auth.user, events: state.events });
const mapDispatch = dispatch => ({
  load: dispatch.events.load,
  openForm: dispatch.events.openForm,
  archive: dispatch.events.archive,
  clearMessages: dispatch.events.clearMessages,
});
export default connect(mapState, mapDispatch)(EventsPage);
