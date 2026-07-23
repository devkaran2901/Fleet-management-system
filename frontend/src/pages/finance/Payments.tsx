import React, { useEffect, useState } from 'react';
import { CheckCircle2, Eye, Plus, Filter, RefreshCw } from 'lucide-react';
import { financeApi } from '../../services/financeApi';
import type { PaymentRunRecord } from '../../services/financeApi';
import { Panel, Button, Badge, Input, Select, Modal, LoadingState, ErrorState, useToast } from '../../components/admin/ui';

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRunRecord | null>(null);
  const [createBatchModal, setCreateBatchModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useToast();

  // Filters
  const [vendorFilter, setVendorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form for new batch
  const [newVendor, setNewVendor] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newMode, setNewMode] = useState('Bank Transfer');

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.getPaymentRuns({
        vendor: vendorFilter || undefined,
        status: statusFilter || undefined,
      });
      setPayments(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load payment runs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [vendorFilter, statusFilter]);

  const handleRelease = async (id: string) => {
    try {
      setSubmitting(true);
      await financeApi.releasePaymentRun(id);
      notify('success', 'Payment batch released (Maker-Checker dual authorization signoff complete)');
      loadPayments();
      if (selectedPayment?.id === id) {
        setSelectedPayment(null);
      }
    } catch (err: any) {
      notify('error', err?.message || 'Failed to release payment batch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBatchSubmit = async () => {
    if (!newVendor.trim() || !newAmount) {
      notify('error', 'Please enter vendor name and valid batch amount');
      return;
    }
    try {
      setSubmitting(true);
      await financeApi.createPaymentRunBatch({
        vendor: newVendor,
        amount: parseFloat(newAmount),
        paymentMode: newMode,
        bills: ['VBN-2026-AUTO-BATCH'],
      });
      notify('success', 'New payment run batch created and queued for Maker-Checker approval');
      setCreateBatchModal(false);
      setNewVendor('');
      setNewAmount('');
      loadPayments();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to create payment batch');
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
            Payment Runs & Disbursements
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            Payment Queue, Maker-Checker authorization, UPI batch release, FASTag & Fuel Card ledgers.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" icon={<RefreshCw size={14} />} onClick={loadPayments}>
            Refresh
          </Button>
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => setCreateBatchModal(true)}>
            Create Payment Batch
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Panel padded={false} style={{ backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', padding: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={15} color="var(--text-3)" />
          <span className="mono-label" style={{ fontSize: 10 }}>FILTERS:</span>
          
          <Input
            placeholder="Search Vendor..."
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            style={{ width: 180 }}
          />

          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 140 }}>
            <option value="">All Statuses</option>
            <option value="Queued">Queued</option>
            <option value="Processing">Processing</option>
            <option value="Released">Released</option>
            <option value="Failed">Failed</option>
          </Select>

          {(vendorFilter || statusFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setVendorFilter('');
                setStatusFilter('');
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </Panel>

      {/* Payments Table */}
      {loading ? (
        <LoadingState label="Loading Payment Runs" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadPayments} />
      ) : (
        <Panel padded={false}>
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Batch Number</th>
                  <th>Vendor / Payee</th>
                  <th>Amount</th>
                  <th>Payment Mode</th>
                  <th>Maker-Checker Status</th>
                  <th>Batch Status</th>
                  <th>Release Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--text-3)' }}>
                      No payment runs found.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{p.batchNumber}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{p.vendor}</span>
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{p.amount.toLocaleString()}</td>
                      <td>
                        <Badge tone={p.paymentMode.includes('Fuel') ? 'amber' : p.paymentMode.includes('FASTag') ? 'blue' : 'grey'}>
                          {p.paymentMode}
                        </Badge>
                      </td>
                      <td>
                        <Badge tone={p.approval === 'Released' || p.approval === 'Approved' ? 'green' : 'amber'}>
                          {p.approval}
                        </Badge>
                      </td>
                      <td>
                        <Badge tone={p.status === 'Released' ? 'green' : p.status === 'Queued' ? 'blue' : 'red'}>
                          {p.status}
                        </Badge>
                      </td>
                      <td>
                        <span style={{ fontSize: 11 }}>{new Date(p.releaseDate).toLocaleDateString()}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye size={13} />}
                            onClick={() => setSelectedPayment(p)}
                          >
                            Details
                          </Button>
                          {p.approval !== 'Released' && p.approval !== 'Approved' && (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<CheckCircle2 size={13} />}
                              onClick={() => handleRelease(p.id)}
                              disabled={submitting}
                            >
                              Release Batch
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

      {/* Payment Batch Details Modal */}
      {selectedPayment && (
        <Modal
          open={!!selectedPayment}
          title={`Payment Batch Details — ${selectedPayment.batchNumber}`}
          subtitle={`Payee: ${selectedPayment.vendor}`}
          onClose={() => setSelectedPayment(null)}
          wide
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button variant="ghost" onClick={() => setSelectedPayment(null)}>Close</Button>
              {selectedPayment.approval !== 'Released' && (
                <Button variant="primary" icon={<CheckCircle2 size={14} />} onClick={() => handleRelease(selectedPayment.id)} disabled={submitting}>
                  Release Batch
                </Button>
              )}
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Top Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>BATCH AMOUNT</span>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, color: 'var(--text-1)' }}>
                  ₹{selectedPayment.amount.toLocaleString()}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>PAYMENT MODE</span>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                  {selectedPayment.paymentMode}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>MAKER-CHECKER</span>
                <div style={{ marginTop: 4 }}>
                  <Badge tone={selectedPayment.approval === 'Released' ? 'green' : 'amber'}>
                    {selectedPayment.approval}
                  </Badge>
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>RELEASE DATE</span>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                  {new Date(selectedPayment.releaseDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Bank Status & Bills Included */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text-1)' }}>Bank Account & Disbursal</h4>
                {(() => {
                  const bk = typeof selectedPayment.bankStatusJson === 'string' ? JSON.parse(selectedPayment.bankStatusJson || '{}') : selectedPayment.bankStatusJson;
                  return (
                    <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div>Bank: <strong>{bk?.bank}</strong></div>
                      <div>Account: <strong>{bk?.accountNo}</strong></div>
                      <div>IFSC: <strong>{bk?.ifsc}</strong></div>
                    </div>
                  );
                })()}
              </div>

              <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text-1)' }}>Bills Included In Batch</h4>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(parseJson(selectedPayment.billsIncludedJson) || []).map((bill: string, idx: number) => (
                    <Badge key={idx} tone="grey">{bill}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Approval Timeline */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-1)' }}>
                Maker-Checker Authorization Timeline
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(parseJson(selectedPayment.approvalTimelineJson) || []).map((tl: any, idx: number) => (
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

      {/* Create Payment Batch Modal */}
      {createBatchModal && (
        <Modal
          open={createBatchModal}
          title="Create New Payment Batch"
          subtitle="Assemble vendor bills into a disbursement batch"
          onClose={() => setCreateBatchModal(false)}
          footer={
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setCreateBatchModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreateBatchSubmit} disabled={submitting}>
                Create Batch
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 4 }}>Vendor / Payee Name</label>
              <Input
                placeholder="e.g. Mahalaxmi Transport Services"
                value={newVendor}
                onChange={(e) => setNewVendor(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 4 }}>Batch Amount (₹)</label>
              <Input
                type="number"
                placeholder="e.g. 450000"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 4 }}>Payment Disbursement Mode</label>
              <Select value={newMode} onChange={(e) => setNewMode(e.target.value)}>
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI Batch">UPI Batch Release</option>
                <option value="FASTag Ledger">FASTag Auto-Recharge</option>
                <option value="Fuel Card Ledger">Fuel Card Bulk Top-up</option>
              </Select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
