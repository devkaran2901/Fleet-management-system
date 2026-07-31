import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  ClipboardList,
  Coins,
  FileCheck2,
  LayoutGrid,
  Radar,
  Shield,
  Truck,
  Users,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface PortalTarget {
  key: string;
  label: string;
  path: string;
  /** Route prefix used to detect whether this portal is the active one. */
  prefix: string;
  accent: string;
  Icon: LucideIcon;
}

export const PORTALS: PortalTarget[] = [
  { key: 'admin', label: 'Admin Suite', path: '/admin/dashboard', prefix: '/admin', accent: '#8b5cf6', Icon: Shield },
  { key: 'dispatcher', label: 'Dispatcher', path: '/dispatcher/dashboard', prefix: '/dispatcher', accent: '#3b82f6', Icon: Radar },
  { key: 'fleet', label: 'Fleet Manager', path: '/fleet/dashboard', prefix: '/fleet', accent: '#06b6d4', Icon: Truck },
  { key: 'compliance', label: 'Compliance', path: '/compliance/dashboard', prefix: '/compliance', accent: '#f59e0b', Icon: FileCheck2 },
  { key: 'workshop', label: 'Workshop', path: '/workshop/dashboard', prefix: '/workshop', accent: '#ef4444', Icon: Wrench },
  { key: 'finance', label: 'Finance', path: '/finance/dashboard', prefix: '/finance', accent: '#10b981', Icon: Coins },
  { key: 'vendor', label: 'Vendor Portal', path: '/vendor/dashboard', prefix: '/vendor', accent: '#14b8a6', Icon: Users },
  { key: 'driver', label: 'Driver Portal', path: '/driver/dashboard', prefix: '/driver', accent: '#2ecc71', Icon: ClipboardList },
];

/** Roles permitted to jump between portals. Admin only, by design. */
const SWITCHER_ROLES = ['ADMIN'];

export const canSwitchPortals = (roles?: string[] | null): boolean =>
  Array.isArray(roles) && roles.some((r) => SWITCHER_ROLES.includes(r));

interface PortalSwitcherProps {
  /** Optional variant for portals whose header is not the shared admin topbar. */
  variant?: 'default' | 'driver';
}

/**
 * Admin-only portal switcher. Renders nothing at all for any non-admin user,
 * so non-admin portals are unaffected.
 */
export const PortalSwitcher: React.FC<PortalSwitcherProps> = ({ variant = 'default' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const allowed = canSwitchPortals(user?.roles);

  const current = useMemo(
    () => PORTALS.find((p) => location.pathname.startsWith(p.prefix)),
    [location.pathname],
  );

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!allowed) return null;

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const triggerStyle: React.CSSProperties =
    variant === 'driver'
      ? {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          height: 36,
          padding: '0 10px',
          borderRadius: 8,
          background: 'var(--panel-2)',
          border: '1px solid var(--border, rgba(255,255,255,0.1))',
          color: 'var(--text-1)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.04em',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }
      : {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          height: 30,
          padding: '0 10px',
          borderRadius: 999,
          background: 'var(--panel-2)',
          border: '1px solid var(--border-soft, rgba(255,255,255,0.1))',
          color: 'var(--text-1)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.04em',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={triggerStyle}
        title="Switch to another portal (Admin only)"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <LayoutGrid size={14} color="var(--green, #2ecc71)" />
        <span className="mobile-hide">SWITCH PORTAL</span>
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 3000,
            minWidth: 244,
            padding: 6,
            borderRadius: 12,
            background: 'var(--panel-1, #14161a)',
            border: '1px solid var(--border-soft, rgba(255,255,255,0.12))',
            boxShadow: '0 18px 44px rgba(0,0,0,0.45)',
          }}
        >
          <div
            style={{
              padding: '6px 10px 8px',
              fontSize: 9,
              letterSpacing: '0.12em',
              fontWeight: 800,
              color: 'var(--text-3, #8b93a1)',
              textTransform: 'uppercase',
            }}
          >
            Admin · Switch Portal
          </div>

          {PORTALS.map(({ key, label, path, Icon, accent }) => {
            const isCurrent = current?.key === key;
            return (
              <button
                key={key}
                type="button"
                role="menuitem"
                onClick={() => go(path)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: 'none',
                  background: isCurrent ? 'var(--panel-2, rgba(255,255,255,0.06))' : 'transparent',
                  color: 'var(--text-1)',
                  fontSize: 13,
                  fontWeight: isCurrent ? 700 : 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'var(--panel-2, rgba(255,255,255,0.06))';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = isCurrent
                    ? 'var(--panel-2, rgba(255,255,255,0.06))'
                    : 'transparent';
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `${accent}22`,
                    border: `1px solid ${accent}55`,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} color={accent} />
                </span>
                <span style={{ flex: 1 }}>{label}</span>
                {isCurrent && <Check size={14} color="var(--green, #2ecc71)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortalSwitcher;
