import React, { useState } from 'react';
import { HardDrive, Search, Wifi, BatteryCharging } from 'lucide-react';
import { Button, Panel, Badge } from '../../components/admin/ui';
import type { DeviceHealthItem } from '../../services/adminApi';

const INITIAL_DEVICES: DeviceHealthItem[] = [
  {
    id: 'dev-1',
    imei: '864291048291048',
    model: 'Teltonika FMB920',
    vehicleNumber: 'DL 01 AB 1234',
    signalStrength: 'Strong',
    batteryPercentage: 98,
    status: 'Online',
    lastPingTime: '30s ago',
    firmwareVersion: 'v3.28.10',
  },
  {
    id: 'dev-2',
    imei: '864291048291099',
    model: 'Teltonika FMB920',
    vehicleNumber: 'MH 04 CD 5678',
    signalStrength: 'Medium',
    batteryPercentage: 84,
    status: 'Online',
    lastPingTime: '1m ago',
    firmwareVersion: 'v3.28.10',
  },
  {
    id: 'dev-3',
    imei: '864291048291112',
    model: 'Concox AT4 OBD-II',
    vehicleNumber: 'WB 02 JK 7890',
    signalStrength: 'No Signal',
    batteryPercentage: 12,
    status: 'Tampered',
    lastPingTime: '45m ago',
    firmwareVersion: 'v2.14.05',
  },
  {
    id: 'dev-4',
    imei: '864291048291444',
    model: 'Queclink GV300',
    vehicleNumber: 'KA 03 EF 9012',
    signalStrength: 'Strong',
    batteryPercentage: 92,
    status: 'Online',
    lastPingTime: '15s ago',
    firmwareVersion: 'v4.01.02',
  },
];

export const DeviceHealth: React.FC = () => {
  const [devices] = useState<DeviceHealthItem[]>(INITIAL_DEVICES);
  const [search, setSearch] = useState('');

  const filtered = devices.filter(
    (d) =>
      d.imei.includes(search) ||
      d.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Monitoring / P-08</span>
          <h1 className="adm-page-title">
            <HardDrive size={22} color="var(--green)" /> GPS Telemetry Device Health
          </h1>
          <p className="adm-page-sub">
            Telemetry hardware status across the vehicle fleet, signal strength, battery levels, and tamper detection.
          </p>
        </div>
        <Button
          variant="subtle"
          icon={<RefreshCw size={14} />}
          onClick={() => alert('Diagnostic ping broadcast sent to all GPS devices.')}
        >
          Ping Device Fleet
        </Button>
      </div>

      <Panel title="GPS Hardware Fleet Summary">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search IMEI, vehicle number, hardware model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                fontSize: 13,
                borderRadius: 6,
                border: '1px solid var(--border-soft)',
                backgroundColor: 'var(--panel-2)',
                color: 'var(--text-1)',
              }}
            />
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>IMEI & Model</th>
                <th>Assigned Vehicle</th>
                <th>Signal Strength</th>
                <th>Battery Level</th>
                <th>Firmware</th>
                <th>Last Ping</th>
                <th>Status</th>
                <th>Diagnostics</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{d.model}</div>
                    <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>
                      IMEI: {d.imei}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{d.vehicleNumber}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                      <Wifi size={13} color={d.signalStrength === 'Strong' ? 'var(--green)' : '#f59e0b'} />
                      <span>{d.signalStrength}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                      <BatteryCharging size={13} color={d.batteryPercentage < 20 ? '#ef4444' : 'var(--green)'} />
                      <span style={{ fontWeight: 600 }}>{d.batteryPercentage}%</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{d.firmwareVersion}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{d.lastPingTime}</td>
                  <td>
                    <Badge tone={d.status === 'Online' ? 'green' : d.status === 'Offline' ? 'amber' : 'red'}>
                      {d.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => alert(`Sending diagnostic ping to IMEI ${d.imei}... Signal RSSI: -65 dBm`)}
                    >
                      Ping GPS
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
};
