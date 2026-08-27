/* Sidebar component: owns navigation visibility and session sign-out only. */
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { LayoutDashboard, ClipboardList, Inbox, GraduationCap, UsersRound, CalendarCheck, ShieldCheck, UserCircle, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Brand from './Brand';
import routesConfig from '../../routes-config';
const icons = { dashboard: LayoutDashboard, assignments: ClipboardList, submissions: Inbox, grading: GraduationCap, batches: UsersRound, attendance: CalendarCheck, users: UsersRound, roles: ShieldCheck, profile: UserCircle };
import { logout } from '../../store/actions/authActions';
import { hasPermission } from '../../lib/permissions';
export default function Sidebar({ open = false, onNavigate, mobile = false }) { const { user } = useSelector((state) => state.auth); const location = useLocation(); const navigate = useNavigate(); const dispatch = useDispatch(); const items = (routesConfig || []).filter((item) => item.sidebar && hasPermission(user, item.permission, item.roles || [])); return <aside className={`sidebar ${open ? 'open' : ''} ${mobile ? 'mobile-sidebar' : ''}`}><Brand /><div className="rail-label">Workspace</div><nav>{items.map((item) => { const Icon = icons[item.icon] || LayoutDashboard; return <Link key={item.path} to={item.path} className={location.pathname === item.path || location.pathname.startsWith(`${item.path}/`) ? 'active' : ''} onClick={onNavigate}><Icon size={17} /><span>{item.label}</span></Link>; })}</nav><div className="sidebar-footer"><div className="mini-avatar">{(user?.name || 'Admin User').split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div><strong>{user?.name || 'Admin User'}</strong><small>{user?.role || 'admin'}</small></div><button aria-label="Sign out" onClick={() => { dispatch(logout()); navigate({ to: '/login' }); }}><LogOut size={16} /></button></div></aside>; }
