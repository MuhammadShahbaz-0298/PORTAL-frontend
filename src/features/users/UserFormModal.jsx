/* UserFormModal: creates an account and keeps every failure inline in the modal. */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import FormField from "../../components/ui/FormField";
import SearchSelect from "../../components/ui/SearchSelect";
import { CORE_ROLE_OPTIONS } from "../../lib/roles";

const EMPTY_FORM = { name: "", email: "", role: "student" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildRoleOptions(roles) {
  const merged = new Map(
    CORE_ROLE_OPTIONS.map(option => [option.value, option])
  );

  (roles || []).forEach(role => {
    const value = role.name || role.role;
    if (value) merged.set(value, { value, label: role.label || value });
  });

  return [...merged.values()];
}

function validate(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = "Enter the person's full name.";
  if (!form.email.trim()) errors.email = "Enter their email address.";
  else if (!EMAIL_PATTERN.test(form.email.trim()))
    errors.email = "Enter a valid email address.";
  if (!form.role) errors.role = "Choose an account role.";

  return errors;
}

export default function UserFormModal() {
  const dispatch = useDispatch();
  const { formOpen, formError, saving, roles } = useSelector(
    state => state.users
  );
  const currentUser = useSelector(state => state.auth.user);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const isAdmin = currentUser?.role === "admin";
  const roleOptions = useMemo(() => {
    const options = buildRoleOptions(roles);
    // Why: the API only lets admins create non-student accounts.
    return isAdmin
      ? options
      : options.filter(option => option.value === "student");
  }, [roles, isAdmin]);

  // Why: a closed modal always reopens empty, including after a failed attempt.
  useEffect(() => {
    if (!formOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }, [formOpen]);

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: "" }));
    if (formError) dispatch.users.setFormError("");
  };

  const close = () => {
    if (!saving) dispatch.users.closeForm();
  };

  const submit = async event => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const created = await dispatch.users.create(form);
    if (created) setForm(EMPTY_FORM);
  };

  return (
    <Modal
      open={formOpen}
      onClose={close}
      title="Create account"
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="create-user-form" loading={saving}>
            Create account
          </Button>
        </>
      }
    >
      <form
        id="create-user-form"
        onSubmit={submit}
        noValidate
        className="grid gap-4"
      >
        <FormField
          label="Full name"
          htmlFor="create-user-name"
          required
          error={errors.name}
        >
          <Input
            id="create-user-name"
            autoComplete="off"
            value={form.name}
            invalid={Boolean(errors.name)}
            onChange={event => update("name", event.target.value)}
          />
        </FormField>

        <FormField
          label="Email address"
          htmlFor="create-user-email"
          required
          error={errors.email}
        >
          <Input
            id="create-user-email"
            type="email"
            autoComplete="off"
            value={form.email}
            invalid={Boolean(errors.email)}
            onChange={event => update("email", event.target.value)}
          />
        </FormField>

        <FormField
          label="Account role"
          htmlFor="create-user-role"
          required
          error={errors.role}
          hint="Permissions follow the role."
        >
          <SearchSelect
            id="create-user-role"
            aria-label="Account role"
            options={roleOptions}
            value={form.role}
            invalid={Boolean(errors.role)}
            onChange={value => update("role", value)}
          />
        </FormField>

        {formError ? (
          <div
            role="alert"
            className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
          >
            {formError}
          </div>
        ) : null}

        <p className="text-xs text-muted">
          A one-time password is generated after creation and shown once in the
          credentials panel.
        </p>
      </form>
    </Modal>
  );
}
