import React, { useEffect, useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { financeApi } from '../../services/financeApi';
import { Panel, Button, Badge, LoadingState, ErrorState, useToast } from '../../components/admin/ui';

export const FinanceReports: React.FC = () => {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'budgetVsActual' | 'costPerKm' | 'workingCapital' | 'paymentStatus' | 'costTraceability' | 'vendorPayments' | 'invoiceSummary'
  >('budgetVsActual');
  const { notify } = useToast();

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.getReports();
      setReports(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load financial reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleExport = (reportName: string, format: 'CSV' | 'Excel' | 'PDF') => {
    let contentStr = '';
    if (reports && activeTab === 'budgetVsActual') {
      contentStr = JSON.stringify(reports.budgetVsActual, null, 2);
    } else if (reports && activeTab === 'costPerKm') {
      contentStr = JSON.stringify(reports.costPerKm, null, 2);
    } else {
      contentStr = JSON.stringify(reports || {}, null, 2);
    }

    const blob = new Blob([contentStr], { type: format === 'PDF' ? 'application/pdf' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName}_Export.${format.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
    notify('success', `Exported ${reportName} in ${format} format`);
  };

  if (loading) return <LoadingState label="Loading Finance Reports Suite" />;
  if (error) return <ErrorState message={error} onRetry={loadReports} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
            Financial Reports Suite
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            PRD Finance Reports: Budget vs Actual, Cost per KM, Working Capital, Cost Traceability, Vendor & Customer Summaries.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="subtle" icon={<FileSpreadsheet size={14} />} onClick={() => handleExport(activeTab, 'Excel')}>
            Export Excel
          </Button>
          <Button variant="ghost" icon={<Download size={14} />} onClick={() => handleExport(activeTab, 'CSV')}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', borderBottom: '1px solid var(--border-soft)', paddingBottom: 8 }}>
        {[
          { key: 'budgetVsActual', label: 'Budget vs Actual' },
          { key: 'costPerKm', label: 'Cost per KM' },
          { key: 'workingCapital', label: 'Working Capital Cycle' },
          { key: 'paymentStatus', label: 'Payment Status' },
          { key: 'costTraceability', label: 'Cost Traceability' },
          { key: 'vendorPayments', label: 'Vendor Payment Summary' },
          { key: 'invoiceSummary', label: 'Invoice Summary' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === tab.key ? 'var(--panel-2)' : 'transparent',
              color: activeTab === tab.key ? 'var(--green)' : 'var(--text-2)',
              outline: activeTab === tab.key ? '1px solid var(--border-soft)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'budgetVsActual' && (
        <Panel title="Budget vs Actual Report" subtitle="Head-wise budget allocation, actual spend, commitments, and variance">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Category / Department</th>
                <th>Allocated Budget</th>
                <th>Actual Spend</th>
                <th>Open Commitments</th>
                <th>Variance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(reports?.budgetVsActual || []).map((b: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{b.category}</td>
                  <td>₹{b.allocated.toLocaleString()}</td>
                  <td>₹{b.actual.toLocaleString()}</td>
                  <td style={{ color: 'var(--amber)' }}>₹{b.committed.toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: b.variance < 0 ? '#ef4444' : 'var(--green)' }}>
                    {b.variance < 0 ? `-₹${Math.abs(b.variance).toLocaleString()}` : `+₹${b.variance.toLocaleString()}`}
                  </td>
                  <td>
                    <Badge tone={b.status === 'Exception' ? 'red' : b.status === 'Warning' ? 'amber' : 'green'}>{b.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {activeTab === 'costPerKm' && (
        <Panel title="Cost per KM Analysis (The CFO Number of Record)" subtitle="Fleet category cost grain per kilometer and benchmark variance">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Vehicle Class / Type</th>
                <th>Total Operations KM</th>
                <th>Total Operations Cost</th>
                <th>Cost per KM</th>
                <th>Benchmark Rate</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {(reports?.costPerKm || []).map((c: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{c.vehicleType}</td>
                  <td>{c.totalKm.toLocaleString()} km</td>
                  <td>₹{c.totalCost.toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>₹{c.costPerKm} / km</td>
                  <td>₹{c.benchmark} / km</td>
                  <td>
                    <Badge tone={c.costPerKm <= c.benchmark ? 'green' : 'amber'}>
                      {c.costPerKm <= c.benchmark ? 'Optimal' : 'Above Benchmark'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {activeTab === 'workingCapital' && (
        <Panel title="Working Capital Cycle Report" subtitle="DSO, DPO, and Cash Conversion Cycle metrics">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div style={{ backgroundColor: 'var(--panel-2)', padding: 14, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
              <span className="mono-label" style={{ fontSize: 9 }}>DAYS SALES OUTSTANDING (DSO)</span>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: 'var(--text-1)' }}>
                {reports?.workingCapital.dsoDays} Days
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--panel-2)', padding: 14, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
              <span className="mono-label" style={{ fontSize: 9 }}>DAYS PAYABLE OUTSTANDING (DPO)</span>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: 'var(--text-1)' }}>
                {reports?.workingCapital.dpoDays} Days
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--panel-2)', padding: 14, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
              <span className="mono-label" style={{ fontSize: 9 }}>WORKING CAPITAL GAP</span>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: 'var(--green)' }}>
                {reports?.workingCapital.workingCapitalGap} Days
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--panel-2)', padding: 14, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
              <span className="mono-label" style={{ fontSize: 9 }}>CASH CONVERSION CYCLE</span>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: 'var(--text-1)' }}>
                {reports?.workingCapital.cashConversionCycle} Days
              </div>
            </div>
          </div>
        </Panel>
      )}

      {activeTab === 'paymentStatus' && (
        <Panel title="Payment Status Summary" subtitle="Disbursement summary across banking, UPI, FASTag, and Fuel cards">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Disbursement Mode</th>
                <th>Transaction Count</th>
                <th>Total Disbursed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(reports?.paymentStatus || []).map((p: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{p.mode}</td>
                  <td>{p.count} Transactions</td>
                  <td style={{ fontWeight: 700 }}>₹{p.amount.toLocaleString()}</td>
                  <td>
                    <Badge tone={p.status === 'Completed' ? 'green' : 'amber'}>{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {activeTab === 'costTraceability' && (
        <Panel title="Cost Traceability Audit Report" subtitle="100% trip and maintenance cost allocation audit">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{ backgroundColor: 'var(--panel-2)', padding: 14, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
              <span className="mono-label" style={{ fontSize: 9 }}>TOTAL EXPENSE EVENTS</span>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: 'var(--text-1)' }}>
                ₹{reports?.costTraceability.totalTripExpenses.toLocaleString()}
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--panel-2)', padding: 14, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
              <span className="mono-label" style={{ fontSize: 9 }}>FULLY TRACED TO TRIPS</span>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: 'var(--green)' }}>
                ₹{reports?.costTraceability.fullyTraced.toLocaleString()}
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--panel-2)', padding: 14, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
              <span className="mono-label" style={{ fontSize: 9 }}>TRACEABILITY SCORE</span>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, color: 'var(--green)' }}>
                {reports?.costTraceability.traceabilityScore}%
              </div>
            </div>
          </div>
        </Panel>
      )}

      {activeTab === 'vendorPayments' && (
        <Panel title="Vendor Payment Summary" subtitle="Gross billed, TDS deductions (Section 194C), and net payments">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Gross Billed</th>
                <th>TDS Deducted (2%)</th>
                <th>Net Disbursed</th>
                <th>Pending Balance</th>
              </tr>
            </thead>
            <tbody>
              {(reports?.vendorPaymentSummary || []).map((v: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{v.vendor}</td>
                  <td>₹{v.grossBilled.toLocaleString()}</td>
                  <td style={{ color: 'var(--text-3)' }}>₹{v.tdsDeducted.toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: 'var(--green)' }}>₹{v.netPaid.toLocaleString()}</td>
                  <td style={{ color: 'var(--amber)', fontWeight: 600 }}>₹{v.pending.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {activeTab === 'invoiceSummary' && (
        <Panel title="Customer Invoice Summary" subtitle="Total billed, collections, outstanding receivables, and DSO">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Total Billed</th>
                <th>Collections Received</th>
                <th>Outstanding Balance</th>
                <th>Customer DSO</th>
              </tr>
            </thead>
            <tbody>
              {(reports?.invoiceSummary || []).map((i: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{i.customer}</td>
                  <td>₹{i.totalBilled.toLocaleString()}</td>
                  <td style={{ color: 'var(--green)' }}>₹{i.totalPaid.toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: 'var(--amber)' }}>₹{i.outstanding.toLocaleString()}</td>
                  <td>{i.dsoDays} Days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
};
