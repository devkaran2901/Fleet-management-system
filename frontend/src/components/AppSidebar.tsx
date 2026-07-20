import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_NAV, findGroup } from '../pages/admin/adminModules';
import { DISPATCHER_NAV, findDispatcherGroup } from '../pages/dispatcher/dispatcherModules';
import { FLEET_NAV, findFleetGroup } from '../pages/fleet/fleetModules';
import '../styles/admin.css';

const STORAGE_KEY = 'fms_admin_nav_collapsed';

/**
 * The single navigation rail for the whole app. Dynamically switches between
 * ADMIN, DISPATCHER and FLEET menus based on route, ensuring perfect visual consistency.
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
  
  const roles = user?.roles ?? [];
  const hasAdmin = roles.includes('ADMIN');
  const hasDispatcher = roles.includes('DISPATCHER');
  const hasFleetManager = roles.includes('FLEET_MANAGER') || roles.includes('FLEET');

  // Determine which nav to show
  let nav = ADMIN_NAV;
  let resolveGroup = findGroup;

  if (hasAdmin) {
    if (isDispatcher) {
      nav = DISPATCHER_NAV;
      resolveGroup = findDispatcherGroup;
    } else if (isFleet) {
      nav = FLEET_NAV;
      resolveGroup = findFleetGroup;
    } else {
      nav = ADMIN_NAV;
      resolveGroup = findGroup;
    }
  } else if (hasFleetManager) {
    nav = FLEET_NAV;
    resolveGroup = findFleetGroup;
  } else if (hasDispatcher) {
    nav = DISPATCHER_NAV;
    resolveGroup = findDispatcherGroup;
  } else {
    // DRIVER or guest fallback
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
              navigate(isDispatcher ? '/dispatcher/dashboard' : (isFleet ? '/fleet/dashboard' : '/admin/dashboard'));
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
        
        {/* Workspace Switcher */}
        {(() => {
          const roles = user?.roles ?? [];
          const hasAdmin = roles.includes('ADMIN');
          const hasDispatcher = roles.includes('DISPATCHER') || hasAdmin;
          const hasFleetManager = roles.includes('FLEET_MANAGER') || hasAdmin;

          // Only render switcher if user has access to more than 1 workspace
          const workspaceCount = (hasAdmin ? 1 : 0) + 
                                 (!hasAdmin && hasDispatcher ? 1 : 0) + 
                                 (!hasAdmin && hasFleetManager ? 1 : 0);

          if (hasAdmin || workspaceCount > 1) {
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                <span className="mono-label" style={{ fontSize: 8, color: 'var(--text-3)' }}>WORKSPACE</span>
                <select 
                  value={isDispatcher ? 'dispatcher' : (isFleet ? 'fleet' : 'admin')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'admin') navigate('/admin/dashboard');
                    else if (val === 'dispatcher') navigate('/dispatcher/dashboard');
                    else if (val === 'fleet') navigate('/fleet/dashboard');
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
                  {hasAdmin && <option value="admin">🔧 Admin Suite</option>}
                  {hasDispatcher && <option value="dispatcher">⚡ Dispatcher Workspace</option>}
                  {hasFleetManager && <option value="fleet">🚚 Fleet Manager Portal</option>}
                </select>
              </div>
            );
          }
          return null;
        })()}
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

              <div className={`adm-rail-collapse ${isCollapsed ? 'is-collapsed' : ''}`}>
                <ul className="adm-rail-links" aria-hidden={isCollapsed}>
                  {group.modules.map((mod) => (
                    <li key={mod.to}>
                      <NavLink
                        to={mod.to}
                        onClick={onNavigate}
                        title={mod.summary}
                        tabIndex={isCollapsed ? -1 : undefined}
                        className={({ isActive }) =>
                          `adm-rail-link ${isActive ? 'is-active' : ''} ${mod.built ? '' : 'is-stub'}`
                        }
                      >
                        <mod.icon size={15} />
                        <span>{mod.label}</span>
                        {!mod.built && (
                          <span className="adm-rail-count" title="Not built yet">
                            soon
                          </span>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="adm-rail-foot">
        <div className="adm-avatar">{initials}</div>
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-1)',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user?.firstName} {user?.lastName}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
            {user?.roles?.[0] ?? 'USER'} · Delhi
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
  );
};
