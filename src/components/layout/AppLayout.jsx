/* AppLayout: authenticated shell, permission guard, and the idle-session timer. */
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useDispatch, useSelector } from "react-redux";
import { ShieldAlert } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BottomNav from "./BottomNav";
import MoreSheet from "./MoreSheet";
import routesConfig from "../../routes-config";
import { hasPermission } from "../../lib/permissions";
import { classNames } from "../../lib/classNames";
import { MOBILE_CONTENT_CLEARANCE_CLASS } from "../../constants/layout";
import { INACTIVITY_TIMEOUT_MS, isSessionExpired } from "../../lib/session";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Spinner from "../ui/Spinner";

export default function AppLayout() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { user, loading } = useSelector(state => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const inactivityTimerRef = useRef(null);
  const route =
    (routesConfig || []).find(
      item =>
        item.path !== "/dashboard" &&
        (location.pathname === item.path ||
          location.pathname.startsWith(`${item.path}/`))
    ) ||
    (location.pathname === "/dashboard"
      ? routesConfig?.find(item => item.path === "/dashboard")
      : null);
  const allowed =
    !route || hasPermission(user, route.permission, route.roles || []);

  useEffect(() => {
    if (!user) return undefined;

    const signOut = () => {
      dispatch.auth.logout();
      navigate({ to: "/login" });
    };

    const resetTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      dispatch.auth.touch();
      inactivityTimerRef.current = window.setTimeout(
        signOut,
        INACTIVITY_TIMEOUT_MS
      );
    };

    let lastHandledAt = 0;
    const handleActivity = () => {
      const now = Date.now();
      // Why: pointer events fire dozens of times a second; one check per second is plenty.
      if (now - lastHandledAt < 1000) return;
      lastHandledAt = now;

      if (isSessionExpired()) {
        signOut();
        return;
      }
      resetTimer();
    };

    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];

    if (isSessionExpired()) {
      signOut();
      return undefined;
    }

    resetTimer();
    events.forEach(eventName =>
      window.addEventListener(eventName, handleActivity)
    );

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      events.forEach(eventName =>
        window.removeEventListener(eventName, handleActivity)
      );
    };
  }, [dispatch, navigate, user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login", replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const refresh = () => dispatch.auth.refreshSession();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [dispatch]);

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Spinner
            size="lg"
            label="Restoring your workspace"
            className="text-brand"
          />
          <p className="text-sm text-muted">Restoring your workspace…</p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-4">
        <Card className="max-w-md p-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-warning-soft text-warning">
            <ShieldAlert size={22} aria-hidden="true" />
          </span>
          <h1 className="mt-3 font-sans text-xl font-semibold tracking-tight text-ink">
            This page is not part of your workspace.
          </h1>
          <p className="mt-2 text-sm text-muted">
            Ask an administrator for the page permission you need.
          </p>
          <Button
            className="mt-4 w-full"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            Return to dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />

      <div className="md:pl-64">
        <Topbar />
        <main
          className={classNames(
            "mx-auto w-full max-w-content px-4 pt-5 sm:px-6 md:pt-8 lg:px-8",
            MOBILE_CONTENT_CLEARANCE_CLASS
          )}
        >
          <Outlet />
        </main>
      </div>

      <BottomNav open={moreOpen} onOpenMore={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  );
}
