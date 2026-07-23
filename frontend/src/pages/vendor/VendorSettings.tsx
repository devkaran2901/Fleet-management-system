import React, { useState } from 'react';
import { Settings, Sun, Moon, Bell, Key, Shield, Globe, Save } from 'lucide-react';
import '../../styles/vendor.css';

export const VendorSettings: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [notifSound, setNotifSound] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('light-theme', theme === 'light');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="vp-page-header">
        <div>
          <div className="vp-page-title"><Settings color="var(--vendor-accent)" /> Portal Settings</div>
          <div className="vp-page-subtitle">Configure appearance, regional preferences, and security for your Vendor Portal account.</div>
        </div>
        <button className="vp-btn vp-btn-primary" onClick={handleSave}>
          <Save size={14} /> {saved ? '✅ Saved!' : 'Save Settings'}
        </button>
      </div>

      <div className="vp-grid-2">
        {/* Appearance */}
        <div className="vp-card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            {theme === 'dark' ? <Moon size={18} color="var(--vendor-accent)" /> : <Sun size={18} color="var(--vendor-warning)" />}
            Appearance & Display
          </h3>
          <div className="vp-form-group">
            <label className="vp-label">Portal Theme:</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className={`vp-btn ${theme === 'dark' ? 'vp-btn-primary' : 'vp-btn-secondary'}`}
                onClick={() => setTheme('dark')}
              >
                <Moon size={14} /> Dark Mode
              </button>
              <button
                className={`vp-btn ${theme === 'light' ? 'vp-btn-primary' : 'vp-btn-secondary'}`}
                onClick={() => setTheme('light')}
              >
                <Sun size={14} /> Light Mode
              </button>
            </div>
          </div>

          <div className="vp-form-group">
            <label className="vp-label">Portal Language:</label>
            <select className="vp-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English (Default)</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="mr">Marathi (मराठी)</option>
            </select>
          </div>

          <div className="vp-form-group" style={{ marginBottom: 0 }}>
            <label className="vp-label">Timezone:</label>
            <select className="vp-select" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              <option value="Asia/Kolkata">India Standard Time (IST, UTC+5:30)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="vp-card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={18} color="var(--vendor-accent)" /> Notification Preferences
          </h3>
          {[
            { label: 'In-App Notification Sound', key: 'sound', value: notifSound, setter: setNotifSound },
          ].map((pref) => (
            <div key={pref.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ fontSize: 14 }}>{pref.label}</span>
              <button
                onClick={() => pref.setter(!pref.value)}
                style={{
                  width: 44, height: 24, borderRadius: 999,
                  background: pref.value ? 'var(--vendor-accent)' : 'var(--panel-2)',
                  border: `1px solid ${pref.value ? 'var(--vendor-accent)' : 'var(--border-soft)'}`,
                  cursor: 'pointer', position: 'relative', transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  position: 'absolute', top: 3,
                  left: pref.value ? 22 : 3,
                  width: 16, height: 16, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </button>
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <div className="vp-form-group" style={{ marginBottom: 0 }}>
              <label className="vp-label">Indent Countdown Warning (minutes before expiry):</label>
              <input type="number" className="vp-input" defaultValue={15} />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="vp-card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={18} color="var(--vendor-accent)" /> Security & Access
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="vp-btn vp-btn-secondary" style={{ justifyContent: 'flex-start', gap: 10 }}>
              <Key size={16} /> Change Password
            </button>
            <button className="vp-btn vp-btn-secondary" style={{ justifyContent: 'flex-start', gap: 10 }}>
              <Shield size={16} /> Enable Two-Factor Authentication (2FA)
            </button>
            <div style={{ background: 'var(--panel-2)', padding: 12, borderRadius: 8, border: '1px solid var(--border-soft)', fontSize: 12, color: 'var(--text-3)' }}>
              Last login: 23rd July 2026, 09:22 AM · IP: 115.241.x.x (Mumbai, MH)
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="vp-card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={18} color="var(--vendor-accent)" /> API Integration Keys
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div style={{ background: 'var(--panel-2)', padding: 12, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>PORTAL API KEY</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-1)' }}>
                vnd_live_••••••••••••••••••••••••••••••••
              </div>
              <button className="vp-btn vp-btn-secondary" style={{ padding: '4px 10px', fontSize: 11, marginTop: 8 }}>
                <Key size={12} /> Regenerate Key
              </button>
            </div>
            <div style={{ color: 'var(--text-3)', fontSize: 12 }}>
              Use API keys to connect your own TMS or ERP system with the vendor portal for automated indent acceptance and bill submission.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
