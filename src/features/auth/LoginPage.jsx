/* Login page: cookie-based sign-in with inline validation and page-level errors. */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "@tanstack/react-router";
import { CalendarCheck, ClipboardCheck, UsersRound } from "lucide-react";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import { apiError } from "../../api/client";
import { env } from "../../config/env";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_FORM = { email: "", password: "" };

function validate(form) {
  const errors = {};

  if (!form.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(form.email.trim()))
    errors.email = "Enter a valid email address.";

  if (!form.password) errors.password = "Enter your password.";

  return errors;
}

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(state => state.auth);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: "" }));
    if (error) setError("");
  };

  const submit = async event => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setError("");
    try {
      const user = await dispatch.auth.login({
        email: form.email.trim(),
        password: form.password,
      });
      navigate({
        to: user?.mustChangePassword ? "/force-change-password" : "/dashboard",
        replace: true,
      });
    } catch (requestError) {
      setError(apiError(requestError));
    }
  };

  return (
    <div className="grid min-h-screen bg-canvas font-sans lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-ink p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-brand/20 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-control bg-white text-sm font-bold text-ink">
            P
          </span>
          <div>
            <p className="text-sm font-semibold">{env.appTitle}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
              Learning operations
            </p>
          </div>
        </div>

        <div className="relative max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            One calm workspace
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight xl:text-5xl">
            Make the work visible.
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-white/70">
            Assignments, people, feedback, and attendance in one place your
            whole school can trust.
          </p>

          <ul className="mt-8 grid gap-3 text-sm text-white/80">
            <li className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-control bg-white/10">
                <ClipboardCheck size={17} aria-hidden="true" />
              </span>
              Clear assignment briefs and deadlines
            </li>
            <li className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-control bg-white/10">
                <UsersRound size={17} aria-hidden="true" />
              </span>
              One directory for every active role
            </li>
            <li className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-control bg-white/10">
                <CalendarCheck size={17} aria-hidden="true" />
              </span>
              Attendance registers that stay simple
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-white/50">
          Built for schools that value clarity.
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-control bg-brand text-sm font-bold text-white">
              P
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{env.appTitle}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Learning operations
              </p>
            </div>
          </div>

          <div className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              Portal sign in
            </p>
            <h2 className="mt-1 font-sans text-2xl font-semibold tracking-tight text-ink">
              Welcome back.
            </h2>
            <p className="mt-2 text-sm text-muted">
              Use your school account to continue.
            </p>

            {error ? (
              <div
                role="alert"
                className="mt-4 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
              >
                {error}
              </div>
            ) : null}

            <form onSubmit={submit} noValidate className="mt-6 grid gap-4">
              <FormField
                label="Email address"
                htmlFor="login-email"
                required
                error={errors.email}
              >
                <Input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@school.edu"
                  value={form.email}
                  invalid={Boolean(errors.email)}
                  onChange={event => update("email", event.target.value)}
                />
              </FormField>

              <FormField
                label="Password"
                htmlFor="login-password"
                required
                error={errors.password}
              >
                <Input
                  id="login-password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={form.password}
                  invalid={Boolean(errors.password)}
                  onChange={event => update("password", event.target.value)}
                />
              </FormField>

              <Button type="submit" loading={loading} className="mt-1 w-full">
                Sign in
              </Button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs text-muted">
            Protected by your school workspace · v1.0
          </p>
        </div>
      </section>
    </div>
  );
}
