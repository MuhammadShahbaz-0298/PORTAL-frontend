/* Route tree: all URL composition and protected-route behavior live here. */
import { useEffect } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useDispatch } from "react-redux";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../features/auth/LoginPage";
import ForceChangePasswordPage from "../features/auth/ForceChangePasswordPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import AssignmentsPage from "../features/assignments/AssignmentsPage";
import AssignmentDetailPage from "../features/assignments/AssignmentDetailPage";
import SubmissionsPage from "../features/submissions/SubmissionsPage";
import GradingPage from "../features/grading/GradingPage";
import AttendancePage from "../features/attendance/AttendancePage";
import TimetablePage from "../features/timetable/TimetablePage";
import BatchesPage from "../features/batches/BatchesPage";
import UsersPage from "../features/users/UsersPage";
import RolesPage from "../features/roles/RolesPage";
import ProfilePage from "../features/profile/ProfilePage";
import AnnouncementsPage from "../features/announcements/AnnouncementsPage";
import QuizzesPage from "../features/quizzes/QuizzesPage";
import QuizBuilderPage from "../features/quizzes/QuizBuilderPage";
import QuizTakePage from "../features/quizzes/QuizTakePage";
import CalendarPage from "../features/calendar/CalendarPage";
import EventsPage from "../features/events/EventsPage";
import AuditLogPage from "../features/audit/AuditLogPage";

const rootRoute = createRootRoute({ component: Root });

function Root() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch.auth.bootstrap();
  }, [dispatch]);

  return <Outlet />;
}

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const forceChangePasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/force-change-password",
  component: ForceChangePasswordPage,
});

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  beforeLoad: ({ context }) => {
    if (!context.auth.loading && !context.auth.user)
      throw redirect({ to: "/login" });
  },
  component: AppLayout,
});

const child = (path, component) =>
  createRoute({ getParentRoute: () => protectedRoute, path, component });

const routeTree = rootRoute.addChildren([
  loginRoute,
  forceChangePasswordRoute,
  protectedRoute.addChildren([
    child("/", DashboardPage),
    child("/dashboard", DashboardPage),
    child("/assignments", AssignmentsPage),
    createRoute({
      getParentRoute: () => protectedRoute,
      path: "/assignments/$assignmentId",
      component: AssignmentDetailPage,
    }),
    child("/submissions", SubmissionsPage),
    child("/grading", GradingPage),
    child("/attendance", AttendancePage),
    child("/timetable", TimetablePage),
    child("/batches", BatchesPage),
    child("/users", UsersPage),
    child("/roles-permissions", RolesPage),
    child("/profile", ProfilePage),
    child("/announcements", AnnouncementsPage),
    child("/quizzes", QuizzesPage),
    createRoute({
      getParentRoute: () => protectedRoute,
      path: "/quizzes/$quizId",
      component: QuizTakePage,
    }),
    child("/quiz-builder", QuizBuilderPage),
    child("/calendar", CalendarPage),
    child("/events", EventsPage),
    child("/audit-log", AuditLogPage),
  ]),
]);

export const router = createRouter({ routeTree, context: { auth: {} } });
