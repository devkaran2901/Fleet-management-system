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
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);

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
                  VENDOR FLEET PORTAL
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
                onClick={() => setShowFirstLoginModal(true)}
                title="Phase 2 First Login Security Prompt"
                style={{ padding: '4px 8px', fontSize: 11, width: 'auto', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--vendor-warning)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, fontWeight: 700 }}
              >
                🔐 First Login Security
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

          {/* Phase 2: First Login Password Change Modal */}
          {showFirstLoginModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
              <div style={{ background: 'var(--panel-1)', border: '1px solid var(--border-soft)', borderRadius: 14, width: '100%', maxWidth: 480, padding: 24 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', marginBottom: 6 }}>
                  Welcome to FleetOS — First Login Setup
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
                  User account provisioned by Admin. You are logged in with temporary password <code style={{ color: 'var(--amber)' }}>Temp@Password123</code>.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>New Permanent Password *</label>
                    <input
                      type="password"
                      placeholder="Enter new password (min 8 chars)"
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Confirm New Password *</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', fontSize: 13 }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <input type="checkbox" id="terms" defaultChecked />
                    <label htmlFor="terms" style={{ fontSize: 12, color: 'var(--text-1)' }}>I accept the FleetOS Vendor Partner Terms of Service & SLA requirements.</label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button
                    onClick={() => setShowFirstLoginModal(false)}
                    style={{ padding: '8px 16px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', cursor: 'pointer' }}
                  >
                    Remind Later
                  </button>
                  <button
                    onClick={() => {
                      setShowFirstLoginModal(false);
                      alert('Password successfully updated! First login setup complete (Phase 2).');
                    }}
                    style={{ padding: '8px 20px', background: 'var(--vendor-accent)', color: '#000', fontWeight: 700, border: 'none', borderRadius: 6, cursor: 'pointer' }}
                  >
                    Update Password & Proceed
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ToastProvider>
  );
};
