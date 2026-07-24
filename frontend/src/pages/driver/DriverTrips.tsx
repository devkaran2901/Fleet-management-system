import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initialTrips } from './driverDataStore';
import type { DriverTrip } from './driverDataStore';
import { Search, Filter, Eye, Upload, AlertTriangle, Calendar } from 'lucide-react';

export const DriverTrips: React.FC = () => {
  const navigate = useNavigate();
  const [trips] = useState<DriverTrip[]>(initialTrips);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Completed' | 'Cancelled'>('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | 'This Week' | 'This Month'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrips = trips.filter((t) => {
    if (statusFilter === 'Active' && (t.status === 'Closed' || t.status === 'Cancelled')) return false;
    if (statusFilter === 'Completed' && t.status !== 'Closed') return false;
    if (statusFilter === 'Cancelled' && t.status !== 'Cancelled') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        t.tripNumber.toLowerCase().includes(q) ||
        t.customer.toLowerCase().includes(q) ||
        t.route.toLowerCase().includes(q) ||
        t.vehicle.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text-1)' }}>My Assigned Trips</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-2)' }}>
            View active trip execution, timeline progress, POD status & trip history.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="driver-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', minWidth: 260, flex: 1 }}>
            <Search size={16} color="var(--text-2)" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input
              type="text"
              placeholder="Search by Trip ID, Customer, Route, Vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--panel-2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 12px 8px 36px',
                color: 'var(--text-1)',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={14} color="var(--text-2)" />
              <select
                className="driver-lang-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Trips</option>
                <option value="Completed">Completed Trips</option>
                <option value="Cancelled">Cancelled Trips</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} color="var(--text-2)" />
              <select
                className="driver-lang-select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
              >
                <option value="All">All Dates</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="driver-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="driver-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Route & Customer</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>POD Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--text-2)' }}>
                  No trips found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredTrips.map((t) => (
                <tr key={t.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--text-1)' }}>{t.tripNumber}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: 13 }}>{t.route}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{t.customer}</div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--green)' }}>{t.vehicle}</span>
                  </td>
                  <td>
                    <span className={`driver-status-pill ${t.status === 'Closed' ? 'completed' : 'in-transit'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>{t.startDate}</td>
                  <td>{t.endDate || 'In Progress'}</td>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background:
                          t.podStatus === 'Verified'
                            ? 'var(--green-glow, rgba(46, 204, 113, 0.15))'
                            : t.podStatus === 'Rejected'
                            ? 'rgba(229, 72, 77, 0.15)'
                            : 'rgba(232, 163, 61, 0.15)',
                        color:
                          t.podStatus === 'Verified'
                            ? 'var(--green)'
                            : t.podStatus === 'Rejected'
                            ? 'var(--red)'
                            : 'var(--amber)',
                      }}
                    >
                      {t.podStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        className="driver-btn-secondary"
                        onClick={() => navigate(`/driver/trips/${t.id}`)}
                        style={{ padding: '5px 10px', fontSize: 11 }}
                        title="View Detailed Trip Timeline"
                      >
                        <Eye size={13} /> View
                      </button>

                      <button
                        className="driver-btn-primary"
                        onClick={() => navigate('/driver/epod')}
                        style={{ padding: '5px 10px', fontSize: 11 }}
                        title="Upload Electronic POD"
                      >
                        <Upload size={13} /> POD
                      </button>

                      <button
                        onClick={() => navigate('/driver/sos')}
                        style={{
                          background: 'rgba(229, 72, 77, 0.12)',
                          border: '1px solid var(--red)',
                          color: 'var(--red)',
                          borderRadius: 8,
                          padding: '5px 8px',
                          cursor: 'pointer',
                        }}
                        title="Report Issue or Delay"
                      >
                        <AlertTriangle size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
