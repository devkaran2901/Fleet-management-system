import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FileText, Truck, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { initialDrivers } from './vendorDataStore';
import '../../styles/vendor.css';

export const DriverDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const driver = initialDrivers.find((d) => d.id === id) || initialDrivers[0];

  return (
    <div className="vp-driver-details" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="vp-page-header">
        <div>
          <button
            className="vp-btn vp-btn-secondary"
            style={{ marginBottom: 12, padding: '4px 10px', fontSize: 12 }}
            onClick={() => navigate('/vendor/drivers')}
          >
            <ArrowLeft size={14} /> Back to Driver Roster
          </button>
          <div className="vp-page-title">
            <Users color="var(--vendor-accent)" /> Driver Profile: {driver.name}
          </div>
          <div className="vp-page-subtitle">
            DL: {driver.licenseNumber} • {driver.phone}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <span
            className={`vp-badge ${
              driver.verificationStatus === 'Verified'
                ? 'vp-badge-success'
                : driver.verificationStatus === 'Pending'
                ? 'vp-badge-warning'
                : 'vp-badge-danger'
            }`}
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            {driver.verificationStatus === 'Verified' && <CheckCircle size={14} />}
            {driver.verificationStatus === 'Pending' && <Clock size={14} />}
            {driver.verificationStatus === 'Rejected' && <XCircle size={14} />}
            Verification: {driver.verificationStatus}
          </span>
        </div>
      </div>

      <div className="vp-grid-3">
        {/* Profile Card */}
        <div className="vp-card">
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'var(--vendor-accent-light)',
                border: '2px solid var(--vendor-accent)',
                color: 'var(--vendor-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 800,
                margin: '0 auto 12px',
              }}
            >
              {driver.name[0]}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>{driver.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{driver.phone}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-3)' }}>DL Number:</span>
              <span style={{ fontWeight: 600, fontFamily: 'JetBrains Mono', fontSize: 12 }}>{driver.licenseNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-3)' }}>DL Valid Until:</span>
              <span style={{ fontWeight: 600 }}>{driver.documents.dl}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-3)' }}>Assigned Vehicle:</span>
              <span style={{ fontWeight: 600, color: driver.assignedVehicle ? 'var(--vendor-accent)' : 'var(--text-3)' }}>
                {driver.assignedVehicle || 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Document Status Card */}
        <div className="vp-card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="var(--vendor-accent)" /> Document Status
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Driving License (DL)', status: 'Verified', detail: `Valid until ${driver.documents.dl}` },
              { label: 'Aadhaar Card', status: driver.documents.aadhaarStatus, detail: 'Government Identity' },
              { label: 'Medical Certificate', status: driver.documents.medicalCertStatus, detail: 'Annual Health Screening' },
              { label: 'Police Verification', status: 'Verified', detail: 'Background Check Completed' },
            ].map((doc) => (
              <div
                key={doc.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--panel-2)',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--border-soft)',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{doc.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{doc.detail}</div>
                </div>
                <span
                  className={`vp-badge ${
                    doc.status === 'Verified' ? 'vp-badge-success' : doc.status === 'Pending' ? 'vp-badge-warning' : 'vp-badge-danger'
                  }`}
                >
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle & Assignment Card */}
        <div className="vp-card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Truck size={18} color="#3b82f6" /> Current Assignment & History
          </h3>

          <div style={{ background: 'var(--panel-2)', padding: 14, borderRadius: 10, border: '1px solid var(--border-soft)', marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>CURRENTLY ASSIGNED TO</div>
            {driver.assignedVehicle ? (
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--vendor-accent)', marginTop: 6 }}>
                {driver.assignedVehicle}
              </div>
            ) : (
              <div style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 6 }}>No vehicle assigned</div>
            )}
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>RECENT TRIP HISTORY</div>
          {[
            { trip: 'TRIP-4011', route: 'Bhiwandi -> Pune', date: '21st July', status: 'Delivered' },
            { trip: 'TRIP-4005', route: 'Pune -> Gurgaon', date: '18th July', status: 'Delivered' },
          ].map((h) => (
            <div key={h.trip} style={{ fontSize: 12, color: 'var(--text-2)', padding: '8px 0', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 600 }}>{h.trip}</span> — {h.route}
                <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{h.date}</div>
              </div>
              <span className="vp-badge vp-badge-success" style={{ fontSize: 9 }}>{h.status}</span>
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <button className="vp-btn vp-btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              <Upload size={14} /> Upload New Documents
            </button>
          </div>
        </div>
      </div>

      {driver.rejectionNotes && (
        <div style={{ background: 'var(--vendor-danger-light)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: 14, borderRadius: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--vendor-danger)' }}>Rejection Notes:</div>
          <div style={{ fontSize: 12, color: 'var(--text-1)', marginTop: 4 }}>{driver.rejectionNotes}</div>
        </div>
      )}
    </div>
  );
};
