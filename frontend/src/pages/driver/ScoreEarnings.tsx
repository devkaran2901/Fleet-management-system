import React, { useState } from 'react';
import {
  Award,
  DollarSign,
  Calendar,
  CheckCircle,
  ShieldCheck,
  Zap,
  Fuel,
  Clock,
} from 'lucide-react';

export const ScoreEarnings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Earnings' | 'Scorecard'>('Earnings');

  const currentMonthEarnings = 48500;
  const previousMonthEarnings = 45200;
  const incentives = 6200;
  const penalties = 450;

  const earningsHistory = [
    { month: 'July 2026 (MTD)', trips: 14, base: 42300, incentives: 6200, deductions: 450, net: 48050 },
    { month: 'June 2026', trips: 18, base: 40000, incentives: 5500, deductions: 300, net: 45200 },
    { month: 'May 2026', trips: 17, base: 39500, incentives: 4800, deductions: 0, net: 44300 },
    { month: 'April 2026', trips: 16, base: 38000, incentives: 4200, deductions: 200, net: 42000 },
  ];

  const metrics = [
    { label: 'On-Time Reporting Rate', value: '98.5%', target: '> 95%', icon: Clock, color: 'var(--green)' },
    { label: 'On-Time Delivery Rate', value: '96.2%', target: '> 92%', icon: CheckCircle, color: 'var(--green)' },
    { label: 'Safety Violations / Events', value: '0 Events', target: '0 Target', icon: ShieldCheck, color: '#3B82F6' },
    { label: 'Fuel Efficiency Rating', value: '4.8 km/L', target: '> 4.5 km/L', icon: Fuel, color: 'var(--amber)' },
    { label: 'Trip Completion Rate', value: '100%', target: '100%', icon: Zap, color: 'var(--green)' },
  ];

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text-1)' }}>Driver Performance Scorecard & Monthly Earnings</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-2)' }}>
            Track safety score, fuel efficiency bonuses, monthly trip earnings & performance scorecard metrics.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          className={activeTab === 'Earnings' ? 'driver-btn-primary' : 'driver-btn-secondary'}
          onClick={() => setActiveTab('Earnings')}
          style={{ padding: '8px 16px', fontSize: 13 }}
        >
          <DollarSign size={16} /> Earnings & Incentives
        </button>

        <button
          className={activeTab === 'Scorecard' ? 'driver-btn-primary' : 'driver-btn-secondary'}
          onClick={() => setActiveTab('Scorecard')}
          style={{ padding: '8px 16px', fontSize: 13 }}
        >
          <Award size={16} /> Performance Scorecard
        </button>
      </div>

      {activeTab === 'Earnings' ? (
        <div>
          <div className="driver-kpi-grid">
            <div className="driver-kpi-card" style={{ background: 'var(--panel-2)', border: '1px solid var(--green)' }}>
              <div className="driver-kpi-label" style={{ color: 'var(--green)' }}>CURRENT MONTH EARNINGS</div>
              <div className="driver-kpi-val" style={{ color: 'var(--green)', fontSize: 28 }}>
                ₹{currentMonthEarnings.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>July 2026 Projected Net</div>
            </div>

            <div className="driver-kpi-card">
              <div className="driver-kpi-label">Previous Month Earnings</div>
              <div className="driver-kpi-val" style={{ color: 'var(--text-1)' }}>
                ₹{previousMonthEarnings.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>June 2026 Settled Payout</div>
            </div>

            <div className="driver-kpi-card">
              <div className="driver-kpi-label">Performance Incentives</div>
              <div className="driver-kpi-val" style={{ color: '#3B82F6' }}>
                + ₹{incentives.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: '#3B82F6' }}>On-Time & Safety Bonuses</div>
            </div>

            <div className="driver-kpi-card">
              <div className="driver-kpi-label">Penalties / Deductions</div>
              <div className="driver-kpi-val" style={{ color: 'var(--red)' }}>
                - ₹{penalties.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Stoppage Delay Deduction</div>
            </div>
          </div>

          <div className="driver-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-soft)', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar color="var(--green)" size={18} /> HISTORICAL MONTHLY PAYOUT BREAKDOWN
            </div>

            <table className="driver-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Trips Completed</th>
                  <th>Base Pay (₹)</th>
                  <th>Incentives (₹)</th>
                  <th>Deductions (₹)</th>
                  <th>Net Payout (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {earningsHistory.map((row, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--text-1)' }}>{row.month}</span>
                    </td>
                    <td>{row.trips} Trips</td>
                    <td>₹{row.base.toLocaleString()}</td>
                    <td style={{ color: 'var(--green)', fontWeight: 700 }}>+ ₹{row.incentives.toLocaleString()}</td>
                    <td style={{ color: row.deductions > 0 ? 'var(--red)' : 'var(--text-2)' }}>
                      {row.deductions > 0 ? `- ₹${row.deductions.toLocaleString()}` : '₹0'}
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--green)', fontSize: 14 }}>
                      ₹{row.net.toLocaleString()}
                    </td>
                    <td>
                      <span className={`driver-status-pill ${idx === 0 ? 'pending' : 'approved'}`}>
                        {idx === 0 ? 'Accruing' : 'Paid Out'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          <div className="driver-card" style={{ background: 'var(--panel-2)', border: '1px solid var(--green)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  OVERALL DRIVER SAFETY & QUALITY SCORE
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-1)', marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  94 <span style={{ fontSize: 18, color: 'var(--text-2)', fontWeight: 600 }}>/ 100</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, marginTop: 4 }}>
                  ★ Tier 1 Elite Commercial Driver Status
                </div>
              </div>

              <div style={{ width: 220, height: 70 }}>
                <div style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 700, marginBottom: 4 }}>6-MONTH PERFORMANCE TREND</div>
                <svg viewBox="0 0 200 50" style={{ width: '100%', height: '100%' }}>
                  <path
                    d="M 10 40 Q 40 25 70 30 T 130 15 T 190 8"
                    fill="none"
                    stroke="var(--green)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="190" cy="8" r="4" fill="var(--green)" />
                </svg>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
            {metrics.map((m, idx) => {
              const IconComp = m.icon;
              return (
                <div key={idx} className="driver-kpi-card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="driver-kpi-label">{m.label}</span>
                    <IconComp size={18} color={m.color} />
                  </div>
                  <div className="driver-kpi-val" style={{ color: m.color, marginTop: 8 }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>Target: <strong style={{ color: 'var(--text-1)' }}>{m.target}</strong></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
