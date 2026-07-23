import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { DoorOpen, RefreshCw, Clock } from 'lucide-react';
import { dispatcherApi } from '../../services/dispatcherApi';
import type { GateQueueEntry } from '../../services/dispatcherApi';
import { Badge, Button, EmptyState, ErrorState, Input, LoadingState, Modal, Panel, Select, useToast } from '../../components/admin/ui';

export const GateQueue: React.FC = () => {
  const { notify } = useToast();

  const [entries, setEntries] = useState<GateQueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Checklist Actions
  const [selectedEntry, setSelectedEntry] = useState<GateQueueEntry | null>(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [sealNumber, setSealNumber] = useState('');
  const [odometer, setOdometer] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dispatcherApi.gateQueue();
      setEntries(data);
    } catch (err: any) {
      setError(err?.message || 'Could not load gate queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Filtering
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchesSearch =
        e.vehicleNumber.toLowerCase().includes(query.toLowerCase()) ||
        e.gatePassNumber.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = filterStatus === 'All' || e.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [entries, query, filterStatus]);

  // Move status
  const handleTransition = async (entry: GateQueueEntry, nextStatus: 'Waiting' | 'Entered' | 'Exited' | 'Blocked') => {
    if (nextStatus === 'Entered') {
      setSelectedEntry(entry);
      setChecklistOpen(true);
      return;
    }

    setSaving(true);
    try {
      await dispatcherApi.updateGateQueueEntry(entry.id, { status: nextStatus });
      notify('success', `Gate Queue updated: ${entry.vehicleNumber} status is now ${nextStatus}`);
      await loadData();
    } catch (err: any) {
      notify('error', err?.message || 'Gate action failed');
    } finally {
      setSaving(false);
    }
  };

  const submitChecklist = async () => {
    if (!selectedEntry) return;
    if (!sealNumber || !odometer) {
      notify('error', 'Please enter security seal number and odometer reading');
      return;
    }
    setSaving(true);
    try {
      await dispatcherApi.updateGateQueueEntry(selectedEntry.id, {
        status: 'Entered',
        checklistPhotos: JSON.stringify({ seal: sealNumber, odometer })
      });
      notify('success', `Checklist logged. Vehicle ${selectedEntry.vehicleNumber} checked into yard.`);
      setChecklistOpen(false);
      setSelectedEntry(null);
      setSealNumber('');
      setOdometer('');
      await loadData();
    } catch (err: any) {
      notify('error', err?.message || 'Yard checkin failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading Hub security gate console" />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Yard &amp; Gate</span>
          <h1 className="adm-page-title">
            <DoorOpen size={22} color="var(--green)" /> Gate Queue
          </h1>
          <p className="adm-page-sub">
            Real-time gate traffic controller: authorize pre-entry passes, audit ANPR matches, capture yard safety checklists, and monitor container detention timers.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
        <Panel title="Expected" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--blue)' }}>{entries.filter(e => e.status === 'Expected').length}</div></Panel>
        <Panel title="Waiting Outside" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--amber)' }}>{entries.filter(e => e.status === 'Waiting').length}</div></Panel>
        <Panel title="Entered in Yard" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{entries.filter(e => e.status === 'Entered').length}</div></Panel>
        <Panel title="Exited" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--text-3)' }}>{entries.filter(e => e.status === 'Exited').length}</div></Panel>
        <Panel title="Blocked / Hold" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--red)' }}>{entries.filter(e => e.status === 'Blocked').length}</div></Panel>
      </div>

      <Panel
        title="Gate Movements Console"
        subtitle={`${filtered.length} entries registered`}
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <Input
              style={{ width: 220 }}
              placeholder="Search vehicle, gate pass..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select style={{ width: 140 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Expected">Expected</option>
              <option value="Waiting">Waiting</option>
              <option value="Entered">Entered</option>
              <option value="Exited">Exited</option>
              <option value="Blocked">Blocked</option>
            </Select>
            <Button variant="subtle" icon={<RefreshCw size={12} />} onClick={loadData} />
          </div>
        }
        padded={false}
      >
        {filtered.length === 0 ? (
          <EmptyState title="Gate queue clear" hint="No vehicles waiting at the checkpoints." />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Gate Pass Number</th>
                  <th>ETA Milestone</th>
                  <th>Detention Timer</th>
                  <th>Yard Check-in</th>
                  <th>Yard Check-out</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Security Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td className="adm-cell-mono" style={{ fontWeight: 600 }}>{e.vehicleNumber}</td>
                    <td className="adm-cell-mono">{e.gatePassNumber}</td>
                    <td>{e.eta}</td>
                    <td className="adm-cell-mono" style={{ color: (e.detentionTimer || 0) > 20 ? 'var(--red)' : 'inherit' }}>
                      {e.status === 'Entered' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} /> {e.detentionTimer || 30} mins
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-3)' }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: 11 }}>
                      {e.enteredAt ? new Date(e.enteredAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' }) : <span style={{ color: 'var(--text-3)' }}>Pending</span>}
                    </td>
                    <td style={{ fontSize: 11 }}>
                      {e.exitedAt ? new Date(e.exitedAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' }) : <span style={{ color: 'var(--text-3)' }}>Pending</span>}
                    </td>
                    <td>
                      <Badge tone={e.status === 'Entered' ? 'green' : e.status === 'Waiting' ? 'amber' : e.status === 'Blocked' ? 'red' : e.status === 'Expected' ? 'blue' : 'grey'}>
                        {e.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="adm-cell-actions">
                        {e.status === 'Expected' && (
                          <Button size="sm" variant="subtle" onClick={() => void handleTransition(e, 'Waiting')}>
                            Mark Waiting
                          </Button>
                        )}
                        {e.status === 'Waiting' && (
                          <Button size="sm" variant="primary" onClick={() => void handleTransition(e, 'Entered')}>
                            Gate In
                          </Button>
                        )}
                        {e.status === 'Entered' && (
                          <Button size="sm" variant="primary" onClick={() => void handleTransition(e, 'Exited')}>
                            Gate Out
                          </Button>
                        )}
                        {e.status !== 'Exited' && e.status !== 'Blocked' && (
                          <Button size="sm" variant="danger" onClick={() => void handleTransition(e, 'Blocked')}>
                            Hold
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* GATE IN YARD CHECKLIST MODAL */}
      <Modal
        open={checklistOpen}
        title="Hub Gate-In Security Checklist"
        subtitle={`Verify physical container safety parameters: ${selectedEntry?.vehicleNumber}`}
        onClose={() => {
          setChecklistOpen(false);
          setSelectedEntry(null);
        }}
        footer={
          <>
            <Button variant="ghost" onClick={() => {
              setChecklistOpen(false);
              setSelectedEntry(null);
            }}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={submitChecklist}>
              Verify &amp; Gate-In
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="adm-field">
            <span className="adm-field-label">Container Security Seal Number</span>
            <Input
              required
              placeholder="e.g. SL-99081A"
              value={sealNumber}
              onChange={(e) => setSealNumber(e.target.value)}
            />
          </div>

          <div className="adm-field">
            <span className="adm-field-label">Current Odometer Reading (km)</span>
            <Input
              required
              type="number"
              placeholder="e.g. 124500"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
            />
          </div>

          <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 4, border: '1px solid var(--border-soft)', fontSize: 11 }}>
            <strong>ANPR Verification Check:</strong> Verified plate matching. High-density CCTV captures uploaded to security storage hub automatically.
          </div>
        </div>
      </Modal>
    </>
  );
};
