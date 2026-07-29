import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Gauge, Fuel, ShieldAlert, Radio, RefreshCw, Eye, Truck, User } from 'lucide-react';
import type { LiveVehicleTelemetry } from '../../services/adminApi';

const DEFAULT_VEHICLES: LiveVehicleTelemetry[] = [
  {
    id: 'v-101',
    vehicleNumber: 'DL 01 AB 1234',
    category: 'Owned',
    status: 'In Transit',
    driverName: 'Rajesh Kumar',
    currentLocation: 'NH-48, near Gurugram Toll',
    lat: 28.4595,
    lng: 77.0266,
    speedKmH: 64,
    fuelLevel: 78,
    batteryLevel: 94,
    lastPing: '30s ago',
    destination: 'Jaipur Logistics Hub',
    site: 'Delhi Depot',
  },
  {
    id: 'v-102',
    vehicleNumber: 'MH 04 CD 5678',
    category: 'Vendor',
    status: 'Available',
    driverName: 'Vikram Singh',
    currentLocation: 'Bhiwandi Hub Gate 2',
    lat: 19.2812,
    lng: 73.0482,
    speedKmH: 0,
    fuelLevel: 88,
    batteryLevel: 99,
    lastPing: '1m ago',
    destination: 'Idle / Unassigned',
    site: 'Mumbai Port Hub',
  },
  {
    id: 'v-103',
    vehicleNumber: 'KA 03 EF 9012',
    category: 'Owned',
    status: 'In Transit',
    driverName: 'Anil Reddy',
    currentLocation: 'Electronic City Flyover, Bengaluru',
    lat: 12.8452,
    lng: 77.6602,
    speedKmH: 52,
    fuelLevel: 45,
    batteryLevel: 82,
    lastPing: '15s ago',
    destination: 'Chennai Container Terminal',
    site: 'Bangalore Depot',
  },
  {
    id: 'v-104',
    vehicleNumber: 'HR 55 GH 3456',
    category: 'Owned',
    status: 'Maintenance',
    driverName: 'Suresh Verma',
    currentLocation: 'Workshop Bay 3, Delhi Depot',
    lat: 28.6139,
    lng: 77.2090,
    speedKmH: 0,
    fuelLevel: 30,
    batteryLevel: 65,
    lastPing: '5m ago',
    destination: 'Service Maintenance',
    site: 'Delhi Depot',
  },
  {
    id: 'v-105',
    vehicleNumber: 'WB 02 JK 7890',
    category: 'Vendor',
    status: 'Blocked',
    driverName: 'Pradeep Das',
    currentLocation: 'Dankuni Checkpost, Kolkata',
    lat: 22.6854,
    lng: 88.2974,
    speedKmH: 0,
    fuelLevel: 60,
    batteryLevel: 40,
    lastPing: '12m ago',
    destination: 'Blocked - Expired PUC',
    site: 'Kolkata Depot',
  },
  {
    id: 'v-106',
    vehicleNumber: 'GJ 01 LM 4321',
    category: 'Vendor',
    status: 'In Transit',
    driverName: 'Mukesh Patel',
    currentLocation: 'Ahmedabad Expressway KM 45',
    lat: 23.0225,
    lng: 72.5714,
    speedKmH: 71,
    fuelLevel: 82,
    batteryLevel: 98,
    lastPing: '10s ago',
    destination: 'Vadodara Industrial Depot',
    site: 'Gujarat West Hub',
  },
];

export const LiveFleetMap: React.FC = () => {
  const [vehicles, setVehicles] = useState<LiveVehicleTelemetry[]>(DEFAULT_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState<LiveVehicleTelemetry | null>(DEFAULT_VEHICLES[0]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Simulate periodic GPS pings
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.status === 'In Transit') {
            const speedDelta = Math.floor(Math.random() * 7) - 3;
            const newSpeed = Math.max(30, Math.min(85, v.speedKmH + speedDelta));
            return {
              ...v,
              speedKmH: newSpeed,
              lastPing: 'just now',
            };
          }
          return v;
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredVehicles = vehicles.filter((v) => {
    if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && v.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        v.vehicleNumber.toLowerCase().includes(q) ||
        v.driverName.toLowerCase().includes(q) ||
        v.currentLocation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Transit':
        return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.4)' };
      case 'Available':
        return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.4)' };
      case 'Maintenance':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.4)' };
      case 'Blocked':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.4)' };
      default:
        return { bg: 'var(--panel-2)', color: 'var(--text-2)', border: 'var(--border-soft)' };
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--panel-1)',
        border: '1px solid var(--border-soft)',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Map Header & Controls */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-soft)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          backgroundColor: 'var(--panel-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <Radio size={18} color="var(--green)" className="pulsing-icon" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>
              Live Telemetry Fleet Map
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-3)' }}>
              Real-time vehicle tracking, speed telemetry & geofence monitor
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search vehicle / driver / location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid var(--border-soft)',
              backgroundColor: 'var(--panel-1)',
              color: 'var(--text-1)',
              outline: 'none',
              width: 200,
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid var(--border-soft)',
              backgroundColor: 'var(--panel-1)',
              color: 'var(--text-1)',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="In Transit">In Transit</option>
            <option value="Available">Available</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Blocked">Blocked</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid var(--border-soft)',
              backgroundColor: 'var(--panel-1)',
              color: 'var(--text-1)',
            }}
          >
            <option value="ALL">All Fleets</option>
            <option value="Owned">Owned Fleet</option>
            <option value="Vendor">Vendor Fleet</option>
          </select>

          <button
            onClick={handleRefresh}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid var(--border-soft)',
              backgroundColor: 'var(--panel-1)',
              color: 'var(--text-1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin' : ''} />
            <span>Ping</span>
          </button>
        </div>
      </div>

      {/* Map Layout Grid: Map View Left, Vehicle Telemetry Detail Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', minHeight: 420 }}>
        {/* Interactive Vector / Tile Simulation Canvas */}
        <div
          style={{
            position: 'relative',
            backgroundColor: '#121824',
            backgroundImage:
              'radial-gradient(#1e293b 1px, transparent 1px), radial-gradient(#1e293b 1px, #0f172a 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 16,
          }}
        >
          {/* Map Overlay Badges */}
          <div style={{ display: 'flex', justifyContent: 'space-between', pointerEvents: 'none', zIndex: 5 }}>
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                pointerEvents: 'auto',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }} />
              GPS Live Stream Connected (India Corridor)
            </div>

            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                color: '#f8fafc',
                pointerEvents: 'auto',
              }}
            >
              Active Telemetry: <span style={{ color: '#38bdf8' }}>{filteredVehicles.length} vehicles</span>
            </div>
          </div>

          {/* Simulated Geofenced Hub Circles & Road Vectors */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {/* Major Corridor Lines */}
            <path d="M 120,80 L 260,180 L 450,280" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" fill="none" />
            <path d="M 450,280 L 620,340" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" fill="none" />
            <path d="M 260,180 L 320,380" stroke="#334155" strokeWidth="2" fill="none" />

            {/* Geofence Hub 1: Delhi */}
            <circle cx="120" cy="80" r="40" fill="rgba(56, 189, 248, 0.08)" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
            <text x="120" y="60" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">Delhi Hub Geofence</text>

            {/* Geofence Hub 2: Mumbai */}
            <circle cx="260" cy="260" r="45" fill="rgba(34, 197, 94, 0.08)" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 3" />
            <text x="260" y="235" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">Mumbai Port Hub</text>

            {/* Geofence Hub 3: Bangalore */}
            <circle cx="450" cy="320" r="38" fill="rgba(168, 85, 247, 0.08)" stroke="#a855f7" strokeWidth="1" strokeDasharray="3 3" />
            <text x="450" y="295" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">Bangalore Depot</text>
          </svg>

          {/* Vehicle Markers Container */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 320,
            }}
          >
            {filteredVehicles.map((v, idx) => {
              const badgeStyle = getStatusBadge(v.status);
              const isSelected = selectedVehicle?.id === v.id;

              // Compute marker position relative coordinates
              const xPos = 60 + ((v.lng - 70) / 20) * 800 + (idx * 60) % 400;
              const yPos = 40 + ((30 - v.lat) / 20) * 300 + (idx * 40) % 220;

              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  style={{
                    position: 'absolute',
                    left: `${Math.min(85, Math.max(10, (xPos / 600) * 100))}%`,
                    top: `${Math.min(80, Math.max(10, (yPos / 300) * 100))}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: isSelected ? 20 : 10,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 8px',
                      borderRadius: 16,
                      backgroundColor: isSelected ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.85)',
                      border: `2px solid ${badgeStyle.color}`,
                      boxShadow: isSelected ? `0 0 16px ${badgeStyle.color}` : '0 4px 10px rgba(0,0,0,0.4)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: badgeStyle.color,
                        boxShadow: `0 0 8px ${badgeStyle.color}`,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: isSelected ? '#ffffff' : '#cbd5e1',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {v.vehicleNumber}
                    </span>
                    {v.status === 'In Transit' && (
                      <span style={{ fontSize: 9, color: '#38bdf8', fontWeight: 600 }}>
                        {v.speedKmH}km/h
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Legend */}
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '8px 14px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              zIndex: 5,
              fontSize: 11,
              width: 'fit-content',
            }}
          >
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>Legend:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
              <span style={{ color: '#cbd5e1' }}>In Transit</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ color: '#cbd5e1' }}>Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <span style={{ color: '#cbd5e1' }}>Maintenance</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span style={{ color: '#cbd5e1' }}>Blocked</span>
            </div>
          </div>
        </div>

        {/* Selected Vehicle Telemetry Detail Drawer */}
        <div
          style={{
            backgroundColor: 'var(--panel-1)',
            borderLeft: '1px solid var(--border-soft)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {selectedVehicle ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 4,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    backgroundColor: getStatusBadge(selectedVehicle.status).bg,
                    color: getStatusBadge(selectedVehicle.status).color,
                    border: `1px solid ${getStatusBadge(selectedVehicle.status).border}`,
                  }}
                >
                  {selectedVehicle.status}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  Ping: {selectedVehicle.lastPing}
                </span>
              </div>

              <h4 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>
                {selectedVehicle.vehicleNumber}
              </h4>
              <p style={{ margin: '0 0 16px 0', fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Truck size={12} /> Category: <strong>{selectedVehicle.category} Fleet</strong>
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                <div
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: 'var(--panel-2)',
                    border: '1px solid var(--border-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <MapPin size={16} color="var(--green)" />
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', display: 'block' }}>Current Location</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>
                      {selectedVehicle.currentLocation}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: 'var(--panel-2)',
                    border: '1px solid var(--border-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <User size={16} color="#3b82f6" />
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', display: 'block' }}>Assigned Driver</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>
                      {selectedVehicle.driverName}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: 'var(--panel-2)',
                    border: '1px solid var(--border-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Navigation size={16} color="#a855f7" />
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', display: 'block' }}>Destination / Depot</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>
                      {selectedVehicle.destination}
                    </span>
                  </div>
                </div>
              </div>

              {/* Telemetry Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <div
                  style={{
                    padding: 10,
                    borderRadius: 6,
                    backgroundColor: 'var(--panel-2)',
                    border: '1px solid var(--border-soft)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--text-3)', fontSize: 10, marginBottom: 2 }}>
                    <Gauge size={12} /> Speed
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: selectedVehicle.speedKmH > 75 ? '#ef4444' : 'var(--text-1)' }}>
                    {selectedVehicle.speedKmH} <span style={{ fontSize: 10, fontWeight: 500 }}>km/h</span>
                  </span>
                </div>

                <div
                  style={{
                    padding: 10,
                    borderRadius: 6,
                    backgroundColor: 'var(--panel-2)',
                    border: '1px solid var(--border-soft)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--text-3)', fontSize: 10, marginBottom: 2 }}>
                    <Fuel size={12} /> Fuel Level
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: selectedVehicle.fuelLevel < 25 ? '#f59e0b' : 'var(--text-1)' }}>
                    {selectedVehicle.fuelLevel}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)' }}>
              Select a vehicle on the map to view telemetry
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              disabled={!selectedVehicle}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: 'none',
                backgroundColor: 'var(--green)',
                color: '#ffffff',
                cursor: selectedVehicle ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
              onClick={() => alert(`Tracking live trip for vehicle ${selectedVehicle?.vehicleNumber}`)}
            >
              <Eye size={14} /> Live Track
            </button>

            <button
              disabled={!selectedVehicle}
              style={{
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: '1px solid var(--border-soft)',
                backgroundColor: 'var(--panel-2)',
                color: 'var(--text-1)',
                cursor: selectedVehicle ? 'pointer' : 'not-allowed',
              }}
              onClick={() => alert(`Sending ping diagnostics to ${selectedVehicle?.vehicleNumber}`)}
            >
              Diagnostics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
