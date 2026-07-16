import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, CircleCheck, CircleSlash, Plug, Plus, RefreshCw, Settings2, Trash2, TriangleAlert,
} from 'lucide-react';
import { adminApi, errorMessage } from '../../services/adminApi';
import type { Connector, ConnectorStatus } from '../../services/adminApi';
import {
  Badge, Button, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Panel,
  Select, useToast,
} from '../../components/admin/ui';
import type { BadgeTone } from '../../components/admin/ui';

const STATUS_TONE: Record<ConnectorStatus, BadgeTone> = {
  HEALTHY: 'green',
  DEGRADED: 'amber',
  DOWN: 'red',
  DISCONNECTED: 'grey',
};

const STATUS_ICON: Record<ConnectorStatus, React.ReactNode> = {
  HEALTHY: <CircleCheck size={12} />,
  DEGRADED: <TriangleAlert size={12} />,
  DOWN: <TriangleAlert size={12} />,
  DISCONNECTED: <CircleSlash size={12} />,
};

const STATUS_COLOR: Record<ConnectorStatus, string> = {
  HEALTHY: 'var(--green)',
  DEGRADED: 'var(--amber)',
  DOWN: 'var(--red)',
  DISCONNECTED: 'var(--text-3)',
};

const STATUSES: ConnectorStatus[] = ['HEALTHY', 'DEGRADED', 'DOWN', 'DISCONNECTED'];

const relativeTime = (iso: string | null) => {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

/** Deterministic bar heights per connector, so the sparkline is stable across renders. */
const healthBars = (connector: Connector) => {
  const seed = connector.key.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return Array.from({ length: 8 }, (_, i) => {
    const base = ((seed * (i + 3)) % 7) + 3;
    return connector.status === 'DOWN' ? 3 : connector.status === 'DEGRADED' ? Math.min(base, 7) : base;
  });
};

export const Integrations: React.FC = () => {
  const { notify } = useToast();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testing, setTesting] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | ConnectorStatus>('ALL');

  const [editing, setEditing] = useState<Connector | null>(null);
  const [configText, setConfigText] = useState('');
  const [configError, setConfigError] = useState('');
  const [saving, setSaving] = useState(false);

  const [creating, setCreating] = useState(false);
  const [newConn, setNewConn] = useState({ key: '', name: '', category: 'ERP', endpoint: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setConnectors(await adminApi.connectors());
    } catch (err) {
      setError(errorMessage(err, 'Could not load the connectors'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(
    () => ({
      HEALTHY: connectors.filter((c) => c.status === 'HEALTHY').length,
      DEGRADED: connectors.filter((c) => c.status === 'DEGRADED').length,
      DOWN: connectors.filter((c) => c.status === 'DOWN').length,
      DISCONNECTED: connectors.filter((c) => c.status === 'DISCONNECTED').length,
    }),
    [connectors],
  );

  const visible = filter === 'ALL' ? connectors : connectors.filter((c) => c.status === filter);

  const test = async (connector: Connector) => {
    setTesting(connector.id);
    try {
      const result = await adminApi.testConnector(connector.id);
      setConnectors((prev) => prev.map((c) => (c.id === connector.id ? result.connector : c)));
      notify(result.ok ? 'success' : 'error', `${connector.name}: ${result.message}`);
    } catch (err) {
      notify('error', errorMessage(err, 'The health probe failed'));
    } finally {
      setTesting(null);
    }
  };

  const openConfig = (connector: Connector) => {
    setEditing(connector);
    setConfigText(JSON.stringify(connector.config ?? {}, null, 2));
    setConfigError('');
  };

  const saveConfig = async () => {
    if (!editing) return;
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(configText || '{}');
    } catch (err) {
      setConfigError(`That is not valid JSON: ${(err as Error).message}`);
      return;
    }

    setSaving(true);
    try {
      const updated = await adminApi.updateConnector(editing.id, { config: parsed });
      setConnectors((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
      notify('success', `Saved the configuration for ${editing.name}`);
      setEditing(null);
    } catch (err) {
      notify('error', errorMessage(err, 'Could not save the configuration'));
    } finally {
      setSaving(false);
    }
  };

  const create = async () => {
    setSaving(true);
    try {
      await adminApi.createConnector({
        key: newConn.key.trim(),
        name: newConn.name.trim(),
        category: newConn.category,
        config: {
          requiredKeys: ['endpoint'],
          ...(newConn.endpoint.trim() ? { endpoint: newConn.endpoint.trim() } : {}),
        },
      });
      notify('success', `Added ${newConn.name}`);
      setCreating(false);
      setNewConn({ key: '', name: '', category: 'ERP', endpoint: '' });
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not add the connector'));
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (connector: Connector, status: ConnectorStatus) => {
    try {
      const updated = await adminApi.setConnectorStatus(connector.id, status);
      setConnectors((prev) => prev.map((c) => (c.id === connector.id ? updated : c)));
      notify('success', `${connector.name} marked ${status}`);
    } catch (err) {
      notify('error', errorMessage(err, 'Could not change the status'));
    }
  };

  const remove = async (connector: Connector) => {
    if (!window.confirm(`Remove the "${connector.name}" connector?`)) return;
    try {
      await adminApi.deleteConnector(connector.id);
      notify('success', `Removed ${connector.name}`);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not remove the connector'));
    }
  };

  if (loading) return <LoadingState label="Loading connectors" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">P-06 · Integration &amp; Import</span>
          <h1 className="adm-page-title">
            <Plug size={22} color="var(--green)" /> Integration Hub
          </h1>
          <p className="adm-page-sub">
            Connector cards with health status across ERP, HRMS, weighbridge, OMC, FASTag,
            verification aggregators, e-way bill, insurer and webhooks.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setCreating(true)}>
          Add connector
        </Button>
      </div>

      <div className="adm-stats">
        {(['HEALTHY', 'DEGRADED', 'DOWN', 'DISCONNECTED'] as ConnectorStatus[]).map((status) => (
          <button
            key={status}
            className="adm-stat"
            onClick={() => setFilter(filter === status ? 'ALL' : status)}
            style={{
              cursor: 'pointer',
              textAlign: 'left',
              borderColor: filter === status ? STATUS_COLOR[status] : undefined,
            }}
          >
            <span className="adm-stat-icon">
              <Activity size={15} color={STATUS_COLOR[status]} />
            </span>
            <span className="adm-stat-value" style={{ color: STATUS_COLOR[status] }}>
              {counts[status]}
            </span>
            <span className="adm-stat-label">
              {status.charAt(0) + status.slice(1).toLowerCase()}
              {filter === status ? ' · filtering' : ''}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Panel>
          <EmptyState
            title="No connectors match this filter"
            hint="Clear the filter to see every connector."
            action={<Button variant="subtle" onClick={() => setFilter('ALL')}>Clear filter</Button>}
          />
        </Panel>
      ) : (
        <div className="adm-conn-grid">
          {visible.map((connector) => {
            const config = (connector.config ?? {}) as Record<string, unknown>;
            const required = (config.requiredKeys as string[]) ?? [];
            const missing = required.filter((key) => !config[key]);

            return (
              <div key={connector.id} className={`adm-conn-card status-${connector.status}`}>
                <div className="adm-conn-head">
                  <div>
                    <div className="adm-conn-name">{connector.name}</div>
                    <span className="adm-conn-cat">
                      {connector.category} · {connector.key}
                    </span>
                  </div>
                  <Badge tone={STATUS_TONE[connector.status]}>
                    {STATUS_ICON[connector.status]} {connector.status}
                  </Badge>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="adm-health-bars">
                    {healthBars(connector).map((h, i) => (
                      <span
                        key={i}
                        className="adm-health-bar"
                        style={{
                          height: `${h * 2}px`,
                          backgroundColor:
                            connector.status === 'DISCONNECTED'
                              ? 'var(--panel-3)'
                              : STATUS_COLOR[connector.status],
                          opacity: 0.35 + (i / 8) * 0.65,
                        }}
                      />
                    ))}
                  </div>
                  <span className="adm-flow-meta" style={{ margin: 0 }}>
                    Synced {relativeTime(connector.lastSyncAt)}
                  </span>
                </div>

                {missing.length > 0 && (
                  <div className="adm-sod is-conflict" style={{ padding: '8px 10px', fontSize: 11 }}>
                    <TriangleAlert size={13} />
                    <span>Missing config: {missing.join(', ')}</span>
                  </div>
                )}

                <div className="adm-conn-foot">
                  <Select
                    value={connector.status}
                    style={{ width: 128, padding: '5px 26px 5px 9px', fontSize: 11 }}
                    onChange={(e) => void setStatus(connector, e.target.value as ConnectorStatus)}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button
                      variant="subtle"
                      size="sm"
                      icon={<RefreshCw size={12} />}
                      loading={testing === connector.id}
                      onClick={() => void test(connector)}
                    >
                      Test
                    </Button>
                    <button
                      className="adm-icon-btn"
                      title="Configure"
                      onClick={() => openConfig(connector)}
                    >
                      <Settings2 size={14} />
                    </button>
                    <button
                      className="adm-icon-btn is-danger"
                      title="Remove connector"
                      onClick={() => void remove(connector)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={editing !== null}
        title="Connector configuration"
        subtitle={editing ? `${editing.name} · ${editing.key}` : undefined}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={saveConfig}>Save config</Button>
          </>
        }
      >
        <Field
          label="Config (JSON)"
          hint="requiredKeys lists the settings the health probe checks for."
        >
          <textarea
            className="adm-input adm-input-mono"
            rows={12}
            value={configText}
            onChange={(e) => { setConfigText(e.target.value); setConfigError(''); }}
            spellCheck={false}
          />
        </Field>
        {configError && (
          <div className="adm-sod is-conflict">
            <TriangleAlert size={15} />
            <span>{configError}</span>
          </div>
        )}
      </Modal>

      <Modal
        open={creating}
        title="Add connector"
        onClose={() => setCreating(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={saving}
              disabled={!newConn.key.trim() || !newConn.name.trim()}
              onClick={create}
            >
              Add connector
            </Button>
          </>
        }
      >
        <div className="adm-form-row">
          <Field label="Key" hint="Unique slug, e.g. erp-oracle.">
            <Input
              autoFocus
              className="adm-input-mono"
              value={newConn.key}
              onChange={(e) => setNewConn({ ...newConn, key: e.target.value })}
              placeholder="erp-oracle"
            />
          </Field>
          <Field label="Category">
            <Select
              value={newConn.category}
              onChange={(e) => setNewConn({ ...newConn, category: e.target.value })}
            >
              {['ERP', 'HRMS', 'Telemetry', 'Fuel', 'Tolling', 'Compliance', 'Verification', 'Webhook']
                .map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Name">
          <Input
            value={newConn.name}
            onChange={(e) => setNewConn({ ...newConn, name: e.target.value })}
            placeholder="Oracle ERP"
          />
        </Field>
        <Field label="Endpoint" hint="Leave blank to add it later — the card will show as degraded until set.">
          <Input
            className="adm-input-mono"
            value={newConn.endpoint}
            onChange={(e) => setNewConn({ ...newConn, endpoint: e.target.value })}
            placeholder="https://erp.internal/api"
          />
        </Field>
      </Modal>
    </>
  );
};
