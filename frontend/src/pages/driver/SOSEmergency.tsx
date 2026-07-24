import React, { useState } from 'react';
import { initialDuty, initialTrips } from './driverDataStore';
import type { SOSEvent } from './driverDataStore';
import {
  ShieldAlert,
  MapPin,
  Camera,
  Radio,
  Send,
  PhoneCall,
} from 'lucide-react';

export const SOSEmergency: React.FC = () => {
  const [emergencyType, setEmergencyType] = useState<'Breakdown' | 'Accident' | 'Medical' | 'Security Threat'>('Breakdown');
  const [description, setDescription] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState<string | null>(null);
  const [alertsSent, setAlertsSent] = useState<SOSEvent[]>([]);
  const [isSending, setIsSending] = useState(false);

  const currentTrip = initialTrips[0];

  const handleSendSOS = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    setTimeout(() => {
      const nowFormatted = new Date().toLocaleString();
      const newSOS: SOSEvent = {
        id: `SOS-${Math.floor(100 + Math.random() * 900)}`,
        emergencyType,
        description: description || `${emergencyType} reported en-route near NH-48 Km 142.`,
        photoUrl: photoUploaded || 'accident-evidence-photo.jpg',
        location: '18.5204° N, 73.8567° E (NH-48 Km 142)',
        timestamp: nowFormatted,
        driverName: 'Rajesh Kumar (DRV-401)',
        vehicleNumber: initialDuty.vehicleNumber,
        currentTripId: currentTrip.tripNumber,
        status: 'Alert Sent',
        notifiedRoles: ['Dispatcher (Ramesh Sharma)', 'Fleet Manager', 'Central 24x7 Control Room'],
      };

      setAlertsSent((prev) => [newSOS, ...prev]);
      setIsSending(false);
      setDescription('');
      setPhotoUploaded(null);
      alert(`🚨 HIGH PRIORITY EMERGENCY ALERT SENT! Dispatcher & 24x7 Control Room notified.`);
    }, 1000);
  };

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldAlert size={26} /> 24x7 Emergency SOS Center
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-2)' }}>
            Instant high-priority dispatch alert for vehicle breakdowns, accidents, medical emergencies & security threats.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div className="driver-card" style={{ border: '1px solid var(--red)', background: 'var(--panel-2)' }}>
          <div className="driver-card-title" style={{ color: 'var(--red)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio size={18} /> TRIGGER HIGH-PRIORITY EMERGENCY ALERT
            </span>
          </div>

          <form onSubmit={handleSendSOS}>
            <div className="driver-form-group">
              <label>Select Emergency Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { type: 'Breakdown', label: '🛠️ Vehicle Breakdown', desc: 'Engine failure, tyre blowout, overheating' },
                  { type: 'Accident', label: '💥 Vehicle Collision', desc: 'Accident on road, vehicle damage' },
                  { type: 'Medical', label: '🚑 Medical Emergency', desc: 'Driver illness, injury, sudden pain' },
                  { type: 'Security Threat', label: '🚨 Security Threat', desc: 'Cargo hijack attempt, theft, robbery' },
                ].map((item) => (
                  <div
                    key={item.type}
                    onClick={() => setEmergencyType(item.type as any)}
                    style={{
                      background: emergencyType === item.type ? 'rgba(239, 68, 68, 0.2)' : 'var(--panel-2)',
                      border: `1px solid ${emergencyType === item.type ? 'var(--red)' : 'var(--border)'}`,
                      borderRadius: 10,
                      padding: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 800, color: emergencyType === item.type ? 'var(--red)' : 'var(--text-1)' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 2 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="driver-form-group">
              <label>Emergency Description / Situation Notes</label>
              <textarea
                rows={3}
                placeholder="Describe current location landmark, safety condition, or medical urgency..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="driver-form-group">
              <label>Attach Scene / Incident Photo</label>
              <button
                type="button"
                className="driver-btn-secondary"
                onClick={() => setPhotoUploaded('sos-incident-photo.jpg')}
                style={{ width: '100%', fontSize: 12, justifyContent: 'center' }}
              >
                <Camera size={16} /> {photoUploaded ? 'Incident Photo Attached ✓' : 'Take / Upload Photo'}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="driver-sos-btn"
              style={{ width: '100%', padding: '14px', fontSize: 15, justifyContent: 'center', marginTop: 10 }}
            >
              <Send size={18} /> {isSending ? 'Transmitting Alert via GPS...' : 'SEND EMERGENCY ALERT NOW'}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="driver-card">
            <div className="driver-card-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin color="var(--green)" size={18} /> AUTOMATIC VEHICLE & GPS CAPTURE
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              <div style={{ background: 'var(--panel-2)', padding: 12, borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 700 }}>LIVE GPS LOCATION</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)', fontFamily: 'monospace', marginTop: 2 }}>
                  18.5204° N, 73.8567° E (NH-48 Km 142)
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: 'var(--panel-2)', padding: 10, borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 700 }}>DRIVER</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>Rajesh Kumar (DRV-401)</div>
                </div>

                <div style={{ background: 'var(--panel-2)', padding: 10, borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 700 }}>VEHICLE</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', fontFamily: 'monospace' }}>{initialDuty.vehicleNumber}</div>
                </div>
              </div>

              <div style={{ background: 'var(--panel-2)', padding: 10, borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 700 }}>ACTIVE TRIP</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{currentTrip.tripNumber} ({currentTrip.route})</div>
              </div>
            </div>
          </div>

          <div className="driver-card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--red)' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--red)', marginBottom: 4 }}>
              24x7 TRAVERSE CONTROL ROOM HOTLINE
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10 }}>
              For immediate toll-free emergency call support:
            </div>
            <a
              href="tel:18002008899"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'var(--red)',
                color: '#FFF',
                padding: '10px',
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              <PhoneCall size={18} /> CALL 1800-200-8899 NOW
            </a>
          </div>
        </div>
      </div>

      {alertsSent.length > 0 && (
        <div className="driver-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-soft)', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)' }}>
            <ShieldAlert size={18} /> TRANSMITTED EMERGENCY ALERTS
          </div>

          <table className="driver-table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>Location</th>
                <th>Timestamp</th>
                <th>Notified Operational Roles</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {alertsSent.map((sos) => (
                <tr key={sos.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--red)' }}>{sos.id}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{sos.emergencyType}</span>
                  </td>
                  <td>{sos.description}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{sos.location}</td>
                  <td>{sos.timestamp}</td>
                  <td>
                    <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>
                      ✓ {sos.notifiedRoles.join(' · ')}
                    </div>
                  </td>
                  <td>
                    <span className="driver-status-pill sos">{sos.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
