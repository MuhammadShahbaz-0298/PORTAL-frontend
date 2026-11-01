/* Roles page: configure page and action access for every core or custom role. */
import { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { Plus, Shield } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataList from "../../components/ui/DataList";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import Toast from "../../components/ui/Toast";
import RoleCard from "./RoleCard";
import RoleActions from "./RoleActions";
import RoleFormModal from "./RoleFormModal";
import { isCoreRole, PERMISSION_LABELS } from "./rolesConfig";

function RolesPage({
  roles,
  load,
  loadCatalog,
  setQuery,
  openForm,
  clearMessages,
}) {
  // One mount effect: the roles list and the system permission catalog.
  useEffect(() => {
    load();
    loadCatalog();
  }, [load, loadCatalog]);

  const rows = useMemo(() => {
    const needle = roles.query.trim().toLowerCase();
    if (!needle) return roles.items;

    return roles.items.filter(role => {
      const matchName = String(role.name || "")
        .toLowerCase()
        .includes(needle);
      const matchLabel = String(role.label || "")
        .toLowerCase()
        .includes(needle);
      const matchPerms =
        Array.isArray(role.permissions) &&
        role.permissions.some(p => {
          const label = PERMISSION_LABELS[p] || p;
          return (
            p.toLowerCase().includes(needle) ||
            label.toLowerCase().includes(needle)
          );
        });
      return matchName || matchLabel || matchPerms;
    });
  }, [roles.items, roles.query]);

  const message = roles.pageError || roles.notice;
  const countLabel = roles.query
    ? `Showing ${rows.length} of ${roles.total} roles`
    : `Showing ${roles.total} roles`;

  const columns = [
    {
      key: "role",
      label: "Role",
      render: role => {
        const core = isCoreRole(role.name);
        return (
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
              <Shield size={16} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink">
                  {role.label || role.name}
                </span>
                <Badge tone={core ? "brand" : "neutral"}>
                  {core ? "Core role" : "Custom role"}
                </Badge>
              </div>
              <p className="font-mono text-xs text-muted">{role.name}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "permissions",
      label: "Permissions",
      className: "max-w-md",
      render: role => {
        const permissions = Array.isArray(role.permissions)
          ? role.permissions
          : [];
        if (!permissions.length) {
          return (
            <span className="text-xs text-muted">No permissions assigned</span>
          );
        }

        return (
          <span className="line-clamp-2 text-xs text-muted">
            {permissions.map(p => PERMISSION_LABELS[p] || p).join(", ")}
          </span>
        );
      },
    },
    {
      key: "action",
      label: "Action",
      className: "text-right",
      render: role => <RoleActions role={role} />,
    },
  ];

  return (
    <div className="font-sans">
      <PageHeader
        eyebrow="Access control"
        title="Roles & permissions"
        description="Configure workspace, domain, and administrative access for each role."
        action={
          <Button onClick={() => openForm(null)}>
            <Plus size={16} aria-hidden="true" />
            Create role
          </Button>
        }
      />

      <Toast
        message={message}
        tone={roles.pageError ? "danger" : "success"}
        onClose={clearMessages}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={roles.query}
          onChange={setQuery}
          placeholder="Search by role title, identifier, or permission"
          className="sm:max-w-sm"
        />
        <p className="text-sm text-muted">{countLabel}</p>
      </div>

      <DataList
        columns={columns}
        rows={rows}
        rowKey={role => role._id || role.id || role.name}
        renderCard={role => <RoleCard role={role} />}
        loading={roles.loading}
        error={roles.error}
        onRetry={() => load()}
        emptyTitle={roles.query ? "No matching roles" : "No roles configured"}
        emptyText={
          roles.query
            ? "Try searching for a different role title or permission."
            : "Configured roles will appear here."
        }
      />

      <RoleFormModal />
    </div>
  );
}

const mapState = state => ({
  roles: state.roles,
});

const mapDispatch = dispatch => ({
  load: dispatch.roles.load,
  loadCatalog: dispatch.roles.loadCatalog,
  setQuery: dispatch.roles.setQuery,
  openForm: dispatch.roles.openForm,
  clearMessages: dispatch.roles.clearMessages,
});

export default connect(mapState, mapDispatch)(RolesPage);
