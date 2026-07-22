import React, { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { workshopApi } from '../../services/workshopApi';
import type { WorkshopMechanic } from '../../services/workshopApi';
import {
  Panel,
  Button,
  Badge,
  Modal,
  LoadingState,
  ErrorState,
  Field,
  Input,
  Select,
  useToast,
} from '../../components/admin/ui';

export const MechanicRoster: React.FC = () => {
  const { notify } = useToast();
  const [mechanics, setMechanics] = useState<WorkshopMechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [assignMech, setAssignMech] = useState<WorkshopMechanic | null>(null);
  const [targetJobCard, setTargetJobCard] = useState('');
  const [targetBay, setTargetBay] = useState('');

  const fetchMechanics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workshopApi.getMechanics();
      setMechanics(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch mechanic roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  const handleAssignSubmit = async () => {
    if (!assignMech) return;
    try {
      await workshopApi.assignMechanic(assignMech.id, {
        jobCardNumber: targetJobCard || undefined,
        bayName: targetBay || undefined,
      });
      notify('success', `Assigned ${assignMech.name} to Job Card ${targetJobCard || '—'}`);
      setAssignMech(null);
      fetchMechanics();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to assign mechanic');
    }
  };

  if (loading) return <LoadingState label="Loading Mechanic Roster" />;
  if (error) return <ErrorState message={error} onRetry={fetchMechanics} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
          Mechanic Roster & Productivity
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
          Floor technician skills matrix, active bay assignments, and labor productivity tracking.
        </p>
      </div>

      {/* Table */}
      <Panel padded={false}>
        <div style={{ overflowX: 'auto' }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Mechanic Name</th>
                <th>Skill Specialization</th>
                <th>Current Job Card</th>
                <th>Assigned Bay</th>
                <th>Status</th>
                <th>Productivity</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mechanics.map((mech) => (
                <tr key={mech.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>{mech.name}</td>
                  <td>
                    <Badge tone="blue">{mech.skill}</Badge>
                  </td>
                  <td style={{ fontWeight: 600 }}>{mech.currentJobCardId || 'None (Available)'}</td>
                  <td>{mech.assignedBay || 'Unassigned'}</td>
                  <td>
                    <Badge tone={mech.status === 'Available' ? 'green' : mech.status === 'Busy' ? 'amber' : 'grey'}>
                      {mech.status}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 80,
                          height: 6,
                          backgroundColor: 'var(--panel-2)',
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${mech.productivity}%`,
                            height: '100%',
                            backgroundColor: mech.productivity >= 90 ? 'var(--green)' : '#f59e0b',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{mech.productivity}%</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button variant="ghost" size="sm" icon={<UserPlus size={12} />} onClick={() => {
                      setAssignMech(mech);
                      setTargetJobCard(mech.currentJobCardId || '');
                      setTargetBay(mech.assignedBay || '');
                    }}>
                      Assign Job Card
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Assign Modal */}
      {assignMech && (
        <Modal open title={`Assign Job Card — ${assignMech.name}`} onClose={() => setAssignMech(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Job Card #">
              <Input placeholder="e.g. JC-2026-001" value={targetJobCard} onChange={(e) => setTargetJobCard(e.target.value)} />
            </Field>

            <Field label="Assigned Bay">
              <Select value={targetBay} onChange={(e) => setTargetBay(e.target.value)}>
                <option value="">-- Select Bay --</option>
                <option value="Bay 01 - Heavy Repair">Bay 01 - Heavy Repair</option>
                <option value="Bay 02 - Quick Service">Bay 02 - Quick Service</option>
                <option value="Bay 03 - Electrical & HVAC">Bay 03 - Electrical & HVAC</option>
                <option value="Bay 04 - PM Service">Bay 04 - PM Service</option>
                <option value="Bay 05 - Transmission & Axle">Bay 05 - Transmission & Axle</option>
                <option value="Bay 06 - Inspection">Bay 06 - Inspection</option>
              </Select>
            </Field>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
              <Button variant="ghost" onClick={() => setAssignMech(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleAssignSubmit}>Confirm Assignment</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
