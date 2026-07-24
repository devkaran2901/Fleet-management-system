import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Truck,
  Route,
  Phone,
  MapPin,
  Clock,
  Play,
  ClipboardCheck,
  ShieldAlert,
  Wallet,
  CheckCircle,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { initialTrips } from './driverDataStore';
import type { DriverDuty } from './driverDataStore';

interface DriverOutletContext {
  duty: DriverDuty;
  setDuty: React.Dispatch<React.SetStateAction<DriverDuty>>;
}

export const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const outletCtx = useOutletContext<DriverOutletContext>();
  const duty = outletCtx?.duty || {
    dutyId: 'DUTY-8842',
    vehicleNumber: 'MH-12-PQ-9021',
    vehicleType: '32FT Multi-Axle Container',
    route: 'Mumbai → Bengaluru',
    reportingLocation: 'Bhiwandi Hub Gate 4',
    reportingTime: '06:30 AM',
    dispatcherName: 'Ramesh Sharma',
    dispatcherContact: '+91 98201 44510',
    isOnDuty: true,
  };

  const currentTrip = initialTrips.find((t) => t.status !== 'Closed') || initialTrips[0];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text-1)' }}>Driver Control Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-2)' }}>
            Welcome back, Rajesh! Real-time duty status, current trip tracking & quick fleet operations.
          </p>
        </div>
        <button
          onClick={() => alert(duty.isOnDuty ? 'Ending duty...' : 'Starting duty...')}
          className={duty.isOnDuty ? 'driver-btn-secondary' : 'driver-btn-primary'}
          style={{
            background: duty.isOnDuty ? 'rgba(239, 68, 68, 0.15)' : 'var(--green)',
            borderColor: duty.isOnDuty ? 'var(--red)' : undefined,
            color: duty.isOnDuty ? 'var(--red)' : '#0B0D10',
          }}
        >
          {duty.isOnDuty ? (
            <>
              <Clock size={16} /> END DUTY
            </>
          ) : (
            <>
              <Play size={16} /> START DUTY
            </>
          )}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="driver-kpi-grid">
        <div className="driver-kpi-card">
          <div className="driver-kpi-label">Active Trips</div>
          <div className="driver-kpi-val" style={{ color: 'var(--green)' }}>
            1 Active
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-2)' }}>In Transit on NH-48</div>
        </div>

        <div className="driver-kpi-card">
          <div className="driver-kpi-label">Trips Completed (July)</div>
          <div className="driver-kpi-val" style={{ color: 'var(--text-1)' }}>
            14 Trips
          </div>
          <div style={{ fontSize: 11, color: 'var(--green)' }}>+2 vs Last Month</div>
        </div>

        <div className="driver-kpi-card">
          <div className="driver-kpi-label">KM Driven This Month</div>
          <div className="driver-kpi-val" style={{ color: 'var(--text-1)' }}>
            4,820 km
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Avg 344 km / day</div>
        </div>

        <div className="driver-kpi-card">
          <div className="driver-kpi-label">Driver Score</div>
          <div className="driver-kpi-val" style={{ color: 'var(--green)' }}>
            94 <span style={{ fontSize: 14, color: 'var(--text-2)' }}>/ 100</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--green)' }}>Top 5% Fleet Tier</div>
        </div>

        <div className="driver-kpi-card">
          <div className="driver-kpi-label">Safety Score</div>
          <div className="driver-kpi-val" style={{ color: '#3B82F6' }}>
            98%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-2)' }}>0 Violations (30 Days)</div>
        </div>

        <div className="driver-kpi-card">
          <div className="driver-kpi-label">Khata Balance</div>
          <div className="driver-kpi-val" style={{ color: 'var(--amber)' }}>
            ₹7,850
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Available Advance</div>
        </div>
      </div>

      {/* Main Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20, marginBottom: 20 }}>
        {/* Duty Card */}
        <div className="driver-card">
          <div className="driver-card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Truck color="var(--green)" size={18} /> CURRENT DUTY DETAILS
            </span>
            <span className={`driver-status-pill ${duty.isOnDuty ? 'active' : 'pending'}`}>
              {duty.isOnDuty ? 'ACTIVE ON DUTY' : 'OFF DUTY'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13 }}>
            <div style={{ background: 'var(--panel-2)', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>DUTY ID</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginTop: 2 }}>{duty.dutyId}</div>
            </div>

            <div style={{ background: 'var(--panel-2)', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>VEHICLE NUMBER</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green)', marginTop: 2 }}>{duty.vehicleNumber}</div>
            </div>

            <div style={{ background: 'var(--panel-2)', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>VEHICLE TYPE</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginTop: 2 }}>{duty.vehicleType}</div>
            </div>

            <div style={{ background: 'var(--panel-2)', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>REPORTING TIME</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginTop: 2 }}>{duty.reportingTime}</div>
            </div>
          </div>

          <div style={{ marginTop: 14, background: 'var(--panel-2)', padding: 12, borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, marginBottom: 4 }}>ASSIGNED ROUTE & LOCATION</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Route size={14} color="var(--green)" /> {duty.route}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={13} color="var(--amber)" /> Reporting: {duty.reportingLocation}
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--green-glow, rgba(46, 204, 113, 0.08))', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--green)' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>DISPATCHER CONTACT</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{duty.dispatcherName}</div>
            </div>
            <a
              href={`tel:${duty.dispatcherContact}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--green)',
                color: '#0B0D10',
                padding: '6px 12px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 12,
                textDecoration: 'none',
              }}
            >
              <Phone size={14} /> Call Dispatcher
            </a>
          </div>
        </div>

        {/* Current Trip Card */}
        <div className="driver-card">
          <div className="driver-card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Route color="#3B82F6" size={18} /> CURRENT ACTIVE TRIP
            </span>
            <span className="driver-status-pill in-transit">{currentTrip.status}</span>
          </div>

          <div style={{ background: 'var(--panel-2)', padding: 14, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>{currentTrip.tripNumber}</span>
              <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>ETA: {currentTrip.eta}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 12 }}>Customer: <strong style={{ color: 'var(--text-1)' }}>{currentTrip.customer}</strong></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 10, borderTop: '1px solid var(--border-soft)' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 700, textTransform: 'uppercase' }}>Pickup Location</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} color="var(--green)" /> {currentTrip.pickupLocation}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 700, textTransform: 'uppercase' }}>Delivery Location</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} color="var(--amber)" /> {currentTrip.deliveryLocation}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--panel-2)', padding: 12, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>TRIP EXECUTION TIMELINE</span>
              <span style={{ color: 'var(--green)' }}>Stage 6 of 9 (In Transit)</span>
            </div>
            <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: '66%', height: '100%', background: 'linear-gradient(90deg, var(--green), #3B82F6)', borderRadius: 3 }} />
            </div>
          </div>

          <button className="driver-btn-primary" style={{ width: '100%' }} onClick={() => navigate(`/driver/trips/${currentTrip.id}`)}>
            <ExternalLink size={16} /> Open Current Trip Details & Timeline
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="driver-card">
        <div className="driver-card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap color="var(--amber)" size={18} /> QUICK DRIVER ACTIONS
          </span>
        </div>

        <div className="driver-action-grid">
          <button className="driver-action-btn" onClick={() => alert('Duty Toggled')}>
            <Play size={22} color="var(--green)" />
            <span>Start / End Duty</span>
          </button>

          <button className="driver-action-btn" onClick={() => navigate(`/driver/trips/${currentTrip.id}`)}>
            <Route size={22} color="#3B82F6" />
            <span>Open Current Trip</span>
          </button>

          <button className="driver-action-btn" onClick={() => navigate('/driver/inspections')}>
            <ClipboardCheck size={22} color="var(--green)" />
            <span>Submit Inspection</span>
          </button>

          <button className="driver-action-btn" onClick={() => navigate('/driver/epod')}>
            <CheckCircle size={22} color="var(--green)" />
            <span>Upload ePOD</span>
          </button>

          <button className="driver-action-btn" onClick={() => navigate('/driver/khata')}>
            <Wallet size={22} color="var(--amber)" />
            <span>View Khata Ledger</span>
          </button>

          <button className="driver-action-btn" onClick={() => navigate('/driver/sos')} style={{ borderColor: 'var(--red)', background: 'rgba(229, 72, 77, 0.1)', color: 'var(--red)' }}>
            <ShieldAlert size={22} color="var(--red)" />
            <span>Raise SOS Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
};
