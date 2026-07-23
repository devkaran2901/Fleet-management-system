import React, { useState } from 'react';
import { CreditCard, Clock, CheckCircle, Download, TrendingUp, IndianRupee, AlertTriangle } from 'lucide-react';
import { initialPayments } from './vendorDataStore';
import type { PaymentItem } from './vendorDataStore';
import '../../styles/vendor.css';

export const Payments: React.FC = () => {
  const [payments] = useState<PaymentItem[]>(initialPayments);
  const [activeTab, setActiveTab] = useState<'ALL' | PaymentItem['status']>('ALL');

  const disbursed = payments.filter((p) => p.status === 'Disbursed').reduce((s, p) => s + p.netPayable, 0);
  const awaiting = payments.filter((p) => p.status !== 'Disbursed' && p.status !== 'Failed').reduce((s, p) => s + p.netPayable, 0);
  const totalTds = payments.reduce((s, p) => s + p.tdsAmount, 0);
  const totalDeductions = payments.reduce((s, p) => s + p.debitNotes, 0);

  const statusBadge = (status: PaymentItem['status']) => {
    const map: Record<string, string> = {
      'Pending Verification': 'vp-badge-warning',
      Approved: 'vp-badge-info',
      Scheduled: 'vp-badge-purple',
      Disbursed: 'vp-badge-success',
      Failed: 'vp-badge-danger',
    };
    return map[status] || 'vp-badge-info';
  };

  const filtered = activeTab === 'ALL' ? payments : payments.filter((p) => p.status === activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="vp-page-header">
        <div>
          <div className="vp-page-title">
            <CreditCard color="var(--vendor-accent)" /> Payment Tracking & Settlement
          </div>
          <div className="vp-page-subtitle">
            Monitor all payments from bill approval through disbursement — view deductions, TDS, debit notes, and net payable amounts.
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="vp-grid-4">
        <div className="vp-stat-card">
          <div>
            <div className="vp-stat-lbl">Total Disbursed</div>
            <div className="vp-stat-val" style={{ color: 'var(--vendor-accent)', fontSize: 22 }}>₹{disbursed.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Paid to your bank account</div>
          </div>
          <div className="vp-stat-icon"><CheckCircle size={22} /></div>
        </div>

        <div className="vp-stat-card">
          <div>
            <div className="vp-stat-lbl">Awaiting Payout</div>
            <div className="vp-stat-val" style={{ color: '#3b82f6', fontSize: 22 }}>₹{awaiting.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Scheduled or in review</div>
          </div>
          <div className="vp-stat-icon" style={{ background: 'var(--vendor-info-light)', color: '#3b82f6' }}><Clock size={22} /></div>
        </div>

        <div className="vp-stat-card">
          <div>
            <div className="vp-stat-lbl">Total TDS Deducted</div>
            <div className="vp-stat-val" style={{ color: 'var(--vendor-warning)', fontSize: 22 }}>₹{totalTds.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>2% TDS per payment</div>
          </div>
          <div className="vp-stat-icon" style={{ background: 'var(--vendor-warning-light)', color: 'var(--vendor-warning)' }}><IndianRupee size={22} /></div>
        </div>

        <div className="vp-stat-card">
          <div>
            <div className="vp-stat-lbl">Debit Notes Applied</div>
            <div className="vp-stat-val" style={{ color: 'var(--vendor-danger)', fontSize: 22 }}>₹{totalDeductions.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Penalties & deductions</div>
          </div>
          <div className="vp-stat-icon" style={{ background: 'var(--vendor-danger-light)', color: 'var(--vendor-danger)' }}><AlertTriangle size={22} /></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="vp-tabs">
        {(['ALL', 'Pending Verification', 'Approved', 'Scheduled', 'Disbursed', 'Failed'] as const).map((t) => (
          <button key={t} className={`vp-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="vp-table-wrap">
        <table className="vp-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Bill Number</th>
              <th>Customer</th>
              <th>Gross Amount</th>
              <th>Debit Notes</th>
              <th>TDS (2%)</th>
              <th>Net Payable</th>
              <th>Status</th>
              <th>Payout Date</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((payment) => (
              <tr key={payment.id}>
                <td style={{ fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{payment.id}</td>
                <td style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>{payment.billNumber}</td>
                <td>{payment.customer}</td>
                <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>₹{payment.grossAmount.toLocaleString()}</td>
                <td style={{ color: payment.debitNotes > 0 ? 'var(--vendor-danger)' : 'var(--text-3)', fontFamily: 'JetBrains Mono' }}>
                  {payment.debitNotes > 0 ? `-₹${payment.debitNotes.toLocaleString()}` : '—'}
                </td>
                <td style={{ color: 'var(--vendor-warning)', fontFamily: 'JetBrains Mono' }}>
                  -₹{payment.tdsAmount.toLocaleString()}
                </td>
                <td style={{ fontWeight: 800, color: 'var(--vendor-accent)', fontFamily: 'JetBrains Mono', fontSize: 15 }}>
                  ₹{payment.netPayable.toLocaleString()}
                </td>
                <td>
                  <span className={`vp-badge ${statusBadge(payment.status)}`}>{payment.status}</span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  {payment.payoutDate || '—'}
                </td>
                <td style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-3)', maxWidth: 160 }}>
                  {payment.referenceNumber ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{payment.referenceNumber}</span>
                      <button className="vp-btn vp-btn-secondary" style={{ padding: '2px 6px', fontSize: 9 }}>
                        <Download size={10} />
                      </button>
                    </div>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deduction Breakdown Note */}
      <div className="vp-card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(0,0,0,0))' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={18} color="var(--vendor-accent)" /> Deduction Policy — FY 2026–27
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 13 }}>
          {[
            { label: 'TDS (Tax Deducted at Source)', value: '2% per bill (Section 194C)' },
            { label: 'Late Reporting Penalty', value: '₹500 per hour delay after grace period' },
            { label: 'Detention Charges (Loading)', value: 'As agreed — must submit approval slip' },
            { label: 'Damage Recovery', value: 'Basis survey report by customer QA' },
          ].map((policy) => (
            <div key={policy.label} style={{ background: 'var(--panel-2)', padding: 12, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>{policy.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-1)' }}>{policy.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
