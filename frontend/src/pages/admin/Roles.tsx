import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, ShieldAlert, ShieldCheck, Trash2, Users } from 'lucide-react';
import { adminApi, errorConflicts, errorMessage } from '../../services/adminApi';
import type {
  AdminRole, Capability, CapabilityScope, SegregationConflict, SegregationRule,
} from '../../services/adminApi';
import {
  Button, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Panel,
  Select, useToast,
} from '../../components/admin/ui';
import { SCOPES, Stat } from './orgShared';

export const Roles: React.FC = () => {
  const { notify } = useToast();
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [sodRules, setSodRules] = useState<SegregationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Record<string, CapabilityScope>>({});
  const [conflicts, setConflicts] = useState<SegregationConflict[]>([]);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [roleData, capData, sodData] = await Promise.all([
        adminApi.roles(),
        adminApi.capabilities(),
        adminApi.segregationRules(),
      ]);
      setRoles(roleData);
      setCapabilities(capData);
      setSodRules(sodData);
      setSelectedId((current) => current ?? roleData[0]?.id ?? null);
    } catch (err) {
      setError(errorMessage(err, 'Could not load the roles'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selected = roles.find((r) => r.id === selectedId) ?? null;

  // Reset the draft matrix whenever a different role is opened.
  useEffect(() => {
    if (!selected) return setDraft({});
    const next: Record<string, CapabilityScope> = {};
    selected.capabilities.forEach((c) => { next[c.capabilityKey] = c.scope; });
    setDraft(next);
  }, [selectedId, roles]); // eslint-disable-line react-hooks/exhaustive-deps

  // The validator runs live against the draft, not the saved role.
  useEffect(() => {
    const keys = Object.keys(draft);
    if (keys.length === 0) return setConflicts([]);

    let cancelled = false;
    adminApi
      .validateSegregation(keys)
      .then((found) => { if (!cancelled) setConflicts(found); })
      .catch(() => { if (!cancelled) setConflicts([]); });

    return () => { cancelled = true; };
  }, [draft]);

  const conflictKeys = useMemo(() => {
    const keys = new Set<string>();
    conflicts.forEach((c) => { keys.add(c.capabilityA); keys.add(c.capabilityB); });
    return keys;
  }, [conflicts]);

  const grouped = useMemo(() => {
    const map = new Map<string, Capability[]>();
    capabilities.forEach((cap) => map.set(cap.group, [...(map.get(cap.group) ?? []), cap]));
    return [...map.entries()];
  }, [capabilities]);

  const dirty = useMemo(() => {
    if (!selected) return false;
    const saved: Record<string, CapabilityScope> = {};
    selected.capabilities.forEach((c) => { saved[c.capabilityKey] = c.scope; });
    return JSON.stringify(saved) !== JSON.stringify(draft);
  }, [selected, draft]);

  const toggle = (key: string) =>
    setDraft((d) => {
      const next = { ...d };
      if (key in next) delete next[key];
      else next[key] = 'HUB';
      return next;
    });

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminApi.setRoleCapabilities(
        selected.id,
        Object.entries(draft).map(([capabilityKey, scope]) => ({ capabilityKey, scope })),
      );
      notify('success', `Saved the capability matrix for ${selected.name}`);
      await load();
    } catch (err) {
      const found = errorConflicts(err);
      if (found.length > 0) {
        setConflicts(found);
        notify('error', 'Blocked: this set violates segregation of duties');
      } else {
        notify('error', errorMessage(err, 'Could not save the role'));
      }
    } finally {
      setSaving(false);
    }
  };

  const createRole = async () => {
    setSaving(true);
    try {
      const created = await adminApi.createRole({
        name: newRole.name.trim().toUpperCase(),
        description: newRole.description.trim() || undefined,
      });
      notify('success', `Created role ${created.name}`);
      setCreating(false);
      setNewRole({ name: '', description: '' });
      await load();
      setSelectedId(created.id);
    } catch (err) {
      notify('error', errorMessage(err, 'Could not create the role'));
    } finally {
      setSaving(false);
    }
  };

  const removeRole = async (role: AdminRole) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try {
      await adminApi.deleteRole(role.id);
      notify('success', `Deleted ${role.name}`);
      if (selectedId === role.id) setSelectedId(null);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not delete the role'));
    }
  };

  if (loading) return <LoadingState label="Loading roles" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">P-01 · Identity, RBAC &amp; Org</span>
          <h1 className="adm-page-title">
            <ShieldCheck size={22} color="var(--green)" /> Role Builder
          </h1>
          <p className="adm-page-sub">
            Each role is a capability × scope matrix. The segregation validator runs as you
            edit and the API refuses to save a conflicting set.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setCreating(true)}>
          New role
        </Button>
      </div>

      <div className="adm-stats">
        <Stat icon={<ShieldCheck size={15} color="var(--green)" />} value={roles.length} label="Roles" />
        <Stat icon={<ShieldCheck size={15} color="var(--green)" />} value={capabilities.length} label="Capabilities" />
        <Stat icon={<ShieldAlert size={15} color="var(--amber)" />} value={sodRules.length} label="Segregation rules" />
        <Stat
          icon={<Users size={15} color="var(--green)" />}
          value={roles.reduce((sum, r) => sum + r.userCount, 0)}
          label="Role assignments"
        />
      </div>

      <div className="adm-grid-side">
        <Panel
          title={selected ? `Matrix · ${selected.name}` : 'Role builder'}
          subtitle={
            selected
              ? 'Tick a capability, then choose the scope it applies at.'
              : 'Pick a role to edit its matrix'
          }
          actions={
            selected && (
              <Button
                variant="primary"
                loading={saving}
                disabled={!dirty || conflicts.length > 0}
                onClick={save}
              >
                {conflicts.length > 0 ? 'Resolve conflicts to save' : dirty ? 'Save matrix' : 'Saved'}
              </Button>
            )
          }
        >
          {!selected ? (
            <EmptyState title="No role selected" hint="Choose a role from the list on the right." />
          ) : (
            <>
              <div
                className={`adm-sod ${conflicts.length > 0 ? 'is-conflict' : 'is-clean'}`}
                style={{ marginBottom: 18 }}
              >
                {conflicts.length > 0 ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                <div>
                  <strong>
                    {conflicts.length > 0
                      ? `${conflicts.length} segregation conflict${conflicts.length > 1 ? 's' : ''}`
                      : 'Segregation validator: clean'}
                  </strong>
                  {conflicts.length > 0 ? (
                    <ul className="adm-sod-list">
                      {conflicts.map((c) => (
                        <li key={`${c.capabilityA}-${c.capabilityB}`}>· {c.message}</li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ marginTop: 3 }}>
                      This set holds {Object.keys(draft).length} capabilit
                      {Object.keys(draft).length === 1 ? 'y' : 'ies'} and breaks none of the{' '}
                      {sodRules.length} rules.
                    </div>
                  )}
                </div>
              </div>

              {grouped.map(([group, caps]) => (
                <div className="adm-matrix-group" key={group}>
                  <span className="adm-matrix-group-title mono-label">{group}</span>
                  {caps.map((cap) => {
                    const on = cap.key in draft;
                    const bad = on && conflictKeys.has(cap.key);
                    return (
                      <div
                        key={cap.key}
                        className={`adm-cap-row ${on ? 'is-on' : ''} ${bad ? 'is-conflict' : ''}`}
                      >
                        <input
                          type="checkbox"
                          className="adm-checkbox"
                          checked={on}
                          onChange={() => toggle(cap.key)}
                          aria-label={cap.label}
                        />
                        <div className="adm-cap-label">
                          {cap.label}
                          <span className="adm-cap-key">{cap.key}</span>
                        </div>
                        {bad && <ShieldAlert size={14} color="var(--red)" />}
                        <Select
                          className="adm-scope-select"
                          value={draft[cap.key] ?? ''}
                          disabled={!on}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, [cap.key]: e.target.value as CapabilityScope }))
                          }
                        >
                          {!on && <option value="">—</option>}
                          {SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </Select>
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Panel title="Roles" padded={false}>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <tbody>
                  {roles.map((role) => (
                    <tr
                      key={role.id}
                      onClick={() => setSelectedId(role.id)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedId === role.id ? 'var(--green-glow)' : undefined,
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 600 }}>{role.name}</div>
                        <div className="adm-row-sub">
                          {role.capabilities.length} capabilities · {role.userCount} user
                          {role.userCount === 1 ? '' : 's'}
                        </div>
                      </td>
                      <td style={{ width: 40 }}>
                        <div className="adm-cell-actions">
                          <button
                            className="adm-icon-btn is-danger"
                            title="Delete role"
                            onClick={(e) => { e.stopPropagation(); void removeRole(role); }}
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
          </Panel>

          <Panel title="Segregation rules" subtitle="Capability pairs no single role may hold.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sodRules.map((rule) => (
                <div key={rule.id} style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3, flexWrap: 'wrap' }}>
                    <span className="adm-hash">{rule.capabilityA}</span>
                    <span style={{ color: 'var(--text-3)' }}>×</span>
                    <span className="adm-hash">{rule.capabilityB}</span>
                  </div>
                  {rule.message}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <Modal
        open={creating}
        title="New role"
        onClose={() => setCreating(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} disabled={!newRole.name.trim()} onClick={createRole}>
              Create role
            </Button>
          </>
        }
      >
        <Field label="Name" hint="Stored uppercase, e.g. FINANCE_CONTROLLER.">
          <Input
            autoFocus
            className="adm-input-mono"
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            placeholder="FINANCE_CONTROLLER"
          />
        </Field>
        <Field label="Description">
          <Input
            value={newRole.description}
            onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
            placeholder="Approves settlements for the west region"
          />
        </Field>
      </Modal>
    </>
  );
};
