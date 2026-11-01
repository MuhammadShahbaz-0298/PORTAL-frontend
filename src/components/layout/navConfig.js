/* Navigation contract: route config plus icons decide what every nav surface shows. */
import {
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  ShieldCheck,
  UserCircle,
  UsersRound,
} from "lucide-react";
import routesConfig from "../../routes-config";
import { hasPermission } from "../../lib/permissions";

export const NAV_ICONS = {
  dashboard: LayoutDashboard,
  assignments: ClipboardList,
  submissions: Inbox,
  grading: GraduationCap,
  batches: UsersRound,
  attendance: CalendarCheck,
  users: UsersRound,
  roles: ShieldCheck,
  profile: UserCircle,
};

// Why: thumb reach. Four daily pages stay on the bar, everything else lives in More.
export const PRIMARY_PATHS = [
  "/dashboard",
  "/assignments",
  "/submissions",
  "/attendance",
];

export function getVisibleNavItems(user) {
  return (routesConfig || []).filter(
    item =>
      item.sidebar && hasPermission(user, item.permission, item.roles || [])
  );
}

export function getPrimaryNavItems(user) {
  const visible = getVisibleNavItems(user);
  return PRIMARY_PATHS.map(path => visible.find(item => item.path === path))
    .filter(Boolean)
    .slice(0, 4);
}

export function getOverflowNavItems(user) {
  const primaryPaths = new Set(getPrimaryNavItems(user).map(item => item.path));
  return getVisibleNavItems(user).filter(item => !primaryPaths.has(item.path));
}

export function isActivePath(pathname, path) {
  if (path === "/dashboard")
    return pathname === "/" || pathname === "/dashboard";
  return pathname === path || pathname.startsWith(`${path}/`);
}
