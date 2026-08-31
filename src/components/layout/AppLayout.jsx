/* AppLayout: authenticated shell plus direct-route permission protection. */
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import Topbar from "./Topbar";
import routesConfig from "../../routes-config";
import { hasPermission } from "../../lib/permissions";
import { LoadingState } from "../ui/PageHeader";
import { INACTIVITY_TIMEOUT_MS, isSessionExpired, logout, touchSession } from "../../store/actions/authActions";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
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
    if (!localStorage.getItem("school_portal_token") || !user) return;
    const resetTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      touchSession();
      inactivityTimerRef.current = setTimeout(() => {
        dispatch(logout());
        navigate({ to: "/login" });
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    const handleActivity = () => {
      if (isSessionExpired()) {
        dispatch(logout());
        navigate({ to: "/login" });
        return;
      }
      resetTimer();
    };

    if (isSessionExpired()) {
      dispatch(logout());
      navigate({ to: "/login" });
      return;
    }

    resetTimer();
    events.forEach(eventName => window.addEventListener(eventName, handleActivity));

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      events.forEach(eventName =>
        window.removeEventListener(eventName, handleActivity)
      );
    };
  }, [dispatch, navigate, user]);

  if (loading || (!user && localStorage.getItem("school_portal_token")))
    return <LoadingState text="Restoring your workspace…" />;
  if (!allowed)
    return (
      <div className="access-denied">
        <div className="eyebrow">Access limited</div>
        <h1>This page is not part of your workspace.</h1>
        <p>Ask an administrator for the page permission you need.</p>
        <button
          className="btn btn-coral"
          onClick={() => navigate({ to: "/dashboard" })}
        >
          Return to dashboard
        </button>
      </div>
    );
  return (
    <div className="portal-shell">
      <Sidebar onNavigate={() => setMobileOpen(false)} />{" "}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="main-canvas">
        <Topbar onOpenMenu={() => setMobileOpen(true)} />
        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
