import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  AlertTriangle, ArrowRight, LayoutDashboard, RefreshCw, Search, Split
} from 'lucide-react';
import { dispatcherApi } from '../../services/dispatcherApi';
import type {
  DispatcherKPIs, TransportRequest, Vehicle, Driver, Trip, ExceptionAlert
} from '../../services/dispatcherApi';
import {
  Badge, Button, EmptyState, ErrorState, LoadingState, Modal, Panel, Select, useToast
} from '../../components/admin/ui';
import '../../styles/admin.css';

export const DispatcherDashboard: React.FC = () => {
  const { notify } = useToast();

  // State
  const [kpis, setKpis] = useState<DispatcherKPIs | null>(null);
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Selections
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [checkedRequestIds, setCheckedRequestIds] = useState<string[]>([]);
  const [mapFilterSite, setMapFilterSite] = useState('All');
  const [mapFilterStatus, setMapFilterStatus] = useState('All');

  // Search & Filters in Demand Lane
  const [demandQuery, setDemandQuery] = useState('');
  const [demandPriority, setDemandPriority] = useState('All');
  const [demandVehType, setDemandVehType] = useState('All');

  // Modals & Drawers
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedVendorName, setSelectedVendorName] = useState('Gati Logistics');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Active Trip 360 Detail Drawer
  const [activeTripDetail, setActiveTripDetail] = useState<Trip | null>(null);

  // Keyboard focus helpers
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const loadData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError('');
    try {
      const [kpisData, reqsData, vehsData, drvsData, tripsData, excData] = await Promise.all([
        dispatcherApi.kpis(),
        dispatcherApi.requests(),
        dispatcherApi.vehicles(),
        dispatcherApi.drivers(),
        dispatcherApi.trips(),
        dispatcherApi.exceptions(),
      ]);
      setKpis(kpisData);
      setRequests(reqsData);
      setVehicles(vehsData);
      setDrivers(drvsData);
      setTrips(tripsData);
      setExceptions(excData);
    } catch (err: any) {
      setError(err?.message || 'Could not load dispatch board data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();

    // Setup global keyboard shortcut listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search: '/'
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'SELECT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Quick Assign: 'a' or 'A' when a request is selected
      if ((e.key === 'a' || e.key === 'A') && selectedRequestId && !assignModalOpen && !vendorModalOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setAssignModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loadData, selectedRequestId, assignModalOpen, vendorModalOpen]);

  // Selected details
  const selectedRequest = useMemo(() => {
    return requests.find((r) => r.id === selectedRequestId) || null;
  }, [requests, selectedRequestId]);

  // Demand lane filtering
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (r.status !== 'Unassigned') return false;
      const matchesSearch =
        r.id.toLowerCase().includes(demandQuery.toLowerCase()) ||
        r.customer.toLowerCase().includes(demandQuery.toLowerCase()) ||
        r.pickup.toLowerCase().includes(demandQuery.toLowerCase()) ||
        r.destination.toLowerCase().includes(demandQuery.toLowerCase());
      const matchesPriority = demandPriority === 'All' || r.priority === demandPriority;
      const matchesType = demandVehType === 'All' || r.vehicleType === demandVehType;
      return matchesSearch && matchesPriority && matchesType;
    });
  }, [requests, demandQuery, demandPriority, demandVehType]);

  // Eligible vehicles and drivers calculation
  const { eligibleVehicles, ineligibleVehicles } = useMemo(() => {
    if (!selectedRequest) return { eligibleVehicles: [], ineligibleVehicles: [] };
    const eligible: Vehicle[] = [];
    const ineligible: { vehicle: Vehicle; reason: string }[] = [];

    vehicles.forEach((v) => {
      if (v.status !== 'Available') {
        ineligible.push({ vehicle: v, reason: `Vehicle occupied (status: ${v.status})` });
        return;
      }
      if (!v.complianceInsurance) {
        ineligible.push({ vehicle: v, reason: 'Insurance Expired (Rule BR-CMP-03)' });
        return;
      }
      if (!v.compliancePM) {
        ineligible.push({ vehicle: v, reason: 'Periodic Maintenance overdue' });
        return;
      }
      if (v.class.toLowerCase() !== selectedRequest.vehicleType.toLowerCase()) {
        ineligible.push({ vehicle: v, reason: `Type mismatch: requires ${selectedRequest.vehicleType}, is ${v.class}` });
        return;
      }
      eligible.push(v);
    });

    return { eligibleVehicles: eligible, ineligibleVehicles: ineligible };
  }, [selectedRequest, vehicles]);

  const { eligibleDrivers } = useMemo(() => {
    if (!selectedRequest) return { eligibleDrivers: [] };
    const eligible: Driver[] = [];

    drivers.forEach((d) => {
      if (d.status !== 'Available') return;
      if (d.dutyHours >= 8.0) return;
      if (d.safetyScore < 80) return;
      eligible.push(d);
    });

    return { eligibleDrivers: eligible };
  }, [selectedRequest, drivers]);

  // Actions
  const handleAssign = async () => {
    if (!selectedRequestId || !selectedVehicleId || !selectedDriverId) {
      notify('error', 'Please select request, vehicle, and driver');
      return;
    }
    setSubmittingAction(true);
    try {
      await dispatcherApi.assignRequest(selectedRequestId, selectedVehicleId, selectedDriverId);
      notify('success', `Request ${selectedRequestId} successfully assigned!`);
      setAssignModalOpen(false);
      setSelectedRequestId(null);
      setSelectedVehicleId('');
      setSelectedDriverId('');
      await loadData(true);
    } catch (err: any) {
      notify('error', err?.message || 'Assignment failed');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSplit = async (id: string) => {
    try {
      await dispatcherApi.splitRequest(id);
      notify('success', `Request ${id} split successfully.`);
      await loadData(true);
    } catch (err: any) {
      notify('error', err?.message || 'Split failed');
    }
  };

  const handleMerge = async () => {
    if (checkedRequestIds.length < 2) {
      notify('error', 'Select at least 2 requests to merge');
      return;
    }
    try {
      const merged = await dispatcherApi.mergeRequests(checkedRequestIds);
      notify('success', `Merged requests into ${merged.id}`);
      setCheckedRequestIds([]);
      await loadData(true);
    } catch (err: any) {
      notify('error', err?.message || 'Merge failed');
    }
  };

  const handleVendorSpill = async () => {
    if (!selectedRequestId || !selectedVendorName) {
      notify('error', 'Select request and vendor');
      return;
    }
    setSubmittingAction(true);
    try {
      await dispatcherApi.vendorSpill(selectedRequestId, selectedVendorName);
      notify('success', `Spilled request ${selectedRequestId} to vendor ${selectedVendorName}`);
      setVendorModalOpen(false);
      setSelectedRequestId(null);
      await loadData(true);
    } catch (err: any) {
      notify('error', err?.message || 'Vendor spill failed');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleResolveException = async (id: string) => {
    try {
      await dispatcherApi.resolveException(id);
      notify('success', 'Exception marked as resolved');
      await loadData(true);
    } catch (err: any) {
      notify('error', err?.message || 'Failed to resolve');
    }
  };

  const openTripDrawer = async (tripIdStr: string) => {
    const matched = trips.find((t) => t.tripId === tripIdStr || t.id === tripIdStr);
    if (matched) {
      setActiveTripDetail(matched);
    } else {
      notify('error', 'Trip details not found');
    }
  };

  if (loading) return <LoadingState label="Loading Fleet Dispatch Board" />;
  if (error || !kpis) return <ErrorState message={error} onRetry={() => void loadData()} />;

  return (
    <>
      <div className="adm-page-head" style={{ marginBottom: 12 }}>
        <div>
          <span className="adm-spec-chip mono-label">P-11 · Dispatch Board</span>
          <h1 className="adm-page-title">
            <LayoutDashboard size={22} color="var(--green)" /> Dispatch Workspace
          </h1>
          <p className="adm-page-sub">
            Real-time drag-and-drop timeline scheduler, demand lane allocation, live routing conflict alerts, and exception telemetry queue.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant="subtle"
            icon={<RefreshCw size={14} />}
            loading={refreshing}
            onClick={() => {
              setRefreshing(true);
              void loadData(true);
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 1. TODAY'S KPIS BANNER */}
      <div className="adm-quick-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Today\'s Trips', value: kpis.todayTrips, tone: 'var(--green)' },
          { label: 'Vehicles Available', value: kpis.vehiclesAvailable, tone: 'var(--green)' },
          { label: 'Vehicles In Transit', value: kpis.vehiclesInTransit, tone: 'var(--amber)' },
          { label: 'Pending Requests', value: kpis.pendingRequests, tone: 'var(--amber)' },
          { label: 'Unassigned Requests', value: kpis.unassignedRequests, tone: 'var(--red)' },
          { label: 'Telemetry Exceptions', value: kpis.exceptions, tone: kpis.exceptions > 0 ? 'var(--red)' : 'var(--text-3)' },
          { label: 'Gate Queue', value: kpis.gateQueue, tone: 'var(--blue)' },
          { label: 'Active Drivers', value: kpis.activeDrivers, tone: 'var(--green)' },
          { label: 'On-time Rate', value: '96%', tone: 'var(--green)' }
        ].map((kpi, idx) => (
          <div key={idx} className="adm-metric" style={{ padding: '8px 12px', minWidth: 'unset', textAlign: 'center' }}>
            <span className="adm-metric-label" style={{ fontSize: 9, whiteSpace: 'nowrap' }}>{kpi.label}</span>
            <span className="adm-metric-value" style={{ fontSize: 20, color: kpi.tone }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* MAIN SECTION: THREE-COLUMN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 340px', gap: 16, height: 500, marginBottom: 16 }}>
        {/* COLUMN 1: DEMAND LANE (LEFT) */}
        <Panel
          title="Demand Lane"
          subtitle="Unassigned Requests"
          padded={false}
          actions={
            <div style={{ display: 'flex', gap: 4 }}>
              {checkedRequestIds.length > 1 && (
                <Button size="sm" variant="primary" onClick={handleMerge}>
                  Merge ({checkedRequestIds.length})
                </Button>
              )}
            </div>
          }
        >
          <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8, height: '100%', overflow: 'hidden' }}>
            <div className="adm-field" style={{ margin: 0 }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-3)' }} />
                <input
                  ref={searchInputRef}
                  className="adm-input"
                  style={{ paddingLeft: 30 }}
                  placeholder="Search requests (/)…"
                  value={demandQuery}
                  onChange={(e) => setDemandQuery(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              <Select style={{ fontSize: 11, padding: 4 }} value={demandPriority} onChange={(e) => setDemandPriority(e.target.value)}>
                <option value="All">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </Select>
              <Select style={{ fontSize: 11, padding: 4 }} value={demandVehType} onChange={(e) => setDemandVehType(e.target.value)}>
                <option value="All">All Vehicles</option>
                <option value="Container">Container</option>
                <option value="Open Body">Open Body</option>
                <option value="Flatbed">Flatbed</option>
              </Select>
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
              {filteredRequests.length === 0 ? (
                <EmptyState title="No pending demands" hint="All items allocated." />
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = selectedRequestId === req.id;
                  const isChecked = checkedRequestIds.includes(req.id);
                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequestId(req.id)}
                      className={`adm-cap-row ${isSelected ? 'is-on' : ''}`}
                      style={{
                        padding: '10px 12px',
                        border: isSelected ? '1.5px solid var(--green)' : '1px solid var(--border-soft)',
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        backgroundColor: isSelected ? 'var(--panel-2)' : 'var(--panel-1)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            type="checkbox"
                            className="adm-checkbox"
                            checked={isChecked}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => {
                              setCheckedRequestIds((prev) =>
                                isChecked ? prev.filter((id) => id !== req.id) : [...prev, req.id]
                              );
                            }}
                          />
                          <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-1)' }}>{req.id}</span>
                        </div>
                        <Badge tone={req.priority === 'CRITICAL' ? 'red' : req.priority === 'HIGH' ? 'amber' : 'green'}>
                          {req.priority}
                        </Badge>
                      </div>

                      <div style={{ fontSize: 11, color: 'var(--text-1)' }}>
                        <strong>{req.customer}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>
                        <div>{req.pickup.slice(0, 12)}...</div>
                        <ArrowRight size={10} style={{ alignSelf: 'center' }} />
                        <div>{req.destination.slice(0, 12)}...</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, marginTop: 4 }}>
                        <span className="mono-label" style={{ color: 'var(--green)' }}>{req.vehicleType} · {req.capacityRequired}</span>
                        <span style={{ color: 'var(--text-3)' }}>{req.timeWindow}</span>
                      </div>

                      <div style={{ display: 'flex', gap: 4, marginTop: 4, width: '100%' }}>
                        <Button
                          size="sm"
                          style={{ flexGrow: 1, padding: '2px 4px', fontSize: 10 }}
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequestId(req.id);
                            setAssignModalOpen(true);
                          }}
                        >
                          Assign (A)
                        </Button>
                        <Button
                          size="sm"
                          style={{ padding: '2px 4px', fontSize: 10 }}
                          variant="subtle"
                          icon={<Split size={11} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleSplit(req.id);
                          }}
                          title="Split load"
                        />
                        <Button
                          size="sm"
                          style={{ padding: '2px 4px', fontSize: 10 }}
                          variant="subtle"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequestId(req.id);
                            setVendorModalOpen(true);
                          }}
                        >
                          Vendor Spill
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Panel>

        {/* COLUMN 2: TIMELINE SCHEDULER CANVAS (CENTER) */}
        <Panel
          title="Timeline Scheduler"
          subtitle="Owned Vehicle Allocation Gantt View"
          padded={false}
          style={{ overflow: 'hidden' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Hour Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '120px repeat(12, 1fr)',
                borderBottom: '1px solid var(--border-soft)',
                backgroundColor: 'var(--panel-2)',
                padding: '6px 0',
                fontSize: 10,
                textAlign: 'center',
                fontWeight: 600,
                color: 'var(--text-3)',
                fontFamily: 'monospace'
              }}
            >
              <div style={{ textAlign: 'left', paddingLeft: 12 }}>Vehicle</div>
              {['00-02', '02-04', '04-06', '06-08', '08-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22', '22-24'].map((h) => (
                <div key={h} style={{ borderLeft: '1px solid var(--border-soft)' }}>{h}</div>
              ))}
            </div>

            {/* Vehicle Rows */}
            <div style={{ flexGrow: 1, overflowY: 'auto' }}>
              {vehicles.filter(v => v.category === 'Owned').map((v) => {
                // Find trip occupying this vehicle
                const activeTrip = trips.find((t) => t.vehicleNumber === v.vehicleNumber && t.status !== 'Completed' && t.status !== 'Cancelled');
                return (
                  <div
                    key={v.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px repeat(12, 1fr)',
                      borderBottom: '1px solid var(--border-soft)',
                      height: 42,
                      alignItems: 'center',
                    }}
                  >
                    {/* Vehicle Identity */}
                    <div
                      style={{
                        paddingLeft: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        height: '100%',
                        borderRight: '1px solid var(--border-soft)',
                        backgroundColor: 'var(--panel-1)'
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 11, color: 'var(--text-1)' }}>{v.vehicleNumber}</span>
                      <span style={{ fontSize: 9, color: 'var(--text-3)' }}>{v.class} · {v.capacity}</span>
                    </div>

                    {/* Timeline Slots */}
                    {activeTrip ? (
                      /* Occupied block spanning slots */
                      <div
                        style={{
                          gridColumn: '3 / span 8', // Mock span
                          margin: '0 4px',
                          height: 30,
                          borderRadius: 4,
                          backgroundColor: 'rgba(242, 180, 65, 0.15)',
                          borderLeft: '4px solid var(--amber)',
                          borderRight: '1px solid var(--amber)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 8px',
                          fontSize: 10,
                          cursor: 'pointer',
                          justifyContent: 'space-between',
                        }}
                        onClick={() => openTripDrawer(activeTrip.tripId)}
                      >
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--text-1)' }}>
                          {activeTrip.tripId} ({activeTrip.driverName})
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'monospace' }}>
                          {activeTrip.status}
                        </div>
                      </div>
                    ) : (
                      /* Free cells */
                      Array.from({ length: 12 }).map((_, slotIdx) => {
                        const cellColor = v.status === 'Maintenance' ? 'rgba(235, 87, 87, 0.08)' : v.status === 'Blocked' ? 'rgba(235, 87, 87, 0.15)' : 'transparent';
                        const cellBorder = v.status === 'Maintenance' || v.status === 'Blocked' ? '1px solid rgba(235, 87, 87, 0.2)' : '1px solid var(--border-soft)';
                        return (
                          <div
                            key={slotIdx}
                            onClick={() => {
                              if (v.status === 'Available') {
                                setSelectedVehicleId(v.id);
                                if (selectedRequestId) setAssignModalOpen(true);
                                else notify('info', 'Select a transport request on the left first to allocate this vehicle.');
                              } else {
                                notify('error', `Cannot allocate: vehicle is in ${v.status} status.`);
                              }
                            }}
                            style={{
                              height: '100%',
                              backgroundColor: cellColor,
                              borderLeft: cellBorder,
                              cursor: v.status === 'Available' ? 'pointer' : 'not-allowed',
                              transition: 'background-color 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title={v.status !== 'Available' ? `Blocked: ${v.status}` : 'Click to allocate request'}
                          >
                            {slotIdx === 0 && v.status !== 'Available' && (
                              <span style={{ fontSize: 8, color: 'var(--red)', fontWeight: 600, textTransform: 'uppercase' }}>
                                {v.status}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>

        {/* COLUMN 3: CONTEXT PANEL (RIGHT) */}
        <Panel
          title="Context Panel"
          subtitle="Eligibility & Capacity Overlays"
        >
          {selectedRequest ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflowY: 'auto', paddingRight: 4 }}>
              <div style={{ borderBottom: '1px solid var(--border-soft)', paddingBottom: 10 }}>
                <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>Selected Demand</span>
                <h4 style={{ margin: '4px 0', fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{selectedRequest.id}</h4>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-2)' }}>{selectedRequest.customer}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11 }}>
                  <span>Route Distance:</span>
                  <span style={{ fontWeight: 600, color: 'var(--green)' }}>{selectedRequest.distance} km</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11 }}>
                  <span>ETA:</span>
                  <span style={{ fontWeight: 600 }}>{selectedRequest.eta}</span>
                </div>
              </div>

              {/* Eligible Vehicles */}
              <div>
                <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>
                  Eligible Vehicles ({eligibleVehicles.length})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {eligibleVehicles.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      style={{
                        padding: '6px 8px',
                        border: selectedVehicleId === v.id ? '1px solid var(--green)' : '1px solid var(--border-soft)',
                        borderRadius: 4,
                        fontSize: 11,
                        cursor: 'pointer',
                        backgroundColor: selectedVehicleId === v.id ? 'rgba(63, 222, 121, 0.05)' : 'var(--panel-2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{v.vehicleNumber}</span>
                      <span style={{ color: 'var(--text-3)' }}>Fuel: {v.fuel}% · Util: {v.utilization}%</span>
                    </div>
                  ))}
                  {eligibleVehicles.length === 0 && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>No eligible vehicles active.</span>}
                </div>
              </div>

              {/* Eligible Drivers */}
              <div>
                <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>
                  Eligible Drivers ({eligibleDrivers.length})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {eligibleDrivers.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDriverId(d.id)}
                      style={{
                        padding: '6px 8px',
                        border: selectedDriverId === d.id ? '1px solid var(--green)' : '1px solid var(--border-soft)',
                        borderRadius: 4,
                        fontSize: 11,
                        cursor: 'pointer',
                        backgroundColor: selectedDriverId === d.id ? 'rgba(63, 222, 121, 0.05)' : 'var(--panel-2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{d.name}</span>
                      <span style={{ color: 'var(--text-3)' }}>Duty: {d.dutyHours}h · Safety: {d.safetyScore}</span>
                    </div>
                  ))}
                  {eligibleDrivers.length === 0 && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>No eligible drivers active.</span>}
                </div>
              </div>

              {/* Blocked/Ineligible overlaps */}
              <div>
                <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>
                  Grayed Out / Blocked Assets
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {ineligibleVehicles.slice(0, 3).map(({ vehicle, reason }) => (
                    <div
                      key={vehicle.id}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 4,
                        fontSize: 10,
                        backgroundColor: 'var(--panel-1)',
                        border: '1px dashed var(--border-soft)',
                        opacity: 0.5,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-3)' }}>{vehicle.vehicleNumber} ({vehicle.class})</span>
                      <span style={{ color: 'var(--red)', fontSize: 9, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <AlertTriangle size={8} /> {reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', gap: 6 }}>
                <Button
                  style={{ flexGrow: 1 }}
                  variant="primary"
                  disabled={!selectedVehicleId || !selectedDriverId}
                  onClick={() => setAssignModalOpen(true)}
                >
                  Allocate Run
                </Button>
                <Button variant="ghost" onClick={() => setSelectedRequestId(null)}>
                  Clear
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState title="Select a request" hint="Click on a transport request card in the Demand Lane to view capacity matches." />
          )}
        </Panel>
      </div>

      {/* BOTTOM SECTION: LIVE MAP + EXCEPTIONS / ACTIVITIES */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* LIVE MAP */}
        <Panel
          title="Live Map Dispatch Telemetry"
          actions={
            <div style={{ display: 'flex', gap: 4 }}>
              <Select style={{ fontSize: 10, padding: '2px 4px' }} value={mapFilterSite} onChange={(e) => setMapFilterSite(e.target.value)}>
                <option value="All">All Hubs</option>
                <option value="Delhi Hub">Delhi Hub</option>
                <option value="Jaipur Hub">Jaipur Hub</option>
                <option value="Mumbai Hub">Mumbai Hub</option>
              </Select>
              <Select style={{ fontSize: 10, padding: '2px 4px' }} value={mapFilterStatus} onChange={(e) => setMapFilterStatus(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="In Transit">In Transit</option>
              </Select>
            </div>
          }
          padded={false}
        >
          <div style={{ position: 'relative', height: 350, backgroundColor: 'var(--panel-2)', overflow: 'hidden' }}>
            {/* Visual Custom Map Background */}
            <svg width="100%" height="100%" viewBox="0 0 600 350" style={{ backgroundColor: '#13151a' }}>
              {/* Map grids/gridlines */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1c1f26" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Major corridors/roads */}
              {/* Delhi -> Gurugram -> Jaipur */}
              <path d="M 120 80 Q 150 140 220 180" fill="none" stroke="#252c38" strokeWidth="3" />
              {/* Delhi -> Mumbai */}
              <path d="M 120 80 Q 250 150 480 280" fill="none" stroke="#252c38" strokeWidth="2.5" strokeDasharray="5 5" />
              {/* Jaipur -> Mumbai */}
              <path d="M 220 180 Q 320 220 480 280" fill="none" stroke="#252c38" strokeWidth="2" />

              {/* Active Trip Routes */}
              {trips.filter(t => t.status === 'In Transit').map((trip, idx) => {
                const isDelhiJaipur = trip.routeName.includes('Delhi') && trip.routeName.includes('Jaipur');
                const isDelhiMumbai = trip.routeName.includes('Delhi') && trip.routeName.includes('Mumbai');
                return (
                  <path
                    key={idx}
                    d={isDelhiJaipur ? "M 120 80 Q 150 140 220 180" : isDelhiMumbai ? "M 120 80 Q 250 150 480 280" : "M 120 80 Q 150 140 220 180"}
                    fill="none"
                    stroke="var(--green)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  >
                    <animate attributeName="stroke-dashoffset" values="20;0" dur="4s" repeatCount="indefinite" />
                  </path>
                );
              })}

              {/* Hub Markers */}
              {[
                { name: 'Delhi Hub', x: 120, y: 80, color: 'var(--green)' },
                { name: 'Gurugram Hub', x: 150, y: 110, color: 'var(--green)' },
                { name: 'Jaipur Hub', x: 220, y: 180, color: 'var(--blue)' },
                { name: 'Mumbai Hub', x: 480, y: 280, color: 'var(--amber)' }
              ].map((site) => (
                <g key={site.name} transform={`translate(${site.x}, ${site.y})`} style={{ cursor: 'pointer' }}>
                  <circle cx="0" cy="0" r="10" fill="rgba(63, 222, 121, 0.15)" />
                  <circle cx="0" cy="0" r="4" fill={site.color} />
                  <text x="12" y="4" fill="#a4a6b0" fontSize="10" fontFamily="monospace" fontWeight="600">{site.name}</text>
                </g>
              ))}

              {/* Moving Vehicle Markers */}
              {vehicles.filter(v => v.status === 'In Transit').map((v, idx) => {
                // Animate vehicles on corridors
                const offset = 40 + idx * 80;
                return (
                  <g key={v.id} transform={`translate(${120 + offset}, ${80 + idx * 40})`} style={{ cursor: 'pointer' }} onClick={() => v.currentTripId && openTripDrawer(v.currentTripId)}>
                    <circle cx="0" cy="0" r="7" fill="var(--green)" />
                    <circle cx="0" cy="0" r="3" fill="#ffffff">
                      <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <text x="10" y="-5" fill="var(--green)" fontSize="9" fontWeight="700" fontFamily="monospace">{v.vehicleNumber}</text>
                  </g>
                );
              })}
            </svg>

            {/* Map HUD Overlay */}
            <div style={{ position: 'absolute', bottom: 12, left: 12, backgroundColor: 'rgba(19, 21, 26, 0.85)', padding: '6px 12px', borderRadius: 4, border: '1px solid var(--border-soft)', fontSize: 10, display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--green)' }} />
                <span>Delhi-NCR Corridor</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--amber)' }} />
                <span>Western Route (Mumbai)</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* EXCEPTIONS & AUDIT LOGS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* EXCEPTION CENTER */}
          <Panel
            title="Telemetry Warnings"
            subtitle="Exception Alerts Log"
            padded={false}
          >
            <div style={{ height: 145, overflowY: 'auto', padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {exceptions.filter(e => e.status === 'Open').length === 0 ? (
                <EmptyState title="No active anomalies" hint="GPS and telematics check healthy." />
              ) : (
                exceptions.filter(e => e.status === 'Open').map((exc) => (
                  <div
                    key={exc.id}
                    style={{
                      padding: 6,
                      borderRadius: 4,
                      border: '1.5px solid var(--border-soft)',
                      borderLeft: '4px solid var(--red)',
                      fontSize: 10,
                      backgroundColor: 'var(--panel-2)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AlertTriangle size={11} color="var(--red)" />
                        {exc.type} · {exc.vehicleNumber}
                      </div>
                      <div style={{ color: 'var(--text-3)', marginTop: 2 }}>{exc.details}</div>
                    </div>
                    <Button size="sm" variant="ghost" style={{ padding: '2px 4px', fontSize: 9 }} onClick={() => void handleResolveException(exc.id)}>
                      Dismiss
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Panel>

          {/* DISPATCH AUDIT LOG */}
          <Panel
            title="Recent Activities"
            subtitle="Live Operations Dispatch Trail"
            padded={false}
          >
            <div style={{ height: 145, overflowY: 'auto', padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {trips.length === 0 ? (
                <EmptyState title="No activity" hint="Actions show here." />
              ) : (
                trips.slice(0, 5).map((t, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 6,
                      borderRadius: 4,
                      fontSize: 10,
                      backgroundColor: 'var(--panel-1)',
                      borderBottom: '1px solid var(--border-soft)',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{t.tripId}</span>
                      <span style={{ color: 'var(--text-3)', marginLeft: 6 }}>{t.routeName}</span>
                    </div>
                    <Badge tone={t.status === 'Completed' ? 'green' : t.status === 'In Transit' ? 'amber' : 'blue'}>
                      {t.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>

      {/* --- ALLOCATE RUN MODAL --- */}
      <Modal
        open={assignModalOpen}
        title="Allocate Transport Request"
        subtitle={`Select available assets for demand ID: ${selectedRequest?.id}`}
        onClose={() => setAssignModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={submittingAction}
              disabled={!selectedVehicleId || !selectedDriverId}
              onClick={handleAssign}
            >
              Confirm Assignment
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {selectedRequest && (
            <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 4, border: '1px solid var(--border-soft)', fontSize: 11 }}>
              <strong>Demand details:</strong> {selectedRequest.customer} · {selectedRequest.pickup} to {selectedRequest.destination} · Requires: {selectedRequest.vehicleType}
            </div>
          )}

          <div className="adm-field">
            <span className="adm-field-label">Select Eligible Vehicle</span>
            <Select value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)}>
              <option value="">-- Choose Vehicle --</option>
              {eligibleVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicleNumber} ({v.class} · Fuel: {v.fuel}% · Util: {v.utilization}%)
                </option>
              ))}
            </Select>
          </div>

          <div className="adm-field">
            <span className="adm-field-label">Select Eligible Driver</span>
            <Select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)}>
              <option value="">-- Choose Driver --</option>
              {eligibleDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (License: {d.licenseType} · Duty Hours: {d.dutyHours}h · Safety: {d.safetyScore})
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>

      {/* --- VENDOR SPILL MODAL --- */}
      <Modal
        open={vendorModalOpen}
        title="Raise Transporter Indent (Vendor Spill)"
        subtitle={`Select contract vendor for demand ID: ${selectedRequest?.id}`}
        onClose={() => setVendorModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setVendorModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={submittingAction}
              onClick={handleVendorSpill}
            >
              Raise Indent
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {selectedRequest && (
            <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 4, border: '1px solid var(--border-soft)', fontSize: 11 }}>
              <strong>Demand details:</strong> {selectedRequest.customer} · {selectedRequest.pickup} to {selectedRequest.destination} · Volume: {selectedRequest.capacityRequired}
            </div>
          )}

          <div className="adm-field">
            <span className="adm-field-label">Select Transporter Vendor</span>
            <Select value={selectedVendorName} onChange={(e) => setSelectedVendorName(e.target.value)}>
              <option value="Gati Logistics">Gati Logistics (Rate Card: Route Tier 1 · Placement Score: 95%)</option>
              <option value="Safexpress">Safexpress (Rate Card: Route Tier 2 · Placement Score: 90%)</option>
              <option value="VRL Logistics">VRL Logistics (Rate Card: Route Tier 1 · Placement Score: 98%)</option>
            </Select>
          </div>
        </div>
      </Modal>

      {/* --- TRIP 360 DRAWER VIEW --- */}
      {activeTripDetail && (
        <div
          className="adm-modal-backdrop"
          onClick={() => setActiveTripDetail(null)}
          style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'stretch' }}
        >
          <div
            className="adm-modal"
            style={{
              width: 500,
              height: '100%',
              margin: 0,
              borderRadius: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="adm-modal-head" style={{ borderBottom: '1px solid var(--border-soft)', paddingBottom: 10 }}>
              <div>
                <span className="mono-label" style={{ fontSize: 9 }}>Trip 360 View</span>
                <h3 className="adm-panel-title" style={{ margin: 0 }}>{activeTripDetail.tripId}</h3>
                <p className="adm-panel-sub" style={{ margin: 0 }}>{activeTripDetail.routeName}</p>
              </div>
              <Button variant="ghost" onClick={() => setActiveTripDetail(null)}>Close</Button>
            </header>

            <div style={{ flexGrow: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>Vehicle Number</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{activeTripDetail.vehicleNumber || 'Unassigned'}</div>
                </div>
                <div>
                  <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>Driver Name</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{activeTripDetail.driverName || 'Unassigned'}</div>
                </div>
              </div>

              <div>
                <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>State Timeline</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  {JSON.parse(activeTripDetail.stateTimeline as string || '[]').map((st: any, idx: number) => (
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
                <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>Trip Timeline Milestones</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  {JSON.parse(activeTripDetail.timeline as string || '[]').map((pt: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: 4, borderBottom: '1px dashed var(--border-soft)' }}>
                      <span>{pt.name}</span>
                      <span style={{ color: pt.status === 'Done' ? 'var(--green)' : 'var(--text-3)' }}>{pt.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>Digital PODs & Docs</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  {JSON.parse(activeTripDetail.documents as string || '[]').map((doc: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: 4, backgroundColor: 'var(--panel-2)', borderRadius: 2 }}>
                      <span>📄 {doc.name}</span>
                      <Badge tone={doc.status === 'Verified' ? 'green' : 'amber'}>{doc.status}</Badge>
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
