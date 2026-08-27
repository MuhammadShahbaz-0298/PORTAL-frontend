/* Topbar component: owns route context and responsive menu affordance. */
import { Menu, MoreHorizontal } from 'lucide-react';
import { useLocation } from '@tanstack/react-router';
export default function Topbar({ onOpenMenu }) { const location = useLocation(); return <header className="topbar"><button className="menu-button" aria-label="Open menu" onClick={onOpenMenu}><Menu size={20} /></button><div className="breadcrumb">CompanyName <span>›</span> <strong>{location.pathname.split('/')[1] || 'dashboard'}</strong></div><div className="top-actions"><span className="workspace-label">School workspace</span><MoreHorizontal size={18} /></div></header>; }
