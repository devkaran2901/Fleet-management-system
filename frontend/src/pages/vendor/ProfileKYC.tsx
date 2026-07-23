import React, { useState } from 'react';
import { UserCheck, Building2, CreditCard, Upload, CheckCircle, Edit } from 'lucide-react';
import '../../styles/vendor.css';

export const ProfileKYC: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Company' | 'Bank' | 'KYC Documents'>('Company');
  const [editMode, setEditMode] = useState(false);

  const [companyName] = useState('Express Logistics Pvt. Ltd.');
  const [gstin] = useState('27AAECS8882Q1Z5');
  const [pan] = useState('AAECS8882Q');
  const [address] = useState('Plot No. 14, Bhiwandi Logistics Park, Bhiwandi, Maharashtra - 421 302');
  const [contactName] = useState('Rajesh Shah');
  const [contactEmail] = useState('rajesh.shah@expresslogistics.in');
  const [contactPhone] = useState('+91 99887 76655');

  const kycDocs = [
    { name: 'GST Registration Certificate', status: 'Verified', uploadDate: '15 Apr 2023' },
    { name: 'PAN Card (Business)', status: 'Verified', uploadDate: '15 Apr 2023' },
    { name: 'Cancelled Cheque', status: 'Verified', uploadDate: '20 Apr 2023' },
    { name: 'Trade / Company Registration Certificate', status: 'Verified', uploadDate: '15 Apr 2023' },
    { name: 'Address Proof (Utility Bill)', status: 'Verified', uploadDate: '22 Apr 2023' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="vp-page-header">
        <div>
          <div className="vp-page-title">
            <UserCheck color="var(--vendor-accent)" /> Profile & KYC — Vendor 360°
          </div>
          <div className="vp-page-subtitle">
            Company information, bank account details, and KYC document verification status.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="vp-badge vp-badge-success" style={{ padding: '8px 14px' }}>
            <CheckCircle size={14} /> KYC Verified
          </span>
          <button className="vp-btn vp-btn-secondary" onClick={() => setEditMode(!editMode)}>
            <Edit size={14} /> {editMode ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Profile Banner */}
      <div className="vp-card" style={{ backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 16, background: 'var(--vendor-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 900, color: '#fff',
          }}>
            EL
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)' }}>{companyName}</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>GSTIN: {gstin} · PAN: {pan}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{address}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="vp-tabs">
        {(['Company', 'Bank', 'KYC Documents'] as const).map((t) => (
          <button key={t} className={`vp-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      {/* Company Details Tab */}
      {activeTab === 'Company' && (
        <div className="vp-grid-2">
          <div className="vp-card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={18} color="var(--vendor-accent)" /> Company Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Vendor / Company Name', value: companyName },
                { label: 'GSTIN', value: gstin },
                { label: 'PAN Number', value: pan },
                { label: 'Registered Address', value: address },
              ].map((field) => (
                <div key={field.label} className="vp-form-group" style={{ marginBottom: 0 }}>
                  <label className="vp-label">{field.label}:</label>
                  {editMode ? (
                    <input type="text" className="vp-input" defaultValue={field.value} />
                  ) : (
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', padding: '8px 0' }}>{field.value}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="vp-card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Primary Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Contact Person Name', value: contactName },
                { label: 'Email Address', value: contactEmail },
                { label: 'Phone Number', value: contactPhone },
                { label: 'Alternate Phone', value: '+91 98765 11000' },
              ].map((field) => (
                <div key={field.label} className="vp-form-group" style={{ marginBottom: 0 }}>
                  <label className="vp-label">{field.label}:</label>
                  {editMode ? (
                    <input type="text" className="vp-input" defaultValue={field.value} />
                  ) : (
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', padding: '8px 0' }}>{field.value}</div>
                  )}
                </div>
              ))}
            </div>
            {editMode && (
              <button className="vp-btn vp-btn-primary" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
                Save Changes
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bank Details Tab */}
      {activeTab === 'Bank' && (
        <div className="vp-grid-2">
          <div className="vp-card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={18} color="var(--vendor-accent)" /> Bank Account Details
            </h3>
            <div style={{ background: 'var(--vendor-accent-light)', border: '1px solid rgba(16,185,129,0.3)', padding: 14, borderRadius: 10, marginBottom: 16 }}>
              <span className="vp-badge vp-badge-success">Penny Drop Verification: PASSED</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Bank Name', value: 'HDFC Bank Ltd.' },
                { label: 'Account Number', value: '5020 1234 5678 90' },
                { label: 'IFSC Code', value: 'HDFC0001234' },
                { label: 'Beneficiary Name', value: 'Express Logistics Pvt Ltd' },
                { label: 'Account Type', value: 'Current Account' },
                { label: 'Branch', value: 'Bhiwandi Main Branch, MH' },
              ].map((f) => (
                <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{f.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', fontFamily: f.label.includes('Account') || f.label.includes('IFSC') ? 'JetBrains Mono' : 'inherit' }}>{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="vp-card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Bank Document Verification</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Cancelled Cheque', status: 'Verified', uploadDate: '20 Apr 2023' },
                { label: 'Bank Statement (Last 3 months)', status: 'Verified', uploadDate: '20 Apr 2023' },
              ].map((doc) => (
                <div key={doc.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel-2)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{doc.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Uploaded: {doc.uploadDate}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="vp-badge vp-badge-success" style={{ fontSize: 9 }}>{doc.status}</span>
                    <button className="vp-btn vp-btn-secondary" style={{ padding: '2px 8px', fontSize: 10 }}>
                      <Upload size={10} /> Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KYC Documents Tab */}
      {activeTab === 'KYC Documents' && (
        <div className="vp-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>KYC Document Library</h3>
            <button className="vp-btn vp-btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
              <Upload size={14} /> Upload New Document
            </button>
          </div>
          <div className="vp-table-wrap">
            <table className="vp-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Status</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {kycDocs.map((doc) => (
                  <tr key={doc.name}>
                    <td style={{ fontWeight: 600 }}>{doc.name}</td>
                    <td>
                      <span className={`vp-badge ${doc.status === 'Verified' ? 'vp-badge-success' : doc.status === 'Pending' ? 'vp-badge-warning' : 'vp-badge-danger'}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-3)', fontSize: 12 }}>{doc.uploadDate}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="vp-btn vp-btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>View</button>
                        <button className="vp-btn vp-btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>
                          <Upload size={12} /> Re-upload
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
