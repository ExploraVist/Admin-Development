import { memo, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  Cpu,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { TEAMS } from '../utils/constants';
import '../styles/sidebar.css';

export const Sidebar = memo(function Sidebar() {
  const { adminUser, isAdmin } = useAuth();

  const visibleTeams = useMemo(() => {
    if (isAdmin) return TEAMS;
    const userTeams = adminUser?.teams || [];
    return TEAMS.filter(t => userTeams.includes(t.slug));
  }, [isAdmin, adminUser?.teams]);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-text">ExploraVist</span>
        <span className="sidebar-logo-sub">Admin</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-link">
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <div className="sidebar-section-label">Teams</div>
        {visibleTeams.map(team => (
          <NavLink key={team.slug} to={`/tasks/${team.slug}`} className="sidebar-link">
            <ListTodo size={16} />
            <span>{team.label}</span>
            <ChevronRight size={14} className="sidebar-link-arrow" />
          </NavLink>
        ))}

        <div className="sidebar-section-label">DevOps</div>
        <NavLink to="/devops" className="sidebar-link">
          <Cpu size={18} />
          <span>Devices</span>
        </NavLink>

        {isAdmin && (
          <>
            <div className="sidebar-section-label">Admin</div>
            <NavLink to="/admin/permissions" className="sidebar-link">
              <Shield size={18} />
              <span>Permissions</span>
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
});
