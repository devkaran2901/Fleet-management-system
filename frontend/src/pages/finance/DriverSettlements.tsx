import React, { useEffect, useState } from 'react';
import { Eye, Filter, RefreshCw } from 'lucide-react';
import { financeApi } from '../../services/financeApi';
import type { DriverSettlementRecord } from '../../services/financeApi';
import { Panel, Button, Badge, Input, Select, Modal, LoadingState, ErrorState } from '../../components/admin/ui';

export const DriverSettlements: React.FC = () => {
  const [settlements, setSettlements] = useState<DriverSettlementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSettlement, setSelectedSettlement] = useState<DriverSettlementRecord | null>(null);

  // Filters
  const [driverFilter, setDriverFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadSettlements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.getDriverSettlements({
        driverName: driverFilter || undefined,
        status: statusFilter || undefined,
      });
      setSettlements(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load driver settlements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettlements();
  }, [driverFilter, statusFilter]);

  const parseJson = (val: any) => {
    if (!val) return {};
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return {};
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
            Driver Trip Settlements & Payroll
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            Trip advance, bhatta allowance, recoveries, incentives, net settlement, and payroll export visibility.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" icon={<RefreshCw size={14} />} onClick={loadSettlements}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Panel padded={false} style={{ backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', padding: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={15} color="var(--text-3)" />
          <span className="mono-label" style={{ fontSize: 10 }}>FILTERS:</span>
          
          <Input
            placeholder="Search Driver Name..."
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value)}
            style={{ width: 180 }}
          />

          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 140 }}>
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Approved">Approved</option>
            <option value="Disputed">Disputed</option>
            <option value="Paid">Paid</option>
          </Select>

          {(driverFilter || statusFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDriverFilter('');
                setStatusFilter('');
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </Panel>

      {/* Settlements Table */}
      {loading ? (
        <LoadingState label="Loading Driver Settlements" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadSettlements} />
      ) : (
        <Panel padded={false}>
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Trip Ref</th>
                  <th>Trip Advance</th>
                  <th>Enroute Expense</th>
                  <th>Bhatta</th>
                  <th>Recovery</th>
                  <th>Incentive</th>
                  <th>Net Settlement</th>
                  <th>Dispute Status</th>
                  <th>Payroll Export</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {settlements.length === 0 ? (
                  <tr>
                    <td colSpan={12} style={{ textAlign: 'center', padding: 24, color: 'var(--text-3)' }}>
                      No driver settlements match the specified filters.
                    </td>
                  </tr>
                ) : (
                  settlements.map((s) => {
                    const dispute = parseJson(s.disputeStatusJson);
                    const payroll = parseJson(s.payrollExportStatusJson);
                    return (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{s.driverName}</div>
                          <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>{s.driverId || 'DRV-N/A'}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: 11, fontWeight: 500 }}>{s.tripId}</span>
                        </td>
                        <td style={{ color: 'var(--text-1)' }}>₹{s.advance.toLocaleString()}</td>
                        <td>₹{s.expense.toLocaleString()}</td>
                        <td>₹{s.bhatta.toLocaleString()}</td>
                        <td style={{ color: '#ef4444' }}>{s.recovery > 0 ? `-₹${s.recovery.toLocaleString()}` : '₹0'}</td>
                        <td style={{ color: 'var(--green)' }}>{s.incentive > 0 ? `+₹${s.incentive.toLocaleString()}` : '₹0'}</td>
                        <td style={{ fontWeight: 700, color: s.settlement < 0 ? '#ef4444' : 'var(--green)' }}>
                          {s.settlement < 0 ? `-₹${Math.abs(s.settlement).toLocaleString()}` : `+₹${s.settlement.toLocaleString()}`}
                        </td>
                        <td>
                          <Badge tone={dispute?.hasDispute ? 'red' : 'green'}>
                            {dispute?.hasDispute ? 'Disputed' : 'Clean'}
                          </Badge>
                        </td>
                        <td>
                          <Badge tone={payroll?.exported ? 'green' : 'grey'}>
                            {payroll?.exported ? 'Exported' : 'Pending'}
                          </Badge>
                        </td>
                        <td>
                          <Badge tone={s.status === 'Approved' ? 'green' : s.status === 'Disputed' ? 'red' : 'amber'}>
                            {s.status}
                          </Badge>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye size={13} />}
                            onClick={() => setSelectedSettlement(s)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Driver Settlement Details Modal */}
      {selectedSettlement && (
        <Modal
          open={!!selectedSettlement}
          title={`Driver Settlement Details — ${selectedSettlement.driverName}`}
          subtitle={`Trip: ${selectedSettlement.tripId} · Driver ID: ${selectedSettlement.driverId || 'DRV-N/A'}`}
          onClose={() => setSelectedSettlement(null)}
          wide
          footer={<Button variant="ghost" onClick={() => setSelectedSettlement(null)}>Close</Button>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Calculation Card */}
            <div style={{ backgroundColor: 'var(--panel-2)', padding: 14, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 10px 0', color: 'var(--text-1)' }}>
                Net Settlement Computation Breakdown
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: 12 }}>
                <div>Trip Advance Received: <strong>₹{selectedSettlement.advance.toLocaleString()}</strong></div>
                <div>Enroute Toll/Parking Expense: <strong>₹{selectedSettlement.expense.toLocaleString()}</strong></div>
                <div>Bhatta Allowance Rate: <strong>₹{selectedSettlement.bhatta.toLocaleString()}</strong></div>
                <div>Safety & Efficiency Incentive: <strong style={{ color: 'var(--green)' }}>+₹{selectedSettlement.incentive.toLocaleString()}</strong></div>
                <div>Recovery / Penalty Deduction: <strong style={{ color: '#ef4444' }}>-₹{selectedSettlement.recovery.toLocaleString()}</strong></div>
                <div style={{ gridColumn: 'span 3', borderTop: '1px solid var(--border-soft)', paddingTop: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: selectedSettlement.settlement < 0 ? '#ef4444' : 'var(--green)' }}>
                    Net Settlement Amount: {selectedSettlement.settlement < 0 ? `-₹${Math.abs(selectedSettlement.settlement).toLocaleString()} (Driver Payable)` : `+₹${selectedSettlement.settlement.toLocaleString()} (Reimbursement Due)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Dispute & Payroll Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text-1)' }}>Dispute Status</h4>
                {(() => {
                  const d = parseJson(selectedSettlement.disputeStatusJson);
                  if (!d?.hasDispute) return <span style={{ fontSize: 12, color: 'var(--green)' }}>No active disputes flagged for this settlement.</span>;
                  return (
                    <div style={{ fontSize: 11, color: '#ef4444', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div>Flagged Reason: <strong>{d.reason}</strong></div>
                    </div>
                  );
                })()}
              </div>

              <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text-1)' }}>Payroll Export Status</h4>
                {(() => {
                  const p = parseJson(selectedSettlement.payrollExportStatusJson);
                  return (
                    <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div>Exported: <strong>{p?.exported ? 'Yes' : 'No'}</strong></div>
                      {p?.batchRef && <div>Batch Reference: <strong>{p.batchRef}</strong></div>}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
