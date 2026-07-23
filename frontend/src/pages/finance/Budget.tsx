import React, { useEffect, useState } from 'react';
import { Eye, Filter, RefreshCw, Layers as CompareIcon } from 'lucide-react';
import { financeApi } from '../../services/financeApi';
import type { BudgetRecord } from '../../services/financeApi';
import { Panel, Button, Badge, Input, Select, Modal, LoadingState, ErrorState } from '../../components/admin/ui';

export const Budget: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<BudgetRecord | null>(null);
  const [compareModal, setCompareModal] = useState(false);

  // Filters
  const [monthFilter, setMonthFilter] = useState('');
  const [costCenterFilter, setCostCenterFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.getBudgets({
        month: monthFilter || undefined,
        costCenter: costCenterFilter || undefined,
        department: departmentFilter || undefined,
        status: statusFilter || undefined,
      });
      setBudgets(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [monthFilter, costCenterFilter, departmentFilter, statusFilter]);

  const parseJson = (val: any) => {
    if (!val) return [];
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return val;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
            Budget & Commitment Control
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            Cost center budgets, active commitments, AF-11 exceptions, and variance analytics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" icon={<RefreshCw size={14} />} onClick={loadBudgets}>
            Refresh
          </Button>
          <Button variant="subtle" icon={<CompareIcon size={14} />} onClick={() => setCompareModal(true)}>
            Compare Cost Centers
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Panel padded={false} style={{ backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', padding: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={15} color="var(--text-3)" />
          <span className="mono-label" style={{ fontSize: 10 }}>FILTERS:</span>
          
          <Select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={{ width: 140 }}>
            <option value="">All Months</option>
            <option value="2026-07">2026-07 (Jul)</option>
            <option value="2026-06">2026-06 (Jun)</option>
            <option value="2026-05">2026-05 (May)</option>
          </Select>

          <Input
            placeholder="Cost Center (e.g. CC-101)"
            value={costCenterFilter}
            onChange={(e) => setCostCenterFilter(e.target.value)}
            style={{ width: 160 }}
          />

          <Input
            placeholder="Department (e.g. POL)"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{ width: 180 }}
          />

          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 140 }}>
            <option value="">All Statuses</option>
            <option value="Normal">Normal</option>
            <option value="Warning">Warning</option>
            <option value="Exception">Exception</option>
          </Select>

          {(monthFilter || costCenterFilter || departmentFilter || statusFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMonthFilter('');
                setCostCenterFilter('');
                setDepartmentFilter('');
                setStatusFilter('');
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </Panel>

      {/* Budget Table */}
      {loading ? (
        <LoadingState label="Loading Cost Center Budgets" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadBudgets} />
      ) : (
        <Panel padded={false}>
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Budget ID / Cost Center</th>
                  <th>Department</th>
                  <th>Month</th>
                  <th>Budget</th>
                  <th>Actual</th>
                  <th>Committed</th>
                  <th>Variance</th>
                  <th>Utilization</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgets.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: 24, color: 'var(--text-3)' }}>
                      No budgets match the selected filters.
                    </td>
                  </tr>
                ) : (
                  budgets.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{b.budgetId}</div>
                        <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>{b.costCenter}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{b.department}</span>
                      </td>
                      <td>
                        <span className="mono-label" style={{ fontSize: 11 }}>{b.month}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{b.budgetAmount.toLocaleString()}</td>
                      <td style={{ color: 'var(--text-1)' }}>₹{b.actualAmount.toLocaleString()}</td>
                      <td style={{ color: 'var(--amber)', fontWeight: 600 }}>₹{b.committedAmount.toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: b.variance < 0 ? '#ef4444' : 'var(--green)' }}>
                        {b.variance < 0 ? `-₹${Math.abs(b.variance).toLocaleString()}` : `+₹${b.variance.toLocaleString()}`}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ flexGrow: 1, height: 6, width: 60, backgroundColor: 'var(--border-soft)', borderRadius: 3, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(100, b.percentage)}%`,
                                backgroundColor: b.percentage > 100 ? '#ef4444' : b.percentage > 90 ? '#f59e0b' : 'var(--green)',
                                height: '100%',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600 }}>{b.percentage}%</span>
                        </div>
                      </td>
                      <td>
                        <Badge tone={b.status === 'Exception' ? 'red' : b.status === 'Warning' ? 'amber' : 'green'}>
                          {b.status === 'Exception' ? 'AF-11 Exception' : b.status}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye size={13} />}
                          onClick={() => setSelectedBudget(b)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Budget Details Modal */}
      {selectedBudget && (
        <Modal
          open={!!selectedBudget}
          title={`Budget Details — ${selectedBudget.budgetId}`}
          subtitle={`${selectedBudget.department} (${selectedBudget.costCenter}) · ${selectedBudget.month}`}
          onClose={() => setSelectedBudget(null)}
          wide
          footer={
            <Button variant="subtle" onClick={() => setSelectedBudget(null)}>
              Close
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Top Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>ALLOCATED BUDGET</span>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: 'var(--text-1)' }}>
                  ₹{selectedBudget.budgetAmount.toLocaleString()}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>ACTUAL SPEND</span>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: 'var(--text-1)' }}>
                  ₹{selectedBudget.actualAmount.toLocaleString()}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>OPEN COMMITMENT</span>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: 'var(--amber)' }}>
                  ₹{selectedBudget.committedAmount.toLocaleString()}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>VARIANCE</span>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: selectedBudget.variance < 0 ? '#ef4444' : 'var(--green)' }}>
                  {selectedBudget.variance < 0 ? `-₹${Math.abs(selectedBudget.variance).toLocaleString()}` : `+₹${selectedBudget.variance.toLocaleString()}`}
                </div>
              </div>
            </div>

            {/* Cost Centers Breakdown Table */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-1)' }}>
                Budget Heads & Cost Centers Breakdown
              </h4>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Head / Description</th>
                    <th>Allocated</th>
                    <th>Actual</th>
                    <th>Committed</th>
                    <th>Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {parseJson(selectedBudget.costCentersJson).map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{item.head}</td>
                      <td>₹{item.allocated.toLocaleString()}</td>
                      <td>₹{item.actual.toLocaleString()}</td>
                      <td style={{ color: 'var(--amber)' }}>₹{item.committed.toLocaleString()}</td>
                      <td style={{ fontWeight: 600, color: item.variance < 0 ? '#ef4444' : 'var(--green)' }}>
                        {item.variance < 0 ? `-₹${Math.abs(item.variance).toLocaleString()}` : `+₹${item.variance.toLocaleString()}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Monthly Trend */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-1)' }}>
                Monthly Spend Trend
              </h4>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
                {parseJson(selectedBudget.monthlyTrendJson).map((t: any, idx: number) => (
                  <div key={idx} style={{ flex: '1 0 120px', backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                    <span className="mono-label" style={{ fontSize: 10 }}>{t.month}</span>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', marginTop: 4 }}>
                      ₹{t.actual.toLocaleString()}
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Budget: ₹{t.budget.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* History & Commitments Log */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-1)' }}>
                Commitment & Budget Audit History
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {parseJson(selectedBudget.historyJson).map((h: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 10px', backgroundColor: 'var(--panel-2)', borderRadius: 4 }}>
                    <span>{h.date} — <strong>{h.event}</strong> ({h.user})</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>₹{h.amount?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Compare Cost Centers Modal */}
      {compareModal && (
        <Modal
          open={compareModal}
          title="Compare Cost Center Performance"
          subtitle="Side-by-side variance and commitment benchmarking"
          onClose={() => setCompareModal(false)}
          wide
          footer={<Button variant="subtle" onClick={() => setCompareModal(false)}>Close</Button>}
        >
          <table className="adm-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Cost Center</th>
                <th>Budget</th>
                <th>Actual</th>
                <th>Committed</th>
                <th>Variance %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.department}</td>
                  <td className="mono-label">{b.costCenter}</td>
                  <td>₹{b.budgetAmount.toLocaleString()}</td>
                  <td>₹{b.actualAmount.toLocaleString()}</td>
                  <td style={{ color: 'var(--amber)' }}>₹{b.committedAmount.toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: b.variance < 0 ? '#ef4444' : 'var(--green)' }}>
                    {b.percentage}%
                  </td>
                  <td>
                    <Badge tone={b.status === 'Exception' ? 'red' : b.status === 'Warning' ? 'amber' : 'green'}>{b.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}
    </div>
  );
};
