import React, { useState } from 'react';
import { ShieldCheck, Truck, Users, Building2, Upload, AlertTriangle, CheckCircle, X, FileText, Loader2 } from 'lucide-react';
import { initialVehicles, initialDrivers } from './vendorDataStore';
import '../../styles/vendor.css';

type ComplianceTab = 'Vehicle' | 'Driver' | 'Vendor';

export const ComplianceCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ComplianceTab>('Vehicle');

  // Interactive state for vehicles and drivers
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [drivers, setDrivers] = useState(initialDrivers);

  // Modal states
  const [renewVehicle, setRenewVehicle] = useState<typeof initialVehicles[0] | null>(null);
  const [uploadDriver, setUploadDriver] = useState<typeof initialDrivers[0] | null>(null);

  // Form states
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const expiredVehicles = vehicles.filter((v) => v.overallStatus === 'Expired').length;
  const pendingDrivers = drivers.filter((d) => d.verificationStatus === 'Pending').length;

  // Mock upload progress simulator
  const startUploadSimulation = (onComplete: () => void) => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            onComplete();
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 60);
  };

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewVehicle || !selectedDocType || !uploadedFileName) return;

    startUploadSimulation(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === renewVehicle.id) {
            const updatedDocs = { ...v.documents };
            let insExp = v.insuranceExpiry;
            let perExp = v.permitExpiry;
            let fitExp = v.fitnessExpiry;
            let pucExp = v.pucExpiry;

            // Set to next year
            const nextYearStr = '2027-07-29';

            if (selectedDocType === 'insurance') {
              updatedDocs.insurance = 'Valid';
              insExp = nextYearStr;
            } else if (selectedDocType === 'permit') {
              updatedDocs.permit = 'Valid';
              perExp = nextYearStr;
            } else if (selectedDocType === 'fitness') {
              updatedDocs.fitness = 'Valid';
              fitExp = nextYearStr;
            } else if (selectedDocType === 'puc') {
              updatedDocs.puc = 'Valid';
              pucExp = nextYearStr;
            }

            // Recalculate overall status
            const hasExpired =
              updatedDocs.rc === 'Expired' ||
              updatedDocs.insurance === 'Expired' ||
              updatedDocs.fitness === 'Expired' ||
              updatedDocs.permit === 'Expired' ||
              updatedDocs.tax === 'Expired' ||
              updatedDocs.puc === 'Expired' ||
              updatedDocs.ais140Cert === 'Expired';

            const hasExpiring =
              updatedDocs.rc === 'Expiring Soon' ||
              updatedDocs.insurance === 'Expiring Soon' ||
              updatedDocs.fitness === 'Expiring Soon' ||
              updatedDocs.permit === 'Expiring Soon' ||
              updatedDocs.tax === 'Expiring Soon' ||
              updatedDocs.puc === 'Expiring Soon' ||
              updatedDocs.ais140Cert === 'Expiring Soon';

            const overall: typeof v.overallStatus = hasExpired
              ? 'Expired'
              : hasExpiring
              ? 'Expiring Soon'
              : 'Valid';

            return {
              ...v,
              insuranceExpiry: insExp,
              permitExpiry: perExp,
              fitnessExpiry: fitExp,
              pucExpiry: pucExp,
              documents: updatedDocs,
              overallStatus: overall,
            };
          }
          return v;
        })
      );
      setRenewVehicle(null);
      setSelectedDocType('');
      setUploadedFileName('');
      alert(`Document renewed successfully for ${renewVehicle.registrationNumber}!`);
    });
  };

  const handleDriverUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDriver || !selectedDocType || !uploadedFileName) return;

    startUploadSimulation(() => {
      setDrivers((prev) =>
        prev.map((d) => {
          if (d.id === uploadDriver.id) {
            const updatedDocs = { ...d.documents };
            if (selectedDocType === 'dl') {
              updatedDocs.dl = '2029-07-29';
            } else if (selectedDocType === 'aadhaar') {
              updatedDocs.aadhaarStatus = 'Verified';
            } else if (selectedDocType === 'medical') {
              updatedDocs.medicalCertStatus = 'Verified';
            }

            const verified =
              updatedDocs.aadhaarStatus === 'Verified' &&
              updatedDocs.medicalCertStatus === 'Verified';

            return {
              ...d,
              documents: updatedDocs,
              verificationStatus: verified ? 'Verified' : d.verificationStatus,
            };
          }
          return d;
        })
      );
      setUploadDriver(null);
      setSelectedDocType('');
      setUploadedFileName('');
      alert(`Document uploaded successfully for ${uploadDriver.name}!`);
    });
  };

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
                {vehicles.map((v) => (
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
                      <button className="vp-btn vp-btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setRenewVehicle(v)}>
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
              {drivers.map((d) => (
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
                      <button className="vp-btn vp-btn-danger" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setUploadDriver(d)}>
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
              value: '27AAACA1234A1Z5',
              icon: <ShieldCheck size={18} color="var(--vendor-accent)" />,
              status: 'success',
              detail: 'Maharashtra (MH) State — Active GSTIN as of FY 2025–26.',
            },
            {
              label: 'PAN Number',
              value: 'AAACA1234A',
              icon: <ShieldCheck size={18} color="var(--vendor-accent)" />,
              status: 'success',
              detail: 'Business PAN verified against Income Tax database.',
            },
            {
              label: 'Bank Account Details',
              value: 'HDFC Bank (Active)',
              icon: <CheckCircle size={18} color="var(--vendor-accent)" />,
              status: 'success',
              detail: 'Penny drop verification completed. IFSC: HDFC0000123.',
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

      {/* 1. Renew Vehicle Docs Modal */}
      {renewVehicle && (
        <div className="vp-modal-overlay">
          <div className="vp-modal" style={{ maxWidth: 500 }}>
            <div className="vp-modal-header">
              <div className="vp-modal-title">Renew Vehicle Documents - {renewVehicle.registrationNumber}</div>
              <button 
                className="adm-icon-btn" 
                onClick={() => {
                  setRenewVehicle(null);
                  setSelectedDocType('');
                  setUploadedFileName('');
                }} 
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 16 }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRenewSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="vp-form-group">
                  <label className="vp-label" style={{ marginBottom: 6 }}>Select Document to Renew</label>
                  <select
                    className="vp-input"
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    style={{ backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', color: 'var(--text-1)' }}
                    required
                  >
                    <option value="">Choose document type...</option>
                    <option value="insurance">Insurance Policy ({renewVehicle.documents.insurance})</option>
                    <option value="permit">National Permit ({renewVehicle.documents.permit})</option>
                    <option value="fitness">Fitness Certificate ({renewVehicle.documents.fitness})</option>
                    <option value="puc">PUC Pollution Certificate ({renewVehicle.documents.puc})</option>
                  </select>
                </div>

                <div style={{ border: '2px dashed var(--border-soft)', borderRadius: 10, padding: 30, textAlign: 'center', cursor: 'pointer', background: 'var(--panel-2)' }}>
                  <Upload size={32} color="var(--text-3)" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Drag and drop renewal file, or click to browse</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Supports PDF, PNG, JPG (Max 5MB)</div>
                  <input 
                    type="file" 
                    id="vehicle-renew-file-input" 
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setUploadedFileName(file.name);
                    }} 
                  />
                  <button 
                    type="button" 
                    className="vp-btn vp-btn-secondary" 
                    style={{ marginTop: 12, display: 'inline-flex', padding: '4px 10px', fontSize: 11 }}
                    onClick={() => document.getElementById('vehicle-renew-file-input')?.click()}
                  >
                    Choose File
                  </button>
                  {uploadedFileName && (
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--vendor-accent)', fontWeight: 600 }}>
                      Selected: {uploadedFileName}
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '10px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-2)' }}>Uploading...</span>
                      <span style={{ fontWeight: 600 }}>{uploadProgress}%</span>
                    </div>
                    <div style={{ height: 6, backgroundColor: 'var(--panel-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--vendor-accent)', transition: 'width 0.1s ease-out' }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                  <button type="button" className="vp-btn vp-btn-secondary" onClick={() => {
                    setRenewVehicle(null);
                    setSelectedDocType('');
                    setUploadedFileName('');
                  }} disabled={isUploading}>
                    Cancel
                  </button>
                  <button type="submit" className="vp-btn vp-btn-primary" disabled={isUploading || !selectedDocType || !uploadedFileName}>
                    {isUploading ? (
                      <>
                        <Loader2 size={14} className="adm-spin" style={{ marginRight: 6 }} /> Uploading...
                      </>
                    ) : (
                      'Submit for Verification'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Upload Driver Docs Modal */}
      {uploadDriver && (
        <div className="vp-modal-overlay">
          <div className="vp-modal" style={{ maxWidth: 500 }}>
            <div className="vp-modal-header">
              <div className="vp-modal-title">Upload Driver Documents - {uploadDriver.name}</div>
              <button 
                className="adm-icon-btn" 
                onClick={() => {
                  setUploadDriver(null);
                  setSelectedDocType('');
                  setUploadedFileName('');
                }} 
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 16 }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleDriverUploadSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="vp-form-group">
                  <label className="vp-label" style={{ marginBottom: 6 }}>Select Document to Upload</label>
                  <select
                    className="vp-input"
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    style={{ backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', color: 'var(--text-1)' }}
                    required
                  >
                    <option value="">Choose document type...</option>
                    <option value="dl">Driving License DL (Expiry: {uploadDriver.documents.dl})</option>
                    <option value="aadhaar">Aadhaar Verification (Status: {uploadDriver.documents.aadhaarStatus})</option>
                    <option value="medical">Medical Fitness Certificate (Status: {uploadDriver.documents.medicalCertStatus})</option>
                  </select>
                </div>

                {uploadDriver.rejectionNotes && selectedDocType === 'aadhaar' && (
                  <div style={{ padding: 10, background: 'var(--vendor-warning-light)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--vendor-warning)' }}>
                    <strong>Rejection Notes:</strong> {uploadDriver.rejectionNotes}
                  </div>
                )}

                <div style={{ border: '2px dashed var(--border-soft)', borderRadius: 10, padding: 30, textAlign: 'center', cursor: 'pointer', background: 'var(--panel-2)' }}>
                  <Upload size={32} color="var(--text-3)" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Drag and drop document copy, or click to browse</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Supports PDF, PNG, JPG (Max 5MB)</div>
                  <input 
                    type="file" 
                    id="driver-upload-file-input" 
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setUploadedFileName(file.name);
                    }} 
                  />
                  <button 
                    type="button" 
                    className="vp-btn vp-btn-secondary" 
                    style={{ marginTop: 12, display: 'inline-flex', padding: '4px 10px', fontSize: 11 }}
                    onClick={() => document.getElementById('driver-upload-file-input')?.click()}
                  >
                    Choose File
                  </button>
                  {uploadedFileName && (
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--vendor-accent)', fontWeight: 600 }}>
                      Selected: {uploadedFileName}
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '10px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--text-2)' }}>Uploading...</span>
                      <span style={{ fontWeight: 600 }}>{uploadProgress}%</span>
                    </div>
                    <div style={{ height: 6, backgroundColor: 'var(--panel-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--vendor-accent)', transition: 'width 0.1s ease-out' }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                  <button type="button" className="vp-btn vp-btn-secondary" onClick={() => {
                    setUploadDriver(null);
                    setSelectedDocType('');
                    setUploadedFileName('');
                  }} disabled={isUploading}>
                    Cancel
                  </button>
                  <button type="submit" className="vp-btn vp-btn-primary" disabled={isUploading || !selectedDocType || !uploadedFileName}>
                    {isUploading ? (
                      <>
                        <Loader2 size={14} className="adm-spin" style={{ marginRight: 6 }} /> Uploading...
                      </>
                    ) : (
                      'Submit for Verification'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
