import React, { useCallback, useEffect, useState } from 'react';
import { Check, CircleSlash, FlaskConical, Handshake, UserCog, X } from 'lucide-react';
import { adminApi, errorMessage } from '../../services/adminApi';
import type {
  AdminUser, CapabilityScope, EffectivePermissions, PermissionMatrix, SimulationVerdict,
} from '../../services/adminApi';
import {
  Badge, Button, EmptyState, ErrorState, Field, LoadingState, Panel, Select, useToast,
} from '../../components/admin/ui';
import type { BadgeTone } from '../../components/admin/ui';

const SCOPE_TONE: Record<CapabilityScope, BadgeTone> = {
  GLOBAL: 'green',
  REGION: 'blue',
  HUB: 'amber',
  SELF: 'grey',
};

export const Permissions: React.FC = () => {
  const { notify } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [matrix, setMatrix] = useState<PermissionMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [userId, setUserId] = useState('');
  const [effective, setEffective] = useState<EffectivePermissions | null>(null);
  const [resolving, setResolving] = useState(false);

  const [capabilityKey, setCapabilityKey] = useState('');
  const [verdict, setVerdict] = useState<SimulationVerdict | null>(null);
  const [simulating, setSimulating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [userData, matrixData] = await Promise.all([
        adminApi.users(),
        adminApi.permissionMatrix(),
      ]);
      setUsers(userData);
      setMatrix(matrixData);
      setUserId((current) => current || userData[0]?.id || '');
      setCapabilityKey((current) => current || matrixData.capabilities[0]?.key || '');
    } catch (err) {
      setError(errorMessage(err, 'Could not load the permission data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Resolve effective access whenever the chosen user changes.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setResolving(true);
    setVerdict(null);

    adminApi
      .effectivePermissions(userId)
      .then((data) => { if (!cancelled) setEffective(data); })
      .catch((err) => {
        if (!cancelled) notify('error', errorMessage(err, 'Could not resolve permissions'));
      })
      .finally(() => { if (!cancelled) setResolving(false); });

    return () => { cancelled = true; };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const simulate = async () => {
    if (!userId || !capabilityKey) return;
    setSimulating(true);
    try {
      setVerdict(await adminApi.simulatePermission(userId, capabilityKey));
    } catch (err) {
      notify('error', errorMessage(err, 'The simulation failed'));
    } finally {
      setSimulating(false);
    }
  };

  if (loading) return <LoadingState label="Loading permissions" />;
  if (error || !matrix) return <ErrorState message={error} onRetry={load} />;

  const groups = [...new Set(matrix.capabilities.map((c) => c.group))];

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">P-01 · Identity, RBAC &amp; Org</span>
          <h1 className="adm-page-title">
            <UserCog size={22} color="var(--green)" /> Permissions
          </h1>
          <p className="adm-page-sub">
            What someone can actually do, once their stacked roles and any active delegation
            are merged. Where two roles grant the same capability, the broader scope wins.
          </p>
        </div>
      </div>

      <div className="adm-grid-side">
        <Panel
          title="Effective permissions"
          subtitle={
            effective
              ? `${effective.capabilities.length} capabilit${effective.capabilities.length === 1 ? 'y' : 'ies'} resolved for ${effective.user.email}`
              : 'Pick a user to resolve their access'
          }
          actions={
            <Select
              style={{ width: 260 }}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </Select>
          }
        >
          {resolving && <LoadingState label="Resolving" />}

          {!resolving && effective && (
            <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {effective.user.roles.map((role) => <Badge key={role} tone="green">{role}</Badge>)}
                {effective.user.roles.length === 0 && <Badge tone="grey">No roles</Badge>}
                {!effective.user.isActive && <Badge tone="red">Deactivated</Badge>}
              </div>

              {effective.activeDelegations.length > 0 && (
                <div className="adm-sod" style={{ marginBottom: 14 }}>
                  <Handshake size={15} />
                  <div>
                    <strong>Holding delegated authority</strong>
                    <ul className="adm-sod-list">
                      {effective.activeDelegations.map((d) => (
                        <li key={d.id}>
                          · from {d.from}, until{' '}
                          {new Date(d.endDate).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {!effective.user.isActive && (
                <div className="adm-sod is-conflict" style={{ marginBottom: 14 }}>
                  <CircleSlash size={15} />
                  <span>
                    This account is deactivated, so every capability below is denied at
                    runtime regardless of what the roles grant.
                  </span>
                </div>
              )}

              {effective.capabilities.length === 0 ? (
                <EmptyState
                  title="No capabilities"
                  hint="This user holds no roles, so they can do nothing."
                />
              ) : (
                groups.map((group) => {
                  const caps = effective.capabilities.filter((c) => c.group === group);
                  if (caps.length === 0) return null;
                  return (
                    <div className="adm-matrix-group" key={group}>
                      <span className="adm-matrix-group-title mono-label">{group}</span>
                      {caps.map((cap) => (
                        <div key={cap.capabilityKey} className="adm-cap-row is-on">
                          <Check size={14} color="var(--green)" />
                          <div className="adm-cap-label">
                            {cap.label}
                            <span className="adm-cap-key">
                              {cap.capabilityKey} · via{' '}
                              {cap.grantedBy.map((g) => `${g.roleName}@${g.scope}`).join(', ')}
                            </span>
                          </div>
                          {cap.viaDelegation && <Badge tone="blue">delegated</Badge>}
                          <Badge tone={SCOPE_TONE[cap.scope]}>{cap.scope}</Badge>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </>
          )}
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Panel title="Permission simulator" subtitle="Can this user do this?">
            <Field label="Capability">
              <Select value={capabilityKey} onChange={(e) => setCapabilityKey(e.target.value)}>
                {groups.map((group) => (
                  <optgroup key={group} label={group}>
                    {matrix.capabilities
                      .filter((c) => c.group === group)
                      .map((cap) => (
                        <option key={cap.key} value={cap.key}>{cap.label}</option>
                      ))}
                  </optgroup>
                ))}
              </Select>
            </Field>

            <Button
              variant="primary"
              icon={<FlaskConical size={14} />}
              loading={simulating}
              disabled={!userId || !capabilityKey}
              onClick={simulate}
              style={{ width: '100%' }}
            >
              Check access
            </Button>

            {verdict && (
              <div
                className={`adm-sod ${verdict.allowed ? 'is-clean' : 'is-conflict'}`}
                style={{ marginTop: 16 }}
              >
                {verdict.allowed ? <Check size={16} /> : <X size={16} />}
                <div>
                  <strong>{verdict.allowed ? 'Allowed' : 'Denied'}</strong>
                  {verdict.scope && (
                    <span style={{ marginLeft: 8 }}>
                      <Badge tone={SCOPE_TONE[verdict.scope]}>{verdict.scope}</Badge>
                    </span>
                  )}
                  <div style={{ marginTop: 5 }}>{verdict.reason}</div>
                </div>
              </div>
            )}
          </Panel>

          <Panel
            title="Capability × role grid"
            subtitle="Which roles grant what, and at which scope"
            padded={false}
          >
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Capability</th>
                    {matrix.roles.map((role) => (
                      <th key={role.id} className="adm-matrix-cell">{role.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.capabilities.map((cap) => (
                    <tr key={cap.key}>
                      <td>
                        <div style={{ fontSize: 12 }}>{cap.label}</div>
                        <div className="adm-row-sub adm-cell-mono">{cap.key}</div>
                      </td>
                      {matrix.roles.map((role) => {
                        const scope = role.grants[cap.key];
                        return (
                          <td key={role.id} className="adm-matrix-cell">
                            {scope ? (
                              <Badge tone={SCOPE_TONE[scope]}>{scope}</Badge>
                            ) : (
                              <span style={{ color: 'var(--text-3)' }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
};
