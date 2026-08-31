/* Roles feature: readable grouped permission editor for stored roles with no synthesized defaults. */
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import { Edit3, Plus } from "lucide-react";
import {
  listRoles,
  createRole,
  updateRole,
  getPermissionCatalog,
} from "../../api/roles";
import useApiResource from "../../hooks/useApiResource";
import { PageHeader } from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import ToastNotification from "../../components/ui/ToastNotification";
const permissionLabels = {
  "dashboard.view": "Dashboard",
  "students.view": "View students",
  "students.create": "Create students",
  "students.update": "Edit students",
  "students.attendance": "Student attendance",
  "batches.view": "View batches",
  "batches.create": "Create batches",
  "batches.update": "Edit batches",
  "batches.delete": "Delete batches",
  "batches.enroll": "Enroll students",
  "assignments.view": "View assignments",
  "assignments.create": "Create assignments",
  "assignments.update": "Edit assignments",
  "assignments.delete": "Archive assignments",
  "submissions.view": "View submissions",
  "submissions.grade": "Grade submissions",
  "attendance.view": "View attendance",
  "attendance.manage": "Mark attendance",
  "users.manage": "Manage accounts",
  "roles.manage": "Manage roles",
  "profile.view": "View profile",
};
const permissionGroups = {
  Workspace: ["dashboard.view", "profile.view"],
  Students: [
    "students.view",
    "students.create",
    "students.update",
    "students.attendance",
  ],
  Batches: [
    "batches.view",
    "batches.create",
    "batches.update",
    "batches.delete",
    "batches.enroll",
  ],
  Assignments: [
    "assignments.view",
    "assignments.create",
    "assignments.update",
    "assignments.delete",
  ],
  Submissions: ["submissions.view", "submissions.grade"],
  Attendance: ["attendance.view", "attendance.manage"],
  Administration: ["users.manage", "roles.manage"],
};
const fetchRoles = () =>
  listRoles().then(response => ({
    ...response,
    data: response.data?.roles || [],
  }));
export default function RolesPage() {
  const resource = useApiResource(fetchRoles);
  const [catalog, setCatalog] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ name: "", label: "", permissions: [] });
  useEffect(() => {
    getPermissionCatalog()
      .then(({ data }) =>
        setCatalog(Array.isArray(data) ? data : data.permissions || [])
      )
      .catch(() => {});
  }, []);
  const visibleCatalog = useMemo(
    () => (catalog.length ? catalog : Object.keys(permissionLabels)),
    [catalog]
  );
  const openCreate = () => {
    setEditing(null);
    setError("");
    setForm({ name: "", label: "", permissions: [] });
    setOpen(true);
  };
  const openEdit = role => {
    setEditing(role);
    setError("");
    setForm({
      name: role.name || "",
      label: role.label || role.name || "",
      permissions: role.permissions || [],
    });
    setOpen(true);
  };
  const submit = async event => {
    event.preventDefault();
    setError("");
    try {
      if (editing)
        await updateRole(editing._id, {
          label: form.label,
          permissions: form.permissions,
          active: true,
        });
      else
        await createRole({
          name: form.name,
          label: form.label || form.name,
          permissions: form.permissions,
        });
      setOpen(false);
      setNotice(editing ? "Role permissions updated." : "Role created.");
      await resource.reload();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Unable to save role.");
    }
  };
  const togglePermission = permission =>
    setForm(current => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter(item => item !== permission)
        : [...current.permissions, permission],
    }));
  return (
    <>
      <PageHeader
        eyebrow="Access control"
        title="Roles & permissions"
        description="Choose clear page and action access for every core or custom role."
        action={
          <Button className="btn-coral" onClick={openCreate}>
            <Plus size={15} /> Create role
          </Button>
        }
      />
      <ToastNotification
        message={notice}
        variant="success"
        onClose={() => setNotice("")}
      />
      <Card className="table-card">
        <CardBody>
          <DataTable
            columns={["Role", "Permissions", "Actions"]}
            rows={resource.data || []}
            loading={resource.loading}
            error={resource.error}
            onRetry={resource.reload}
            renderRow={item => (
              <tr key={item._id}>
                <td>
                  <strong>{item.label || item.name || item.role}</strong>
                  <span className="row-sub">
                    {["admin", "teacher", "student"].includes(item.name)
                      ? "Core role · editable"
                      : "Custom role · editable"}
                  </span>
                </td>
                <td>
                  {item.permissions
                    ?.map(
                      permission => permissionLabels[permission] || permission
                    )
                    .join(", ") || "No pages assigned"}
                </td>
                <td>
                  <Button color="light" onClick={() => openEdit(item)}>
                    <Edit3 size={15} /> Edit
                  </Button>
                </td>
              </tr>
            )}
          />
        </CardBody>
      </Card>
      <Modal
        isOpen={open}
        toggle={() => setOpen(false)}
        fade={false}
        centered
        size="lg"
      >
        <ModalHeader toggle={() => setOpen(false)}>
          {editing
            ? `Edit ${editing.label || editing.name} role`
            : "Create role"}
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={submit}>
            <FormGroup>
              <Label>Role name</Label>
              <Input
                required
                disabled={Boolean(editing)}
                placeholder="e.g. receptionist"
                value={form.name}
                onChange={event =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </FormGroup>
            <FormGroup>
              <Label>Display name</Label>
              <Input
                required
                value={form.label}
                onChange={event =>
                  setForm({ ...form, label: event.target.value })
                }
              />
            </FormGroup>
            <Label>Page and action access</Label>
            <div className="permission-groups">
              {Object.entries(permissionGroups).map(([group, permissions]) => (
                <div className="permission-group" key={group}>
                  <div className="eyebrow">{group}</div>
                  {permissions
                    .filter(permission => visibleCatalog.includes(permission))
                    .map(permission => (
                      <label key={permission} className="permission-option">
                        <input
                          type="checkbox"
                          checked={form.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                        />{" "}
                        <span>
                          {permissionLabels[permission] || permission}
                        </span>
                      </label>
                    ))}
                </div>
              ))}
            </div>
            <ToastNotification
              message={error}
              variant="error"
              onClose={() => setError("")}
            />
            <Button type="submit" className="btn-coral w-100">
              {editing ? "Save role changes" : "Create role"}
            </Button>
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
}
