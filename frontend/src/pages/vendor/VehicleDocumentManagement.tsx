import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, Clock } from 'lucide-react';
import { initialVehicles } from './vendorDataStore';
import '../../styles/vendor.css';

export const VehicleDocumentManagement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const vehicleId = searchParams.get('id') || 'V-01';
  const vehicle = initialVehicles.find((v) => v.id === vehicleId) || initialVehicles[0];

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const docTypes = [
    { name: 'RC (Registration Certificate)', key: 'rc', status: vehicle.documents.rc, expiry: 'Permanent' },
    { name: 'Insurance Policy', key: 'insurance', status: vehicle.documents.insurance, expiry: vehicle.insuranceExpiry, alert: 'T-0 EXPIRED (Needs Immediate Upload)' },
    { name: 'Fitness Certificate', key: 'fitness', status: vehicle.documents.fitness, expiry: vehicle.fitnessExpiry },
    { name: 'National Permit', key: 'permit', status: vehicle.documents.permit, expiry: vehicle.permitExpiry, alert: 'T-30 Expiry Coming' },
    { name: 'Road Tax Token', key: 'tax', status: vehicle.documents.tax, expiry: '2027-04-01' },
    { name: 'PUC (Pollution Under Control)', key: 'puc', status: vehicle.documents.puc, expiry: vehicle.pucExpiry, alert: 'T-7 Expiry Warning' },
    { name: 'AIS-140 GPS Compliance Certificate', key: 'ais140Cert', status: vehicle.documents.ais140Cert, expiry: '2028-09-12' },
  ];

  const handleSimulateUpload = (docName: string) => {
    setUploadingDoc(docName);
    setTimeout(() => {
      setUploadingDoc(null);
      alert(`Updated document [${docName}] uploaded successfully! System OCR has queued document for verification.`);
    }, 1000);
  };

  return (
    <div className="vp-doc-mgmt" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="vp-page-header">
        <div>
          <button
            className="vp-btn vp-btn-secondary"
            style={{ marginBottom: 12, padding: '4px 10px', fontSize: 12 }}
            onClick={() => navigate('/vendor/fleet')}
          >
            <ArrowLeft size={14} /> Back to Fleet Registry
          </button>
          <div className="vp-page-title">
            <Upload color="var(--vendor-accent)" /> Vehicle Document Management: {vehicle.registrationNumber}
          </div>
          <div className="vp-page-subtitle">
            Upload and renew mandatory regulatory documents. Expiry triggers T-30, T-15, and T-7 notifications.
          </div>
        </div>
      </div>

      {/* Document Upload Table */}
      <div className="vp-table-wrap">
        <table className="vp-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Current Status</th>
              <th>Expiry Date</th>
              <th>Alert Badge</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {docTypes.map((doc) => (
              <tr key={doc.key}>
                <td style={{ fontWeight: 600 }}>{doc.name}</td>
                <td>
                  <span
                    className={`vp-badge ${
                      doc.status === 'Valid'
                        ? 'vp-badge-success'
                        : doc.status === 'Expiring Soon'
                        ? 'vp-badge-warning'
                        : 'vp-badge-danger'
                    }`}
                  >
                    {doc.status}
                  </span>
                </td>
                <td style={{ fontFamily: 'JetBrains Mono' }}>{doc.expiry}</td>
                <td>
                  {doc.alert ? (
                    <span className="vp-badge vp-badge-danger">
                      <Clock size={10} /> {doc.alert}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-3)', fontSize: 12 }}>—</span>
                  )}
                </td>
                <td>
                  <button
                    className="vp-btn vp-btn-primary"
                    style={{ padding: '4px 10px', fontSize: 11 }}
                    onClick={() => handleSimulateUpload(doc.name)}
                    disabled={uploadingDoc === doc.name}
                  >
                    {uploadingDoc === doc.name ? 'Uploading...' : 'Upload Renewal File'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
