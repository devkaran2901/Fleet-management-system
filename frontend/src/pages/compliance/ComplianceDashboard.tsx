import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, ShieldAlert, Ban, FileWarning, 
  Activity, Search, Filter, Key, FileText, CheckCircle, Shield, AlertTriangle
} from 'lucide-react';
import { Panel, Badge, Button, Modal, useToast } from '../../components/admin/ui';

// Document types supported
type DocType = 'Fitness' | 'Insurance' | 'Permit' | 'PUC' | 'Tax';

interface VehicleCompliance {
  id: string;
  vehicleNo: string;
  Fitness: 'valid' | 'near_expiry' | 'critical' | 'expired';
  Insurance: 'valid' | 'near_expiry' | 'critical' | 'expired';
  Permit: 'valid' | 'near_expiry' | 'critical' | 'expired';
  PUC: 'valid' | 'near_expiry' | 'critical' | 'expired';
  Tax: 'valid' | 'near_expiry' | 'critical' | 'expired';
}

// Generate 1000 mock vehicles for the sales-demo "must render 1K vehicles instantly" requirement
const generateMockVehicles = (): VehicleCompliance[] => {
  const states = ['DL', 'HR', 'MH', 'UP', 'GJ', 'KA', 'MH', 'RJ'];
  
  const vehicles: VehicleCompliance[] = [];
  
  // Real fixed samples for the first few items to match existing dashboard visual checks
  vehicles.push({ id: '1', vehicleNo: 'RJ-14-AB-1234', Fitness: 'valid', Insurance: 'valid', Permit: 'expired', PUC: 'near_expiry', Tax: 'valid' });
  vehicles.push({ id: '2', vehicleNo: 'RJ-14-AB-5678', Fitness: 'expired', Insurance: 'valid', Permit: 'valid', PUC: 'valid', Tax: 'valid' });
  vehicles.push({ id: '3', vehicleNo: 'DL-01-MA-1234', Fitness: 'valid', Insurance: 'valid', Permit: 'valid', PUC: 'valid', Tax: 'valid' });
  vehicles.push({ id: '4', vehicleNo: 'HR-55-A-9901', Fitness: 'valid', Insurance: 'valid', Permit: 'valid', PUC: 'valid', Tax: 'valid' });
  vehicles.push({ id: '5', vehicleNo: 'GJ-01-XX-1122', Fitness: 'valid', Insurance: 'valid', Permit: 'valid', PUC: 'expired', Tax: 'valid' });
  vehicles.push({ id: '6', vehicleNo: 'DL-02-C-8877', Fitness: 'valid', Insurance: 'expired', Permit: 'valid', PUC: 'valid', Tax: 'valid' });
  vehicles.push({ id: '7', vehicleNo: 'MH-43-R-8899', Fitness: 'valid', Insurance: 'valid', Permit: 'valid', PUC: 'valid', Tax: 'valid' });

  // Generate remaining 993 randomized items
  for (let i = 8; i <= 1000; i++) {
    const state = states[Math.floor(Math.random() * states.length)];
    const code = Math.floor(10 + Math.random() * 89);
    const series = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const num = Math.floor(1000 + Math.random() * 8999);
    const vNo = `${state}-${code}-${series}-${num}`;

    // Highly skewed towards "valid" (90%) for realism
    const getStatus = (): 'valid' | 'near_expiry' | 'critical' | 'expired' => {
      const rand = Math.random();
      if (rand < 0.88) return 'valid';
      if (rand < 0.94) return 'near_expiry';
      if (rand < 0.97) return 'critical';
      return 'expired';
    };

    vehicles.push({
      id: String(i),
      vehicleNo: vNo,
      Fitness: getStatus(),
      Insurance: getStatus(),
      Permit: getStatus(),
      PUC: getStatus(),
      Tax: getStatus(),
    });
  }

  return vehicles;
};

const MOCK_VEHICLES = generateMockVehicles();

// Blocked vehicles mock data
interface BlockedVehicle {
  id: string;
  vehicleNo: string;
  reason: string;
  blockedSince: string;
  overrideCode?: string;
  overrideNotes?: string;
}

const INITIAL_BLOCKED_VEHICLES: BlockedVehicle[] = [
  { id: '1', vehicleNo: 'RJ-14-AB-1234', reason: 'Permit Expired', blockedSince: '2026-07-01' },
  { id: '2', vehicleNo: 'RJ-14-AB-5678', reason: 'Fitness Expired', blockedSince: '2026-07-15' },
  { id: '5', vehicleNo: 'GJ-01-XX-1122', reason: 'PUC Expired', blockedSince: '2026-07-20' },
  { id: '6', vehicleNo: 'DL-02-C-8877', reason: 'Insurance Expired', blockedSince: '2026-07-19' },
];

export const ComplianceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { notify } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Holds & override state
  const [blockedVehicles, setBlockedVehicles] = useState<BlockedVehicle[]>(INITIAL_BLOCKED_VEHICLES);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedBlockedVehicle, setSelectedBlockedVehicle] = useState<BlockedVehicle | null>(null);
  const [overrideCode, setOverrideCode] = useState('AF-09-');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideLogs, setOverrideLogs] = useState<any[]>([
    { id: 'l1', vehicleNo: 'MH-12-PQ-4321', code: 'AF-09-8812', reason: 'Critical vaccine distribution dispatch approved by Director', date: '2026-07-20 09:12' }
  ]);

  // Compute status colors
  const statusColors = {
    valid: { bg: 'var(--green-glow)', border: 'rgba(46, 204, 113, 0.3)', color: 'var(--green)', char: '🟢', label: 'Valid' },
    near_expiry: { bg: 'rgba(232, 163, 61, 0.12)', border: 'rgba(232, 163, 61, 0.3)', color: 'var(--amber)', char: '🟡', label: 'Near Expiry' },
    critical: { bg: 'rgba(211, 84, 0, 0.12)', border: 'rgba(211, 84, 0, 0.3)', color: '#d35400', char: '🟠', label: 'Critical' },
    expired: { bg: 'rgba(229, 72, 77, 0.12)', border: 'rgba(229, 72, 77, 0.3)', color: 'var(--red)', char: '🔴', label: 'Expired' }
  };

  // Filtered heatmap items
  const filteredVehicles = useMemo(() => {
    return MOCK_VEHICLES.filter(v => {
      const matchesSearch = v.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase());
      if (filterStatus === 'all') return matchesSearch;
      
      const statuses = [v.Fitness, v.Insurance, v.Permit, v.PUC, v.Tax];
      if (filterStatus === 'compliant') return matchesSearch && statuses.every(s => s === 'valid');
      if (filterStatus === 'non-compliant') return matchesSearch && statuses.some(s => s === 'expired');
      if (filterStatus === 'expiring') return matchesSearch && statuses.some(s => s === 'near_expiry' || s === 'critical');
      return matchesSearch;
    });
  }, [searchQuery, filterStatus]);

  // Paginated vehicles list for the heatmap grid
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVehicles, currentPage]);

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);

  // Dynamic calculations for KPI summary (based on full 1000 database)
  const stats = useMemo(() => {
    let total = MOCK_VEHICLES.length;
    let compliant = 0;
    let nonCompliant = 0;
    let blocked = blockedVehicles.length;

    let exp30 = 0; // critical
    let exp60 = 0; // near_expiry

    MOCK_VEHICLES.forEach(v => {
      const statuses = [v.Fitness, v.Insurance, v.Permit, v.PUC, v.Tax];
      
      if (statuses.every(s => s === 'valid')) {
        compliant++;
      } else {
        nonCompliant++;
      }

      statuses.forEach(s => {
        if (s === 'critical') exp30++;
        else if (s === 'near_expiry') exp60++;
      });
    });

    // Mock count overrides for UI realism
    return {
      total,
      compliant,
      nonCompliant,
      blocked,
      exp30: 24,
      exp60: 48,
      exp90: 89,
      openChallans: 12,
      openClaims: 8,
      openIncidents: 4
    };
  }, [blockedVehicles]);

  // Expiry Forecast Panel Items
  const forecastItems = [
    { vehicle: 'RJ-14-AB-1234', docType: 'PUC', expiry: '2026-08-05', days: 15, severity: 'critical' },
    { vehicle: 'MH-12-PQ-4321', docType: 'Insurance', expiry: '2026-08-12', days: 22, severity: 'critical' },
    { vehicle: 'GJ-01-XX-1122', docType: 'Permit', expiry: '2026-08-20', days: 30, severity: 'critical' },
    { vehicle: 'DL-01-MA-1234', docType: 'Fitness', expiry: '2026-09-05', days: 46, severity: 'near_expiry' },
    { vehicle: 'HR-55-A-9901', docType: 'Tax', expiry: '2026-09-19', days: 60, severity: 'near_expiry' },
    { vehicle: 'UP-16-T-3344', docType: 'Insurance', expiry: '2026-10-15', days: 86, severity: 'near_expiry' },
  ];

  const handleCellClick = (vehicleNo: string, docType: string) => {
    notify('info', `Opening Renewal Task details for ${vehicleNo} (${docType})`);
    navigate(`/compliance/renewals/tasks?vehicle=${vehicleNo}&type=${docType}`);
  };

  const handleOpenOverride = (vehicle: BlockedVehicle) => {
    setSelectedBlockedVehicle(vehicle);
    setOverrideCode(`AF-09-${Math.floor(1000 + Math.random() * 9000)}`);
    setOverrideReason('');
    setOverrideModalOpen(true);
  };

  const handleSaveOverride = () => {
    if (!selectedBlockedVehicle) return;
    if (!overrideReason.trim()) {
      notify('error', 'Please enter a valid override reason');
      return;
    }
    
    // Add to log
    const newLog = {
      id: String(Date.now()),
      vehicleNo: selectedBlockedVehicle.vehicleNo,
      code: overrideCode,
      reason: overrideReason,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setOverrideLogs([newLog, ...overrideLogs]);
    // Remove from blocked list
    setBlockedVehicles(blockedVehicles.filter(v => v.id !== selectedBlockedVehicle.id));
    
    notify('success', `Vehicle ${selectedBlockedVehicle.vehicleNo} released from holds under code ${overrideCode}`);
    setOverrideModalOpen(false);
    setSelectedBlockedVehicle(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Compliance Center</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            Unified portal for statutory registrations, traffic violations, and insurance claims.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="primary" icon={<ShieldCheck size={15} style={{ marginRight: 6 }} />} onClick={() => navigate('/compliance/renewals/tasks')}>
            Renewals Workbench
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* KPI Panel 1: Fleet Compliance Status */}
        <Panel title="Vehicle Compliance Status" padded={false}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border-soft)' }}>
            <div style={{ padding: 16, borderRight: '1px solid var(--border-soft)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                TOTAL VEHICLES
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{stats.total}</div>
            </div>
            <div style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <CheckCircle size={12} /> COMPLIANT
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green)', marginTop: 8 }}>{stats.compliant}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: 16, borderRight: '1px solid var(--border-soft)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <ShieldAlert size={12} /> NON-COMPLIANT
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--red)', marginTop: 4 }}>{stats.nonCompliant}</div>
            </div>
            <div style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Ban size={12} /> ACTIVE HOLDS
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--amber)', marginTop: 4 }}>{stats.blocked}</div>
            </div>
          </div>
        </Panel>

        {/* KPI Panel 2: Document Expiry Horizon */}
        <Panel title="Expiry Horizon Tracker" padded={false}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', height: '100%' }}>
            <div style={{ padding: '24px 12px', borderRight: '1px solid var(--border-soft)', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--red)', fontWeight: 600 }}>&lt; 30 DAYS</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--red)', marginTop: 12 }}>{stats.exp30}</div>
              <span style={{ fontSize: 9, color: 'var(--text-3)' }}>Critical State</span>
            </div>
            <div style={{ padding: '24px 12px', borderRight: '1px solid var(--border-soft)', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--amber)', fontWeight: 600 }}>&lt; 60 DAYS</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--amber)', marginTop: 12 }}>{stats.exp60}</div>
              <span style={{ fontSize: 9, color: 'var(--text-3)' }}>Near Expiry</span>
            </div>
            <div style={{ padding: '24px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 600 }}>&lt; 90 DAYS</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', marginTop: 12 }}>{stats.exp90}</div>
              <span style={{ fontSize: 9, color: 'var(--text-3)' }}>Planned queue</span>
            </div>
          </div>
        </Panel>

        {/* KPI Panel 3: Open Actions Overview */}
        <Panel title="Pending Tasks Overview" padded={false}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', height: '100%' }}>
            <div style={{ padding: '24px 12px', borderRight: '1px solid var(--border-soft)', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/compliance/challans/workbench')}>
              <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                <FileWarning size={11} /> CHALLANS
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', marginTop: 12 }}>{stats.openChallans}</div>
              <Badge tone="red">Unpaid</Badge>
            </div>
            <div style={{ padding: '24px 12px', borderRight: '1px solid var(--border-soft)', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/compliance/insurance/claims')}>
              <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                <Shield size={11} /> CLAIMS
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', marginTop: 12 }}>{stats.openClaims}</div>
              <Badge tone="blue">Under Survey</Badge>
            </div>
            <div style={{ padding: '24px 12px', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/compliance/incidents/dashboard')}>
              <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                <Activity size={11} /> INCIDENTS
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', marginTop: 12 }}>{stats.openIncidents}</div>
              <Badge tone="amber">Active</Badge>
            </div>
          </div>
        </Panel>
      </div>

      {/* Compliance Heatmap Grid */}
      <Panel 
        title="Statutory Document Heatmap" 
        subtitle={`Real-time vehicle × document matrix. Total matched records: ${filteredVehicles.length} of ${stats.total}.`}
        actions={
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, color: 'var(--text-3)' }} />
              <input 
                type="text" 
                placeholder="Search vehicle..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="adm-input"
                style={{ paddingLeft: 30, height: 32, fontSize: 12, width: 180, borderRadius: 6 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={13} style={{ color: 'var(--text-3)' }} />
              <select 
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ height: 32, padding: '0 8px', backgroundColor: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text-1)', fontSize: 12, borderRadius: 6 }}
              >
                <option value="all">All Vehicles</option>
                <option value="compliant">Fully Compliant</option>
                <option value="non-compliant">Expired Docs</option>
                <option value="expiring">Near Expiry</option>
              </select>
            </div>
          </div>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 11, width: 200 }}>VEHICLE NUMBER</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 11, textAlign: 'center' }}>FITNESS CERTIFICATE</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 11, textAlign: 'center' }}>INSURANCE SCHED</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 11, textAlign: 'center' }}>ROAD PERMIT</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 11, textAlign: 'center' }}>PUC STATE</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 11, textAlign: 'center' }}>ROAD TAX</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVehicles.map((vehicle) => (
                <tr key={vehicle.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{vehicle.vehicleNo}</td>
                  {(['Fitness', 'Insurance', 'Permit', 'PUC', 'Tax'] as DocType[]).map((doc) => {
                    const status = vehicle[doc];
                    const cfg = statusColors[status];
                    return (
                      <td key={doc} style={{ padding: '8px 16px', textAlign: 'center' }}>
                        <div 
                          onClick={() => handleCellClick(vehicle.vehicleNo, doc)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 12px',
                            borderRadius: 6,
                            backgroundColor: cfg.bg,
                            border: `1px solid ${cfg.border}`,
                            color: cfg.color,
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'transform 0.1s ease',
                          }}
                          title={`Status: ${cfg.label}. Click to renew.`}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <span style={{ fontSize: 10 }}>{cfg.char}</span>
                          <span>{cfg.label}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {paginatedVehicles.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)' }}>
                    No vehicles found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Heatmap Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, borderTop: '1px solid var(--border-soft)', paddingTop: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredVehicles.length)} of {filteredVehicles.length} vehicles
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>
                Previous
              </Button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <span>Page</span>
                <strong>{currentPage}</strong>
                <span>of</span>
                <strong>{totalPages}</strong>
              </div>
              <Button size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Panel>

      {/* Expiry Forecast and Holds Panel Side by Side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>
        {/* Left Column: Expiry Forecast Panel */}
        <Panel 
          title="Document Expiry Forecast" 
          subtitle="Proactive outlook on expiring compliance assets"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Legend tabs */}
            <div style={{ display: 'flex', gap: 8 }}>
              <Badge tone="red">30 Days Critical</Badge>
              <Badge tone="amber">60 Days Warnings</Badge>
              <Badge tone="blue">90 Days Planned</Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {forecastItems.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: 'var(--panel-2)',
                    borderRadius: 8,
                    border: '1px solid var(--border-soft)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{item.vehicle}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Doc:</span>
                      <strong style={{ fontSize: 12, color: 'var(--text-2)' }}>{item.docType}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block' }}>Expiry Date</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{item.expiry}</span>
                    </div>
                    <div style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: item.severity === 'critical' ? 'rgba(229, 72, 77, 0.12)' : 'rgba(232, 163, 61, 0.12)',
                      color: item.severity === 'critical' ? 'var(--red)' : 'var(--amber)',
                      border: `1px solid ${item.severity === 'critical' ? 'rgba(229, 72, 77, 0.2)' : 'rgba(232, 163, 61, 0.2)'}`
                    }}>
                      {item.days} Days left
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* Right Column: Active Holds Panel */}
        <Panel 
          title="Active Holds / Blocks" 
          subtitle="Vehicles legally restricted from dispatcher queue"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {blockedVehicles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-3)', backgroundColor: 'var(--panel-2)', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                🎉 No active holds in this sector.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {blockedVehicles.map((v) => (
                  <div 
                    key={v.id} 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(229, 72, 77, 0.04)',
                      borderRadius: 8,
                      border: '1px solid rgba(229, 72, 77, 0.15)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{v.vehicleNo}</span>
                        <Badge tone="red">Blocked</Badge>
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 11, color: 'var(--text-3)' }}>
                        <span>Reason: <strong style={{ color: 'var(--text-2)' }}>{v.reason}</strong></span>
                        <span>Since: <strong>{v.blockedSince}</strong></span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="subtle" 
                      icon={<Key size={12} style={{ marginRight: 4 }} />}
                      onClick={() => handleOpenOverride(v)}
                    >
                      AF-09 Override
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* AF-09 Audit Log */}
            <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <FileText size={14} style={{ color: 'var(--text-3)' }} />
                <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-2)' }}>AF-09 OVERRIDE AUDIT TRAIL</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 150, overflowY: 'auto' }}>
                {overrideLogs.map((log) => (
                  <div 
                    key={log.id} 
                    style={{
                      padding: 10,
                      backgroundColor: 'var(--panel-2)',
                      borderRadius: 6,
                      border: '1px solid var(--border-soft)',
                      fontSize: 11
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong>{log.vehicleNo}</strong>
                      <span className="mono-label" style={{ fontSize: 9, color: 'var(--green)' }}>{log.code}</span>
                    </div>
                    <p style={{ color: 'var(--text-3)', margin: 0 }}>{log.reason}</p>
                    <span style={{ fontSize: 9, color: 'var(--text-3)', float: 'right', marginTop: -14 }}>{log.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* AF-09 Override Modal */}
      <Modal
        open={overrideModalOpen}
        title="AF-09 Authorization Override"
        subtitle={`Release vehicle ${selectedBlockedVehicle?.vehicleNo} from active compliance hold.`}
        onClose={() => setOverrideModalOpen(false)}
        footer={
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={() => setOverrideModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleSaveOverride}>Release Hold</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8, backgroundColor: 'rgba(232, 163, 61, 0.08)', padding: 12, borderRadius: 6, border: '1px solid rgba(232, 163, 61, 0.2)' }}>
            <AlertTriangle size={16} color="var(--amber)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
              <strong>Warning:</strong> Initiating an AF-09 override bypasses statutory compliance blocks. 
              This event is logged and flagged directly in the executive compliance ledger.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: '1 1 100%' }}>
              <span className="mono-label" style={{ fontSize: 10, display: 'block', marginBottom: 6 }}>GENERATED AUTHORIZATION CODE</span>
              <input 
                type="text" 
                value={overrideCode}
                readOnly
                className="adm-input"
                style={{ width: '100%', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--green)' }}
              />
            </div>
            
            <div style={{ flex: '1 1 100%' }}>
              <span className="mono-label" style={{ fontSize: 10, display: 'block', marginBottom: 6 }}>JUSTIFICATION FOR RELEASE (REQUIRED)</span>
              <textarea 
                placeholder="Enter regulatory dispatch justification (e.g. Critical humanitarian shipment, provisional certificate uploaded)..." 
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="adm-input"
                style={{ width: '100%', height: 80, resize: 'none', padding: '8px 12px', fontSize: 12 }}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
