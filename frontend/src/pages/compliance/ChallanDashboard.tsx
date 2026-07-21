import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, ArrowRight 
} from 'lucide-react';
import { Panel, Badge, Button } from '../../components/admin/ui';

export const ChallanDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock dashboard analytical data
  const overviewStats = {
    totalOpen: 12,
    totalOpenCost: 45000,
    paidCostThisMonth: 18000,
    contestedCount: 6,
    unpaidCount: 6
  };

  const siteWiseLiability = [
    { site: 'Bawal Hub', openCount: 5, amount: 12500, status: 'Critical' },
    { site: 'Jaipur Depot', openCount: 3, amount: 15000, status: 'Warning' },
    { site: 'Okhla Hub', openCount: 3, amount: 7500, status: 'Provisional' },
    { site: 'Gurugram Depot', openCount: 1, amount: 10000, status: 'Critical' }
  ];

  const categoryBreakdown = [
    { type: 'Overspeeding', count: 6, percentage: 50, cost: 12000 },
    { type: 'No Entry Violations', count: 3, percentage: 25, cost: 15000 },
    { type: 'Red Light Violations', count: 2, percentage: 17, cost: 8000 },
    { type: 'Fitness Lapses', count: 1, percentage: 8, cost: 10000 }
  ];

  const topViolatingVehicles = [
    { vehicleNo: 'MH-43-R-8899', count: 3, totalCost: 7500, status: 'Critical' },
    { vehicleNo: 'GJ-01-XX-1122', count: 2, totalCost: 6500, status: 'Warning' },
    { vehicleNo: 'RJ-14-AB-1234', count: 1, totalCost: 5000, status: 'Warning' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Challan Analytical Console</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            Site liability analysis, driver fine aggregates, and traffic violation trends.
          </p>
        </div>
        <Button variant="primary" icon={<ArrowRight size={14} style={{ marginLeft: 6, order: 2 }} />} onClick={() => navigate('/compliance/challans/workbench')}>
          Open Workbench
        </Button>
      </div>

      {/* Stats Summary Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div style={{ padding: 20, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>TOTAL UNPAID VALUE</span>
          <strong style={{ fontSize: 28, color: 'var(--red)', display: 'block', marginTop: 10 }}>₹ {overviewStats.totalOpenCost.toLocaleString()}</strong>
          <span style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, display: 'block' }}>Across {overviewStats.totalOpen} open tickets</span>
        </div>

        <div style={{ padding: 20, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>SETTLED THIS MONTH</span>
          <strong style={{ fontSize: 28, color: 'var(--green)', display: 'block', marginTop: 10 }}>₹ {overviewStats.paidCostThisMonth.toLocaleString()}</strong>
          <span style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, display: 'block' }}>Direct corporate clearance</span>
        </div>

        <div style={{ padding: 20, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>DISPUTES UNDER REVIEW</span>
          <strong style={{ fontSize: 28, color: 'var(--text-1)', display: 'block', marginTop: 10 }}>{overviewStats.contestedCount} Cases</strong>
          <span style={{ fontSize: 11, color: 'var(--green)', marginTop: 4, display: 'block' }}>Saves ₹ 22,000 in potential fines</span>
        </div>

        <div style={{ padding: 20, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', fontWeight: 600 }}>OVERDUE ACTION STAGE</span>
          <strong style={{ fontSize: 28, color: 'var(--amber)', display: 'block', marginTop: 10 }}>{overviewStats.unpaidCount} Overdue</strong>
          <span style={{ fontSize: 11, color: 'var(--red)', marginTop: 4, display: 'block' }}>Suspension risk active</span>
        </div>
      </div>

      {/* Main analytical grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        
        {/* Site Wise Liability */}
        <Panel title="Site & Depot Liability Breakdown" subtitle="Allocation of traffic fine budgets by operations sector">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-soft)' }}>
                  <th style={{ padding: '8px 12px', color: 'var(--text-3)', fontSize: 11 }}>OPERATIONAL DEPOT</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-3)', fontSize: 11, textAlign: 'center' }}>OPEN CHALLANS</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-3)', fontSize: 11, textAlign: 'right' }}>OUTSTANDING VALUE</th>
                  <th style={{ padding: '8px 12px', color: 'var(--text-3)', fontSize: 11, textAlign: 'center' }}>SITUATION</th>
                </tr>
              </thead>
              <tbody>
                {siteWiseLiability.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <td style={{ padding: '12px 12px', fontWeight: 600 }}>{item.site}</td>
                    <td style={{ padding: '12px 12px', textAlign: 'center' }}>{item.openCount}</td>
                    <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 700 }}>₹ {item.amount.toLocaleString()}</td>
                    <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                      <Badge tone={item.status === 'Critical' ? 'red' : 'amber'}>{item.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Category breakdown progress bars */}
        <Panel title="Violation Categories" subtitle="Percentage breakdown of traffic offences by volume">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {categoryBreakdown.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ fontWeight: 600 }}>{item.type} ({item.count} items)</span>
                  <span style={{ color: 'var(--text-2)', fontFamily: 'var(--font-family-mono)' }}>₹ {item.cost.toLocaleString()} ({item.percentage}%)</span>
                </div>
                {/* Progress bar */}
                <div style={{ width: '100%', height: 8, backgroundColor: 'var(--border-soft)', borderRadius: 999, overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      backgroundColor: item.type === 'Overspeeding' ? 'var(--amber)' : item.type === 'Fitness Lapses' ? 'var(--red)' : 'var(--green)',
                      width: `${item.percentage}%`
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Top Violating Vehicles */}
        <Panel title="Top Offending Vehicles" subtitle="High frequency vehicle alerts under audit">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topViolatingVehicles.map((vehicle, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'var(--panel-2)',
                  borderRadius: 8,
                  border: '1px solid var(--border-soft)'
                }}
              >
                <div>
                  <strong style={{ fontSize: 14 }}>{vehicle.vehicleNo}</strong>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                    Open count: <strong>{vehicle.count} infractions</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--red)' }}>₹ {vehicle.totalCost.toLocaleString()}</span>
                  <Badge tone={vehicle.status === 'Critical' ? 'red' : 'amber'}>{vehicle.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Hotspots Panel */}
        <Panel title="Frequent Offense Corridors" subtitle="Geographic locations with highest radar flags">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 12, backgroundColor: 'var(--panel-2)', borderRadius: 6, border: '1px solid var(--border-soft)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <MapPin size={18} color="var(--red)" />
              <div>
                <strong style={{ fontSize: 13, display: 'block' }}>NH-48 Corridor (Km 100 - Km 180)</strong>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>6 speed flags captured this month</span>
              </div>
            </div>
            <div style={{ padding: 12, backgroundColor: 'var(--panel-2)', borderRadius: 6, border: '1px solid var(--border-soft)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <MapPin size={18} color="var(--red)" />
              <div>
                <strong style={{ fontSize: 13, display: 'block' }}>Delhi Ring Road (South Extension)</strong>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>3 lane infractions captured this month</span>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};
