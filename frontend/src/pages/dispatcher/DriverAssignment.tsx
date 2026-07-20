import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { UserCog, RefreshCw, ShieldAlert, Award } from 'lucide-react';
import { dispatcherApi } from '../../services/dispatcherApi';
import type { Driver } from '../../services/dispatcherApi';
import { Badge, Button, EmptyState, ErrorState, Input, LoadingState, Panel, Select } from '../../components/admin/ui';

export const DriverAssignment: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dispatcherApi.drivers();
      setDrivers(data);
    } catch (err: any) {
      setError(err?.message || 'Could not load drivers roster');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Filtering
  const filtered = useMemo(() => {
    return drivers.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.license.toLowerCase().includes(query.toLowerCase()) ||
        d.site.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = filterStatus === 'All' || d.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, query, filterStatus]);

  if (loading) return <LoadingState label="Loading drivers roster" />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">P-15 · Driver Operations</span>
          <h1 className="adm-page-title">
            <UserCog size={22} color="var(--green)" /> Drivers
          </h1>
          <p className="adm-page-sub">
            Roster and eligibility checklist: duty logs, resting compliance timers (Rule BR-DRV-05), safety scores, and warning logs.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <Panel title="Total Drivers" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{drivers.length}</div></Panel>
        <Panel title="Available" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{drivers.filter(d => d.status === 'Available').length}</div></Panel>
        <Panel title="On Duty" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--amber)' }}>{drivers.filter(d => d.status === 'On Duty').length}</div></Panel>
        <Panel title="Suspended / Resting" padded={false}><div style={{ padding: 12, fontSize: 24, fontWeight: 700, color: 'var(--red)' }}>{drivers.filter(d => d.status === 'Suspended' || d.status === 'Off Duty').length}</div></Panel>
      </div>

      <Panel
        title="Roster Directory"
        subtitle={`${filtered.length} drivers found`}
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <Input
              style={{ width: 220 }}
              placeholder="Search driver name, DL, site..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select style={{ width: 140 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Duty">On Duty</option>
              <option value="Off Duty">Off Duty</option>
              <option value="Suspended">Suspended</option>
            </Select>
            <Button variant="subtle" icon={<RefreshCw size={12} />} onClick={loadData} />
          </div>
        }
        padded={false}
      >
        {filtered.length === 0 ? (
          <EmptyState title="No drivers match" hint="Try adjusting filters." />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>License Details</th>
                  <th>Duty Hours</th>
                  <th>Rest Hours</th>
                  <th>Safety Score</th>
                  <th>Active Assignment</th>
                  <th>Exceptions Warnings</th>
                  <th>Roster Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const warnings = JSON.parse(d.warnings || '[]');
                  const hasWarnings = warnings.length > 0;
                  return (
                    <tr key={d.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="adm-avatar">
                            {d.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{d.name}</div>
                            <div className="adm-row-sub">{d.site}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 11, fontFamily: 'monospace' }}>{d.license}</div>
                        <div className="adm-row-sub" style={{ fontSize: 10 }}>{d.licenseType}</div>
                      </td>
                      <td className="adm-cell-mono" style={{ fontWeight: d.dutyHours >= 7.0 ? '700' : 'normal', color: d.dutyHours >= 7.0 ? 'var(--amber)' : 'inherit' }}>
                        {d.dutyHours} hrs
                      </td>
                      <td className="adm-cell-mono">{d.restHours} hrs</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                          <Award size={13} color={d.safetyScore >= 90 ? 'var(--green)' : d.safetyScore >= 80 ? 'var(--amber)' : 'var(--red)'} />
                          {d.safetyScore}/100
                        </div>
                      </td>
                      <td className="adm-cell-mono" style={{ fontSize: 10 }}>
                        {d.currentTripId ? (
                          <span style={{ color: 'var(--amber)' }}>Occupied: {d.currentTripId.slice(0, 13)}</span>
                        ) : (
                          <span style={{ color: 'var(--text-3)' }}>None (Standby)</span>
                        )}
                      </td>
                      <td>
                        {hasWarnings ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--red)', fontSize: 10 }}>
                            <ShieldAlert size={12} />
                            {warnings[0]}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--green)', fontSize: 10 }}>Compliance OK</span>
                        )}
                      </td>
                      <td>
                        <Badge tone={d.status === 'Available' ? 'green' : d.status === 'On Duty' ? 'amber' : d.status === 'Suspended' ? 'red' : 'grey'}>
                          {d.status}
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
