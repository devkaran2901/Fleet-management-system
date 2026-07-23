import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Menu, Moon, Sun, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppSidebar } from '../../components/AppSidebar';
import { findVendorGroup, findVendorModule } from './vendorModules';
import { ToastProvider } from '../../components/admin/ui';
import '../../styles/admin.css';
import '../../styles/vendor.css';

export const VendorLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [railOpen, setRailOpen] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
  );

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const initials = `${user?.firstName?.[0] ?? 'V'}${user?.lastName?.[0] ?? 'P'}`.toUpperCase();
  const activeModule = findVendorModule(location.pathname);
  const activeGroup = findVendorGroup(location.pathname);

  return (
    <ToastProvider>
      <div className="adm-shell">
        <AppSidebar open={railOpen} onNavigate={() => setRailOpen(false)} />

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
                title="Toggle navigation"
              >
                <Menu size={16} />
              </button>
              <span className="mono-label" style={{ fontSize: 9, color: 'var(--vendor-accent)' }}>
                VENDOR PORTAL
              </span>
              <ChevronRight size={12} />
              <span className="mono-label" style={{ fontSize: 9 }}>
                {activeGroup?.label ?? 'Operations'}
              </span>
              <ChevronRight size={12} />
              <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>
                {activeModule?.label ?? 'Dashboard'}
              </span>
            </div>

            <div className="adm-topbar-actions">
              <div
                className="mobile-hide"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'var(--vendor-accent-light)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '6px 14px',
                  borderRadius: 999,
                }}
              >
                <span className="pulsing-dot" style={{ backgroundColor: 'var(--vendor-accent)' }} />
                <span className="mono-label" style={{ fontSize: 9, color: 'var(--vendor-accent)', fontWeight: 700 }}>
                  V-00 VENDOR FLEET PORTAL
                </span>
              </div>

              {/* Notification Quick Access */}
              <button
                className="adm-icon-btn"
                onClick={() => navigate('/vendor/notifications')}
                title="View Notifications"
                style={{ position: 'relative' }}
              >
                <Bell size={16} />
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: 'var(--vendor-danger)',
                  }}
                />
              </button>

              <button
                className="adm-icon-btn"
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={16} color="var(--vendor-accent)" /> : <Moon size={16} color="var(--vendor-accent)" />}
              </button>

              <div
                className="adm-avatar"
                onClick={() => navigate('/vendor/profile')}
                style={{ cursor: 'pointer', background: 'var(--vendor-accent)' }}
                title="Vendor Profile & KYC"
              >
                {initials}
              </div>
            </div>
          </div>

          <div className="adm-page" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </ToastProvider>
  );
};
