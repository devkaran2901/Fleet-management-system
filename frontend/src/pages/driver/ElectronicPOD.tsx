import React, { useState } from 'react';
import { initialEPODs } from './driverDataStore';
import type { EPODRecord } from './driverDataStore';
import {
  FileCheck2,
  Upload,
  Camera,
  FileText,
  PenTool,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react';

export const ElectronicPOD: React.FC = () => {
  const [podList, setPodList] = useState<EPODRecord[]>(initialEPODs);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedPod, setSelectedPod] = useState<EPODRecord | null>(null);

  const [tripId, setTripId] = useState('TRIP-9041');
  const [customer, setCustomer] = useState('Flipkart Logistics Pvt Ltd');
  const [podPhoto, setPodPhoto] = useState<string | null>(null);
  const [signedPod, setSignedPod] = useState<string | null>(null);
  const [deliveryDoc, setDeliveryDoc] = useState<string | null>(null);
  const [exceptionType, setExceptionType] = useState<'None' | 'Damage' | 'Short Delivery' | 'Refused Delivery'>('None');
  const [remarks, setRemarks] = useState('');
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);

  const handleAddEvidencePhoto = () => {
    setEvidencePhotos((prev) => [...prev, `cargo-evidence-${prev.length + 1}.jpg`]);
  };

  const handleSubmitPod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!podPhoto && !signedPod) {
      alert('Please upload at least the POD Photo or Signed Copy.');
      return;
    }

    const nowFormatted = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newPod: EPODRecord = {
      id: `POD-${Math.floor(1000 + Math.random() * 9000)}`,
      tripId,
      customer,
      podStatus: 'Submitted',
      submissionDate: nowFormatted,
      podPhotoUrl: podPhoto || 'uploaded-pod-scan.pdf',
      signedPodUrl: signedPod || 'consignee-signature-stamp.png',
      deliveryDocUrl: deliveryDoc || 'gate-pass-copy.pdf',
      exceptionType,
      evidencePhotos: evidencePhotos.length > 0 ? evidencePhotos : ['delivery-proof-1.jpg'],
      remarks: remarks || 'Delivered cleanly without cargo damage.',
      timestamp: `${nowFormatted} IST`,
      geoLocation: '19.0760° N, 72.8777° E (Mumbai Distribution Hub)',
    };

    setPodList((prev) => [newPod, ...prev.filter((p) => p.tripId !== tripId)]);
    setShowSubmitModal(false);
    alert('ePOD Submitted successfully! Customer & Dispatcher notified.');
  };

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text-1)' }}>Electronic Proof of Delivery (ePOD)</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-2)' }}>
            Submit signed LR, delivery photos, exception reporting & instant timestamped geotagging.
          </p>
        </div>
        <button className="driver-btn-primary" onClick={() => setShowSubmitModal(true)}>
          <Upload size={16} /> Submit New ePOD
        </button>
      </div>

      {/* ePOD Table */}
      <div className="driver-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="driver-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Customer</th>
              <th>POD Status</th>
              <th>Submission Date</th>
              <th>Exception Flag</th>
              <th>Geo Location Tag</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {podList.map((pod) => (
              <tr key={pod.id}>
                <td>
                  <span style={{ fontWeight: 800, color: 'var(--text-1)' }}>{pod.tripId}</span>
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{pod.customer}</span>
                </td>
                <td>
                  <span
                    className={`driver-status-pill ${
                      pod.podStatus === 'Approved'
                        ? 'approved'
                        : pod.podStatus === 'Submitted'
                        ? 'completed'
                        : pod.podStatus === 'Rejected'
                        ? 'rejected'
                        : 'pending'
                    }`}
                  >
                    {pod.podStatus}
                  </span>
                </td>
                <td>{pod.submissionDate}</td>
                <td>
                  {pod.exceptionType && pod.exceptionType !== 'None' ? (
                    <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={13} /> {pod.exceptionType}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: 12 }}>Clean Delivery</span>
                  )}
                </td>
                <td style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'monospace' }}>
                  {pod.geoLocation}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    {pod.podStatus === 'Pending' ? (
                      <button
                        className="driver-btn-primary"
                        onClick={() => {
                          setTripId(pod.tripId);
                          setCustomer(pod.customer);
                          setShowSubmitModal(true);
                        }}
                        style={{ padding: '5px 10px', fontSize: 11 }}
                      >
                        <Upload size={13} /> Submit POD
                      </button>
                    ) : (
                      <button
                        className="driver-btn-secondary"
                        onClick={() => setSelectedPod(pod)}
                        style={{ padding: '5px 10px', fontSize: 11 }}
                      >
                        View ePOD Details
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Detail */}
      {selectedPod && (
        <div className="driver-modal-overlay">
          <div className="driver-modal" style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileCheck2 color="var(--green)" size={22} />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>ePOD Submission Record</h3>
              </div>
              <button onClick={() => setSelectedPod(null)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'var(--panel-2)', padding: 14, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                <div>
                  <span style={{ color: 'var(--text-2)', fontSize: 11 }}>TRIP ID:</span>
                  <div style={{ fontWeight: 800, color: 'var(--text-1)' }}>{selectedPod.tripId}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-2)', fontSize: 11 }}>CUSTOMER:</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-1)' }}>{selectedPod.customer}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-2)', fontSize: 11 }}>TIMESTAMP:</span>
                  <div style={{ color: 'var(--green)', fontSize: 12, fontWeight: 600 }}>{selectedPod.timestamp}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-2)', fontSize: 11 }}>GEOLOCATION:</span>
                  <div style={{ color: 'var(--text-1)', fontSize: 12, fontFamily: 'monospace' }}>{selectedPod.geoLocation}</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)', marginBottom: 8, textTransform: 'uppercase' }}>
                Uploaded Documents
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                {selectedPod.podPhotoUrl && (
                  <div style={{ background: 'var(--panel-2)', padding: 10, borderRadius: 8, fontSize: 12, border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-2)', fontSize: 10, fontWeight: 700 }}>POD PHOTO SCAN</div>
                    <div style={{ color: 'var(--text-1)', fontWeight: 600, marginTop: 2 }}>{selectedPod.podPhotoUrl}</div>
                  </div>
                )}
                {selectedPod.signedPodUrl && (
                  <div style={{ background: 'var(--panel-2)', padding: 10, borderRadius: 8, fontSize: 12, border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--text-2)', fontSize: 10, fontWeight: 700 }}>SIGNED CONSIGNEE POD</div>
                    <div style={{ color: 'var(--text-1)', fontWeight: 600, marginTop: 2 }}>{selectedPod.signedPodUrl}</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: 'var(--panel-2)', padding: 12, borderRadius: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 700 }}>DELIVERY REMARKS</div>
              <div style={{ fontSize: 13, color: 'var(--text-1)', marginTop: 2 }}>{selectedPod.remarks}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="driver-btn-secondary" onClick={() => setSelectedPod(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showSubmitModal && (
        <div className="driver-modal-overlay">
          <div className="driver-modal" style={{ maxWidth: 640 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Upload color="var(--green)" size={22} />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Submit Electronic Proof of Delivery</h3>
              </div>
              <button onClick={() => setShowSubmitModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitPod}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="driver-form-group">
                  <label>Trip Number</label>
                  <input type="text" value={tripId} onChange={(e) => setTripId(e.target.value)} required />
                </div>
                <div className="driver-form-group">
                  <label>Customer Name</label>
                  <input type="text" value={customer} onChange={(e) => setCustomer(e.target.value)} required />
                </div>
              </div>

              <div style={{ background: 'var(--panel-2)', padding: 14, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)', marginBottom: 10, textTransform: 'uppercase' }}>
                  Document Uploads
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
                  <button
                    type="button"
                    className="driver-btn-secondary"
                    onClick={() => setPodPhoto('scanned-lr-pod.pdf')}
                    style={{ fontSize: 11, flexDirection: 'column', gap: 4, padding: 12 }}
                  >
                    <Camera size={18} color="var(--green)" />
                    <span>{podPhoto ? 'POD Photo Attached ✓' : 'Upload POD Photo'}</span>
                  </button>

                  <button
                    type="button"
                    className="driver-btn-secondary"
                    onClick={() => setSignedPod('customer-sign-seal.png')}
                    style={{ fontSize: 11, flexDirection: 'column', gap: 4, padding: 12 }}
                  >
                    <PenTool size={18} color="#3B82F6" />
                    <span>{signedPod ? 'Signed POD Attached ✓' : 'Upload Signed Copy'}</span>
                  </button>

                  <button
                    type="button"
                    className="driver-btn-secondary"
                    onClick={() => setDeliveryDoc('gate-in-out-pass.pdf')}
                    style={{ fontSize: 11, flexDirection: 'column', gap: 4, padding: 12 }}
                  >
                    <FileText size={18} color="var(--amber)" />
                    <span>{deliveryDoc ? 'Delivery Doc Attached ✓' : 'Upload Gate Pass'}</span>
                  </button>
                </div>
              </div>

              <div className="driver-form-group">
                <label>Delivery Exception Flag (if any)</label>
                <select value={exceptionType} onChange={(e) => setExceptionType(e.target.value as any)}>
                  <option value="None">None (Clean Delivery)</option>
                  <option value="Damage">Cargo Damage Claimed</option>
                  <option value="Short Delivery">Shortage / Missing Cartons</option>
                  <option value="Refused Delivery">Customer Refused Delivery</option>
                </select>
              </div>

              <div className="driver-form-group">
                <label>Consignee Remarks & Notes</label>
                <textarea
                  rows={2}
                  placeholder="Enter receiver name, gate entry details or exception notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Cargo Unloading Evidence Photos</label>
                  <button type="button" className="driver-btn-secondary" onClick={handleAddEvidencePhoto} style={{ padding: '4px 8px', fontSize: 11 }}>
                    + Add Photo
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {evidencePhotos.map((photo, i) => (
                    <span key={i} style={{ background: 'var(--panel-2)', padding: '4px 8px', borderRadius: 6, fontSize: 11, color: 'var(--green)', border: '1px solid var(--border)' }}>
                      📷 {photo}
                    </span>
                  ))}
                  {evidencePhotos.length === 0 && <span style={{ fontSize: 11, color: 'var(--text-2)' }}>No additional evidence photos added.</span>}
                </div>
              </div>

              <div style={{ background: 'var(--green-glow, rgba(46, 204, 113, 0.08))', padding: 10, borderRadius: 8, border: '1px solid var(--green)', marginBottom: 20, fontSize: 11, color: 'var(--text-2)' }}>
                <div style={{ fontWeight: 700, color: 'var(--green)', marginBottom: 2 }}>⚡ AUTOMATIC SYSTEM CAPTURE</div>
                <div>Timestamp: <strong style={{ color: 'var(--text-1)' }}>Auto-stamped on Submit</strong></div>
                <div>Geo Location: <strong style={{ color: 'var(--text-1)' }}>Captured via Device GPS</strong></div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="driver-btn-secondary" onClick={() => setShowSubmitModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="driver-btn-primary">
                  <CheckCircle size={16} /> Submit ePOD Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
