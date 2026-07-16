import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, FileStack, GitBranch, LogOut, Menu, Moon,
  Network, Plug, ScrollText, Bell, Sun, Upload,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ToastProvider } from '../../components/admin/ui';
import '../../styles/admin.css';

/** The Admin nav group from the Phase 5 IA spec (§3), one entry per S-35 module. */
export const ADMIN_MODULES = [
  { to: '/admin/org', label: 'Org / Users / Roles', icon: Network, service: 'P-01' },
  { to: '/admin/rule-packs', label: 'Rule Packs', icon: FileStack, service: 'M-21' },
  { to: '/admin/approval-flows', label: 'Approval Flows', icon: GitBranch, service: 'P-02' },
  { to: '/admin/notification-policies', label: 'Notification Policies', icon: Bell, service: 'P-03' },
  { to: '/admin/integrations', label: 'Integrations', icon: Plug, service: 'P-06' },
  { to: '/admin/imports', label: 'Imports', icon: Upload, service: 'P-06' },
  { to: '/admin/audit', label: 'Audit', icon: ScrollText, service: 'P-05' },
];

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [railOpen, setRailOpen] = useState(false);

  // Mirrors the Dashboard's switcher so the theme stays consistent across routes.
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
  );

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close the mobile rail whenever the route changes.
  useEffect(() => setRailOpen(false), [location.pathname]);

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();
  const active = ADMIN_MODULES.find((m) => location.pathname.startsWith(m.to));

  return (
    <ToastProvider>
      <div className="adm-shell">
        <aside className={`adm-rail ${railOpen ? 'is-open' : ''}`}>
          <div className="adm-rail-brand">
            <span className="argo-mark" aria-hidden="true" />
            <span>
              Argo<span style={{ color: 'var(--green)' }}>Logics</span>
            </span>
          </div>

          <button
            className="adm-rail-link"
            onClick={() => navigate('/dashboard')}
            style={{ marginBottom: 20, width: '100%', cursor: 'pointer', background: 'none' }}
          >
            <ArrowLeft size={16} />
            <span>Back to console</span>
          </button>

          <span className="adm-rail-group mono-label">ADMIN</span>
          <ul className="adm-rail-links">
            {ADMIN_MODULES.map((mod) => (
              <li key={mod.to}>
                <NavLink
                  to={mod.to}
                  className={({ isActive }) => `adm-rail-link ${isActive ? 'is-active' : ''}`}
                >
                  <mod.icon size={16} />
                  <span>{mod.label}</span>
                  <span className="adm-rail-count">{mod.service}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="adm-rail-foot">
            <div className="adm-avatar">{initials}</div>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', display: 'block' }}>
                {user?.firstName} {user?.lastName}
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
                {user?.roles?.[0] ?? 'USER'}
              </span>
            </div>
            <button
              className="adm-icon-btn"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Log out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </aside>

        <main className="adm-main">
          <div className="adm-topbar">
            <div className="adm-crumbs">
              <button
                className="adm-icon-btn adm-rail-toggle"
                onClick={() => setRailOpen((o) => !o)}
                title="Toggle menu"
              >
                <Menu size={16} />
              </button>
              <span className="mono-label" style={{ fontSize: 9 }}>ADMIN</span>
              <ChevronRight size={12} />
              <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>
                {active?.label ?? 'Suite'}
              </span>
            </div>

            <div className="adm-topbar-actions">
              <div
                className="mobile-hide"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)',
                  padding: '6px 12px', borderRadius: 999,
                }}
              >
                <span className="pulsing-dot" />
                <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-1)' }}>
                  S-35 ADMIN SUITE
                </span>
              </div>
              <button
                className="adm-icon-btn"
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={16} color="var(--green)" /> : <Moon size={16} color="var(--green)" />}
              </button>
              <div className="adm-avatar">{initials}</div>
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </ToastProvider>
  );
};
