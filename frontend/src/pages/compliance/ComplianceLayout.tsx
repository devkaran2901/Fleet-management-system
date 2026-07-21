import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ChevronRight, Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppSidebar } from '../../components/AppSidebar';
import { findComplianceGroup, findComplianceModule } from './complianceModules';
import { ToastProvider } from '../../components/admin/ui';
import '../../styles/admin.css';

export const ComplianceLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [railOpen, setRailOpen] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
  );

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();
  const activeModule = findComplianceModule(location.pathname);
  const activeGroup = findComplianceGroup(location.pathname);

  return (
    <ToastProvider>
      <div className="adm-shell">
        <AppSidebar open={railOpen} onNavigate={() => setRailOpen(false)} />

        {/* Click-catcher so tapping outside the rail closes it on mobile. */}
        {railOpen && (
          <div
            className="adm-rail-scrim"
            onClick={() => setRailOpen(false)}
            role="presentation"
          />
        )}

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
              <span className="mono-label" style={{ fontSize: 9 }}>COMPLIANCE</span>
              <ChevronRight size={12} />
              <span className="mono-label" style={{ fontSize: 9 }}>
                {activeGroup?.label ?? '—'}
              </span>
              <ChevronRight size={12} />
              <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>
                {activeModule?.label ?? 'Portal'}
              </span>
            </div>

            <div className="adm-topbar-actions">
              <div
                className="mobile-hide"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'var(--panel-2)',
                  border: '1px solid var(--border-soft)',
                  padding: '6px 12px',
                  borderRadius: 999,
                }}
              >
                <span className="pulsing-dot" style={{ backgroundColor: 'var(--green)' }} />
                <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-1)' }}>
                  COMPLIANCE PORTAL
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

          {/* Keyed on path so each module fades in rather than snapping. */}
          <div className="adm-page" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </ToastProvider>
  );
};
