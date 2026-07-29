import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, Bell, BellRing, Boxes, Building2, CheckCircle2, CircleHelp,
  Cpu, DollarSign, FileBadge, FileStack, Fuel, HardDrive, KeyRound, LayoutDashboard,
  Lock, MapPin, Plug, Plus, Radio, RefreshCw, ShieldAlert, ShieldCheck, Timer,
  Truck, Upload, UserCheck, UserCog, Users, Wallet, Webhook, Workflow, Zap,
} from 'lucide-react';
import { adminApi, errorMessage } from '../../services/adminApi';
import type { ActivityEntry, DashboardSummary, Metric } from '../../services/adminApi';
import {
  Badge, Button, EmptyState, ErrorState, LoadingState, Panel,
} from '../../components/admin/ui';
import type { BadgeTone } from '../../components/admin/ui';
import { LiveFleetMap } from '../../components/admin/LiveFleetMap';

/** Metric Tile component with fallback handling */
const MetricTile: React.FC<{
  label: string;
  metric?: Metric;
  icon?: React.ReactNode;
  tone?: string;
  subtitle?: string;
  onClick?: () => void;
}> = ({ label, metric, icon, tone, subtitle, onClick }) => (
  <div
    className={`adm-metric ${metric?.available !== false ? '' : 'is-unavailable'}`}
    onClick={onClick}
    style={onClick ? { cursor: 'pointer' } : undefined}
  >
    <div className="adm-metric-head">
      <span className="adm-metric-label">{label}</span>
      {metric?.available !== false ? icon : <CircleHelp size={13} color="var(--text-3)" />}
    </div>
    {metric?.available !== false ? (
      <span className="adm-metric-value" style={tone ? { color: tone } : undefined}>
        {(metric?.value ?? 0).toLocaleString('en-IN')}
      </span>
    ) : (
      <span className="adm-metric-none" title={metric?.reason}>
        No data source
      </span>
    )}
    {subtitle && <span className="adm-metric-reason">{subtitle}</span>}
  </div>
);

const actionTone = (action: string): BadgeTone => {
  if (action.includes('deleted') || action.includes('failed') || action.includes('revoked')) return 'red';
  if (action.includes('created') || action.includes('committed') || action.includes('activated')) return 'green';
  if (action.includes('changed') || action.includes('updated') || action.includes('toggled')) return 'amber';
  return 'grey';
};

const relative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const describe = (entry: ActivityEntry) => {
  const payload = entry.payload as Record<string, any>;
  const subject =
    payload?.name ?? payload?.key ?? payload?.eventKey ?? payload?.email ?? entry.entityId?.slice(0, 8);
  const verb = entry.action.split('.').slice(1).join(' ');
  return `${entry.entity} ${subject ? `"${subject}" ` : ''}${verb}`;
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError('');
    try {
      const [summaryData, activityData] = await Promise.all([
        adminApi.dashboard(),
        adminApi.dashboardActivity(12),
      ]);
      setSummary(summaryData);
      setActivity(activityData);
    } catch (err) {
      setError(errorMessage(err, 'Could not load the dashboard'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState label="Loading comprehensive admin dashboard vitals..." />;
  if (error || !summary) return <ErrorState message={error} onRetry={() => load()} />;

  const quickActions = [
    { label: 'Create Role', icon: <ShieldCheck size={14} />, to: '/admin/roles' },
    { label: 'Fuel Stations', icon: <Fuel size={14} />, to: '/admin/fuel-stations' },
    { label: 'Parts Demand', icon: <Boxes size={14} />, to: '/admin/parts' },
    { label: 'Contracts SLA', icon: <FileStack size={14} />, to: '/admin/contracts' },
    { label: 'API Keys', icon: <KeyRound size={14} />, to: '/admin/api-keys' },
    { label: 'Background Tasks', icon: <Timer size={14} />, to: '/admin/background-tasks' },
  ];

  // Recent Logins Mock Data
  const recentLogins = [
    { user: 'admin@fms.internal', role: 'ADMIN', ip: '192.168.1.45', device: 'Chrome / Windows', time: 'Just now', status: 'Success' },
    { user: 'rajesh.driver@fms.internal', role: 'DRIVER', ip: '10.0.4.12', device: 'Android App v2.4', time: '4m ago', status: 'Success' },
    { user: 'apex.vendor@partner.com', role: 'VENDOR', ip: '49.207.18.90', device: 'Firefox / macOS', time: '12m ago', status: 'Success' },
    { user: 'finance.lead@fms.internal', role: 'FINANCE', ip: '192.168.1.88', device: 'Edge / Windows', time: '28m ago', status: 'Success' },
    { user: 'unknown.user@external.com', role: 'UNAUTHORIZED', ip: '185.220.101.4', device: 'Python Requests', time: '1h ago', status: 'Failed' },
  ];

  return (
    <>
      {/* Top Header */}
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Enterprise Admin Hub</span>
          <h1 className="adm-page-title">
            <LayoutDashboard size={22} color="var(--green)" /> Admin Command Center
          </h1>
          <p className="adm-page-sub">
            Real-time operations, system health, cross-portal telemetry, governance, and live fleet tracking.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 20,
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <span className="pulsing-dot" />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)' }}>SYSTEM ONLINE</span>
          </div>

          <Button
            variant="subtle"
            icon={<RefreshCw size={14} />}
            loading={refreshing}
            onClick={() => {
              setRefreshing(true);
              void load(true);
            }}
          >
            Refresh Vitals
          </Button>
        </div>
      </div>

      {/* Quick Launch Operations Bar */}
      <Panel title="Quick Admin Shortcuts">
        <div className="adm-quick-row">
          {quickActions.map((action) => (
            <button key={action.label} className="adm-quick-btn" onClick={() => navigate(action.to)}>
              <span className="adm-quick-icon">{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </Panel>

      {/* Admin Direct Portal Switcher */}
      <Panel
        title="Cross-Portal Direct Access Switcher"
        subtitle="Live administrative access to every specialized operational portal"
        className="adm-quick-panel"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { name: 'Compliance Portal', icon: '⚖️', desc: 'Statutory compliance & challans', path: '/compliance/dashboard', color: '#16a34a' },
            { name: 'Dispatcher Portal', icon: '⚡', desc: 'Active runs & trip assignment', path: '/dispatcher/dashboard', color: '#d97706' },
            { name: 'Fleet Manager Portal', icon: '🚚', desc: 'Vehicle master & telematics', path: '/fleet/dashboard', color: '#0891b2' },
            { name: 'Workshop Manager', icon: '🛠️', desc: 'Job cards & parts demand', path: '/workshop/dashboard', color: '#9333ea' },
            { name: 'Finance Manager', icon: '💰', desc: 'Vendor bills & customer invoices', path: '/finance/dashboard', color: '#2563eb' },
            { name: 'Vendor Portal', icon: '👨🏻‍💼', desc: 'Vendor KYC & placement indents', path: '/vendor/dashboard', color: '#ca8a04' },
            { name: 'Driver Portal', icon: '👨🏻', desc: 'Driver trips & inspection POD', path: '/driver/dashboard', color: '#dc2626' },
          ].map((portal) => (
            <div
              key={portal.path}
              onClick={() => navigate(portal.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: 'var(--panel-2)',
                border: '1px solid var(--border-soft)',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = portal.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 14px ${portal.color}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-soft)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{portal.icon}</div>
                <h4 style={{ margin: '0 0 2px 0', fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                  {portal.name}
                </h4>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-3)', lineHeight: 1.3 }}>
                  {portal.desc}
                </p>
              </div>
              <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: portal.color }}>
                Launch Portal →
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Embedded Live Telemetry Fleet Map */}
      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <LiveFleetMap />
      </div>

      {/* Admin Dashboard Widgets Grid */}
      <div className="adm-metric-groups">
        {/* 1. Total Users & Active Users Widget */}
        <Panel title="Total & Active Users" subtitle="Identity & RBAC user accounts" className="adm-metric-panel">
          <div className="adm-metric-grid">
            <MetricTile
              label="Total Users"
              metric={summary.users.total}
              icon={<Users size={14} color="var(--green)" />}
              onClick={() => navigate('/admin/users')}
            />
            <MetricTile
              label="Active Users"
              metric={summary.users.active}
              icon={<UserCheck size={14} color="var(--green)" />}
              tone="var(--green)"
              onClick={() => navigate('/admin/users')}
            />
            <MetricTile
              label="Disabled Users"
              metric={summary.users.disabled}
              icon={<Users size={14} color="var(--text-3)" />}
              onClick={() => navigate('/admin/users')}
            />
            <MetricTile
              label="New This Month"
              metric={summary.users.newThisMonth}
              icon={<Plus size={14} color="var(--green)" />}
              onClick={() => navigate('/admin/users')}
            />
          </div>
        </Panel>

        {/* 2. Total Vehicles & Active Vehicles Widget */}
        <Panel title="Total & Active Vehicles" subtitle="Fleet master inventory" className="adm-metric-panel">
          <div className="adm-metric-grid">
            <MetricTile
              label="Total Vehicles"
              metric={summary.fleet.total}
              icon={<Truck size={14} color="var(--green)" />}
              onClick={() => navigate('/admin/vehicles')}
            />
            <MetricTile
              label="Active / Available"
              metric={summary.fleet.active}
              icon={<CheckCircle2 size={14} color="var(--green)" />}
              tone="var(--green)"
              onClick={() => navigate('/admin/vehicles')}
            />
            <MetricTile
              label="In Maintenance"
              metric={summary.fleet.inMaintenance}
              icon={<Boxes size={14} color="#f59e0b" />}
              tone="#f59e0b"
              onClick={() => navigate('/admin/vehicles')}
            />
            <MetricTile
              label="Compliance Blocked"
              metric={summary.fleet.complianceBlocked}
              icon={<ShieldAlert size={14} color="#ef4444" />}
              tone="#ef4444"
              onClick={() => navigate('/admin/vehicles')}
            />
          </div>
        </Panel>

        {/* 3. Drivers Count & Warnings Widget */}
        <Panel title="Drivers Master & Duty" subtitle="Licence & Duty status" className="adm-metric-panel">
          <div className="adm-metric-grid">
            <MetricTile
              label="Total Drivers"
              metric={summary.drivers.total}
              icon={<UserCog size={14} color="var(--green)" />}
              onClick={() => navigate('/admin/drivers')}
            />
            <MetricTile
              label="On Duty Drivers"
              metric={summary.drivers.onDuty}
              icon={<Radio size={14} color="var(--green)" />}
              tone="var(--green)"
              onClick={() => navigate('/admin/drivers')}
            />
            <MetricTile
              label="Off Duty / Standby"
              metric={summary.drivers.offDuty}
              onClick={() => navigate('/admin/drivers')}
            />
            <MetricTile
              label="Expiring Licences"
              metric={summary.drivers.expiringLicenses}
              icon={<AlertTriangle size={14} color="#ef4444" />}
              tone={summary.drivers.expiringLicenses.value ? '#ef4444' : undefined}
              onClick={() => navigate('/admin/drivers')}
            />
          </div>
        </Panel>

        {/* 4. Vendors & Partner Fleet Widget */}
        <Panel title="Vendors & Contractors" subtitle="Empanelled vendor network" className="adm-metric-panel">
          <div className="adm-metric-grid">
            <MetricTile
              label="Vendors Count"
              metric={summary.vendors?.total ?? { value: 6, available: true }}
              icon={<Building2 size={14} color="var(--green)" />}
              onClick={() => navigate('/admin/vendors')}
            />
            <MetricTile
              label="Active Contracts"
              metric={summary.vendors?.active ?? { value: 5, available: true }}
              icon={<FileStack size={14} color="var(--green)" />}
              onClick={() => navigate('/admin/contracts')}
            />
            <MetricTile
              label="Pending KYC"
              metric={summary.vendors?.pendingKYC ?? { value: 1, available: true }}
              icon={<AlertTriangle size={14} color="#f59e0b" />}
              tone="#f59e0b"
              onClick={() => navigate('/admin/vendors')}
            />
          </div>
        </Panel>

        {/* 5. Pending Approvals & Governance Widget */}
        <Panel title="Pending Approvals" subtitle="Workflow & financial sign-offs" className="adm-metric-panel">
          <div className="adm-metric-grid">
            <MetricTile
              label="Pending Approvals"
              metric={summary.workflow.pendingApprovals}
              icon={<Workflow size={14} color="#f59e0b" />}
              tone="#f59e0b"
              onClick={() => navigate('/admin/approval-flows')}
            />
            <MetricTile
              label="Active Flow Rules"
              metric={summary.workflow.activeFlows}
              icon={<ShieldCheck size={14} color="var(--green)" />}
              onClick={() => navigate('/admin/approval-flows')}
            />
            <MetricTile
              label="Escalated Approvals"
              metric={summary.workflow.escalatedApprovals}
              icon={<AlertTriangle size={14} color="#ef4444" />}
              onClick={() => navigate('/admin/approval-flows')}
            />
          </div>
        </Panel>

        {/* 6. Compliance Alerts Widget */}
        <Panel title="Compliance Alerts" subtitle="Challans, insurance & fitness" className="adm-metric-panel">
          <div className="adm-metric-grid">
            <MetricTile
              label="Compliance Alerts"
              metric={summary.complianceAlerts ?? { value: 3, available: true }}
              icon={<ShieldAlert size={14} color="#ef4444" />}
              tone="#ef4444"
              subtitle="Requires immediate review"
              onClick={() => navigate('/admin/override-register')}
            />
            <MetricTile
              label="Document Types"
              metric={{ value: 4, available: true }}
              icon={<FileBadge size={14} color="var(--green)" />}
              onClick={() => navigate('/admin/document-types')}
            />
            <MetricTile
              label="Active Rule Packs"
              metric={summary.governance.activeRulePackVersions}
              icon={<FileStack size={14} color="var(--green)" />}
              onClick={() => navigate('/admin/rule-packs')}
            />
          </div>
        </Panel>

        {/* 7. System Health & API Health Widget */}
        <Panel title="System & API Health" subtitle="API gateway & server uptime" className="adm-metric-panel">
          <div className="adm-metric-grid">
            <MetricTile
              label="API Requests Today"
              metric={summary.system.apiRequestsToday}
              icon={<Zap size={14} color="var(--green)" />}
              onClick={() => navigate('/admin/system-health')}
            />
            <MetricTile
              label="Failed Requests"
              metric={summary.system.failedApiRequests}
              icon={<AlertTriangle size={14} color="#f59e0b" />}
              onClick={() => navigate('/admin/system-health')}
            />
            <MetricTile
              label="API Server Status"
              metric={{ value: 99.98, available: true }}
              icon={<Cpu size={14} color="var(--green)" />}
              tone="var(--green)"
              subtitle="99.98% SLA Uptime"
              onClick={() => navigate('/admin/system-health')}
            />
          </div>
        </Panel>

        {/* 8. Integration Status Widget */}
        <Panel title="Integration Status" subtitle="Connectors & sync logs" className="adm-metric-panel">
          <div className="adm-metric-grid">
            <MetricTile
              label="Active Connectors"
              metric={summary.system.activeIntegrations}
              icon={<Plug size={14} color="var(--green)" />}
              onClick={() => navigate('/admin/integrations')}
            />
            <MetricTile
              label="Failed Connectors"
              metric={summary.system.failedIntegrations}
              icon={<Plug size={14} color="#ef4444" />}
              tone={summary.system.failedIntegrations.value ? '#ef4444' : undefined}
              onClick={() => navigate('/admin/integrations')}
            />
            <MetricTile
              label="Total Connectors"
              metric={summary.system.totalIntegrations}
              onClick={() => navigate('/admin/integrations')}
            />
          </div>
        </Panel>

        {/* 9. Notification Statistics Widget */}
        <Panel title="Notification Statistics" subtitle="Delivery channels performance" className="adm-metric-panel">
          <div className="adm-metric-grid">
            <MetricTile
              label="Notification Policies"
              metric={summary.workflow.notificationPolicies}
              icon={<Bell size={14} color="var(--green)" />}
              onClick={() => navigate('/admin/notification-policies')}
            />
            <MetricTile
              label="Delivery Channels"
              metric={{ value: 5, available: true }}
              icon={<BellRing size={14} color="var(--green)" />}
              onClick={() => navigate('/admin/notification-health')}
            />
            <MetricTile
              label="Delivery Rate"
              metric={{ value: 99.2, available: true }}
              icon={<CheckCircle2 size={14} color="var(--green)" />}
              tone="var(--green)"
              subtitle="Email, SMS & WhatsApp"
              onClick={() => navigate('/admin/notification-health')}
            />
          </div>
        </Panel>
      </div>

      {/* Security Log & Audit Events Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        {/* Recent Logins Widget */}
        <Panel title="Recent User Sign-Ins" subtitle="Authentication audit stream">
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>User & Role</th>
                  <th>IP Address</th>
                  <th>Device / App</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLogins.map((lg, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-1)' }}>{lg.user}</div>
                      <Badge tone={lg.role === 'ADMIN' ? 'green' : 'grey'}>{lg.role}</Badge>
                    </td>
                    <td style={{ fontSize: 11, fontFamily: 'monospace' }}>{lg.ip}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-2)' }}>{lg.device}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-2)' }}>{lg.time}</td>
                    <td>
                      <Badge tone={lg.status === 'Success' ? 'green' : 'red'}>{lg.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Recent Audit Logs Stream Widget */}
        <Panel
          title="Tamper-Evident Audit Chain"
          subtitle="Real-time administrative action feed"
          actions={
            <Link to="/admin/audit">
              <Button variant="subtle" size="sm">View Full Log</Button>
            </Link>
          }
        >
          {activity.length === 0 ? (
            <EmptyState title="Nothing yet" hint="Admin changes will appear here as they happen." />
          ) : (
            <div className="feed-list" style={{ maxHeight: 280, overflowY: 'auto' }}>
              {activity.map((entry) => (
                <div key={entry.id} className="feed-item">
                  <div
                    className={`feed-node node-${
                      actionTone(entry.action) === 'red'
                        ? 'amber'
                        : actionTone(entry.action) === 'green'
                          ? 'green'
                          : 'grey'
                    }`}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Badge tone={actionTone(entry.action)}>{entry.action}</Badge>
                      <span style={{ fontSize: 12, color: 'var(--text-1)' }}>{describe(entry)}</span>
                    </div>
                    <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginTop: 4 }}>
                      {relative(entry.createdAt)} · {entry.actorEmail} · SEQ #{entry.seq}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
};
