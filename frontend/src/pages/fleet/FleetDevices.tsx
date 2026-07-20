import React, { useEffect, useState } from 'react';
import { 
  Wifi, Zap
} from 'lucide-react';
import { Panel, Badge, Button, LoadingState, useToast } from '../../components/admin/ui';
import '../../styles/admin.css';

export const FleetDevices: React.FC = () => {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [diagnosingId, setDiagnosingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  const handleDiagnose = (id: string) => {
    setDiagnosingId(id);
    setTimeout(() => {
      setDiagnosingId(null);
      notify('success', `Diagnostics run complete for Device ${id}. Status: HEALTHY`);
    }, 1000);
  };

  if (loading) {
    return <LoadingState label="Loading Telematics Diagnostics" />;
  }

  const devices = [
    { id: 'DEV-889021', vehicle: 'DL-01-MA-1234', vendor: 'Autocop AIS-140', battery: '95%', signal: 'Excellent', lastPing: '1m ago', status: 'Online' },
    { id: 'DEV-889022', vehicle: 'DL-01-MB-5678', vendor: 'Autocop AIS-140', battery: '100%', signal: 'Good', lastPing: '2m ago', status: 'Online' },
    { id: 'DEV-889023', vehicle: 'HR-55-A-9901', vendor: 'AssetTrack ELD', battery: '85%', signal: 'Excellent', lastPing: '30s ago', status: 'Online' },
    { id: 'DEV-889024', vehicle: 'MH-12-PQ-4321', vendor: 'Geotab GO9', battery: '90%', signal: 'Fair', lastPing: '5m ago', status: 'Online' },
    { id: 'DEV-889025', vehicle: 'GJ-01-XX-1122', vendor: 'Autocop AIS-140', battery: '0% (Dead)', signal: 'No Signal', lastPing: '14h ago', status: 'Offline' },
    { id: 'DEV-889026', vehicle: 'DL-02-C-8877', vendor: 'Autocop AIS-140', battery: '80%', signal: 'Good', lastPing: '1m ago', status: 'Online' },
    { id: 'DEV-889027', vehicle: 'UP-16-T-3344', vendor: 'AssetTrack ELD', battery: '92%', signal: 'Good', lastPing: '4m ago', status: 'Online' },
    { id: 'DEV-889028', vehicle: 'HR-38-Y-7788', vendor: 'Geotab GO9', battery: '88%', signal: 'Good', lastPing: '10m ago', status: 'Online' },
    { id: 'DEV-889029', vehicle: 'MH-43-R-8899', vendor: 'Autocop AIS-140', battery: '12%', signal: 'Poor', lastPing: '1m ago', status: 'Tampered' },
    { id: 'DEV-889030', vehicle: 'DL-01-MC-9012', vendor: 'Autocop AIS-140', battery: '96%', signal: 'Excellent', lastPing: '2m ago', status: 'Online' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>Telematics & Device Health</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>Monitor GPS tracker hardware statuses, ping latencies, and device tamper flags.</p>
      </div>

      {/* Stats summaries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ backgroundColor: 'var(--panel-1)', border: '1px solid var(--border-soft)', padding: 16, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Online Trackers</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: 'var(--green)' }}>
            {devices.filter(d => d.status === 'Online').length} / {devices.length}
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--panel-1)', border: '1px solid var(--border-soft)', padding: 16, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Tamper Events Detected</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: 'var(--red)' }}>
            {devices.filter(d => d.status === 'Tampered').length}
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--panel-1)', border: '1px solid var(--border-soft)', padding: 16, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Offline Trackers</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: 'var(--text-3)' }}>
            {devices.filter(d => d.status === 'Offline').length}
          </div>
        </div>
      </div>

      {/* Inventory Panel */}
      <Panel title="GPS Trackers Diagnostic Ingest Dashboard">
        <div style={{ overflowX: 'auto' }}>
          <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-soft)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>DEVICE ID</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>ALLOCATED VEHICLE</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>INGESTION MODULE</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>BATTERY</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>CELL SIGNAL</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>LAST PING</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>STATUS</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{d.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{d.vehicle}</td>
                  <td style={{ padding: '12px 16px' }}>{d.vendor}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Zap size={13} color="var(--blue)" />
                      <span>{d.battery}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Wifi size={14} color="var(--text-3)" />
                      <span>{d.signal}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{d.lastPing}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge tone={d.status === 'Online' ? 'green' : (d.status === 'Tampered' ? 'red' : 'grey')}>
                      {d.status}
                    </Badge>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Button 
                      size="sm" 
                      variant="subtle" 
                      onClick={() => handleDiagnose(d.id)}
                      disabled={diagnosingId === d.id}
                    >
                      {diagnosingId === d.id ? 'Diagnosing...' : 'Test Ingest'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
