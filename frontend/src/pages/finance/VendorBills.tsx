import React, { useEffect, useState } from 'react';
import { Eye, CheckCircle2, Filter, RefreshCw } from 'lucide-react';
import { financeApi } from '../../services/financeApi';
import type { VendorBillRecord } from '../../services/financeApi';
import { Panel, Button, Badge, Input, Select, Modal, LoadingState, ErrorState, useToast } from '../../components/admin/ui';

export const VendorBills: React.FC = () => {
  const [bills, setBills] = useState<VendorBillRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBill, setSelectedBill] = useState<VendorBillRecord | null>(null);
  const [rejectModal, setRejectModal] = useState<VendorBillRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useToast();

  // Filters
  const [vendorFilter, setVendorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [autoMatchFilter, setAutoMatchFilter] = useState('');

  const loadBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.getVendorBills({
        vendor: vendorFilter || undefined,
        status: statusFilter || undefined,
        autoMatchStatus: autoMatchFilter || undefined,
      });
      setBills(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load vendor bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, [vendorFilter, statusFilter, autoMatchFilter]);

  const handleVerify = async (id: string) => {
    try {
      setSubmitting(true);
      await financeApi.verifyVendorBill(id);
      notify('success', 'Vendor bill 3-way match verified successfully');
      loadBills();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to verify vendor bill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveAF07 = async (id: string) => {
    try {
      setSubmitting(true);
      await financeApi.approveVendorBill(id);
      notify('success', 'Vendor bill approved per AF-07 and pushed to Payment Queue');
      loadBills();
      if (selectedBill?.id === id) {
        setSelectedBill(null);
      }
    } catch (err: any) {
      notify('error', err?.message || 'Failed to approve vendor bill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal || !rejectReason.trim()) {
      notify('error', 'Please specify a rejection reason');
      return;
    }
    try {
      setSubmitting(true);
      await financeApi.rejectVendorBill(rejectModal.id, rejectReason);
      notify('info', `Vendor bill ${rejectModal.billNumber} rejected`);
      setRejectModal(null);
      setRejectReason('');
      loadBills();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to reject vendor bill');
    } finally {
      setSubmitting(false);
    }
  };

  const parseJson = (val: any) => {
    if (!val) return {};
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return {};
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
            Vendor Bills & 3-Way Match (AF-07)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            Verification, expected vs billed rate engine, tolerance checks (±0.5% / ₹500), and deviation queue.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" icon={<RefreshCw size={14} />} onClick={loadBills}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Panel padded={false} style={{ backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', padding: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={15} color="var(--text-3)" />
          <span className="mono-label" style={{ fontSize: 10 }}>FILTERS:</span>
          
          <Input
            placeholder="Search Vendor Name..."
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            style={{ width: 180 }}
          />

          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 140 }}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Approved">Approved (AF-07)</option>
            <option value="Rejected">Rejected</option>
            <option value="Paid">Paid</option>
          </Select>

          <Select value={autoMatchFilter} onChange={(e) => setAutoMatchFilter(e.target.value)} style={{ width: 160 }}>
            <option value="">All Auto-Match</option>
            <option value="Matched">Auto Matched</option>
            <option value="Mismatch">Mismatch (Tolerance Exceeded)</option>
            <option value="ManualReview">Manual Review</option>
          </Select>

          {(vendorFilter || statusFilter || autoMatchFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setVendorFilter('');
                setStatusFilter('');
                setAutoMatchFilter('');
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </Panel>

      {/* Vendor Bills Table */}
      {loading ? (
        <LoadingState label="Loading Vendor Bills" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadBills} />
      ) : (
        <Panel padded={false}>
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Bill Number / Vendor</th>
                  <th>Trip Ref / Contract</th>
                  <th>Expected</th>
                  <th>Billed</th>
                  <th>Tolerance</th>
                  <th>Deviation</th>
                  <th>Tax & TDS</th>
                  <th>Match Status</th>
                  <th>Approval Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: 24, color: 'var(--text-3)' }}>
                      No vendor bills match the specified filters.
                    </td>
                  </tr>
                ) : (
                  bills.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{b.billNumber}</div>
                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{b.vendor}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{b.tripReference}</div>
                        <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>{b.contract}</span>
                      </td>
                      <td style={{ color: 'var(--text-1)' }}>₹{b.expectedAmount.toLocaleString()}</td>
                      <td style={{ fontWeight: 700 }}>₹{b.billedAmount.toLocaleString()}</td>
                      <td>
                        <span style={{ fontSize: 11 }}>{b.tolerance}%</span>
                      </td>
                      <td>
                        <span style={{ color: b.deviation > 0 ? '#ef4444' : 'var(--green)', fontWeight: 600 }}>
                          {b.deviation > 0 ? `+₹${b.deviation.toLocaleString()}` : '₹0'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 11 }}>₹{b.tax.toLocaleString()}</span>
                      </td>
                      <td>
                        <Badge tone={b.autoMatchStatus === 'Matched' ? 'green' : 'red'}>
                          {b.autoMatchStatus}
                        </Badge>
                      </td>
                      <td>
                        <Badge tone={b.status === 'Approved' ? 'green' : b.status === 'Verified' ? 'blue' : b.status === 'Rejected' ? 'red' : 'amber'}>
                          {b.status}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye size={13} />}
                            onClick={() => setSelectedBill(b)}
                          >
                            Details
                          </Button>
                          {b.status === 'Pending' && (
                            <Button
                              variant="subtle"
                              size="sm"
                              icon={<CheckCircle2 size={13} />}
                              onClick={() => handleVerify(b.id)}
                              disabled={submitting}
                            >
                              Verify
                            </Button>
                          )}
                          {(b.status === 'Verified' || b.status === 'Pending') && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApproveAF07(b.id)}
                              disabled={submitting}
                            >
                              Approve (AF-07)
                            </Button>
                          )}
                          {b.status !== 'Approved' && b.status !== 'Rejected' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setRejectModal(b)}
                              disabled={submitting}
                            >
                              Reject
                            </Button>
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

      {/* Vendor Bill Details Drawer/Modal */}
      {selectedBill && (
        <Modal
          open={!!selectedBill}
          title={`Vendor Bill Details — ${selectedBill.billNumber}`}
          subtitle={`${selectedBill.vendor} · ${selectedBill.contract}`}
          onClose={() => setSelectedBill(null)}
          wide
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button variant="ghost" onClick={() => setSelectedBill(null)}>Close</Button>
              {selectedBill.status !== 'Approved' && (
                <Button variant="primary" icon={<CheckCircle2 size={14} />} onClick={() => handleApproveAF07(selectedBill.id)} disabled={submitting}>
                  Approve (AF-07)
                </Button>
              )}
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Top Stat Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>EXPECTED AMOUNT</span>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, color: 'var(--text-1)' }}>
                  ₹{selectedBill.expectedAmount.toLocaleString()}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>BILLED AMOUNT</span>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, color: 'var(--text-1)' }}>
                  ₹{selectedBill.billedAmount.toLocaleString()}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>DEVIATION</span>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, color: selectedBill.deviation > 0 ? '#ef4444' : 'var(--green)' }}>
                  {selectedBill.deviation > 0 ? `+₹${selectedBill.deviation.toLocaleString()}` : '₹0'}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>TOLERANCE CHECK</span>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>
                  <Badge tone={selectedBill.autoMatchStatus === 'Matched' ? 'green' : 'red'}>
                    {selectedBill.autoMatchStatus} (±0.5% / ₹500)
                  </Badge>
                </div>
              </div>
            </div>

            {/* Rate Computation & Escalation Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-1)' }}>
                  Rate Computation Engine
                </h4>
                {(() => {
                  const rc = parseJson(selectedBill.rateComputationJson);
                  return (
                    <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--text-3)' }}>
                      <div>Contract Type: <strong style={{ color: 'var(--text-1)' }}>{rc.contractType || 'Fixed Route'}</strong></div>
                      <div>Rate per KM: <strong style={{ color: 'var(--text-1)' }}>₹{rc.ratePerKm}</strong></div>
                      <div>Agreed KM: <strong style={{ color: 'var(--text-1)' }}>{rc.agreedKm} km</strong></div>
                    </div>
                  );
                })()}
              </div>

              <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-1)' }}>
                  Diesel Escalation & Indexing
                </h4>
                {(() => {
                  const de = parseJson(selectedBill.dieselEscalationJson);
                  return (
                    <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--text-3)' }}>
                      <div>Base Diesel Price: <strong>₹{de.baseDieselPrice}</strong></div>
                      <div>Current IOCL Price: <strong>₹{de.currentDieselPrice}</strong></div>
                      <div>Escalation Amount: <strong style={{ color: 'var(--green)' }}>₹{de.escalationAmount?.toLocaleString()}</strong></div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Detention, Penalties & Tax Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text-1)' }}>Detention Calculation</h4>
                {(() => {
                  const dt = parseJson(selectedBill.detentionJson);
                  return (
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      <div>Free Hours: {dt.freeHours}h</div>
                      <div>Actual Hours: {dt.actualDetentionHours}h</div>
                      <div>Detention Charged: <strong>₹{dt.detentionAmount?.toLocaleString()}</strong></div>
                    </div>
                  );
                })()}
              </div>

              <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text-1)' }}>Penalties & Debits</h4>
                {(() => {
                  const p = parseJson(selectedBill.penaltiesJson);
                  return (
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      <div>SLA Status: {p.SLA}</div>
                      <div>Penalty Deduction: <strong style={{ color: '#ef4444' }}>₹{p.penaltyApplied}</strong></div>
                    </div>
                  );
                })()}
              </div>

              <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text-1)' }}>GST & TDS Treatment</h4>
                {(() => {
                  const tx = parseJson(selectedBill.taxSummaryJson);
                  return (
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      <div>Type: {tx.type}</div>
                      <div>GST: ₹{tx.gstAmount}</div>
                      <div>TDS ({tx.tdsSection} {tx.tdsRate}): ₹{tx.tdsAmount}</div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Approval Timeline */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-1)' }}>
                AF-07 Approval Timeline & Audit Chain
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(parseJson(selectedBill.approvalTimelineJson) || []).map((tl: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--panel-2)', borderRadius: 6, fontSize: 12 }}>
                    <span><strong>{tl.step}</strong> — {tl.status}</span>
                    <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>{tl.timestamp}</span>
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
          title={`Reject Vendor Bill — ${rejectModal.billNumber}`}
          subtitle={`Vendor: ${rejectModal.vendor}`}
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
              Specify the rejection code/reason for this vendor bill:
            </p>
            <Input
              placeholder="e.g. Excessive detention claim without GPS gate proof"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
