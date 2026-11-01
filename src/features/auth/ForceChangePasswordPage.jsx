/* Forced password change: shown when the backend requires a new password. */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "@tanstack/react-router";
import { KeyRound, ShieldCheck } from "lucide-react";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import { env } from "../../config/env";

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

export default function ForceChangePasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error: serverError } = useSelector(state => state.auth);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Why: a forced-change screen must not show a stale message from another page.
  useEffect(() => {
    dispatch.auth.resetMessages();
    return () => dispatch.auth.resetMessages();
  }, [dispatch]);

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: "" }));
    if (serverError) dispatch.auth.resetMessages();
  };

  const submit = async event => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const changed = await dispatch.auth.changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });

    if (changed) {
      await dispatch.auth.bootstrap();
      navigate({ to: "/dashboard", replace: true });
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-4 py-10 font-sans">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-control bg-brand text-sm font-bold text-white">
            P
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{env.appTitle}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              Account security
            </p>
          </div>
        </div>

        <div className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-8">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-warning-soft text-warning">
            <ShieldCheck size={20} aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-sans text-2xl font-semibold tracking-tight text-ink">
            Change your password.
          </h1>
          <p className="mt-2 text-sm text-muted">
            An administrator reset your password. Choose a new one to continue.
          </p>

          {serverError ? (
            <div
              role="alert"
              className="mt-4 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
            >
              {serverError}
            </div>
          ) : null}

          <form onSubmit={submit} noValidate className="mt-6 grid gap-4">
            <FormField
              label="Current password"
              htmlFor="force-current-password"
              required
              error={errors.currentPassword}
            >
              <Input
                id="force-current-password"
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
              htmlFor="force-new-password"
              required
              error={errors.newPassword}
              hint="Use at least 8 characters."
            >
              <Input
                id="force-new-password"
                type="password"
                autoComplete="new-password"
                value={form.newPassword}
                invalid={Boolean(errors.newPassword)}
                onChange={event => update("newPassword", event.target.value)}
              />
            </FormField>

            <FormField
              label="Confirm new password"
              htmlFor="force-confirm-password"
              required
              error={errors.confirmPassword}
            >
              <Input
                id="force-confirm-password"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                invalid={Boolean(errors.confirmPassword)}
                onChange={event =>
                  update("confirmPassword", event.target.value)
                }
              />
            </FormField>

            <Button type="submit" loading={loading} className="mt-1 w-full">
              <KeyRound size={16} aria-hidden="true" />
              Update password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
