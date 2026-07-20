import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';
import { dispatcherApi } from '../../services/dispatcherApi';
import type { ExceptionAlert, Trip } from '../../services/dispatcherApi';
import { Badge, Button, EmptyState, ErrorState, Input, LoadingState, Panel, Select, useToast } from '../../components/admin/ui';

export const ExceptionCenter: React.FC = () => {
  const { notify } = useToast();

  const [exceptions, setExceptions] = useState<ExceptionAlert[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Open');

  // Trip 360 Detail Drawer
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [excData, tripData] = await Promise.all([
        dispatcherApi.exceptions(),
        dispatcherApi.trips()
      ]);
      setExceptions(excData);
      setTrips(tripData);
    } catch (err: any) {
      setError(err?.message || 'Could not load exceptions ledger');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Filtering
  const filtered = useMemo(() => {
    return exceptions.filter((e) => {
      const matchesSearch =
        e.vehicleNumber.toLowerCase().includes(query.toLowerCase()) ||
        e.driverName.toLowerCase().includes(query.toLowerCase()) ||
        e.details.toLowerCase().includes(query.toLowerCase()) ||
        e.type.toLowerCase().includes(query.toLowerCase());
      const matchesSeverity = filterSeverity === 'All' || e.severity === filterSeverity;
      const matchesStatus = filterStatus === 'All' || e.status === filterStatus;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [exceptions, query, filterSeverity, filterStatus]);

  const handleResolve = async (id: string) => {
    try {
      await dispatcherApi.resolveException(id);
      notify('success', 'Exception marked as resolved');
      await loadData();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to resolve exception');
    }
  };

  const openTrip360 = (tripIdStr: string) => {
    const matched = trips.find(t => t.tripId === tripIdStr || t.id === tripIdStr);
    if (matched) {
      setActiveTrip(matched);
    } else {
      notify('error', 'Trip details not found for this alert');
    }
  };

  if (loading) return <LoadingState label="Loading Hub telemetry exceptions ledger" />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">P-17 · Telematics Exceptions</span>
          <h1 className="adm-page-title">
            <AlertTriangle size={22} color="var(--red)" /> Exception Center
          </h1>
          <p className="adm-page-sub">
            Real-time IoT anomaly logging: oversee route deviations, overspeed triggers, critical breakdowns, and document expiries.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <Panel title="Active Exceptions" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--red)' }}>{exceptions.filter(e => e.status === 'Open').length}</div></Panel>
        <Panel title="Critical Alerts" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--red)' }}>{exceptions.filter(e => e.severity === 'CRITICAL' && e.status === 'Open').length}</div></Panel>
        <Panel title="Warnings" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--amber)' }}>{exceptions.filter(e => e.severity === 'WARNING' && e.status === 'Open').length}</div></Panel>
        <Panel title="Resolved today" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{exceptions.filter(e => e.status === 'Resolved').length}</div></Panel>
      </div>

      <Panel
        title="Anomalies Ledger"
        subtitle={`${filtered.length} exceptions listed`}
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <Input
              style={{ width: 220 }}
              placeholder="Search vehicle, driver, type..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select style={{ width: 140 }} value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
              <option value="All">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="WARNING">Warnings</option>
              <option value="INFO">Info</option>
            </Select>
            <Select style={{ width: 140 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Resolved">Resolved</option>
            </Select>
            <Button variant="subtle" icon={<RefreshCw size={12} />} onClick={loadData} />
          </div>
        }
        padded={false}
      >
        {filtered.length === 0 ? (
          <EmptyState title="Telemetry logs clear" hint="Zero anomalies reported on current runs." />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Incident Type</th>
                  <th>Vehicle Number</th>
                  <th>Driver Name</th>
                  <th>Severity</th>
                  <th>Event Description Details</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td className="adm-cell-mono" style={{ fontSize: 11 }}>{new Date(e.timestamp).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                        <ShieldAlert size={13} color={e.severity === 'CRITICAL' ? 'var(--red)' : 'var(--amber)'} />
                        {e.type}
                      </div>
                    </td>
                    <td className="adm-cell-mono" style={{ fontWeight: 600 }}>{e.vehicleNumber}</td>
                    <td>{e.driverName}</td>
                    <td>
                      <Badge tone={e.severity === 'CRITICAL' ? 'red' : e.severity === 'WARNING' ? 'amber' : 'blue'}>
                        {e.severity}
                      </Badge>
                    </td>
                    <td style={{ fontSize: 11, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.details}
                    </td>
                    <td>
                      <Badge tone={e.status === 'Resolved' ? 'green' : 'red'}>
                        {e.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="adm-cell-actions">
                        {e.tripId && (
                          <Button size="sm" variant="subtle" onClick={() => e.tripId && openTrip360(e.tripId)}>
                            Open Trip
                          </Button>
                        )}
                        {e.status === 'Open' && (
                          <Button size="sm" variant="primary" icon={<CheckCircle size={12} />} onClick={() => void handleResolve(e.id)}>
                            Resolve
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

      {/* TRIP 360 DRAWER */}
      {activeTrip && (
        <div className="adm-modal-backdrop" onClick={() => setActiveTrip(null)} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'stretch' }}>
          <div className="adm-modal" style={{ width: 500, height: '100%', margin: 0, borderRadius: 0, display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <header className="adm-modal-head" style={{ borderBottom: '1px solid var(--border-soft)', paddingBottom: 10 }}>
              <div>
                <span className="mono-label" style={{ fontSize: 9 }}>Related Trip Control Center</span>
                <h3 className="adm-panel-title" style={{ margin: 0 }}>{activeTrip.tripId}</h3>
                <p className="adm-panel-sub" style={{ margin: 0 }}>{activeTrip.routeName}</p>
              </div>
              <Button variant="ghost" onClick={() => setActiveTrip(null)}>Close</Button>
            </header>

            <div style={{ flexGrow: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>Vehicle Number</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{activeTrip.vehicleNumber || 'Unassigned'}</div>
                </div>
                <div>
                  <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>Driver Name</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{activeTrip.driverName || 'Unassigned'}</div>
                </div>
              </div>

              <div>
                <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>State Timeline</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  {JSON.parse(activeTrip.stateTimeline as string || '[]').map((st: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: 'var(--green)' }}>✓ {st.state}</span>
                      <span style={{ color: 'var(--text-3)', fontFamily: 'monospace' }}>
                        {new Date(st.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>Checkpoint Milestones</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  {JSON.parse(activeTrip.timeline as string || '[]').map((pt: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: 4, borderBottom: '1px dashed var(--border-soft)' }}>
                      <span>{pt.name}</span>
                      <span style={{ color: pt.status === 'Done' ? 'var(--green)' : 'var(--text-3)' }}>{pt.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
