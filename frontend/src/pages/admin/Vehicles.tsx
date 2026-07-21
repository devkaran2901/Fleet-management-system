import React, { useEffect, useState, useMemo } from 'react';
import { 
  Truck, Search, MapPin, Fuel, Trash2, Pencil, Plus, X 
} from 'lucide-react';
import { adminApi, errorMessage } from '../../services/adminApi';
import type { Vehicle } from '../../services/dispatcherApi';
import { Badge, Button, LoadingState, ErrorState, Modal, Field, Input, Select, useToast } from '../../components/admin/ui';
import '../../styles/admin.css';

interface VehicleForm {
  id?: string;
  vehicleNumber: string;
  capacity: string;
  currentLocation: string;
  fuel: string;
  status: string;
  category: string;
  vendorName: string;
  class: string;
  complianceFASTag: boolean;
  compliancePM: boolean;
  complianceGPS: boolean;
  complianceInspection: boolean;
  complianceInsurance: boolean;
  complianceFitness: boolean;
  compliancePermit: boolean;
}

const blank: VehicleForm = {
  vehicleNumber: '',
  capacity: '10 Ton',
  currentLocation: 'Delhi Hub',
  fuel: '80',
  status: 'Available',
  category: 'Owned',
  vendorName: '',
  class: 'Container',
  complianceFASTag: true,
  compliancePM: true,
  complianceGPS: true,
  complianceInspection: true,
  complianceInsurance: true,
  complianceFitness: true,
  compliancePermit: true,
};

export const AdminVehicles: React.FC = () => {
  const { notify } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [form, setForm] = useState<VehicleForm | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.vehicles();
      setVehicles(data);
      if (selectedVehicle) {
        const updated = data.find(v => v.id === selectedVehicle.id);
        setSelectedVehicle(updated || null);
      }
    } catch (err) {
      setError(errorMessage(err, 'Could not load vehicles'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!form) return;
    if (!form.vehicleNumber.trim()) {
      notify('error', 'Registration number is required');
      return;
    }
    setSaving(true);
    try {
      const body: Partial<Vehicle> = {
        vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
        capacity: form.capacity,
        currentLocation: form.currentLocation,
        fuel: Number(form.fuel || 0),
        status: form.status as 'Available' | 'In Transit' | 'Maintenance' | 'Blocked',
        category: form.category as 'Owned' | 'Vendor',
        vendorName: form.category === 'Vendor' ? form.vendorName.trim() : null,
        class: form.class,
        complianceFASTag: form.complianceFASTag,
        compliancePM: form.compliancePM,
        complianceGPS: form.complianceGPS,
        complianceInspection: form.complianceInspection,
        complianceInsurance: form.complianceInsurance,
        complianceFitness: form.complianceFitness,
        compliancePermit: form.compliancePermit,
      };

      if (form.id) {
        await adminApi.updateVehicle(form.id, body);
        notify('success', `Updated vehicle ${form.vehicleNumber}`);
      } else {
        await adminApi.createVehicle(body);
        notify('success', `Created vehicle ${form.vehicleNumber}`);
      }
      setForm(null);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not save vehicle'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (!window.confirm(`Delete vehicle "${vehicle.vehicleNumber}"?`)) return;
    try {
      await adminApi.deleteVehicle(vehicle.id);
      notify('success', `Deleted vehicle ${vehicle.vehicleNumber}`);
      if (selectedVehicle?.id === vehicle.id) {
        setSelectedVehicle(null);
      }
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not delete vehicle'));
    }
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

  if (loading) return <LoadingState label="Loading Vehicle Master" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">M-01 · Vehicles Portal</span>
          <h1 className="adm-page-title">
            <Truck size={22} color="var(--green)" /> Vehicles
          </h1>
          <p className="adm-page-sub">
            The core vehicle registry. Onboard, configure compliance properties, and track operations.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setForm({ ...blank })}>
          New Vehicle
        </Button>
      </div>

      {/* Filters bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, backgroundColor: 'var(--panel-1)', padding: 16, borderRadius: 8, border: '1px solid var(--border-soft)', marginBottom: 20 }}>
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

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Table list */}
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
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }} />
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
                      <Badge tone="grey">Vendor ({v.vendorName || 'N/A'})</Badge>
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
                  <td style={{ padding: '12px 16px', width: 80 }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                      <button 
                        className="adm-icon-btn" 
                        title="Edit"
                        onClick={() => setForm({
                          id: v.id,
                          vehicleNumber: v.vehicleNumber,
                          capacity: v.capacity,
                          currentLocation: v.currentLocation,
                          fuel: String(v.fuel),
                          status: v.status,
                          category: v.category,
                          vendorName: v.vendorName || '',
                          class: v.class,
                          complianceFASTag: v.complianceFASTag,
                          compliancePM: v.compliancePM,
                          complianceGPS: v.complianceGPS,
                          complianceInspection: v.complianceInspection,
                          complianceInsurance: v.complianceInsurance,
                          complianceFitness: v.complianceFitness,
                          compliancePermit: v.compliancePermit,
                        })}
                      >
                        <Pencil size={13} />
                      </button>
                      <button 
                        className="adm-icon-btn is-danger" 
                        title="Delete"
                        onClick={() => void handleDelete(v)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
                    No vehicle assets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Side Details Drawer */}
        {selectedVehicle && (
          <div style={{ width: '400px', backgroundColor: 'var(--panel-1)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: 20, boxShadow: 'var(--shadow-3)', position: 'sticky', top: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 10, backgroundColor: 'var(--panel-2)', borderRadius: 8 }}>
                  <Truck size={20} color="var(--green)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selectedVehicle.vehicleNumber}</h3>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{selectedVehicle.class} &middot; {selectedVehicle.site}</span>
                </div>
              </div>
              <button onClick={() => setSelectedVehicle(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                <X size={18} />
              </button>
            </div>

            {/* General parameters */}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h4 style={{ margin: 0, fontSize: 13, textTransform: 'uppercase', color: 'var(--text-3)', fontWeight: 600 }}>Operational Status</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Odometer</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>98,450 km</div>
                </div>
                <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Fuel Level</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Fuel size={14} color="var(--blue)" /> {selectedVehicle.fuel}%
                  </div>
                </div>
              </div>

              {/* Compliance checklist */}
              <h4 style={{ margin: '10px 0 0 0', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-3)', fontWeight: 600 }}>Compliance Checklist</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'FASTag Active', passed: selectedVehicle.complianceFASTag },
                  { label: 'GPS Ping Healthy', passed: selectedVehicle.complianceGPS },
                  { label: 'PM Compliant', passed: selectedVehicle.compliancePM },
                  { label: 'Permit Valid', passed: selectedVehicle.compliancePermit },
                  { label: 'Fitness Certificate Valid', passed: selectedVehicle.complianceFitness },
                  { label: 'Insurance Active', passed: selectedVehicle.complianceInsurance },
                  { label: 'Pollution Control (PUC)', passed: selectedVehicle.complianceInspection },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-soft)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{item.label}</span>
                    <Badge tone={item.passed ? 'green' : 'red'}>{item.passed ? 'Pass' : 'Failed'}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={form !== null}
        title={form?.id ? 'Edit Vehicle' : 'New Vehicle'}
        onClose={() => setForm(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setForm(null)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleCreateOrUpdate}>Save</Button>
          </>
        }
      >
        {form && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Registration Number" hint="e.g. DL-01-MA-1234">
              <Input 
                value={form.vehicleNumber} 
                onChange={e => setForm({ ...form, vehicleNumber: e.target.value })}
                placeholder="Registration Number" 
                disabled={form.id !== undefined}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Vehicle Class">
                <Select value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}>
                  <option value="Container">Container</option>
                  <option value="Flatbed">Flatbed</option>
                  <option value="Open Body">Open Body</option>
                </Select>
              </Field>
              <Field label="Payload Capacity">
                <Select value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })}>
                  <option value="10 Ton">10 Ton</option>
                  <option value="15 Ton">15 Ton</option>
                  <option value="20 Ton">20 Ton</option>
                  <option value="32 Ft MX">32 Ft MX</option>
                </Select>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Current Fuel Level (%)">
                <Input 
                  type="number" 
                  value={form.fuel} 
                  onChange={e => setForm({ ...form, fuel: e.target.value })}
                  placeholder="80" 
                  min="0"
                  max="100"
                />
              </Field>
              <Field label="Current Location">
                <Input 
                  value={form.currentLocation} 
                  onChange={e => setForm({ ...form, currentLocation: e.target.value })}
                  placeholder="Delhi Hub"
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Ownership Type">
                <Select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="Owned">Owned</option>
                  <option value="Vendor">Vendor</option>
                </Select>
              </Field>
              <Field label="Operational Status">
                <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="Available">Available</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Blocked">Blocked</option>
                </Select>
              </Field>
            </div>

            {form.category === 'Vendor' && (
              <Field label="Vendor Name">
                <Input 
                  value={form.vendorName} 
                  onChange={e => setForm({ ...form, vendorName: e.target.value })}
                  placeholder="Gati Logistics"
                />
              </Field>
            )}

            <h4 style={{ margin: '10px 0 0 0', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-3)', fontWeight: 600 }}>Compliance Gate Checkboxes</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <input type="checkbox" checked={form.complianceFASTag} onChange={e => setForm({ ...form, complianceFASTag: e.target.checked })} />
                <span>FASTag Compliant</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <input type="checkbox" checked={form.complianceGPS} onChange={e => setForm({ ...form, complianceGPS: e.target.checked })} />
                <span>GPS Device Healthy</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <input type="checkbox" checked={form.compliancePM} onChange={e => setForm({ ...form, compliancePM: e.target.checked })} />
                <span>PM Compliant</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <input type="checkbox" checked={form.compliancePermit} onChange={e => setForm({ ...form, compliancePermit: e.target.checked })} />
                <span>Permit Valid</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <input type="checkbox" checked={form.complianceFitness} onChange={e => setForm({ ...form, complianceFitness: e.target.checked })} />
                <span>Fitness Valid</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <input type="checkbox" checked={form.complianceInsurance} onChange={e => setForm({ ...form, complianceInsurance: e.target.checked })} />
                <span>Insurance Active</span>
              </label>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
