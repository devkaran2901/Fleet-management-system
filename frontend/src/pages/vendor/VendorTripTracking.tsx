import React, { useState, useEffect } from 'react';
import { Navigation, Truck, User, MapPin, Clock, Eye, Download, Phone } from 'lucide-react';
import '../../styles/vendor.css';

interface Trip {
  id: string;
  vehicle: string;
  driver: string;
  driverPhone: string;
  route: string;
  origin: string;
  destination: string;
  status: 'Active' | 'Completed';
  podStatus: 'Uploaded' | 'Pending';
  departureTime: string;
  estimatedArrival: string;
  currentLocation: string;
  completionPct: number;
  distanceKm: number;
  coveredKm: number;
}

const TRIPS: Trip[] = [
  {
    id: 'TRIP-4011',
    vehicle: 'KA-01-AB-1234',
    driver: 'Suresh Yadav',
    driverPhone: '+91 98220 11223',
    route: 'Bhiwandi -> Pune',
    origin: 'Bhiwandi Logistics Park, MH',
    destination: 'Chakan FC-02, Pune, MH',
    status: 'Active',
    podStatus: 'Pending',
    departureTime: 'Today, 09:30 AM',
    estimatedArrival: 'Today, 14:00 PM',
    currentLocation: 'Khopoli Toll (on NH-48)',
    completionPct: 52,
    distanceKm: 165,
    coveredKm: 86,
  },
  {
    id: 'TRIP-4012',
    vehicle: 'HR-26-DQ-7711',
    driver: 'Vijay Singh',
    driverPhone: '+91 97110 33445',
    route: 'Bengaluru -> Chennai',
    origin: 'Nelamangala Gateway FC, KA',
    destination: 'Sriperumbudur Hub, TN',
    status: 'Active',
    podStatus: 'Pending',
    departureTime: 'Today, 06:00 AM',
    estimatedArrival: 'Today, 20:00 PM',
    currentLocation: 'Krishnagiri Bypass (on NH-44)',
    completionPct: 71,
    distanceKm: 340,
    coveredKm: 241,
  },
  {
    id: 'TRIP-3998',
    vehicle: 'MH-12-PQ-9988',
    driver: 'Ramesh Kumar',
    driverPhone: '+91 98765 43210',
    route: 'Navi Mumbai -> Nagpur',
    origin: 'Taloja Industrial Area, MH',
    destination: 'Butibori Industrial Cluster, MH',
    status: 'Completed',
    podStatus: 'Uploaded',
    departureTime: '22nd July, 08:00 AM',
    estimatedArrival: '22nd July, 22:30 PM',
    currentLocation: 'Delivered',
    completionPct: 100,
    distanceKm: 700,
    coveredKm: 700,
  },
];

export const VendorTripTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Active' | 'Completed'>('Active');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [livePct, setLivePct] = useState<Record<string, number>>({});

  // Simulate live GPS progress update
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePct((prev) => {
        const updated = { ...prev };
        TRIPS.filter((t) => t.status === 'Active').forEach((t) => {
          const current = updated[t.id] ?? t.completionPct;
          if (current < 95) updated[t.id] = current + 0.1;
        });
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredTrips = TRIPS.filter((t) => t.status === activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="vp-page-header">
        <div>
          <div className="vp-page-title">
            <Navigation color="var(--vendor-accent)" /> Trip Tracking (Live GPS & POD)
          </div>
          <div className="vp-page-subtitle">
            Track active trips in real-time using AIS-140 telemetry. View trip timeline, driver info, and download POD documents.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--vendor-accent)', animation: 'vp-pulse-glow 2s infinite' }} />
          <span style={{ fontSize: 13, color: 'var(--vendor-accent)', fontWeight: 600 }}>
            {TRIPS.filter((t) => t.status === 'Active').length} Active Trips — AIS-140 Live
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="vp-tabs">
        <button className={`vp-tab ${activeTab === 'Active' ? 'active' : ''}`} onClick={() => setActiveTab('Active')}>
          Active Trips ({TRIPS.filter((t) => t.status === 'Active').length})
        </button>
        <button className={`vp-tab ${activeTab === 'Completed' ? 'active' : ''}`} onClick={() => setActiveTab('Completed')}>
          Completed Trips ({TRIPS.filter((t) => t.status === 'Completed').length})
        </button>
      </div>

      {/* Trip Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredTrips.map((trip) => {
          const pct = trip.status === 'Active' ? (livePct[trip.id] ?? trip.completionPct) : 100;

          return (
            <div key={trip.id} className="vp-card">
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)', fontFamily: 'JetBrains Mono' }}>{trip.id}</span>
                    {trip.status === 'Active' ? (
                      <span className="vp-badge vp-badge-success" style={{ animation: 'vp-pulse-glow 3s infinite' }}>
                        LIVE GPS
                      </span>
                    ) : (
                      <span className="vp-badge vp-badge-info">COMPLETED</span>
                    )}
                    {trip.podStatus === 'Uploaded' && (
                      <span className="vp-badge vp-badge-purple">POD READY</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>{trip.route}</div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="vp-btn vp-btn-secondary"
                    onClick={() => setSelectedTrip(trip)}
                  >
                    <Eye size={14} /> Trip Timeline
                  </button>
                  {trip.podStatus === 'Uploaded' && (
                    <button className="vp-btn vp-btn-primary">
                      <Download size={14} /> Download POD
                    </button>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, background: 'var(--panel-2)', padding: 14, borderRadius: 10, border: '1px solid var(--border-soft)', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}><Truck size={11} /> VEHICLE</div>
                  <div style={{ fontWeight: 700, fontFamily: 'JetBrains Mono', marginTop: 2 }}>{trip.vehicle}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}><User size={11} /> DRIVER</div>
                  <div style={{ fontWeight: 700, marginTop: 2 }}>{trip.driver}</div>
                  <a href={`tel:${trip.driverPhone}`} style={{ fontSize: 12, color: 'var(--vendor-accent)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', marginTop: 2 }}>
                    <Phone size={11} /> {trip.driverPhone}
                  </a>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> CURRENT LOCATION</div>
                  <div style={{ fontWeight: 700, marginTop: 2, color: 'var(--vendor-accent)' }}>{trip.currentLocation}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> ETA</div>
                  <div style={{ fontWeight: 700, marginTop: 2 }}>{trip.estimatedArrival}</div>
                </div>
              </div>

              {/* Live GPS Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{trip.origin}</span>
                  <span style={{ color: 'var(--vendor-accent)', fontWeight: 700 }}>{Math.round(pct)}% covered ({Math.round(pct * trip.distanceKm / 100)} / {trip.distanceKm} km)</span>
                  <span style={{ fontWeight: 600 }}>{trip.destination}</span>
                </div>
                <div style={{ width: '100%', height: 10, background: 'var(--panel-2)', borderRadius: 999, overflow: 'hidden', border: '1px solid var(--border-soft)' }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: trip.status === 'Active'
                        ? 'linear-gradient(90deg, var(--vendor-accent), #34d399)'
                        : 'var(--vendor-accent)',
                      borderRadius: 999,
                      transition: 'width 2s ease',
                      position: 'relative',
                    }}
                  >
                    {trip.status === 'Active' && (
                      <div style={{
                        position: 'absolute',
                        right: -6,
                        top: -3,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#fff',
                        border: '3px solid var(--vendor-accent)',
                        boxShadow: '0 0 8px rgba(16,185,129,0.5)',
                      }} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TRIP TIMELINE MODAL */}
      {selectedTrip && (
        <div className="vp-modal-overlay">
          <div className="vp-modal" style={{ maxWidth: 680 }}>
            <div className="vp-modal-header">
              <div className="vp-modal-title">Trip Timeline: {selectedTrip.id}</div>
              <button className="adm-icon-btn" onClick={() => setSelectedTrip(null)}>✕</button>
            </div>

            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>
              {selectedTrip.route} · {selectedTrip.vehicle} · Driver: {selectedTrip.driver}
            </div>

            {/* Timeline Events */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { event: 'Indent Accepted & Placement Created', time: 'Yesterday, 16:00', done: true },
                { event: 'Compliance Verified — Vehicle & Driver Cleared', time: 'Yesterday, 17:30', done: true },
                { event: `Truck Reported at Origin: ${selectedTrip.origin}`, time: selectedTrip.departureTime, done: true },
                { event: 'GPS Activated — Trip Started', time: selectedTrip.departureTime, done: true },
                { event: `Current Location: ${selectedTrip.currentLocation}`, time: 'Live', done: selectedTrip.status === 'Active' },
                { event: `Delivered at: ${selectedTrip.destination}`, time: selectedTrip.estimatedArrival, done: selectedTrip.status === 'Completed' },
                { event: 'POD Submitted by Driver', time: selectedTrip.status === 'Completed' ? 'Completed' : 'Pending', done: selectedTrip.podStatus === 'Uploaded' },
                { event: 'Bill Created & Submitted', time: selectedTrip.status === 'Completed' ? 'After delivery' : 'Pending', done: selectedTrip.status === 'Completed' },
              ].map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 14, paddingBottom: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: step.done ? 'var(--vendor-accent)' : 'var(--panel-2)',
                      border: `2px solid ${step.done ? 'var(--vendor-accent)' : 'var(--border-soft)'}`,
                      flexShrink: 0,
                    }} />
                    {idx < 7 && <div style={{ width: 1, height: 24, background: step.done ? 'var(--vendor-accent)' : 'var(--border-soft)', marginTop: 2 }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: step.done ? 600 : 400, color: step.done ? 'var(--text-1)' : 'var(--text-3)' }}>{step.event}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{step.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              {selectedTrip.podStatus === 'Uploaded' && (
                <button className="vp-btn vp-btn-primary"><Download size={14} /> Download POD</button>
              )}
              <button className="vp-btn vp-btn-secondary" onClick={() => setSelectedTrip(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
