import React, { useState } from 'react';
import { UserCheck, Building2, CreditCard, Upload, CheckCircle, Edit, X, FileText, Download, Loader2 } from 'lucide-react';
import '../../styles/vendor.css';

interface KYCDoc {
  name: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  uploadDate: string;
  fileName?: string;
}

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

  // React State for KYC documents list
  const [docs, setDocs] = useState<KYCDoc[]>([
    { name: 'GST Registration Certificate', status: 'Verified', uploadDate: '15 Apr 2023', fileName: 'GST_Cert_2023.pdf' },
    { name: 'PAN Card (Business)', status: 'Verified', uploadDate: '15 Apr 2023', fileName: 'PAN_Business.pdf' },
    { name: 'Cancelled Cheque', status: 'Verified', uploadDate: '20 Apr 2023', fileName: 'Cancelled_Cheque.pdf' },
    { name: 'Trade / Company Registration Certificate', status: 'Verified', uploadDate: '15 Apr 2023', fileName: 'Trade_Register.pdf' },
    { name: 'Address Proof (Utility Bill)', status: 'Verified', uploadDate: '22 Apr 2023', fileName: 'Utility_Bill_Apr23.pdf' },
  ]);

  // Modal & File Upload States
  const [viewDoc, setViewDoc] = useState<KYCDoc | null>(null);
  const [reuploadDoc, setReuploadDoc] = useState<KYCDoc | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [reuploadFileName, setReuploadFileName] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [customDocName, setCustomDocName] = useState('');
  const [newFileName, setNewFileName] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mock upload simulator
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
        return prev + 20;
      });
    }, 80);
  };

  const handleReuploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reuploadDoc || !reuploadFileName) return;

    startUploadSimulation(() => {
      setDocs((prev) =>
        prev.map((d) =>
          d.name === reuploadDoc.name
            ? {
                ...d,
                status: 'Pending',
                uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                fileName: reuploadFileName,
              }
            : d
        )
      );
      setReuploadDoc(null);
      setReuploadFileName('');
    });
  };

  const handleNewUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newDocName === 'Other Certification' ? customDocName : newDocName;
    if (!finalName || !newFileName) return;

    startUploadSimulation(() => {
      const newDoc: KYCDoc = {
        name: finalName,
        status: 'Pending',
        uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        fileName: newFileName,
      };
      setDocs((prev) => [...prev, newDoc]);
      setShowUploadModal(false);
      setNewDocName('');
      setCustomDocName('');
      setNewFileName('');
    });
  };

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
                    <button className="vp-btn vp-btn-secondary" style={{ padding: '2px 8px', fontSize: 10 }} onClick={() => alert('Bank documents verification is handled automatically.')}>
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
            <button className="vp-btn vp-btn-primary" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => setShowUploadModal(true)}>
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
                {docs.map((doc) => (
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
                        <button className="vp-btn vp-btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setViewDoc(doc)}>View</button>
                        <button className="vp-btn vp-btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setReuploadDoc(doc)}>
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

      {/* 1. Document Viewer Modal */}
      {viewDoc && (
        <div className="vp-modal-overlay">
          <div className="vp-modal" style={{ maxWidth: 500 }}>
            <div className="vp-modal-header">
              <div className="vp-modal-title">Document Preview</div>
              <button 
                className="adm-icon-btn" 
                onClick={() => setViewDoc(null)} 
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 16 }}
              >
                ✕
              </button>
            </div>
            <div style={{ background: 'var(--panel-2)', borderRadius: 12, padding: 30, textAlign: 'center', border: '1px solid var(--border-soft)' }}>
              <FileText size={64} color="var(--vendor-accent)" style={{ margin: '0 auto 16px', display: 'block' }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>{viewDoc.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
                File: <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-2)' }}>{viewDoc.fileName || `${viewDoc.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                <span className={`vp-badge ${viewDoc.status === 'Verified' ? 'vp-badge-success' : viewDoc.status === 'Pending' ? 'vp-badge-warning' : 'vp-badge-danger'}`}>
                  {viewDoc.status}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-3)', alignSelf: 'center' }}>Uploaded: {viewDoc.uploadDate}</span>
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="vp-btn vp-btn-primary" onClick={() => alert('Downloading file...')}>
                  <Download size={14} /> Download Document
                </button>
                <button className="vp-btn vp-btn-secondary" onClick={() => setViewDoc(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Re-upload Document Modal */}
      {reuploadDoc && (
        <div className="vp-modal-overlay">
          <div className="vp-modal" style={{ maxWidth: 500 }}>
            <div className="vp-modal-header">
              <div className="vp-modal-title">Re-upload: {reuploadDoc.name}</div>
              <button 
                className="adm-icon-btn" 
                onClick={() => {
                  setReuploadDoc(null);
                  setReuploadFileName('');
                }} 
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 16 }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleReuploadSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ border: '2px dashed var(--border-soft)', borderRadius: 10, padding: 30, textAlign: 'center', cursor: 'pointer', background: 'var(--panel-2)' }}>
                  <Upload size={32} color="var(--text-3)" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Drag and drop file here, or click to browse</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Supports PDF, PNG, JPG (Max 5MB)</div>
                  <input 
                    type="file" 
                    id="reupload-file-input" 
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setReuploadFileName(file.name);
                    }} 
                  />
                  <button 
                    type="button" 
                    className="vp-btn vp-btn-secondary" 
                    style={{ marginTop: 12, display: 'inline-flex', padding: '4px 10px', fontSize: 11 }}
                    onClick={() => document.getElementById('reupload-file-input')?.click()}
                  >
                    Choose File
                  </button>
                  {reuploadFileName && (
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--vendor-accent)', fontWeight: 600 }}>
                      Selected: {reuploadFileName}
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
                    setReuploadDoc(null);
                    setReuploadFileName('');
                  }} disabled={isUploading}>
                    Cancel
                  </button>
                  <button type="submit" className="vp-btn vp-btn-primary" disabled={isUploading || !reuploadFileName}>
                    {isUploading ? (
                      <>
                        <Loader2 size={14} className="adm-spin" style={{ marginRight: 6 }} /> Uploading...
                      </>
                    ) : (
                      'Upload and Replace'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Upload New Document Modal */}
      {showUploadModal && (
        <div className="vp-modal-overlay">
          <div className="vp-modal" style={{ maxWidth: 500 }}>
            <div className="vp-modal-header">
              <div className="vp-modal-title">Upload New KYC Document</div>
              <button 
                className="adm-icon-btn" 
                onClick={() => {
                  setShowUploadModal(false);
                  setNewDocName('');
                  setNewFileName('');
                }} 
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 16 }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleNewUploadSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="vp-form-group">
                  <label className="vp-label" style={{ marginBottom: 6 }}>Document Type</label>
                  <select
                    className="vp-input"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    style={{ backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', color: 'var(--text-1)' }}
                    required
                  >
                    <option value="">Select document type...</option>
                    <option value="Shop & Establishment License">Shop & Establishment License</option>
                    <option value="MSME Registration Certificate">MSME Registration Certificate</option>
                    <option value="ISO Quality Certification">ISO Quality Certification</option>
                    <option value="Partnership Deed / Incorporation Articles">Partnership Deed / Incorporation Articles</option>
                    <option value="Pollution Under Control (PUC) Hub Cert">Pollution Under Control (PUC) Hub Cert</option>
                    <option value="Other Certification">Other Certification</option>
                  </select>
                </div>

                {newDocName === 'Other Certification' && (
                  <div className="vp-form-group">
                    <label className="vp-label" style={{ marginBottom: 6 }}>Specify Document Name</label>
                    <input 
                      type="text" 
                      className="vp-input" 
                      placeholder="Enter document name..." 
                      value={customDocName} 
                      onChange={(e) => setCustomDocName(e.target.value)} 
                      required 
                    />
                  </div>
                )}

                <div style={{ border: '2px dashed var(--border-soft)', borderRadius: 10, padding: 30, textAlign: 'center', cursor: 'pointer', background: 'var(--panel-2)' }}>
                  <Upload size={32} color="var(--text-3)" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Drag and drop file here, or click to browse</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Supports PDF, PNG, JPG (Max 5MB)</div>
                  <input 
                    type="file" 
                    id="new-file-input" 
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setNewFileName(file.name);
                    }} 
                  />
                  <button 
                    type="button" 
                    className="vp-btn vp-btn-secondary" 
                    style={{ marginTop: 12, display: 'inline-flex', padding: '4px 10px', fontSize: 11 }}
                    onClick={() => document.getElementById('new-file-input')?.click()}
                  >
                    Choose File
                  </button>
                  {newFileName && (
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--vendor-accent)', fontWeight: 600 }}>
                      Selected: {newFileName}
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
                    setShowUploadModal(false);
                    setNewDocName('');
                    setNewFileName('');
                  }} disabled={isUploading}>
                    Cancel
                  </button>
                  <button type="submit" className="vp-btn vp-btn-primary" disabled={isUploading || !newDocName || !newFileName}>
                    {isUploading ? (
                      <>
                        <Loader2 size={14} className="adm-spin" style={{ marginRight: 6 }} /> Uploading...
                      </>
                    ) : (
                      'Upload Document'
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
