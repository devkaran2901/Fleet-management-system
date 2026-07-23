import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { workshopApi } from '../../services/workshopApi';
import type { Estimate } from '../../services/workshopApi';
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

export const Estimates: React.FC = () => {
  const { notify } = useToast();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [viewEst, setViewEst] = useState<Estimate | null>(null);

  // Form State
  const [jobCardId, setJobCardId] = useState('JC-2026-001');
  const [vehicleNumber, setVehicleNumber] = useState('MH-12-AB-1234');
  const [labourCost, setLabourCost] = useState<number>(3500);
  const [partsCost, setPartsCost] = useState<number>(4500);
  const [outsideWorkCost, setOutsideWorkCost] = useState<number>(0);

  const fetchEstimates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workshopApi.getEstimates();
      setEstimates(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch estimates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  const handleCreateEstimate = async () => {
    if (!jobCardId || !vehicleNumber) {
      notify('error', 'Please provide Job Card # and Vehicle Number');
      return;
    }
    try {
      const est = await workshopApi.createEstimate({
        jobCardId,
        vehicleNumber: vehicleNumber.toUpperCase(),
        labourCost,
        partsCost,
        outsideWorkCost,
      });

      if (est.approvalStatus === 'Approved') {
        notify('success', `Estimate ${est.estimateNumber} Auto-Approved (≤ ₹10,000 threshold)`);
      } else {
        notify('info', `Estimate ${est.estimateNumber} Submitted for Approval (> ₹10,000 threshold)`);
      }

      setCreateOpen(false);
      fetchEstimates();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to create estimate');
    }
  };

  const handleReapproval = async (est: Estimate) => {
    try {
      await workshopApi.updateEstimate(est.id, {
        approvalStatus: 'PendingApproval',
      });
      notify('info', `Estimate ${est.estimateNumber} re-submitted for approval after revision/threshold breach`);
      fetchEstimates();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to re-submit estimate');
    }
  };

  const parseTimeline = (data: any) => {
    if (!data) return [];
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return data;
  };

  if (loading) return <LoadingState label="Loading Estimate Builder" />;
  if (error) return <ErrorState message={error} onRetry={fetchEstimates} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
            Maintenance Estimate Builder
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            Labour, Parts, Outside Work breakdown with threshold auto-approvals (≤ ₹10K) and technical sign-off.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
          Create Estimate
        </Button>
      </div>

      {/* Table */}
      <Panel padded={false}>
        <div style={{ overflowX: 'auto' }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Estimate #</th>
                <th>Job Card #</th>
                <th>Vehicle Number</th>
                <th>Labour (₹)</th>
                <th>Parts (₹)</th>
                <th>Outside Work (₹)</th>
                <th>Taxes (18%)</th>
                <th>Total Estimate (₹)</th>
                <th>Technical Approval</th>
                <th>Approval Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {estimates.map((est) => (
                <tr key={est.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>{est.estimateNumber}</td>
                  <td style={{ fontWeight: 600 }}>{est.jobCardId}</td>
                  <td>{est.vehicleNumber}</td>
                  <td>₹{est.labourCost.toLocaleString()}</td>
                  <td>₹{est.partsCost.toLocaleString()}</td>
                  <td>₹{est.outsideWorkCost.toLocaleString()}</td>
                  <td>₹{est.tax.toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>₹{est.totalAmount.toLocaleString()}</td>
                  <td>
                    <Badge tone="green">Passed</Badge>
                  </td>
                  <td>
                    <Badge tone={est.approvalStatus === 'Approved' ? 'green' : 'amber'}>
                      {est.approvalStatus}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Button variant="ghost" size="sm" onClick={() => setViewEst(est)}>
                        Timeline
                      </Button>
                      {est.approvalStatus === 'PendingApproval' && (
                        <Button variant="subtle" size="sm" icon={<RefreshCw size={12} />} onClick={() => handleReapproval(est)}>
                          Re-submit
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* --- View Approval Timeline Modal --- */}
      {viewEst && (
        <Modal open title={`Approval Timeline — ${viewEst.estimateNumber}`} onClose={() => setViewEst(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6 }}>
              <div>
                <span className="mono-label" style={{ fontSize: 9 }}>TOTAL ESTIMATE</span>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>₹{viewEst.totalAmount.toLocaleString()}</div>
              </div>
              <div>
                <span className="mono-label" style={{ fontSize: 9 }}>APPROVAL RULE APPLIED</span>
                <div>
                  {viewEst.totalAmount <= 10000 ? (
                    <Badge tone="green">≤ ₹10K Auto Approval</Badge>
                  ) : (
                    <Badge tone="amber">&gt; ₹10K Approval Required</Badge>
                  )}
                </div>
              </div>
            </div>

            <h4 style={{ margin: '8px 0 0 0', fontSize: 13, color: 'var(--text-1)' }}>Workflow Sign-off Log</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {parseTimeline(viewEst.approvalTimeline).map((item: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: 10,
                    backgroundColor: 'var(--panel-2)',
                    borderRadius: 6,
                    border: '1px solid var(--border-soft)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{item.role}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{item.status}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* --- Create Estimate Modal --- */}
      <Modal open={createOpen} title="Create Maintenance Estimate" onClose={() => setCreateOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Job Card #">
              <Input value={jobCardId} onChange={(e) => setJobCardId(e.target.value)} />
            </Field>
            <Field label="Vehicle Registration #">
              <Input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="Labour Cost (₹)">
              <Input type="number" value={labourCost} onChange={(e) => setLabourCost(Number(e.target.value))} />
            </Field>
            <Field label="Parts Cost (₹)">
              <Input type="number" value={partsCost} onChange={(e) => setPartsCost(Number(e.target.value))} />
            </Field>
            <Field label="Outside Work (₹)">
              <Input type="number" value={outsideWorkCost} onChange={(e) => setOutsideWorkCost(Number(e.target.value))} />
            </Field>
          </div>

          <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: 600 }}>₹{(labourCost + partsCost + outsideWorkCost).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
              <span>GST / Tax (18%):</span>
              <span style={{ fontWeight: 600 }}>₹{((labourCost + partsCost + outsideWorkCost) * 0.18).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border-soft)' }}>
              <span>Total Estimate:</span>
              <span>₹{((labourCost + partsCost + outsideWorkCost) * 1.18).toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateEstimate}>Submit Estimate</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
