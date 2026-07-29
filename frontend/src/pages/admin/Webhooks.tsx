import React, { useState } from 'react';
import { Webhook, Plus, Search, Send } from 'lucide-react';
import { Button, Panel, Badge, Modal, Input, Field } from '../../components/admin/ui';
import type { WebhookEndpoint } from '../../services/adminApi';

const INITIAL_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: 'wh-1',
    name: 'SAP ERP Trip Completion Webhook',
    targetUrl: 'https://erp.fleetcompany.com/api/v2/webhooks/trip-complete',
    eventTriggers: ['trip.completed', 'trip.cancelled'],
    secretKey: 'whsec_8f9a2b4c1d6e8f0a',
    status: 'Active',
    lastTriggered: '12m ago',
    successRate: 99.4,
    retryPolicy: '3 retries with exponential backoff',
  },
  {
    id: 'wh-2',
    name: 'TMS Gate Arrival Dispatcher Notification',
    targetUrl: 'https://tms.partnerlogistics.in/gate/entry-event',
    eventTriggers: ['gate.entry', 'gate.exit'],
    secretKey: 'whsec_7d6e5f4c3b2a10fe',
    status: 'Active',
    lastTriggered: '2m ago',
    successRate: 100,
    retryPolicy: '5 retries with linear backoff',
  },
  {
    id: 'wh-3',
    name: 'Compliance Breach Emergency Alert Hook',
    targetUrl: 'https://compliance-monitoring.internal/webhook/alerts',
    eventTriggers: ['compliance.breach', 'challan.issued', 'sos.triggered'],
    secretKey: 'whsec_9988776655443322',
    status: 'Active',
    lastTriggered: '1h ago',
    successRate: 98.2,
    retryPolicy: 'Immediate 3 retries',
  },
];

export const Webhooks: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(INITIAL_WEBHOOKS);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    targetUrl: '',
    eventTriggers: 'trip.completed, gate.entry',
  });

  const filtered = webhooks.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.targetUrl.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newWh: WebhookEndpoint = {
      id: `wh-${Date.now()}`,
      name: formData.name,
      targetUrl: formData.targetUrl,
      eventTriggers: formData.eventTriggers.split(',').map((s) => s.trim()),
      secretKey: `whsec_${Math.random().toString(36).substring(2, 12)}`,
      status: 'Active',
      lastTriggered: 'never',
      successRate: 100,
      retryPolicy: '3 retries with exponential backoff',
    };
    setWebhooks([newWh, ...webhooks]);
    setModalOpen(false);
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Integrations / P-06</span>
          <h1 className="adm-page-title">
            <Webhook size={22} color="var(--green)" /> Outbound Webhooks
          </h1>
          <p className="adm-page-sub">
            Configure HTTP POST webhooks to push live system events to external ERPs, TMS and tracking servers.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
          New Webhook
        </Button>
      </div>

      <Panel title="Webhook Subscriptions & Delivery">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search webhook name or endpoint URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                fontSize: 13,
                borderRadius: 6,
                border: '1px solid var(--border-soft)',
                backgroundColor: 'var(--panel-2)',
                color: 'var(--text-1)',
              }}
            />
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Name & Endpoint</th>
                <th>Subscribed Events</th>
                <th>Signing Secret</th>
                <th>Success Rate</th>
                <th>Last Triggered</th>
                <th>Status</th>
                <th>Test Ping</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((wh) => (
                <tr key={wh.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{wh.name}</div>
                    <span className="mono-label" style={{ fontSize: 10, color: 'var(--green)' }}>
                      {wh.targetUrl}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {wh.eventTriggers.map((ev) => (
                        <Badge key={ev} tone="blue">
                          {ev}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: 11, background: 'var(--panel-2)', padding: '2px 6px', borderRadius: 4 }}>
                      {wh.secretKey.slice(0, 10)}...
                    </code>
                  </td>
                  <td style={{ fontWeight: 700, color: wh.successRate >= 99 ? 'var(--green)' : '#f59e0b' }}>
                    {wh.successRate}%
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{wh.lastTriggered}</td>
                  <td>
                    <Badge tone={wh.status === 'Active' ? 'green' : 'red'}>{wh.status}</Badge>
                  </td>
                  <td>
                    <Button
                      variant="subtle"
                      size="sm"
                      icon={<Send size={12} />}
                      onClick={() => alert(`Ping sent to ${wh.targetUrl}. HTTP 200 OK received.`)}
                    >
                      Ping Payload
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register Webhook Endpoint">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Webhook Name">
            <Input value={formData.name} placeholder="e.g. SAP Integration Hook" onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </Field>
          <Field label="Target URL (HTTPS)">
            <Input value={formData.targetUrl} placeholder="https://api.domain.com/webhook" onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })} required />
          </Field>
          <Field label="Event Triggers (comma separated)">
            <Input value={formData.eventTriggers} placeholder="trip.completed, gate.entry" onChange={(e) => setFormData({ ...formData, eventTriggers: e.target.value })} required />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <Button variant="subtle" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Webhook</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
