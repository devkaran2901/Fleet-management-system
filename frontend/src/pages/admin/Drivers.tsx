import React, { useEffect, useState, useMemo } from 'react';
import { 
  UserCog, Search, ShieldAlert, Star, Pencil, Trash2, Plus, X 
} from 'lucide-react';
import { adminApi, errorMessage } from '../../services/adminApi';
import type { Driver } from '../../services/dispatcherApi';
import { Badge, Button, LoadingState, ErrorState, Modal, Field, Input, Select, useToast } from '../../components/admin/ui';
import '../../styles/admin.css';

interface DriverForm {
  id?: string;
  name: string;
  license: string;
  licenseType: string;
  dutyHours: string;
  restHours: string;
  safetyScore: string;
  status: string;
  site: string;
  warnings: string;
}

const blank: DriverForm = {
  name: '',
  license: '',
  licenseType: 'Heavy Commercial',
  dutyHours: '0',
  restHours: '12',
  safetyScore: '90',
  status: 'Available',
  site: 'Delhi Hub',
  warnings: '[]',
};

export const AdminDrivers: React.FC = () => {
  const { notify } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [form, setForm] = useState<DriverForm | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.drivers();
      setDrivers(data);
      if (selectedDriver) {
        const updated = data.find(d => d.id === selectedDriver.id);
        setSelectedDriver(updated || null);
      }
    } catch (err) {
      setError(errorMessage(err, 'Could not load drivers'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!form) return;
    if (!form.name.trim()) {
      notify('error', 'Name is required');
      return;
    }
    if (!form.license.trim()) {
      notify('error', 'License number is required');
      return;
    }
    setSaving(true);
    try {
      const body: Partial<Driver> = {
        name: form.name.trim(),
        license: form.license.trim().toUpperCase(),
        licenseType: form.licenseType,
        dutyHours: Number(form.dutyHours || 0),
        restHours: Number(form.restHours || 0),
        safetyScore: Number(form.safetyScore || 90),
        status: form.status as 'Available' | 'On Duty' | 'Off Duty' | 'Suspended',
        site: form.site,
        warnings: form.warnings,
      };

      if (form.id) {
        await adminApi.updateDriver(form.id, body);
        notify('success', `Updated driver ${form.name}`);
      } else {
        await adminApi.createDriver(body);
        notify('success', `Created driver ${form.name}`);
      }
      setForm(null);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not save driver'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (driver: Driver) => {
    if (!window.confirm(`Delete driver "${driver.name}"?`)) return;
    try {
      await adminApi.deleteDriver(driver.id);
      notify('success', `Deleted driver ${driver.name}`);
      if (selectedDriver?.id === driver.id) {
        setSelectedDriver(null);
      }
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not delete driver'));
    }
  };

  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                            d.license.toLowerCase().includes(search.toLowerCase()) ||
                            d.site.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, search, statusFilter]);

  const parsedWarnings = (warningsStr: string): string[] => {
    try {
      const parsed = JSON.parse(warningsStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  if (loading) return <LoadingState label="Loading Driver Master" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">M-02 · Drivers Portal</span>
          <h1 className="adm-page-title">
            <UserCog size={22} color="var(--green)" /> Drivers
          </h1>
          <p className="adm-page-sub">
            The driver directory. Register drivers, audit licenses, track service hours, and view safety records.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setForm({ ...blank })}>
          New Driver
        </Button>
      </div>

      {/* Filters bar */}
      <div style={{ display: 'flex', gap: 16, backgroundColor: 'var(--panel-1)', padding: 16, borderRadius: 8, border: '1px solid var(--border-soft)', marginBottom: 20 }}>
        <div style={{ flexGrow: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-3)' }} />
          <input 
            type="text" 
            placeholder="Search by driver name, license or home site..."
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
          <option value="On Duty">On Duty</option>
          <option value="Off Duty">Off Duty</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Table list */}
        <div style={{ flexGrow: 1, backgroundColor: 'var(--panel-1)', border: '1px solid var(--border-soft)', borderRadius: 8, overflow: 'hidden' }}>
          <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-soft)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>DRIVER NAME</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>LICENSE NO</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>HOME SITE</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>SAFETY SCORE</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>DUTY / REST HOURS</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>STATUS</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }} />
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((d) => (
                <tr 
                  key={d.id} 
                  onClick={() => setSelectedDriver(d)}
                  style={{ 
                    borderBottom: '1px solid var(--border-soft)', 
                    cursor: 'pointer', 
                    backgroundColor: selectedDriver?.id === d.id ? 'var(--panel-2)' : 'transparent' 
                  }}
                  className="table-row-hover"
                >
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{d.name}</td>
                  <td style={{ padding: '12px 16px' }}>{d.license}</td>
                  <td style={{ padding: '12px 16px' }}>{d.site}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Star size={14} color="var(--green)" fill="var(--green)" />
                      <span style={{ fontWeight: 600 }}>{d.safetyScore}/100</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {d.dutyHours}h duty / {d.restHours}h rest
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge 
                      tone={
                        d.status === 'Available' ? 'green' : 
                        (d.status === 'On Duty' ? 'blue' : 
                        (d.status === 'Off Duty' ? 'grey' : 'red'))
                      }
                    >
                      {d.status}
                    </Badge>
                  </td>
                  <td style={{ padding: '12px 16px', width: 80 }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                      <button 
                        className="adm-icon-btn" 
                        title="Edit"
                        onClick={() => setForm({
                          id: d.id,
                          name: d.name,
                          license: d.license,
                          licenseType: d.licenseType,
                          dutyHours: String(d.dutyHours),
                          restHours: String(d.restHours),
                          safetyScore: String(d.safetyScore),
                          status: d.status,
                          site: d.site,
                          warnings: d.warnings,
                        })}
                      >
                        <Pencil size={13} />
                      </button>
                      <button 
                        className="adm-icon-btn is-danger" 
                        title="Delete"
                        onClick={() => void handleDelete(d)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
                    No drivers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Side Details Drawer */}
        {selectedDriver && (
          <div style={{ width: '400px', backgroundColor: 'var(--panel-1)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: 20, boxShadow: 'var(--shadow-3)', position: 'sticky', top: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 10, backgroundColor: 'var(--panel-2)', borderRadius: 8 }}>
                  <UserCog size={20} color="var(--green)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selectedDriver.name}</h3>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{selectedDriver.licenseType} &middot; {selectedDriver.site}</span>
                </div>
              </div>
              <button onClick={() => setSelectedDriver(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                <X size={18} />
              </button>
            </div>

            {/* General parameters */}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h4 style={{ margin: 0, fontSize: 13, textTransform: 'uppercase', color: 'var(--text-3)', fontWeight: 600 }}>Licence Details</h4>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Licence Number</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', wordBreak: 'break-all' }}>{selectedDriver.license}</div>
              </div>

              {/* Safety metrics */}
              <h4 style={{ margin: '10px 0 0 0', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-3)', fontWeight: 600 }}>Indicators</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Duty Hours</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{selectedDriver.dutyHours}h</div>
                </div>
                <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Rest Hours</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{selectedDriver.restHours}h</div>
                </div>
              </div>

              {/* Warnings */}
              {parsedWarnings(selectedDriver.warnings).length > 0 && (
                <>
                  <h4 style={{ margin: '10px 0 0 0', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-3)', fontWeight: 600 }}>Warnings &amp; Holds</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {parsedWarnings(selectedDriver.warnings).map((w, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 10, padding: 10, backgroundColor: 'var(--panel-red)', border: '1px solid var(--border-red)', borderRadius: 6 }}>
                        <ShieldAlert size={14} color="var(--red)" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 500 }}>{w}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={form !== null}
        title={form?.id ? 'Edit Driver' : 'New Driver'}
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
            <Field label="Driver Name">
              <Input 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ramesh Kumar" 
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="License Number">
                <Input 
                  value={form.license} 
                  onChange={e => setForm({ ...form, license: e.target.value })}
                  placeholder="DL-1420100098765" 
                />
              </Field>
              <Field label="License Type">
                <Select value={form.licenseType} onChange={e => setForm({ ...form, licenseType: e.target.value })}>
                  <option value="Heavy Commercial">Heavy Commercial</option>
                  <option value="Light Motor Vehicle">Light Motor Vehicle</option>
                  <option value="Hazardous Goods">Hazardous Goods</option>
                </Select>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Duty Hours (today)">
                <Input 
                  type="number" 
                  value={form.dutyHours} 
                  onChange={e => setForm({ ...form, dutyHours: e.target.value })}
                  placeholder="0" 
                />
              </Field>
              <Field label="Rest Hours (last 24h)">
                <Input 
                  type="number" 
                  value={form.restHours} 
                  onChange={e => setForm({ ...form, restHours: e.target.value })}
                  placeholder="12" 
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Safety Score (out of 100)">
                <Input 
                  type="number" 
                  value={form.safetyScore} 
                  onChange={e => setForm({ ...form, safetyScore: e.target.value })}
                  placeholder="90" 
                  min="0"
                  max="100"
                />
              </Field>
              <Field label="Home Site / Hub">
                <Input 
                  value={form.site} 
                  onChange={e => setForm({ ...form, site: e.target.value })}
                  placeholder="Delhi Hub"
                />
              </Field>
            </div>

            <Field label="Operational Status">
              <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="Available">Available</option>
                <option value="On Duty">On Duty</option>
                <option value="Off Duty">Off Duty</option>
                <option value="Suspended">Suspended</option>
              </Select>
            </Field>

            <Field label="Warnings (JSON list of strings)" hint='e.g. ["Approaching limit"]'>
              <Input 
                value={form.warnings} 
                onChange={e => setForm({ ...form, warnings: e.target.value })}
                placeholder="[]" 
              />
            </Field>
          </div>
        )}
      </Modal>
    </>
  );
};
