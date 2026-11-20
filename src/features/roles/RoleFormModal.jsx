/* RoleFormModal: create or update a role with grouped permission toggles. */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";

const EMPTY_FORM = { name: "", label: "", permissions: [] };

function validate(form, isEditing) {
  const errors = {};

  if (!isEditing) {
    if (!form.name.trim()) {
      errors.name = "Enter an internal role name.";
    } else if (!/^[a-z0-9_-]+$/i.test(form.name.trim())) {
      errors.name = "Use only letters, numbers, hyphens, and underscores.";
    }
  }

  if (!form.label.trim()) {
    errors.label = "Enter a display name.";
  }

  return errors;
}

function groupPermissions(catalog, permissionMeta) {
  const groups = new Map();
  catalog.forEach(permission => {
    const meta = permissionMeta?.[permission];
    const group = meta?.group || "Other";
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(permission);
  });
  return [...groups.entries()].sort(([a], [b]) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });
}

export default function RoleFormModal() {
  const dispatch = useDispatch();
  const { formOpen, editing, formError, saving, catalog, permissionMeta } =
    useSelector(state => state.roles);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(editing);

  const grouped = useMemo(
    () => groupPermissions(catalog, permissionMeta),
    [catalog, permissionMeta]
  );

  useEffect(() => {
    if (!formOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
      return;
    }

    setForm({
      name: editing?.name || "",
      label: editing?.label || editing?.name || "",
      permissions: Array.isArray(editing?.permissions)
        ? [...editing.permissions]
        : [],
    });
    setErrors({});
  }, [formOpen, editing]);

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: "" }));
    if (formError) dispatch.roles.setFormError("");
  };

  const togglePermission = permission => {
    setForm(current => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter(p => p !== permission)
        : [...current.permissions, permission],
    }));
    if (formError) dispatch.roles.setFormError("");
  };

  const close = () => {
    if (!saving) dispatch.roles.closeForm();
  };

  const submit = async event => {
    event.preventDefault();
    const nextErrors = validate(form, isEditing);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    await dispatch.roles.save({
      id: editing?._id || editing?.id,
      values: {
        name: form.name.trim().toLowerCase(),
        label: form.label.trim(),
        permissions: form.permissions,
      },
    });
  };

  return (
    <Modal
      open={formOpen}
      onClose={close}
      title={
        isEditing ? `Edit ${editing.label || editing.name} role` : "Create role"
      }
      className="sm:max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="role-form" loading={saving}>
            {isEditing ? "Save role changes" : "Create role"}
          </Button>
        </>
      }
    >
      <form id="role-form" onSubmit={submit} noValidate className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Role name"
            htmlFor="role-name"
            required
            error={errors.name}
            hint={
              isEditing
                ? "The internal role identifier cannot be changed."
                : "e.g. coordinator"
            }
          >
            <Input
              id="role-name"
              value={form.name}
              disabled={isEditing || saving}
              invalid={Boolean(errors.name)}
              placeholder="e.g. coordinator"
              onChange={event => update("name", event.target.value)}
            />
          </FormField>

          <FormField
            label="Display name"
            htmlFor="role-label"
            required
            error={errors.label}
            hint="Human-readable title shown across the portal."
          >
            <Input
              id="role-label"
              value={form.label}
              disabled={saving}
              invalid={Boolean(errors.label)}
              placeholder="e.g. Academic Coordinator"
              onChange={event => update("label", event.target.value)}
            />
          </FormField>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-medium text-ink">
              Page and action access
            </span>
            <span className="text-xs text-muted">
              {form.permissions.length} selected
            </span>
          </div>

          <div className="grid gap-4 max-h-80 overflow-y-auto rounded-control border border-line bg-canvas/30 p-3">
            {grouped.map(([group, permissions]) => (
              <div
                key={group}
                className="rounded-control border border-line bg-surface p-3"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                  {group}
                </p>
                <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                  {permissions.map(permission => {
                    const checked = form.permissions.includes(permission);
                    const label =
                      permissionMeta?.[permission]?.label || permission;
                    return (
                      <label
                        key={permission}
                        className="flex cursor-pointer items-center gap-2.5 text-sm text-ink hover:text-brand"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={saving}
                          onChange={() => togglePermission(permission)}
                          className="h-4 w-4 rounded accent-brand"
                        />
                        <span>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {formError ? (
          <div
            role="alert"
            className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
          >
            {formError}
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
