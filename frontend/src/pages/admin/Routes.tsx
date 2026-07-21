import React, { useEffect, useState, useMemo } from 'react';
import { 
  Route as RouteIcon, Search, Pencil, Trash2, Plus, X, AlertCircle 
} from 'lucide-react';
import { adminApi, errorMessage } from '../../services/adminApi';
import type { Route } from '../../services/adminApi';
import { Badge, Button, LoadingState, ErrorState, Modal, Field, Input, useToast } from '../../components/admin/ui';
import '../../styles/admin.css';

interface RouteForm {
  id?: string;
  code: string;
  routeName: string;
  origin: string;
  destination: string;
  distance: string;
  eta: string;
  stops: string; // JSON
  restrictions: string; // JSON
}

const blank: RouteForm = {
  code: '',
  routeName: '',
  origin: '',
  destination: '',
  distance: '',
  eta: '',
  stops: '[]',
  restrictions: '[]',
};

export const AdminRoutes: React.FC = () => {
  const { notify } = useToast();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const [search, setSearch] = useState('');

  const [form, setForm] = useState<RouteForm | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.routes();
      setRoutes(data);
      if (selectedRoute) {
        const updated = data.find(r => r.id === selectedRoute.id);
        setSelectedRoute(updated || null);
      }
    } catch (err) {
      setError(errorMessage(err, 'Could not load routes'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!form) return;
    if (!form.code.trim()) {
      notify('error', 'Route code is required');
      return;
    }
    if (!form.routeName.trim()) {
      notify('error', 'Route name is required');
      return;
    }
    if (!form.origin.trim() || !form.destination.trim()) {
      notify('error', 'Origin and destination are required');
      return;
    }
    setSaving(true);
    try {
      const body: Partial<Route> = {
        code: form.code.trim().toUpperCase(),
        routeName: form.routeName.trim(),
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        distance: Number(form.distance || 0),
        eta: form.eta.trim(),
        stops: form.stops,
        restrictions: form.restrictions,
      };

      if (form.id) {
        await adminApi.updateRoute(form.id, body);
        notify('success', `Updated route ${form.routeName}`);
      } else {
        await adminApi.createRoute(body);
        notify('success', `Created route ${form.routeName}`);
      }
      setForm(null);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not save route'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (route: Route) => {
    if (!window.confirm(`Delete route "${route.routeName}" (${route.code})?`)) return;
    try {
      await adminApi.deleteRoute(route.id);
      notify('success', `Deleted route ${route.routeName}`);
      if (selectedRoute?.id === route.id) {
        setSelectedRoute(null);
      }
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not delete route'));
    }
  };

  const filteredRoutes = useMemo(() => {
    return routes.filter(r => {
      return r.routeName.toLowerCase().includes(search.toLowerCase()) ||
             r.code.toLowerCase().includes(search.toLowerCase()) ||
             r.origin.toLowerCase().includes(search.toLowerCase()) ||
             r.destination.toLowerCase().includes(search.toLowerCase());
    });
  }, [routes, search]);

  const parseJsonList = (str: string): any[] => {
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  if (loading) return <LoadingState label="Loading Route Master" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">M-08 · Route Management</span>
          <h1 className="adm-page-title">
            <RouteIcon size={22} color="var(--green)" /> Routes
          </h1>
          <p className="adm-page-sub">
            The route registry. Create corridors, arrange waypoint sequences, and declare height/weight/schedule no-entry window restrictions.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setForm({ ...blank })}>
          New Route
        </Button>
      </div>

      {/* Filters bar */}
      <div style={{ display: 'flex', gap: 16, backgroundColor: 'var(--panel-1)', padding: 16, borderRadius: 8, border: '1px solid var(--border-soft)', marginBottom: 20 }}>
        <div style={{ flexGrow: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-3)' }} />
          <input 
            type="text" 
            placeholder="Search by code, route name or waypoint..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 36px', backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Table list */}
        <div style={{ flexGrow: 1, backgroundColor: 'var(--panel-1)', border: '1px solid var(--border-soft)', borderRadius: 8, overflow: 'hidden' }}>
          <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-soft)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>ROUTE CODE</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>ROUTE NAME</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>ORIGIN</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>DESTINATION</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>DISTANCE</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>ETA</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }} />
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.map((r) => (
                <tr 
                  key={r.id} 
                  onClick={() => setSelectedRoute(r)}
                  style={{ 
                    borderBottom: '1px solid var(--border-soft)', 
                    cursor: 'pointer', 
                    backgroundColor: selectedRoute?.id === r.id ? 'var(--panel-2)' : 'transparent' 
                  }}
                  className="table-row-hover"
                >
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontFamily: 'monospace' }}>{r.code}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{r.routeName}</td>
                  <td style={{ padding: '12px 16px' }}>{r.origin}</td>
                  <td style={{ padding: '12px 16px' }}>{r.destination}</td>
                  <td style={{ padding: '12px 16px' }}>{r.distance} km</td>
                  <td style={{ padding: '12px 16px' }}>{r.eta}</td>
                  <td style={{ padding: '12px 16px', width: 80 }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                      <button 
                        className="adm-icon-btn" 
                        title="Edit"
                        onClick={() => setForm({
                          id: r.id,
                          code: r.code,
                          routeName: r.routeName,
                          origin: r.origin,
                          destination: r.destination,
                          distance: String(r.distance),
                          eta: r.eta,
                          stops: r.stops,
                          restrictions: r.restrictions,
                        })}
                      >
                        <Pencil size={13} />
                      </button>
                      <button 
                        className="adm-icon-btn is-danger" 
                        title="Delete"
                        onClick={() => void handleDelete(r)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRoutes.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
                    No routes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Side Details Drawer */}
        {selectedRoute && (
          <div style={{ width: '400px', backgroundColor: 'var(--panel-1)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: 20, boxShadow: 'var(--shadow-3)', position: 'sticky', top: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 10, backgroundColor: 'var(--panel-2)', borderRadius: 8 }}>
                  <RouteIcon size={20} color="var(--green)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{selectedRoute.routeName}</h3>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>Code: {selectedRoute.code}</span>
                </div>
              </div>
              <button onClick={() => setSelectedRoute(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                <X size={18} />
              </button>
            </div>

            {/* General parameters */}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h4 style={{ margin: 0, fontSize: 13, textTransform: 'uppercase', color: 'var(--text-3)', fontWeight: 600 }}>Stops &amp; Waypoints</h4>
              {parseJsonList(selectedRoute.stops).length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>No intermediate stops registered.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderLeft: '2px solid var(--border-soft)', paddingLeft: 12, marginLeft: 6 }}>
                  {parseJsonList(selectedRoute.stops).map((s: { name: string; seq: number }, idx) => (
                    <div key={idx} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--green)', position: 'absolute', left: -17, top: 4 }} />
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span>
                      <Badge tone="grey">Stop {s.seq}</Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Restrictions */}
              <h4 style={{ margin: '15px 0 0 0', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-3)', fontWeight: 600 }}>Corridor Restrictions</h4>
              {parseJsonList(selectedRoute.restrictions).length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>No active road restrictions.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {parseJsonList(selectedRoute.restrictions).map((r: { type: string; value: string; notes?: string }, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, padding: 10, backgroundColor: 'var(--panel-red)', border: '1px solid var(--border-red)', borderRadius: 6 }}>
                      <AlertCircle size={14} color="var(--red)" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{r.type}: {r.value}</span>
                        {r.notes && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.notes}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={form !== null}
        title={form?.id ? 'Edit Route' : 'New Route'}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16 }}>
              <Field label="Route Code" hint="e.g. R-DEL-BOM">
                <Input 
                  value={form.code} 
                  onChange={e => setForm({ ...form, code: e.target.value })}
                  placeholder="Code" 
                  disabled={form.id !== undefined}
                />
              </Field>
              <Field label="Route Name" hint="e.g. Delhi Hub to Mumbai Hub">
                <Input 
                  value={form.routeName} 
                  onChange={e => setForm({ ...form, routeName: e.target.value })}
                  placeholder="Route Name" 
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Origin">
                <Input 
                  value={form.origin} 
                  onChange={e => setForm({ ...form, origin: e.target.value })}
                  placeholder="Delhi Hub" 
                />
              </Field>
              <Field label="Destination">
                <Input 
                  value={form.destination} 
                  onChange={e => setForm({ ...form, destination: e.target.value })}
                  placeholder="Mumbai Hub" 
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Distance (km)">
                <Input 
                  type="number" 
                  value={form.distance} 
                  onChange={e => setForm({ ...form, distance: e.target.value })}
                  placeholder="1420" 
                />
              </Field>
              <Field label="ETA Hours/Days">
                <Input 
                  value={form.eta} 
                  onChange={e => setForm({ ...form, eta: e.target.value })}
                  placeholder="28h 0m" 
                />
              </Field>
            </div>

            <Field label="Intermediate Stops (JSON list of objects)" hint='e.g. [{"name":"Checkpoint A", "seq":1}]'>
              <Input 
                value={form.stops} 
                onChange={e => setForm({ ...form, stops: e.target.value })}
                placeholder="[]" 
              />
            </Field>

            <Field label="Corridor Restrictions (JSON list of objects)" hint='e.g. [{"type":"No-entry", "value":"08:00 - 11:00", "notes":"Heavy restricted"}]'>
              <Input 
                value={form.restrictions} 
                onChange={e => setForm({ ...form, restrictions: e.target.value })}
                placeholder="[]" 
              />
            </Field>
          </div>
        )}
      </Modal>
    </>
  );
};
