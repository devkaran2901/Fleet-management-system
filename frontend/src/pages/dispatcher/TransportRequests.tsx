import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ClipboardList, Plus, RefreshCw, Eye, Copy } from 'lucide-react';
import { dispatcherApi } from '../../services/dispatcherApi';
import type { TransportRequest, Vehicle, Driver } from '../../services/dispatcherApi';
import { Badge, Button, EmptyState, ErrorState, Input, LoadingState, Modal, Panel, Select, useToast } from '../../components/admin/ui';

export const TransportRequests: React.FC = () => {
  const { notify } = useToast();

  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [query, setQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterApproval, setFilterApproval] = useState('All');
  const [filterType, setFilterType] = useState('All');

  // Modals
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<TransportRequest | null>(null);
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [saving, setSaving] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    id: '',
    customer: '',
    pickup: '',
    destination: '',
    vehicleType: 'Container',
    capacityRequired: '10 Ton',
    timeWindow: '08:00 - 18:00',
    priority: 'MEDIUM' as const,
    approvalStatus: 'APPROVED' as const,
    tripType: 'Secondary',
    distance: '120',
    eta: '3h 0m'
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [reqData, vehData, drvData] = await Promise.all([
        dispatcherApi.requests(),
        dispatcherApi.vehicles(),
        dispatcherApi.drivers()
      ]);
      setRequests(reqData);
      setVehicles(vehData);
      setDrivers(drvData);
    } catch (err: any) {
      setError(err?.message || 'Could not load transport requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Filtering
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.id.toLowerCase().includes(query.toLowerCase()) ||
        r.customer.toLowerCase().includes(query.toLowerCase()) ||
        r.pickup.toLowerCase().includes(query.toLowerCase()) ||
        r.destination.toLowerCase().includes(query.toLowerCase());
      const matchesPriority = filterPriority === 'All' || r.priority === filterPriority;
      const matchesApproval = filterApproval === 'All' || r.approvalStatus === filterApproval;
      const matchesType = filterType === 'All' || r.vehicleType === filterType;
      return matchesSearch && matchesPriority && matchesApproval && matchesType;
    });
  }, [requests, query, filterPriority, filterApproval, filterType]);

  // Filter lists
  const eligibleVehicles = useMemo(() => {
    if (!selectedReq) return [];
    return vehicles.filter(v => v.status === 'Available' && v.class.toLowerCase() === selectedReq.vehicleType.toLowerCase());
  }, [selectedReq, vehicles]);

  const eligibleDrivers = useMemo(() => {
    return drivers.filter(d => d.status === 'Available' && d.dutyHours < 8.0);
  }, [drivers]);

  // Actions
  const handleAssign = async () => {
    if (!selectedReq || !vehicleId || !driverId) {
      notify('error', 'Select vehicle and driver');
      return;
    }
    setSaving(true);
    try {
      await dispatcherApi.assignRequest(selectedReq.id, vehicleId, driverId);
      notify('success', `Request ${selectedReq.id} assigned successfully`);
      setAssignOpen(false);
      setSelectedReq(null);
      setVehicleId('');
      setDriverId('');
      await loadData();
    } catch (err: any) {
      notify('error', err?.message || 'Assignment failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.id || !newRequest.customer || !newRequest.pickup || !newRequest.destination) {
      notify('error', 'Please fill all mandatory fields');
      return;
    }
    setSaving(true);
    try {
      await dispatcherApi.createRequest({
        ...newRequest,
        distance: Number(newRequest.distance),
        date: new Date().toISOString()
      });
      notify('success', `Request ${newRequest.id} created`);
      setCreateOpen(false);
      setNewRequest({
        id: '',
        customer: '',
        pickup: '',
        destination: '',
        vehicleType: 'Container',
        capacityRequired: '10 Ton',
        timeWindow: '08:00 - 18:00',
        priority: 'MEDIUM',
        approvalStatus: 'APPROVED',
        tripType: 'Secondary',
        distance: '120',
        eta: '3h 0m'
      });
      await loadData();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to create request');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading transport requests" />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Transport Demands</span>
          <h1 className="adm-page-title">
            <ClipboardList size={22} color="var(--green)" /> Transport Requests
          </h1>
          <p className="adm-page-sub">
            Complete list of customer transport orders, approval workflows, and quick dispatch queue.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
          New Request
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <Panel title="Total Demands" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{requests.length}</div></Panel>
        <Panel title="Unassigned" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--red)' }}>{requests.filter(r => r.status === 'Unassigned').length}</div></Panel>
        <Panel title="Assigned" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{requests.filter(r => r.status === 'Assigned').length}</div></Panel>
        <Panel title="Pending Approval" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--amber)' }}>{requests.filter(r => r.approvalStatus === 'PENDING').length}</div></Panel>
      </div>

      <Panel
        title="Demand Records"
        subtitle={`${filtered.length} requests matching filters`}
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <Input
              style={{ width: 200 }}
              placeholder="Search ID, customer..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select style={{ width: 120 }} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="All">All Priority</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </Select>
            <Select style={{ width: 120 }} value={filterApproval} onChange={(e) => setFilterApproval(e.target.value)}>
              <option value="All">All Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="HOLD">Hold</option>
            </Select>
            <Select style={{ width: 120 }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="All">All Type</option>
              <option value="Container">Container</option>
              <option value="Flatbed">Flatbed</option>
              <option value="Open Body">Open Body</option>
            </Select>
            <Button variant="subtle" icon={<RefreshCw size={12} />} onClick={loadData} />
          </div>
        }
        padded={false}
      >
        {filtered.length === 0 ? (
          <EmptyState title="No requests found" hint="Try adjusting filters." />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Customer</th>
                  <th>Pickup</th>
                  <th>Destination</th>
                  <th>Vehicle Requirements</th>
                  <th>Priority</th>
                  <th>Approval</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => (
                  <tr key={req.id}>
                    <td className="adm-cell-mono" style={{ fontWeight: 600 }}>{req.id}</td>
                    <td>{req.customer}</td>
                    <td>{req.pickup}</td>
                    <td>{req.destination}</td>
                    <td>
                      <div style={{ fontSize: 11 }}>
                        <strong>{req.vehicleType}</strong>
                        <div className="adm-row-sub">{req.capacityRequired}</div>
                      </div>
                    </td>
                    <td>
                      <Badge tone={req.priority === 'CRITICAL' ? 'red' : req.priority === 'HIGH' ? 'amber' : 'green'}>
                        {req.priority}
                      </Badge>
                    </td>
                    <td>
                      <Badge tone={req.approvalStatus === 'APPROVED' ? 'green' : req.approvalStatus === 'PENDING' ? 'amber' : 'grey'}>
                        {req.approvalStatus}
                      </Badge>
                    </td>
                    <td>
                      <Badge tone={req.status === 'Assigned' ? 'green' : req.status === 'Unassigned' ? 'red' : 'grey'}>
                        {req.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="adm-cell-actions">
                        {req.status === 'Unassigned' && req.approvalStatus === 'APPROVED' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSelectedReq(req);
                              setAssignOpen(true);
                            }}
                          >
                            Assign
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" disabled icon={<Eye size={12} />} />
                        )}
                        <Button variant="subtle" size="sm" icon={<Copy size={12} />} title="Duplicate" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* ASSIGN RUN MODAL */}
      <Modal
        open={assignOpen}
        title="Direct Fleet Assignment"
        subtitle={`Select assets for request: ${selectedReq?.id}`}
        onClose={() => setAssignOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} disabled={!vehicleId || !driverId} onClick={handleAssign}>
              Confirm Allocation
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="adm-field">
            <span className="adm-field-label">Available Vehicles (Matching Class: {selectedReq?.vehicleType})</span>
            <Select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              <option value="">-- Select Vehicle --</option>
              {eligibleVehicles.map(v => (
                <option key={v.id} value={v.id}>{v.vehicleNumber} (Fuel: {v.fuel}% · Site: {v.site})</option>
              ))}
            </Select>
          </div>

          <div className="adm-field">
            <span className="adm-field-label">Available Drivers</span>
            <Select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
              <option value="">-- Select Driver --</option>
              {eligibleDrivers.map(d => (
                <option key={d.id} value={d.id}>{d.name} (Duty Hours: {d.dutyHours}h · Safety: {d.safetyScore}/100)</option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>

      {/* CREATE REQUEST MODAL */}
      <Modal
        open={createOpen}
        title="Create New Transport Request"
        subtitle="Create manual customer request"
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleCreateRequest}>Create Demand</Button>
          </>
        }
      >
        <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="adm-field">
              <span className="adm-field-label">Request ID</span>
              <Input
                required
                placeholder="e.g. TR-2026-901"
                value={newRequest.id}
                onChange={(e) => setNewRequest(prev => ({ ...prev, id: e.target.value }))}
              />
            </div>
            <div className="adm-field">
              <span className="adm-field-label">Customer Name</span>
              <Input
                required
                placeholder="e.g. Amazon India"
                value={newRequest.customer}
                onChange={(e) => setNewRequest(prev => ({ ...prev, customer: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="adm-field">
              <span className="adm-field-label">Pickup Hub</span>
              <Input
                required
                placeholder="e.g. Delhi Hub"
                value={newRequest.pickup}
                onChange={(e) => setNewRequest(prev => ({ ...prev, pickup: e.target.value }))}
              />
            </div>
            <div className="adm-field">
              <span className="adm-field-label">Destination Depot</span>
              <Input
                required
                placeholder="e.g. Mumbai Hub"
                value={newRequest.destination}
                onChange={(e) => setNewRequest(prev => ({ ...prev, destination: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="adm-field">
              <span className="adm-field-label">Vehicle Type Required</span>
              <Select value={newRequest.vehicleType} onChange={(e) => setNewRequest(prev => ({ ...prev, vehicleType: e.target.value }))}>
                <option value="Container">Container</option>
                <option value="Flatbed">Flatbed</option>
                <option value="Open Body">Open Body</option>
              </Select>
            </div>
            <div className="adm-field">
              <span className="adm-field-label">Capacity Required</span>
              <Input
                placeholder="e.g. 10 Ton"
                value={newRequest.capacityRequired}
                onChange={(e) => setNewRequest(prev => ({ ...prev, capacityRequired: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="adm-field">
              <span className="adm-field-label">Priority</span>
              <Select value={newRequest.priority} onChange={(e) => setNewRequest(prev => ({ ...prev, priority: e.target.value as any }))}>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </Select>
            </div>
            <div className="adm-field">
              <span className="adm-field-label">Distance (km)</span>
              <Input
                type="number"
                value={newRequest.distance}
                onChange={(e) => setNewRequest(prev => ({ ...prev, distance: e.target.value }))}
              />
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};
