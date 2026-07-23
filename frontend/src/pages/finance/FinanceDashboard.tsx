import React, { useEffect, useState } from 'react';
import {
  PieChart,
  CreditCard,
  CheckSquare,
  Receipt,
  FileText,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import { financeApi } from '../../services/financeApi';
import type { FinanceKPIs } from '../../services/financeApi';
import { Panel, Button, Badge, LoadingState, ErrorState } from '../../components/admin/ui';
import { useNavigate } from 'react-router-dom';

export const FinanceDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<FinanceKPIs | null>(null);
  const [widgets, setWidgets] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [kpiRes, widgetRes] = await Promise.all([
        financeApi.getKPIs(),
        financeApi.getDashboardWidgets(),
      ]);
      setKpis(kpiRes);
      setWidgets(widgetRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to load Finance dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingState label="Loading Finance Manager Workspace" />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
            Finance Workspace (R-14)
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            Budget commitments, payment governance, financial approvals (AF-07/AF-11), and cost traceability.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" icon={<ArrowUpRight size={14} />} onClick={() => navigate('/finance/reports')}>
            Financial Reports
          </Button>
          <Button variant="primary" icon={<CreditCard size={14} />} onClick={() => navigate('/finance/payments')}>
            Payment Queue
          </Button>
        </div>
      </div>

      {/* Top 8 KPI Cards Grid */}
      <div className="adm-grid-4">
        {/* 1. Budget vs Actual + Commitment */}
        <div className="adm-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>BUDGET VS ACTUAL</span>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--green)', padding: 6, borderRadius: 8, display: 'flex' }}>
              <PieChart size={16} />
            </div>
          </div>
          <span className="adm-stat-num">
            ₹{(kpis?.budgetVsActualCommitment.actual || 0).toLocaleString()}
          </span>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-soft)', paddingTop: 8 }}>
            <span>Budget: ₹{(kpis?.budgetVsActualCommitment.allocated || 0).toLocaleString()}</span>
            <span style={{ color: 'var(--amber)', fontWeight: 600 }}>
              +₹{(kpis?.budgetVsActualCommitment.committed || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 2. Pending Payment Runs */}
        <div className="adm-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>PENDING PAYMENT RUNS</span>
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', padding: 6, borderRadius: 8, display: 'flex' }}>
              <CreditCard size={16} />
            </div>
          </div>
          <span className="adm-stat-num">{kpis?.pendingPaymentRuns ?? 0}</span>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, borderTop: '1px solid var(--border-soft)', paddingTop: 8 }}>
            Maker-Checker batches awaiting release
          </div>
        </div>

        {/* 3. Pending Financial Approvals */}
        <div className="adm-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>PENDING APPROVALS</span>
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', padding: 6, borderRadius: 8, display: 'flex' }}>
              <CheckSquare size={16} />
            </div>
          </div>
          <span className="adm-stat-num">{kpis?.pendingApprovals ?? 0}</span>
          <div style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600, marginTop: 8, borderTop: '1px solid var(--border-soft)', paddingTop: 8 }}>
            AF-07 Vendor Bills & AF-11 Exceptions
          </div>
        </div>

        {/* 4. Vendor Bills Pending */}
        <div className="adm-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>VENDOR BILLS PENDING</span>
            <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', padding: 6, borderRadius: 8, display: 'flex' }}>
              <Receipt size={16} />
            </div>
          </div>
          <span className="adm-stat-num">{kpis?.vendorBillsPending ?? 0}</span>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, borderTop: '1px solid var(--border-soft)', paddingTop: 8 }}>
            3-Way auto-match & deviation queue
          </div>
        </div>

        {/* 5. Customer Invoices Pending */}
        <div className="adm-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>CUSTOMER INVOICES</span>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: 6, borderRadius: 8, display: 'flex' }}>
              <FileText size={16} />
            </div>
          </div>
          <span className="adm-stat-num">{kpis?.customerInvoicesPending ?? 0}</span>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, borderTop: '1px solid var(--border-soft)', paddingTop: 8 }}>
            POD-verified invoices awaiting release
          </div>
        </div>

        {/* 6. Budget Exceptions */}
        <div className="adm-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>BUDGET EXCEPTIONS</span>
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', padding: 6, borderRadius: 8, display: 'flex' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <span className="adm-stat-num" style={{ color: '#ef4444' }}>{kpis?.budgetExceptions ?? 0}</span>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, borderTop: '1px solid var(--border-soft)', paddingTop: 8 }}>
            &gt;10% head variance requiring signoff
          </div>
        </div>

        {/* 7. Working Capital Cycle */}
        <div className="adm-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>WORKING CAPITAL</span>
            <div style={{ backgroundColor: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4', padding: 6, borderRadius: 8, display: 'flex' }}>
              <Clock size={16} />
            </div>
          </div>
          <span className="adm-stat-num">{kpis?.workingCapitalCycleDays ?? 28} Days</span>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, borderTop: '1px solid var(--border-soft)', paddingTop: 8 }}>
            DSO 28d vs DPO 34d (Cash Gap -6d)
          </div>
        </div>

        {/* 8. Cost Traceability */}
        <div className="adm-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>COST TRACEABILITY</span>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--green)', padding: 6, borderRadius: 8, display: 'flex' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <span className="adm-stat-num" style={{ color: 'var(--green)' }}>{kpis?.costTraceabilityPercent ?? 98.4}%</span>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, borderTop: '1px solid var(--border-soft)', paddingTop: 8 }}>
            100% trip & ops spend allocation
          </div>
        </div>
      </div>

      {/* PRD Role KPIs Banner */}
      <Panel style={{ backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, textAlign: 'center' }}>
          <div style={{ borderRight: '1px solid var(--border-soft)', paddingRight: 12 }}>
            <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>COST PER KM (RECORD)</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>
              ₹{kpis?.costPerKm ?? 38.45} / km
            </div>
          </div>
          <div style={{ borderRight: '1px solid var(--border-soft)', paddingRight: 12 }}>
            <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>BUDGET VARIANCE</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)', marginTop: 4 }}>
              {kpis?.budgetVariancePercent ?? -4.8}% Under Budget
            </div>
          </div>
          <div style={{ borderRight: '1px solid var(--border-soft)', paddingRight: 12 }}>
            <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>TRACEABILITY SCORE</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>
              {kpis?.costTraceabilityPercent ?? 98.4}% Traced
            </div>
          </div>
          <div>
            <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>WORKING CAPITAL CYCLE</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>
              {kpis?.workingCapitalCycleDays ?? 28} Days
            </div>
          </div>
        </div>
      </Panel>

      {/* Main Widgets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 20 }}>
        {/* Widget 1: Budget Overview */}
        <Panel
          title="Budget Overview"
          subtitle="Department & Cost Center allocation vs actual vs commitments"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/finance/budget')}>
              View All Budgets
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(widgets?.budgetOverview || []).map((b: any) => {
              const totalUsed = b.actualAmount + b.committedAmount;
              const pct = Math.min(100, Math.round((totalUsed / b.budgetAmount) * 100));
              return (
                <div key={b.id} style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{b.department}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 8 }}>({b.costCenter})</span>
                    </div>
                    <Badge tone={b.status === 'Exception' ? 'red' : b.status === 'Warning' ? 'amber' : 'green'}>
                      {b.status} ({pct}%)
                    </Badge>
                  </div>
                  <div style={{ height: 8, width: '100%', backgroundColor: 'var(--border-soft)', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${Math.min(100, (b.actualAmount / b.budgetAmount) * 100)}%`, backgroundColor: 'var(--green)' }} title="Actual Spend" />
                    <div style={{ width: `${Math.min(100, (b.committedAmount / b.budgetAmount) * 100)}%`, backgroundColor: '#f59e0b' }} title="Committed Spend" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
                    <span>Actual: ₹{b.actualAmount.toLocaleString()}</span>
                    <span>Committed: ₹{b.committedAmount.toLocaleString()}</span>
                    <span>Budget: ₹{b.budgetAmount.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Widget 2: Payment Queue */}
        <Panel
          title="Payment Queue"
          subtitle="Batch disbursements awaiting release & dual authorization"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/finance/payments')}>
              Manage Queue
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(widgets?.paymentQueue || []).map((p: any) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: 'var(--panel-2)', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)', display: 'block' }}>{p.batchNumber}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.vendor} · {p.paymentMode}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>₹{p.amount.toLocaleString()}</div>
                  <Badge tone={p.approval === 'Released' ? 'green' : 'amber'}>{p.approval}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Widget 3: Approval Queue */}
        <Panel
          title="Approval Queue"
          subtitle="AF-07 Vendor Bill & AF-11 Budget Exception requests"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/finance/approvals')}>
              Review Queue
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(widgets?.approvalQueue || []).map((a: any) => (
              <div key={a.id} style={{ padding: 12, backgroundColor: 'var(--panel-2)', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono-label" style={{ fontSize: 10, color: 'var(--green)' }}>{a.flowCode} · {a.flowName}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)' }}>₹{a.amount.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', marginTop: 4 }}>{a.entityRef}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Requested by: {a.requestedBy}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Widget 4: Close Blockers */}
        <Panel
          title="Month-End Close Blockers"
          subtitle="Exceptions blocking month-end cost sweep and publication"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(widgets?.closeBlockers || []).map((b: any) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, backgroundColor: 'var(--panel-2)', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                <AlertTriangle size={16} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{b.title}</span>
                    <Badge tone="red">{b.status}</Badge>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{b.category} — {b.action}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Widget 5: Monthly Spend Breakdown */}
        <Panel
          title="Monthly Spend Trend"
          subtitle="POL fuel, maintenance, market hire & driver bhatta"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(widgets?.monthlySpend || []).map((m: any) => (
              <div key={m.month} style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }}>
                  <span>{m.month} 2026</span>
                  <span>Total: ₹{((m.pol + m.maintenance + m.hire + m.bhatta) / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-3)' }}>
                  <span>POL: <strong>₹{(m.pol / 100000).toFixed(1)}L</strong></span>
                  <span>Maint: <strong>₹{(m.maintenance / 100000).toFixed(1)}L</strong></span>
                  <span>Hire: <strong>₹{(m.hire / 100000).toFixed(1)}L</strong></span>
                  <span>Bhatta: <strong>₹{(m.bhatta / 100000).toFixed(1)}L</strong></span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Widget 6: Budget Variance Summary */}
        <Panel
          title="Budget Variance Summary"
          subtitle="Department variance vs allocated limits"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(widgets?.budgetVariance || []).map((v: any) => (
              <div key={v.costCenter} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: 'var(--panel-2)', borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', display: 'block' }}>{v.department}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{v.costCenter}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: v.variance < 0 ? '#ef4444' : 'var(--green)' }}>
                    {v.variance < 0 ? `-₹${Math.abs(v.variance).toLocaleString()}` : `+₹${v.variance.toLocaleString()}`}
                  </div>
                  <Badge tone={v.status === 'Exception' ? 'red' : v.status === 'Warning' ? 'amber' : 'green'}>{v.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
};
