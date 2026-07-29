import React, { useState } from 'react';
import { ClipboardList, Plus, Play, AlertCircle } from 'lucide-react';
import { Button, Panel, Badge, Modal } from '../../components/admin/ui';
import type { BatchJob } from '../../services/adminApi';

const INITIAL_JOBS: BatchJob[] = [
  {
    id: 'job-501',
    name: 'Bulk Driver License OCR Verification',
    type: 'OCR',
    status: 'Completed',
    triggeredBy: 'System Scheduler',
    itemsProcessed: 148,
    totalItems: 148,
    durationSeconds: 45,
    createdAt: '2026-07-29T08:00:00Z',
    logs: [
      '[08:00:01] Initialising Tesseract OCR workers...',
      '[08:00:15] Batch 1 (50 DL documents) processed.',
      '[08:00:30] Batch 2 (50 DL documents) processed.',
      '[08:00:45] OCR extraction completed cleanly. 148 records verified.',
    ],
  },
  {
    id: 'job-502',
    name: 'Monthly Customer Billing & Annexure Generation',
    type: 'Invoicing',
    status: 'Running',
    triggeredBy: 'Finance Manager',
    itemsProcessed: 82,
    totalItems: 120,
    durationSeconds: 112,
    createdAt: '2026-07-29T09:40:00Z',
    logs: [
      '[09:40:02] Fetching verified POD trips for July 2026...',
      '[09:41:00] 82 customer invoices compiled with tax annexures.',
    ],
  },
  {
    id: 'job-503',
    name: 'FASTag Toll & Fuel Station Ledger Reconciliation',
    type: 'Fuel Reconciliation',
    status: 'Completed',
    triggeredBy: 'Admin User',
    itemsProcessed: 3420,
    totalItems: 3420,
    durationSeconds: 210,
    createdAt: '2026-07-28T23:00:00Z',
    logs: [
      '[23:00:00] Querying NPCI FASTag API & IOCL station fuel slips...',
      '[23:03:30] Matched 3418 transactions automatically. 2 flagged for manual review.',
    ],
  },
];

export const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<BatchJob[]>(INITIAL_JOBS);
  const [selectedJob, setSelectedJob] = useState<BatchJob | null>(null);

  const handleTriggerJob = (type: BatchJob['type'], name: string) => {
    const newJob: BatchJob = {
      id: `job-${Date.now()}`,
      name,
      type,
      status: 'Running',
      triggeredBy: 'Admin User (Manual)',
      itemsProcessed: 12,
      totalItems: 100,
      durationSeconds: 5,
      createdAt: new Date().toISOString(),
      logs: [
        `[${new Date().toLocaleTimeString()}] Initialising ${name}...`,
        `[${new Date().toLocaleTimeString()}] Processing batch data items...`,
      ],
    };
    setJobs([newJob, ...jobs]);
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Operations / P-07</span>
          <h1 className="adm-page-title">
            <ClipboardList size={22} color="var(--green)" /> Business Batch Jobs
          </h1>
          <p className="adm-page-sub">
            Asynchronous batch job manager for OCR document verification, invoice compilation, and fuel ledger reconciliations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant="primary"
            icon={<Play size={14} />}
            onClick={() => handleTriggerJob('OCR', 'Manual OCR Verification Job')}
          >
            Run OCR Batch
          </Button>
          <Button
            variant="subtle"
            icon={<Play size={14} />}
            onClick={() => handleTriggerJob('Fuel Reconciliation', 'Manual Fuel Recon Job')}
          >
            Run Fuel Recon
          </Button>
        </div>
      </div>

      <Panel title="Job Queue & Execution Log">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Job Name & ID</th>
                <th>Job Type</th>
                <th>Triggered By</th>
                <th>Progress / Items</th>
                <th>Duration</th>
                <th>Created At</th>
                <th>Status</th>
                <th>Logs</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => {
                const percent = Math.round((j.itemsProcessed / j.totalItems) * 100);
                return (
                  <tr key={j.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{j.name}</div>
                      <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>
                        {j.id}
                      </span>
                    </td>
                    <td>
                      <Badge tone="grey">{j.type}</Badge>
                    </td>
                    <td style={{ fontSize: 12 }}>{j.triggeredBy}</td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>
                        {j.itemsProcessed} / {j.totalItems} ({percent}%)
                      </div>
                      <div
                        style={{
                          width: 80,
                          height: 4,
                          backgroundColor: 'var(--border-soft)',
                          borderRadius: 2,
                          overflow: 'hidden',
                          marginTop: 2,
                        }}
                      >
                        <div
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            backgroundColor: j.status === 'Completed' ? 'var(--green)' : '#3b82f6',
                          }}
                        />
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{j.durationSeconds}s</td>
                    <td style={{ fontSize: 12, color: 'var(--text-2)' }}>
                      {new Date(j.createdAt).toLocaleTimeString()}
                    </td>
                    <td>
                      <Badge tone={j.status === 'Completed' ? 'green' : j.status === 'Running' ? 'blue' : 'red'}>
                        {j.status}
                      </Badge>
                    </td>
                    <td>
                      <Button variant="subtle" size="sm" icon={<FileText size={12} />} onClick={() => setSelectedJob(j)}>
                        Logs
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Log Output Modal */}
      <Modal open={!!selectedJob} onClose={() => setSelectedJob(null)} title={`Job Execution Log - ${selectedJob?.name}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              padding: 14,
              borderRadius: 6,
              backgroundColor: '#0f172a',
              border: '1px solid var(--border-soft)',
              fontFamily: 'monospace',
              fontSize: 12,
              color: '#38bdf8',
              maxHeight: 250,
              overflowY: 'auto',
            }}
          >
            {selectedJob?.logs.map((line, idx) => (
              <div key={idx} style={{ marginBottom: 4 }}>
                {line}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <Button variant="subtle" onClick={() => setSelectedJob(null)}>Close</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
