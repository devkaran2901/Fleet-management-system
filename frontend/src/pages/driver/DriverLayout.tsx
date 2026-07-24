import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { DriverSidebar } from './DriverSidebar';
import { initialDuty, initialProfile } from './driverDataStore';
import { ShieldAlert, Bell, Globe, UserCheck, CheckCircle, Truck, X, Sun, Moon } from 'lucide-react';
import '../../styles/driver.css';

export const DriverLayout: React.FC = () => {
  const navigate = useNavigate();
  const [railOpen, setRailOpen] = useState(false);
  const [duty] = useState(initialDuty);
  const [profile, setProfile] = useState(initialProfile);
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(profile.isFirstLogin);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(profile.acceptedTerms);

  // Light / Dark mode theme state & effect
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  const handleLanguageChange = (lang: string) => {
    setProfile((prev: typeof initialProfile) => ({ ...prev, language: lang }));
  };

  const handleFirstLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert('Please accept the Driver Safety & Operating Terms to continue.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    setProfile((prev: typeof initialProfile) => ({
      ...prev,
      isFirstLogin: false,
      acceptedTerms: true,
    }));
    setShowFirstLoginModal(false);
    alert('First login setup complete! Welcome to the Traverse Driver Portal.');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--void)' }}>
      {/* Driver Sidebar Rail */}
      <DriverSidebar open={railOpen} onNavigate={() => setRailOpen(false)} />

      {/* Main Workspace */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Header Bar */}
        <header className="driver-header">
          <div className="driver-header-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--green-glow, rgba(46, 204, 113, 0.15))',
                  border: '1px solid var(--green, #2ECC71)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--green, #2ECC71)',
                }}
              >
                <Truck size={20} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                  {profile.name} ({profile.employeeId})
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
                  Assigned Vehicle: <span style={{ color: 'var(--green)', fontWeight: 600 }}>{duty.vehicleNumber}</span>
                </div>
              </div>
            </div>

            {duty.isOnDuty ? (
              <div className="driver-duty-badge">
                <div className="pulse-dot" />
                <span>LIVE ON DUTY ({duty.dutyId})</span>
              </div>
            ) : (
              <div
                style={{
                  padding: '5px 12px',
                  borderRadius: 999,
                  background: 'var(--panel-2)',
                  color: 'var(--text-2)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                OFF DUTY
              </div>
            )}
          </div>

          <div className="driver-header-actions">
            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="driver-theme-btn"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} color="var(--amber)" /> : <Moon size={18} color="var(--green)" />}
            </button>

            {/* Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={14} color="var(--text-2)" />
              <select
                className="driver-lang-select"
                value={profile.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                title="Select preferred language"
              >
                <option value="English">🌐 English</option>
                <option value="Hindi">🇮🇳 हिंदी (Hindi)</option>
                <option value="Hinglish">🗣️ Hinglish</option>
                <option value="Tamil">🇮🇳 தமிழ் (Tamil)</option>
                <option value="Telugu">🇮🇳 తెలుగు (Telugu)</option>
                <option value="Marathi">🇮🇳 मराठी (Marathi)</option>
              </select>
            </div>

            {/* Notification Center trigger */}
            <button
              onClick={() => navigate('/driver/notifications')}
              style={{
                position: 'relative',
                background: 'var(--panel-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-1)',
                width: 36,
                height: 36,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Notifications"
            >
              <Bell size={16} />
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--red)',
                }}
              />
            </button>

            {/* Emergency SOS Button */}
            <button className="driver-sos-btn" onClick={() => navigate('/driver/sos')} title="Trigger Emergency Alert">
              <ShieldAlert size={16} />
              <span>SOS EMERGENCY</span>
            </button>

            {/* Security First Login Trigger */}
            {profile.isFirstLogin && (
              <button
                className="driver-btn-secondary"
                onClick={() => setShowFirstLoginModal(true)}
                style={{ padding: '6px 10px', fontSize: 11, background: 'rgba(232, 163, 61, 0.15)', color: 'var(--amber)', borderColor: 'rgba(232, 163, 61, 0.3)' }}
              >
                🔐 First Login Setup
              </button>
            )}
          </div>
        </header>

        {/* Content Outlet */}
        <main className="driver-content" style={{ flex: 1 }}>
          <Outlet context={{ duty, profile, setProfile }} />
        </main>
      </div>

      {/* Module 1: First Login & Terms Acceptance Modal */}
      {showFirstLoginModal && (
        <div className="driver-modal-overlay">
          <div className="driver-modal" style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserCheck color="var(--green)" size={24} />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Welcome to Driver Portal</h3>
              </div>
              <button onClick={() => setShowFirstLoginModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
              First login setup required for Driver <strong>{profile.name} ({profile.employeeId})</strong>. Please change your initial password and accept operating safety terms.
            </p>

            <form onSubmit={handleFirstLoginSubmit}>
              <div className="driver-form-group">
                <label>Preferred Language</label>
                <select value={profile.language} onChange={(e) => handleLanguageChange(e.target.value)}>
                  <option value="English">English</option>
                  <option value="Hindi">हिंदी (Hindi)</option>
                  <option value="Hinglish">Hinglish</option>
                  <option value="Tamil">தமிழ் (Tamil)</option>
                  <option value="Telugu">తెలుగు (Telugu)</option>
                  <option value="Marathi">मराठी (Marathi)</option>
                </select>
              </div>

              <div className="driver-form-group">
                <label>Set New Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="driver-form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 12, color: 'var(--text-1)' }}>
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    style={{ marginTop: 2, accentColor: 'var(--green)' }}
                  />
                  <span>
                    I agree to the Traverse Commercial Fleet Safety Guidelines, Speed Limit Regulations (80 km/h), and ePOD Timely Submission Agreements.
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="driver-btn-primary" style={{ flex: 1 }}>
                  <CheckCircle size={16} /> Complete First Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
