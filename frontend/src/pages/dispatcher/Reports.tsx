import React, { useEffect, useState, useCallback } from 'react';
import { BarChart3, RefreshCw, Download, TrendingUp } from 'lucide-react';
import { dispatcherApi } from '../../services/dispatcherApi';
import type { ReportsSummary } from '../../services/dispatcherApi';
import { Badge, Button, ErrorState, LoadingState, Panel } from '../../components/admin/ui';

type TabType = 'DISPATCH' | 'STABILITY' | 'EXCEPTIONS' | 'VENDORS';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<ReportsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('DISPATCH');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dispatcherApi.reports();
      setReports(data);
    } catch (err: any) {
      setError(err?.message || 'Could not load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) return <LoadingState label="Compiling dispatcher reports..." />;
  if (error || !reports) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">P-18 · Dispatch Analysis</span>
          <h1 className="adm-page-title">
            <BarChart3 size={22} color="var(--green)" /> Operations Reports
          </h1>
          <p className="adm-page-sub">
            Performance analytics across dispatch runs, plan stability indicators, telematics exceptions, and placement scores.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="subtle" icon={<RefreshCw size={12} />} onClick={loadData}>Refresh</Button>
          <Button variant="primary" icon={<Download size={12} />}>Export CSV</Button>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-soft)', gap: 16, marginBottom: 16 }}>
        {[
          { id: 'DISPATCH', label: 'Daily Dispatch Volumes' },
          { id: 'STABILITY', label: 'Plan Stability Score' },
          { id: 'EXCEPTIONS', label: 'Exception Analytics Log' },
          { id: 'VENDORS', label: 'Transporter Placement' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            style={{
              padding: '10px 4px',
              border: 'none',
              background: 'none',
              color: activeTab === tab.id ? 'var(--green)' : 'var(--text-3)',
              borderBottom: activeTab === tab.id ? '2px solid var(--green)' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 600 : 500,
              fontSize: 13,
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DAILY DISPATCH VOLUMES */}
      {activeTab === 'DISPATCH' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
            <Panel title="Corridor Volume Metrics" subtitle="Weekly analysis summary">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ borderBottom: '1px solid var(--border-soft)', paddingBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Owned Fleet Share</span>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    71.4% <TrendingUp size={16} />
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Avg Daily Movements</span>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)' }}>20.1 runs</div>
                </div>
              </div>
            </Panel>

            <Panel title="Weekly Dispatch Summary" subtitle="Owned vs Vendor allocations ledger" padded={false}>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Dispatch Date</th>
                      <th>Owned Fleet Runs</th>
                      <th>Vendor Indents</th>
                      <th>Total Dispatches</th>
                      <th>Owned Fleet Share Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.dailyDispatch.map((d, idx) => {
                      const share = ((d.ownedCount / d.total) * 100).toFixed(1);
                      return (
                        <tr key={idx}>
                          <td className="adm-cell-mono">{d.date}</td>
                          <td className="adm-cell-mono">{d.ownedCount}</td>
                          <td className="adm-cell-mono">{d.vendorCount}</td>
                          <td className="adm-cell-mono" style={{ fontWeight: 600 }}>{d.total}</td>
                          <td className="adm-cell-mono" style={{ color: 'var(--green)' }}>{share}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* PLAN STABILITY */}
      {activeTab === 'STABILITY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Panel title="Plan Stability KPI" subtitle="Operational stability score matrix">
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: 'var(--green)', display: 'block' }}>
                  {reports.planStability.stabilityScore}%
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginTop: 6 }}>
                  Stability Index Score (Target: &gt;85%)
                </span>
              </div>
            </Panel>

            <Panel title="Operational Disruptions Logs" subtitle="Adjustments details count">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderBottom: '1px solid var(--border-soft)', paddingBottom: 6 }}>
                  <span>Total Planned Movements</span>
                  <span className="adm-cell-mono" style={{ fontWeight: 600 }}>{reports.planStability.totalPlanned}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderBottom: '1px solid var(--border-soft)', paddingBottom: 6 }}>
                  <span>Re-assigned Vehicles (Swaps)</span>
                  <span className="adm-cell-mono" style={{ color: 'var(--amber)' }}>{reports.planStability.swappedVehicles}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderBottom: '1px solid var(--border-soft)', paddingBottom: 6 }}>
                  <span>Re-assigned Drivers (Swaps)</span>
                  <span className="adm-cell-mono" style={{ color: 'var(--amber)' }}>{reports.planStability.swappedDrivers}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderBottom: '1px solid var(--border-soft)', paddingBottom: 6 }}>
                  <span>Cancelled Operations Runs</span>
                  <span className="adm-cell-mono" style={{ color: 'var(--red)' }}>{reports.planStability.cancelledTrips}</span>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* EXCEPTION SUMMARY */}
      {activeTab === 'EXCEPTIONS' && (
        <Panel title="Incidents Summary" subtitle="Total telemetry warnings categorizations" padded={false}>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Exception Telemetry Type</th>
                  <th>Occurrences Count</th>
                  <th>Critical Severity Trigger</th>
                  <th>System Status Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.exceptionSummary.map((e, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{e.type}</td>
                    <td className="adm-cell-mono">{e.count}</td>
                    <td className="adm-cell-mono" style={{ color: e.critical > 0 ? 'var(--red)' : 'inherit' }}>{e.critical}</td>
                    <td>
                      <Badge tone={e.critical > 5 ? 'red' : 'amber'}>
                        {e.critical > 5 ? 'Action Required' : 'Monitored'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* VENDOR FAILURES */}
      {activeTab === 'VENDORS' && (
        <Panel title="Transporter Performance Scorecard" subtitle="Indents placements metrics" padded={false}>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Transporter Vendor</th>
                  <th>Indents Issued</th>
                  <th>Accepted Confirmed</th>
                  <th>Placement Failures</th>
                  <th>Placement Rate Score</th>
                </tr>
              </thead>
              <tbody>
                {reports.vendorFailures.map((v, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{v.vendor}</td>
                    <td className="adm-cell-mono">{v.indentsSent}</td>
                    <td className="adm-cell-mono">{v.accepted}</td>
                    <td className="adm-cell-mono" style={{ color: v.placementFailures > 2 ? 'var(--red)' : 'inherit' }}>{v.placementFailures}</td>
                    <td className="adm-cell-mono" style={{ fontWeight: 700, color: v.placementRate >= 95 ? 'var(--green)' : 'var(--amber)' }}>
                      {v.placementRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </>
  );
};
