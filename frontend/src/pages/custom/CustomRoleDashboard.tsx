import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, Search, Plus, CheckCircle, Layers, Activity, Shield, DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  Badge, Button, Panel, Input, Select, Modal, useToast
} from '../../components/admin/ui';
import '../../styles/admin.css';

// Demo datasets for working features
const INITIAL_VEHICLES = [
  { id: 'veh-101', code: 'TRK-9001', regNo: 'DL-01-AX-9912', model: 'Tata Prima 3538.K', driver: 'Rajesh Kumar', status: 'AVAILABLE', location: 'Delhi Hub' },
  { id: 'veh-102', code: 'TRK-9002', regNo: 'MH-04-EV-8821', model: 'Ashok Leyland 4220', driver: 'Vikram Singh', status: 'IN_TRANSIT', location: 'Mumbai Depot' },
  { id: 'veh-103', code: 'TRK-9003', regNo: 'KA-02-GB-1102', model: 'BharatBenz 2823C', driver: 'Amit Verma', status: 'MAINTENANCE', location: 'Gurugram Workshop' },
  { id: 'veh-104', code: 'TRK-9004', regNo: 'HR-55-AB-7734', model: 'Eicher Pro 6035', driver: 'Sunil Sharma', status: 'AVAILABLE', location: 'Jaipur Hub' },
];

const INITIAL_DRIVERS = [
  { id: 'drv-201', name: 'Rajesh Kumar', phone: '+91 98765 43210', license: 'DL-992011299', status: 'ON_DUTY', vehicle: 'TRK-9001' },
  { id: 'drv-202', name: 'Vikram Singh', phone: '+91 98123 45678', license: 'MH-881200344', status: 'ON_TRIP', vehicle: 'TRK-9002' },
  { id: 'drv-203', name: 'Amit Verma', phone: '+91 97111 22334', license: 'KA-773344112', status: 'OFF_DUTY', vehicle: 'Unassigned' },
];

const INITIAL_TRIPS = [
  { id: 'TRP-8801', origin: 'Delhi North Hub', destination: 'Mumbai Central Hub', cargo: 'Automotive Parts (24 Tons)', status: 'IN_TRANSIT', driver: 'Vikram Singh', vehicle: 'TRK-9002' },
  { id: 'TRP-8802', origin: 'Gurugram Depot 1', destination: 'Jaipur Industrial Area', cargo: 'FMCG Goods (18 Tons)', status: 'SCHEDULED', driver: 'Rajesh Kumar', vehicle: 'TRK-9001' },
];

const INITIAL_EXPENSES = [
  { id: 'EXP-401', category: 'Fuel & Toll', amount: 14500, submittedBy: 'Rajesh Kumar', tripId: 'TRP-8801', status: 'PENDING' },
  { id: 'EXP-402', category: 'Tyre Maintenance', amount: 8200, submittedBy: 'Amit Verma', tripId: 'TRP-8803', status: 'PENDING' },
  { id: 'EXP-403', category: 'Overnight Loading', amount: 3500, submittedBy: 'Vikram Singh', tripId: 'TRP-8802', status: 'APPROVED' },
];

const INITIAL_VENDORS = [
  { id: 'vnd-501', name: 'Gati Freight Services', fleetCount: 42, rating: 4.8, status: 'ACTIVE' },
  { id: 'vnd-502', name: 'VRL Logistics Ltd', fleetCount: 65, rating: 4.9, status: 'ACTIVE' },
  { id: 'vnd-503', name: 'Express Cargo Movers', fleetCount: 18, rating: 4.2, status: 'UNDER_REVIEW' },
];

export const CustomRoleDashboard: React.FC = () => {
  const { user } = useAuth();
  const { notify } = useToast();

  const roleName = user?.roles?.[0] || 'Custom Role';
  
  // Resolve user capabilities
  const rawCapabilities = user?.capabilities || [];

  // Working State
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [vendors] = useState(INITIAL_VENDORS);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');

  // Modals
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [newOrigin, setNewOrigin] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newCargo, setNewCargo] = useState('');
  const [newVehId, setNewVehId] = useState('TRK-9001');

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expCategory, setExpCategory] = useState('Fuel & Toll');
  const [expAmount, setExpAmount] = useState('');

  // Generic Capability Activity Stream
  const [capabilityLogs, setCapabilityLogs] = useState<Array<{ id: string; capKey: string; message: string; timestamp: string }>>([
    { id: 'log-1', capKey: 'system.init', message: `Dashboard initialized for user ${user?.email}`, timestamp: new Date().toLocaleTimeString() },
  ]);

  // Capability checks
  const capKeys = useMemo(() => new Set(rawCapabilities.map((c) => c.capabilityKey)), [rawCapabilities]);

  const hasFleetView = capKeys.has('fleet.view') || capKeys.has('fleet.edit');
  const hasFleetEdit = capKeys.has('fleet.edit');
  const hasDriverManage = capKeys.has('driver.manage');
  const hasTripRecord = capKeys.has('trip.record') || capKeys.has('route.dispatch');
  const hasExpenseSubmit = capKeys.has('expense.submit');
  const hasExpenseApprove = capKeys.has('expense.approve');
  const hasPaymentRelease = capKeys.has('payment.release');
  const hasVendorManage = capKeys.has('vendor.manage');

  // Filtered Capabilities list for dynamic display
  const filteredCapabilities = useMemo(() => {
    return rawCapabilities.filter((c) => {
      const matchQuery = `${c.capabilityKey} ${c.label || ''} ${c.group || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGroup = selectedGroupFilter === 'ALL' || c.group?.toUpperCase() === selectedGroupFilter.toUpperCase();
      return matchQuery && matchGroup;
    });
  }, [rawCapabilities, searchQuery, selectedGroupFilter]);

  const uniqueGroups = useMemo(() => {
    const set = new Set<string>();
    rawCapabilities.forEach((c) => { if (c.group) set.add(c.group.toUpperCase()); });
    return Array.from(set);
  }, [rawCapabilities]);

  // Actions
  const handleVehicleStatusChange = (vehId: string, newStatus: string) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehId ? { ...v, status: newStatus } : v))
    );
    notify('success', `Vehicle ${vehId} status updated to ${newStatus}`);
    logCapabilityAction('fleet.edit', `Updated status of ${vehId} to ${newStatus}`);
  };

  const handleDriverStatusToggle = (drvId: string) => {
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === drvId
          ? { ...d, status: d.status === 'ON_DUTY' ? 'OFF_DUTY' : 'ON_DUTY' }
          : d
      )
    );
    notify('success', `Driver status updated for ${drvId}`);
    logCapabilityAction('driver.manage', `Toggled duty status for driver ${drvId}`);
  };

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigin || !newDestination || !newCargo) {
      notify('error', 'Please fill in origin, destination and cargo details');
      return;
    }
    const newTrip = {
      id: `TRP-${Math.floor(1000 + Math.random() * 9000)}`,
      origin: newOrigin,
      destination: newDestination,
      cargo: `${newCargo} (Custom Run)`,
      status: 'SCHEDULED',
      driver: 'Rajesh Kumar',
      vehicle: newVehId,
    };
    setTrips([newTrip, ...trips]);
    notify('success', `Created transport run ${newTrip.id}`);
    logCapabilityAction('route.dispatch', `Created new trip run ${newTrip.id} from ${newOrigin} to ${newDestination}`);
    setDispatchModalOpen(false);
    setNewOrigin('');
    setNewDestination('');
    setNewCargo('');
  };

  const handleApproveExpense = (expId: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === expId ? { ...e, status: 'APPROVED' } : e))
    );
    notify('success', `Approved expense ${expId}`);
    logCapabilityAction('expense.approve', `Approved expense claim ${expId}`);
  };

  const handleRejectExpense = (expId: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === expId ? { ...e, status: 'REJECTED' } : e))
    );
    notify('error', `Rejected expense ${expId}`);
    logCapabilityAction('expense.approve', `Rejected expense claim ${expId}`);
  };

  const handleReleasePayment = (expId: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === expId ? { ...e, status: 'PAID' } : e))
    );
    notify('success', `Released payment for expense ${expId}`);
    logCapabilityAction('payment.release', `Released payment for ${expId}`);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount) return;
    const newExp = {
      id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      category: expCategory,
      amount: Number(expAmount),
      submittedBy: `${user?.firstName} ${user?.lastName}`,
      tripId: 'TRP-8801',
      status: 'PENDING',
    };
    setExpenses([newExp, ...expenses]);
    notify('success', `Submitted expense claim ${newExp.id}`);
    logCapabilityAction('expense.submit', `Submitted expense claim ${newExp.id} for ₹${expAmount}`);
    setExpenseModalOpen(false);
    setExpAmount('');
  };

  const logCapabilityAction = (capKey: string, message: string) => {
    setCapabilityLogs((prev) => [
      { id: `log-${Date.now()}`, capKey, message, timestamp: new Date().toLocaleTimeString() },
      ...prev,
    ]);
  };

  return (
    <>
      {/* Hero Banner */}
      <div className="adm-page-head" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span className="adm-spec-chip mono-label" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: 'var(--green)' }}>
              DYNAMIC DASHBOARD
            </span>
            <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>
              ROLE ID: {roleName.toUpperCase()}
            </span>
          </div>
          <h1 className="adm-page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={26} color="var(--green)" />
            Welcome, {user?.firstName} {user?.lastName}
          </h1>
          <p className="adm-page-sub">
            Your dynamic role workspace for <strong>{roleName}</strong>. Displaying only the features and operational tools enabled for your assigned capability matrix.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {hasTripRecord && (
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setDispatchModalOpen(true)}>
              New Trip Run
            </Button>
          )}
          {hasExpenseSubmit && (
            <Button variant="subtle" icon={<DollarSign size={14} />} onClick={() => setExpenseModalOpen(true)}>
              Submit Expense
            </Button>
          )}
        </div>
      </div>

      {/* Role Summary Stats */}
      <div className="adm-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 24 }}>
        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: 'var(--green)' }}>
            <Shield size={18} />
          </div>
          <div>
            <div className="adm-stat-value">{rawCapabilities.length}</div>
            <div className="adm-stat-label">Assigned Capabilities</div>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--blue)' }}>
            <Layers size={18} />
          </div>
          <div>
            <div className="adm-stat-value">{uniqueGroups.length}</div>
            <div className="adm-stat-label">Capability Groups</div>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: 'var(--amber)' }}>
            <Activity size={18} />
          </div>
          <div>
            <div className="adm-stat-value">Active</div>
            <div className="adm-stat-label">System Operational Status</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Panel style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
            <Search size={16} color="var(--text-3)" />
            <Input
              placeholder="Search assigned capabilities & features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className={`adm-tab-btn ${selectedGroupFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedGroupFilter('ALL')}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 12, border: '1px solid var(--border-soft)',
                backgroundColor: selectedGroupFilter === 'ALL' ? 'var(--green-soft)' : 'transparent',
                color: selectedGroupFilter === 'ALL' ? 'var(--green)' : 'var(--text-2)', cursor: 'pointer'
              }}
            >
              All Features ({rawCapabilities.length})
            </button>
            {uniqueGroups.map((grp) => (
              <button
                key={grp}
                className={`adm-tab-btn ${selectedGroupFilter === grp ? 'active' : ''}`}
                onClick={() => setSelectedGroupFilter(grp)}
                style={{
                  padding: '6px 14px', borderRadius: 6, fontSize: 12, border: '1px solid var(--border-soft)',
                  backgroundColor: selectedGroupFilter === grp ? 'var(--green-soft)' : 'transparent',
                  color: selectedGroupFilter === grp ? 'var(--green)' : 'var(--text-2)', cursor: 'pointer'
                }}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {/* Capability Feature Modules Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* 1. FLEET OPERATIONS MODULE */}
        {hasFleetView && (
          <Panel
            title="Fleet Assets & Availability"
            subtitle="Enabled by capability: fleet.view / fleet.edit"
            actions={
              <Badge tone={hasFleetEdit ? 'green' : 'grey'}>
                {hasFleetEdit ? 'READ / WRITE ACCESS' : 'READ ONLY'}
              </Badge>
            }
          >
            <div style={{ overflowX: 'auto' }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Vehicle Code</th>
                    <th>Reg Number</th>
                    <th>Model</th>
                    <th>Assigned Driver</th>
                    <th>Location</th>
                    <th>Status</th>
                    {hasFleetEdit && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.id}>
                      <td className="mono-label" style={{ fontWeight: 600 }}>{v.code}</td>
                      <td>{v.regNo}</td>
                      <td>{v.model}</td>
                      <td>{v.driver}</td>
                      <td>{v.location}</td>
                      <td>
                        <Badge
                          tone={v.status === 'AVAILABLE' ? 'green' : v.status === 'IN_TRANSIT' ? 'blue' : 'amber'}
                        >
                          {v.status}
                        </Badge>
                      </td>
                      {hasFleetEdit && (
                        <td>
                          <Select
                            value={v.status}
                            onChange={(e) => handleVehicleStatusChange(v.id, e.target.value)}
                            style={{ padding: '2px 8px', fontSize: 12 }}
                          >
                            <option value="AVAILABLE">AVAILABLE</option>
                            <option value="IN_TRANSIT">IN_TRANSIT</option>
                            <option value="MAINTENANCE">MAINTENANCE</option>
                          </Select>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {/* 2. DRIVER ROSTER MODULE */}
        {hasDriverManage && (
          <Panel
            title="Driver Duty Roster"
            subtitle="Enabled by capability: driver.manage"
            actions={<Badge tone="blue">DUTY MANAGEMENT</Badge>}
          >
            <div style={{ overflowX: 'auto' }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Driver ID</th>
                    <th>Driver Name</th>
                    <th>Phone</th>
                    <th>License No</th>
                    <th>Assigned Unit</th>
                    <th>Duty Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d) => (
                    <tr key={d.id}>
                      <td className="mono-label">{d.id}</td>
                      <td style={{ fontWeight: 500 }}>{d.name}</td>
                      <td>{d.phone}</td>
                      <td className="mono-label">{d.license}</td>
                      <td>{d.vehicle}</td>
                      <td>
                        <Badge tone={d.status === 'ON_DUTY' ? 'green' : d.status === 'ON_TRIP' ? 'blue' : 'grey'}>
                          {d.status}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          style={{ padding: '2px 8px', fontSize: 11 }}
                          onClick={() => handleDriverStatusToggle(d.id)}
                        >
                          Toggle Duty
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {/* 3. DISPATCH & TRIP RECORD MODULE */}
        {hasTripRecord && (
          <Panel
            title="Dispatch & Active Trip Runs"
            subtitle="Enabled by capability: route.dispatch / trip.record"
            actions={
              <Button variant="primary" icon={<Plus size={12} />} onClick={() => setDispatchModalOpen(true)} style={{ fontSize: 12, padding: '4px 10px' }}>
                New Trip Run
              </Button>
            }
          >
            <div style={{ overflowX: 'auto' }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Trip ID</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Cargo Payload</th>
                    <th>Driver</th>
                    <th>Vehicle</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((t) => (
                    <tr key={t.id}>
                      <td className="mono-label" style={{ fontWeight: 600, color: 'var(--green)' }}>{t.id}</td>
                      <td>{t.origin}</td>
                      <td>{t.destination}</td>
                      <td>{t.cargo}</td>
                      <td>{t.driver}</td>
                      <td className="mono-label">{t.vehicle}</td>
                      <td>
                        <Badge tone={t.status === 'IN_TRANSIT' ? 'blue' : 'amber'}>
                          {t.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {/* 4. FINANCE & EXPENSES MODULE */}
        {(hasExpenseSubmit || hasExpenseApprove || hasPaymentRelease) && (
          <Panel
            title="Finance & Expenses Workbench"
            subtitle="Enabled by capability: expense.submit / expense.approve / payment.release"
            actions={
              hasExpenseSubmit ? (
                <Button variant="subtle" icon={<DollarSign size={12} />} onClick={() => setExpenseModalOpen(true)} style={{ fontSize: 12, padding: '4px 10px' }}>
                  Submit Expense
                </Button>
              ) : undefined
            }
          >
            <div style={{ overflowX: 'auto' }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Claim ID</th>
                    <th>Category</th>
                    <th>Amount (₹)</th>
                    <th>Submitted By</th>
                    <th>Trip ID</th>
                    <th>Status</th>
                    <th>Available Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td className="mono-label" style={{ fontWeight: 600 }}>{e.id}</td>
                      <td>{e.category}</td>
                      <td style={{ fontWeight: 600, color: 'var(--green)' }}>₹{e.amount.toLocaleString('en-IN')}</td>
                      <td>{e.submittedBy}</td>
                      <td className="mono-label">{e.tripId}</td>
                      <td>
                        <Badge tone={e.status === 'APPROVED' ? 'green' : e.status === 'PAID' ? 'blue' : e.status === 'REJECTED' ? 'red' : 'amber'}>
                          {e.status}
                        </Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {hasExpenseApprove && e.status === 'PENDING' && (
                            <>
                              <Button variant="primary" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => handleApproveExpense(e.id)}>
                                Approve
                              </Button>
                              <Button variant="danger" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => handleRejectExpense(e.id)}>
                                Reject
                              </Button>
                            </>
                          )}
                          {hasPaymentRelease && e.status === 'APPROVED' && (
                            <Button variant="subtle" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => handleReleasePayment(e.id)}>
                              Release Payment
                            </Button>
                          )}
                          {e.status === 'PAID' && (
                            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Settled</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {/* 5. VENDOR MANAGEMENT MODULE */}
        {hasVendorManage && (
          <Panel
            title="Vendor Partner Directory"
            subtitle="Enabled by capability: vendor.manage"
            actions={<Badge tone="amber">VENDOR MASTER</Badge>}
          >
            <div style={{ overflowX: 'auto' }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Vendor ID</th>
                    <th>Partner Name</th>
                    <th>Fleet Allocated</th>
                    <th>Rating</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => (
                    <tr key={v.id}>
                      <td className="mono-label">{v.id}</td>
                      <td style={{ fontWeight: 500 }}>{v.name}</td>
                      <td>{v.fleetCount} Vehicles</td>
                      <td>⭐ {v.rating}</td>
                      <td>
                        <Badge tone={v.status === 'ACTIVE' ? 'green' : 'amber'}>
                          {v.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {/* DYNAMIC GRANTED CAPABILITIES MATRIX LISTING */}
        <Panel
          title="All Granted Capabilities & Execution Console"
          subtitle={`Complete list of capabilities granted to role ${roleName}`}
        >
          {filteredCapabilities.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)' }}>
              No capabilities found matching your search.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filteredCapabilities.map((cap) => (
                <div
                  key={cap.capabilityKey}
                  style={{
                    backgroundColor: 'var(--panel-2)',
                    border: '1px solid var(--border-soft)',
                    borderRadius: 8,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span className="mono-label" style={{ fontSize: 10, color: 'var(--green)' }}>
                        {cap.group || 'GENERAL'}
                      </span>
                      <Badge tone="grey">
                        SCOPE: {cap.scope || 'HUB'}
                      </Badge>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)', marginBottom: 4 }}>
                      {cap.label || cap.capabilityKey}
                    </div>

                    <div className="mono-label" style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      Key: {cap.capabilityKey}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-soft)' }}>
                    <span style={{ fontSize: 11, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={12} /> Active &amp; Operational
                    </span>
                    <Button
                      variant="ghost"
                      style={{ padding: '3px 8px', fontSize: 11 }}
                      onClick={() => {
                        logCapabilityAction(cap.capabilityKey, `Triggered action for ${cap.capabilityKey}`);
                        notify('success', `Executed capability action for ${cap.label || cap.capabilityKey}`);
                      }}
                    >
                      Execute
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* CAPABILITY EXECUTION LOG STREAM */}
        <Panel
          title="Capability Execution Audit Log"
          subtitle="Real-time audit log of operations performed under your dynamic role"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
            {capabilityLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 12px', backgroundColor: 'var(--panel-2)', borderRadius: 6,
                  fontSize: 12, borderLeft: '3px solid var(--green)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Badge tone="blue">{log.capKey}</Badge>
                  <span style={{ color: 'var(--text-1)' }}>{log.message}</span>
                </div>
                <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>{log.timestamp}</span>
              </div>
            ))}
          </div>
        </Panel>

      </div>

      {/* DISPATCH MODAL */}
      <Modal
        open={dispatchModalOpen}
        title="Create New Transport Run"
        onClose={() => setDispatchModalOpen(false)}
      >
        <form onSubmit={handleCreateTrip} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="mono-label" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Origin Depot/Hub</label>
            <Input
              placeholder="e.g. Delhi Hub North Annex"
              value={newOrigin}
              onChange={(e) => setNewOrigin(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mono-label" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Destination Hub</label>
            <Input
              placeholder="e.g. Mumbai Logistics Terminal"
              value={newDestination}
              onChange={(e) => setNewDestination(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mono-label" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Cargo &amp; Weight</label>
            <Input
              placeholder="e.g. Electronics (20 Tons)"
              value={newCargo}
              onChange={(e) => setNewCargo(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mono-label" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Assign Fleet Vehicle</label>
            <Select
              value={newVehId}
              onChange={(e) => setNewVehId(e.target.value)}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.code}>{v.code} ({v.model})</option>
              ))}
            </Select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <Button variant="subtle" onClick={() => setDispatchModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Dispatch Run</Button>
          </div>
        </form>
      </Modal>

      {/* EXPENSE SUBMIT MODAL */}
      <Modal
        open={expenseModalOpen}
        title="Submit Expense Claim"
        onClose={() => setExpenseModalOpen(false)}
      >
        <form onSubmit={handleCreateExpense} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="mono-label" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Category</label>
            <Select
              value={expCategory}
              onChange={(e) => setExpCategory(e.target.value)}
            >
              <option value="Fuel & Toll">Fuel &amp; Toll</option>
              <option value="Tyre Maintenance">Tyre Maintenance</option>
              <option value="Overnight Loading">Overnight Loading</option>
              <option value="Challan Penalty">Challan Penalty</option>
            </Select>
          </div>
          <div>
            <label className="mono-label" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Amount (₹)</label>
            <Input
              type="number"
              placeholder="e.g. 5000"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <Button variant="subtle" onClick={() => setExpenseModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit Claim</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
