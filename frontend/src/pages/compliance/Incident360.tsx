import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, Phone, ShieldAlert, FileText, CheckSquare, 
  Play, Pause, RefreshCw, Key, Shield
} from 'lucide-react';
import { Panel, Badge, Button, useToast } from '../../components/admin/ui';

interface Incident {
  id: string;
  vehicleNo: string;
  driver: string;
  driverPhone: string;
  type: 'Accident' | 'Breakdown' | 'Security Issue' | 'Medical Emergency';
  severity: 'Critical' | 'Major' | 'Minor';
  status: 'Open' | 'Dispatched' | 'Investigating' | 'Resolved';
  date: string;
  time: string;
  location: string;
  speedBeforeEvent: number[];
  speedTimelineLabels: string[];
  dashcamThumb: string;
  firStatus: string;
  firNumber: string;
  rcaCause: string;
  rcaFindings: string;
  rcaCorrective: string;
  rcaPreventive: string;
  linkedClaimNo: string;
}

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-0891',
    vehicleNo: 'RJ-14-AB-5678',
    driver: 'Rajesh Sharma',
    driverPhone: '+91 98765 43210',
    type: 'Accident',
    severity: 'Critical',
    status: 'Investigating',
    date: '2026-07-21',
    time: '10:42',
    location: 'Gurugram Expressway, Exit 12 Delhi-Bound',
    speedBeforeEvent: [68, 65, 62, 59, 61, 58, 45, 12, 0, 0],
    speedTimelineLabels: ['-60s', '-50s', '-40s', '-30s', '-20s', '-10s', '-5s', '-2s', 'Event', '+5s'],
    dashcamThumb: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=400',
    firStatus: 'Filed & Sealed',
    firNumber: 'FIR/GGN/2026/8812',
    rcaCause: 'Equipment Fail - Brake Caliper Lockup',
    rcaFindings: 'Telematic log shows sudden deceleration spike. Physical inspection reveals brake caliper lockup on rear-left wheel assembly due to workshop refit alignment mismatch.',
    rcaCorrective: 'Replace wheel assembly and recall workshop batches serviced by vendor on July 15.',
    rcaPreventive: 'Implement mandatory dual-torque sensor calibration checks during PM release gates.',
    linkedClaimNo: 'CLM-00912'
  },
  {
    id: 'INC-0890',
    vehicleNo: 'GJ-01-XX-1122',
    driver: 'Amit Patel',
    driverPhone: '+91 99887 76655',
    type: 'Breakdown',
    severity: 'Major',
    status: 'Dispatched',
    date: '2026-07-19',
    time: '18:15',
    location: 'NH-8 Corridor, Km 90 near Behror Depot',
    speedBeforeEvent: [82, 80, 78, 60, 40, 15, 0, 0, 0, 0],
    speedTimelineLabels: ['-60s', '-50s', '-40s', '-30s', '-20s', '-10s', '-5s', '-2s', 'Event', '+5s'],
    dashcamThumb: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=400',
    firStatus: 'Not Required',
    firNumber: '',
    rcaCause: 'Coolant Hose Rupture',
    rcaFindings: 'Engine overheat sensor trigger logged. Tow team dispatched.',
    rcaCorrective: 'Replace coolant circuit hose.',
    rcaPreventive: 'Add hose inspection checklist during 10K PM loops.',
    linkedClaimNo: ''
  },
  {
    id: 'INC-0889',
    vehicleNo: 'MH-43-R-8899',
    driver: 'Suresh Kumar',
    driverPhone: '+91 94433 22110',
    type: 'Security Issue',
    severity: 'Minor',
    status: 'Resolved',
    date: '2026-07-15',
    time: '02:30',
    location: 'Jaipur Outer Ring Road Toll Plaza',
    speedBeforeEvent: [35, 12, 0, 0, 0, 0, 0, 0, 0, 0],
    speedTimelineLabels: ['-60s', '-50s', '-40s', '-30s', '-20s', '-10s', '-5s', '-2s', 'Event', '+5s'],
    dashcamThumb: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=400',
    firStatus: 'Settled Provisional',
    firNumber: 'FIR/JP/2026/9001',
    rcaCause: 'Unauthorized Cargo Intercept',
    rcaFindings: 'Toll booth security dispute. Resolved with documentation proof.',
    rcaCorrective: 'Provide signed dispatch ledger directly to driver offline wallet.',
    rcaPreventive: 'Ensure all toll waybills are cached offline in driver app.',
    linkedClaimNo: ''
  }
];

export const Incident360: React.FC = () => {
  const { notify } = useToast();

  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-0891');
  const [activeTrackTab, setActiveTrackTab] = useState<'emergency' | 'legal' | 'insurance' | 'rca'>('emergency');

  // Video simulator state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  // Sealed snapshot state
  const [isSealUnlocked, setIsSealUnlocked] = useState(false);

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  // Dashboard metrics
  const stats = useMemo(() => {
    let open = incidents.filter(i => i.status !== 'Resolved').length;
    let critical = incidents.filter(i => i.severity === 'Critical').length;
    let resolved = incidents.filter(i => i.status === 'Resolved').length;
    return { open, critical, resolved, avgSla: '42 Min' };
  }, [incidents]);

  const handlePlaySimulate = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      const interval = setInterval(() => {
        setPlaybackTime(t => {
          if (t >= 60) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return t + 2;
        });
      }, 300);
    }
  };

  const handleTriggerAction = (target: string) => {
    notify('success', `Emergency dispatch triggered: Connecting with ${target}...`);
  };

  const handleRcaSave = (field: 'cause' | 'findings' | 'corrective' | 'preventive', value: string) => {
    setIncidents(incidents.map(i => {
      if (i.id === selectedIncident.id) {
        return {
          ...i,
          rcaCause: field === 'cause' ? value : i.rcaCause,
          rcaFindings: field === 'findings' ? value : i.rcaFindings,
          rcaCorrective: field === 'corrective' ? value : i.rcaCorrective,
          rcaPreventive: field === 'preventive' ? value : i.rcaPreventive
        };
      }
      return i;
    }));
  };

  const handleRcaSubmit = () => {
    notify('success', `Internal RCA log committed for incident: ${selectedIncident.id}`);
  };

  const getSeverityTone = (sev: string) => {
    if (sev === 'Critical') return 'red';
    if (sev === 'Major') return 'amber';
    return 'blue';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Incident Management Tower (360°)</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
          Real-time incident response board, telematics analysis, and RCA workflow engine.
        </p>
      </div>

      {/* Incident Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div style={{ padding: 16, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'rgba(232, 163, 61, 0.08)', color: 'var(--amber)' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>ACTIVE INCIDENTS</span>
            <strong style={{ fontSize: 20 }}>{stats.open}</strong>
          </div>
        </div>

        <div style={{ padding: 16, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'rgba(229, 72, 77, 0.08)', color: 'var(--red)' }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>CRITICAL INCIDENTS</span>
            <strong style={{ fontSize: 20, color: 'var(--red)' }}>{stats.critical}</strong>
          </div>
        </div>

        <div style={{ padding: 16, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'var(--green-glow)', color: 'var(--green)' }}>
            <CheckSquare size={20} />
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>RESOLVED (THIS MONTH)</span>
            <strong style={{ fontSize: 20, color: 'var(--green)' }}>{stats.resolved}</strong>
          </div>
        </div>

        <div style={{ padding: 16, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 10, borderRadius: 8, backgroundColor: 'var(--green-glow)', color: 'var(--green)' }}>
            <RefreshCw size={20} />
          </div>
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>AVG RESOLUTION SLA</span>
            <strong style={{ fontSize: 20 }}>{stats.avgSla}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Incidents List */}
        <Panel title="Incidents Dispatch Board" padded={false}>
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 600, overflowY: 'auto' }}>
            {incidents.map((i) => (
              <div
                key={i.id}
                onClick={() => {
                  setSelectedIncidentId(i.id);
                  setIsSealUnlocked(false);
                }}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border-soft)',
                  cursor: 'pointer',
                  backgroundColor: i.id === selectedIncidentId ? 'var(--panel-2)' : 'transparent',
                  borderLeft: i.id === selectedIncidentId ? '3px solid var(--green)' : '3px solid transparent',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: 13, color: 'var(--text-3)' }}>{i.id}</strong>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{i.vehicleNo}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
                  <span style={{ color: 'var(--text-2)' }}>Type: {i.type}</span>
                  <Badge tone={getSeverityTone(i.severity)}>{i.severity}</Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
                  <span>Driver: {i.driver}</span>
                  <span>{i.date} {i.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Right Column: Incident 360 Console */}
        {selectedIncident ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header Telematics Timeline & Dashcam player */}
            <Panel title={`Telemetry & Bounding Box Feed: ${selectedIncident.id}`} padded={false}>
              <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Visual Telematics Line Chart (60s speed strip) */}
                <Panel title="60s Speed Telematics Sparkline (Pre-Event)" subtitle={`Location Coordinates: ${selectedIncident.location}`} style={{ height: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    
                    {/* Visual speed graph using styled columns */}
                    <div style={{ 
                      height: 140, 
                      backgroundColor: 'var(--void)', 
                      borderRadius: 8, 
                      border: '1px solid var(--border)', 
                      display: 'flex', 
                      alignItems: 'flex-end', 
                      justifyContent: 'space-between',
                      padding: '20px 10px 10px 10px'
                    }}>
                      {selectedIncident.speedBeforeEvent.map((speed, idx) => (
                        <div 
                          key={idx} 
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '9%',
                            height: '100%',
                            justifyContent: 'flex-end'
                          }}
                        >
                          <span style={{ fontSize: 8, color: 'var(--text-2)', marginBottom: 4, fontFamily: 'var(--font-family-mono)' }}>{speed}</span>
                          <div 
                            style={{ 
                              width: '100%', 
                              height: `${(speed / 90) * 100}%`, 
                              backgroundColor: idx === 8 ? 'var(--red)' : speed > 60 ? 'var(--amber)' : 'var(--green)',
                              borderRadius: '2px 2px 0 0',
                              boxShadow: idx === 8 ? '0 0 10px var(--red)' : 'none'
                            }} 
                          />
                        </div>
                      ))}
                    </div>

                    {/* Timeline labels */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-family-mono)' }}>
                      {selectedIncident.speedTimelineLabels.map((lbl, idx) => (
                        <span key={idx} style={{ width: '9%', textAlign: 'center' }}>{lbl}</span>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4, fontSize: 12 }}>
                      <div style={{ padding: 10, backgroundColor: 'var(--panel-2)', borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                        <span style={{ color: 'var(--text-3)', display: 'block', fontSize: 10 }}>SPEED PRIOR COLLISION</span>
                        <strong>{selectedIncident.speedBeforeEvent[5]} km/h</strong>
                      </div>
                      <div style={{ padding: 10, backgroundColor: 'var(--panel-2)', borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                        <span style={{ color: 'var(--text-3)', display: 'block', fontSize: 10 }}>VEHICLE TELEMATICS STATUS</span>
                        <strong style={{ color: 'var(--red)' }}>IMPACT SHOCK ERROR (0G)</strong>
                      </div>
                    </div>
                  </div>
                </Panel>

                {/* Dashcam Video player simulator */}
                <Panel title="Dashcam Bounding Box Clips" padded={false} style={{ height: '100%' }}>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', height: 160, backgroundColor: 'black' }}>
                      <img 
                        src={selectedIncident.dashcamThumb} 
                        alt="Dashcam thumbnail" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isPlaying ? 0.9 : 0.6 }}
                      />
                      
                      {/* Play overlay overlay */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isPlaying ? 'transparent' : 'rgba(0,0,0,0.4)'
                      }}>
                        <Button 
                          onClick={handlePlaySimulate}
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            backgroundColor: 'var(--green)',
                            color: 'var(--void)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                          }}
                        >
                          {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 3 }} />}
                        </Button>
                      </div>

                      {/* Video logs info overlay */}
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        fontSize: 9,
                        color: 'white',
                        fontFamily: 'var(--font-family-mono)',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        padding: '2px 6px',
                        borderRadius: 3
                      }}>
                        CAM-01 FRONT • Speed: {isPlaying ? Math.max(0, 60 - playbackTime) : selectedIncident.speedBeforeEvent[6]} km/h
                      </div>

                      {/* Progress bar */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        backgroundColor: 'var(--border-soft)'
                      }}>
                        <div style={{
                          height: '100%',
                          backgroundColor: 'var(--green)',
                          width: `${(playbackTime / 60) * 100}%`
                        }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifySelf: 'flex-end', fontSize: 11, color: 'var(--text-3)' }}>
                      <span>Footage timeframe: <strong>-30s to +10s of Collision event</strong></span>
                    </div>
                  </div>
                </Panel>
              </div>
            </Panel>

            {/* Four Track Tabs Navigation */}
            <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border-soft)', paddingBottom: 1 }}>
              <button 
                onClick={() => setActiveTrackTab('emergency')}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTrackTab === 'emergency' ? '2px solid var(--green)' : 'none',
                  color: activeTrackTab === 'emergency' ? 'var(--text-1)' : 'var(--text-3)',
                  fontWeight: activeTrackTab === 'emergency' ? 600 : 500,
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                Track 1: Emergency SOS
              </button>
              <button 
                onClick={() => setActiveTrackTab('legal')}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTrackTab === 'legal' ? '2px solid var(--green)' : 'none',
                  color: activeTrackTab === 'legal' ? 'var(--text-1)' : 'var(--text-3)',
                  fontWeight: activeTrackTab === 'legal' ? 600 : 500,
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                Track 2: Legal & FIR
              </button>
              <button 
                onClick={() => setActiveTrackTab('insurance')}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTrackTab === 'insurance' ? '2px solid var(--green)' : 'none',
                  color: activeTrackTab === 'insurance' ? 'var(--text-1)' : 'var(--text-3)',
                  fontWeight: activeTrackTab === 'insurance' ? 600 : 500,
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                Track 3: Claims Linkage
              </button>
              <button 
                onClick={() => setActiveTrackTab('rca')}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTrackTab === 'rca' ? '2px solid var(--green)' : 'none',
                  color: activeTrackTab === 'rca' ? 'var(--text-1)' : 'var(--text-3)',
                  fontWeight: activeTrackTab === 'rca' ? 600 : 500,
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                Track 4: Internal RCA
              </button>
            </div>

            {/* TAB PANELS */}

            {/* Track 1: Emergency SOS */}
            {activeTrackTab === 'emergency' && (
              <Panel title="SOS Emergency Protocol Checklist" subtitle="Perform instant coordination check lists">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>EMERGENCY SEQUENCE STATUS</div>
                    {[
                      { label: 'Dispatch location tracking active ping check', done: true },
                      { label: 'Connect driver cellular/SAT-COM call', done: true },
                      { label: 'Trigger ambulance dispatch alert', done: false },
                      { label: 'Notify nearest depot recovery vehicles', done: false }
                    ].map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, backgroundColor: 'var(--panel-2)', borderRadius: 6, border: '1px solid var(--border-soft)', fontSize: 13 }}>
                        <span style={{ color: step.done ? 'var(--green)' : 'var(--amber)' }}>{step.done ? '✓' : '•'}</span>
                        <span style={{ color: step.done ? 'var(--text-3)' : 'var(--text-1)' }}>{step.label}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>BIG ACTIONS DISPATCH BOARD</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Button variant="danger" style={{ height: 50, display: 'flex', flexWrap: 'wrap', gap: 4 }} icon={<Phone size={15} style={{ marginRight: 6 }} />} onClick={() => handleTriggerAction(`Driver (${selectedIncident.driver})`)}>
                        Call Driver <br/><span style={{ fontSize: 9, opacity: 0.8 }}>{selectedIncident.driverPhone}</span>
                      </Button>
                      <Button variant="danger" style={{ height: 50 }} icon={<Phone size={15} style={{ marginRight: 6 }} />} onClick={() => handleTriggerAction('Nearest Ambulance Hub')}>
                        Call Ambulance
                      </Button>
                      <Button variant="primary" style={{ height: 50 }} icon={<Phone size={15} style={{ marginRight: 6 }} />} onClick={() => handleTriggerAction('Local Police Authority')}>
                        Call Police
                      </Button>
                      <Button variant="subtle" style={{ height: 50 }} icon={<Phone size={15} style={{ marginRight: 6 }} />} onClick={() => handleTriggerAction('Depot Recovery Crane')}>
                        Call Recovery
                      </Button>
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {/* Track 2: Legal */}
            {activeTrackTab === 'legal' && (
              <Panel title="Legal Snapshots & FIR Documentation">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <span style={{ color: 'var(--text-3)', fontSize: 11, display: 'block' }}>FIR RECORD STATUS</span>
                      <strong>{selectedIncident.firStatus}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-3)', fontSize: 11, display: 'block' }}>FIR NUMBER REFERENCE</span>
                      <strong>{selectedIncident.firNumber || 'Pending Filing'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-3)', fontSize: 11, display: 'block' }}>INVESTIGATION NOTES SEAL</span>
                      <Badge tone="blue">Investigation Phase-01 Open</Badge>
                    </div>
                  </div>

                  {/* Sealed-snapshot viewer */}
                  <div style={{
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: 20,
                    backgroundColor: 'var(--void)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 160,
                    textAlign: 'center'
                  }}>
                    {isSealUnlocked ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', fontSize: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-soft)', paddingBottom: 6 }}>
                          <strong>Police Dispatch Memo</strong>
                          <span style={{ color: 'var(--text-3)' }}>10:45 AM</span>
                        </div>
                        <p style={{ color: 'var(--text-2)', textAlign: 'left', margin: 0 }}>
                          Patrol unit #42 verified driver breath analysis report (Negative). Highway speed recorder calibration sheet matched. Vehicle towed to depot hub under provisional release bond.
                        </p>
                        <Button size="sm" onClick={() => setIsSealUnlocked(false)} style={{ alignSelf: 'flex-end', marginTop: 10 }}>Lock Seal</Button>
                      </div>
                    ) : (
                      <>
                        <Key size={24} style={{ color: 'var(--amber)', marginBottom: 8 }} />
                        <strong style={{ fontSize: 13 }}>Police Report Sealed Snapshot</strong>
                        <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '4px 0 12px 0' }}>Requires authorization compliance clearance to open official notes</p>
                        <Button size="sm" variant="primary" onClick={() => setIsSealUnlocked(true)}>Unlock Bounded Seal</Button>
                      </>
                    )}
                  </div>
                </div>
              </Panel>
            )}

            {/* Track 3: Insurance claims linkage */}
            {activeTrackTab === 'insurance' && (
              <Panel title="Insurance Claims Linkage" subtitle="Verify active claim filings for the incident event">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {selectedIncident.linkedClaimNo ? (
                    <div style={{ 
                      padding: 16, 
                      backgroundColor: 'var(--panel-2)', 
                      borderRadius: 8, 
                      border: '1px solid var(--border-soft)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Shield size={16} color="var(--green)" />
                          <strong style={{ fontSize: 14 }}>{selectedIncident.linkedClaimNo}</strong>
                          <Badge tone="blue">Survey Phase</Badge>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginTop: 6 }}>
                          Claim estimation linked directly to collision incident {selectedIncident.id}
                        </span>
                      </div>
                      <Button size="sm" variant="subtle" icon={<FileText size={12} style={{ marginRight: 4 }} />}>
                        Claims Workspace
                      </Button>
                    </div>
                  ) : (
                    <div style={{ 
                      padding: 16, 
                      backgroundColor: 'rgba(232, 163, 61, 0.04)', 
                      borderRadius: 8, 
                      border: '1px solid rgba(232, 163, 61, 0.15)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <strong>No insurance claim linked yet.</strong>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginTop: 4 }}>
                          File claim directly based on telemetry collision logs
                        </span>
                      </div>
                      <Button size="sm" variant="primary" onClick={() => notify('success', 'Claims documentation initiated. Draft policy link generated.')}>
                        Initiate Claim Filing
                      </Button>
                    </div>
                  )}
                </div>
              </Panel>
            )}

            {/* Track 4: RCA (Root Cause Analysis) */}
            {activeTrackTab === 'rca' && (
              <Panel title="Internal Root Cause Analysis (RCA)" subtitle="Analyze failure factors and preventive steps">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>PRIMARY CAUSE SECTOR</span>
                      <select 
                        value={selectedIncident.rcaCause}
                        onChange={(e) => handleRcaSave('cause', e.target.value)}
                        className="adm-input" 
                        style={{ width: '100%', fontSize: 12 }}
                      >
                        <option value="Equipment Fail - Brake Caliper Lockup">Equipment Fail - Brake Caliper Lockup</option>
                        <option value="Coolant Hose Rupture">Coolant Hose Rupture</option>
                        <option value="Unauthorized Cargo Intercept">Unauthorized Cargo Intercept</option>
                        <option value="Driver Error - Lane Oversteer">Driver Error - Lane Oversteer</option>
                        <option value="Environmental - Low Visibility Fog">Environmental - Low Visibility Fog</option>
                      </select>
                    </div>
                    <div>
                      <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>RTO / AUDIT CLASSIFICATION</span>
                      <input 
                        type="text" 
                        value="Category-A Collision Audit"
                        readOnly 
                        className="adm-input" 
                        style={{ width: '100%', fontSize: 12, backgroundColor: 'var(--panel-2)' }} 
                      />
                    </div>
                  </div>

                  <div>
                    <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>RCA WORKSHOP FINDINGS LOG</span>
                    <textarea 
                      value={selectedIncident.rcaFindings}
                      onChange={(e) => handleRcaSave('findings', e.target.value)}
                      className="adm-input"
                      style={{ width: '100%', height: 80, fontSize: 12, resize: 'none', padding: '8px 12px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>CORRECTIVE ACTION LOG (IMMEDIATE)</span>
                      <textarea 
                        value={selectedIncident.rcaCorrective}
                        onChange={(e) => handleRcaSave('corrective', e.target.value)}
                        className="adm-input"
                        style={{ width: '100%', height: 60, fontSize: 12, resize: 'none', padding: '6px 12px' }}
                      />
                    </div>
                    <div>
                      <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>PREVENTIVE ACTION PLAN (SLA BARRIER)</span>
                      <textarea 
                        value={selectedIncident.rcaPreventive}
                        onChange={(e) => handleRcaSave('preventive', e.target.value)}
                        className="adm-input"
                        style={{ width: '100%', height: 60, fontSize: 12, resize: 'none', padding: '6px 12px' }}
                      />
                    </div>
                  </div>

                  <Button variant="primary" style={{ alignSelf: 'flex-end', marginTop: 4 }} onClick={handleRcaSubmit}>
                    Commit RCA Records
                  </Button>
                </div>
              </Panel>
            )}
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
            Select an incident event to review.
          </div>
        )}
      </div>
    </div>
  );
};
