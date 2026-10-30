/* Auth feature: forced password change after an administrator reset. */
import { useState } from "react";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import { KeyRound } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import * as authApi from "../../api/auth";
import { apiError } from "../../api/client";
import ToastNotification from "../../components/ui/ToastNotification";

export default function ForceChangePasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async event => {
    event.preventDefault();
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      navigate({ to: "/dashboard" });
    } catch (requestError) {
      setError(apiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-art" />
      <div className="login-panel">
        <Form className="login-form" onSubmit={submit}>
          <span className="eyebrow">Security required</span>
          <h2>Change your password.</h2>
          <p>
            An administrator reset your password. Choose a new one to continue.
          </p>
          <ToastNotification
            message={error}
            variant="error"
            onClose={() => setError("")}
          />
          <FormGroup>
            <Label for="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              value={form.currentPassword}
              onChange={event =>
                setForm({ ...form, currentPassword: event.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <Label for="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              minLength="6"
              required
              value={form.newPassword}
              onChange={event =>
                setForm({ ...form, newPassword: event.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <Label for="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={form.confirmPassword}
              onChange={event =>
                setForm({ ...form, confirmPassword: event.target.value })
              }
            />
          </FormGroup>
          <Button className="btn-coral w-100" disabled={loading}>
            {loading ? (
              "Updating…"
            ) : (
              <>
                <KeyRound size={15} /> Update password
              </>
            )}
          </Button>
        </Form>
      </div>
    </div>
  );
}
