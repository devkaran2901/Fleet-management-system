import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_NAV, findGroup } from '../pages/admin/adminModules';
import { DISPATCHER_NAV, findDispatcherGroup } from '../pages/dispatcher/dispatcherModules';
import { FLEET_NAV, findFleetGroup } from '../pages/fleet/fleetModules';
import { COMPLIANCE_NAV, findComplianceGroup } from '../pages/compliance/complianceModules';
import { WORKSHOP_NAV, findWorkshopGroup } from '../pages/workshop/workshopModules';
import { FINANCE_NAV, findFinanceGroup } from '../pages/finance/financeModules';
import { VENDOR_NAV, findVendorGroup } from '../pages/vendor/vendorModules';
import '../styles/admin.css';

const STORAGE_KEY = 'fms_admin_nav_collapsed';

/**
 * The single navigation rail for the whole app. Dynamically switches between
 * ADMIN, DISPATCHER, FLEET, COMPLIANCE, WORKSHOP, FINANCE and VENDOR menus based on route.
 */
export const AppSidebar: React.FC<{ open: boolean; onNavigate: () => void }> = ({
  open,
  onNavigate,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isDispatcher = location.pathname.startsWith('/dispatcher');
  const isFleet = location.pathname.startsWith('/fleet');
  const isCompliance = location.pathname.startsWith('/compliance');
  const isWorkshop = location.pathname.startsWith('/workshop');
  const isFinance = location.pathname.startsWith('/finance');
  const isVendor = location.pathname.startsWith('/vendor');
  
  const roles = user?.roles ?? [];
  const hasAdmin = roles.includes('ADMIN');
  const hasDispatcher = roles.includes('DISPATCHER');
  const hasFleetManager = roles.includes('FLEET_MANAGER') || roles.includes('FLEET');
  const hasComplianceManager = roles.includes('COMPLIANCE_MANAGER') || roles.includes('COMPLIANCE') || roles.includes('S-22');
  const hasWorkshopManager = roles.includes('WORKSHOP_MANAGER') || roles.includes('R-06');
  const hasFinanceManager = roles.includes('FINANCE_MANAGER') || roles.includes('R-14');
  const hasVendor = roles.includes('VENDOR') || isVendor;

  // Determine which nav to show based on route + role
  let nav = ADMIN_NAV;
  let resolveGroup = findGroup;

  if (hasAdmin) {
    if (isDispatcher) {
      nav = DISPATCHER_NAV;
      resolveGroup = findDispatcherGroup;
    } else if (isFleet) {
      nav = FLEET_NAV;
      resolveGroup = findFleetGroup;
    } else if (isCompliance) {
      nav = COMPLIANCE_NAV;
      resolveGroup = findComplianceGroup;
    } else if (isWorkshop) {
      nav = WORKSHOP_NAV;
      resolveGroup = findWorkshopGroup;
    } else if (isFinance) {
      nav = FINANCE_NAV;
      resolveGroup = findFinanceGroup;
    } else if (isVendor) {
      nav = VENDOR_NAV;
      resolveGroup = findVendorGroup;
    } else {
      nav = ADMIN_NAV;
      resolveGroup = findGroup;
    }
  } else if (hasFinanceManager || isFinance) {
    nav = FINANCE_NAV;
    resolveGroup = findFinanceGroup;
  } else if (hasVendor || isVendor) {
    nav = VENDOR_NAV;
    resolveGroup = findVendorGroup;
  } else if (hasWorkshopManager || isWorkshop) {
    nav = WORKSHOP_NAV;
    resolveGroup = findWorkshopGroup;
  } else if (hasComplianceManager) {
    nav = COMPLIANCE_NAV;
    resolveGroup = findComplianceGroup;
  } else if (hasFleetManager) {
    nav = FLEET_NAV;
    resolveGroup = findFleetGroup;
  } else if (hasDispatcher) {
    nav = DISPATCHER_NAV;
    resolveGroup = findDispatcherGroup;
  } else {
    nav = DISPATCHER_NAV;
    resolveGroup = findDispatcherGroup;
  }

  // Collapsed groups persist across navigations and reloads.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
  }, [collapsed]);

  // Never leave the active module hidden inside a collapsed group.
  const activeGroup = resolveGroup(location.pathname);
  useEffect(() => {
    if (activeGroup && collapsed[activeGroup.label]) {
      setCollapsed((c) => ({ ...c, [activeGroup.label]: false }));
    }
  }, [activeGroup?.label]); // eslint-disable-line react-hooks/exhaustive-deps

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <aside className={`adm-rail ${open ? 'is-open' : ''}`}>
      <div className="adm-rail-brand-container" style={{ padding: '0 16px 12px 16px', borderBottom: '1px solid var(--border-soft)', marginBottom: 8 }}>
        <div 
          className="adm-rail-brand" 
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0 8px 0', border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }} 
          onClick={() => {
            if (hasAdmin) {
              navigate(isDispatcher ? '/dispatcher/dashboard' : (isFleet ? '/fleet/dashboard' : (isCompliance ? '/compliance/dashboard' : (isWorkshop ? '/workshop/dashboard' : (isFinance ? '/finance/dashboard' : (isVendor ? '/vendor/dashboard' : '/admin/dashboard'))))));
            } else if (hasFinanceManager) {
              navigate('/finance/dashboard');
            } else if (hasVendor) {
              navigate('/vendor/dashboard');
            } else if (hasWorkshopManager) {
              navigate('/workshop/dashboard');
            } else if (hasComplianceManager) {
              navigate('/compliance/dashboard');
            } else if (hasFleetManager) {
              navigate('/fleet/dashboard');
            } else {
              navigate('/dispatcher/dashboard');
            }
            onNavigate();
          }}
        >
          <span className="argo-mark" aria-hidden="true" />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>
            Argo<span style={{ color: 'var(--green)' }}>Logics</span>
          </span>
        </div>
        
        {/* Workspace Switcher — only rendered for ADMIN (multi-portal) */}
        {hasAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
            <span className="mono-label" style={{ fontSize: 8, color: 'var(--text-3)' }}>WORKSPACE</span>
            <select 
              value={isDispatcher ? 'dispatcher' : (isFleet ? 'fleet' : (isCompliance ? 'compliance' : (isWorkshop ? 'workshop' : (isFinance ? 'finance' : (isVendor ? 'vendor' : 'admin')))))}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'admin') navigate('/admin/dashboard');
                else if (val === 'dispatcher') navigate('/dispatcher/dashboard');
                else if (val === 'fleet') navigate('/fleet/dashboard');
                else if (val === 'compliance') navigate('/compliance/dashboard');
                else if (val === 'workshop') navigate('/workshop/dashboard');
                else if (val === 'finance') navigate('/finance/dashboard');
                else if (val === 'vendor') navigate('/vendor/dashboard');
                onNavigate();
              }}
              style={{
                width: '100%',
                backgroundColor: 'var(--panel-2)',
                color: 'var(--text-1)',
                border: '1px solid var(--border-soft)',
                padding: '6px 8px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 500,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="admin">🔧 Admin Suite</option>
              <option value="dispatcher">⚡ Dispatcher Workspace</option>
              <option value="fleet">🚚 Fleet Manager Portal</option>
              <option value="compliance">⚖️ Compliance Portal</option>
              <option value="workshop">🛠️ Workshop Manager Portal</option>
              <option value="finance">💼 Finance Manager Portal</option>
              <option value="vendor">🤝 Vendor Portal</option>
            </select>
          </div>
        )}
      </div>

      <nav className="adm-rail-nav">
        {nav.map((group) => {
          const isCollapsed = collapsed[group.label];
          const hasActive = group.modules.some((m) => location.pathname.startsWith(m.to));

          return (
            <div className="adm-rail-section" key={group.label}>
              <button
                className={`adm-rail-group-btn ${hasActive ? 'has-active' : ''}`}
                onClick={() => setCollapsed((c) => ({ ...c, [group.label]: !c[group.label] }))}
                aria-expanded={!isCollapsed}
              >
                <span className="mono-label">{group.label}</span>
                <ChevronDown
                  size={12}
                  className={`adm-rail-chevron ${isCollapsed ? 'is-collapsed' : ''}`}
                />
              </button>

              {!isCollapsed && (
                <div className="adm-rail-group-modules">
                  {group.modules.map((mod: any) => (
                    <NavLink
                      key={mod.to}
                      to={mod.to}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `adm-rail-link ${isActive ? 'is-active' : ''} ${
                          !mod.built ? 'is-stub' : ''
                        }`
                      }
                    >
                      <mod.icon size={15} />
                      <span className="adm-rail-title">{mod.label || mod.title}</span>
                      {(mod.badge || mod.service) && <span className="adm-rail-count">{mod.badge || mod.service}</span>}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="adm-rail-foot">
        <div className="adm-avatar">{initials}</div>
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.roles?.join(', ')}
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
