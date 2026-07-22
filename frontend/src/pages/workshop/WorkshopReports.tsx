import React, { useEffect, useState } from 'react';
import { workshopApi } from '../../services/workshopApi';
import type { WorkshopReports as ReportsData } from '../../services/workshopApi';
import { Panel, Badge, LoadingState, ErrorState } from '../../components/admin/ui';

export const WorkshopReports: React.FC = () => {
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workshopApi.getReports();
      setReports(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch workshop reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <LoadingState label="Loading Workshop Reports" />;
  if (error) return <ErrorState message={error} onRetry={fetchReports} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
          Workshop Operational Reports (R-06)
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
          Specific performance, costing accuracy, downtime & warranty recovery reports for R-06 Workshop Manager.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Report 1: Downtime by Vehicle */}
        <Panel
          title="1. Downtime by Vehicle (KPI-08)"
          subtitle="Total hours out-of-service from shop check-in to QC release"
        >
          <table className="adm-table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Vehicle #</th>
                <th>Job Card #</th>
                <th>Downtime (hrs)</th>
                <th>Repair Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports?.downtimeByVehicle.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>{r.vehicleNumber}</td>
                  <td>{r.jobCard}</td>
                  <td style={{ fontWeight: 600, color: '#f59e0b' }}>{r.downtimeHours} hrs</td>
                  <td>{r.reason}</td>
                  <td><Badge tone="blue">{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        {/* Report 2: Job Cost vs Estimate */}
        <Panel
          title="2. Job Cost vs Estimate (KPI-35)"
          subtitle="Estimate accuracy comparison & cost variance"
        >
          <table className="adm-table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Job Card #</th>
                <th>Vehicle #</th>
                <th>Estimate (₹)</th>
                <th>Actual (₹)</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {reports?.jobCostVsEstimate.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>{r.jobCardNumber}</td>
                  <td>{r.vehicleNumber}</td>
                  <td>₹{r.estimateTotal.toLocaleString()}</td>
                  <td>₹{r.actualCost.toLocaleString()}</td>
                  <td>
                    <Badge tone={r.accuracy >= 90 ? 'green' : 'amber'}>
                      {r.accuracy}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        {/* Report 3: Waiting Parts Aging */}
        <Panel
          title="3. Waiting Parts Aging"
          subtitle="Backordered parts holding vehicles in shop bays"
        >
          <table className="adm-table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Job Card #</th>
                <th>Vehicle #</th>
                <th>Part Description</th>
                <th>Supplier</th>
                <th>Aging (Days)</th>
              </tr>
            </thead>
            <tbody>
              {reports?.waitingPartsAging.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>{r.jobCardNumber}</td>
                  <td>{r.vehicleNumber}</td>
                  <td>{r.partName} ({r.partNumber})</td>
                  <td>{r.supplier}</td>
                  <td style={{ fontWeight: 700, color: '#ef4444' }}>{r.daysWaiting} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        {/* Report 4: Warranty Recovered */}
        <Panel
          title="4. Warranty Recovered"
          subtitle="OEM warranty claim recoveries on eligible parts (BR-MNT-07)"
        >
          <table className="adm-table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Job Card #</th>
                <th>Vehicle #</th>
                <th>Claim #</th>
                <th>OEM Manufacturer</th>
                <th>Claimed Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports?.warrantyRecovered.map((r, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>{r.jobCardNumber}</td>
                  <td>{r.vehicleNumber}</td>
                  <td style={{ fontFamily: 'monospace' }}>{r.claimNumber}</td>
                  <td>{r.oem}</td>
                  <td style={{ fontWeight: 700, color: 'var(--green)' }}>₹{r.claimedAmount.toLocaleString()}</td>
                  <td><Badge tone={r.status === 'Recovered' ? 'green' : 'amber'}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
};
