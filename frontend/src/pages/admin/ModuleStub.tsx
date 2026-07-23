import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass, Hammer } from 'lucide-react';
import { findGroup, findModule } from './adminModules';
import { Button, Panel } from '../../components/admin/ui';

/**
 * Placeholder for a module whose place in the IA is settled but whose
 * implementation is not built. It states plainly that nothing is wired up and
 * lists what the module is meant to do — deliberately no mock data, so nobody
 * mistakes this screen for a working feature.
 */
export const ModuleStub: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const mod = findModule(location.pathname);
  const group = findGroup(location.pathname);

  if (!mod) {
    return (
      <Panel>
        <div className="adm-state">
          <Compass size={22} />
          <span className="adm-empty-title">Unknown module</span>
          <span className="adm-empty-hint">
            No admin module is registered for {location.pathname}.
          </span>
          <Button variant="subtle" onClick={() => navigate('/admin/dashboard')}>
            Back to the dashboard
          </Button>
        </div>
      </Panel>
    );
  }

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">
            {group?.label}
          </span>
          <h1 className="adm-page-title">
            <mod.icon size={22} color="var(--text-3)" /> {mod.label}
          </h1>
          <p className="adm-page-sub">{mod.summary}</p>
        </div>
        <Button variant="subtle" icon={<ArrowLeft size={14} />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <Panel>
        <div className="adm-stub">
          <div className="adm-stub-icon">
            <Hammer size={22} color="var(--amber)" />
          </div>

          <h2 className="adm-stub-title">This module is not built yet</h2>
          <p className="adm-stub-body">
            {mod.label} has a place in the navigation and a defined scope, but it has no
            data model, no API and no screen behind it. Rather than show mock numbers that
            look real, this page tells you exactly where things stand.
          </p>

          {mod.planned && mod.planned.length > 0 && (
            <div className="adm-stub-planned">
              <span className="mono-label adm-stub-planned-title">Planned scope</span>
              <ul>
                {mod.planned.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <Button variant="subtle" onClick={() => navigate('/admin/dashboard')}>
            Back to the dashboard
          </Button>
        </div>
      </Panel>
    </>
  );
};
