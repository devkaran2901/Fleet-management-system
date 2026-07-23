import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Plus,
  Search,
  FileText,
  Navigation,
  Trash2,
  Upload,
} from 'lucide-react';
import { initialVehicles } from './vendorDataStore';
import type { Vehicle } from './vendorDataStore';
import '../../styles/vendor.css';

export const FleetList: React.FC = () => {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Valid' | 'Expiring Soon' | 'Expired'>('ALL');

  // Add Vehicle Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReg, setNewReg] = useState('');
  const [newType, setNewType] = useState('32 FT Multi-Axle Container');
  const [newCapacity, setNewCapacity] = useState('18 MT');
  const [newModel, setNewModel] = useState('Tata Signa 2823 (2024)');

  const handleAddVehicle = () => {
    if (!newReg) {
      alert('Please enter vehicle registration number.');
      return;
    }
    const created: Vehicle = {
      id: `V-0${vehicles.length + 1}`,
      registrationNumber: newReg.toUpperCase(),
      vehicleType: newType,
      capacity: newCapacity,
      model: newModel,
      fitnessExpiry: '2028-01-01',
      permitExpiry: '2028-01-01',
      insuranceExpiry: '2027-01-01',
      pucExpiry: '2027-01-01',
      ais140Status: 'ACTIVE',
      overallStatus: 'Valid',
      documents: {
        rc: 'Valid',
        insurance: 'Valid',
        fitness: 'Valid',
        permit: 'Valid',
        tax: 'Valid',
        puc: 'Valid',
        ais140Cert: 'Valid',
      },
    };
    setVehicles([created, ...vehicles]);
    setShowAddModal(false);
    setNewReg('');
    alert(`Vehicle ${created.registrationNumber} added to fleet!`);
  };

  const handleRemove = (id: string, reg: string) => {
    if (window.confirm(`Are you sure you want to remove vehicle ${reg} from fleet?`)) {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vehicleType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || v.overallStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="vp-fleet-list" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="vp-page-header">
        <div>
          <div className="vp-page-title">
            <Truck color="var(--vendor-accent)" /> My Fleet & Documents (UI Spec V-03)
          </div>
          <div className="vp-page-subtitle">
            Manage your fleet registry, track document compliance (RC, Insurance, Fitness, Permit, PUC, AIS-140), and monitor T-30/T-15/T-7 expiry alerts.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="vp-btn vp-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add New Vehicle
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-3)' }} />
          <input
            type="text"
            placeholder="Search vehicle number, type, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="vp-input"
            style={{ paddingLeft: 36, width: 300 }}
          />
        </div>

        <div className="vp-tabs" style={{ marginBottom: 0 }}>
          <button className={`vp-tab ${statusFilter === 'ALL' ? 'active' : ''}`} onClick={() => setStatusFilter('ALL')}>
            All Vehicles ({vehicles.length})
          </button>
          <button className={`vp-tab ${statusFilter === 'Valid' ? 'active' : ''}`} onClick={() => setStatusFilter('Valid')}>
            Valid ({vehicles.filter((v) => v.overallStatus === 'Valid').length})
          </button>
          <button className={`vp-tab ${statusFilter === 'Expiring Soon' ? 'active' : ''}`} onClick={() => setStatusFilter('Expiring Soon')}>
            Expiring Soon ({vehicles.filter((v) => v.overallStatus === 'Expiring Soon').length})
          </button>
          <button className={`vp-tab ${statusFilter === 'Expired' ? 'active' : ''}`} onClick={() => setStatusFilter('Expired')}>
            Expired Alert ({vehicles.filter((v) => v.overallStatus === 'Expired').length})
          </button>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="vp-grid-2">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="vp-card"
            style={{
              border: vehicle.overallStatus === 'Expired'
                ? '1px solid rgba(239, 68, 68, 0.4)'
                : vehicle.overallStatus === 'Expiring Soon'
                ? '1px solid rgba(245, 158, 11, 0.4)'
                : '1px solid var(--border-soft)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'JetBrains Mono' }}>
                    {vehicle.registrationNumber}
                  </span>
                  {vehicle.overallStatus === 'Valid' && <span className="vp-badge vp-badge-success">VALID & READY</span>}
                  {vehicle.overallStatus === 'Expiring Soon' && <span className="vp-badge vp-badge-warning">T-15 EXPIRY ALERT</span>}
                  {vehicle.overallStatus === 'Expired' && <span className="vp-badge vp-badge-danger">EXPIRED / HOLD</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                  {vehicle.model} • {vehicle.vehicleType}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="vp-badge vp-badge-purple" style={{ fontSize: 10 }}>
                  <Navigation size={10} /> AIS-140 GPS: {vehicle.ais140Status}
                </span>
              </div>
            </div>

            {/* Document Badges Matrix */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
                background: 'var(--panel-2)',
                padding: 12,
                borderRadius: 10,
                border: '1px solid var(--border-soft)',
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>RC DOC</div>
                <span className={`vp-badge ${vehicle.documents.rc === 'Valid' ? 'vp-badge-success' : 'vp-badge-danger'}`} style={{ fontSize: 9, padding: '2px 6px' }}>
                  {vehicle.documents.rc}
                </span>
              </div>

              <div>
                <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>INSURANCE</div>
                <span className={`vp-badge ${vehicle.documents.insurance === 'Valid' ? 'vp-badge-success' : vehicle.documents.insurance === 'Expiring Soon' ? 'vp-badge-warning' : 'vp-badge-danger'}`} style={{ fontSize: 9, padding: '2px 6px' }}>
                  {vehicle.documents.insurance}
                </span>
              </div>

              <div>
                <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>FITNESS</div>
                <span className={`vp-badge ${vehicle.documents.fitness === 'Valid' ? 'vp-badge-success' : 'vp-badge-warning'}`} style={{ fontSize: 9, padding: '2px 6px' }}>
                  {vehicle.documents.fitness}
                </span>
              </div>

              <div>
                <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>PUC CERT</div>
                <span className={`vp-badge ${vehicle.documents.puc === 'Valid' ? 'vp-badge-success' : 'vp-badge-warning'}`} style={{ fontSize: 9, padding: '2px 6px' }}>
                  {vehicle.documents.puc}
                </span>
              </div>
            </div>

            {/* Document Expiry Dates */}
            <div style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
              <div>Insurance Expiry: <strong style={{ color: vehicle.insuranceExpiry.includes('07-18') ? 'var(--vendor-danger)' : 'var(--text-1)' }}>{vehicle.insuranceExpiry}</strong></div>
              <div>Fitness Expiry: <strong>{vehicle.fitnessExpiry}</strong> | Permit Expiry: <strong>{vehicle.permitExpiry}</strong></div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                className="vp-btn vp-btn-secondary"
                style={{ padding: '6px 12px', fontSize: 12 }}
                onClick={() => navigate(`/vendor/fleet/documents?id=${vehicle.id}`)}
              >
                <Upload size={14} /> Upload & Manage Docs
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="adm-icon-btn"
                  onClick={() => navigate(`/vendor/fleet/${vehicle.id}`)}
                  title="View Specs & Telemetry"
                >
                  <FileText size={14} />
                </button>
                <button
                  className="adm-icon-btn"
                  onClick={() => handleRemove(vehicle.id, vehicle.registrationNumber)}
                  title="Remove vehicle"
                  style={{ color: 'var(--vendor-danger)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD VEHICLE MODAL */}
      {showAddModal && (
        <div className="vp-modal-overlay">
          <div className="vp-modal">
            <div className="vp-modal-header">
              <div className="vp-modal-title">Add Vehicle to Fleet</div>
              <button className="adm-icon-btn" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <div className="vp-form-group">
              <label className="vp-label">Registration Number (e.g. MH-12-AB-1234):</label>
              <input
                type="text"
                className="vp-input"
                placeholder="MH-12-AB-1234"
                value={newReg}
                onChange={(e) => setNewReg(e.target.value)}
              />
            </div>

            <div className="vp-form-group">
              <label className="vp-label">Vehicle Type:</label>
              <select
                className="vp-select"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              >
                <option value="32 FT Multi-Axle Container">32 FT Multi-Axle Container</option>
                <option value="32 FT Single Axle">32 FT Single Axle</option>
                <option value="24 FT Open Body">24 FT Open Body</option>
                <option value="40 FT Trailer">40 FT Trailer</option>
              </select>
            </div>

            <div className="vp-form-group">
              <label className="vp-label">Capacity (MT):</label>
              <input
                type="text"
                className="vp-input"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
              />
            </div>

            <div className="vp-form-group">
              <label className="vp-label">Vehicle Model & Year:</label>
              <input
                type="text"
                className="vp-input"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
              />
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="vp-btn vp-btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="vp-btn vp-btn-primary" onClick={handleAddVehicle}>
                Save Vehicle & Upload Docs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
