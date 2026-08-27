/* Route tree: all URL composition and protected-route behavior live here. */
import { useEffect } from 'react';
import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router';
import { useDispatch, useSelector } from 'react-redux';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../features/auth/LoginPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import AssignmentsPage from '../features/assignments/AssignmentsPage';
import AssignmentDetailPage from '../features/assignments/AssignmentDetailPage';
import SubmissionsPage from '../features/submissions/SubmissionsPage';
import GradingPage from '../features/grading/GradingPage';
import AttendancePage from '../features/attendance/AttendancePage';
import BatchesPage from '../features/batches/BatchesPage';
import UsersPage from '../features/users/UsersPage';
import RolesPage from '../features/roles/RolesPage';
import ProfilePage from '../features/profile/ProfilePage';
import { hydrateSession } from '../store/actions/authActions';
const rootRoute = createRootRoute({ component: Root });
function Root() { const dispatch = useDispatch(); useEffect(() => { dispatch(hydrateSession()); }, [dispatch]); return <Outlet />; }
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginPage });
const protectedRoute = createRoute({ getParentRoute: () => rootRoute, id: 'protected', beforeLoad: ({ context }) => { if (!context.auth.user && !localStorage.getItem('techzone_token')) throw redirect({ to: '/login' }); }, component: AppLayout });
const child = (path, component) => createRoute({ getParentRoute: () => protectedRoute, path, component });
const routeTree = rootRoute.addChildren([loginRoute, protectedRoute.addChildren([child('/', DashboardPage), child('/dashboard', DashboardPage), child('/assignments', AssignmentsPage), createRoute({ getParentRoute: () => protectedRoute, path: '/assignments/$assignmentId', component: AssignmentDetailPage }), child('/submissions', SubmissionsPage), child('/grading', GradingPage), child('/attendance', AttendancePage), child('/batches', BatchesPage), child('/users', UsersPage), child('/roles-permissions', RolesPage), child('/profile', ProfilePage)])]);
export const router = createRouter({ routeTree, context: { auth: {} } });
export function RouterProvider() { const auth = useSelector((state) => state.auth); return <RouterProviderImpl router={router} context={{ auth }} />; }
import { RouterProvider as RouterProviderImpl } from '@tanstack/react-router';
