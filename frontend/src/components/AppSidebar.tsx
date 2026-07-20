import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_NAV, findGroup } from '../pages/admin/adminModules';
import { DISPATCHER_NAV, findDispatcherGroup } from '../pages/dispatcher/dispatcherModules';
import '../styles/admin.css';

const STORAGE_KEY = 'fms_admin_nav_collapsed';

/**
 * The single navigation rail for the whole app. Dynamically switches between
 * ADMIN and DISPATCHER menus based on route, ensuring perfect visual consistency.
 */
export const AppSidebar: React.FC<{ open: boolean; onNavigate: () => void }> = ({
  open,
  onNavigate,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isDispatcher = location.pathname.startsWith('/dispatcher');
  const nav = isDispatcher ? DISPATCHER_NAV : ADMIN_NAV;
  const resolveGroup = isDispatcher ? findDispatcherGroup : findGroup;

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
      <button
        className="adm-rail-brand"
        onClick={() => {
          navigate(isDispatcher ? '/dispatcher/dashboard' : '/admin/dashboard');
          onNavigate();
        }}
        title={isDispatcher ? 'Dispatcher board' : 'Admin dashboard'}
      >
        <span className="argo-mark" aria-hidden="true" />
        <span>
          Argo<span style={{ color: 'var(--green)' }}>Logics</span>
        </span>
      </button>

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
