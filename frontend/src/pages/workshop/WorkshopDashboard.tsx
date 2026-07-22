import React, { useEffect, useState } from 'react';
import {
  Wrench,
  Package,
  Activity,
  CheckCircle,
  AlertTriangle,
  Calendar,
  FileCheck,
  Building2,
  Clock,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { workshopApi } from '../../services/workshopApi';
import type { WorkshopKPIs, WorkshopBay, PartsDemandItem, Estimate, JobCard } from '../../services/workshopApi';
import { Panel, Badge, LoadingState, ErrorState, Button } from '../../components/admin/ui';
import { useNavigate } from 'react-router-dom';

export const WorkshopDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<WorkshopKPIs | null>(null);
  const [widgets, setWidgets] = useState<{
    bayBoard: WorkshopBay[];
    waitingPartsQueue: PartsDemandItem[];
    estimateApprovalQueue: Estimate[];
    qcQueue: JobCard[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiData, widgetData] = await Promise.all([
        workshopApi.getKPIs(),
        workshopApi.getDashboardWidgets(),
      ]);
      setKpis(kpiData);
      setWidgets(widgetData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load workshop dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingState label="Loading Workshop Dashboard" />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
            Workshop Manager Workspace (R-06)
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            Real-time shop floor overview: bay allocation, job card throughput, parts demand & QC gates.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="primary" icon={<Wrench size={14} />} onClick={() => navigate('/workshop/job-cards')}>
            Create Job Card
          </Button>
        </div>
      </div>

      {/* Top KPI Cards (8 Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Wrench size={18} />
          </div>
          <span className="adm-stat-num">{kpis?.openJobCards ?? 0}</span>
          <span className="adm-stat-label">Open Job Cards</span>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Package size={18} />
          </div>
          <span className="adm-stat-num">{kpis?.waitingParts ?? 0}</span>
          <span className="adm-stat-label">Waiting Parts</span>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <Activity size={18} />
          </div>
          <span className="adm-stat-num">{kpis?.inProgressJobs ?? 0}</span>
          <span className="adm-stat-label">In Progress Jobs</span>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <CheckCircle size={18} />
          </div>
          <span className="adm-stat-num">{kpis?.qcQueue ?? 0}</span>
          <span className="adm-stat-label">QC Queue</span>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <AlertTriangle size={18} />
          </div>
          <span className="adm-stat-num">{kpis?.vehiclesDown ?? 0}</span>
          <span className="adm-stat-label">Vehicles Down</span>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}>
            <Calendar size={18} />
          </div>
          <span className="adm-stat-num">{kpis?.pmDueToday ?? 0}</span>
          <span className="adm-stat-label">PM Due Today</span>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
            <FileCheck size={18} />
          </div>
          <span className="adm-stat-num">{kpis?.estimatePendingApproval ?? 0}</span>
          <span className="adm-stat-label">Estimate Pending</span>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
            <Building2 size={18} />
          </div>
          <span className="adm-stat-num">{kpis?.activeBays ?? 0}</span>
          <span className="adm-stat-label">Active Bays</span>
        </div>
      </div>

      {/* Role Workspace KPIs (PRD Specific Metrics) */}
      <Panel title="Workshop Efficiency Metrics (PRD KPIs)" padded>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-3)', fontSize: 12 }}>
              <span>PM Compliance</span>
              <Percent size={14} color="#10b981" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>
              {kpis?.pmCompliance}%
            </div>
            <span style={{ fontSize: 11, color: 'var(--green)' }}>Target: ≥ 90%</span>
          </div>

          <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-3)', fontSize: 12 }}>
              <span>Breakdowns</span>
              <AlertTriangle size={14} color="#ef4444" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>
              {kpis?.breakdowns}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>This month</span>
          </div>

          <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-3)', fontSize: 12 }}>
              <span>MTTR (Mean Time to Repair)</span>
              <Clock size={14} color="#3b82f6" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>
              {kpis?.mttrHours} hrs
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Industry norm: ≤ 8 hrs</span>
          </div>

          <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-3)', fontSize: 12 }}>
              <span>First-Time-Fix Rate</span>
              <TrendingUp size={14} color="#10b981" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>
              {kpis?.firstTimeFixRate}%
            </div>
            <span style={{ fontSize: 11, color: 'var(--green)' }}>No repeat in 30 days</span>
          </div>

          <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-3)', fontSize: 12 }}>
              <span>Estimate Accuracy</span>
              <FileCheck size={14} color="#f59e0b" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>
              {kpis?.estimateAccuracy}%
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Actual vs Estimate</span>
          </div>

          <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-3)', fontSize: 12 }}>
              <span>Avg Waiting Parts Time</span>
              <Clock size={14} color="#f97316" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', marginTop: 4 }}>
              {kpis?.waitingPartsHours} hrs
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Parts lead time</span>
          </div>
        </div>
      </Panel>

      {/* 4 Main Dashboard Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Widget 1: Bay Board */}
        <Panel
          title="1. Bay Board"
          subtitle="Live workshop bay allocation & status"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/workshop/board')}>
              View Full Board
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {widgets?.bayBoard.map((bay) => (
              <div
                key={bay.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'var(--panel-2)',
                  borderRadius: 6,
                  border: '1px solid var(--border-soft)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{bay.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {bay.vehicleNumber ? (
                      <>
                        <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{bay.vehicleNumber}</span> • Mech: {bay.mechanicName || 'Unassigned'}
                      </>
                    ) : (
                      'Bay clear - ready for assignment'
                    )}
                  </div>
                </div>
                <div>
                  <Badge
                    tone={
                      bay.status === 'Available'
                        ? 'green'
                        : bay.status === 'Busy'
                        ? 'amber'
                        : bay.status === 'Waiting Parts'
                        ? 'red'
                        : 'blue'
                    }
                  >
                    {bay.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Widget 2: Waiting Parts Queue */}
        <Panel
          title="2. Waiting Parts Queue"
          subtitle="Job cards delayed pending component fulfillment"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/workshop/parts-demand')}>
              Manage Demands
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {widgets?.waitingPartsQueue.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: 20 }}>No parts currently blocking job cards.</div>
            ) : (
              widgets?.waitingPartsQueue.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: 'var(--panel-2)',
                    borderRadius: 6,
                    border: '1px solid var(--border-soft)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>
                      {item.jobCardId} — {item.vehicleNumber}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {item.partName} ({item.partNumber}) • Req: {item.quantityRequired} / Avail: {item.quantityAvailable}
                    </div>
                  </div>
                  <div>
                    <Badge tone={item.reservationStatus === 'Reserved' ? 'green' : 'amber'}>
                      {item.reservationStatus}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        {/* Widget 3: Estimate Approval Queue */}
        <Panel
          title="3. Estimate Approval Queue"
          subtitle="Estimates pending AF-05 / technical sign-off"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/workshop/estimates')}>
              View Estimates
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {widgets?.estimateApprovalQueue.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: 20 }}>No estimates currently pending approval.</div>
            ) : (
              widgets?.estimateApprovalQueue.map((est) => (
                <div
                  key={est.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: 'var(--panel-2)',
                    borderRadius: 6,
                    border: '1px solid var(--border-soft)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>
                      {est.estimateNumber} ({est.vehicleNumber})
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      Total: ₹{est.totalAmount.toLocaleString()} • Job Card: {est.jobCardId}
                    </div>
                  </div>
                  <div>
                    <Badge tone="amber">{est.approvalStatus}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        {/* Widget 4: QC Queue */}
        <Panel
          title="4. QC Queue"
          subtitle="Repairs complete awaiting Quality Control & Road Test"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate('/workshop/job-cards?status=QC')}>
              Open QC Gate
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {widgets?.qcQueue.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: 20 }}>No job cards currently in QC Queue.</div>
            ) : (
              widgets?.qcQueue.map((jc) => (
                <div
                  key={jc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: 'var(--panel-2)',
                    borderRadius: 6,
                    border: '1px solid var(--border-soft)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>
                      {jc.jobCardNumber} — {jc.vehicleNumber}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      Mechanic: {jc.mechanicName || 'Unassigned'} • Road Test: {jc.roadTestStatus}
                    </div>
                  </div>
                  <div>
                    <Badge tone="blue">Awaiting Sign-off</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
};
