import React, { useState } from 'react';
import { Award, TrendingUp, TrendingDown } from 'lucide-react';
import '../../styles/vendor.css';

const SCORECARD_MONTHS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
const TREND_SCORES = [88, 89, 91, 92, 93, 94];
const SHARE_TREND = [28, 29, 31, 30, 32, 34];

interface KPI {
  label: string;
  value: number;
  target: number;
  unit: string;
  category: string;
  trend: 'up' | 'down' | 'stable';
}

const KPIs: KPI[] = [
  { label: 'Acceptance Rate', value: 96, target: 90, unit: '%', category: 'Operations', trend: 'up' },
  { label: 'Placement Success Rate', value: 98, target: 95, unit: '%', category: 'Operations', trend: 'up' },
  { label: 'On-Time Reporting', value: 92, target: 90, unit: '%', category: 'Service Quality', trend: 'stable' },
  { label: 'On-Time Delivery', value: 95, target: 93, unit: '%', category: 'Service Quality', trend: 'up' },
  { label: 'Document Compliance', value: 100, target: 100, unit: '%', category: 'Compliance', trend: 'stable' },
  { label: 'Compliance Percentage', value: 97, target: 95, unit: '%', category: 'Compliance', trend: 'up' },
  { label: 'Rejection Rate', value: 2, target: 5, unit: '%', category: 'Quality', trend: 'down' },
  { label: 'Trip Completion Rate', value: 99, target: 95, unit: '%', category: 'Operations', trend: 'up' },
  { label: 'Billing Accuracy', value: 97, target: 95, unit: '%', category: 'Finance', trend: 'up' },
];

export const Scorecard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Category' | 'Trend' | 'Business Share'>('Overview');

  const overallScore = Math.round(KPIs.reduce((s, k) => {
    const score = k.label === 'Rejection Rate' ? (100 - k.value) : k.value;
    return s + score;
  }, 0) / KPIs.length);

  const categories = [...new Set(KPIs.map((k) => k.category))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="vp-page-header">
        <div>
          <div className="vp-page-title">
            <Award color="var(--vendor-accent)" /> Vendor Scorecard
          </div>
          <div className="vp-page-subtitle">
            Performance analytics, KPI breakdown, historical trend and business share allocation.
          </div>
        </div>
        <span className="vp-badge vp-badge-purple" style={{ padding: '10px 18px', fontSize: 14 }}>
          Grade A+ · Rank #1 of 12 Vendors
        </span>
      </div>

      {/* Overall Score Banner */}
      <div
        className="vp-card"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(139,92,246,0.08) 100%)',
          border: '1px solid rgba(16,185,129,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Circular Score Meter */}
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={60} cy={60} r={50} fill="none" stroke="var(--panel-2)" strokeWidth={10} />
              <circle
                cx={60} cy={60} r={50} fill="none"
                stroke="var(--vendor-accent)" strokeWidth={10}
                strokeDasharray={`${2 * Math.PI * 50 * overallScore / 100} ${2 * Math.PI * 50 * (100 - overallScore) / 100}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.8s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--vendor-accent)' }}>{overallScore}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>/ 100</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)' }}>Outstanding Performance</div>
            <div style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 4 }}>
              Overall Vendor Score for July 2026 — Evaluated across {KPIs.length} KPIs
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <span className="vp-badge vp-badge-success">Grade A+</span>
              <span className="vp-badge vp-badge-purple">Rank #1 / 12</span>
              <span className="vp-badge vp-badge-info">Preferred Vendor</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Business Share Allocation</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--vendor-accent)', fontFamily: 'JetBrains Mono' }}>34%</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginTop: 4 }}>
            <TrendingUp size={14} color="var(--vendor-accent)" />
            <span style={{ fontSize: 12, color: 'var(--vendor-accent)' }}>+4% vs last month</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="vp-tabs">
        {(['Overview', 'Category', 'Trend', 'Business Share'] as const).map((t) => (
          <button key={t} className={`vp-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      {/* === KPI OVERVIEW === */}
      {activeTab === 'Overview' && (
        <div className="vp-grid-3">
          {KPIs.map((kpi) => {
            const isReverse = kpi.label === 'Rejection Rate';
            const isGood = isReverse ? kpi.value <= kpi.target : kpi.value >= kpi.target;
            const barWidth = isReverse ? (100 - kpi.value) : kpi.value;

            return (
              <div key={kpi.label} className="vp-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{kpi.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{kpi.category}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: isGood ? 'var(--vendor-accent)' : 'var(--vendor-danger)', fontFamily: 'JetBrains Mono' }}>
                      {kpi.value}{kpi.unit}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Target: {kpi.target}{kpi.unit}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: 6, background: 'var(--panel-2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${barWidth}%`,
                    height: '100%',
                    background: isGood ? 'var(--vendor-accent)' : 'var(--vendor-danger)',
                    borderRadius: 4,
                    transition: 'width 0.6s ease',
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  {kpi.trend === 'up' && <span style={{ fontSize: 11, color: 'var(--vendor-accent)', display: 'flex', alignItems: 'center', gap: 3 }}><TrendingUp size={12} /> Improving</span>}
                  {kpi.trend === 'down' && <span style={{ fontSize: 11, color: isReverse ? 'var(--vendor-accent)' : 'var(--vendor-danger)', display: 'flex', alignItems: 'center', gap: 3 }}><TrendingDown size={12} /> {isReverse ? 'Good ↓' : 'Declining'}</span>}
                  {kpi.trend === 'stable' && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Stable</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* === CATEGORY SCORES === */}
      {activeTab === 'Category' && (
        <div className="vp-grid-2">
          {categories.map((cat) => {
            const catKPIs = KPIs.filter((k) => k.category === cat);
            const catScore = Math.round(catKPIs.reduce((s, k) => s + (k.label === 'Rejection Rate' ? 100 - k.value : k.value), 0) / catKPIs.length);

            return (
              <div key={cat} className="vp-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>{cat}</h3>
                  <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--vendor-accent)', fontFamily: 'JetBrains Mono' }}>{catScore}%</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {catKPIs.map((kpi) => (
                    <div key={kpi.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{kpi.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 80, height: 4, background: 'var(--panel-2)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${kpi.label === 'Rejection Rate' ? 100 - kpi.value : kpi.value}%`, height: '100%', background: 'var(--vendor-accent)', borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', minWidth: 36, textAlign: 'right' }}>{kpi.value}{kpi.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* === HISTORICAL TREND === */}
      {activeTab === 'Trend' && (
        <div className="vp-card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Overall Score — 6-Month Historical Trend</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, height: 200, padding: '0 20px' }}>
            {SCORECARD_MONTHS.map((month, idx) => (
              <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: idx === SCORECARD_MONTHS.length - 1 ? 'var(--vendor-accent)' : 'var(--text-3)' }}>
                  {TREND_SCORES[idx]}
                </div>
                <div
                  style={{
                    width: '100%',
                    height: `${(TREND_SCORES[idx] / 100) * 160}px`,
                    background: idx === SCORECARD_MONTHS.length - 1
                      ? 'linear-gradient(to top, var(--vendor-accent), rgba(16,185,129,0.4))'
                      : 'var(--panel-2)',
                    borderRadius: '6px 6px 0 0',
                    border: `1px solid ${idx === SCORECARD_MONTHS.length - 1 ? 'var(--vendor-accent)' : 'var(--border-soft)'}`,
                    transition: 'height 0.5s ease',
                    position: 'relative',
                  }}
                />
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)' }}>{month}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === BUSINESS SHARE TREND === */}
      {activeTab === 'Business Share' && (
        <div className="vp-card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Business Share Allocation Trend (%)</h3>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 24 }}>
            Your share of the total freight volume awarded by customers each month, compared against other vendor partners.
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, height: 200, padding: '0 20px' }}>
            {SCORECARD_MONTHS.map((month, idx) => (
              <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: idx === SCORECARD_MONTHS.length - 1 ? 'var(--vendor-accent)' : 'var(--text-3)' }}>
                  {SHARE_TREND[idx]}%
                </div>
                <div
                  style={{
                    width: '100%',
                    height: `${(SHARE_TREND[idx] / 40) * 160}px`,
                    background: idx === SCORECARD_MONTHS.length - 1
                      ? 'linear-gradient(to top, #8b5cf6, rgba(139,92,246,0.4))'
                      : 'var(--panel-2)',
                    borderRadius: '6px 6px 0 0',
                    border: `1px solid ${idx === SCORECARD_MONTHS.length - 1 ? '#8b5cf6' : 'var(--border-soft)'}`,
                  }}
                />
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)' }}>{month}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { vendor: 'Express Logistics (YOU)', share: 34, rank: '#1' },
              { vendor: 'AK Freight Partners', share: 28, rank: '#2' },
              { vendor: 'Blue Star Carriers', share: 21, rank: '#3' },
            ].map((v) => (
              <div key={v.vendor} style={{ background: 'var(--panel-2)', padding: 14, borderRadius: 10, border: '1px solid var(--border-soft)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: v.rank === '#1' ? 'var(--vendor-accent)' : 'var(--text-1)' }}>{v.rank} {v.vendor}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: v.rank === '#1' ? 'var(--vendor-accent)' : 'var(--text-2)', fontFamily: 'JetBrains Mono', marginTop: 4 }}>{v.share}%</div>
                <div style={{ width: '100%', height: 4, background: 'var(--panel-1)', borderRadius: 2, overflow: 'hidden', marginTop: 6 }}>
                  <div style={{ width: `${v.share * 2.5}%`, height: '100%', background: v.rank === '#1' ? 'var(--vendor-accent)' : '#8b5cf6', borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
