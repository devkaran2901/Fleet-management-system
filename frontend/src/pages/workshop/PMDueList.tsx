import React, { useEffect, useState } from 'react';
import { Calendar, Lock, Unlock, Wrench } from 'lucide-react';
import { workshopApi } from '../../services/workshopApi';
import type { PmSchedule } from '../../services/workshopApi';
import {
  Panel,
  Button,
  Badge,
  Modal,
  LoadingState,
  ErrorState,
  Field,
  Input,
  useToast,
} from '../../components/admin/ui';

export const PMDueList: React.FC = () => {
  const { notify } = useToast();
  const [pmItems, setPmItems] = useState<PmSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [slotNegotiateItem, setSlotNegotiateItem] = useState<PmSchedule | null>(null);
  const [overrideItem, setOverrideItem] = useState<PmSchedule | null>(null);
  const [viewPmItem, setViewPmItem] = useState<PmSchedule | null>(null);

  // Slot Negotiation Form State
  const [proposedSlot, setProposedSlot] = useState('');
  const [confirmedSlot, setConfirmedSlot] = useState('');
  const [negotiationNotes, setNegotiationNotes] = useState('');

  // Override Form State
  const [overrideReason, setOverrideReason] = useState('');

  const fetchPmSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workshopApi.getPmSchedules();
      setPmItems(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch PM due list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPmSchedules();
  }, []);

  const handleCreateJobCard = async (pm: PmSchedule) => {
    try {
      const jc = await workshopApi.createJobCardFromPm(pm.id);
      notify('success', `Created ${jc.jobCardNumber} & Reserved PM Parts Kit for ${pm.vehicleNumber}`);
      fetchPmSchedules();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to create Job Card from PM');
    }
  };

  const handleSlotNegotiateSubmit = async () => {
    if (!slotNegotiateItem || !proposedSlot) {
      notify('error', 'Please provide proposed slot time');
      return;
    }
    try {
      await workshopApi.schedulePmSlot(slotNegotiateItem.id, {
        proposedSlot,
        confirmedSlot,
        notes: negotiationNotes,
      });
      notify('success', `Slot negotiation recorded with Dispatcher (R-04) for ${slotNegotiateItem.vehicleNumber}`);
      setSlotNegotiateItem(null);
      fetchPmSchedules();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to record slot negotiation');
    }
  };

  const handleOverrideSubmit = async () => {
    if (!overrideItem || !overrideReason) {
      notify('error', 'Please provide justification reason for AF-05 override');
      return;
    }
    try {
      await workshopApi.requestPmOverride(overrideItem.id, overrideReason);
      notify('success', `Maintenance Lock overridden via AF-05 for ${overrideItem.vehicleNumber}`);
      setOverrideItem(null);
      fetchPmSchedules();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to override lock');
    }
  };

  const parseSlotLog = (data: any) => {
    if (!data) return null;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
    return data;
  };

  if (loading) return <LoadingState label="Loading PM Due List" />;
  if (error) return <ErrorState message={error} onRetry={fetchPmSchedules} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
            PM Due List Management
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            Multi-trigger schedule engine (KM, Hours, Time, Condition, Statutory), recorded slot negotiation & maintenance locks.
          </p>
        </div>
        <Button variant="subtle" icon={<Calendar size={14} />} onClick={() => setCalendarOpen(true)}>
          Operational Calendar Overlay
        </Button>
      </div>

      {/* Table */}
      <Panel padded={false}>
        <div style={{ overflowX: 'auto' }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Vehicle Number</th>
                <th>Current Odo (KM)</th>
                <th>Due KM</th>
                <th>Due Date</th>
                <th>Trigger Type</th>
                <th>Status</th>
                <th>Slot Negotiation</th>
                <th>Auto JC #</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pmItems.map((pm) => {
                const slotInfo = parseSlotLog(pm.slotNegotiation);

                return (
                  <tr key={pm.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>{pm.vehicleNumber}</td>
                    <td>{pm.currentOdometer.toLocaleString()} KM</td>
                    <td>{pm.dueKm.toLocaleString()} KM</td>
                    <td style={{ fontSize: 12 }}>{new Date(pm.dueDate).toLocaleDateString()}</td>
                    <td>
                      <Badge tone="blue">{pm.triggerType}</Badge>
                    </td>
                    <td>
                      {pm.maintenanceLock ? (
                        <Badge tone="red">
                          <Lock size={10} style={{ marginRight: 4 }} /> Maintenance Lock
                        </Badge>
                      ) : pm.status === 'Overdue' ? (
                        <Badge tone="amber">Overdue</Badge>
                      ) : pm.status === 'Grace' ? (
                        <Badge tone="grey">In Grace</Badge>
                      ) : (
                        <Badge tone="green">{pm.status}</Badge>
                      )}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {slotInfo?.confirmedSlot ? (
                        <span style={{ color: 'var(--green)', fontWeight: 600 }}>{slotInfo.confirmedSlot}</span>
                      ) : slotInfo?.proposedSlot ? (
                        <span style={{ color: 'var(--amber)' }}>Prop: {slotInfo.proposedSlot}</span>
                      ) : (
                        <span style={{ color: 'var(--text-3)' }}>Not Negotiated</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{pm.autoJobCardId || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Button variant="ghost" size="sm" onClick={() => setViewPmItem(pm)}>
                          View
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setSlotNegotiateItem(pm)}>
                          Negotiate Slot
                        </Button>
                        {!pm.autoJobCardId && (
                          <Button variant="primary" size="sm" icon={<Wrench size={12} />} onClick={() => handleCreateJobCard(pm)}>
                            Create Job Card
                          </Button>
                        )}
                        {pm.maintenanceLock && (
                          <Button variant="danger" size="sm" icon={<Unlock size={12} />} onClick={() => setOverrideItem(pm)}>
                            AF-05 Override
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* --- View PM Item Detail Modal --- */}
      {viewPmItem && (
        <Modal open title={`PM Due Detail — ${viewPmItem.vehicleNumber}`} onClose={() => setViewPmItem(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, backgroundColor: 'var(--panel-2)', padding: 14, borderRadius: 8 }}>
              <div>
                <span className="mono-label" style={{ fontSize: 9 }}>TRIGGER TYPE</span>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{viewPmItem.triggerType}</div>
              </div>
              <div>
                <span className="mono-label" style={{ fontSize: 9 }}>LOCK STATUS</span>
                <div>
                  {viewPmItem.maintenanceLock ? <Badge tone="red">MAINTENANCE LOCK ACTIVE</Badge> : <Badge tone="green">Normal</Badge>}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><strong>Current Odometer:</strong> {viewPmItem.currentOdometer.toLocaleString()} KM</div>
              <div><strong>Due Interval KM:</strong> {viewPmItem.dueKm.toLocaleString()} KM</div>
              <div><strong>Target Due Date:</strong> {new Date(viewPmItem.dueDate).toLocaleDateString()}</div>
              <div><strong>Associated JC:</strong> {viewPmItem.autoJobCardId || 'None'}</div>
            </div>

            <div style={{ border: '1px solid var(--border-soft)', padding: 12, borderRadius: 6 }}>
              <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>RECORDED ARBITRATION (R-06 ↔ R-04 DISPATCHER)</span>
              <p style={{ fontSize: 12, margin: '6px 0 0 0', color: 'var(--text-1)' }}>
                Slot negotiation logs establish transparent accountability between workshop slot availability and dispatch fleet allocation commitments.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* --- Recorded Slot Negotiation Modal --- */}
      {slotNegotiationModal(slotNegotiateItem, setSlotNegotiateItem, proposedSlot, setProposedSlot, confirmedSlot, setConfirmedSlot, negotiationNotes, setNegotiationNotes, handleSlotNegotiateSubmit)}

      {/* --- AF-05 Override Modal --- */}
      {overrideItem && (
        <Modal open title={`AF-05 PM Lock Override — ${overrideItem.vehicleNumber}`} onClose={() => setOverrideItem(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 6, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <strong style={{ color: '#ef4444' }}>Maintenance Lock Override (BR-MNT-01)</strong>
              <p style={{ fontSize: 12, margin: '4px 0 0 0', color: 'var(--text-1)' }}>
                Vehicle has passed maintenance grace. Overriding will unblock Dispatcher allocation. Overriding requires AF-05 approval authorization.
              </p>
            </div>

            <Field label="Override Justification & Next Slot Commitment">
              <Input
                placeholder="Enter justification (e.g. Critical customer shipment commit, PM rescheduled for tomorrow 08:00)"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
              />
            </Field>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
              <Button variant="ghost" onClick={() => setOverrideItem(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleOverrideSubmit}>Submit AF-05 Override</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- Operational Calendar Overlay Modal --- */}
      {calendarOpen && (
        <Modal open wide title="Operational Calendar Overlay (PM & Dispatch Capacity)" onClose={() => setCalendarOpen(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
              7-15 Day continuous PM maintenance horizon overlaid with Dispatcher trip demand commitments.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, textAlign: 'center' }}>
              {['Mon (Today)', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <div key={day} style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-1)' }}>{day}</div>
                  <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 4 }}>Bays Avail: {4 - (idx % 3)}</div>
                  <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 2 }}>PM Scheduled: {idx + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

function slotNegotiationModal(
  item: PmSchedule | null,
  setItem: (item: PmSchedule | null) => void,
  proposedSlot: string,
  setProposedSlot: (s: string) => void,
  confirmedSlot: string,
  setConfirmedSlot: (s: string) => void,
  notes: string,
  setNotes: (n: string) => void,
  handleSubmit: () => void
) {
  if (!item) return null;
  return (
    <Modal open title={`Recorded Slot Negotiation — ${item.vehicleNumber}`} onClose={() => setItem(null)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
          Record arbitration between Workshop Manager (R-06) and Fleet Dispatcher (R-04) for vehicle release.
        </p>

        <Field label="Proposed Workshop Slot">
          <Input placeholder="e.g. 2026-07-23 09:00 - 13:00" value={proposedSlot} onChange={(e) => setProposedSlot(e.target.value)} />
        </Field>

        <Field label="Dispatcher Confirmed Release Slot">
          <Input placeholder="e.g. 2026-07-23 09:30 - 13:30 (Confirmed)" value={confirmedSlot} onChange={(e) => setConfirmedSlot(e.target.value)} />
        </Field>

        <Field label="Arbitration Log Notes">
          <Input placeholder="e.g. Release agreed after Trip T-991 completion at Hub 01" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
          <Button variant="ghost" onClick={() => setItem(null)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Record Arbitration</Button>
        </div>
      </div>
    </Modal>
  );
}
