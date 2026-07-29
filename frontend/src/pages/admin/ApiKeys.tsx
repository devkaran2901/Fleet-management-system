import React, { useState } from 'react';
import { KeyRound, Plus, Search, Trash2, Copy } from 'lucide-react';
import { Button, Panel, Badge, Modal, Input, Field } from '../../components/admin/ui';
import type { ApiKeyItem } from '../../services/adminApi';

const INITIAL_KEYS: ApiKeyItem[] = [
  {
    id: 'key-1',
    name: 'TMS Connector System Token',
    prefix: 'fms_live_9a8b7c',
    scopes: ['fleet.read', 'trips.write', 'gate.entry'],
    rateLimitReqPerMin: 1200,
    lastUsedAt: '5m ago',
    expiresAt: '2027-12-31',
    status: 'Active',
    createdAt: '2026-01-15',
  },
  {
    id: 'key-2',
    name: 'WMS Inventory Sync Scoped Token',
    prefix: 'fms_live_4d5e6f',
    scopes: ['workshop.parts.read', 'workshop.parts.write'],
    rateLimitReqPerMin: 600,
    lastUsedAt: '1h ago',
    expiresAt: '2026-11-30',
    status: 'Active',
    createdAt: '2026-02-01',
  },
  {
    id: 'key-3',
    name: 'Legacy Telemetry Dump Key',
    prefix: 'fms_live_1a2b3c',
    scopes: ['telemetry.all'],
    rateLimitReqPerMin: 300,
    lastUsedAt: '14d ago',
    expiresAt: '2026-06-01',
    status: 'Expired',
    createdAt: '2025-06-01',
  },
];

export const ApiKeys: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeyItem[]>(INITIAL_KEYS);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    scopes: 'fleet.read, trips.read',
    rateLimitReqPerMin: 600,
  });

  const filtered = keys.filter(
    (k) =>
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.prefix.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const secret = `fms_live_${Math.random().toString(36).substring(2, 14)}${Math.random().toString(36).substring(2, 14)}`;
    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: formData.name,
      prefix: secret.slice(0, 15),
      scopes: formData.scopes.split(',').map((s) => s.trim()),
      rateLimitReqPerMin: Number(formData.rateLimitReqPerMin),
      lastUsedAt: 'Never',
      expiresAt: '2027-12-31',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setKeys([newKey, ...keys]);
    setGeneratedKey(secret);
  };

  const handleRevoke = (id: string) => {
    if (window.confirm('Are you sure you want to revoke this API Key? Programmatic calls using this token will fail immediately.')) {
      setKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, status: 'Revoked' } : k))
      );
    }
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Integrations / P-06</span>
          <h1 className="adm-page-title">
            <KeyRound size={22} color="var(--green)" /> API Keys Management
          </h1>
          <p className="adm-page-sub">
            Scoped access tokens for headless integrations, rate limit policy enforcement, and key lifecycle management.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => { setGeneratedKey(null); setModalOpen(true); }}>
          Generate API Key
        </Button>
      </div>

      <Panel title="Active Access Tokens">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search key name or token prefix..."
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
                <th>Key Name & Prefix</th>
                <th>Granted Scopes</th>
                <th>Rate Limit</th>
                <th>Last Activity</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Revoke</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((k) => (
                <tr key={k.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{k.name}</div>
                    <code className="mono-label" style={{ fontSize: 10, color: 'var(--green)' }}>
                      {k.prefix}...
                    </code>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {k.scopes.map((s) => (
                        <Badge key={s} tone="grey">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>{k.rateLimitReqPerMin} req/min</td>
                  <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{k.lastUsedAt}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{k.expiresAt}</td>
                  <td>
                    <Badge tone={k.status === 'Active' ? 'green' : k.status === 'Expired' ? 'amber' : 'red'}>
                      {k.status}
                    </Badge>
                  </td>
                  <td>
                    {k.status === 'Active' && (
                      <Button
                        variant="subtle"
                        size="sm"
                        icon={<Trash2 size={12} />}
                        onClick={() => handleRevoke(k.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={generatedKey ? 'API Key Generated' : 'Generate Scoped API Key'}>
        {generatedKey ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
              ⚠️ Copy this secret key now! It will never be shown again.
            </p>

            <div
              style={{
                padding: 12,
                borderRadius: 6,
                backgroundColor: '#0f172a',
                border: '1px solid var(--border-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <code style={{ fontSize: 13, color: '#38bdf8', wordBreak: 'break-all' }}>{generatedKey}</code>
              <button
                onClick={() => navigator.clipboard.writeText(generatedKey)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: 'var(--green)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Copy size={12} /> Copy
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <Button variant="primary" onClick={() => setModalOpen(false)}>Done</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Key Description / System">
              <Input value={formData.name} placeholder="e.g. WMS Inventory Sync Key" onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </Field>
            <Field label="Capability Scopes (comma separated)">
              <Input value={formData.scopes} placeholder="fleet.read, trips.read" onChange={(e) => setFormData({ ...formData, scopes: e.target.value })} required />
            </Field>
            <Field label="Rate Limit (req / min)">
              <Input type="number" value={formData.rateLimitReqPerMin} onChange={(e) => setFormData({ ...formData, rateLimitReqPerMin: Number(e.target.value) })} required />
            </Field>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <Button variant="subtle" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" type="submit">Generate Token</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};
