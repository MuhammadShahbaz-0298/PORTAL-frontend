/* Audit log viewer (admin only). */
import { useEffect } from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/ui/PageHeader";
import DataList from "../../components/ui/DataList";

function AuditLogPage({ auditLog, load }) {
  useEffect(() => { load(); }, [load]);
  const columns = [
    { key: "action", label: "Action", render: r => <span className="font-semibold text-ink">{r.action}</span> },
    { key: "actor", label: "Actor", render: r => r.actor?.name || r.actor || "—" },
    { key: "createdAt", label: "When", render: r => (r.createdAt ? new Date(r.createdAt).toLocaleString() : "—") },
  ];
  return (
    <div className="font-sans">
      <PageHeader eyebrow="Admin" title="Audit log" description="Recent administrative actions." />
      <DataList columns={columns} rows={auditLog.items} rowKey={r => r._id || r.id} loading={auditLog.loading} error={auditLog.error} onRetry={load} emptyTitle="No audit entries" emptyText="Actions will appear here." />
    </div>
  );
}

const mapState = state => ({ auditLog: state.auditLog });
const mapDispatch = dispatch => ({ load: dispatch.auditLog.load });
export default connect(mapState, mapDispatch)(AuditLogPage);