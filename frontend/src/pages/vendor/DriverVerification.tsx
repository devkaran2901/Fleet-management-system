import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, ArrowLeft, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { initialDrivers } from './vendorDataStore';
import type { Driver } from './vendorDataStore';
import '../../styles/vendor.css';

export const DriverVerification: React.FC = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Verified' | 'Rejected'>('Pending');
  const [resubmitDriver, setResubmitDriver] = useState<Driver | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState('Aadhaar Card');
  const [submitting, setSubmitting] = useState(false);

  const handleResubmit = () => {
    if (!uploadedFile) {
      alert('Please select a document file.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === resubmitDriver?.id
            ? { ...d, verificationStatus: 'Pending', rejectionNotes: undefined, documents: { ...d.documents, aadhaarStatus: 'Pending' } }
            : d,
        ),
      );
      setSubmitting(false);
      setResubmitDriver(null);
      setUploadedFile(null);
      alert(`Document re-submitted for ${resubmitDriver?.name}. Verification workbench will review within 24 hours.`);
    }, 900);
  };

  const filtered = drivers.filter((d) => d.verificationStatus === activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="vp-page-header">
        <div>
          <button
            className="vp-btn vp-btn-secondary"
            style={{ marginBottom: 12, padding: '4px 10px', fontSize: 12 }}
            onClick={() => navigate('/vendor/drivers')}
          >
            <ArrowLeft size={14} /> Back to Drivers
          </button>
          <div className="vp-page-title">
            <UserCheck color="var(--vendor-accent)" /> Driver Verification Workbench
          </div>
          <div className="vp-page-subtitle">
            Track driver document verification states, review rejections, and re-submit corrected documents for approval.
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="vp-grid-3">
        {[
          { label: 'Pending Verification', count: drivers.filter((d) => d.verificationStatus === 'Pending').length, icon: <Clock size={22} />, color: 'var(--vendor-warning)', bg: 'var(--vendor-warning-light)', tab: 'Pending' as const },
          { label: 'Verified & Active', count: drivers.filter((d) => d.verificationStatus === 'Verified').length, icon: <CheckCircle size={22} />, color: 'var(--vendor-accent)', bg: 'var(--vendor-accent-light)', tab: 'Verified' as const },
          { label: 'Rejected (Action Needed)', count: drivers.filter((d) => d.verificationStatus === 'Rejected').length, icon: <XCircle size={22} />, color: 'var(--vendor-danger)', bg: 'var(--vendor-danger-light)', tab: 'Rejected' as const },
        ].map((s) => (
          <div
            key={s.label}
            className="vp-stat-card vp-card-interactive"
            onClick={() => setActiveTab(s.tab)}
            style={{ border: activeTab === s.tab ? `1px solid ${s.color}` : undefined }}
          >
            <div>
              <div className="vp-stat-lbl">{s.label}</div>
              <div className="vp-stat-val" style={{ color: s.color }}>{s.count}</div>
            </div>
            <div className="vp-stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Driver Verification Table */}
      <div className="vp-table-wrap">
        <table className="vp-table">
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>DL Number</th>
              <th>DL Status</th>
              <th>Aadhaar</th>
              <th>Medical Cert</th>
              <th>Rejection Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)' }}>
                  No drivers in {activeTab} state.
                </td>
              </tr>
            ) : (
              filtered.map((driver) => (
                <tr key={driver.id}>
                  <td style={{ fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--vendor-accent-light)', color: 'var(--vendor-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                        {driver.name[0]}
                      </div>
                      {driver.name}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>{driver.licenseNumber}</td>
                  <td><span className="vp-badge vp-badge-success" style={{ fontSize: 9 }}>Valid DL</span></td>
                  <td>
                    <span className={`vp-badge ${driver.documents.aadhaarStatus === 'Verified' ? 'vp-badge-success' : driver.documents.aadhaarStatus === 'Pending' ? 'vp-badge-warning' : 'vp-badge-danger'}`} style={{ fontSize: 9 }}>
                      {driver.documents.aadhaarStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`vp-badge ${driver.documents.medicalCertStatus === 'Verified' ? 'vp-badge-success' : 'vp-badge-warning'}`} style={{ fontSize: 9 }}>
                      {driver.documents.medicalCertStatus}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: driver.rejectionNotes ? 'var(--vendor-danger)' : 'var(--text-3)', maxWidth: 200 }}>
                    {driver.rejectionNotes || '—'}
                  </td>
                  <td>
                    {driver.verificationStatus === 'Rejected' && (
                      <button
                        className="vp-btn vp-btn-danger"
                        style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => setResubmitDriver(driver)}
                      >
                        <Upload size={13} /> Re-submit Documents
                      </button>
                    )}
                    {driver.verificationStatus === 'Pending' && (
                      <span className="vp-badge vp-badge-warning" style={{ fontSize: 10 }}>Awaiting Review</span>
                    )}
                    {driver.verificationStatus === 'Verified' && (
                      <span className="vp-badge vp-badge-success" style={{ fontSize: 10 }}>All Clear</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DOCUMENT RE-SUBMISSION MODAL */}
      {resubmitDriver && (
        <div className="vp-modal-overlay">
          <div className="vp-modal">
            <div className="vp-modal-header">
              <div className="vp-modal-title" style={{ color: 'var(--vendor-danger)' }}>
                Re-submit Documents: {resubmitDriver.name}
              </div>
              <button className="adm-icon-btn" onClick={() => setResubmitDriver(null)}>✕</button>
            </div>

            {resubmitDriver.rejectionNotes && (
              <div style={{ background: 'var(--vendor-danger-light)', border: '1px solid rgba(239,68,68,0.3)', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--vendor-danger)' }}>Rejection Reason:</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>{resubmitDriver.rejectionNotes}</div>
              </div>
            )}

            <div className="vp-form-group">
              <label className="vp-label">Select Document Type to Re-upload:</label>
              <select className="vp-select" value={selectedDocType} onChange={(e) => setSelectedDocType(e.target.value)}>
                <option>Aadhaar Card</option>
                <option>Driving License (DL)</option>
                <option>Medical Certificate</option>
                <option>Passport Size Photo</option>
              </select>
            </div>

            <div className="vp-form-group">
              <label className="vp-label">Upload Corrected {selectedDocType}:</label>
              <div style={{ border: '2px dashed var(--border-soft)', borderRadius: 10, padding: 24, textAlign: 'center', background: 'var(--panel-2)' }}>
                <Upload size={32} color="var(--vendor-accent)" style={{ margin: '0 auto 8px', display: 'block' }} />
                <input type="file" onChange={(e) => setUploadedFile(e.target.files?.[0] || null)} style={{ display: 'block', margin: '0 auto', fontSize: 12 }} />
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>PDF, JPG, PNG (Max 5MB)</div>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="vp-btn vp-btn-secondary" onClick={() => setResubmitDriver(null)}>Cancel</button>
              <button className="vp-btn vp-btn-primary" onClick={handleResubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit for Re-verification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
