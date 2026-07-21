import React from 'react';
import { FileText, Download, Calendar, Clock, ShieldCheck } from 'lucide-react';
import { Panel, Badge, Button, useToast } from '../../components/admin/ui';

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  format: 'XLSX' | 'PDF' | 'CSV';
  schedule: string;
  lastRun: string;
}

const TEMPLATES: ReportTemplate[] = [
  { id: 'REP-01', title: 'Statutory Fitness Expiry Register', description: 'Lists all fleet vehicles with physical fitness dates, RTO tags, and upcoming inspection slots.', format: 'XLSX', schedule: 'Weekly (Every Mon 02:00)', lastRun: '2026-07-20 02:15' },
  { id: 'REP-02', title: 'National Road Permit Ledger', description: 'Permit types, authorization states, cost allocations, and renewal logs.', format: 'XLSX', schedule: 'Monthly (1st of month)', lastRun: '2026-07-01 01:30' },
  { id: 'REP-03', title: 'Outstanding Traffic Challans Audit', description: 'Open violations list with responsibility attributions, fine balances, and aging stats.', format: 'PDF', schedule: 'Daily (Every night 23:59)', lastRun: '2026-07-20 23:59' },
  { id: 'REP-04', title: 'Insurance Premium & Endorsements Schedule', description: 'Active fleet policy cover details, premium schedules, and endorsement delay flags.', format: 'CSV', schedule: 'On-Demand Only', lastRun: '2026-07-15 16:45' }
];

export const ComplianceReports: React.FC = () => {
  const { notify } = useToast();

  const handleExport = (title: string) => {
    notify('success', `Export started: Generating ${title}. Check notifications when ready for download.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Statutory Register & Compliance Reports</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
          Schedule and download corporate compliance registers, policy audit records, and liability logs.
        </p>
      </div>

      {/* Analytics widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <Panel title="Automated Reporting Schedule" subtitle="System scheduled cron-ledgers">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} /> Weekly Fitness Audits:</span>
              <Badge tone="green">Active Cron</Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> Daily Outstanding Challans:</span>
              <Badge tone="green">Active Cron</Badge>
            </div>
          </div>
        </Panel>

        <Panel title="Report Security Seal" subtitle="Data lock and DPDP audit status">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, backgroundColor: 'var(--green-glow)', borderRadius: 6, border: '1px solid rgba(46, 204, 113, 0.2)' }}>
            <ShieldCheck size={20} color="var(--green)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-1)' }}>
              All report exports mask driver DL details and personal mobile contacts in accordance with DPDP-2023 guidelines.
            </span>
          </div>
        </Panel>
      </div>

      {/* Templates List */}
      <Panel title="Statutory Registers Registry" subtitle="Download and trigger operational spreadsheets">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {TEMPLATES.map((tpl) => (
            <div 
              key={tpl.id}
              style={{
                padding: 16,
                backgroundColor: 'var(--panel-2)',
                borderRadius: 8,
                border: '1px solid var(--border-soft)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'start' }}>
                <div style={{ padding: 10, borderRadius: 6, backgroundColor: 'var(--panel-3)', color: 'var(--text-2)' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 15 }}>{tpl.title}</strong>
                    <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>{tpl.id}</span>
                    <Badge tone="blue">{tpl.format}</Badge>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', margin: '6px 0' }}>{tpl.description}</p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-3)' }}>
                    <span>Schedule: <strong>{tpl.schedule}</strong></span>
                    <span>Last Generation: <strong>{tpl.lastRun}</strong></span>
                  </div>
                </div>
              </div>

              <Button 
                variant="primary" 
                icon={<Download size={14} style={{ marginRight: 6 }} />}
                onClick={() => handleExport(tpl.title)}
              >
                Export Register
              </Button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};
