/* Users feature: admin account creation and account lifecycle controls with SweetAlert confirmations. */
import { useMemo, useState } from "react";
import {
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
import { Check, Copy, MoreHorizontal, Plus, Search } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { register } from "../../api/auth";
import { listUsers, updateUser, deleteUser } from "../../api/users";
import { listRoles } from "../../api/roles";
import useApiResource from "../../hooks/useApiResource";
import { PageHeader, StatusBadge } from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import SearchableSelect from "../../components/ui/SearchableSelect";
import ToastNotification from "../../components/ui/ToastNotification";

const generatePassword = () =>
  `${crypto.randomUUID().slice(0, 8)}${Math.floor(Math.random() * 90 + 10)}`;
const coreAccountRoles = [
  { name: "admin", label: "Administrator" },
  { name: "teacher", label: "Teacher" },
  { name: "student", label: "Student" },
];
const fetchRoles = () =>
  listRoles().then(response => ({
    ...response,
    data: response.data?.roles || [],
  }));

export default function UsersPage() {
  const resource = useApiResource(listUsers);
  const roles = useApiResource(fetchRoles);
  const roleOptions = useMemo(
    () => [
      ...new Map(
        [...coreAccountRoles, ...(roles.data || [])]
          .filter(role => role.name || role.role)
          .map(role => [role.name || role.role, role])
      ).values(),
    ],
    [roles.data]
  );
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [actioning, setActioning] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "student",
    batchId: "",
  });
  const rows = useMemo(
    () =>
      (resource.data || []).filter(item =>
        `${item.name} ${item.email} ${item.role}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [resource.data, query]
  );

  const submit = async event => {
    event.preventDefault();
    setError("");
    const password = generatePassword();
    try {
      await register({ ...form, password });
      setCredentials({ email: form.email, password });
      setOpen(false);
      setForm({ name: "", email: "", role: "student", batchId: "" });
      setNotice("User account created successfully.");
      await resource.reload();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Unable to create user.");
    }
  };

  const openUserActions = async account => {
    const shouldActivate = account.active === false;
    const result = await Swal.fire({
      title: "Manage account",
      text: `${account.name || "This user"} (${account.role})`,
      icon: "question",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: shouldActivate ? "Activate" : "Deactivate",
      denyButtonText: "Delete",
      cancelButtonText: "Close",
      confirmButtonColor: shouldActivate ? "#173044" : "#b8563d",
      denyButtonColor: "#b8563d",
      cancelButtonColor: "#173044",
      reverseButtons: true,
      customClass: {
        popup: "swal-linen",
        confirmButton: "swal-confirm",
        denyButton: "swal-delete",
        cancelButton: "swal-cancel",
      },
    });

    if (result.isConfirmed) {
      setActioning(account._id);
      setError("");
      try {
        await updateUser(account._id, { active: shouldActivate });
        setNotice(
          `${account.name || "User"} ${shouldActivate ? "activated" : "deactivated"} successfully.`,
        );
        await resource.reload();
      } catch (requestError) {
        setError(
          requestError.response?.data?.error ||
            `Unable to ${shouldActivate ? "activate" : "deactivate"} account.`
        );
      } finally {
        setActioning(null);
      }
      return;
    }

    if (result.isDenied) {
      const confirmation = await Swal.fire({
        title: "Delete user?",
        text: `${account.name || "This user"} will be permanently removed from the system.`,
        icon: "error",
        showCancelButton: true,
        confirmButtonText: "Delete user",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#b8563d",
        cancelButtonColor: "#173044",
        reverseButtons: true,
        customClass: {
          popup: "swal-linen",
          confirmButton: "swal-confirm",
          cancelButton: "swal-cancel",
        },
      });

      if (!confirmation.isConfirmed) return;

      setActioning(account._id);
      setError("");
      try {
        await deleteUser(account._id);
        setNotice(`${account.name || "User"} deleted permanently.`);
        await resource.reload();
      } catch (requestError) {
        setError(requestError.response?.data?.error || "Unable to delete user.");
      } finally {
        setActioning(null);
      }
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="People directory"
        title="Users"
        description="Create and manage accounts for every active role."
        action={
          <Button
            className="btn-coral"
            onClick={() => {
              setError("");
              setOpen(true);
            }}
          >
            <Plus size={15} /> Create user
          </Button>
        }
      />
      <ToastNotification
        message={error || notice}
        variant={error ? "error" : "success"}
        onClose={() => {
          setError("");
          setNotice("");
        }}
      />
      <Card className="table-card">
        <CardBody>
          <div className="toolbar">
            <div className="searchbox">
              <Search size={16} />
              <Input
                placeholder="Search name, email, or role"
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
            </div>
          </div>
          <DataTable
            columns={["Name", "Email", "Role", "Status", "Actions"]}
            rows={rows}
            loading={resource.loading}
            error={resource.error}
            onRetry={resource.reload}
            renderRow={item => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>
                  <StatusBadge tone="blue">{item.role}</StatusBadge>
                </td>
                <td>
                  <StatusBadge tone={item.active === false ? "danger" : "success"}>
                    {item.active === false ? "Inactive" : "Active"}
                  </StatusBadge>
                </td>
                <td className="table-actions-cell">
                  <div className="table-inline-actions">
                    <Button
                      color="light"
                      className="table-action"
                      disabled={actioning === item._id}
                      onClick={() => openUserActions(item)}
                      aria-label={`Manage ${item.name}`}
                    >
                      <MoreHorizontal size={15} /> Actions
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          />
        </CardBody>
      </Card>
      <Modal isOpen={open} toggle={() => setOpen(false)} fade={false} centered>
        <ModalHeader toggle={() => setOpen(false)}>Create account</ModalHeader>
        <ModalBody>
          <Form onSubmit={submit}>
            <FormGroup>
              <Label>Full name</Label>
              <Input
                required
                value={form.name}
                onChange={event =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </FormGroup>
            <FormGroup>
              <Label>Email</Label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={event =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </FormGroup>
            <SearchableSelect
              label="Account role"
              placeholder="Search roles"
              required
              value={form.role}
              options={roleOptions}
              getValue={role => role.name || role.role}
              getLabel={role => role.label || role.name || role.role}
              onChange={value => setForm({ ...form, role: value })}
            />
            <ToastNotification
              message={error}
              variant="error"
              onClose={() => setError("")}
            />
            <p className="form-note">
              A one-time password is generated after creation and shown only in
              the confirmation panel.
            </p>
            <Button type="submit" className="btn-coral w-100">
              Create account
            </Button>
          </Form>
        </ModalBody>
      </Modal>
      <Modal
        isOpen={Boolean(credentials)}
        toggle={() => setCredentials(null)}
        fade={false}
        centered
      >
        <ModalHeader toggle={() => setCredentials(null)}>
          <Check size={18} /> Account created
        </ModalHeader>
        <ModalBody>
          <p>
            Share these credentials securely with the new account holder. They
            are not stored in the browser.
          </p>
          <div className="credential-box">
            <div>
              <span>Email</span>
              <strong>{credentials?.email}</strong>
            </div>
            <div>
              <span>Initial password</span>
              <strong>{credentials?.password}</strong>
            </div>
            <Button
              color="light"
              onClick={() =>
                navigator.clipboard?.writeText(
                  `${credentials?.email}\n${credentials?.password}`
                )
              }
            >
              <Copy size={15} /> Copy
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
