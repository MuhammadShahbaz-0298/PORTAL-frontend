/* AppLayout: authenticated shell plus direct-route permission protection. */
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import Topbar from "./Topbar";
import routesConfig from "../../routes-config";
import { hasPermission } from "../../lib/permissions";
import { LoadingState } from "../ui/PageHeader";
export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useSelector(state => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
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
  if (loading || (!user && localStorage.getItem("techzone_token")))
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
