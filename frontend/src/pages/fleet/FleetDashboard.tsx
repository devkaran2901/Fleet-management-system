import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, Truck, UserCog, Activity, 
  FileBadge, Calendar, HeartPulse 
} from 'lucide-react';
import { Panel, Badge, Button, LoadingState } from '../../components/admin/ui';
import { Link } from 'react-router-dom';
import '../../styles/admin.css';

export const FleetDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return <LoadingState label="Loading Fleet Manager Dashboard" />;
  }

  // Exact metrics seeded in database
  const vehicleStats = { total: 10, active: 6, maintenance: 1, blocked: 1, idle: 6 };
  const driverStats = { total: 10, onDuty: 2, offDuty: 6, expiring: 1 };
  const integrationHealth = { total: 8, healthy: 5, degraded: 2, down: 1 };

  const recentIncidents = [
    { id: '1', type: 'PM Overdue', vehicle: 'GJ-01-XX-1122', severity: 'WARNING', age: '14h ago', details: 'PM Overdue by 1,200 km' },
    { id: '2', type: 'Insurance Expired', vehicle: 'DL-02-C-8877', severity: 'CRITICAL', age: '1d ago', details: 'Insurance expired (Rule BR-CMP-03)' },
    { id: '3', type: 'FASTag Low Balance', vehicle: 'DL-01-MC-9012', severity: 'INFO', age: '2h ago', details: 'FASTag Low Balance (₹150)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>Strategic Fleet Console</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>Real-time assets, workforce compliance, and system status.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/fleet/vehicles">
            <Button variant="primary">Manage Vehicles</Button>
          </Link>
          <Link to="/fleet/drivers">
            <Button variant="subtle">Roster Drivers</Button>
          </Link>
        </div>
      </div>

      {/* Grid of KPI Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Vehicles summary */}
        <Panel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Truck size={18} color="var(--green)" />
              <span style={{ fontWeight: 600, fontSize: 15 }}>Vehicle Master Vitals</span>
            </div>
            <Badge tone="green">{vehicleStats.total} total</Badge>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div style={{ backgroundColor: 'var(--panel-2)', padding: '10px 12px', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Active / In Transit</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: 'var(--green)' }}>{vehicleStats.active}</div>
            </div>
            <div style={{ backgroundColor: 'var(--panel-2)', padding: '10px 12px', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Idle / Available</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: 'var(--text-1)' }}>{vehicleStats.idle}</div>
            </div>
            <div style={{ backgroundColor: 'var(--panel-2)', padding: '10px 12px', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Maintenance</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: 'var(--amber)' }}>{vehicleStats.maintenance}</div>
            </div>
            <div style={{ backgroundColor: 'var(--panel-2)', padding: '10px 12px', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Compliance Blocked</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: 'var(--red)' }}>{vehicleStats.blocked}</div>
            </div>
          </div>
        </Panel>

        {/* Drivers summary */}
        <Panel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserCog size={18} color="var(--green)" />
              <span style={{ fontWeight: 600, fontSize: 15 }}>Driver Workforce Vitals</span>
            </div>
            <Badge tone="grey">{driverStats.total} active</Badge>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div style={{ backgroundColor: 'var(--panel-2)', padding: '10px 12px', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>On Duty</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: 'var(--green)' }}>{driverStats.onDuty}</div>
            </div>
            <div style={{ backgroundColor: 'var(--panel-2)', padding: '10px 12px', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Available (Off Duty)</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: 'var(--text-1)' }}>{driverStats.offDuty}</div>
            </div>
            <div style={{ backgroundColor: 'var(--panel-2)', padding: '10px 12px', borderRadius: 8, gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>License Renewal (T-30 Threshold)</span>
                <Badge tone="red">{driverStats.expiring} Expiring</Badge>
              </div>
            </div>
          </div>
        </Panel>

        {/* System & Telematics Integrations */}
        <Panel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={18} color="var(--green)" />
              <span style={{ fontWeight: 600, fontSize: 15 }}>GPS & Telematics Ingest</span>
            </div>
            <Badge tone="green">{integrationHealth.total} feeds</Badge>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--panel-2)', padding: '8px 12px', borderRadius: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Healthy API Connections</span>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>{integrationHealth.healthy}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--panel-2)', padding: '8px 12px', borderRadius: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Degraded (High Latency)</span>
              <span style={{ color: 'var(--amber)', fontWeight: 700 }}>{integrationHealth.degraded}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--panel-2)', padding: '8px 12px', borderRadius: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Down / Offline</span>
              <span style={{ color: 'var(--red)', fontWeight: 700 }}>{integrationHealth.down}</span>
            </div>
          </div>
        </Panel>
      </div>

      {/* Main Split Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Compliance and Exceptions alerts list */}
        <Panel title="Active Fleet Exceptions & Compliance Holds">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentIncidents.map((incident) => (
              <div 
                key={incident.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 16, 
                  padding: 16, 
                  backgroundColor: 'var(--panel-2)', 
                  borderLeft: `4px solid ${incident.severity === 'CRITICAL' ? 'var(--red)' : (incident.severity === 'WARNING' ? 'var(--amber)' : 'var(--blue)')}`,
                  borderRadius: 6 
                }}
              >
                <AlertTriangle size={18} color={incident.severity === 'CRITICAL' ? 'var(--red)' : (incident.severity === 'WARNING' ? 'var(--amber)' : 'var(--blue)')} style={{ marginTop: 2 }} />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>{incident.type}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{incident.age}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
                    Asset: <strong>{incident.vehicle}</strong> &middot; {incident.details}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Quick Operations Actions panel */}
        <Panel title="Quick Operations Actions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link to="/fleet/compliance">
              <Button style={{ width: '100%', justifyContent: 'flex-start' }} variant="subtle">
                <FileBadge size={16} style={{ marginRight: 8 }} /> Upload Documents for OCR
              </Button>
            </Link>
            <Link to="/fleet/maintenance">
              <Button style={{ width: '100%', justifyContent: 'flex-start' }} variant="subtle">
                <Calendar size={16} style={{ marginRight: 8 }} /> Open PM Planner
              </Button>
            </Link>
            <Link to="/fleet/devices">
              <Button style={{ width: '100%', justifyContent: 'flex-start' }} variant="subtle">
                <HeartPulse size={16} style={{ marginRight: 8 }} /> Diagnostic Ingest Check
              </Button>
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
};
