import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Truck, ArrowLeft, Upload } from 'lucide-react';
import { initialVehicles } from './vendorDataStore';
import '../../styles/vendor.css';

export const VehicleDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const vehicle = initialVehicles.find((v) => v.id === id) || initialVehicles[0];

  return (
    <div className="vp-vehicle-details" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
            <Truck color="var(--vendor-accent)" /> Vehicle Profile: {vehicle.registrationNumber}
          </div>
          <div className="vp-page-subtitle">
            {vehicle.model} • {vehicle.vehicleType} ({vehicle.capacity})
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="vp-btn vp-btn-primary"
            onClick={() => navigate(`/vendor/fleet/documents?id=${vehicle.id}`)}
          >
            <Upload size={16} /> Manage Documents
          </button>
        </div>
      </div>

      {/* Grid Overview */}
      <div className="vp-grid-3">
        <div className="vp-card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Technical Specifications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div>Reg Number: <strong>{vehicle.registrationNumber}</strong></div>
            <div>Model: <strong>{vehicle.model}</strong></div>
            <div>Type: <strong>{vehicle.vehicleType}</strong></div>
            <div>Capacity: <strong>{vehicle.capacity}</strong></div>
          </div>
        </div>

        <div className="vp-card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>AIS-140 GPS Device</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div>GPS Status: <span className="vp-badge vp-badge-success">{vehicle.ais140Status}</span></div>
            <div>Manufacturer: <strong>Rosmerta Telematics</strong></div>
            <div>IMEI: <strong>869201994821049</strong></div>
            <div>Emergency Panic Button: <span style={{ color: 'var(--vendor-accent)', fontWeight: 600 }}>Active</span></div>
          </div>
        </div>

        <div className="vp-card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Compliance Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div>Overall State: <span className={`vp-badge ${vehicle.overallStatus === 'Valid' ? 'vp-badge-success' : 'vp-badge-danger'}`}>{vehicle.overallStatus}</span></div>
            <div>Insurance Expiry: <strong style={{ color: vehicle.insuranceExpiry.includes('07-18') ? 'var(--vendor-danger)' : 'var(--text-1)' }}>{vehicle.insuranceExpiry}</strong></div>
            <div>Fitness Expiry: <strong>{vehicle.fitnessExpiry}</strong></div>
            <div>Permit Expiry: <strong>{vehicle.permitExpiry}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};
