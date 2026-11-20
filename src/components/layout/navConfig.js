/* Navigation contract: route config plus icons decide what every nav surface shows. */
import {
  Calendar,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Megaphone,
  PartyPopper,
  PenLine,
  ScrollText,
  ShieldCheck,
  UserCircle,
  UserCog,
  UsersRound,
} from "lucide-react";
import routesConfig from "../../routes-config";
import { hasPermission } from "../../lib/permissions";

export const NAV_ICONS = {
  dashboard: LayoutDashboard,
  assignments: ClipboardList,
  submissions: Inbox,
  grading: GraduationCap,
  timetable: Clock3,
  batches: UsersRound,
  attendance: CalendarCheck,
  users: UserCog,
  announcements: Megaphone,
  quizzes: ClipboardCheck,
  quizBuilder: PenLine,
  calendar: Calendar,
  events: PartyPopper,
  audit: ScrollText,
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

export const SIDEBAR_GROUPS = [
  { label: "Overview", paths: ["/dashboard"] },
  {
    label: "Teaching",
    paths: ["/assignments", "/submissions", "/grading", "/quizzes"],
  },
  {
    label: "Schedule",
    paths: ["/timetable", "/attendance", "/calendar", "/events"],
  },
  { label: "Communication", paths: ["/announcements"] },
  { label: "People", paths: ["/batches", "/users"] },
  { label: "Administration", paths: ["/audit-log", "/roles-permissions"] },
  { label: "Account", paths: ["/profile"] },
];

export function getVisibleNavItems(user) {
  return (routesConfig || []).filter(
    item =>
      item.sidebar && hasPermission(user, item.permission, item.roles || [])
  );
}

export function getVisibleNavGroups(user) {
  const visible = getVisibleNavItems(user);
  const byPath = new Map(visible.map(item => [item.path, item]));
  const assigned = new Set();
  const groups = SIDEBAR_GROUPS.map(group => ({
    label: group.label,
    items: group.paths.map(path => byPath.get(path)).filter(Boolean),
  })).filter(group => {
    group.items.forEach(item => assigned.add(item.path));
    return group.items.length > 0;
  });
  const remaining = visible.filter(item => !assigned.has(item.path));
  if (remaining.length) groups.push({ label: "More", items: remaining });
  return groups;
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
