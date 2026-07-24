import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initialNotifications } from './driverDataStore';
import type { NotificationItem } from './driverDataStore';
import {
  Bell,
  CheckCircle2,
  Route,
  Wallet,
  Receipt,
  ShieldAlert,
  FileText,
  ExternalLink,
  Check,
  Filter,
} from 'lucide-react';

export const DriverNotifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filterType, setFilterType] = useState<string>('All');

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markSingleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filterType !== 'All' && n.type !== filterType) return false;
    return true;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Duty Assigned':
        return <CheckCircle2 color="var(--green)" size={18} />;
      case 'Trip Updates':
        return <Route color="#3B82F6" size={18} />;
      case 'POD Rejected':
        return <ShieldAlert color="var(--red)" size={18} />;
      case 'Expense Approved':
        return <Receipt color="var(--green)" size={18} />;
      case 'Khata Settlement':
        return <Wallet color="var(--amber)" size={18} />;
      case 'License Expiry':
        return <FileText color="var(--amber)" size={18} />;
      case 'SOS Updates':
        return <ShieldAlert color="var(--red)" size={18} />;
      default:
        return <Bell color="var(--green)" size={18} />;
    }
  };

  const handleOpenLinkedRecord = (notif: NotificationItem) => {
    markSingleRead(notif.id);
    switch (notif.type) {
      case 'Duty Assigned':
      case 'Trip Updates':
        navigate('/driver/trips');
        break;
      case 'POD Rejected':
        navigate('/driver/epod');
        break;
      case 'Expense Approved':
        navigate('/driver/expenses');
        break;
      case 'Khata Settlement':
        navigate('/driver/khata');
        break;
      case 'License Expiry':
        navigate('/driver/documents');
        break;
      case 'SOS Updates':
        navigate('/driver/sos');
        break;
      default:
        navigate('/driver/dashboard');
        break;
    }
  };

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text-1)' }}>Notification Center</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-2)' }}>
            Real-time duty assignments, trip updates, POD approvals & Khata settlement alerts.
          </p>
        </div>
        <button className="driver-btn-secondary" onClick={markAllRead}>
          <Check size={16} /> Mark All as Read
        </button>
      </div>

      {/* Filter Bar */}
      <div className="driver-card" style={{ padding: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Filter size={14} color="var(--text-2)" />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>FILTER BY TYPE:</span>
          <select
            className="driver-lang-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Notification Types</option>
            <option value="Duty Assigned">Duty Assigned</option>
            <option value="Trip Updates">Trip Updates</option>
            <option value="POD Rejected">POD Rejected</option>
            <option value="Expense Approved">Expense Approved</option>
            <option value="Khata Settlement">Khata Settlement</option>
            <option value="License Expiry">License Expiry</option>
            <option value="SOS Updates">SOS Updates</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredNotifs.length === 0 ? (
          <div className="driver-card" style={{ textAlign: 'center', color: 'var(--text-2)', padding: 40 }}>
            No notifications found.
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className="driver-card"
              style={{
                marginBottom: 0,
                padding: 16,
                background: n.read ? 'var(--panel)' : 'var(--panel-2)',
                borderColor: n.read ? 'var(--border)' : 'var(--green)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'var(--panel-3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getIconForType(n.type)}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)' }}>{n.title}</span>
                      {!n.read && (
                        <span style={{ fontSize: 9, fontWeight: 700, background: 'var(--green)', color: '#0B0D10', padding: '2px 6px', borderRadius: 4 }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, fontFamily: 'monospace' }}>
                      {n.timestamp}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    className="driver-btn-primary"
                    onClick={() => handleOpenLinkedRecord(n)}
                    style={{ padding: '6px 12px', fontSize: 11 }}
                  >
                    <ExternalLink size={12} /> Open Record
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
