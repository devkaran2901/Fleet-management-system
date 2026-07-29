import React, { useState } from 'react';
import { RefreshCcw, Search, Download, RotateCw } from 'lucide-react';
import { Button, Panel, Badge, Modal } from '../../components/admin/ui';
import type { SyncLogItem } from '../../services/adminApi';

const INITIAL_LOGS: SyncLogItem[] = [
  {
    id: 'slog-101',
    connectorKey: 'kyc-aggregator',
    connectorName: 'KYC Aggregator Connector',
    syncType: 'Incremental',
    recordsSynced: 42,
    errorCount: 0,
    durationMs: 1420,
    status: 'SUCCESS',
    timestamp: '2026-07-29T09:45:00Z',
  },
  {
    id: 'slog-102',
    connectorKey: 'fastag-npci',
    connectorName: 'NPCI FASTag Gateway',
    syncType: 'Full Sync',
    recordsSynced: 1280,
    errorCount: 3,
    durationMs: 4820,
    status: 'PARTIAL',
    timestamp: '2026-07-29T09:30:00Z',
    errorMessage: '3 toll transaction records missing vehicle mapping ID',
  },
  {
    id: 'slog-103',
    connectorKey: 'sap-erp-fi',
    connectorName: 'SAP ERP Financials Sync',
    syncType: 'Full Sync',
    recordsSynced: 0,
    errorCount: 1,
    durationMs: 890,
    status: 'FAILED',
    timestamp: '2026-07-29T08:15:00Z',
    errorMessage: 'HTTP 503 Service Unavailable on SAP ERP gateway host',
  },
];

export const SyncLogs: React.FC = () => {
  const [logs, setLogs] = useState<SyncLogItem[]>(INITIAL_LOGS);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<SyncLogItem | null>(null);

  const filtered = logs.filter(
    (l) =>
      l.connectorName.toLowerCase().includes(search.toLowerCase()) ||
      l.connectorKey.toLowerCase().includes(search.toLowerCase()) ||
      l.status.toLowerCase().includes(search.toLowerCase())
  );

  const handleRetry = (log: SyncLogItem) => {
    alert(`Retrying sync execution for ${log.connectorName}...`);
    const newLog: SyncLogItem = {
      id: `slog-${Date.now()}`,
      connectorKey: log.connectorKey,
      connectorName: log.connectorName,
      syncType: 'Incremental',
      recordsSynced: log.recordsSynced + 5,
      errorCount: 0,
      durationMs: 1100,
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
    };
    setLogs([newLog, ...logs]);
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Integrations / P-06</span>
          <h1 className="adm-page-title">
            <RefreshCcw size={22} color="var(--green)" /> Integration Sync Logs
          </h1>
          <p className="adm-page-sub">
            Per-connector execution history, error diagnostics, sync timing, and manual retry controls.
          </p>
        </div>
        <Button
          variant="subtle"
          icon={<Download size={14} />}
          onClick={() => alert('Downloading sync audit logs CSV export...')}
        >
          Export CSV Log
        </Button>
      </div>

      <Panel title="Sync Execution Runs">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search connector name, key, or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                fontSize: 13,
                borderRadius: 6,
                border: '1px solid var(--border-soft)',
                backgroundColor: 'var(--panel-2)',
                color: 'var(--text-1)',
              }}
            />
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Connector</th>
                <th>Sync Mode</th>
                <th>Records Synced</th>
                <th>Errors</th>
                <th>Duration</th>
                <th>Execution Time</th>
                <th>Outcome</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{l.connectorName}</div>
                    <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>
                      {l.connectorKey}
                    </span>
                  </td>
                  <td>
                    <Badge tone="grey">{l.syncType}</Badge>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>
                    {l.recordsSynced.toLocaleString('en-IN')}
                  </td>
                  <td style={{ color: l.errorCount > 0 ? '#ef4444' : 'var(--text-3)' }}>
                    {l.errorCount}
                  </td>
                  <td style={{ fontSize: 12 }}>{l.durationMs} ms</td>
                  <td style={{ fontSize: 12, color: 'var(--text-2)' }}>
                    {new Date(l.timestamp).toLocaleTimeString()}
                  </td>
                  <td>
                    <Badge tone={l.status === 'SUCCESS' ? 'green' : l.status === 'PARTIAL' ? 'amber' : 'red'}>
                      {l.status}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {l.errorMessage && (
                        <Button variant="subtle" size="sm" onClick={() => setSelectedLog(l)}>
                          View Error
                        </Button>
                      )}
                      <Button variant="subtle" size="sm" icon={<RotateCw size={12} />} onClick={() => handleRetry(l)}>
                        Retry
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Error Details Modal */}
      <Modal open={!!selectedLog} onClose={() => setSelectedLog(null)} title={`Sync Error - ${selectedLog?.connectorName}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 6, backgroundColor: '#0f172a', border: '1px solid #ef4444', color: '#ef4444', fontSize: 13 }}>
            <strong>Error Details:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#fca5a5' }}>{selectedLog?.errorMessage}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <Button variant="subtle" onClick={() => setSelectedLog(null)}>Close</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (selectedLog) handleRetry(selectedLog);
                setSelectedLog(null);
              }}
            >
              Retry Sync
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
