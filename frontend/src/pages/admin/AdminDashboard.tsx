import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, CircleHelp, FileStack, LayoutDashboard, Plug, Plus, RefreshCw, ShieldCheck,
  Truck, Upload, UserCog, Users, Wallet, Workflow,
} from 'lucide-react';
import { adminApi, errorMessage } from '../../services/adminApi';
import type { ActivityEntry, DashboardSummary, Metric } from '../../services/adminApi';
import {
  Badge, Button, EmptyState, ErrorState, LoadingState, Panel,
} from '../../components/admin/ui';
import type { BadgeTone } from '../../components/admin/ui';

/**
 * One metric tile. When the metric has no data source we say so plainly rather
 * than rendering a zero, which would read as a real measurement.
 */
const MetricTile: React.FC<{
  label: string;
  metric: Metric;
  icon?: React.ReactNode;
  tone?: string;
}> = ({ label, metric, icon, tone }) => (
  <div className={`adm-metric ${metric.available ? '' : 'is-unavailable'}`}>
    <div className="adm-metric-head">
      <span className="adm-metric-label">{label}</span>
      {metric.available ? icon : <CircleHelp size={13} color="var(--text-3)" />}
    </div>
    {metric.available ? (
      <span className="adm-metric-value" style={tone ? { color: tone } : undefined}>
        {metric.value?.toLocaleString('en-IN')}
      </span>
    ) : (
      <span className="adm-metric-none" title={metric.reason}>
        No data source
      </span>
    )}
    {!metric.available && <span className="adm-metric-reason">{metric.reason}</span>}
  </div>
);

const actionTone = (action: string): BadgeTone => {
  if (action.includes('deleted') || action.includes('failed')) return 'red';
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

/** Turns an audit event into a sentence a human can read at a glance. */
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

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingState label="Loading the admin dashboard" />;
  if (error || !summary) return <ErrorState message={error} onRetry={() => load()} />;

  const quickActions = [
    { label: 'Create role', icon: <ShieldCheck size={14} />, to: '/admin/roles' },
    { label: 'Import data', icon: <Upload size={14} />, to: '/admin/imports' },
    { label: 'Add rule pack', icon: <FileStack size={14} />, to: '/admin/rule-packs' },
    { label: 'Add connector', icon: <Plug size={14} />, to: '/admin/integrations' },
    { label: 'New cost centre', icon: <Wallet size={14} />, to: '/admin/cost-centers' },
    { label: 'Delegate authority', icon: <UserCog size={14} />, to: '/admin/delegations' },
  ];

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Admin suite</span>
          <h1 className="adm-page-title">
            <LayoutDashboard size={22} color="var(--green)" /> Dashboard
          </h1>
          <p className="adm-page-sub">
            Vitals across identity, workflow and integrations. Tiles marked “no data source”
            have no producer in this system yet — they are not zeroes.
          </p>
        </div>
        <Button
          variant="subtle"
          icon={<RefreshCw size={14} />}
          loading={refreshing}
          onClick={() => { setRefreshing(true); void load(true); }}
        >
          Refresh
        </Button>
      </div>

      {/* Quick actions */}
      <Panel title="Quick actions" className="adm-quick-panel">
        <div className="adm-quick-row">
          {quickActions.map((action) => (
            <button key={action.label} className="adm-quick-btn" onClick={() => navigate(action.to)}>
              <span className="adm-quick-icon">{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </Panel>

      {/* Admin Direct Switch Portal */}
      <Panel title="Admin Direct Switch Portal" subtitle="Directly access any operational workspace with administrative permissions" className="adm-quick-panel">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
          {[
            { name: 'Compliance Portal', icon: '⚖️', desc: 'Statutory compliance, challans & insurance claims', path: '/compliance/dashboard', badge: '', color: '#16a34a' },
            { name: 'Dispatcher Workspace', icon: '⚡', desc: 'Active runs, driver assignment & indents', path: '/dispatcher/dashboard', badge: '', color: '#d97706' },
            { name: 'Fleet Manager Portal', icon: '🚚', desc: 'Vehicle master, telematics & health', path: '/fleet/dashboard', badge: '', color: '#0891b2' },
            { name: 'Workshop Portal', icon: '🛠️', desc: 'Job cards, maintenance board & parts demand', path: '/workshop/dashboard', badge: '', color: '#9333ea' },
            { name: 'Admin Suite', icon: '🔧', desc: 'System governance, roles & integrations', path: '/admin/dashboard', badge: '', color: '#2563eb' },
          ].map((portal) => (
            <div
              key={portal.path}
              onClick={() => navigate(portal.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '14px 16px',
                backgroundColor: 'var(--panel-2)',
                border: '1px solid var(--border-soft)',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = portal.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 16px ${portal.color}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-soft)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{portal.icon}</span>
                  <span className="mono-label" style={{ fontSize: 9, padding: '2px 6px', background: 'var(--panel-1)', border: '1px solid var(--border-soft)', borderRadius: 4, color: portal.color }}>
                    {portal.badge}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
                  {portal.name}
                </h4>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4 }}>
                  {portal.desc}
                </p>
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: portal.color }}>
                <span>Launch Portal</span> →
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="adm-metric-groups">
        <Panel title="Users" subtitle="Identity and access" className="adm-metric-panel">
          <div className="adm-metric-grid">
            <MetricTile label="Total users" metric={summary.users.total} icon={<Users size={13} color="var(--green)" />} />
            <MetricTile label="Active" metric={summary.users.active} icon={<Users size={13} color="var(--green)" />} />
            <MetricTile label="Disabled" metric={summary.users.disabled} icon={<Users size={13} color="var(--text-3)" />} />
            <MetricTile label="New this month" metric={summary.users.newThisMonth} icon={<Plus size={13} color="var(--green)" />} />
            <MetricTile label="Failed logins" metric={summary.users.failedLogins} />
          </div>
        </Panel>

        <Panel title="System" subtitle="API and integrations" className="adm-metric-panel">
          <div className="adm-metric-grid">
            <MetricTile
              label="Active integrations"
              metric={summary.system.activeIntegrations}
              icon={<Plug size={13} color="var(--green)" />}
            />
            <MetricTile
              label="Failed integrations"
              metric={summary.system.failedIntegrations}
              icon={<Plug size={13} color="var(--red)" />}
              tone={(summary.system.failedIntegrations.value ?? 0) > 0 ? 'var(--red)' : undefined}
            />
            <MetricTile label="Total connectors" metric={summary.system.totalIntegrations} icon={<Plug size={13} color="var(--text-3)" />} />
            <MetricTile label="API requests today" metric={summary.system.apiRequestsToday} />
            <MetricTile label="Failed API requests" metric={summary.system.failedApiRequests} />
          </div>
        </Panel>

        <Panel title="Workflow" subtitle="Approvals and notifications" className="adm-metric-panel">
          <div className="adm-metric-grid">
            <MetricTile label="Active flows" metric={summary.workflow.activeFlows} icon={<Workflow size={13} color="var(--green)" />} />
            <MetricTile label="Notification policies" metric={summary.workflow.notificationPolicies} icon={<Workflow size={13} color="var(--green)" />} />
            <MetricTile label="Pending approvals" metric={summary.workflow.pendingApprovals} />
            <MetricTile label="Escalated approvals" metric={summary.workflow.escalatedApprovals} />
            <MetricTile label="Pending notifications" metric={summary.workflow.pendingNotifications} />
          </div>
        </Panel>

        <Panel title="Governance" subtitle="Org, rules and audit" className="adm-metric-panel">
          <div className="adm-metric-grid">
            <MetricTile label="Org nodes" metric={summary.governance.orgNodes} icon={<Activity size={13} color="var(--green)" />} />
            <MetricTile label="Roles" metric={summary.governance.roles} icon={<ShieldCheck size={13} color="var(--green)" />} />
            <MetricTile label="Rule packs" metric={summary.governance.rulePacks} icon={<FileStack size={13} color="var(--green)" />} />
            <MetricTile label="Active rule versions" metric={summary.governance.activeRulePackVersions} icon={<FileStack size={13} color="var(--green)" />} />
            <MetricTile label="Import jobs" metric={summary.governance.importJobs} icon={<Upload size={13} color="var(--green)" />} />
            <MetricTile label="Audit events" metric={summary.governance.auditEvents} icon={<Activity size={13} color="var(--green)" />} />
          </div>
        </Panel>

        <Panel
          title="Fleet"
          subtitle="Master Data → Vehicles is not built yet"
          className="adm-metric-panel"
        >
          <div className="adm-metric-grid">
            <MetricTile label="Total vehicles" metric={summary.fleet.total} icon={<Truck size={13} />} />
            <MetricTile label="Active" metric={summary.fleet.active} />
            <MetricTile label="In maintenance" metric={summary.fleet.inMaintenance} />
            <MetricTile label="Compliance blocked" metric={summary.fleet.complianceBlocked} />
            <MetricTile label="Idle" metric={summary.fleet.idle} />
          </div>
        </Panel>

        <Panel
          title="Drivers"
          subtitle="Master Data → Drivers is not built yet"
          className="adm-metric-panel"
        >
          <div className="adm-metric-grid">
            <MetricTile label="Total drivers" metric={summary.drivers.total} />
            <MetricTile label="On duty" metric={summary.drivers.onDuty} />
            <MetricTile label="Off duty" metric={summary.drivers.offDuty} />
            <MetricTile label="Expiring licences" metric={summary.drivers.expiringLicenses} />
          </div>
        </Panel>
      </div>

      <Panel
        title="Recent activity"
        subtitle="Straight off the audit chain — every admin change lands here"
        actions={
          <Link to="/admin/audit">
            <Button variant="subtle" size="sm">View audit log</Button>
          </Link>
        }
        style={{ marginTop: 24 }}
      >
        {activity.length === 0 ? (
          <EmptyState title="Nothing yet" hint="Admin changes will appear here as they happen." />
        ) : (
          <div className="feed-list">
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
                    <span style={{ fontSize: 13, color: 'var(--text-1)' }}>{describe(entry)}</span>
                  </div>
                  <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginTop: 4 }}>
                    {relative(entry.createdAt)} · {entry.actorEmail} · SEQ {entry.seq}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
};
