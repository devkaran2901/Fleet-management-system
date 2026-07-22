import React, { useEffect, useState } from 'react';
import { workshopApi } from '../../services/workshopApi';
import type { JobCard } from '../../services/workshopApi';
import { Badge, LoadingState, ErrorState, Button, useToast } from '../../components/admin/ui';

const STAGES: JobCard['status'][] = [
  'Draft',
  'Open',
  'In Progress',
  'Waiting Parts',
  'QC',
  'Road Test',
  'Completed',
];

export const WorkshopBoard: React.FC = () => {
  const { notify } = useToast();
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workshopApi.getJobCards();
      setJobCards(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch job cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobCards();
  }, []);

  const moveStage = async (jc: JobCard, targetStage: JobCard['status']) => {
    try {
      await workshopApi.updateJobCard(jc.id, { status: targetStage });
      notify('success', `Moved ${jc.jobCardNumber} to ${targetStage}`);
      fetchJobCards();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to move stage');
    }
  };

  if (loading) return <LoadingState label="Loading Workshop Board" />;
  if (error) return <ErrorState message={error} onRetry={fetchJobCards} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
          Workshop Board (Kanban)
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
          Visual floor pipeline tracking vehicles across shop floor stages.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(220px, 1fr))', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
        {STAGES.map((stage) => {
          const cardsInStage = jobCards.filter((jc) => jc.status === stage);

          return (
            <div
              key={stage}
              style={{
                backgroundColor: 'var(--panel)',
                borderRadius: 8,
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 520,
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid var(--border-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--panel-2)',
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)' }}>{stage}</div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    backgroundColor: 'var(--void)',
                    color: 'var(--text-2)',
                    padding: '2px 8px',
                    borderRadius: 999,
                  }}
                >
                  {cardsInStage.length}
                </span>
              </div>

              {/* Column Body / Cards */}
              <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 10, flexGrow: 1, overflowY: 'auto' }}>
                {cardsInStage.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 20 }}>
                    Empty
                  </div>
                ) : (
                  cardsInStage.map((jc) => (
                    <div
                      key={jc.id}
                      style={{
                        backgroundColor: 'var(--panel-2)',
                        border: '1px solid var(--border-soft)',
                        borderRadius: 6,
                        padding: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)' }}>{jc.vehicleNumber}</span>
                        <Badge tone={jc.priority === 'CRITICAL' ? 'red' : jc.priority === 'HIGH' ? 'amber' : 'grey'}>
                          {jc.priority}
                        </Badge>
                      </div>

                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                        <span className="mono-label" style={{ fontSize: 9 }}>JC:</span> {jc.jobCardNumber}
                      </div>

                      <div style={{ fontSize: 11, color: 'var(--text-2)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div><strong>Bay:</strong> {jc.bayName || 'Unassigned'}</div>
                        <div><strong>Mechanic:</strong> {jc.mechanicName || 'Unassigned'}</div>
                        <div><strong>Est. Finish:</strong> Today 17:00</div>
                      </div>

                      {/* Workflow transition actions */}
                      <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                        {stage === 'Draft' && (
                          <Button variant="subtle" size="sm" onClick={() => moveStage(jc, 'Open')}>
                            Open →
                          </Button>
                        )}
                        {stage === 'Open' && (
                          <Button variant="subtle" size="sm" onClick={() => moveStage(jc, 'In Progress')}>
                            In Progress →
                          </Button>
                        )}
                        {stage === 'In Progress' && (
                          <>
                            <Button variant="subtle" size="sm" onClick={() => moveStage(jc, 'Waiting Parts')}>
                              Wait Parts
                            </Button>
                            <Button variant="subtle" size="sm" onClick={() => moveStage(jc, 'QC')}>
                              QC →
                            </Button>
                          </>
                        )}
                        {stage === 'Waiting Parts' && (
                          <Button variant="subtle" size="sm" onClick={() => moveStage(jc, 'In Progress')}>
                            Resume →
                          </Button>
                        )}
                        {stage === 'QC' && (
                          <Button variant="subtle" size="sm" onClick={() => moveStage(jc, 'Road Test')}>
                            Road Test →
                          </Button>
                        )}
                        {stage === 'Road Test' && (
                          <Button variant="subtle" size="sm" onClick={() => moveStage(jc, 'Completed')}>
                            Complete ✓
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
