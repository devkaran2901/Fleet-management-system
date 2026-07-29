import React, { useState } from 'react';
import { Globe, Save, Clock } from 'lucide-react';
import { Button, Panel, Badge } from '../../components/admin/ui';
import type { LocalizationConfig } from '../../services/adminApi';

const DEFAULT_CONFIG: LocalizationConfig = {
  defaultLanguage: 'English (US / IN)',
  supportedLanguages: ['English', 'Hindi (हिंदी)', 'Tamil (தமிழ்)', 'Telugu (தெலுங்கு)', 'Marathi (मराठी)'],
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  currency: 'INR (₹ - Indian Rupee)',
  timezone: 'Asia/Kolkata (IST +5:30)',
};

export const Localization: React.FC = () => {
  const [config, setConfig] = useState<LocalizationConfig>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Settings / P-09</span>
          <h1 className="adm-page-title">
            <Globe size={22} color="var(--green)" /> Localization & Regional Settings
          </h1>
          <p className="adm-page-sub">
            Languages, translation keys, date/time formatting profiles, and regional currency standards.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <Panel title="Regional Formatting & Language Profiles">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 6 }}>
                Default System Interface Language
              </label>
              <select
                value={config.defaultLanguage}
                onChange={(e) => setConfig({ ...config, defaultLanguage: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--border-soft)',
                  backgroundColor: 'var(--panel-2)',
                  color: 'var(--text-1)',
                  fontSize: 13,
                }}
              >
                {config.supportedLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 6 }}>
                  Date Display Profile
                </label>
                <select
                  value={config.dateFormat}
                  onChange={(e) => setConfig({ ...config, dateFormat: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border-soft)',
                    backgroundColor: 'var(--panel-2)',
                    color: 'var(--text-1)',
                    fontSize: 13,
                  }}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (29/07/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2026-07-29)</option>
                  <option value="MMM DD, YYYY">MMM DD, YYYY (Jul 29, 2026)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 6 }}>
                  Time Standard
                </label>
                <select
                  value={config.timeFormat}
                  onChange={(e) => setConfig({ ...config, timeFormat: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border-soft)',
                    backgroundColor: 'var(--panel-2)',
                    color: 'var(--text-1)',
                    fontSize: 13,
                  }}
                >
                  <option value="24h">24 Hours (14:30)</option>
                  <option value="12h">12 Hours AM/PM (02:30 PM)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 6 }}>
                  Currency & Symbol
                </label>
                <input
                  type="text"
                  value={config.currency}
                  onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border-soft)',
                    backgroundColor: 'var(--panel-2)',
                    color: 'var(--text-1)',
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 6 }}>
                  System Timezone
                </label>
                <input
                  type="text"
                  value={config.timezone}
                  onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border-soft)',
                    backgroundColor: 'var(--panel-2)',
                    color: 'var(--text-1)',
                    fontSize: 13,
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <Button variant="primary" type="submit" icon={<Save size={14} />}>
                Save Localization Profile
              </Button>

              {saved && (
                <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={16} /> Regional settings saved!
                </span>
              )}
            </div>
          </div>
        </Panel>
      </form>
    </>
  );
};
