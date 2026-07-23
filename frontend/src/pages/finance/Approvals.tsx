import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Eye, Filter, RefreshCw } from 'lucide-react';
import { financeApi } from '../../services/financeApi';
import type { FinancialApprovalRecord } from '../../services/financeApi';
import { Panel, Button, Badge, Input, Select, Modal, LoadingState, ErrorState, useToast } from '../../components/admin/ui';

export const Approvals: React.FC = () => {
  const [approvals, setApprovals] = useState<FinancialApprovalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<FinancialApprovalRecord | null>(null);
  const [rejectModal, setRejectModal] = useState<FinancialApprovalRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approveComment, setApproveComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useToast();

  // Filters
  const [flowFilter, setFlowFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.getApprovals({
        flowCode: flowFilter || undefined,
        status: statusFilter || undefined,
      });
      setApprovals(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load financial approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, [flowFilter, statusFilter]);

  const handleApprove = async (id: string) => {
    try {
      setSubmitting(true);
      await financeApi.approveFinancialApproval(id, approveComment || 'Approved by R-14 Finance Manager');
      notify('success', 'Approval granted successfully');
      setSelectedApproval(null);
      setApproveComment('');
      loadApprovals();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to approve request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal || !rejectReason.trim()) {
      notify('error', 'Please provide a valid rejection reason');
      return;
    }
    try {
      setSubmitting(true);
      await financeApi.rejectFinancialApproval(rejectModal.id, rejectReason);
      notify('info', `Approval request ${rejectModal.approvalNumber} rejected`);
      setRejectModal(null);
      setRejectReason('');
      loadApprovals();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to reject approval request');
    } finally {
      setSubmitting(false);
    }
  };

  const parseJson = (val: any) => {
    if (!val) return [];
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return val;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
            Financial Approvals Workbench
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            PRD Approvals: AF-07 (Vendor Bill Signoff) & AF-11 (Budget Exception Reallocation).
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" icon={<RefreshCw size={14} />} onClick={loadApprovals}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Panel padded={false} style={{ backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', padding: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={15} color="var(--text-3)" />
          <span className="mono-label" style={{ fontSize: 10 }}>FILTERS:</span>
          
          <Select value={flowFilter} onChange={(e) => setFlowFilter(e.target.value)} style={{ width: 220 }}>
            <option value="">All PRD Approval Flows</option>
            <option value="AF-07">AF-07 Vendor Bill Approval</option>
            <option value="AF-11">AF-11 Budget Exception</option>
          </Select>

          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 140 }}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </Select>

          {(flowFilter || statusFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFlowFilter('');
                setStatusFilter('');
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </Panel>

      {/* Approvals Table */}
      {loading ? (
        <LoadingState label="Loading Approvals Queue" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadApprovals} />
      ) : (
        <Panel padded={false}>
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Approval # / Flow</th>
                  <th>Target Entity Ref</th>
                  <th>Amount</th>
                  <th>Requested By</th>
                  <th>Reason / Context</th>
                  <th>Status</th>
                  <th>Requested Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvals.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--text-3)' }}>
                      No approval requests match the specified filters.
                    </td>
                  </tr>
                ) : (
                  approvals.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{a.approvalNumber}</div>
                        <Badge tone={a.flowCode === 'AF-07' ? 'blue' : 'amber'}>{a.flowCode} · {a.flowName}</Badge>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, color: 'var(--text-1)' }}>{a.entityRef}</span>
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{a.amount.toLocaleString()}</td>
                      <td>
                        <span style={{ fontSize: 12 }}>{a.requestedBy}</span>
                      </td>
                      <td style={{ maxWidth: 260 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {a.reason}
                        </span>
                      </td>
                      <td>
                        <Badge tone={a.status === 'Approved' ? 'green' : a.status === 'Rejected' ? 'red' : 'amber'}>
                          {a.status}
                        </Badge>
                      </td>
                      <td>
                        <span style={{ fontSize: 11 }}>{new Date(a.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye size={13} />}
                            onClick={() => setSelectedApproval(a)}
                          >
                            Details
                          </Button>
                          {a.status === 'Pending' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                icon={<CheckCircle2 size={13} />}
                                onClick={() => handleApprove(a.id)}
                                disabled={submitting}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                icon={<XCircle size={13} />}
                                onClick={() => setRejectModal(a)}
                                disabled={submitting}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Approval Detail Modal */}
      {selectedApproval && (
        <Modal
          open={!!selectedApproval}
          title={`Financial Approval — ${selectedApproval.approvalNumber}`}
          subtitle={`${selectedApproval.flowCode} ${selectedApproval.flowName} · ${selectedApproval.entityRef}`}
          onClose={() => setSelectedApproval(null)}
          wide
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button variant="ghost" onClick={() => setSelectedApproval(null)}>Close</Button>
              {selectedApproval.status === 'Pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="danger" onClick={() => { setSelectedApproval(null); setRejectModal(selectedApproval); }}>
                    Reject Request
                  </Button>
                  <Button variant="primary" icon={<CheckCircle2 size={14} />} onClick={() => handleApprove(selectedApproval.id)} disabled={submitting}>
                    Approve Request
                  </Button>
                </div>
              )}
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>REQUEST AMOUNT</span>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: 'var(--text-1)' }}>
                  ₹{selectedApproval.amount.toLocaleString()}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>REQUESTED BY</span>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                  {selectedApproval.requestedBy}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>APPROVAL STATUS</span>
                <div style={{ marginTop: 4 }}>
                  <Badge tone={selectedApproval.status === 'Approved' ? 'green' : selectedApproval.status === 'Rejected' ? 'red' : 'amber'}>
                    {selectedApproval.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Context & Reason */}
            <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-1)' }}>Approval Context & Justification</h4>
              <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>{selectedApproval.reason}</p>
            </div>

            {/* Budget Commitment Context */}
            {(() => {
              const bc = typeof selectedApproval.budgetCommitmentJson === 'string' ? JSON.parse(selectedApproval.budgetCommitmentJson || '{}') : selectedApproval.budgetCommitmentJson;
              if (!bc?.costCenter) return null;
              return (
                <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                  <h4 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text-1)' }}>Budget Commitment Impact</h4>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', gap: 16 }}>
                    <span>Cost Center: <strong>{bc.costCenter}</strong></span>
                    <span>Budget Head: <strong>{bc.budgetHead}</strong></span>
                    <span>Impact Amount: <strong>₹{bc.committedAmount?.toLocaleString()}</strong></span>
                  </div>
                </div>
              );
            })()}

            {/* Approval History */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-1)' }}>
                Financial Approval Audit History
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(parseJson(selectedApproval.historyJson) || []).map((h: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--panel-2)', borderRadius: 6, fontSize: 12 }}>
                    <span><strong>{h.action}</strong> by {h.user} {h.reason ? `(${h.reason})` : ''}</span>
                    <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>{h.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <Modal
          open={!!rejectModal}
          title={`Reject Financial Request — ${rejectModal.approvalNumber}`}
          subtitle={`${rejectModal.flowCode} · ${rejectModal.entityRef}`}
          onClose={() => setRejectModal(null)}
          footer={
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setRejectModal(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleRejectSubmit} disabled={submitting}>
                Confirm Rejection
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
              Specify the reason for rejecting this financial approval request:
            </p>
            <Input
              placeholder="e.g. Rate discrepancy exceeds approved contract index limit"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
