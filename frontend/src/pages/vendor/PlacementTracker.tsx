import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Upload,
  RefreshCw,
  Truck,
  User,
  ShieldAlert,
} from 'lucide-react';
import { initialPlacements, initialVehicles, initialDrivers } from './vendorDataStore';
import type { Placement } from './vendorDataStore';
import '../../styles/vendor.css';

const STATUS_STEPS = [
  'Indent Received',
  'Accepted',
  'Vehicle Assigned',
  'Driver Assigned',
  'Compliance Verification',
  'Approved',
  'Reported',
  'Trip Started',
  'Delivered',
  'Closed',
];

export const PlacementTracker: React.FC = () => {
  const [placements, setPlacements] = useState<Placement[]>(initialPlacements);

  // Fix-It Modal state
  const [activeFixItPlacement, setActiveFixItPlacement] = useState<Placement | null>(null);
  const [uploadedDocFile, setUploadedDocFile] = useState<File | null>(null);
  const [fixItSubmitting, setFixItSubmitting] = useState(false);

  // Vehicle/Driver Replacement Modal state
  const [replacementPlacement, setReplacementPlacement] = useState<Placement | null>(null);
  const [newVehicleNumber, setNewVehicleNumber] = useState('');
  const [newDriverName, setNewDriverName] = useState('');

  const handleFixItSubmit = () => {
    if (!uploadedDocFile) {
      alert('Please select a document file to upload.');
      return;
    }
    setFixItSubmitting(true);
    setTimeout(() => {
      setPlacements((prev) =>
        prev.map((p) =>
          p.id === activeFixItPlacement?.id
            ? {
                ...p,
                status: 'Approved',
                documentStatus: 'Valid',
                complianceHold: false,
                rejectionReason: undefined,
                missingDocumentName: undefined,
              }
            : p,
        ),
      );
      setFixItSubmitting(false);
      setActiveFixItPlacement(null);
      alert(`Corrected ${activeFixItPlacement?.missingDocumentName} uploaded & verified successfully! Compliance hold released.`);
    }, 800);
  };

  const handleReplacementSubmit = () => {
    if (!newVehicleNumber && !newDriverName) {
      alert('Please specify a new vehicle or driver.');
      return;
    }
    setPlacements((prev) =>
      prev.map((p) =>
        p.id === replacementPlacement?.id
          ? {
              ...p,
              vehicleNumber: newVehicleNumber || p.vehicleNumber,
              driverName: newDriverName || p.driverName,
            }
          : p,
      ),
    );
    setReplacementPlacement(null);
    alert('Resource replacement updated!');
  };

  return (
    <div className="vp-placement-tracker" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="vp-page-header">
        <div>
          <div className="vp-page-title">
            <CheckCircle color="var(--vendor-accent)" /> Placement Tracker
          </div>
          <div className="vp-page-subtitle">
            Track every accepted indent through the 10-stage lifecycle, resolve compliance holds, and handle vehicle/driver replacements.
          </div>
        </div>
      </div>

      {/* Placement Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {placements.map((placement) => {
          const currentStepIndex = STATUS_STEPS.indexOf(placement.status);

          return (
            <div
              key={placement.id}
              className="vp-card"
              style={{
                border: placement.complianceHold
                  ? '1px solid rgba(239, 68, 68, 0.4)'
                  : '1px solid var(--border-soft)',
              }}
            >
              {/* Top Banner of Card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'JetBrains Mono' }}>
                      {placement.id}
                    </span>
                    <span className="vp-badge vp-badge-purple">Indent: {placement.indentId}</span>
                    <span className="vp-badge vp-badge-info">{placement.customer}</span>

                    {placement.complianceHold ? (
                      <span className="vp-badge vp-badge-danger">
                        <AlertTriangle size={12} /> COMPLIANCE HOLD
                      </span>
                    ) : (
                      <span className="vp-badge vp-badge-success">COMPLIANT</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>
                    Route: {placement.route}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="vp-btn vp-btn-secondary"
                    onClick={() => setReplacementPlacement(placement)}
                  >
                    <RefreshCw size={14} /> Replace Vehicle / Driver
                  </button>

                  {placement.complianceHold && (
                    <button
                      className="vp-btn vp-btn-danger"
                      onClick={() => setActiveFixItPlacement(placement)}
                    >
                      <Upload size={14} /> Launch Fix-It Workflow
                    </button>
                  )}
                </div>
              </div>

              {/* 10-STEP STATUS FLOW STEPPER */}
              <div className="vp-timeline">
                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStepIndex;
                  const isActive = idx === currentStepIndex;
                  const isRejected = isActive && placement.complianceHold;

                  return (
                    <div
                      key={step}
                      className={`vp-timeline-step ${
                        isRejected ? 'rejected' : isCompleted ? 'completed' : isActive ? 'active' : ''
                      }`}
                    >
                      <div className="vp-timeline-circle">
                        {isRejected ? '!' : isCompleted ? '✓' : idx + 1}
                      </div>
                      <div className="vp-timeline-label">{step}</div>
                    </div>
                  );
                })}
              </div>

              {/* Fix-It Workflow Warning Alert Box if Hold */}
              {placement.complianceHold && (
                <div
                  style={{
                    background: 'var(--vendor-danger-light)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: 14,
                    borderRadius: 10,
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <ShieldAlert size={20} color="var(--vendor-danger)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--vendor-danger)' }}>
                        Fix-It Action Required: {placement.missingDocumentName} Expired
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-1)', marginTop: 2 }}>
                        Rejection Reason: {placement.rejectionReason}
                      </div>
                    </div>
                  </div>

                  <button
                    className="vp-btn vp-btn-primary"
                    style={{ background: 'var(--vendor-danger)', borderColor: 'var(--vendor-danger)' }}
                    onClick={() => setActiveFixItPlacement(placement)}
                  >
                    Upload Corrected Document
                  </button>
                </div>
              )}

              {/* Resource Details Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 16,
                  background: 'var(--panel-2)',
                  padding: 16,
                  borderRadius: 10,
                  border: '1px solid var(--border-soft)',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Truck size={12} color="var(--vendor-accent)" /> VEHICLE DETAILS
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>
                    {placement.vehicleNumber}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                    Status: {placement.documentStatus}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User size={12} color="#3b82f6" /> DRIVER DETAILS
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>
                    {placement.driverName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                    Phone: {placement.driverPhone}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color="#8b5cf6" /> REPORTING SCHEDULE
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>
                    {placement.reportingTime}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FIX-IT WORKFLOW MODAL */}
      {activeFixItPlacement && (
        <div className="vp-modal-overlay">
          <div className="vp-modal">
            <div className="vp-modal-header">
              <div className="vp-modal-title" style={{ color: 'var(--vendor-danger)' }}>
                Fix-It Workflow: Document Re-submission
              </div>
              <button className="adm-icon-btn" onClick={() => setActiveFixItPlacement(null)}>
                ✕
              </button>
            </div>

            <div style={{ background: 'var(--vendor-danger-light)', padding: 14, borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--vendor-danger)' }}>
                Rejection Reason:
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-1)', marginTop: 4 }}>
                {activeFixItPlacement.rejectionReason}
              </div>
            </div>

            <div className="vp-form-group">
              <label className="vp-label">
                Upload Corrected {activeFixItPlacement.missingDocumentName}:
              </label>
              <div
                style={{
                  border: '2px dashed var(--border-soft)',
                  borderRadius: 10,
                  padding: 24,
                  textAlign: 'center',
                  background: 'var(--panel-2)',
                  cursor: 'pointer',
                }}
              >
                <Upload size={32} color="var(--vendor-accent)" style={{ margin: '0 auto 8px' }} />
                <input
                  type="file"
                  onChange={(e) => setUploadedDocFile(e.target.files?.[0] || null)}
                  style={{ display: 'block', margin: '0 auto', fontSize: 12 }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
                  Supported formats: PDF, JPG, PNG (Max 5MB)
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="vp-btn vp-btn-secondary" onClick={() => setActiveFixItPlacement(null)}>
                Cancel
              </button>
              <button
                className="vp-btn vp-btn-primary"
                onClick={handleFixItSubmit}
                disabled={fixItSubmitting}
              >
                {fixItSubmitting ? 'Uploading & Verifying...' : 'Re-submit Document for Verification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOURCE REPLACEMENT MODAL */}
      {replacementPlacement && (
        <div className="vp-modal-overlay">
          <div className="vp-modal">
            <div className="vp-modal-header">
              <div className="vp-modal-title">Replace Vehicle / Driver for {replacementPlacement.id}</div>
              <button className="adm-icon-btn" onClick={() => setReplacementPlacement(null)}>
                ✕
              </button>
            </div>

            <div className="vp-form-group">
              <label className="vp-label">New Vehicle Number (Optional):</label>
              <select
                className="vp-select"
                value={newVehicleNumber}
                onChange={(e) => setNewVehicleNumber(e.target.value)}
              >
                <option value="">-- Keep Current ({replacementPlacement.vehicleNumber}) --</option>
                {initialVehicles
                  .filter((v) => v.overallStatus === 'Valid')
                  .map((v) => (
                    <option key={v.id} value={v.registrationNumber}>
                      {v.registrationNumber} ({v.vehicleType})
                    </option>
                  ))}
              </select>
            </div>

            <div className="vp-form-group">
              <label className="vp-label">New Driver Name (Optional):</label>
              <select
                className="vp-select"
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
              >
                <option value="">-- Keep Current ({replacementPlacement.driverName}) --</option>
                {initialDrivers
                  .filter((d) => d.verificationStatus === 'Verified')
                  .map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.phone})
                    </option>
                  ))}
              </select>
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="vp-btn vp-btn-secondary" onClick={() => setReplacementPlacement(null)}>
                Cancel
              </button>
              <button className="vp-btn vp-btn-primary" onClick={handleReplacementSubmit}>
                Confirm Resource Replacement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
