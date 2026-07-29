import React, { useState } from 'react';
import { Timer, Play } from 'lucide-react';
import { Button, Panel, Badge, Modal, Input, Field } from '../../components/admin/ui';
import type { BackgroundTask } from '../../services/adminApi';

const INITIAL_TASKS: BackgroundTask[] = [
  {
    id: 'task-1',
    name: 'Nightly Database Backup & WAL Archive',
    scheduleCron: '0 0 * * *',
    handler: 'DatabaseBackupHandler.run',
    lastRun: '2026-07-29T00:00:00Z',
    nextRun: '2026-07-30T00:00:00Z',
    status: 'Active',
    executionCount: 420,
  },
  {
    id: 'task-2',
    name: 'License & Permit Expiry Notification Digest',
    scheduleCron: '0 6 * * *',
    handler: 'ComplianceDigestHandler.run',
    lastRun: '2026-07-29T06:00:00Z',
    nextRun: '2026-07-30T06:00:00Z',
    status: 'Active',
    executionCount: 180,
  },
  {
    id: 'task-3',
    name: 'Temporary File Cleanup & Session Rotation',
    scheduleCron: '0 */4 * * *',
    handler: 'StorageCleanupHandler.run',
    lastRun: '2026-07-29T08:00:00Z',
    nextRun: '2026-07-29T12:00:00Z',
    status: 'Active',
    executionCount: 1450,
  },
];

export const BackgroundTasks: React.FC = () => {
  const [tasks, setTasks] = useState<BackgroundTask[]>(INITIAL_TASKS);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    scheduleCron: '0 0 * * *',
    handler: 'CustomTaskHandler.run',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: BackgroundTask = {
      id: `task-${Date.now()}`,
      name: formData.name,
      scheduleCron: formData.scheduleCron,
      handler: formData.handler,
      lastRun: 'Never',
      nextRun: 'Next hour',
      status: 'Active',
      executionCount: 0,
    };
    setTasks([newTask, ...tasks]);
    setModalOpen(false);
  };

  const handleToggle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'Active' ? 'Paused' : 'Active' } : t
      )
    );
  };

  const handleTriggerNow = (name: string) => {
    alert(`Task "${name}" triggered immediately for execution.`);
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Operations / P-07</span>
          <h1 className="adm-page-title">
            <Timer size={22} color="var(--green)" /> Background Scheduled Tasks
          </h1>
          <p className="adm-page-sub">
            Cron scheduler for automated nightly database backups, compliance notification digests, and log rotation.
          </p>
        </div>
        <Button variant="primary" icon={<Timer size={14} />} onClick={() => setModalOpen(true)}>
          Schedule New Task
        </Button>
      </div>

      <Panel title="Configured Cron Schedules">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Task Name & Handler</th>
                <th>Cron Schedule</th>
                <th>Executions</th>
                <th>Last Executed</th>
                <th>Next Scheduled Run</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{t.name}</div>
                    <code className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>
                      {t.handler}
                    </code>
                  </td>
                  <td>
                    <Badge tone="blue">
                      <code style={{ fontSize: 11 }}>{t.scheduleCron}</code>
                    </Badge>
                  </td>
                  <td style={{ fontWeight: 600, fontSize: 12 }}>{t.executionCount} runs</td>
                  <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{t.lastRun}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{t.nextRun}</td>
                  <td>
                    <Badge tone={t.status === 'Active' ? 'green' : 'amber'}>{t.status}</Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button variant="subtle" size="sm" onClick={() => handleToggle(t.id)}>
                        {t.status === 'Active' ? 'Pause' : 'Resume'}
                      </Button>
                      <Button
                        variant="subtle"
                        size="sm"
                        icon={<Play size={12} />}
                        onClick={() => handleTriggerNow(t.name)}
                      >
                        Run Now
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Background Task">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Task Name"><Input value={formData.name} placeholder="e.g. Nightly Audit Dump" onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></Field>
          <Field label="Cron Expression (e.g. 0 0 * * *)"><Input value={formData.scheduleCron} onChange={(e) => setFormData({ ...formData, scheduleCron: e.target.value })} required /></Field>
          <Field label="Execution Handler Class"><Input value={formData.handler} placeholder="AuditExportHandler.run" onChange={(e) => setFormData({ ...formData, handler: e.target.value })} required /></Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <Button variant="subtle" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Schedule Task</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
