import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Route, RefreshCw, Sliders } from 'lucide-react';
import { dispatcherApi } from '../../services/dispatcherApi';
import type { Trip, Vehicle, Driver } from '../../services/dispatcherApi';
import { Badge, Button, EmptyState, ErrorState, Input, LoadingState, Modal, Panel, Select, useToast } from '../../components/admin/ui';

export const TripManagement: React.FC = () => {
  const { notify } = useToast();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Drawers / Modals
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [replanOpen, setReplanOpen] = useState(false);
  const [replanAction, setReplanAction] = useState('SWAP_VEHICLE');
  const [targetVehicleId, setTargetVehicleId] = useState('');
  const [targetDriverId, setTargetDriverId] = useState('');
  const [replanNotes, setReplanNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tripData, vehData, drvData] = await Promise.all([
        dispatcherApi.trips(),
        dispatcherApi.vehicles(),
        dispatcherApi.drivers()
      ]);
      setTrips(tripData);
      setVehicles(vehData);
      setDrivers(drvData);
    } catch (err: any) {
      setError(err?.message || 'Could not load trips');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Filtering
  const filtered = useMemo(() => {
    return trips.filter((t) => {
      const matchesSearch =
        t.tripId.toLowerCase().includes(query.toLowerCase()) ||
        t.routeName.toLowerCase().includes(query.toLowerCase()) ||
        (t.vehicleNumber && t.vehicleNumber.toLowerCase().includes(query.toLowerCase())) ||
        (t.driverName && t.driverName.toLowerCase().includes(query.toLowerCase()));
      const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [trips, query, filterStatus]);

  const eligibleVehicles = useMemo(() => {
    return vehicles.filter(v => v.status === 'Available');
  }, [vehicles]);

  const eligibleDrivers = useMemo(() => {
    return drivers.filter(d => d.status === 'Available');
  }, [drivers]);

  // Replan execute
  const handleReplan = async () => {
    if (!activeTrip) return;
    setSaving(true);
    try {
      await dispatcherApi.replanTrip(activeTrip.id, {
        action: replanAction,
        vehicleId: replanAction === 'SWAP_VEHICLE' ? targetVehicleId : undefined,
        driverId: replanAction === 'SWAP_DRIVER' ? targetDriverId : undefined,
        notes: replanNotes
      });
      notify('success', `Trip replanned successfully: ${replanAction}`);
      setReplanOpen(false);
      setActiveTrip(null);
      setTargetVehicleId('');
      setTargetDriverId('');
      setReplanNotes('');
      await loadData();
    } catch (err: any) {
      notify('error', err?.message || 'Re-planning failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading trips ledger" />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">P-13 · Trip Execution</span>
          <h1 className="adm-page-title">
            <Route size={22} color="var(--green)" /> Trip Management
          </h1>
          <p className="adm-page-sub">
            Monitor active transit corridors, verify loading gate passes, upload ePODs, and resolve en-route delays.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <Panel title="Active Trips" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--amber)' }}>{trips.filter(t => t.status === 'In Transit').length}</div></Panel>
        <Panel title="Completed today" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{trips.filter(t => t.status === 'Completed').length}</div></Panel>
        <Panel title="Scheduled" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--blue)' }}>{trips.filter(t => t.status === 'Scheduled').length}</div></Panel>
        <Panel title="Cancelled" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--text-3)' }}>{trips.filter(t => t.status === 'Cancelled').length}</div></Panel>
      </div>

      <Panel
        title="Runs Audit Ledger"
        subtitle={`${filtered.length} runs listed`}
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <Input
              style={{ width: 220 }}
              placeholder="Search Trip ID, vehicle, driver..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select style={{ width: 140 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Transit">In Transit</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Select>
            <Button variant="subtle" icon={<RefreshCw size={12} />} onClick={loadData} />
          </div>
        }
        padded={false}
      >
        {filtered.length === 0 ? (
          <EmptyState title="No trips active" hint="Try adjusting search query." />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Trip ID</th>
                  <th>Corridor Route</th>
                  <th>Vehicle Info</th>
                  <th>Driver Name</th>
                  <th>Transporter Type</th>
                  <th>Trip Cost</th>
                  <th>ETA Status</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td className="adm-cell-mono" style={{ fontWeight: 600 }}>{t.tripId}</td>
                    <td>
                      <div style={{ fontSize: 11, fontWeight: 600 }}>{t.routeName}</div>
                      <div className="adm-row-sub">{t.distance} km</div>
                    </td>
                    <td className="adm-cell-mono">{t.vehicleNumber || 'Unassigned'}</td>
                    <td>{t.driverName || 'Unassigned'}</td>
                    <td>
                      <Badge tone={t.vendorName ? 'amber' : 'green'}>
                        {t.vendorName ? `Vendor: ${t.vendorName}` : 'Owned Fleet'}
                      </Badge>
                    </td>
                    <td className="adm-cell-mono">₹{t.cost.toLocaleString('en-IN')}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{t.eta}</td>
                    <td>
                      <Badge tone={t.status === 'Completed' ? 'green' : t.status === 'In Transit' ? 'amber' : t.status === 'Cancelled' ? 'red' : 'blue'}>
                        {t.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="adm-cell-actions">
                        <Button variant="subtle" size="sm" onClick={() => setActiveTrip(t)}>
                          Trip 360
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

      {/* TRIP 360 DRAWER */}
      {activeTrip && (
        <div className="adm-modal-backdrop" onClick={() => setActiveTrip(null)} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'stretch' }}>
          <div className="adm-modal" style={{ width: 520, height: '100%', margin: 0, borderRadius: 0, display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <header className="adm-modal-head" style={{ borderBottom: '1px solid var(--border-soft)', paddingBottom: 10 }}>
              <div>
                <span className="mono-label" style={{ fontSize: 9 }}>Trip Control Center</span>
                <h3 className="adm-panel-title" style={{ margin: 0 }}>{activeTrip.tripId}</h3>
                <p className="adm-panel-sub" style={{ margin: 0 }}>{activeTrip.routeName}</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {activeTrip.status !== 'Completed' && activeTrip.status !== 'Cancelled' && (
                  <Button variant="primary" size="sm" icon={<Sliders size={12} />} onClick={() => setReplanOpen(true)}>
                    Re-plan Run
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setActiveTrip(null)}>Close</Button>
              </div>
            </header>

            <div style={{ flexGrow: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Asset Assignment Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 4 }}>
                <div>
                  <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>Vehicle Information</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{activeTrip.vehicleNumber || 'Vendor Contract'}</div>
                </div>
                <div>
                  <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>Driver Roster Name</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{activeTrip.driverName || 'Vendor Assigned'}</div>
                </div>
              </div>

              {/* Milestones timeline */}
              <div>
                <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Route Milestones Checkpoints</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {JSON.parse(activeTrip.timeline as string || '[]').map((m: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: 6, borderBottom: '1px dashed var(--border-soft)' }}>
                      <span>📍 {m.name}</span>
                      <span style={{ fontWeight: 600, color: m.status === 'Done' ? 'var(--green)' : 'var(--text-3)' }}>
                        {m.status === 'Done' ? `Completed (${new Date(m.timestamp).toLocaleTimeString()})` : m.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tolls & Fuel */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Fuel Fill Transactions</span>
                  {JSON.parse(activeTrip.fuelEntries as string || '[]').length === 0 ? (
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>No fuel entries logged.</span>
                  ) : (
                    JSON.parse(activeTrip.fuelEntries as string || '[]').map((f: any, idx: number) => (
                      <div key={idx} style={{ fontSize: 10, backgroundColor: 'var(--panel-2)', padding: 6, borderRadius: 2 }}>
                        Odo: {f.odo} · {f.liters}L filled · Cost: ₹{f.cost}
                      </div>
                    ))
                  )}
                </div>
                <div>
                  <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Toll Expenses Summary</span>
                  {JSON.parse(activeTrip.expenses as string || '[]').length === 0 ? (
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>No expenses logged.</span>
                  ) : (
                    JSON.parse(activeTrip.expenses as string || '[]').map((e: any, idx: number) => (
                      <div key={idx} style={{ fontSize: 10, backgroundColor: 'var(--panel-2)', padding: 6, borderRadius: 2, marginBottom: 2 }}>
                        {e.category}: ₹{e.amount} ({e.status})
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Gate Pass ANPR Logs */}
              <div>
                <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>ANPR & Yard Gate Logs</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {JSON.parse(activeTrip.gateEvents as string || '[]').map((g: any, idx: number) => (
                    <div key={idx} style={{ fontSize: 10, display: 'flex', justifyContent: 'space-between', padding: 4 }}>
                      <span>🚪 {g.event}</span>
                      <span className="adm-cell-mono">{new Date(g.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trip Audit Trail */}
              <div>
                <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Run Audit Log</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 100, overflowY: 'auto' }}>
                  {JSON.parse(activeTrip.auditTrail as string || '[]').map((a: any, idx: number) => (
                    <div key={idx} style={{ fontSize: 9, color: 'var(--text-3)' }}>
                      [{new Date(a.timestamp).toLocaleTimeString()}] {a.user}: {a.action}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RE-PLAN ACTIONS MODAL */}
      <Modal
        open={replanOpen}
        title="Re-plan Running Route"
        subtitle={`Reroute/Reassign assets for trip ID: ${activeTrip?.tripId}`}
        onClose={() => setReplanOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setReplanOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleReplan}>
              Apply Re-plan
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="adm-field">
            <span className="adm-field-label">Re-planning Type Action</span>
            <Select value={replanAction} onChange={(e) => setReplanAction(e.target.value)}>
              <option value="SWAP_VEHICLE">Swap Vehicle Asset</option>
              <option value="SWAP_DRIVER">Swap Driver Roster</option>
              <option value="CANCEL">Cancel Running Trip</option>
            </Select>
          </div>

          {replanAction === 'SWAP_VEHICLE' && (
            <div className="adm-field">
              <span className="adm-field-label">Choose Replacement Vehicle</span>
              <Select value={targetVehicleId} onChange={(e) => setTargetVehicleId(e.target.value)}>
                <option value="">-- Choose Available Vehicle --</option>
                {eligibleVehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.vehicleNumber} ({v.class} · Fuel: {v.fuel}%)</option>
                ))}
              </Select>
            </div>
          )}

          {replanAction === 'SWAP_DRIVER' && (
            <div className="adm-field">
              <span className="adm-field-label">Choose Replacement Driver</span>
              <Select value={targetDriverId} onChange={(e) => setTargetDriverId(e.target.value)}>
                <option value="">-- Choose Available Driver --</option>
                {eligibleDrivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} (Safety Score: {d.safetyScore}/100)</option>
                ))}
              </Select>
            </div>
          )}

          <div className="adm-field">
            <span className="adm-field-label">Justification / Action Notes</span>
            <Input
              required
              placeholder="Provide reason for this change..."
              value={replanNotes}
              onChange={(e) => setReplanNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
