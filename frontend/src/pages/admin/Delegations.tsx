import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight, CalendarClock, Handshake, Plus, Trash2, Undo2 } from 'lucide-react';
import { adminApi, errorMessage } from '../../services/adminApi';
import type { AdminUser, Delegation, DelegationStatus } from '../../services/adminApi';
import {
  Badge, Button, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Panel,
  Select, useToast,
} from '../../components/admin/ui';
import type { BadgeTone } from '../../components/admin/ui';
import { Stat } from './orgShared';

const STATUS_TONE: Record<DelegationStatus, BadgeTone> = {
  ACTIVE: 'green',
  SCHEDULED: 'blue',
  EXPIRED: 'grey',
  REVOKED: 'red',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

export const Delegations: React.FC = () => {
  const { notify } = useToast();
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fromUserId: '', toUserId: '', startDate: '', endDate: '', reason: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [delegationData, userData] = await Promise.all([adminApi.delegations(), adminApi.users()]);
      setDelegations(delegationData);
      setUsers(userData);
    } catch (err) {
      setError(errorMessage(err, 'Could not load the delegations'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openCreate = () => {
    const today = new Date();
    const inAWeek = new Date();
    inAWeek.setDate(today.getDate() + 7);
    setForm({
      fromUserId: users[0]?.id ?? '',
      toUserId: users[1]?.id ?? '',
      startDate: toDateInput(today),
      endDate: toDateInput(inAWeek),
      reason: '',
    });
    setCreating(true);
  };

  const create = async () => {
    setSaving(true);
    try {
      await adminApi.createDelegation({
        fromUserId: form.fromUserId,
        toUserId: form.toUserId,
        // Send the end date as end-of-day so a single-day window is inclusive.
        startDate: new Date(`${form.startDate}T00:00:00`).toISOString(),
        endDate: new Date(`${form.endDate}T23:59:59`).toISOString(),
        reason: form.reason.trim() || undefined,
      });
      notify('success', 'Delegation created');
      setCreating(false);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not create the delegation'));
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (delegation: Delegation) => {
    if (!window.confirm(
      `Revoke the delegation from ${delegation.fromUser.email} to ${delegation.toUser.email}?`,
    )) return;
    try {
      await adminApi.revokeDelegation(delegation.id);
      notify('success', 'Delegation revoked');
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not revoke the delegation'));
    }
  };

  const remove = async (delegation: Delegation) => {
    if (!window.confirm('Delete this delegation record entirely?')) return;
    try {
      await adminApi.deleteDelegation(delegation.id);
      notify('success', 'Delegation deleted');
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not delete the delegation'));
    }
  };

  if (loading) return <LoadingState label="Loading delegations" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const count = (status: DelegationStatus) => delegations.filter((d) => d.status === status).length;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">P-01 · Identity, RBAC &amp; Org</span>
          <h1 className="adm-page-title">
            <Handshake size={22} color="var(--green)" /> Delegations
          </h1>
          <p className="adm-page-sub">
            Hand a user's approval authority to someone else for a fixed window — leave
            cover, in short. While a delegation is active the delegate picks up the
            delegator's capabilities, visible on the{' '}
            <span style={{ color: 'var(--green)' }}>Permissions</span> screen.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={14} />}
          disabled={users.length < 2}
          onClick={openCreate}
        >
          New delegation
        </Button>
      </div>

      <div className="adm-stats">
        <Stat icon={<Handshake size={15} color="var(--green)" />} value={count('ACTIVE')} label="Active now" />
        <Stat icon={<CalendarClock size={15} color="#5aa0e6" />} value={count('SCHEDULED')} label="Scheduled" />
        <Stat icon={<CalendarClock size={15} color="var(--text-3)" />} value={count('EXPIRED')} label="Expired" />
        <Stat icon={<Undo2 size={15} color="var(--red)" />} value={count('REVOKED')} label="Revoked" />
      </div>

      {users.length < 2 && (
        <div className="adm-chain-banner is-broken" style={{ marginBottom: 16 }}>
          <Handshake size={16} />
          <span>
            Delegation needs at least two users — there {users.length === 1 ? 'is' : 'are'}{' '}
            only {users.length} in the system. Add another via Imports → Users.
          </span>
        </div>
      )}

      <Panel
        title="All delegations"
        subtitle="A user may hold only one live delegation at a time — overlapping windows are refused."
        padded={false}
      >
        {delegations.length === 0 ? (
          <EmptyState
            title="No delegations"
            hint="Create one when someone needs cover for their approvals."
          />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Authority transfer</th>
                  <th>Window</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {delegations.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>
                            {d.fromUser.firstName} {d.fromUser.lastName}
                          </div>
                          <div className="adm-row-sub">{d.fromUser.email}</div>
                        </div>
                        <ArrowRight size={14} color="var(--green)" />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>
                            {d.toUser.firstName} {d.toUser.lastName}
                          </div>
                          <div className="adm-row-sub">{d.toUser.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="adm-cell-mono">
                      {formatDate(d.startDate)} → {formatDate(d.endDate)}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-2)', maxWidth: 220 }}>
                      {d.reason || <span className="adm-row-sub">—</span>}
                    </td>
                    <td>
                      <Badge tone={STATUS_TONE[d.status]}>{d.status}</Badge>
                      {d.revokedAt && (
                        <div className="adm-row-sub" style={{ marginTop: 3 }}>
                          {formatDate(d.revokedAt)}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="adm-cell-actions">
                        {(d.status === 'ACTIVE' || d.status === 'SCHEDULED') && (
                          <Button
                            variant="subtle"
                            size="sm"
                            icon={<Undo2 size={12} />}
                            onClick={() => void revoke(d)}
                          >
                            Revoke
                          </Button>
                        )}
                        <button
                          className="adm-icon-btn is-danger"
                          title="Delete record"
                          onClick={() => void remove(d)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
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
        title="New delegation"
        subtitle="The delegate gains the delegator's capabilities for this window only."
        onClose={() => setCreating(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={saving}
              disabled={
                !form.fromUserId || !form.toUserId ||
                form.fromUserId === form.toUserId ||
                !form.startDate || !form.endDate
              }
              onClick={create}
            >
              Create delegation
            </Button>
          </>
        }
      >
        <Field label="Delegate from" hint="Whose authority is being handed over.">
          <Select
            value={form.fromUserId}
            onChange={(e) => setForm({ ...form, fromUserId: e.target.value })}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.roles.join(', ') || 'no roles'})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Delegate to" hint="Inactive users cannot receive authority.">
          <Select
            value={form.toUserId}
            onChange={(e) => setForm({ ...form, toUserId: e.target.value })}
          >
            {users
              .filter((user) => user.id !== form.fromUserId)
              .map((user) => (
                <option key={user.id} value={user.id} disabled={!user.isActive}>
                  {user.firstName} {user.lastName}
                  {user.isActive ? '' : ' — inactive'}
                </option>
              ))}
          </Select>
        </Field>

        <div className="adm-form-row">
          <Field label="Start date">
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </Field>
          <Field label="End date">
            <Input
              type="date"
              value={form.endDate}
              min={form.startDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Reason">
          <Input
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Annual leave"
          />
        </Field>
      </Modal>
    </>
  );
};
