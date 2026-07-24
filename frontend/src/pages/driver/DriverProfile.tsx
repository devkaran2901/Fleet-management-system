import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { DriverProfile as DriverProfileType } from './driverDataStore';
import {
  User,
  Shield,
  Truck,
  Phone,
  MapPin,
  Heart,
  Save,
  Lock,
} from 'lucide-react';

interface DriverOutletContext {
  profile: DriverProfileType;
  setProfile: React.Dispatch<React.SetStateAction<DriverProfileType>>;
}

export const DriverProfile: React.FC = () => {
  const outletCtx = useOutletContext<DriverOutletContext>();
  const profile = outletCtx?.profile || {
    name: 'Rajesh Kumar',
    employeeId: 'DRV-401',
    mobile: '+91 98765 43210',
    address: 'Nigdi, Pune, Maharashtra',
    licenseNumber: 'MH-1220180094820',
    bloodGroup: 'O +ve',
    emergencyContact: '+91 98220 11982',
    currentVehicle: 'MH-12-PQ-9021',
    assignedFleet: 'Western Fleet',
    language: 'English',
    isFirstLogin: false,
    acceptedTerms: true,
  };
  const setProfile = outletCtx?.setProfile || (() => {});

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    alert('Password updated successfully!');
  };

  const handleLanguageUpdate = (lang: string) => {
    setProfile((prev: any) => ({ ...prev, language: lang }));
    alert(`Language updated to ${lang}`);
  };

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text-1)' }}>Driver Profile & Settings</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-2)' }}>
            Personal information, driving credentials, vehicle assignment & account security.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
        {/* Personal Information */}
        <div className="driver-card">
          <div className="driver-card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <User color="var(--green)" size={18} /> PERSONAL INFORMATION
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ color: 'var(--text-2)' }}>Driver Full Name</span>
              <span style={{ fontWeight: 800, color: 'var(--text-1)' }}>{profile.name}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ color: 'var(--text-2)' }}>Employee ID</span>
              <span style={{ fontWeight: 700, color: 'var(--green)', fontFamily: 'monospace' }}>{profile.employeeId}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={14} /> Registered Mobile
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{profile.mobile}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={14} /> Heavy Driving License
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-1)', fontFamily: 'monospace' }}>{profile.licenseNumber}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Heart size={14} color="var(--red)" /> Blood Group
              </span>
              <span style={{ fontWeight: 800, color: 'var(--red)' }}>{profile.bloodGroup}</span>
            </div>

            <div style={{ background: 'var(--panel-2)', padding: 12, borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 700 }}>RESIDENTIAL ADDRESS</div>
              <div style={{ fontSize: 13, color: 'var(--text-1)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={14} color="var(--green)" /> {profile.address}
              </div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: 12, borderRadius: 10, border: '1px solid var(--red)' }}>
              <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 800 }}>EMERGENCY CONTACT</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginTop: 2 }}>{profile.emergencyContact}</div>
            </div>
          </div>
        </div>

        {/* Vehicle Assignment & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="driver-card">
            <div className="driver-card-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Truck color="#3B82F6" size={18} /> CURRENT VEHICLE ASSIGNMENT
              </span>
            </div>

            <div style={{ background: 'var(--panel-2)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 700 }}>CURRENT ASSIGNED VEHICLE</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)', fontFamily: 'monospace', marginTop: 2 }}>
                {profile.currentVehicle}
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 700, marginTop: 12 }}>ASSIGNED FLEET DIVISION</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginTop: 2 }}>{profile.assignedFleet}</div>
            </div>
          </div>

          <div className="driver-card">
            <div className="driver-card-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock color="var(--amber)" size={18} /> ACCOUNT SECURITY & PREFERENCES
              </span>
            </div>

            <div className="driver-form-group">
              <label>Portal Language Preference</label>
              <select value={profile.language} onChange={(e) => handleLanguageUpdate(e.target.value)}>
                <option value="English">🌐 English</option>
                <option value="Hindi">🇮🇳 हिंदी (Hindi)</option>
                <option value="Hinglish">🗣️ Hinglish</option>
                <option value="Tamil">🇮🇳 தமிழ் (Tamil)</option>
                <option value="Telugu">🇮🇳 తెలుగు (Telugu)</option>
                <option value="Marathi">🇮🇳 मराठी (Marathi)</option>
              </select>
            </div>

            <form onSubmit={handlePasswordChange} style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 14, marginTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', marginBottom: 12 }}>Change Password</div>

              <div className="driver-form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="driver-form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="driver-form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="driver-btn-primary" style={{ width: '100%' }}>
                <Save size={16} /> Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
