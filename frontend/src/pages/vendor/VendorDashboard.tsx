import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  CheckCircle,
  Truck,
  AlertTriangle,
  FileText,
  CreditCard,
  Award,
  TrendingUp,
  Bell,
  Clock,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { initialIndents, initialPlacements, initialVehicles } from './vendorDataStore';
import '../../styles/vendor.css';

export const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const awaitingIndents = initialIndents.filter((i) => i.status === 'AWAITING');
  const activePlacements = initialPlacements.filter((p) => p.status !== 'Closed');
  const expiringVehicles = initialVehicles.filter((v) => v.overallStatus !== 'Valid');

  return (
    <div className="vp-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner */}
      <div
        className="vp-card"
        style={{
          backgroundColor: 'var(--panel-2)',
          border: '1px solid var(--border-soft)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="vp-badge vp-badge-success">PREMIUM VENDOR PARTNER</span>
            <span className="vp-badge vp-badge-purple">GRADE A+ (94/100)</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 8, color: 'var(--text-1)' }}>
            Welcome back, Express Logistics Pvt Ltd! 👋
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
            Here is your live operations summary, indent response countdowns, and financial settlements.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="vp-btn vp-btn-primary" onClick={() => navigate('/vendor/indents')}>
            <Inbox size={16} /> View Indent Inbox ({awaitingIndents.length})
          </button>
          <button className="vp-btn vp-btn-secondary" onClick={() => navigate('/vendor/bills/new')}>
            <FileText size={16} /> Submit New Bill
          </button>
        </div>
      </div>

      {/* 10 WIDGETS GRID */}

      {/* Row 1: Key Metrics (4 Stat Cards) */}
      <div className="vp-grid-4">
        {/* Widget 1: Active indents awaiting response */}
        <div className="vp-stat-card vp-card-interactive" onClick={() => navigate('/vendor/indents')}>
          <div>
            <div className="vp-stat-lbl">Active Indents</div>
            <div className="vp-stat-val" style={{ color: 'var(--vendor-accent)' }}>
              {awaitingIndents.length}
            </div>
            <div style={{ fontSize: 11, color: 'var(--vendor-danger)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> Next expires in 14m
            </div>
          </div>
          <div className="vp-stat-icon">
            <Inbox size={22} />
          </div>
        </div>

        {/* Widget 2: Placements in progress */}
        <div className="vp-stat-card vp-card-interactive" onClick={() => navigate('/vendor/placements')}>
          <div>
            <div className="vp-stat-lbl">Placements In Progress</div>
            <div className="vp-stat-val" style={{ color: '#3b82f6' }}>
              {activePlacements.length}
            </div>
            <div style={{ fontSize: 11, color: 'var(--vendor-warning)', marginTop: 4 }}>
              1 Hold Requires Action
            </div>
          </div>
          <div className="vp-stat-icon" style={{ background: 'var(--vendor-info-light)', color: '#3b82f6' }}>
            <CheckCircle size={22} />
          </div>
        </div>

        {/* Widget 3: Trips running today */}
        <div className="vp-stat-card vp-card-interactive" onClick={() => navigate('/vendor/trips')}>
          <div>
            <div className="vp-stat-lbl">Trips Running Today</div>
            <div className="vp-stat-val" style={{ color: '#8b5cf6' }}>
              3
            </div>
            <div style={{ fontSize: 11, color: 'var(--vendor-accent)', marginTop: 4 }}>
              All 3 AIS-140 GPS Online
            </div>
          </div>
          <div className="vp-stat-icon" style={{ background: 'var(--vendor-purple-light)', color: '#8b5cf6' }}>
            <Truck size={22} />
          </div>
        </div>

        {/* Widget 4: Vehicles with expiring documents */}
        <div className="vp-stat-card vp-card-interactive" onClick={() => navigate('/vendor/fleet')}>
          <div>
            <div className="vp-stat-lbl">Expiring Docs</div>
            <div className="vp-stat-val" style={{ color: 'var(--vendor-danger)' }}>
              {expiringVehicles.length}
            </div>
            <div style={{ fontSize: 11, color: 'var(--vendor-danger)', marginTop: 4 }}>
              1 Expired (MH-12-PQ-9988)
            </div>
          </div>
          <div className="vp-stat-icon" style={{ background: 'var(--vendor-danger-light)', color: 'var(--vendor-danger)' }}>
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Row 2: Financial Widgets & Performance */}
      <div className="vp-grid-3">
        {/* Widget 5 & 6: Bills Pending & Under Verification */}
        <div className="vp-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="var(--vendor-accent)" /> Billing Pipeline
            </h3>
            <button className="vp-btn vp-btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => navigate('/vendor/bills')}>
              View All <ChevronRight size={12} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'var(--panel-2)', padding: 14, borderRadius: 10, border: '1px solid var(--border-soft)' }}>
              <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>PENDING SUBMISSION</span>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', marginTop: 4 }}>
                ₹1,10,500
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>2 Trips Completed</span>
            </div>

            <div style={{ background: 'var(--panel-2)', padding: 14, borderRadius: 10, border: '1px solid var(--border-soft)' }}>
              <span className="mono-label" style={{ fontSize: 10, color: 'var(--vendor-warning)' }}>UNDER VERIFICATION</span>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--vendor-warning)', marginTop: 4 }}>
                ₹1,04,500
              </div>
              <span style={{ fontSize: 11, color: 'var(--vendor-danger)' }}>1 Deviation Found</span>
            </div>
          </div>
        </div>

        {/* Widget 7: Payments awaiting release */}
        <div className="vp-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={18} color="#3b82f6" /> Settlement Queue
            </h3>
            <button className="vp-btn vp-btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => navigate('/vendor/payments')}>
              Payout Details <ChevronRight size={12} />
            </button>
          </div>

          <div style={{ background: 'var(--panel-2)', padding: 16, borderRadius: 10, border: '1px solid var(--border-soft)', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)' }}>
              <span>Scheduled Payouts (This Week)</span>
              <span style={{ color: 'var(--vendor-accent)', fontWeight: 600 }}>25th July 2026</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-1)', marginTop: 4, fontFamily: 'JetBrains Mono' }}>
              ₹1,07,800 <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-3)' }}>(Net of TDS & Penalties)</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Last Disbursed (22nd July):</span>
            <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>₹47,030 (UTR: HDFC-9982)</span>
          </div>
        </div>

        {/* Widget 8 & 9: Scorecard & Business Share Trend */}
        <div className="vp-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={18} color="#8b5cf6" /> Scorecard & Market Share
            </h3>
            <button className="vp-btn vp-btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => navigate('/vendor/scorecard')}>
              Full Scorecard <ChevronRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'conic-gradient(var(--vendor-accent) 94%, var(--panel-2) 0)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--panel-1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--vendor-accent)', lineHeight: 1 }}>94%</span>
                <span style={{ fontSize: 8, color: 'var(--text-3)' }}>SCORE</span>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                Business Share Allocation: <span style={{ color: 'var(--vendor-accent)' }}>34% (Rank #1)</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'var(--panel-2)', borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
                <div style={{ width: '34%', height: '100%', background: 'var(--vendor-accent)', borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <TrendingUp size={12} color="var(--vendor-accent)" /> +4% share growth vs last month
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Indents Awaiting Action & Live Alerts Feed */}
      <div className="vp-grid-2">
        {/* Active Indents Widget */}
        <div className="vp-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="var(--vendor-danger)" /> Indents Awaiting Response
            </h3>
            <span className="vp-badge vp-badge-danger">URGENT</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {awaitingIndents.map((indent) => (
              <div
                key={indent.id}
                style={{
                  background: 'var(--panel-2)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: 10,
                  padding: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{indent.id}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>• {indent.customer}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 600, marginTop: 4 }}>
                    {indent.route}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                    Req: {indent.vehicleTypeRequired} ({indent.capacityRequired})
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="vp-timer-pill">
                    <Clock size={12} /> {Math.floor(indent.remainingSeconds / 60)}m {indent.remainingSeconds % 60}s
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <button
                      className="vp-btn vp-btn-primary"
                      style={{ padding: '4px 10px', fontSize: 11 }}
                      onClick={() => navigate(`/vendor/indents?accept=${indent.id}`)}
                    >
                      Respond Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 10: Alerts & Notifications */}
        <div className="vp-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={18} color="var(--vendor-warning)" /> Live Compliance & System Alerts
            </h3>
            <button className="vp-btn vp-btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => navigate('/vendor/notifications')}>
              All Alerts <ChevronRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: 'var(--vendor-danger-light)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: 12, borderRadius: 8, display: 'flex', gap: 10 }}>
              <ShieldAlert size={18} color="var(--vendor-danger)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--vendor-danger)' }}>
                  Vehicle Hold: MH-12-PQ-9988 Insurance Expired
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
                  Placement PLC-501 is blocked from gate entry until renewed insurance certificate is uploaded.
                </div>
                <button
                  className="vp-btn vp-btn-danger"
                  style={{ padding: '2px 8px', fontSize: 10, marginTop: 6 }}
                  onClick={() => navigate('/vendor/placements')}
                >
                  Open Fix-It Workflow
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--vendor-warning-light)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: 12, borderRadius: 8, display: 'flex', gap: 10 }}>
              <AlertTriangle size={18} color="var(--vendor-warning)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--vendor-warning)' }}>
                  Bill Deviation Flagged: BILL-8802
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
                  Amount ₹42,500 exceeds agreed rate ₹39,000. Customer audit requested clarification.
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--vendor-accent-light)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: 12, borderRadius: 8, display: 'flex', gap: 10 }}>
              <CheckCircle size={18} color="var(--vendor-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--vendor-accent)' }}>
                  Payment Scheduled: ₹1,07,800
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
                  Disbursement batch #224 will be released on July 25th directly to your HDFC Bank account.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
