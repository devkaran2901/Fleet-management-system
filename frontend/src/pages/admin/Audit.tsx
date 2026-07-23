import React, { useCallback, useEffect, useState } from 'react';
import {
  Download, GitCommitVertical, RefreshCw, ScrollText, ShieldAlert, ShieldCheck, Search,
} from 'lucide-react';
import { adminApi, errorMessage } from '../../services/adminApi';
import type { AuditEvent, ChainVerification } from '../../services/adminApi';
import {
  Badge, Button, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Panel,
  Select, useToast,
} from '../../components/admin/ui';
import type { BadgeTone } from '../../components/admin/ui';

const ENTITIES = [
  'OrgNode', 'Role', 'User', 'RulePack', 'RulePackVersion', 'ApprovalFlow',
  'NotificationPolicy', 'Connector', 'ImportJob',
];

/** Colour the row by what the action did, not which module raised it. */
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

export const Audit: React.FC = () => {
  const { notify } = useToast();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [chain, setChain] = useState<ChainVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const [filters, setFilters] = useState({ entity: '', action: '', actorEmail: '' });

  const [lineage, setLineage] = useState<AuditEvent[] | null>(null);
  const [lineageFor, setLineageFor] = useState<AuditEvent | null>(null);
  const [lineageLoading, setLineageLoading] = useState(false);

  const load = useCallback(async (active = filters) => {
    setLoading(true);
    setError('');
    try {
      const [eventData, chainData] = await Promise.all([
        adminApi.auditEvents({
          entity: active.entity || undefined,
          action: active.action || undefined,
          actorEmail: active.actorEmail || undefined,
          take: 200,
        }),
        adminApi.verifyAuditChain(),
      ]);
      setEvents(eventData);
      setChain(chainData);
    } catch (err) {
      setError(errorMessage(err, 'Could not load the audit log'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const verify = async () => {
    setVerifying(true);
    try {
      const result = await adminApi.verifyAuditChain();
      setChain(result);
      notify(
        result.valid ? 'success' : 'error',
        result.valid
          ? `Chain intact across ${result.checked} event(s)`
          : `Chain broken at seq ${result.brokenAtSeq}`,
      );
    } catch (err) {
      notify('error', errorMessage(err, 'Could not verify the chain'));
    } finally {
      setVerifying(false);
    }
  };

  const openLineage = async (event: AuditEvent) => {
    setLineageFor(event);
    setLineageLoading(true);
    try {
      setLineage(await adminApi.auditLineage(event.id));
    } catch (err) {
      notify('error', errorMessage(err, 'Could not walk the lineage'));
      setLineageFor(null);
    } finally {
      setLineageLoading(false);
    }
  };

  /** Register export — the filtered view, as CSV. */
  const exportCsv = () => {
    const header = ['seq', 'createdAt', 'actorEmail', 'action', 'entity', 'entityId', 'hash', 'prevHash'];
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const body = events.map((e) =>
      [e.seq, e.createdAt, e.actorEmail, e.action, e.entity, e.entityId, e.hash, e.prevHash]
        .map(escape)
        .join(','),
    );
    const csv = [header.join(','), ...body].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-register-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify('success', `Exported ${events.length} event(s)`);
  };

  if (loading) return <LoadingState label="Loading the audit log" />;
  if (error) return <ErrorState message={error} onRetry={() => load()} />;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Audit</span>
          <h1 className="adm-page-title">
            <ScrollText size={22} color="var(--green)" /> Audit Explorer
          </h1>
          <p className="adm-page-sub">
            An append-only event store with a tamper-evident hash chain. Open any event to
            walk its lineage back to the originating request.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="subtle" icon={<Download size={14} />} onClick={exportCsv}>
            Export register
          </Button>
          <Button
            variant="primary"
            icon={<ShieldCheck size={14} />}
            loading={verifying}
            onClick={verify}
          >
            Verify chain
          </Button>
        </div>
      </div>

      {chain && (
        <div className={`adm-chain-banner ${chain.valid ? 'is-valid' : 'is-broken'}`}>
          {chain.valid ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
          <span>
            {chain.valid ? (
              <>
                <strong>Chain intact.</strong> All {chain.checked} event hashes recompute
                correctly — the history has not been altered.
              </>
            ) : (
              <>
                <strong>Chain broken at seq {chain.brokenAtSeq}.</strong> An event was
                modified or removed after it was written.
              </>
            )}
          </span>
        </div>
      )}

      <Panel
        title="Events"
        subtitle={`${events.length} most recent event(s), newest first`}
        actions={
          <div className="adm-filters">
            <Field label="Entity">
              <Select
                value={filters.entity}
                onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
              >
                <option value="">All entities</option>
                {ENTITIES.map((e) => <option key={e} value={e}>{e}</option>)}
              </Select>
            </Field>
            <Field label="Action">
              <Input
                placeholder="e.g. created"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              />
            </Field>
            <Field label="Actor">
              <Input
                placeholder="email contains…"
                value={filters.actorEmail}
                onChange={(e) => setFilters({ ...filters, actorEmail: e.target.value })}
              />
            </Field>
            <Button variant="subtle" icon={<Search size={13} />} onClick={() => load(filters)}>
              Apply
            </Button>
            <Button
              variant="ghost"
              icon={<RefreshCw size={13} />}
              onClick={() => {
                const cleared = { entity: '', action: '', actorEmail: '' };
                setFilters(cleared);
                void load(cleared);
              }}
            >
              Clear
            </Button>
          </div>
        }
        padded={false}
      >
        {events.length === 0 ? (
          <EmptyState
            title="No events match"
            hint="Change something in the admin suite and it will appear here."
          />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: 46 }}>Seq</th>
                  <th>When</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Hash</th>
                  <th style={{ textAlign: 'right' }}>Lineage</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="adm-cell-mono">{event.seq}</td>
                    <td className="adm-cell-mono">{formatTime(event.createdAt)}</td>
                    <td style={{ fontSize: 12 }}>{event.actorEmail}</td>
                    <td>
                      <Badge tone={actionTone(event.action)}>{event.action}</Badge>
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>{event.entity}</div>
                      {event.entityId && (
                        <div className="adm-row-sub adm-cell-mono">
                          {event.entityId.slice(0, 8)}…
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="adm-hash" title={event.hash}>{shortHash(event.hash)}</span>
                    </td>
                    <td>
                      <div className="adm-cell-actions">
                        <Button
                          variant="subtle"
                          size="sm"
                          icon={<GitCommitVertical size={12} />}
                          onClick={() => void openLineage(event)}
                        >
                          {event.parentId ? 'Walk back' : 'View'}
                        </Button>
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
        open={lineageFor !== null}
        wide
        title="Event lineage"
        subtitle={
          lineageFor
            ? `${lineageFor.action} · seq ${lineageFor.seq} — oldest (originating) event first`
            : undefined
        }
        onClose={() => { setLineageFor(null); setLineage(null); }}
        footer={
          <Button variant="ghost" onClick={() => { setLineageFor(null); setLineage(null); }}>
            Close
          </Button>
        }
      >
        {lineageLoading && <LoadingState label="Walking the chain" />}

        {!lineageLoading && lineage && (
          <>
            {lineage.length === 1 && (
              <div className="adm-sod" style={{ marginBottom: 16 }}>
                <GitCommitVertical size={15} />
                <span>
                  This event has no parent — it is an originating action, so the lineage is
                  just itself.
                </span>
              </div>
            )}

            <ul className="adm-lineage">
              {lineage.map((event, index) => (
                <li
                  key={event.id}
                  className={`adm-lineage-item ${index === 0 ? 'is-origin' : ''}`}
                >
                  <span className="adm-lineage-node" />
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                      marginBottom: 6,
                    }}
                  >
                    <Badge tone={actionTone(event.action)}>{event.action}</Badge>
                    {index === 0 && <Badge tone="blue">ORIGIN</Badge>}
                    <span className="adm-cell-mono" style={{ fontSize: 10 }}>
                      seq {event.seq} · {formatTime(event.createdAt)} · {event.actorEmail}
                    </span>
                  </div>
                  <pre className="adm-json">{JSON.stringify(event.payload, null, 2)}</pre>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    <span className="adm-hash" title={`prev: ${event.prevHash}`}>
                      prev {shortHash(event.prevHash)}
                    </span>
                    <span className="adm-hash" title={`hash: ${event.hash}`}>
                      hash {shortHash(event.hash)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Modal>
    </>
  );
};
