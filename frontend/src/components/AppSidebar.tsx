import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_MODULES } from '../pages/admin/adminModules';
import '../styles/admin.css';

/**
 * The single navigation rail for the whole app. Both the Dashboard and the
 * Admin suite render this same component, so the nav never changes shape as you
 * move between routes — only the active highlight moves.
 */
export const AppSidebar: React.FC<{ open: boolean; onNavigate: () => void }> = ({
  open,
  onNavigate,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <aside className={`adm-rail ${open ? 'is-open' : ''}`}>
      <button
        className="adm-rail-brand"
        onClick={() => { navigate('/dashboard'); onNavigate(); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        title="Back to the console"
      >
        <span className="argo-mark" aria-hidden="true" />
        <span>
          Argo<span style={{ color: 'var(--green)' }}>Logics</span>
        </span>
      </button>

      <span className="adm-rail-group mono-label">ADMIN</span>
      {/* flexGrow is cleared so MANAGE sits directly beneath, not pushed to the bottom. */}
      <ul className="adm-rail-links" style={{ flexGrow: 0 }}>
        {ADMIN_MODULES.map((mod) => (
          <li key={mod.to}>
            <NavLink
              to={mod.to}
              onClick={onNavigate}
              className={({ isActive }) => `adm-rail-link ${isActive ? 'is-active' : ''}`}
            >
              <mod.icon size={16} />
              <span>{mod.label}</span>
              <span className="adm-rail-count">{mod.service}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <span className="adm-rail-group mono-label" style={{ marginTop: 20 }}>
        MANAGE
      </span>
      <ul style={{ listStyle: 'none', marginBottom: 8 }}>
        <li>
          <NavLink
            to="/admin"
            end
            onClick={onNavigate}
            className={({ isActive }) => `adm-rail-link ${isActive ? 'is-active' : ''}`}
          >
            <Settings size={16} />
            <span>Admin</span>
          </NavLink>
        </li>
      </ul>

      <div className="adm-rail-foot" style={{ marginTop: 'auto' }}>
        <div className="adm-avatar">{initials}</div>
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', display: 'block' }}>
            {user?.firstName} {user?.lastName}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
            {user?.roles?.[0] ?? 'USER'} · Delhi
          </span>
        </div>
        <button
          className="adm-icon-btn"
          onClick={() => { logout(); navigate('/login'); }}
          title="Log out"
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
};
