import React, { useState } from 'react';
import { Settings2, Save, CheckCircle } from 'lucide-react';
import { Button, Panel, Badge } from '../../components/admin/ui';
import type { TenantSettingItem } from '../../services/adminApi';

const INITIAL_SETTINGS: TenantSettingItem[] = [
  {
    id: 'ts-1',
    key: 'security.mfa_enforced',
    category: 'Security',
    label: 'Enforce Multi-Factor Authentication (MFA) for Admins',
    value: true,
    description: 'Requires TOTP authenticator app verification for all ADMIN role sign-ins',
  },
  {
    id: 'ts-2',
    key: 'security.session_timeout_mins',
    category: 'Security',
    label: 'Session Idle Timeout (Minutes)',
    value: 60,
    description: 'Automatically log out idle web sessions after specified duration',
  },
  {
    id: 'ts-3',
    key: 'limits.max_active_vehicles',
    category: 'Limits',
    label: 'Maximum Active Vehicle Quota',
    value: 500,
    description: 'Fleet vehicle registration cap under current enterprise plan tier',
  },
  {
    id: 'ts-4',
    key: 'features.ai_dispatcher_enabled',
    category: 'Features',
    label: 'AI-Powered Vehicle Match & Route Optimization',
    value: true,
    description: 'Enables ML automated driver-vehicle pairing suggestions in Dispatcher Portal',
  },
  {
    id: 'ts-5',
    key: 'features.fastag_auto_reconcile',
    category: 'Features',
    label: 'FASTag NPCI Auto-Reconciliation Engine',
    value: true,
    description: 'Automatically match toll deductions against trip GPS checkpoints',
  },
];

export const TenantSettings: React.FC = () => {
  const [settings, setSettings] = useState<TenantSettingItem[]>(INITIAL_SETTINGS);
  const [saved, setSaved] = useState(false);

  const handleToggle = (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, value: !s.value } : s))
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Settings / P-09</span>
          <h1 className="adm-page-title">
            <Settings2 size={22} color="var(--green)" /> Tenant Platform Settings & Feature Toggles
          </h1>
          <p className="adm-page-sub">
            Global tenant security enforcement, quota caps, MFA policies, and system feature flags.
          </p>
        </div>
        <Button variant="primary" icon={<Save size={14} />} onClick={handleSave}>
          Save Settings
        </Button>
      </div>

      <Panel title="Platform Configuration & Flags">
        {saved && (
          <div
            style={{
              padding: 12,
              borderRadius: 6,
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: 'var(--green)',
              fontWeight: 600,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CheckCircle size={16} /> Tenant configuration saved successfully!
          </div>
        )}

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Setting Name & Key</th>
                <th>Category</th>
                <th>Description</th>
                <th>Configured Value</th>
                <th>Toggle / Action</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{s.label}</div>
                    <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>
                      {s.key}
                    </span>
                  </td>
                  <td>
                    <Badge tone={s.category === 'Security' ? 'red' : s.category === 'Limits' ? 'blue' : 'green'}>
                      {s.category}
                    </Badge>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-2)', maxWidth: 320 }}>
                    {s.description}
                  </td>
                  <td>
                    {typeof s.value === 'boolean' ? (
                      <Badge tone={s.value ? 'green' : 'grey'}>{s.value ? 'ENABLED' : 'DISABLED'}</Badge>
                    ) : (
                      <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{String(s.value)}</span>
                    )}
                  </td>
                  <td>
                    {typeof s.value === 'boolean' && (
                      <Button variant="subtle" size="sm" onClick={() => handleToggle(s.id)}>
                        Toggle
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
};
