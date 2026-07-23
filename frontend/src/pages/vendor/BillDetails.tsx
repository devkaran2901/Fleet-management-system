import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, AlertTriangle, CheckCircle, Eye, Download } from 'lucide-react';
import { initialBills } from './vendorDataStore';
import '../../styles/vendor.css';

export const BillDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPodModal, setShowPodModal] = useState(false);

  const bill = initialBills.find((b) => b.id === id) || initialBills[1]; // Default to deviation bill for demo

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Draft: 'vp-badge-info',
      Submitted: 'vp-badge-purple',
      'Under Verification': 'vp-badge-warning',
      'Deviation Found': 'vp-badge-danger',
      Approved: 'vp-badge-success',
      Paid: 'vp-badge-success',
    };
    return map[status] || 'vp-badge-info';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="vp-page-header">
        <div>
          <button className="vp-btn vp-btn-secondary" style={{ marginBottom: 12, padding: '4px 10px', fontSize: 12 }} onClick={() => navigate('/vendor/bills')}>
            <ArrowLeft size={14} /> Back to Bills
          </button>
          <div className="vp-page-title">
            <FileText color="var(--vendor-accent)" /> Bill Details: {bill.id}
          </div>
          <div className="vp-page-subtitle">
            Trip {bill.tripId} • {bill.customer} • Submitted on {bill.submissionDate}
          </div>
        </div>
        <span className={`vp-badge ${statusBadge(bill.status)}`} style={{ padding: '8px 16px', fontSize: 13 }}>
          {bill.status}
        </span>
      </div>

      {/* Deviation Alert */}
      {bill.status === 'Deviation Found' && (
        <div style={{ background: 'var(--vendor-danger-light)', border: '1px solid rgba(239,68,68,0.35)', padding: 16, borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <AlertTriangle size={20} color="var(--vendor-danger)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--vendor-danger)' }}>Deviation Flag — Customer Verification Hold</div>
            <div style={{ fontSize: 13, color: 'var(--text-1)', marginTop: 4 }}>{bill.verificationRemarks}</div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="vp-grid-2">
        {/* Financial Breakdown */}
        <div className="vp-card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, borderBottom: '1px solid var(--border-soft)', paddingBottom: 10 }}>
            💰 Financial Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-3)' }}>Contract Rate (Agreed):</span>
              <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono' }}>₹{bill.contractRate.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-3)' }}>Distance (Contracted):</span>
              <span style={{ fontWeight: 600 }}>{bill.distanceKm} km</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-3)' }}>Expected Amount:</span>
              <span style={{ fontWeight: 700, color: 'var(--vendor-accent)', fontFamily: 'JetBrains Mono' }}>₹{bill.expectedAmount.toLocaleString()}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-3)' }}>Your Invoice Amount:</span>
                <span style={{ fontWeight: 800, color: bill.submittedAmount > bill.expectedAmount ? 'var(--vendor-warning)' : 'var(--vendor-accent)', fontSize: 18, fontFamily: 'JetBrains Mono' }}>
                  ₹{bill.submittedAmount.toLocaleString()}
                </span>
              </div>
              {bill.difference !== 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8 }}>
                  <span style={{ color: 'var(--text-3)' }}>Difference:</span>
                  <span style={{ fontWeight: 700, color: 'var(--vendor-danger)' }}>
                    {bill.difference > 0 ? '+' : ''}₹{bill.difference.toLocaleString()} ({bill.difference > 0 ? 'Over-invoiced' : 'Under-invoiced'})
                  </span>
                </div>
              )}
            </div>
          </div>

          {bill.verificationRemarks && (
            <div style={{ marginTop: 16, background: 'var(--panel-2)', padding: 12, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginBottom: 4 }}>VERIFICATION REMARKS:</div>
              <div style={{ fontSize: 13, color: 'var(--text-1)' }}>{bill.verificationRemarks}</div>
            </div>
          )}
        </div>

        {/* Trip Details & Documents */}
        <div className="vp-card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, borderBottom: '1px solid var(--border-soft)', paddingBottom: 10 }}>
            🚚 Trip & Document Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-3)' }}>Trip ID:</span>
              <span style={{ fontWeight: 600, fontFamily: 'JetBrains Mono' }}>{bill.tripId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-3)' }}>Route:</span>
              <span style={{ fontWeight: 600 }}>{bill.route}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-3)' }}>Vehicle:</span>
              <span style={{ fontWeight: 600, fontFamily: 'JetBrains Mono' }}>{bill.vehicleNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-3)' }}>Driver:</span>
              <span style={{ fontWeight: 600 }}>{bill.driverName}</span>
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Uploaded Documents:</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel-2)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {bill.invoicePdfUploaded ? <CheckCircle size={14} color="var(--vendor-accent)" /> : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--border-soft)' }} />}
                <span style={{ fontSize: 13 }}>Invoice PDF</span>
              </div>
              {bill.invoicePdfUploaded && (
                <button className="vp-btn vp-btn-secondary" style={{ padding: '2px 8px', fontSize: 10 }}>
                  <Download size={11} /> Download
                </button>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel-2)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {bill.podUploaded ? <CheckCircle size={14} color="var(--vendor-accent)" /> : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--border-soft)' }} />}
                <span style={{ fontSize: 13 }}>Proof of Delivery (POD)</span>
              </div>
              {bill.podUploaded && (
                <button className="vp-btn vp-btn-secondary" style={{ padding: '2px 8px', fontSize: 10 }} onClick={() => setShowPodModal(true)}>
                  <Eye size={11} /> View POD
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="vp-card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>📋 Audit Trail</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { event: 'Bill Created as Draft', timestamp: `${bill.submissionDate} 08:20 AM`, actor: 'Express Logistics Portal', status: 'completed' },
            { event: 'Invoice & POD Documents Uploaded', timestamp: `${bill.submissionDate} 09:05 AM`, actor: 'Express Logistics Portal', status: 'completed' },
            { event: 'Bill Submitted for Verification', timestamp: `${bill.submissionDate} 09:07 AM`, actor: 'Express Logistics Portal', status: 'completed' },
            { event: bill.status === 'Deviation Found' ? 'Deviation Flag Raised by Customer Audit Team' : 'OCR Verification Completed', timestamp: `${bill.submissionDate} 11:30 AM`, actor: 'System (OCR Engine)', status: bill.status === 'Deviation Found' ? 'rejected' : 'completed' },
          ].map((entry, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 14, paddingBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: entry.status === 'completed' ? 'var(--vendor-accent)' : entry.status === 'rejected' ? 'var(--vendor-danger)' : 'var(--panel-2)',
                  border: `2px solid ${entry.status === 'completed' ? 'var(--vendor-accent)' : entry.status === 'rejected' ? 'var(--vendor-danger)' : 'var(--border-soft)'}`,
                  flexShrink: 0,
                  marginTop: 2,
                }} />
                {idx < 3 && <div style={{ width: 1, flex: 1, background: 'var(--border-soft)', marginTop: 4 }} />}
              </div>
              <div style={{ paddingBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{entry.event}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{entry.timestamp} · {entry.actor}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* POD Viewer Modal */}
      {showPodModal && (
        <div className="vp-modal-overlay">
          <div className="vp-modal" style={{ maxWidth: 700 }}>
            <div className="vp-modal-header">
              <div className="vp-modal-title">Proof of Delivery (POD) Viewer</div>
              <button className="adm-icon-btn" onClick={() => setShowPodModal(false)}>✕</button>
            </div>
            <div style={{ background: 'var(--panel-2)', borderRadius: 10, padding: 40, textAlign: 'center', border: '1px solid var(--border-soft)', minHeight: 300 }}>
              <FileText size={64} color="var(--vendor-accent)" style={{ margin: '0 auto 12px', display: 'block' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>POD-{bill.tripId}.pdf</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                Delivery confirmed at {bill.route.split('->')[1]?.trim()} on {bill.submissionDate}
              </div>
              <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="vp-btn vp-btn-primary"><Download size={14} /> Download Full POD</button>
                <button className="vp-btn vp-btn-secondary" onClick={() => setShowPodModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
