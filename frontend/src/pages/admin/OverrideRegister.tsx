import React, { useState } from 'react';
import { FileBadge, Search, UserCheck, Download } from 'lucide-react';
import { Button, Panel, Badge } from '../../components/admin/ui';
import type { OverrideRecord } from '../../services/adminApi';

const INITIAL_OVERRIDES: OverrideRecord[] = [
  {
    id: 'ovr-1',
    ruleCode: 'RULE-FIT-002',
    ruleLabel: 'Vehicle Fitness Certificate Mandate',
    entityType: 'Trip Dispatch',
    entityRef: 'TRIP-2026-9481',
    justification: 'Emergency cargo dispatch for oxygen cylinders — approved by Operations Head',
    operator: 'Rajesh Dispatcher',
    approver: 'Vikram VP Logistics',
    riskSeverity: 'HIGH',
    timestamp: '2026-07-29T07:15:00Z',
  },
  {
    id: 'ovr-2',
    ruleCode: 'RULE-LIC-005',
    ruleLabel: 'Driver Rest Period 8-Hour Threshold',
    entityType: 'Driver Assignment',
    entityRef: 'DRV-4019',
    justification: 'Driver had 7.5 hours rest; route duration under 2 hours',
    operator: 'Sunil Fleet Supervisor',
    approver: 'Anita Admin',
    riskSeverity: 'MEDIUM',
    timestamp: '2026-07-28T18:30:00Z',
  },
  {
    id: 'ovr-3',
    ruleCode: 'RULE-BUD-011',
    ruleLabel: 'Cost Center Budget Exceeded Limit',
    entityType: 'Vendor Bill',
    entityRef: 'BILL-88912',
    justification: 'Unscheduled engine repair required to prevent trip breakdown',
    operator: 'Finance Officer',
    approver: 'CFO Office',
    riskSeverity: 'LOW',
    timestamp: '2026-07-27T11:20:00Z',
  },
];

export const OverrideRegister: React.FC = () => {
  const [overrides, setOverrides] = useState<OverrideRecord[]>(INITIAL_OVERRIDES);
  const [search, setSearch] = useState('');

  const filtered = overrides.filter(
    (o) =>
      o.ruleCode.toLowerCase().includes(search.toLowerCase()) ||
      o.ruleLabel.toLowerCase().includes(search.toLowerCase()) ||
      o.entityRef.toLowerCase().includes(search.toLowerCase()) ||
      o.justification.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Audit / P-05</span>
          <h1 className="adm-page-title">
            <FileBadge size={22} color="var(--green)" /> Compliance Override Register
          </h1>
          <p className="adm-page-sub">
            Append-only governance register of every compliance rule bypass, operator justification, and approving authority.
          </p>
        </div>
        <Button
          variant="subtle"
          icon={<Download size={14} />}
          onClick={() => alert('Downloading compliance rule override audit register...')}
        >
          Export Audit Report
        </Button>
      </div>

      <Panel title="Bypassed Rules & Approvals Log">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search rule code, description, entity reference, operator..."
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
                <th>Rule Code & Description</th>
                <th>Target Entity</th>
                <th>Justification</th>
                <th>Operator</th>
                <th>Approving Authority</th>
                <th>Risk Rating</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{o.ruleLabel}</div>
                    <span className="mono-label" style={{ fontSize: 10, color: '#ef4444' }}>
                      {o.ruleCode}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{o.entityRef}</div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{o.entityType}</span>
                  </td>
                  <td style={{ fontSize: 12, maxWidth: 280, color: 'var(--text-2)' }}>
                    "{o.justification}"
                  </td>
                  <td style={{ fontSize: 12 }}>{o.operator}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>
                      <UserCheck size={13} /> {o.approver}
                    </div>
                  </td>
                  <td>
                    <Badge tone={o.riskSeverity === 'HIGH' ? 'red' : o.riskSeverity === 'MEDIUM' ? 'amber' : 'grey'}>
                      {o.riskSeverity} RISK
                    </Badge>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-2)' }}>
                    {new Date(o.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
};
