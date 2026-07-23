import React, { useState } from 'react';
import { Bell, CheckCircle, MessageSquare, Mail } from 'lucide-react';
import '../../styles/vendor.css';

type NotifCategory = 'All' | 'Indents' | 'Expiries' | 'Compliance' | 'Bills' | 'Payments';

interface Notification {
  id: string;
  category: NotifCategory;
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

const NOTIFICATIONS: Notification[] = [
  {
    id: 'N-01',
    category: 'Compliance',
    title: 'Vehicle Insurance Expired — MH-12-PQ-9988',
    message: 'Insurance for vehicle MH-12-PQ-9988 expired on 18th July 2026. Placement PLC-501 is on hold until renewal is uploaded.',
    time: '2 hours ago',
    read: false,
    priority: 'high',
  },
  {
    id: 'N-02',
    category: 'Indents',
    title: 'New Indent Received: IND-9018 (Bengaluru → Chennai)',
    message: 'Delhivery Supply Chain has assigned a new indent to your portal. Acceptance deadline: 48 minutes. Trip value: ₹39,000.',
    time: '30 min ago',
    read: false,
    priority: 'high',
  },
  {
    id: 'N-03',
    category: 'Bills',
    title: 'Deviation Flag on BILL-8802',
    message: 'Customer audit has flagged BILL-8802 with a ₹3,500 deviation over contract rate. Please provide supporting documents for detention charges.',
    time: '1 hour ago',
    read: false,
    priority: 'high',
  },
  {
    id: 'N-04',
    category: 'Payments',
    title: 'Payment Scheduled: ₹1,07,800 — Disbursement on 25th July',
    message: 'Batch #224 payment of ₹1,07,800 (net of TDS ₹2,200) has been scheduled to your HDFC Bank account for July 25, 2026.',
    time: '3 hours ago',
    read: false,
    priority: 'medium',
  },
  {
    id: 'N-05',
    category: 'Expiries',
    title: 'PUC Expiry T-7 Alert — HR-26-DQ-7711',
    message: 'Vehicle HR-26-DQ-7711 PUC certificate expires on August 1st, 2026 (8 days remaining). Renew to avoid compliance hold.',
    time: '5 hours ago',
    read: true,
    priority: 'medium',
  },
  {
    id: 'N-06',
    category: 'Expiries',
    title: 'Insurance T-15 Alert — HR-26-DQ-7711',
    message: 'Insurance for HR-26-DQ-7711 expires on August 5th, 2026. Please initiate renewal within 15 days to maintain trip eligibility.',
    time: '8 hours ago',
    read: true,
    priority: 'medium',
  },
  {
    id: 'N-07',
    category: 'Payments',
    title: 'Payment Received: ₹47,030 (HDFC-UTR-9982310492)',
    message: 'Bill BILL-8801 settlement of ₹47,030 has been credited to your bank account on 22nd July 2026.',
    time: '1 day ago',
    read: true,
    priority: 'low',
  },
  {
    id: 'N-08',
    category: 'Bills',
    title: 'BILL-8801 Approved by Amazon Logistics',
    message: 'Your invoice BILL-8801 for Trip TRIP-4011 (Bhiwandi → Pune) has been approved. Net payable: ₹47,030.',
    time: '2 days ago',
    read: true,
    priority: 'low',
  },
];

export const NotificationsCenter: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<NotifCategory>('All');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  // Channel preferences
  const [channelPrefs, setChannelPrefs] = useState({
    portal: true,
    email: true,
    whatsapp: false,
  });

  const filtered = activeCategory === 'All' ? notifications : notifications.filter((n) => n.category === activeCategory);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const priorityColor = (p: Notification['priority']) =>
    p === 'high' ? 'var(--vendor-danger)' : p === 'medium' ? 'var(--vendor-warning)' : 'var(--vendor-accent)';

  const priorityBg = (p: Notification['priority']) =>
    p === 'high' ? 'var(--vendor-danger-light)' : p === 'medium' ? 'var(--vendor-warning-light)' : 'var(--vendor-accent-light)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="vp-page-header">
        <div>
          <div className="vp-page-title">
            <Bell color="var(--vendor-accent)" /> Notifications Center
            {unreadCount > 0 && (
              <span
                style={{
                  background: 'var(--vendor-danger)',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 999,
                  padding: '2px 8px',
                }}
              >
                {unreadCount} Unread
              </span>
            )}
          </div>
          <div className="vp-page-subtitle">
            Receive real-time alerts for indents, document expiries, compliance issues, bill approvals, and payment releases.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="vp-btn vp-btn-secondary" onClick={markAllRead}>
            <CheckCircle size={14} /> Mark All Read
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Notifications Feed */}
        <div>
          {/* Category Filter Tabs */}
          <div className="vp-tabs" style={{ marginBottom: 16 }}>
            {(['All', 'Indents', 'Expiries', 'Compliance', 'Bills', 'Payments'] as NotifCategory[]).map((cat) => (
              <button key={cat} className={`vp-tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((notif) => (
              <div
                key={notif.id}
                style={{
                  background: notif.read ? 'var(--panel-1)' : priorityBg(notif.priority),
                  border: `1px solid ${notif.read ? 'var(--border-soft)' : priorityColor(notif.priority)}40`,
                  borderLeft: `4px solid ${priorityColor(notif.priority)}`,
                  borderRadius: 10,
                  padding: 16,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, read: true } : n))}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!notif.read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColor(notif.priority), flexShrink: 0 }} />
                    )}
                    <div style={{ fontSize: 14, fontWeight: notif.read ? 600 : 700, color: 'var(--text-1)' }}>{notif.title}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                    <span className={`vp-badge ${
                      notif.category === 'Compliance' || notif.category === 'Expiries' ? 'vp-badge-danger'
                        : notif.category === 'Indents' ? 'vp-badge-warning'
                        : notif.category === 'Bills' ? 'vp-badge-purple'
                        : 'vp-badge-success'
                    }`} style={{ fontSize: 9 }}>
                      {notif.category}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{notif.time}</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{notif.message}</div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>
                <Bell size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                No notifications in this category.
              </div>
            )}
          </div>
        </div>

        {/* Channel Preferences Sidebar */}
        <div>
          <div className="vp-card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🔔 Notification Channels</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'portal' as const, label: 'Portal Notifications', icon: <Bell size={18} />, desc: 'In-app alerts (always on)' },
                { key: 'email' as const, label: 'Email Alerts', icon: <Mail size={18} />, desc: 'rajesh.shah@expresslogistics.in' },
                { key: 'whatsapp' as const, label: 'WhatsApp Alerts', icon: <MessageSquare size={18} />, desc: '+91 99887 76655' },
              ].map((channel) => (
                <div key={channel.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--panel-2)', borderRadius: 10, border: '1px solid var(--border-soft)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ color: 'var(--vendor-accent)' }}>{channel.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{channel.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{channel.desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => channel.key !== 'portal' && setChannelPrefs((prev) => ({ ...prev, [channel.key]: !prev[channel.key] }))}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 999,
                      background: channelPrefs[channel.key] ? 'var(--vendor-accent)' : 'var(--panel-1)',
                      border: `1px solid ${channelPrefs[channel.key] ? 'var(--vendor-accent)' : 'var(--border-soft)'}`,
                      cursor: channel.key === 'portal' ? 'not-allowed' : 'pointer',
                      position: 'relative',
                      transition: 'background 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: channelPrefs[channel.key] ? 22 : 3,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Categories Configuration */}
          <div className="vp-card" style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>📋 Alert Types Enabled</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              {[
                { label: 'New Indent Assignments', enabled: true },
                { label: 'Indent Expiry Countdown', enabled: true },
                { label: 'Document Expiry (T-30/15/7)', enabled: true },
                { label: 'Compliance Issues', enabled: true },
                { label: 'Bill Approval / Rejection', enabled: true },
                { label: 'Payment Disbursement', enabled: true },
                { label: 'Scorecard Monthly Summary', enabled: false },
              ].map((alert) => (
                <div key={alert.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-soft)' }}>
                  <span style={{ color: alert.enabled ? 'var(--text-1)' : 'var(--text-3)' }}>{alert.label}</span>
                  <span style={{ fontSize: 11 }}>
                    {alert.enabled
                      ? <CheckCircle size={14} color="var(--vendor-accent)" />
                      : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--border-soft)' }} />
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
