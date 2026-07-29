import React, { useState } from 'react';
import { BellRing, Send, Mail, MessageSquare, Smartphone, Globe } from 'lucide-react';
import { Button, Panel, Badge } from '../../components/admin/ui';
import type { NotificationHealthItem } from '../../services/adminApi';

const INITIAL_CHANNELS: NotificationHealthItem[] = [
  {
    id: 'ch-1',
    channel: 'Email',
    totalSent: 14200,
    delivered: 14120,
    failed: 80,
    avgLatencyMs: 420,
    status: 'Healthy',
  },
  {
    id: 'ch-2',
    channel: 'SMS',
    totalSent: 8900,
    delivered: 8750,
    failed: 150,
    avgLatencyMs: 1200,
    status: 'Healthy',
  },
  {
    id: 'ch-3',
    channel: 'WhatsApp',
    totalSent: 6400,
    delivered: 6380,
    failed: 20,
    avgLatencyMs: 650,
    status: 'Healthy',
  },
  {
    id: 'ch-4',
    channel: 'Push',
    totalSent: 21000,
    delivered: 20400,
    failed: 600,
    avgLatencyMs: 180,
    status: 'Healthy',
  },
  {
    id: 'ch-5',
    channel: 'In-App',
    totalSent: 45000,
    delivered: 45000,
    failed: 0,
    avgLatencyMs: 15,
    status: 'Healthy',
  },
];

export const NotificationHealth: React.FC = () => {
  const [channels, setChannels] = useState<NotificationHealthItem[]>(INITIAL_CHANNELS);

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'Email':
        return <Mail size={16} color="#3b82f6" />;
      case 'SMS':
        return <Smartphone size={16} color="var(--green)" />;
      case 'WhatsApp':
        return <MessageSquare size={16} color="#25d366" />;
      case 'Push':
        return <BellRing size={16} color="#a855f7" />;
      default:
        return <Globe size={16} color="var(--text-2)" />;
    }
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Monitoring / P-03</span>
          <h1 className="adm-page-title">
            <BellRing size={22} color="var(--green)" /> Notification Health & Delivery Rates
          </h1>
          <p className="adm-page-sub">
            Real-time delivery performance metrics across Email, SMS, WhatsApp, Push and In-App notification gateways.
          </p>
        </div>
        <Button
          variant="subtle"
          icon={<Send size={14} />}
          onClick={() => alert('Broadcast test notification sent to admin user.')}
        >
          Send Test Notification
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {channels.map((ch) => {
          const successRate = Math.round((ch.delivered / ch.totalSent) * 100);
          return (
            <div
              key={ch.id}
              style={{
                padding: 16,
                borderRadius: 10,
                backgroundColor: 'var(--panel-1)',
                border: '1px solid var(--border-soft)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {getChannelIcon(ch.channel)}
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>
                    {ch.channel}
                  </h4>
                </div>
                <Badge tone="green">{ch.status}</Badge>
              </div>

              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-1)', marginBottom: 4 }}>
                {successRate}% <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)' }}>delivery</span>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Sent: {ch.totalSent.toLocaleString('en-IN')}</span>
                <span>Latency: {ch.avgLatencyMs}ms</span>
              </div>
            </div>
          );
        })}
      </div>

      <Panel title="Channel Delivery Log Summary">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Channel</th>
                <th>Total Messages Sent</th>
                <th>Delivered</th>
                <th>Failed</th>
                <th>Average Latency</th>
                <th>Delivery Success Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((ch) => {
                const rate = ((ch.delivered / ch.totalSent) * 100).toFixed(1);
                return (
                  <tr key={ch.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                        {getChannelIcon(ch.channel)} {ch.channel}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{ch.totalSent.toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--green)' }}>{ch.delivered.toLocaleString('en-IN')}</td>
                    <td style={{ color: ch.failed > 0 ? '#ef4444' : 'var(--text-3)' }}>{ch.failed}</td>
                    <td style={{ fontSize: 12 }}>{ch.avgLatencyMs} ms</td>
                    <td style={{ fontWeight: 700, color: Number(rate) > 98 ? 'var(--green)' : '#f59e0b' }}>
                      {rate}%
                    </td>
                    <td>
                      <Badge tone="green">{ch.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
};
