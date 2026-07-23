import React, { useCallback, useEffect, useState } from 'react';
import {
  Bell, Layers, Mail, MessageSquare, MonitorSmartphone, Moon, Plus, Smartphone,
  Trash2, Webhook,
} from 'lucide-react';
import { adminApi, errorMessage } from '../../services/adminApi';
import type {
  AdminRole, NotificationChannel, NotificationPolicy, NotificationSeverity,
} from '../../services/adminApi';
import {
  Badge, Button, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Panel,
  Select, Toggle, useToast,
} from '../../components/admin/ui';
import type { BadgeTone } from '../../components/admin/ui';

const CHANNEL_META: Record<NotificationChannel, { label: string; icon: React.ReactNode }> = {
  EMAIL: { label: 'Email', icon: <Mail size={14} /> },
  SMS: { label: 'SMS', icon: <MessageSquare size={14} /> },
  PUSH: { label: 'Push', icon: <Smartphone size={14} /> },
  WEBHOOK: { label: 'Webhook', icon: <Webhook size={14} /> },
  IN_APP: { label: 'In-app', icon: <MonitorSmartphone size={14} /> },
};

const SEVERITY_TONE: Record<NotificationSeverity, BadgeTone> = {
  INFO: 'grey',
  WARNING: 'amber',
  CRITICAL: 'red',
};

const SEVERITIES: NotificationSeverity[] = ['INFO', 'WARNING', 'CRITICAL'];

const emptyPolicy = {
  eventKey: '',
  label: '',
  severity: 'INFO' as NotificationSeverity,
  channels: ['IN_APP'] as NotificationChannel[],
  audienceRole: 'ADMIN',
  quietHours: true,
  digest: false,
};

export const NotificationPolicies: React.FC = () => {
  const { notify } = useToast();
  const [policies, setPolicies] = useState<NotificationPolicy[]>([]);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyCell, setBusyCell] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyPolicy);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [policyData, channelData, roleData] = await Promise.all([
        adminApi.notificationPolicies(),
        adminApi.notificationChannels(),
        adminApi.roles(),
      ]);
      setPolicies(policyData);
      setChannels(channelData);
      setRoles(roleData);
    } catch (err) {
      setError(errorMessage(err, 'Could not load the notification policies'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const toggleChannel = async (policy: NotificationPolicy, channel: NotificationChannel) => {
    const cell = `${policy.id}:${channel}`;
    setBusyCell(cell);

    // Optimistic — the grid is the point of this screen, so it must feel instant.
    const had = policy.channels.includes(channel);
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === policy.id
          ? {
              ...p,
              channels: had ? p.channels.filter((c) => c !== channel) : [...p.channels, channel],
            }
          : p,
      ),
    );

    try {
      const updated = await adminApi.toggleNotificationChannel(policy.id, channel);
      setPolicies((prev) => prev.map((p) => (p.id === policy.id ? updated : p)));
    } catch (err) {
      setPolicies((prev) => prev.map((p) => (p.id === policy.id ? policy : p)));
      notify('error', errorMessage(err, 'Could not toggle that channel'));
    } finally {
      setBusyCell(null);
    }
  };

  const patch = async (policy: NotificationPolicy, body: Partial<NotificationPolicy>) => {
    try {
      const updated = await adminApi.updateNotificationPolicy(policy.id, body);
      setPolicies((prev) => prev.map((p) => (p.id === policy.id ? updated : p)));
      notify('success', `Updated ${policy.eventKey}`);
    } catch (err) {
      notify('error', errorMessage(err, 'Could not update the policy'));
    }
  };

  const create = async () => {
    setSaving(true);
    try {
      await adminApi.createNotificationPolicy({
        ...form,
        eventKey: form.eventKey.trim(),
        label: form.label.trim(),
      });
      notify('success', `Created policy for ${form.eventKey}`);
      setCreating(false);
      setForm(emptyPolicy);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not create the policy'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (policy: NotificationPolicy) => {
    if (!window.confirm(`Delete the policy for "${policy.eventKey}"?`)) return;
    try {
      await adminApi.deleteNotificationPolicy(policy.id);
      notify('success', `Deleted ${policy.eventKey}`);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not delete the policy'));
    }
  };

  if (loading) return <LoadingState label="Loading notification policies" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const criticalCount = policies.filter((p) => p.severity === 'CRITICAL').length;
  const digestCount = policies.filter((p) => p.digest).length;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Notifications</span>
          <h1 className="adm-page-title">
            <Bell size={22} color="var(--green)" /> Notification Policies
          </h1>
          <p className="adm-page-sub">
            The event catalog as a channel policy matrix. Toggle a cell to route an event to
            a channel — critical events must keep a channel and ignore quiet hours.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setCreating(true)}>
          New policy
        </Button>
      </div>

      <div className="adm-stats">
        <div className="adm-stat">
          <span className="adm-stat-icon"><Layers size={15} color="var(--green)" /></span>
          <span className="adm-stat-value">{policies.length}</span>
          <span className="adm-stat-label">Events in catalog</span>
        </div>
        <div className="adm-stat">
          <span className="adm-stat-icon"><Bell size={15} color="var(--red)" /></span>
          <span className="adm-stat-value">{criticalCount}</span>
          <span className="adm-stat-label">Critical severity</span>
        </div>
        <div className="adm-stat">
          <span className="adm-stat-icon"><Moon size={15} color="var(--amber)" /></span>
          <span className="adm-stat-value">{policies.filter((p) => p.quietHours).length}</span>
          <span className="adm-stat-label">Respect quiet hours</span>
        </div>
        <div className="adm-stat">
          <span className="adm-stat-icon"><Layers size={15} color="var(--green)" /></span>
          <span className="adm-stat-value">{digestCount}</span>
          <span className="adm-stat-label">Digested</span>
        </div>
      </div>

      <Panel
        title="Policy matrix"
        subtitle="Rows are events, columns are delivery channels."
        padded={false}
      >
        {policies.length === 0 ? (
          <EmptyState title="No policies yet" hint="Add the first event policy." />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Severity</th>
                  {channels.map((c) => (
                    <th key={c} className="adm-matrix-cell" style={{ width: 60 }}>
                      {CHANNEL_META[c]?.label ?? c}
                    </th>
                  ))}
                  <th>Audience</th>
                  <th className="adm-matrix-cell">Quiet</th>
                  <th className="adm-matrix-cell">Digest</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{policy.label}</div>
                      <div className="adm-row-sub adm-cell-mono">{policy.eventKey}</div>
                    </td>
                    <td>
                      <Select
                        value={policy.severity}
                        style={{ width: 108, padding: '5px 26px 5px 9px', fontSize: 11 }}
                        onChange={(e) =>
                          patch(policy, { severity: e.target.value as NotificationSeverity })
                        }
                      >
                        {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </Select>
                      <div style={{ marginTop: 4 }}>
                        <Badge tone={SEVERITY_TONE[policy.severity]}>{policy.severity}</Badge>
                      </div>
                    </td>

                    {channels.map((channel) => {
                      const on = policy.channels.includes(channel);
                      const cell = `${policy.id}:${channel}`;
                      return (
                        <td key={channel} className="adm-matrix-cell">
                          <button
                            className={`adm-chan-toggle ${on ? 'is-on' : ''}`}
                            disabled={busyCell === cell}
                            title={`${on ? 'Disable' : 'Enable'} ${CHANNEL_META[channel]?.label ?? channel} for ${policy.eventKey}`}
                            onClick={() => void toggleChannel(policy, channel)}
                          >
                            {CHANNEL_META[channel]?.icon}
                          </button>
                        </td>
                      );
                    })}

                    <td>
                      <Select
                        value={policy.audienceRole}
                        style={{ width: 130, padding: '5px 26px 5px 9px', fontSize: 11 }}
                        onChange={(e) => patch(policy, { audienceRole: e.target.value })}
                      >
                        {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
                      </Select>
                    </td>
                    <td className="adm-matrix-cell">
                      <Toggle
                        checked={policy.quietHours}
                        disabled={policy.severity === 'CRITICAL'}
                        label={`Quiet hours for ${policy.eventKey}`}
                        onChange={(next) => patch(policy, { quietHours: next })}
                      />
                    </td>
                    <td className="adm-matrix-cell">
                      <Toggle
                        checked={policy.digest}
                        label={`Digest for ${policy.eventKey}`}
                        onChange={(next) => patch(policy, { digest: next })}
                      />
                    </td>
                    <td style={{ width: 34 }}>
                      <button
                        className="adm-icon-btn is-danger"
                        title="Delete policy"
                        onClick={() => void remove(policy)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal
        open={creating}
        title="New notification policy"
        onClose={() => setCreating(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={saving}
              disabled={!form.eventKey.trim() || !form.label.trim()}
              onClick={create}
            >
              Create policy
            </Button>
          </>
        }
      >
        <div className="adm-form-row">
          <Field label="Event key" hint="Dotted event name, e.g. trip.cancelled.">
            <Input
              autoFocus
              className="adm-input-mono"
              value={form.eventKey}
              onChange={(e) => setForm({ ...form, eventKey: e.target.value })}
              placeholder="trip.cancelled"
            />
          </Field>
          <Field label="Label">
            <Input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Trip cancelled"
            />
          </Field>
        </div>

        <div className="adm-form-row">
          <Field label="Severity">
            <Select
              value={form.severity}
              onChange={(e) => {
                const severity = e.target.value as NotificationSeverity;
                // Critical events cannot be muted, so drop quiet hours with the change.
                setForm({
                  ...form,
                  severity,
                  quietHours: severity === 'CRITICAL' ? false : form.quietHours,
                });
              }}
            >
              {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Audience role">
            <Select
              value={form.audienceRole}
              onChange={(e) => setForm({ ...form, audienceRole: e.target.value })}
            >
              {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
            </Select>
          </Field>
        </div>

        <Field label="Channels">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {channels.map((channel) => {
              const on = form.channels.includes(channel);
              return (
                <button
                  key={channel}
                  className={`adm-chan-toggle ${on ? 'is-on' : ''}`}
                  style={{ width: 'auto', padding: '0 12px', gap: 6 }}
                  title={CHANNEL_META[channel]?.label ?? channel}
                  onClick={() =>
                    setForm({
                      ...form,
                      channels: on
                        ? form.channels.filter((c) => c !== channel)
                        : [...form.channels, channel],
                    })
                  }
                >
                  {CHANNEL_META[channel]?.icon}
                  <span style={{ fontSize: 11 }}>{CHANNEL_META[channel]?.label ?? channel}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Toggle
              checked={form.quietHours}
              disabled={form.severity === 'CRITICAL'}
              label="Quiet hours"
              onChange={(next) => setForm({ ...form, quietHours: next })}
            />
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
              Respect quiet hours
              {form.severity === 'CRITICAL' && (
                <span className="adm-row-sub">Unavailable for critical events</span>
              )}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Toggle
              checked={form.digest}
              label="Digest"
              onChange={(next) => setForm({ ...form, digest: next })}
            />
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Batch into a digest</span>
          </div>
        </div>
      </Modal>
    </>
  );
};
