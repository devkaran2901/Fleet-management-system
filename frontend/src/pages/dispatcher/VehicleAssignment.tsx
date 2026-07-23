import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Truck, RefreshCw, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';
import { dispatcherApi } from '../../services/dispatcherApi';
import type { Vehicle } from '../../services/dispatcherApi';
import { Badge, Button, EmptyState, ErrorState, Input, LoadingState, Panel, Select } from '../../components/admin/ui';

export const VehicleAssignment: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterClass, setFilterClass] = useState('All');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dispatcherApi.vehicles();
      setVehicles(data);
    } catch (err: any) {
      setError(err?.message || 'Could not load vehicle master');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Filtering
  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        v.vehicleNumber.toLowerCase().includes(query.toLowerCase()) ||
        v.currentLocation.toLowerCase().includes(query.toLowerCase()) ||
        (v.vendorName && v.vendorName.toLowerCase().includes(query.toLowerCase()));
      const matchesStatus = filterStatus === 'All' || v.status === filterStatus;
      const matchesClass = filterClass === 'All' || v.class === filterClass;
      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [vehicles, query, filterStatus, filterClass]);

  const CheckIcon = ({ check }: { check: boolean }) =>
    check ? <ShieldCheck size={14} color="var(--green)" /> : <XCircle size={14} color="var(--red)" />;

  if (loading) return <LoadingState label="Loading vehicle master list" />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Vehicle Fleet</span>
          <h1 className="adm-page-title">
            <Truck size={22} color="var(--green)" /> Vehicles
          </h1>
          <p className="adm-page-sub">
            Complete vehicle master details: telematics logs, fuel inventory levels, and checklist compliance blocks (FASTag, PM, GPS, Permits).
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <Panel title="Total Fleet Assets" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{vehicles.length}</div></Panel>
        <Panel title="Available" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{vehicles.filter(v => v.status === 'Available').length}</div></Panel>
        <Panel title="Active In Transit" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--amber)' }}>{vehicles.filter(v => v.status === 'In Transit').length}</div></Panel>
        <Panel title="Workshop Maintenance" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--red)' }}>{vehicles.filter(v => v.status === 'Maintenance' || v.status === 'Blocked').length}</div></Panel>
      </div>

      <Panel
        title="Vehicle Registry"
        subtitle={`${filtered.length} vehicles found`}
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <Input
              style={{ width: 220 }}
              placeholder="Search vehicle number, site..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select style={{ width: 140 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In Transit">In Transit</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Blocked">Blocked</option>
            </Select>
            <Select style={{ width: 140 }} value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
              <option value="All">All Class</option>
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
          <EmptyState title="No vehicles match" hint="Try adjusting filters." />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Category / Transporter</th>
                  <th>Fuel Level</th>
                  <th>Current Location</th>
                  <th>GPS / Telematics</th>
                  <th>Compliance Checklist (FASTag · PM · Ins · Fit · Perm)</th>
                  <th>Utilization</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => {
                  const alerts = JSON.parse(v.alerts || '[]');
                  const hasAlerts = alerts.length > 0;
                  return (
                    <tr key={v.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Truck size={14} color="var(--green)" />
                          <div>
                            <div style={{ fontWeight: 600 }} className="adm-cell-mono">{v.vehicleNumber}</div>
                            <div className="adm-row-sub" style={{ fontSize: 9 }}>{v.class} · {v.capacity}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{v.category}</div>
                        {v.vendorName && <div className="adm-row-sub" style={{ fontSize: 10 }}>{v.vendorName}</div>}
                      </td>
                      <td className="adm-cell-mono">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 40, height: 6, backgroundColor: 'var(--panel-2)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${v.fuel}%`, height: '100%', backgroundColor: v.fuel <= 25 ? 'var(--red)' : v.fuel <= 50 ? 'var(--amber)' : 'var(--green)' }} />
                          </div>
                          {v.fuel}%
                        </div>
                      </td>
                      <td>{v.currentLocation}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: v.gpsDeviceStatus === 'Online' ? 'var(--green)' : v.gpsDeviceStatus === 'Tampered' ? 'var(--red)' : 'var(--text-3)' }} />
                          <span style={{ fontSize: 11 }}>{v.gpsDeviceStatus}</span>
                          <span className="adm-row-sub" style={{ fontSize: 9 }}>({v.lastPingAge})</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} title="FASTag | Preventive Maintenance | Insurance | Fitness | National Permit">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}><CheckIcon check={v.complianceFASTag} /><span style={{ fontSize: 9, color: 'var(--text-3)' }}>TAG</span></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}><CheckIcon check={v.compliancePM} /><span style={{ fontSize: 9, color: 'var(--text-3)' }}>PM</span></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}><CheckIcon check={v.complianceInsurance} /><span style={{ fontSize: 9, color: 'var(--text-3)' }}>INS</span></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}><CheckIcon check={v.complianceFitness} /><span style={{ fontSize: 9, color: 'var(--text-3)' }}>FIT</span></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}><CheckIcon check={v.compliancePermit} /><span style={{ fontSize: 9, color: 'var(--text-3)' }}>PRM</span></div>
                        </div>
                        {hasAlerts && (
                          <div style={{ color: 'var(--red)', fontSize: 9, marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AlertTriangle size={10} /> {alerts[0]}
                          </div>
                        )}
                      </td>
                      <td className="adm-cell-mono">{v.utilization}%</td>
                      <td>
                        <Badge tone={v.status === 'Available' ? 'green' : v.status === 'In Transit' ? 'amber' : v.status === 'Maintenance' ? 'red' : 'grey'}>
                          {v.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
};
