import React, { useState } from 'react';
import { Palette, Save, CheckCircle } from 'lucide-react';
import { Button, Panel, Input, Field } from '../../components/admin/ui';
import type { BrandingConfig } from '../../services/adminApi';

const DEFAULT_BRANDING: BrandingConfig = {
  companyName: 'Fleet Management Enterprise (FMS)',
  logoUrl: 'https://cdn.fms.internal/assets/logo.png',
  primaryColor: '#22c55e',
  accentColor: '#3b82f6',
  loginBannerText: 'Welcome to Fleet Management System - Mission Critical Operations Portal',
  supportEmail: 'support@fleetmanagement.internal',
  supportPhone: '+91 1800 200 4000',
};

export const Branding: React.FC = () => {
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
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
            <Palette size={22} color="var(--green)" /> Tenant Branding & Appearance
          </h1>
          <p className="adm-page-sub">
            Customize tenant identity, corporate logos, UI primary accent colors, and login banner announcements.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <Panel title="Brand Identity & Theme Tokens">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
            <Field label="Company / Enterprise Name">
              <Input
                value={branding.companyName}
                onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                required
              />
            </Field>

            <Field label="Logo URL (PNG / SVG)">
              <Input
                value={branding.logoUrl}
                onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                required
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 6 }}>
                  Primary Accent Color
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    style={{ width: 40, height: 36, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: '1px solid var(--border-soft)',
                      backgroundColor: 'var(--panel-2)',
                      color: 'var(--text-1)',
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 6 }}>
                  Secondary Accent Color
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    style={{ width: 40, height: 36, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={branding.accentColor}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: '1px solid var(--border-soft)',
                      backgroundColor: 'var(--panel-2)',
                      color: 'var(--text-1)',
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>
            </div>

            <Field label="Login Screen Banner Announcement">
              <Input
                value={branding.loginBannerText}
                onChange={(e) => setBranding({ ...branding, loginBannerText: e.target.value })}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Support Contact Email">
                <Input
                  value={branding.supportEmail}
                  onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
                />
              </Field>

              <Field label="Toll-Free Support Helpline">
                <Input
                  value={branding.supportPhone}
                  onChange={(e) => setBranding({ ...branding, supportPhone: e.target.value })}
                />
              </Field>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <Button variant="primary" type="submit" icon={<Save size={14} />}>
                Apply Branding Changes
              </Button>

              {saved && (
                <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={16} /> Theme & branding updated!
                </span>
              )}
            </div>
          </div>
        </Panel>
      </form>
    </>
  );
};
