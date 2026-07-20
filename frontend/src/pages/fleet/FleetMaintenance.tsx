import React, { useEffect, useState } from 'react';
import { 
  Wrench, ChevronRight
} from 'lucide-react';
import { Panel, Badge, Button, LoadingState, useToast } from '../../components/admin/ui';
import '../../styles/admin.css';

// Initial job cards list
const INITIAL_JOB_CARDS = [
  { id: 'JC-101', vehicle: 'GJ-01-XX-1122', issue: 'Engine Overheating / Coolant leak', mechanic: 'Vijay Patil', bay: 'Bay 1', state: 'Diagnosis', days: 2 },
  { id: 'JC-102', vehicle: 'DL-01-MC-9012', issue: 'FASTag Reader Replacement', mechanic: 'Ramesh Kumar', bay: 'Bay 2', state: 'Repairing', days: 1 },
  { id: 'JC-103', vehicle: 'DL-02-C-8877', issue: 'Front Tyre Replacement & Alignment', mechanic: 'Unassigned', bay: 'Bay 3', state: 'Waiting Parts', days: 4 },
  { id: 'JC-104', vehicle: 'HR-55-A-9901', issue: 'Scheduled PM - 40,000 km Service', mechanic: 'Amit Patel', bay: 'Bay 1', state: 'Done', days: 0 }
];

export const FleetMaintenance: React.FC = () => {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [jobCards, setJobCards] = useState(INITIAL_JOB_CARDS);
  const [activeTab, setActiveTab] = useState<'board' | 'pm'>('board');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  const handleMoveCard = (id: string, newState: string) => {
    setJobCards(prev => prev.map(jc => jc.id === id ? { ...jc, state: newState } : jc));
    notify('success', `Job card ${id} moved to ${newState}`);
  };

  if (loading) {
    return <LoadingState label="Loading Workshop Planner" />;
  }

  const columns = ['Diagnosis', 'Repairing', 'Waiting Parts', 'Done'];

  const pmSchedules = [
    { vehicle: 'DL-01-MA-1234', schedule: 'General Service (Monthly)', odometer: '45,320 km', dueIn: 'Due in 3 days', status: 'Pending' },
    { vehicle: 'MH-12-PQ-4321', schedule: 'Brake Pad Replacement', odometer: '88,901 km', dueIn: 'Due in 150 km', status: 'Warning' },
    { vehicle: 'GJ-01-XX-1122', schedule: 'Engine Oil Change', odometer: '1,20,402 km', dueIn: 'Overdue by 1,200 km', status: 'Overdue' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>Preventive Maintenance & Workshop</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>Plan PM intervals, schedule work order job cards and review bay workload.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-soft)', paddingBottom: 1 }}>
        <button 
          onClick={() => setActiveTab('board')}
          style={{
            padding: '10px 16px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'board' ? '2px solid var(--green)' : 'none',
            color: activeTab === 'board' ? 'var(--text-1)' : 'var(--text-3)',
            fontWeight: activeTab === 'board' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          Workshop Board
        </button>
        <button 
          onClick={() => setActiveTab('pm')}
          style={{
            padding: '10px 16px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'pm' ? '2px solid var(--green)' : 'none',
            color: activeTab === 'pm' ? 'var(--text-1)' : 'var(--text-3)',
            fontWeight: activeTab === 'pm' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          PM Planner Alerts
        </button>
      </div>

      {/* Content */}
      {activeTab === 'board' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {columns.map(col => {
            const cardsInCol = jobCards.filter(jc => jc.state === col);
            return (
              <div 
                key={col} 
                style={{ 
                  backgroundColor: 'var(--panel-1)', 
                  border: '1px solid var(--border-soft)', 
                  borderRadius: 8, 
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  minHeight: '400px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{col}</span>
                  <Badge tone="grey">{cardsInCol.length}</Badge>
                </div>

                {cardsInCol.map(card => (
                  <div 
                    key={card.id} 
                    style={{ 
                      backgroundColor: 'var(--panel-2)', 
                      border: '1px solid var(--border-soft)', 
                      borderRadius: 6, 
                      padding: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 13, color: 'var(--text-1)' }}>{card.vehicle}</strong>
                      <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{card.id}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{card.issue}</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, borderTop: '1px solid var(--border-soft)', paddingTop: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{card.bay} &middot; {card.mechanic}</span>
                      {card.days > 0 && <Badge tone="red">{card.days}d slow</Badge>}
                    </div>

                    {/* Move triggers */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                      {col === 'Diagnosis' && (
                        <button onClick={() => handleMoveCard(card.id, 'Repairing')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--green)', fontSize: 11, display: 'flex', alignItems: 'center' }}>
                          Start <ChevronRight size={12} />
                        </button>
                      )}
                      {col === 'Repairing' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleMoveCard(card.id, 'Waiting Parts')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--amber)', fontSize: 11 }}>Hold Parts</button>
                          <button onClick={() => handleMoveCard(card.id, 'Done')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--green)', fontSize: 11 }}>Finish</button>
                        </div>
                      )}
                      {col === 'Waiting Parts' && (
                        <button onClick={() => handleMoveCard(card.id, 'Repairing')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--green)', fontSize: 11 }}>Parts Arrived</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'pm' && (
        <Panel title="Preventive Maintenance Due Checklist">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pmSchedules.map((pm, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: 16, 
                  backgroundColor: 'var(--panel-2)', 
                  border: '1px solid var(--border-soft)', 
                  borderRadius: 6 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Wrench size={18} color={pm.status === 'Overdue' ? 'var(--red)' : (pm.status === 'Warning' ? 'var(--amber)' : 'var(--blue)')} />
                  <div>
                    <strong style={{ fontSize: 14 }}>{pm.vehicle}</strong> &middot; <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{pm.schedule} ({pm.odometer})</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--text-3)' }}>Interval target computed from telemetry logs.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Badge tone={pm.status === 'Overdue' ? 'red' : (pm.status === 'Warning' ? 'amber' : 'blue')}>
                    {pm.dueIn}
                  </Badge>
                  <Button size="sm" variant="primary" onClick={() => notify('success', `PM booked for ${pm.vehicle}`)}>
                    Schedule Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};
