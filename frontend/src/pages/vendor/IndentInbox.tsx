import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Inbox,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Search,
  ArrowRight,
  AlertTriangle,
  MapPin,
  Calendar,
} from 'lucide-react';
import { initialIndents, initialVehicles, initialDrivers } from './vendorDataStore';
import type { Indent } from './vendorDataStore';
import '../../styles/vendor.css';

export const IndentInbox: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [indents, setIndents] = useState<Indent[]>(initialIndents);
  const [activeTab, setActiveTab] = useState<'AWAITING' | 'ACCEPTED' | 'DECLINED' | 'ALL'>('AWAITING');
  const [searchQuery, setSearchQuery] = useState('');

  // Acceptance Modal state
  const [selectedIndentForAccept, setSelectedIndentForAccept] = useState<Indent | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [validationError, setValidationError] = useState('');

  // Detail Drawer state
  const [selectedIndentDetail, setSelectedIndentDetail] = useState<Indent | null>(null);

  // Auto-trigger modal if query param passed (e.g. ?accept=IND-9012)
  useEffect(() => {
    const acceptId = searchParams.get('accept');
    if (acceptId) {
      const found = indents.find((i) => i.id === acceptId);
      if (found) setSelectedIndentForAccept(found);
    }
  }, [searchParams, indents]);

  // Live timer tick effect
  useEffect(() => {
    const timer = setInterval(() => {
      setIndents((prev) =>
        prev.map((ind) => {
          if (ind.status === 'AWAITING' && ind.remainingSeconds > 0) {
            return { ...ind, remainingSeconds: ind.remainingSeconds - 1 };
          }
          return ind;
        }),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDecline = (indentId: string) => {
    if (window.confirm(`Are you sure you want to decline Indent ${indentId}?`)) {
      setIndents((prev) =>
        prev.map((i) => (i.id === indentId ? { ...i, status: 'DECLINED' } : i)),
      );
    }
  };

  const handleAcceptSubmit = () => {
    setValidationError('');

    if (!selectedVehicleId) {
      setValidationError('Please select a vehicle to allocate.');
      return;
    }
    if (!selectedDriverId) {
      setValidationError('Please select a driver to assign.');
      return;
    }

    const veh = initialVehicles.find((v) => v.id === selectedVehicleId);
    const drv = initialDrivers.find((d) => d.id === selectedDriverId);

    // Validation 1: Vehicle documents valid
    if (veh?.overallStatus === 'Expired') {
      setValidationError(`Cannot allocate vehicle ${veh.registrationNumber}: Insurance or fitness document is expired!`);
      return;
    }

    // Validation 2: Driver documents valid
    if (drv?.verificationStatus === 'Rejected') {
      setValidationError(`Cannot assign driver ${drv.name}: License/Identity document rejected!`);
      return;
    }

    // Validation 3: Vehicle not already allocated
    if (veh?.registrationNumber === 'MH-12-PQ-9988') {
      // simulate check
      // allowed if passes
    }

    // Mark as accepted
    if (selectedIndentForAccept) {
      setIndents((prev) =>
        prev.map((i) =>
          i.id === selectedIndentForAccept.id
            ? {
                ...i,
                status: 'ACCEPTED',
                assignedVehicle: veh?.registrationNumber,
                assignedDriver: drv?.name,
              }
            : i,
        ),
      );
      setSelectedIndentForAccept(null);
      alert(`Indent ${selectedIndentForAccept.id} successfully accepted! Placement created in Placement Tracker.`);
    }
  };

  const filteredIndents = indents.filter((ind) => {
    const matchesTab = activeTab === 'ALL' || ind.status === activeTab;
    const matchesQuery =
      ind.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.route.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  return (
    <div className="vp-indent-inbox" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="vp-page-header">
        <div>
          <div className="vp-page-title">
            <Inbox color="var(--vendor-accent)" /> Indent Inbox (UI Spec V-01)
          </div>
          <div className="vp-page-subtitle">
            Respond to freight indents from customers before acceptance countdown timer expires.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search Indent ID, Customer, Route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="vp-input"
              style={{ paddingLeft: 36, width: 280 }}
            />
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="vp-tabs">
        <button className={`vp-tab ${activeTab === 'AWAITING' ? 'active' : ''}`} onClick={() => setActiveTab('AWAITING')}>
          Awaiting Response ({indents.filter((i) => i.status === 'AWAITING').length})
        </button>
        <button className={`vp-tab ${activeTab === 'ACCEPTED' ? 'active' : ''}`} onClick={() => setActiveTab('ACCEPTED')}>
          Accepted Indents ({indents.filter((i) => i.status === 'ACCEPTED').length})
        </button>
        <button className={`vp-tab ${activeTab === 'DECLINED' ? 'active' : ''}`} onClick={() => setActiveTab('DECLINED')}>
          Declined / Expired
        </button>
        <button className={`vp-tab ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => setActiveTab('ALL')}>
          All Indents
        </button>
      </div>

      {/* Indent List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredIndents.map((indent) => (
          <div key={indent.id} className="vp-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Top Bar of Card */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'JetBrains Mono' }}>
                  {indent.id}
                </span>
                <span className="vp-badge vp-badge-info">{indent.customer}</span>

                {indent.status === 'AWAITING' && (
                  <div className="vp-timer-pill">
                    <Clock size={14} /> Countdown: {Math.floor(indent.remainingSeconds / 60)}m{' '}
                    {indent.remainingSeconds % 60}s
                  </div>
                )}

                {indent.status === 'ACCEPTED' && <span className="vp-badge vp-badge-success">ACCEPTED</span>}
                {indent.status === 'DECLINED' && <span className="vp-badge vp-badge-danger">DECLINED</span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--vendor-accent)' }}>
                  ₹{indent.expectedTripValue.toLocaleString()}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Est. Trip Value</span>
              </div>
            </div>

            {/* Middle Specs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                background: 'var(--panel-2)',
                padding: 16,
                borderRadius: 10,
                border: '1px solid var(--border-soft)',
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} color="var(--vendor-accent)" /> ROUTE DETAILS
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>
                  {indent.route}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                  Pickup: {indent.pickupLocation}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  Delivery: {indent.deliveryLocation}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Truck size={12} color="#3b82f6" /> VEHICLE & CAPACITY REQ.
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>
                  {indent.vehicleTypeRequired}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                  Payload Capacity: {indent.capacityRequired}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} color="#8b5cf6" /> REPORTING TIME
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>
                  {indent.reportingTime}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                {indent.status === 'ACCEPTED' && (
                  <div style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', gap: 16 }}>
                    <span>Allocated Vehicle: <strong>{indent.assignedVehicle}</strong></span>
                    <span>Assigned Driver: <strong>{indent.assignedDriver}</strong></span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="vp-btn vp-btn-secondary"
                  onClick={() => setSelectedIndentDetail(indent)}
                >
                  View Details
                </button>

                {indent.status === 'AWAITING' && (
                  <>
                    <button
                      className="vp-btn vp-btn-danger"
                      onClick={() => handleDecline(indent.id)}
                    >
                      <XCircle size={15} /> Decline
                    </button>
                    <button
                      className="vp-btn vp-btn-primary"
                      onClick={() => setSelectedIndentForAccept(indent)}
                    >
                      <CheckCircle size={15} /> Accept Indent
                    </button>
                  </>
                )}

                {indent.status === 'ACCEPTED' && (
                  <button
                    className="vp-btn vp-btn-primary"
                    onClick={() => navigate('/vendor/placements')}
                  >
                    Track Placement <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ACCEPT INDENT MODAL (WITH VEHICLE & DRIVER ALLOCATION + COMPLIANCE VALIDATIONS) */}
      {selectedIndentForAccept && (
        <div className="vp-modal-overlay">
          <div className="vp-modal">
            <div className="vp-modal-header">
              <div className="vp-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle color="var(--vendor-accent)" /> Accept Indent: {selectedIndentForAccept.id}
              </div>
              <button
                className="adm-icon-btn"
                onClick={() => setSelectedIndentForAccept(null)}
              >
                ✕
              </button>
            </div>

            {validationError && (
              <div
                style={{
                  background: 'var(--vendor-danger-light)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: 12,
                  borderRadius: 8,
                  color: 'var(--vendor-danger)',
                  fontSize: 13,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertTriangle size={18} /> {validationError}
              </div>
            )}

            <div style={{ marginBottom: 16, background: 'var(--panel-2)', padding: 12, borderRadius: 8, fontSize: 13 }}>
              <div>Customer: <strong>{selectedIndentForAccept.customer}</strong></div>
              <div>Route: <strong>{selectedIndentForAccept.route}</strong></div>
              <div>Requirement: <strong>{selectedIndentForAccept.vehicleTypeRequired}</strong></div>
            </div>

            <div className="vp-form-group">
              <label className="vp-label">
                Select Vehicle (Must pass document & compliance check):
              </label>
              <select
                className="vp-select"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
              >
                <option value="">-- Choose Vehicle from Fleet --</option>
                {initialVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} - {v.vehicleType} ({v.overallStatus === 'Expired' ? '⚠️ EXPIRED DOCUMENTS' : '✅ Compliant'})
                  </option>
                ))}
              </select>
            </div>

            <div className="vp-form-group">
              <label className="vp-label">
                Select Driver (DL & Verification Validated):
              </label>
              <select
                className="vp-select"
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
              >
                <option value="">-- Choose Driver --</option>
                {initialDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} (DL: {d.licenseNumber}) - {d.verificationStatus === 'Rejected' ? '❌ REJECTED' : '✅ Verified'}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                className="vp-btn vp-btn-secondary"
                onClick={() => setSelectedIndentForAccept(null)}
              >
                Cancel
              </button>
              <button className="vp-btn vp-btn-primary" onClick={handleAcceptSubmit}>
                Confirm Acceptance & Placement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INDENT DETAIL DRAWER / MODAL */}
      {selectedIndentDetail && (
        <div className="vp-modal-overlay">
          <div className="vp-modal">
            <div className="vp-modal-header">
              <div className="vp-modal-title">Indent Specification: {selectedIndentDetail.id}</div>
              <button className="adm-icon-btn" onClick={() => setSelectedIndentDetail(null)}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13 }}>
              <div>
                <span style={{ color: 'var(--text-3)' }}>Customer Name:</span>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>{selectedIndentDetail.customer}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--panel-2)', padding: 14, borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>PICKUP ADDRESS</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{selectedIndentDetail.pickupLocation}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>DELIVERY ADDRESS</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{selectedIndentDetail.deliveryLocation}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span style={{ color: 'var(--text-3)' }}>Required Vehicle Type:</span>
                  <div style={{ fontWeight: 600 }}>{selectedIndentDetail.vehicleTypeRequired}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-3)' }}>Capacity Needed:</span>
                  <div style={{ fontWeight: 600 }}>{selectedIndentDetail.capacityRequired}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-3)' }}>Reporting Deadline:</span>
                  <div style={{ fontWeight: 600 }}>{selectedIndentDetail.reportingTime}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-3)' }}>Expected Value:</span>
                  <div style={{ fontWeight: 700, color: 'var(--vendor-accent)' }}>₹{selectedIndentDetail.expectedTripValue.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <button className="vp-btn vp-btn-secondary" onClick={() => setSelectedIndentDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
