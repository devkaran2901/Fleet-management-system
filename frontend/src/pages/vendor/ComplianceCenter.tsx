import React, { useState } from 'react';
import { ShieldCheck, Truck, Users, Building2, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { initialVehicles, initialDrivers } from './vendorDataStore';
import '../../styles/vendor.css';

type ComplianceTab = 'Vehicle' | 'Driver' | 'Vendor';

export const ComplianceCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ComplianceTab>('Vehicle');

  const today = new Date('2026-07-23');
  const daysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getExpiryBadge = (dateStr: string) => {
    const days = daysUntil(dateStr);
    if (days < 0) return <span className="vp-badge vp-badge-danger">EXPIRED ({Math.abs(days)}d ago)</span>;
    if (days <= 7) return <span className="vp-badge vp-badge-danger">T-7 ({days} days)</span>;
    if (days <= 15) return <span className="vp-badge vp-badge-warning">T-15 ({days} days)</span>;
    if (days <= 30) return <span className="vp-badge vp-badge-warning">T-30 ({days} days)</span>;
    return <span className="vp-badge vp-badge-success">Valid ({days} days)</span>;
  };

  const expiredVehicles = initialVehicles.filter((v) => v.overallStatus === 'Expired').length;
  const pendingDrivers = initialDrivers.filter((d) => d.verificationStatus === 'Pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="vp-page-header">
        <div>
          <div className="vp-page-title">
            <ShieldCheck color="var(--vendor-accent)" /> Vendor Compliance Center
          </div>
          <div className="vp-page-subtitle">
            Unified view of Vehicle, Driver, and Vendor KYC compliance. Monitor expiry dates, resolve holds, and upload renewal documents.
          </div>
        </div>

        {(expiredVehicles > 0 || pendingDrivers > 0) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--vendor-danger-light)', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 16px', borderRadius: 10 }}>
            <AlertTriangle size={16} color="var(--vendor-danger)" />
            <span style={{ fontSize: 13, color: 'var(--vendor-danger)', fontWeight: 700 }}>
              {expiredVehicles} Vehicle(s) Expired · {pendingDrivers} Driver Pending
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="vp-tabs">
        <button className={`vp-tab ${activeTab === 'Vehicle' ? 'active' : ''}`} onClick={() => setActiveTab('Vehicle')}>
          <Truck size={14} style={{ marginRight: 6 }} /> Vehicle Compliance
        </button>
        <button className={`vp-tab ${activeTab === 'Driver' ? 'active' : ''}`} onClick={() => setActiveTab('Driver')}>
          <Users size={14} style={{ marginRight: 6 }} /> Driver Compliance
        </button>
        <button className={`vp-tab ${activeTab === 'Vendor' ? 'active' : ''}`} onClick={() => setActiveTab('Vendor')}>
          <Building2 size={14} style={{ marginRight: 6 }} /> Vendor KYC Status
        </button>
      </div>

      {/* === VEHICLE COMPLIANCE TAB === */}
      {activeTab === 'Vehicle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="vp-table-wrap">
            <table className="vp-table">
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Insurance Expiry</th>
                  <th>Permit Expiry</th>
                  <th>Fitness Expiry</th>
                  <th>PUC Expiry</th>
                  <th>AIS-140</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {initialVehicles.map((v) => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{v.registrationNumber}</td>
                    <td>{getExpiryBadge(v.insuranceExpiry)}</td>
                    <td>{getExpiryBadge(v.permitExpiry)}</td>
                    <td>{getExpiryBadge(v.fitnessExpiry)}</td>
                    <td>{getExpiryBadge(v.pucExpiry)}</td>
                    <td>
                      <span className={`vp-badge ${v.ais140Status === 'ACTIVE' ? 'vp-badge-success' : 'vp-badge-danger'}`} style={{ fontSize: 9 }}>
                        {v.ais140Status}
                      </span>
                    </td>
                    <td>
                      <button className="vp-btn vp-btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>
                        <Upload size={13} /> Renew Docs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === DRIVER COMPLIANCE TAB === */}
      {activeTab === 'Driver' && (
        <div className="vp-table-wrap">
          <table className="vp-table">
            <thead>
              <tr>
                <th>Driver Name</th>
                <th>DL Number</th>
                <th>DL Expiry Status</th>
                <th>Aadhaar Verification</th>
                <th>Medical Certificate</th>
                <th>Background Check</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {initialDrivers.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 700 }}>{d.name}</td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>{d.licenseNumber}</td>
                  <td>{getExpiryBadge(d.documents.dl)}</td>
                  <td>
                    <span className={`vp-badge ${d.documents.aadhaarStatus === 'Verified' ? 'vp-badge-success' : d.documents.aadhaarStatus === 'Pending' ? 'vp-badge-warning' : 'vp-badge-danger'}`} style={{ fontSize: 9 }}>
                      {d.documents.aadhaarStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`vp-badge ${d.documents.medicalCertStatus === 'Verified' ? 'vp-badge-success' : 'vp-badge-warning'}`} style={{ fontSize: 9 }}>
                      {d.documents.medicalCertStatus}
                    </span>
                  </td>
                  <td><span className="vp-badge vp-badge-success" style={{ fontSize: 9 }}>Cleared</span></td>
                  <td>
                    {d.verificationStatus !== 'Verified' && (
                      <button className="vp-btn vp-btn-danger" style={{ padding: '4px 10px', fontSize: 11 }}>
                        <Upload size={13} /> Upload Docs
                      </button>
                    )}
                    {d.verificationStatus === 'Verified' && (
                      <span className="vp-badge vp-badge-success" style={{ fontSize: 10 }}>All Clear</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === VENDOR KYC TAB === */}
      {activeTab === 'Vendor' && (
        <div className="vp-grid-3">
          {[
            {
              label: 'KYC Verification Status',
              value: 'Verified',
              icon: <CheckCircle size={18} color="var(--vendor-accent)" />,
              status: 'success',
              detail: 'All identity and business documents verified by compliance team.',
            },
            {
              label: 'GST Registration (GSTIN)',
              value: '27AAECS8882Q1Z5',
              icon: <ShieldCheck size={18} color="var(--vendor-accent)" />,
              status: 'success',
              detail: 'Maharashtra (MH) State — Active GSTIN as of FY 2025–26.',
            },
            {
              label: 'PAN Number',
              value: 'AAECS8882Q',
              icon: <ShieldCheck size={18} color="var(--vendor-accent)" />,
              status: 'success',
              detail: 'Business PAN verified against Income Tax database.',
            },
            {
              label: 'Bank Account Details',
              value: 'HDFC Bank (Active)',
              icon: <CheckCircle size={18} color="var(--vendor-accent)" />,
              status: 'success',
              detail: 'Penny drop verification completed. IFSC: HDFC0001234.',
            },
            {
              label: 'GST Certificate Upload',
              value: 'Uploaded & Verified',
              icon: <CheckCircle size={18} color="var(--vendor-accent)" />,
              status: 'success',
              detail: 'GST Registration Certificate dated 15 April 2023.',
            },
            {
              label: 'Cancelled Cheque',
              value: 'Verified',
              icon: <CheckCircle size={18} color="var(--vendor-accent)" />,
              status: 'success',
              detail: 'Beneficiary name matches bank records.',
            },
          ].map((item) => (
            <div key={item.label} className="vp-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {item.icon}
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{item.label}</div>
                </div>
                <span className={`vp-badge vp-badge-${item.status}`} style={{ fontSize: 9 }}>VERIFIED</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--vendor-accent)', marginBottom: 6 }}>{item.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{item.detail}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
