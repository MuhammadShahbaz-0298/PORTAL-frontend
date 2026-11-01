/* Profile page: signed-in identity plus a session-safe password change. */
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
// import Avatar from "../../components/ui/Avatar";
// import Badge from "../../components/ui/Badge";
// import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import PageHeader from "../../components/ui/PageHeader";
import { roleLabel } from "../../lib/roles";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

const EMPTY_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function validate(form) {
  const errors = {};

  if (!form.currentPassword)
    errors.currentPassword = "Enter your current password.";
  if (!form.newPassword) errors.newPassword = "Choose a new password.";
  else if (form.newPassword.length < 8)
    errors.newPassword = "Use at least 8 characters.";
  if (!form.confirmPassword)
    errors.confirmPassword = "Confirm your new password.";
  else if (form.newPassword !== form.confirmPassword)
    errors.confirmPassword = "New passwords do not match.";

  return errors;
}

function ProfilePage({
  user,
  loading,
  error,
  success,
  changePassword,
  resetMessages,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Why: messages belong to this form, so they must not survive navigation.
  useEffect(() => {
    resetMessages();
    return () => resetMessages();
  }, [resetMessages]);

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: "" }));
    if (error || success) resetMessages();
  };

  const submit = async event => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const changed = await changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });

    if (changed) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  };

  return (
    <div className="font-sans">
      <PageHeader
        eyebrow="Account settings"
        title="Profile"
        description="Your identity, security, and school workspace details."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
          <div className="flex flex-col items-center text-center">
            <Avatar name={user?.name} size="lg" className="h-16 w-16 text-lg" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              Signed-in account
            </p>
            <h2 className="mt-1 font-sans text-xl font-semibold tracking-tight text-ink">
              {user?.name || "School account"}
            </h2>
            <p className="mt-1 break-all text-sm text-muted">
              {user?.email || "No email returned"}
            </p>
            <Badge tone="brand" className="mt-3 capitalize">
              {roleLabel(user?.role)}
            </Badge>
          </div>

          <dl className="mt-6 grid gap-3 border-t border-line pt-5 text-sm">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-canvas text-muted">
                <Mail size={17} aria-hidden="true" />
              </span>
              <div>
                <dt className="font-medium text-ink">Email verified</dt>
                <dd className="text-muted">
                  Verified by the school backend for sign-in and notifications.
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-canvas text-muted">
                <ShieldCheck size={17} aria-hidden="true" />
              </span>
              <div>
                <dt className="font-medium text-ink">Role and access</dt>
                <dd className="text-muted">
                  {roleLabel(user?.role)} · permissions follow this role.
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-canvas text-muted">
                <UserRound size={17} aria-hidden="true" />
              </span>
              <div>
                <dt className="font-medium text-ink">Session</dt>
                <dd className="text-muted">
                  You are signed in with an idle timeout of 10 minutes.
                </dd>
              </div>
            </div>
          </dl>
        </section>

        <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-soft text-brand">
            <KeyRound size={20} aria-hidden="true" />
          </span>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            Security
          </p>
          <h2 className="mt-1 font-sans text-xl font-semibold tracking-tight text-ink">
            Change password
          </h2>
          <p className="mt-2 text-sm text-muted">
            Use a strong password you do not reuse elsewhere.
          </p>

          {error ? (
            <div
              role="alert"
              className="mt-4 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
            >
              {error}
            </div>
          ) : null}
          {success ? (
            <div
              role="status"
              className="mt-4 rounded-control border border-success/30 bg-success-soft px-3 py-2 text-sm font-medium text-success"
            >
              {success}
            </div>
          ) : null}

          <form onSubmit={submit} noValidate className="mt-5 grid gap-4">
            <FormField
              label="Current password"
              htmlFor="profile-current-password"
              required
              error={errors.currentPassword}
            >
              <Input
                id="profile-current-password"
                type="password"
                autoComplete="current-password"
                value={form.currentPassword}
                invalid={Boolean(errors.currentPassword)}
                onChange={event =>
                  update("currentPassword", event.target.value)
                }
              />
            </FormField>

            <FormField
              label="New password"
              htmlFor="profile-new-password"
              required
              error={errors.newPassword}
              hint="Use at least 8 characters."
            >
              <Input
                id="profile-new-password"
                type="password"
                autoComplete="new-password"
                value={form.newPassword}
                invalid={Boolean(errors.newPassword)}
                onChange={event => update("newPassword", event.target.value)}
              />
            </FormField>

            <FormField
              label="Confirm new password"
              htmlFor="profile-confirm-password"
              required
              error={errors.confirmPassword}
            >
              <Input
                id="profile-confirm-password"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                invalid={Boolean(errors.confirmPassword)}
                onChange={event =>
                  update("confirmPassword", event.target.value)
                }
              />
            </FormField>

            <Button
              type="submit"
              loading={loading}
              className="justify-self-start"
            >
              Update password
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}

const mapState = state => ({
  user: state.auth.user,
  loading: state.auth.loading,
  error: state.auth.error,
  success: state.auth.success,
});

const mapDispatch = dispatch => ({
  changePassword: dispatch.auth.changePassword,
  resetMessages: dispatch.auth.resetMessages,
});

export default connect(mapState, mapDispatch)(ProfilePage);
