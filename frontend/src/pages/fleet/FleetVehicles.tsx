import React, { useEffect, useState, useMemo } from 'react';
import { 
  Truck, Search, Wrench, MapPin, Fuel, ShieldAlert, Milestone, X
} from 'lucide-react';
import { Badge, Button, LoadingState, useToast } from '../../components/admin/ui';
import '../../styles/admin.css';

// Exact mock data matching seed records
const INITIAL_VEHICLES = [
  { id: '1', vehicleNumber: 'DL-01-MA-1234', capacity: '10 Ton', currentLocation: 'Delhi Hub', fuel: 85, status: 'Available', utilization: 65.5, category: 'Owned', gpsDeviceStatus: 'Online', lastPingAge: '1m ago', site: 'Delhi Hub', class: 'Container', complianceFASTag: true, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true, alerts: [] },
  { id: '2', vehicleNumber: 'DL-01-MB-5678', capacity: '32 Ft MX', currentLocation: 'Delhi Hub', fuel: 92, status: 'Available', utilization: 72.0, category: 'Owned', gpsDeviceStatus: 'Online', lastPingAge: '2m ago', site: 'Delhi Hub', class: 'Open Body', complianceFASTag: true, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true, alerts: [] },
  { id: '3', vehicleNumber: 'HR-55-A-9901', capacity: '20 Ton', currentLocation: 'Gurugram Hub', fuel: 45, status: 'In Transit', utilization: 88.0, category: 'Owned', gpsDeviceStatus: 'Online', lastPingAge: '30s ago', site: 'Gurugram Hub', class: 'Flatbed', complianceFASTag: true, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true, alerts: [] },
  { id: '4', vehicleNumber: 'MH-12-PQ-4321', capacity: '15 Ton', currentLocation: 'Mumbai Hub', fuel: 70, status: 'Available', utilization: 40.0, category: 'Owned', gpsDeviceStatus: 'Online', lastPingAge: '5m ago', site: 'Mumbai Hub', class: 'Container', complianceFASTag: true, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true, alerts: [] },
  { id: '5', vehicleNumber: 'GJ-01-XX-1122', capacity: '10 Ton', currentLocation: 'Jaipur Hub', fuel: 80, status: 'Maintenance', utilization: 0.0, category: 'Owned', gpsDeviceStatus: 'Offline', lastPingAge: '14h ago', site: 'Jaipur Hub', class: 'Container', complianceFASTag: true, compliancePM: false, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true, alerts: ['PM Overdue by 1,200 km'] },
  { id: '6', vehicleNumber: 'DL-02-C-8877', capacity: '32 Ft MX', currentLocation: 'Delhi Hub', fuel: 60, status: 'Blocked', utilization: 0.0, category: 'Owned', gpsDeviceStatus: 'Online', lastPingAge: '1m ago', site: 'Delhi Hub', class: 'Container', complianceFASTag: true, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: false, complianceFitness: true, compliancePermit: true, alerts: ['Insurance expired (Rule BR-CMP-03)'] },
  { id: '7', vehicleNumber: 'UP-16-T-3344', capacity: '10 Ton', currentLocation: 'Delhi Hub', fuel: 15, status: 'Available', utilization: 50.0, category: 'Vendor', vendorName: 'Gati Logistics', gpsDeviceStatus: 'Online', lastPingAge: '4m ago', site: 'Delhi Hub', class: 'Container', complianceFASTag: true, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true, alerts: [] },
  { id: '8', vehicleNumber: 'HR-38-Y-7788', capacity: '20 Ton', currentLocation: 'Gurugram Hub', fuel: 90, status: 'Available', utilization: 82.0, category: 'Vendor', vendorName: 'VRL Logistics', gpsDeviceStatus: 'Online', lastPingAge: '10m ago', site: 'Gurugram Hub', class: 'Flatbed', complianceFASTag: true, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true, alerts: [] },
  { id: '9', vehicleNumber: 'MH-43-R-8899', capacity: '15 Ton', currentLocation: 'Mumbai Hub', fuel: 50, status: 'In Transit', utilization: 90.0, category: 'Vendor', vendorName: 'Safexpress', gpsDeviceStatus: 'Tampered', lastPingAge: '1m ago', site: 'Mumbai Hub', class: 'Container', complianceFASTag: true, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true, alerts: [] },
  { id: '10', vehicleNumber: 'DL-01-MC-9012', capacity: '32 Ft MX', currentLocation: 'Delhi Hub', fuel: 35, status: 'Available', utilization: 60.0, category: 'Owned', gpsDeviceStatus: 'Online', lastPingAge: '2m ago', site: 'Delhi Hub', class: 'Container', complianceFASTag: false, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true, alerts: ['FASTag Low Balance (₹150)'] }
];

export const FleetVehicles: React.FC = () => {
  const { notify } = useToast();
  const [vehicles] = useState(INITIAL_VEHICLES);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<typeof INITIAL_VEHICLES[0] | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Input state for quick odometer update
  const [odometerInput, setOdometerInput] = useState('');
  const [showOdomModal, setShowOdomModal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  const handleUpdateOdometer = () => {
    if (!selectedVehicle || !odometerInput) return;
    notify('success', `Odometer updated for ${selectedVehicle.vehicleNumber} to ${odometerInput} km`);
    setShowOdomModal(false);
    setOdometerInput('');
  };

  const handleTriggerPM = () => {
    if (!selectedVehicle) return;
    notify('success', `Work card opened for Periodic Maintenance on ${selectedVehicle.vehicleNumber}`);
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = v.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
                            (v.vendorName && v.vendorName.toLowerCase().includes(search.toLowerCase())) ||
                            v.currentLocation.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [vehicles, search, statusFilter, categoryFilter]);

  if (loading) {
    return <LoadingState label="Loading Vehicle Inventory" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>Vehicle Master (360°)</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>Manage owned & vendor fleet assets, inspect details and verify certificates.</p>
      </div>

      {/* Filters bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, backgroundColor: 'var(--panel-1)', padding: 16, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
        <div style={{ flexGrow: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-3)' }} />
          <input 
            type="text" 
            placeholder="Search by reg number, location or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 36px', backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', outline: 'none' }}
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', outline: 'none' }}
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="In Transit">In Transit</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Blocked">Blocked</option>
        </select>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '8px 12px', backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', outline: 'none' }}
        >
          <option value="All">All Categories</option>
          <option value="Owned">Owned</option>
          <option value="Vendor">Vendor</option>
        </select>
      </div>

      {/* Grid and Detail Drawer layout */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', position: 'relative' }}>
        {/* Vehicles list table */}
        <div style={{ flexGrow: 1, backgroundColor: 'var(--panel-1)', border: '1px solid var(--border-soft)', borderRadius: 8, overflow: 'hidden' }}>
          <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-soft)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>REGISTRATION NUMBER</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>CATEGORY</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>LOCATION</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>CLASS / CAPACITY</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>UTILIZATION</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((v) => (
                <tr 
                  key={v.id} 
                  onClick={() => setSelectedVehicle(v)}
                  style={{ 
                    borderBottom: '1px solid var(--border-soft)', 
                    cursor: 'pointer', 
                    backgroundColor: selectedVehicle?.id === v.id ? 'var(--panel-2)' : 'transparent' 
                  }}
                  className="table-row-hover"
                >
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{v.vehicleNumber}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {v.category === 'Owned' ? (
                      <Badge tone="green">Owned</Badge>
                    ) : (
                      <Badge tone="grey">Vendor ({v.vendorName})</Badge>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} color="var(--text-3)" />
                      <span>{v.currentLocation}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{v.class} &middot; {v.capacity}</td>
                  <td style={{ padding: '12px 16px' }}>{v.utilization}%</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge 
                      tone={
                        v.status === 'Available' ? 'green' : 
                        (v.status === 'In Transit' ? 'blue' : 
                        (v.status === 'Maintenance' ? 'amber' : 'red'))
                      }
                    >
                      {v.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
                    No assets match current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Vehicle 360° Drawer Panel */}
        {selectedVehicle && (
          <div 
            style={{ 
              width: '450px', 
              backgroundColor: 'var(--panel-1)', 
              border: '1px solid var(--border-soft)', 
              borderRadius: 8, 
              padding: 20, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 20,
              boxShadow: 'var(--shadow-3)',
              position: 'sticky',
              top: 20
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 10, backgroundColor: 'var(--panel-2)', borderRadius: 8 }}>
                  <Truck size={20} color="var(--green)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selectedVehicle.vehicleNumber}</h3>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{selectedVehicle.class} &middot; {selectedVehicle.category}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVehicle(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Alert display */}
            {selectedVehicle.alerts.length > 0 && (
              <div style={{ display: 'flex', gap: 10, padding: 12, backgroundColor: 'var(--panel-red)', border: '1px solid var(--border-red)', borderRadius: 6 }}>
                <ShieldAlert size={16} color="var(--red)" style={{ marginTop: 2 }} />
                <div style={{ fontSize: 12, color: 'var(--text-1)' }}>
                  {selectedVehicle.alerts[0]}
                </div>
              </div>
            )}

            {/* Detail Blocks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h4 style={{ margin: 0, fontSize: 12, color: 'var(--text-3)', letterSpacing: 1 }} className="mono-label">VITALS & GPS</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ backgroundColor: 'var(--panel-2)', padding: '10px 12px', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>GPS Device</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 13, fontWeight: 600 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: selectedVehicle.gpsDeviceStatus === 'Online' ? 'var(--green)' : (selectedVehicle.gpsDeviceStatus === 'Tampered' ? 'var(--red)' : 'var(--text-3)') }} />
                    {selectedVehicle.gpsDeviceStatus} ({selectedVehicle.lastPingAge})
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--panel-2)', padding: '10px 12px', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Current Fuel</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 13, fontWeight: 600 }}>
                    <Fuel size={14} color="var(--blue)" />
                    {selectedVehicle.fuel}%
                  </div>
                </div>
              </div>

              {/* Compliance checklist */}
              <h4 style={{ margin: '10px 0 0 0', fontSize: 12, color: 'var(--text-3)', letterSpacing: 1 }} className="mono-label">COMPLIANCE CERTIFICATES</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6 }}>
                {[
                  { name: 'Registration Certificate (RC)', status: selectedVehicle.complianceFitness },
                  { name: 'Insurance Coverage', status: selectedVehicle.complianceInsurance },
                  { name: 'Pollution Under Control (PUC)', status: selectedVehicle.complianceFASTag },
                  { name: 'Road Permit Certificate', status: selectedVehicle.compliancePermit },
                  { name: 'Periodic Maintenance Check', status: selectedVehicle.compliancePM },
                ].map((cert, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{cert.name}</span>
                    <Badge tone={cert.status ? 'green' : 'red'}>
                      {cert.status ? 'Verified' : 'Expired'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border-soft)', paddingTop: 16 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button style={{ flexGrow: 1 }} variant="primary" onClick={() => setShowOdomModal(true)}>
                  <Milestone size={14} style={{ marginRight: 6 }} /> Update Odom
                </Button>
                <Button style={{ flexGrow: 1 }} variant="subtle" onClick={handleTriggerPM}>
                  <Wrench size={14} style={{ marginRight: 6 }} /> Schedule PM
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Odometer Modal */}
      {showOdomModal && selectedVehicle && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div style={{ backgroundColor: 'var(--panel-1)', border: '1px solid var(--border-soft)', padding: 24, borderRadius: 8, width: '400px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Update Odometer - {selectedVehicle.vehicleNumber}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>Input the current odometer reading from physical dashboard log.</p>
            <input 
              type="number" 
              placeholder="e.g. 45320" 
              value={odometerInput}
              onChange={(e) => setOdometerInput(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <Button variant="subtle" onClick={() => { setShowOdomModal(false); setOdometerInput(''); }}>Cancel</Button>
              <Button variant="primary" onClick={handleUpdateOdometer}>Confirm Update</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
