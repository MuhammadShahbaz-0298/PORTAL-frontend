/* Users page: search, create, and account lifecycle controls backed by the users model. */
import { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { Plus } from "lucide-react";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataList from "../../components/ui/DataList";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import Toast from "../../components/ui/Toast";
import { filterItems } from "../../lib/listHelper";
import { hasPermission } from "../../lib/permissions";
import { roleLabel } from "../../lib/roles";
import BulkImportModal from "./BulkImportModal";
import CredentialsModal from "./CredentialsModal";
import UserActions from "./UserActions";
import UserCard from "./UserCard";
import UserFormModal from "./UserFormModal";

const SEARCH_FIELDS = ["name", "email", "role"];

function UsersPage({
  users,
  currentUser,
  load,
  loadRoles,
  setQuery,
  openForm,
  openImport,
  exportExcel,
  clearMessages,
  clearCredentials,
}) {
  // One mount effect: load accounts and the optional role catalogue.
  useEffect(() => {
    load();
    loadRoles();
    return () => clearCredentials();
  }, [load, loadRoles, clearCredentials]);

  const rows = useMemo(
    () => filterItems(users.items, users.query, SEARCH_FIELDS),
    [users.items, users.query]
  );

  const canCreate = hasPermission(currentUser, "students.create", [
    "admin",
    "teacher",
  ]);
  const canImport = hasPermission(currentUser, "users.manage");
  const canExport = hasPermission(currentUser, "users.manage");

  const message = users.pageError || users.notice;
  const countLabel = users.query
    ? `Showing ${rows.length} of ${users.total} accounts`
    : `Showing ${users.total} accounts`;

  const columns = [
    {
      key: "name",
      label: "Name",
      render: user => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={user.name} size="sm" />
          <span className="truncate font-semibold text-ink">{user.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: user => <span className="text-muted">{user.email}</span>,
    },
    {
      key: "role",
      label: "Role",
      render: user => <Badge tone="brand">{roleLabel(user.role)}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      render: user => (
        <Badge
          tone={
            user.archivedAt
              ? "neutral"
              : user.active === false
                ? "danger"
                : "success"
          }
        >
          {user.archivedAt
            ? "Archived"
            : user.active === false
              ? "Inactive"
              : "Active"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: user => <UserActions user={user} />,
    },
  ];

  return (
    <div className="font-sans">
      <PageHeader
        eyebrow="People directory"
        title="Users"
        description="Create and manage accounts for every active role."
        action={
          <div className="flex gap-2">
            {canImport ? (
              <Button variant="secondary" onClick={openImport}>
                Bulk import
              </Button>
            ) : null}
              {canExport ? (
                <Button
                  variant="secondary"
                  onClick={exportExcel}
                  loading={users.exporting}
                >
                  Export Excel
                </Button>
              ) : null}
            {canCreate ? (
              <Button onClick={openForm}>
                <Plus size={16} aria-hidden="true" />
                Create account
              </Button>
            ) : null}
          </div>
        }
      />

      <Toast
        message={message}
        tone={users.pageError ? "error" : "success"}
        onClose={clearMessages}
      />

      {users.exportError ? (
        <p role="alert" className="mb-4 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          {users.exportError}
        </p>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={users.query}
          onChange={setQuery}
          placeholder="Search name, email, or role"
          className="sm:max-w-sm"
        />
        <p className="text-sm text-muted">{countLabel}</p>
      </div>

      <DataList
        columns={columns}
        rows={rows}
        rowKey={user => user.id || user._id}
        renderCard={user => <UserCard user={user} />}
        loading={users.loading}
        error={users.error}
        onRetry={load}
        emptyTitle={users.query ? "No matching accounts" : "No accounts yet"}
        emptyText={
          users.query
            ? "Try a different name, email, or role."
            : "Create the first account to get started."
        }
      />

      <UserFormModal />
      <CredentialsModal />
      <BulkImportModal />
    </div>
  );
}

const mapState = state => ({
  users: state.users,
  currentUser: state.auth.user,
});

const mapDispatch = dispatch => ({
  load: dispatch.users.load,
  loadRoles: dispatch.users.loadRoles,
  setQuery: dispatch.users.setQuery,
  openForm: dispatch.users.openForm,
  openImport: dispatch.users.openImport,
  exportExcel: dispatch.users.exportExcel,
  clearMessages: dispatch.users.clearMessages,
  clearCredentials: dispatch.users.clearCredentials,
});

export default connect(mapState, mapDispatch)(UsersPage);
