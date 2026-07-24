import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Route,
  ClipboardCheck,
  FileCheck2,
  Wallet,
  Receipt,
  FileText,
  Award,
  Bell,
  ShieldAlert,
  User,
  LogOut,
} from 'lucide-react';
import { VelocityLogo } from '../../components/VelocityLogo';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin.css';

interface DriverSidebarProps {
  open?: boolean;
  onNavigate?: () => void;
}

export const DriverSidebar: React.FC<DriverSidebarProps> = ({ open = true, onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', to: '/driver/dashboard', icon: LayoutDashboard },
    { label: 'My Trips', to: '/driver/trips', icon: Route, badge: '1 Active' },
    { label: 'Vehicle Inspection', to: '/driver/inspections', icon: ClipboardCheck },
    { label: 'ePOD', to: '/driver/epod', icon: FileCheck2 },
    { label: 'Khata', to: '/driver/khata', icon: Wallet, badge: '₹7,850' },
    { label: 'Expenses', to: '/driver/expenses', icon: Receipt },
    { label: 'Documents', to: '/driver/documents', icon: FileText },
    { label: 'Score & Earnings', to: '/driver/earnings', icon: Award },
    { label: 'Notifications', to: '/driver/notifications', icon: Bell, badge: '2 New' },
    { label: 'SOS', to: '/driver/sos', icon: ShieldAlert },
    { label: 'Profile', to: '/driver/profile', icon: User },
  ];

  const initials = `${user?.firstName?.[0] ?? 'R'}${user?.lastName?.[0] ?? 'K'}`.toUpperCase();

  return (
    <aside className={`adm-rail ${open ? 'is-open' : ''}`}>
      <div
        className="adm-rail-brand-container"
        style={{ padding: '0 16px 12px 16px', borderBottom: '1px solid var(--border-soft)', marginBottom: 8 }}
      >
        <div
          className="adm-rail-brand"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 0 8px 0',
            border: 'none',
            background: 'none',
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer',
          }}
          onClick={() => {
            navigate('/driver/dashboard');
            if (onNavigate) onNavigate();
          }}
        >
          <VelocityLogo height={32} textColor="var(--text-1)" />
        </div>
      </div>

      <nav className="adm-rail-nav">
        <div className="adm-rail-section">
          <div className="adm-rail-group-modules" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) => `adm-rail-link ${isActive ? 'is-active' : ''}`}
              >
                <item.icon size={16} />
                <span className="adm-rail-title">{item.label}</span>
                {item.badge && <span className="adm-rail-count">{item.badge}</span>}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="adm-rail-foot">
        <div className="adm-avatar">{initials}</div>
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.firstName || 'Rajesh'} {user?.lastName || 'Kumar'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            DRIVER (DRV-401)
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          title="Sign Out"
          style={{
            border: 'none',
            background: 'none',
            color: 'var(--text-3)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
