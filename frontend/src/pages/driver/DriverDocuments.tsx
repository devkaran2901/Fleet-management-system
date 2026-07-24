import React, { useState } from 'react';
import { initialDocuments } from './driverDataStore';
import type { DriverDocument } from './driverDataStore';
import {
  Shield,
  Truck,
  Route,
  Eye,
  Download,
  X,
  FileCheck2,
  FileText,
} from 'lucide-react';

export const DriverDocuments: React.FC = () => {
  const [documents] = useState<DriverDocument[]>(initialDocuments);
  const [activeCategory, setActiveCategory] = useState<'Driver' | 'Vehicle' | 'Trip'>('Driver');
  const [selectedDoc, setSelectedDoc] = useState<DriverDocument | null>(null);

  const filteredDocs = documents.filter((d) => d.type === activeCategory);

  const tripDocs = [
    { title: 'Lorry Receipt (LR)', docName: 'LR-88204.pdf', status: 'Valid', tripId: 'TRIP-9041' },
    { title: 'E-Way Bill (EWB)', docName: 'EWB-392019482.pdf', status: 'Valid', tripId: 'TRIP-9041' },
    { title: 'Consignee Cargo Invoice', docName: 'INV-2026-9481.pdf', status: 'Valid', tripId: 'TRIP-9041' },
    { title: 'Electronic Proof of Delivery (ePOD)', docName: 'POD-8980-Verified.pdf', status: 'Valid', tripId: 'TRIP-8980' },
  ];

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text-1)' }}>Compliance & Digital Documents</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-2)' }}>
            Store & view driver credentials, vehicle permits, RC, insurance & trip e-way bills.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          className={activeCategory === 'Driver' ? 'driver-btn-primary' : 'driver-btn-secondary'}
          onClick={() => setActiveCategory('Driver')}
          style={{ padding: '8px 16px', fontSize: 13 }}
        >
          <Shield size={16} /> Driver Credentials
        </button>

        <button
          className={activeCategory === 'Vehicle' ? 'driver-btn-primary' : 'driver-btn-secondary'}
          onClick={() => setActiveCategory('Vehicle')}
          style={{ padding: '8px 16px', fontSize: 13 }}
        >
          <Truck size={16} /> Vehicle Permits & RC
        </button>

        <button
          className={activeCategory === 'Trip' ? 'driver-btn-primary' : 'driver-btn-secondary'}
          onClick={() => setActiveCategory('Trip')}
          style={{ padding: '8px 16px', fontSize: 13 }}
        >
          <Route size={16} /> Trip Records & LR
        </button>
      </div>

      {activeCategory !== 'Trip' ? (
        <div className="driver-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="driver-table">
            <thead>
              <tr>
                <th>Document Title</th>
                <th>File Name</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--text-1)' }}>{doc.title}</span>
                  </td>
                  <td>
                    <span style={{ color: '#3B82F6', fontSize: 12, fontFamily: 'monospace' }}>{doc.documentName}</span>
                  </td>
                  <td>{doc.expiryDate}</td>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background:
                          doc.status === 'Valid'
                            ? 'var(--green-glow, rgba(46, 204, 113, 0.15))'
                            : doc.status === 'Expiring Soon'
                            ? 'rgba(232, 163, 61, 0.15)'
                            : 'rgba(229, 72, 77, 0.15)',
                        color:
                          doc.status === 'Valid'
                            ? 'var(--green)'
                            : doc.status === 'Expiring Soon'
                            ? 'var(--amber)'
                            : 'var(--red)',
                      }}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        className="driver-btn-secondary"
                        onClick={() => setSelectedDoc(doc)}
                        style={{ padding: '5px 10px', fontSize: 11 }}
                      >
                        <Eye size={12} /> View
                      </button>
                      <button
                        className="driver-btn-primary"
                        onClick={() => alert(`Downloading ${doc.documentName}...`)}
                        style={{ padding: '5px 10px', fontSize: 11 }}
                      >
                        <Download size={12} /> Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="driver-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="driver-table">
            <thead>
              <tr>
                <th>Document Type</th>
                <th>File Name</th>
                <th>Associated Trip</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tripDocs.map((td, i) => (
                <tr key={i}>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--text-1)' }}>{td.title}</span>
                  </td>
                  <td>
                    <span style={{ color: '#3B82F6', fontSize: 12, fontFamily: 'monospace' }}>{td.docName}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--green)' }}>{td.tripId}</span>
                  </td>
                  <td>
                    <span className="driver-status-pill approved">Active</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        className="driver-btn-secondary"
                        onClick={() => alert(`Viewing digital copy: ${td.docName}`)}
                        style={{ padding: '5px 10px', fontSize: 11 }}
                      >
                        <Eye size={12} /> View
                      </button>
                      <button
                        className="driver-btn-primary"
                        onClick={() => alert(`Downloading ${td.docName}...`)}
                        style={{ padding: '5px 10px', fontSize: 11 }}
                      >
                        <Download size={12} /> Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Preview */}
      {selectedDoc && (
        <div className="driver-modal-overlay">
          <div className="driver-modal" style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileCheck2 color="var(--green)" size={22} />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Document Preview: {selectedDoc.title}</h3>
              </div>
              <button onClick={() => setSelectedDoc(null)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'var(--panel-2)', padding: 14, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>File: {selectedDoc.documentName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Expiry Date: <strong style={{ color: 'var(--text-1)' }}>{selectedDoc.expiryDate}</strong></div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>Validity Status: <strong style={{ color: 'var(--green)' }}>{selectedDoc.status}</strong></div>
            </div>

            <div style={{ height: 180, background: 'var(--panel-2)', border: '1px dashed var(--border)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', marginBottom: 20 }}>
              <FileText size={36} color="var(--green)" />
              <span style={{ marginTop: 8, fontSize: 12, fontWeight: 600 }}>Verified Digital Document Watermarked</span>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="driver-btn-secondary" onClick={() => setSelectedDoc(null)}>
                Close
              </button>
              <button className="driver-btn-primary" onClick={() => alert(`Downloading ${selectedDoc.documentName}...`)}>
                <Download size={16} /> Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
