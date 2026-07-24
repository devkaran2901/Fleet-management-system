import React, { useState } from 'react';
import { initialKhataTransactions } from './driverDataStore';
import type { KhataTransaction } from './driverDataStore';
import {
  Wallet,
  FileText,
  AlertCircle,
  Eye,
  X,
} from 'lucide-react';

export const KhataManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<KhataTransaction[]>(initialKhataTransactions);
  const [selectedTxn, setSelectedTxn] = useState<KhataTransaction | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeNotes, setDisputeNotes] = useState('');

  const openingBalance = 0;
  const advancesReceived = transactions.reduce((acc, t) => acc + t.credit, 0);
  const expensesClaimed = transactions.reduce((acc, t) => acc + t.debit, 0);
  const currentBalance = advancesReceived - expensesClaimed;
  const pendingSettlement = 650;

  const handleRaiseDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxn) return;

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === selectedTxn.id
          ? { ...t, approvalStatus: 'Disputed', disputeNotes }
          : t
      )
    );
    setShowDisputeModal(false);
    setSelectedTxn(null);
    alert('Dispute raised successfully. Finance manager has been notified.');
  };

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text-1)' }}>Driver Khata Ledger & Advances</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-2)' }}>
            Real-time digital driver ledger, advance credits, expense debits & weekly settlements.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="driver-kpi-grid">
        <div className="driver-kpi-card">
          <div className="driver-kpi-label">Opening Balance</div>
          <div className="driver-kpi-val" style={{ color: 'var(--text-1)' }}>
            ₹{openingBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Month Start</div>
        </div>

        <div className="driver-kpi-card">
          <div className="driver-kpi-label">Advances Received</div>
          <div className="driver-kpi-val" style={{ color: 'var(--green)' }}>
            ₹{advancesReceived.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--green)' }}>Credit Total</div>
        </div>

        <div className="driver-kpi-card">
          <div className="driver-kpi-label">Expenses Claimed</div>
          <div className="driver-kpi-val" style={{ color: 'var(--red)' }}>
            ₹{expensesClaimed.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--red)' }}>Debit Total</div>
        </div>

        <div className="driver-kpi-card">
          <div className="driver-kpi-label">Pending Settlement</div>
          <div className="driver-kpi-val" style={{ color: 'var(--amber)' }}>
            ₹{pendingSettlement.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--amber)' }}>Processing by Finance</div>
        </div>

        <div className="driver-kpi-card" style={{ background: 'var(--panel-2)', border: '1px solid var(--green)' }}>
          <div className="driver-kpi-label" style={{ color: 'var(--green)' }}>CURRENT KHATA BALANCE</div>
          <div className="driver-kpi-val" style={{ color: 'var(--green)', fontSize: 28 }}>
            ₹{currentBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Available for Duty</div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="driver-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-soft)', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Wallet color="var(--green)" size={18} /> DRIVER KHATA TRANSACTION LEDGER
        </div>

        <table className="driver-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Debit (₹)</th>
              <th>Credit (₹)</th>
              <th>Balance (₹)</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td style={{ fontWeight: 600 }}>{txn.date}</td>
                <td>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background:
                        txn.transactionType === 'Advance'
                          ? 'var(--green-glow, rgba(46, 204, 113, 0.15))'
                          : txn.transactionType === 'Expense Claim'
                          ? 'rgba(232, 163, 61, 0.15)'
                          : 'rgba(59, 130, 246, 0.15)',
                      color:
                        txn.transactionType === 'Advance'
                          ? 'var(--green)'
                          : txn.transactionType === 'Expense Claim'
                          ? 'var(--amber)'
                          : '#3B82F6',
                    }}
                  >
                    {txn.transactionType}
                  </span>
                </td>
                <td style={{ maxWidth: 280 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{txn.description}</div>
                </td>
                <td style={{ color: txn.debit > 0 ? 'var(--red)' : 'var(--text-2)', fontWeight: txn.debit > 0 ? 700 : 400 }}>
                  {txn.debit > 0 ? `- ₹${txn.debit.toLocaleString()}` : '-'}
                </td>
                <td style={{ color: txn.credit > 0 ? 'var(--green)' : 'var(--text-2)', fontWeight: txn.credit > 0 ? 700 : 400 }}>
                  {txn.credit > 0 ? `+ ₹${txn.credit.toLocaleString()}` : '-'}
                </td>
                <td style={{ fontWeight: 800, color: 'var(--text-1)' }}>₹{txn.balance.toLocaleString()}</td>
                <td>
                  <span
                    className={`driver-status-pill ${
                      txn.approvalStatus === 'Approved'
                        ? 'approved'
                        : txn.approvalStatus === 'Disputed'
                        ? 'rejected'
                        : 'pending'
                    }`}
                  >
                    {txn.approvalStatus}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="driver-btn-secondary"
                    onClick={() => setSelectedTxn(txn)}
                    style={{ padding: '5px 10px', fontSize: 11 }}
                  >
                    <Eye size={12} /> Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Detail */}
      {selectedTxn && !showDisputeModal && (
        <div className="driver-modal-overlay">
          <div className="driver-modal" style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Wallet color="var(--green)" size={22} />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Transaction Detail: {selectedTxn.id}</h3>
              </div>
              <button onClick={() => setSelectedTxn(null)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'var(--panel-2)', padding: 14, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 700 }}>AMOUNT</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: selectedTxn.credit > 0 ? 'var(--green)' : 'var(--red)', marginTop: 2 }}>
                {selectedTxn.credit > 0 ? `+ ₹${selectedTxn.credit.toLocaleString()}` : `- ₹${selectedTxn.debit.toLocaleString()}`}
              </div>

              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-1)', fontWeight: 600 }}>{selectedTxn.description}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>Date: {selectedTxn.date} | Status: <strong style={{ color: 'var(--green)' }}>{selectedTxn.approvalStatus}</strong></div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>SUPPORTING FILES</div>
              {selectedTxn.supportingFiles.map((file, i) => (
                <div key={i} style={{ background: 'var(--panel-2)', padding: '8px 12px', borderRadius: 8, fontSize: 12, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={14} /> {file}
                </div>
              ))}
            </div>

            {selectedTxn.disputeNotes && (
              <div style={{ background: 'rgba(229, 72, 77, 0.1)', padding: 10, borderRadius: 8, border: '1px solid var(--red)', marginBottom: 16, fontSize: 12, color: 'var(--red)' }}>
                <strong>Dispute Notes:</strong> {selectedTxn.disputeNotes}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              {selectedTxn.approvalStatus !== 'Disputed' && (
                <button
                  className="driver-btn-secondary"
                  onClick={() => setShowDisputeModal(true)}
                  style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                >
                  <AlertCircle size={14} /> Raise Dispute
                </button>
              )}
              <button className="driver-btn-secondary" onClick={() => setSelectedTxn(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dispute */}
      {showDisputeModal && selectedTxn && (
        <div className="driver-modal-overlay">
          <div className="driver-modal" style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertCircle color="var(--red)" size={22} />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Raise Khata Transaction Dispute</h3>
              </div>
              <button onClick={() => setShowDisputeModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRaiseDispute}>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14 }}>
                Disputing Transaction: <strong>{selectedTxn.id} ({selectedTxn.description})</strong>
              </div>

              <div className="driver-form-group">
                <label>Reason for Dispute & Correction Details</label>
                <textarea
                  rows={4}
                  placeholder="Explain why this deduction or credit amount is incorrect..."
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="driver-btn-secondary" onClick={() => setShowDisputeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="driver-btn-primary" style={{ background: 'var(--red)', color: '#FFF' }}>
                  Submit Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
