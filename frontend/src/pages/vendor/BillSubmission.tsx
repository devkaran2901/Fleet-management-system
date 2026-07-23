import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Upload, AlertTriangle, CheckCircle, Truck, MapPin } from 'lucide-react';
import '../../styles/vendor.css';

const TRIP_OPTIONS = [
  { id: 'TRIP-4020', route: 'Bhiwandi -> Chakan', vehicle: 'MH-12-PQ-9988', driver: 'Ramesh Kumar', contractRate: 48500, distanceKm: 165 },
  { id: 'TRIP-4021', route: 'Navi Mumbai -> Ahmedabad', vehicle: 'KA-01-AB-1234', driver: 'Suresh Yadav', contractRate: 62000, distanceKm: 530 },
  { id: 'TRIP-4022', route: 'Bengaluru -> Chennai', vehicle: 'HR-26-DQ-7711', driver: 'Vijay Singh', contractRate: 39000, distanceKm: 340 },
];

export const BillSubmission: React.FC = () => {
  const navigate = useNavigate();

  const [selectedTrip, setSelectedTrip] = useState('');
  const [submittedAmount, setSubmittedAmount] = useState('');
  const [deviationReason, setDeviationReason] = useState('');
  const [podFile, setPodFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [supportFile, setSupportFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const trip = TRIP_OPTIONS.find((t) => t.id === selectedTrip);
  const submittedNum = parseFloat(submittedAmount) || 0;
  const deviation = trip ? submittedNum - trip.contractRate : 0;
  const hasDeviation = deviation !== 0;

  const handleSubmit = () => {
    if (!selectedTrip) { alert('Please select a trip.'); return; }
    if (!submittedAmount) { alert('Please enter submitted invoice amount.'); return; }
    if (!invoiceFile) { alert('Please upload an Invoice PDF.'); return; }
    if (!podFile) { alert('Please upload POD document.'); return; }
    if (hasDeviation && !deviationReason) { alert('A deviation was detected. Please provide a reason.'); return; }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--vendor-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={40} color="var(--vendor-accent)" />
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-1)' }}>Bill Submitted Successfully!</div>
        <div style={{ fontSize: 14, color: 'var(--text-3)', textAlign: 'center', maxWidth: 400 }}>
          Your invoice has been submitted for OCR verification and customer approval. You'll receive a notification once reviewed.
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="vp-btn vp-btn-secondary" onClick={() => navigate('/vendor/bills')}>View Bills Workbench</button>
          <button className="vp-btn vp-btn-primary" onClick={() => { setSubmitted(false); setSelectedTrip(''); setSubmittedAmount(''); }}>
            Submit Another Bill
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>
      {/* Header */}
      <div className="vp-page-header">
        <div>
          <button className="vp-btn vp-btn-secondary" style={{ marginBottom: 12, padding: '4px 10px', fontSize: 12 }} onClick={() => navigate('/vendor/bills')}>
            <ArrowLeft size={14} /> Back to Bills
          </button>
          <div className="vp-page-title">
            <FileText color="var(--vendor-accent)" /> Submit New Bill (Invoice Creation Workbench)
          </div>
          <div className="vp-page-subtitle">
            Select a completed trip — the system will pre-fill contract rates, driver, and vehicle details. Upload POD and invoice to submit.
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Left Form */}
        <div className="vp-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, borderBottom: '1px solid var(--border-soft)', paddingBottom: 12 }}>
            Step 1: Select Completed Trip
          </h3>

          <div className="vp-form-group" style={{ marginBottom: 0 }}>
            <label className="vp-label">Select Trip to Invoice:</label>
            <select className="vp-select" value={selectedTrip} onChange={(e) => { setSelectedTrip(e.target.value); setSubmittedAmount(''); }}>
              <option value="">-- Choose Trip --</option>
              {TRIP_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>{t.id} — {t.route}</option>
              ))}
            </select>
          </div>

          {trip && (
            <>
              {/* Auto-filled Trip Details */}
              <div style={{ background: 'var(--panel-2)', padding: 16, borderRadius: 10, border: '1px solid var(--border-soft)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> ROUTE</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{trip.route}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}><Truck size={11} /> VEHICLE</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{trip.vehicle}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>DRIVER</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{trip.driver}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>DISTANCE</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{trip.distanceKm} km</div>
                </div>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 700, borderBottom: '1px solid var(--border-soft)', paddingBottom: 12, marginTop: 8 }}>
                Step 2: Invoice Amount
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="vp-form-group" style={{ marginBottom: 0 }}>
                  <label className="vp-label">Contract Rate (Pre-filled):</label>
                  <input
                    type="text"
                    className="vp-input"
                    value={`₹ ${trip.contractRate.toLocaleString()}`}
                    readOnly
                    style={{ color: 'var(--vendor-accent)', fontWeight: 700, background: 'var(--panel-2)' }}
                  />
                </div>
                <div className="vp-form-group" style={{ marginBottom: 0 }}>
                  <label className="vp-label">Your Invoice Amount (₹):</label>
                  <input
                    type="number"
                    className="vp-input"
                    placeholder="Enter invoice total..."
                    value={submittedAmount}
                    onChange={(e) => setSubmittedAmount(e.target.value)}
                    style={{ fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Real-time Deviation Detector */}
              {submittedNum > 0 && (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: hasDeviation ? 'var(--vendor-warning-light)' : 'var(--vendor-accent-light)',
                    border: `1px solid ${hasDeviation ? 'rgba(245,158,11,0.35)' : 'rgba(16,185,129,0.35)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
                    {hasDeviation ? <AlertTriangle size={16} color="var(--vendor-warning)" /> : <CheckCircle size={16} color="var(--vendor-accent)" />}
                    <span style={{ color: hasDeviation ? 'var(--vendor-warning)' : 'var(--vendor-accent)' }}>
                      {hasDeviation
                        ? `⚠️ Deviation Detected: ₹${Math.abs(deviation).toLocaleString()} ${deviation > 0 ? 'over' : 'under'} contract rate`
                        : '✅ Amount matches contract rate — no deviation'}
                    </span>
                  </div>
                </div>
              )}

              {hasDeviation && submittedNum > 0 && (
                <div className="vp-form-group" style={{ marginBottom: 0 }}>
                  <label className="vp-label">Deviation Reason (Required):</label>
                  <textarea
                    className="vp-textarea"
                    placeholder="Explain the deviation: e.g. detention charges of ₹2,000 at Bhiwandi warehouse due to 6-hour delay..."
                    value={deviationReason}
                    onChange={(e) => setDeviationReason(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <h3 style={{ fontSize: 16, fontWeight: 700, borderBottom: '1px solid var(--border-soft)', paddingBottom: 12, marginTop: 8 }}>
                Step 3: Upload Documents
              </h3>

              {/* Upload Boxes */}
              {[
                { label: 'Invoice PDF (Required)', file: invoiceFile, setFile: setInvoiceFile, required: true },
                { label: 'Proof of Delivery (POD) (Required)', file: podFile, setFile: setPodFile, required: true },
                { label: 'Supporting Documents (Toll Receipts, Detention Slips)', file: supportFile, setFile: setSupportFile, required: false },
              ].map((box) => (
                <div key={box.label} className="vp-form-group" style={{ marginBottom: 0 }}>
                  <label className="vp-label">{box.label}:</label>
                  <div
                    style={{
                      border: `2px dashed ${box.file ? 'var(--vendor-accent)' : 'var(--border-soft)'}`,
                      borderRadius: 10,
                      padding: '16px 20px',
                      background: box.file ? 'var(--vendor-accent-light)' : 'var(--panel-2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Upload size={20} color={box.file ? 'var(--vendor-accent)' : 'var(--text-3)'} />
                    <div style={{ flex: 1 }}>
                      {box.file ? (
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--vendor-accent)' }}>
                          ✅ {box.file.name}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Click to select file (PDF, JPG, PNG)</div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.png"
                      onChange={(e) => box.setFile(e.target.files?.[0] || null)}
                      style={{ position: 'absolute', opacity: 0, width: 200, cursor: 'pointer' }}
                    />
                    <button className="vp-btn vp-btn-secondary" style={{ padding: '4px 10px', fontSize: 11, position: 'relative' }}
                      onClick={() => document.getElementById(`upload-${box.label}`)?.click()}>
                      Browse
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          <div style={{ marginTop: 8, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="vp-btn vp-btn-secondary" onClick={() => navigate('/vendor/bills')}>
              Save as Draft
            </button>
            <button className="vp-btn vp-btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : '🚀 Submit Bill for Verification'}
            </button>
          </div>
        </div>

        {/* Right Sidebar Summary */}
        {trip && (
          <div className="vp-card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📊 Bill Summary Preview</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-3)' }}>Trip ID:</span>
                <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{trip.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-3)' }}>Contract Rate:</span>
                <span style={{ fontWeight: 700, color: 'var(--vendor-accent)' }}>₹{trip.contractRate.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-3)' }}>Your Invoice:</span>
                <span style={{ fontWeight: 700, color: submittedNum > trip.contractRate ? 'var(--vendor-warning)' : 'var(--text-1)' }}>
                  {submittedNum > 0 ? `₹${submittedNum.toLocaleString()}` : '—'}
                </span>
              </div>

              {submittedNum > 0 && (
                <>
                  <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-3)' }}>Deviation:</span>
                      <span style={{ fontWeight: 700, color: deviation === 0 ? 'var(--vendor-accent)' : 'var(--vendor-warning)' }}>
                        {deviation === 0 ? 'None' : `${deviation > 0 ? '+' : ''}₹${deviation.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--panel-2)', padding: 12, borderRadius: 8, border: '1px solid var(--border-soft)', marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>EST. PAYMENT AFTER APPROVAL (excl. TDS 2%):</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--vendor-accent)', marginTop: 4, fontFamily: 'JetBrains Mono' }}>
                      ₹{Math.round(submittedNum * 0.98).toLocaleString()}
                    </div>
                  </div>
                </>
              )}

              {/* Upload Status */}
              <div style={{ marginTop: 12, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {invoiceFile ? <CheckCircle size={14} color="var(--vendor-accent)" /> : <div style={{ width: 14, height: 14, border: '2px solid var(--border-soft)', borderRadius: '50%' }} />}
                  <span style={{ color: invoiceFile ? 'var(--vendor-accent)' : 'var(--text-3)' }}>Invoice PDF</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {podFile ? <CheckCircle size={14} color="var(--vendor-accent)" /> : <div style={{ width: 14, height: 14, border: '2px solid var(--border-soft)', borderRadius: '50%' }} />}
                  <span style={{ color: podFile ? 'var(--vendor-accent)' : 'var(--text-3)' }}>Proof of Delivery (POD)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {supportFile ? <CheckCircle size={14} color="var(--vendor-accent)" /> : <div style={{ width: 14, height: 14, border: '2px dashed var(--border-soft)', borderRadius: '50%' }} />}
                  <span style={{ color: supportFile ? 'var(--vendor-accent)' : 'var(--text-3)' }}>Supporting Docs (Optional)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
