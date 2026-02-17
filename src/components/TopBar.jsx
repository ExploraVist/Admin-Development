import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import '../styles/topbar.css';

export const TopBar = memo(function TopBar({ title }) {
  const { adminUser, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const handleToggle = useCallback(() => setOpen(v => !v), []);
  const handleLogout = useCallback(() => {
    setOpen(false);
    logout();
  }, [logout]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="topbar">
      <h2 className="topbar-title">{title}</h2>
      <div className="topbar-user" ref={ref}>
        <button className="topbar-user-btn" onClick={handleToggle}>
          <User size={16} />
          <span>{adminUser?.displayName || 'User'}</span>
          <ChevronDown size={14} />
        </button>
        {open && (
          <div className="topbar-dropdown">
            <div className="topbar-dropdown-info">
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{adminUser?.email}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'capitalize' }}>{adminUser?.role}</div>
            </div>
            <button className="topbar-dropdown-item" onClick={handleLogout}>
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
});
