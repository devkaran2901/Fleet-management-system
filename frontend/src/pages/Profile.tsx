import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ArrowLeft, User, Mail, Shield } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setSaving(true);

    try {
      const response = await api.patch(`/users/${user?.id}`, { firstName, lastName, email });
      updateUser(response.data);
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', padding: '40px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <Link to="/dashboard" className="back-link">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Profile Header */}
        <div className="glass-card" style={{ padding: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: 700
          }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
              {user?.firstName} {user?.lastName}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {user?.roles.map((role) => (
                <span key={role} className="badge badge-primary">{role}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="glass-card profile-card" style={{ padding: '32px', maxWidth: '100%' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--primary)" />
            Edit Profile
          </h2>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="pf-firstName">First Name</label>
                <input id="pf-firstName" type="text" className="form-input"
                  value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="pf-lastName">Last Name</label>
                <input id="pf-lastName" type="text" className="form-input"
                  value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pf-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input id="pf-email" type="email" className="form-input" style={{ paddingLeft: '44px' }}
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Roles</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--glass-border)' }}>
                <Shield size={16} color="var(--primary)" />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {user?.roles.join(', ')} — Roles are managed by administrators
                </span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
