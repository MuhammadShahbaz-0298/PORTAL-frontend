/* Auth feature: accessible login form for the inspected /api/auth/login contract. */
import { useState } from "react";
import { Form, FormGroup, Input, Label, Button, Alert } from "reactstrap";
import { ArrowUpRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "@tanstack/react-router";
import Swal from "sweetalert2";
import { login } from "../../store/actions/authActions";
import { env } from "../../config/env";
export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const submit = async event => {
    event.preventDefault();
    if (!form.email || !form.password) return;
    try {
      await dispatch(login(form));
      navigate({ to: "/dashboard" });
    } catch (loginError) {
      const message =
        loginError?.message ||
        "Your account has been suspended or banned. Please contact your administrator.";
      Swal.fire({
        title: "Unable to sign in",
        text: message,
        icon: "warning",
        confirmButtonColor: "#173044",
        confirmButtonText: "OK",
      });
    }
  };
  return (
    <div className="login-page">
      <div className="login-art">
        <div className="login-copy">
          <span className="eyebrow">Learning operations</span>
          <h1>Make the work visible.</h1>
          <p>
            One calm place for assignments, people, feedback, and attendance.
          </p>
        </div>
      </div>
      <div className="login-panel">
        <div className="brand login-brand">
          <span className="brand-mark">
            <i />
          </span>
          <span>
            <strong>CompanyName</strong>
            <small>learning operations</small>
          </span>
        </div>
        <Form className="login-form" onSubmit={submit}>
          <span className="eyebrow">Portal sign in</span>
          <h2>Welcome back.</h2>
          <p>Use your school account to continue.</p>
          {error && (
            <Alert color="danger" fade={false}>
              {error}
            </Alert>
          )}
          <FormGroup>
            <Label for="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="you@school.edu"
              value={form.email}
              onChange={event =>
                setForm({ ...form, email: event.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <Label for="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={event =>
                setForm({ ...form, password: event.target.value })
              }
            />
          </FormGroup>
          <Button className="btn-coral w-100" disabled={loading}>
            {loading ? (
              "Signing in…"
            ) : (
              <>
                Sign in <ArrowUpRight size={15} />
              </>
            )}
          </Button>
          <div className="login-foot">
            <span>Protected by your school workspace</span>
            <span>v1.0</span>
          </div>
        </Form>
      </div>
    </div>
  );
}
