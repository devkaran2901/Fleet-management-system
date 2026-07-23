import React, { useCallback, useEffect, useState } from 'react';
import { GitCommitVertical, ListTree, Search } from 'lucide-react';
import { adminApi, errorMessage } from '../../services/adminApi';
import type { AuditEvent } from '../../services/adminApi';
import {
  Badge, Button, EmptyState, ErrorState, Field, LoadingState, Panel, Select, useToast,
} from '../../components/admin/ui';
import type { BadgeTone } from '../../components/admin/ui';

const ENTITIES = [
  'OrgNode', 'Role', 'User', 'CostCenter', 'Delegation', 'RulePack', 'RulePackVersion',
  'ApprovalFlow', 'NotificationPolicy', 'Connector', 'ImportJob',
];

const actionTone = (action: string): BadgeTone => {
  if (action.includes('deleted') || action.includes('failed')) return 'red';
  if (action.includes('created') || action.includes('committed') || action.includes('activated')) return 'green';
  if (action.includes('changed') || action.includes('updated') || action.includes('toggled')) return 'amber';
  return 'grey';
};

const shortHash = (hash: string) => `${hash.slice(0, 8)}…${hash.slice(-4)}`;

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

/**
 * Standalone lineage viewer: pick any event and walk `parentId` back to the
 * action that started the chain. Import jobs are the richest example — upload →
 * map → validate → commit are linked, so a commit traces back to its upload.
 */
export const Lineage: React.FC = () => {
  const { notify } = useToast();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [entity, setEntity] = useState('');
  const [selected, setSelected] = useState<AuditEvent | null>(null);
  const [chain, setChain] = useState<AuditEvent[] | null>(null);
  const [walking, setWalking] = useState(false);

  const load = useCallback(async (forEntity = entity) => {
    setLoading(true);
    setError('');
    try {
      setEvents(await adminApi.auditEvents({ entity: forEntity || undefined, take: 100 }));
    } catch (err) {
      setError(errorMessage(err, 'Could not load events'));
    } finally {
      setLoading(false);
    }
  }, [entity]);

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const walk = async (event: AuditEvent) => {
    setSelected(event);
    setWalking(true);
    try {
      setChain(await adminApi.auditLineage(event.id));
    } catch (err) {
      notify('error', errorMessage(err, 'Could not walk the lineage'));
    } finally {
      setWalking(false);
    }
  };

  if (loading) return <LoadingState label="Loading events" />;
  if (error) return <ErrorState message={error} onRetry={() => load()} />;

  const linked = events.filter((e) => e.parentId).length;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Audit</span>
          <h1 className="adm-page-title">
            <ListTree size={22} color="var(--green)" /> Lineage Explorer
          </h1>
          <p className="adm-page-sub">
            Pick any event and walk it back to the action that originated it. Events are
            linked by a parent reference as work moves through a process — an import commit,
            for instance, traces back through validate and map to the original upload.
          </p>
        </div>
      </div>

      <div className="adm-chain-banner is-valid" style={{ marginBottom: 20 }}>
        <GitCommitVertical size={16} />
        <span>
          {linked} of the {events.length} loaded events carry a parent link. Events without
          one are originating actions — their lineage is just themselves.
        </span>
      </div>

      <div className="adm-grid-side">
        <Panel
          title="Pick an event"
          subtitle="Newest first"
          actions={
            <div className="adm-filters">
              <Field label="Entity">
                <Select value={entity} onChange={(e) => setEntity(e.target.value)}>
                  <option value="">All entities</option>
                  {ENTITIES.map((e) => <option key={e} value={e}>{e}</option>)}
                </Select>
              </Field>
              <Button variant="subtle" icon={<Search size={13} />} onClick={() => load(entity)}>
                Apply
              </Button>
            </div>
          }
          padded={false}
        >
          {events.length === 0 ? (
            <EmptyState title="No events" hint="Make a change in the admin suite first." />
          ) : (
            <div className="adm-table-wrap" style={{ maxHeight: 560, overflowY: 'auto' }}>
              <table className="adm-table">
                <tbody>
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      onClick={() => void walk(event)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selected?.id === event.id ? 'var(--green-glow)' : undefined,
                      }}
                    >
                      <td style={{ width: 40 }} className="adm-cell-mono">{event.seq}</td>
                      <td>
                        <Badge tone={actionTone(event.action)}>{event.action}</Badge>
                        <div className="adm-row-sub" style={{ marginTop: 4 }}>
                          {event.entity} · {formatTime(event.createdAt)}
                        </div>
                      </td>
                      <td style={{ width: 66 }}>
                        {event.parentId ? (
                          <Badge tone="blue">linked</Badge>
                        ) : (
                          <Badge tone="grey">origin</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel
          title="Lineage"
          subtitle={selected ? `${selected.action} · seq ${selected.seq}` : 'Select an event'}
        >
          {walking && <LoadingState label="Walking the chain" />}

          {!walking && !chain && (
            <EmptyState
              title="Nothing traced yet"
              hint="Choose an event on the left to walk its chain back to the origin."
            />
          )}

          {!walking && chain && (
            <ul className="adm-lineage">
              {chain.map((event, index) => (
                <li
                  key={event.id}
                  className={`adm-lineage-item ${index === 0 ? 'is-origin' : ''}`}
                >
                  <span className="adm-lineage-node" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <Badge tone={actionTone(event.action)}>{event.action}</Badge>
                    {index === 0 && <Badge tone="blue">ORIGIN</Badge>}
                    {index === chain.length - 1 && chain.length > 1 && (
                      <Badge tone="green">SELECTED</Badge>
                    )}
                  </div>
                  <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>
                    seq {event.seq} · {formatTime(event.createdAt)} · {event.actorEmail}
                  </span>
                  <pre className="adm-json">{JSON.stringify(event.payload, null, 2)}</pre>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    <span className="adm-hash" title={event.prevHash}>prev {shortHash(event.prevHash)}</span>
                    <span className="adm-hash" title={event.hash}>hash {shortHash(event.hash)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
};
