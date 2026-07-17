import React, { useCallback, useEffect, useState } from 'react';
import {
  CircleCheck, CircleSlash, Cpu, Database, HardDrive, RefreshCw, Server, TriangleAlert,
} from 'lucide-react';
import { adminApi, errorMessage } from '../../services/adminApi';
import type { HealthSnapshot } from '../../services/adminApi';
import {
  Badge, Button, ErrorState, LoadingState, Panel, Toggle, useToast,
} from '../../components/admin/ui';
import type { BadgeTone } from '../../components/admin/ui';

type Status = HealthSnapshot['services'][number]['status'];

const STATUS_TONE: Record<Status, BadgeTone> = {
  UP: 'green',
  DOWN: 'red',
  NOT_CONFIGURED: 'grey',
};

const STATUS_ICON: Record<Status, React.ReactNode> = {
  UP: <CircleCheck size={12} />,
  DOWN: <TriangleAlert size={12} />,
  NOT_CONFIGURED: <CircleSlash size={12} />,
};

const SERVICE_ICON: Record<string, React.ReactNode> = {
  API: <Server size={16} />,
  Database: <Database size={16} />,
  Redis: <HardDrive size={16} />,
  Kafka: <HardDrive size={16} />,
};

export const SystemHealth: React.FC = () => {
  const { notify } = useToast();
  const [snapshot, setSnapshot] = useState<HealthSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [auto, setAuto] = useState(true);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      setSnapshot(await adminApi.health());
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'Could not read system health'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Poll while auto-refresh is on — this is the one screen where staleness lies.
  useEffect(() => {
    if (!auto) return;
    const timer = setInterval(() => void load(true), 5000);
    return () => clearInterval(timer);
  }, [auto, load]);

  if (loading) return <LoadingState label="Probing services" />;
  if (error || !snapshot) return <ErrorState message={error} onRetry={() => load()} />;

  const heapPct = snapshot.memory.heapUtilisation;
  const heapColor = heapPct > 90 ? 'var(--red)' : heapPct > 75 ? 'var(--amber)' : 'var(--green)';

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">P-08 · Monitoring</span>
          <h1 className="adm-page-title">
            <Cpu size={22} color="var(--green)" /> System Health
          </h1>
          <p className="adm-page-sub">
            Live probes against the API process and its database. Redis and Kafka are
            reported as not configured because this deployment does not run them — that is
            an honest reading, not a failure.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Toggle checked={auto} onChange={setAuto} label="Auto refresh" />
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Auto refresh (5s)</span>
          </div>
          <Button
            variant="subtle"
            icon={<RefreshCw size={14} />}
            onClick={() => { void load(true); notify('info', 'Health re-probed'); }}
          >
            Probe now
          </Button>
        </div>
      </div>

      <Panel title="Services" subtitle={`Last checked ${new Date(snapshot.checkedAt).toLocaleTimeString('en-IN')}`}>
        <div className="adm-conn-grid">
          {snapshot.services.map((service) => (
            <div
              key={service.name}
              className={`adm-conn-card status-${service.status === 'UP' ? 'HEALTHY' : service.status === 'DOWN' ? 'DOWN' : 'DISCONNECTED'}`}
            >
              <div className="adm-conn-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--text-3)' }}>
                    {SERVICE_ICON[service.name] ?? <Server size={16} />}
                  </span>
                  <div>
                    <div className="adm-conn-name">{service.name}</div>
                    {service.latencyMs !== null && (
                      <span className="adm-conn-cat">{service.latencyMs} ms</span>
                    )}
                  </div>
                </div>
                <Badge tone={STATUS_TONE[service.status]}>
                  {STATUS_ICON[service.status]}{' '}
                  {service.status === 'NOT_CONFIGURED' ? 'N/A' : service.status}
                </Badge>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
                {service.detail}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="adm-grid-2" style={{ marginTop: 24 }}>
        <Panel title="Memory" subtitle="V8 heap and resident set for the API process">
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Heap used</span>
              <span className="adm-cell-mono" style={{ color: heapColor }}>
                {snapshot.memory.heapUsedMb} MB / {snapshot.memory.heapTotalMb} MB ({heapPct}%)
              </span>
            </div>
            <div className="adm-budget-track" style={{ height: 8 }}>
              <div
                className="adm-budget-fill"
                style={{ width: `${heapPct}%`, backgroundColor: heapColor }}
              />
            </div>
          </div>

          <div className="adm-metric-grid">
            <div className="adm-metric">
              <div className="adm-metric-head"><span className="adm-metric-label">Heap used</span></div>
              <span className="adm-metric-value">{snapshot.memory.heapUsedMb}</span>
              <span className="adm-metric-reason">MB</span>
            </div>
            <div className="adm-metric">
              <div className="adm-metric-head"><span className="adm-metric-label">Heap total</span></div>
              <span className="adm-metric-value">{snapshot.memory.heapTotalMb}</span>
              <span className="adm-metric-reason">MB</span>
            </div>
            <div className="adm-metric">
              <div className="adm-metric-head"><span className="adm-metric-label">RSS</span></div>
              <span className="adm-metric-value">{snapshot.memory.rssMb}</span>
              <span className="adm-metric-reason">MB resident</span>
            </div>
          </div>
        </Panel>

        <Panel title="Process" subtitle="The Node runtime serving this API">
          <div className="adm-metric-grid">
            <div className="adm-metric">
              <div className="adm-metric-head"><span className="adm-metric-label">Uptime</span></div>
              <span className="adm-metric-value" style={{ fontSize: 18 }}>
                {snapshot.process.uptimeLabel}
              </span>
            </div>
            <div className="adm-metric">
              <div className="adm-metric-head"><span className="adm-metric-label">Node</span></div>
              <span className="adm-metric-value" style={{ fontSize: 18 }}>
                {snapshot.process.nodeVersion}
              </span>
            </div>
            <div className="adm-metric">
              <div className="adm-metric-head"><span className="adm-metric-label">Platform</span></div>
              <span className="adm-metric-value" style={{ fontSize: 18 }}>
                {snapshot.process.platform}
              </span>
            </div>
            <div className="adm-metric">
              <div className="adm-metric-head"><span className="adm-metric-label">PID</span></div>
              <span className="adm-metric-value" style={{ fontSize: 18 }}>
                {snapshot.process.pid}
              </span>
            </div>
          </div>

          <div className="adm-sod" style={{ marginTop: 16 }}>
            <Cpu size={15} />
            <div>
              <strong>CPU time: {snapshot.cpu.userMs} ms user / {snapshot.cpu.systemMs} ms system</strong>
              <div style={{ marginTop: 3 }}>{snapshot.cpu.note}</div>
            </div>
          </div>

          <div className="adm-sod" style={{ marginTop: 12 }}>
            <TriangleAlert size={15} />
            <div>
              <strong>Error rate: not tracked</strong>
              <div style={{ marginTop: 3 }}>{snapshot.errorRate.note}</div>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
};
