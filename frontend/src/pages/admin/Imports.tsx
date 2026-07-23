import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, CheckCircle2, Download, FileSpreadsheet, RotateCcw, Upload, XCircle,
} from 'lucide-react';
import { adminApi, errorMessage } from '../../services/adminApi';
import type { ImportEntityDef, ImportJob } from '../../services/adminApi';
import {
  Badge, Button, EmptyState, ErrorState, Field, LoadingState, Panel, Select, useToast,
} from '../../components/admin/ui';
import type { BadgeTone } from '../../components/admin/ui';

const STATUS_TONE: Record<ImportJob['status'], BadgeTone> = {
  MAPPING: 'amber',
  VALIDATED: 'blue',
  COMMITTED: 'green',
  FAILED: 'red',
};

const WIZARD_STEPS = ['Upload', 'Map', 'Validate', 'Preview', 'Commit'];

/** Which wizard step a job is sitting on, derived from its server-side status. */
const stepOf = (job: ImportJob | null): number => {
  if (!job) return 0;
  if (job.status === 'COMMITTED') return 4;
  if (job.status === 'VALIDATED') return 3;
  return 1;
};

export const Imports: React.FC = () => {
  const { notify } = useToast();
  const [entities, setEntities] = useState<ImportEntityDef[]>([]);
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [entityKey, setEntityKey] = useState('users');
  const [job, setJob] = useState<ImportJob | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [entityData, jobData] = await Promise.all([adminApi.importEntities(), adminApi.imports()]);
      setEntities(entityData);
      setJobs(jobData);
    } catch (err) {
      setError(errorMessage(err, 'Could not load the import wizard'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const entityDef = entities.find((e) => e.key === (job?.entity ?? entityKey)) ?? null;
  const step = stepOf(job);

  // Column headers come back with the upload; later fetches derive them from the rows.
  const headers = useMemo(() => {
    if (job?.headers) return job.headers;
    if (job?.rows?.length) return Object.keys(job.rows[0]);
    return [];
  }, [job]);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      notify('error', 'Please choose a .csv file');
      return;
    }
    setBusy(true);
    try {
      const csv = await file.text();
      const created = await adminApi.uploadImport({ entity: entityKey, fileName: file.name, csv });
      setJob(created);
      setMapping(created.mapping ?? {});
      notify('success', `Parsed ${created.totalRows} row(s) from ${file.name}`);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not read that file'));
    } finally {
      setBusy(false);
    }
  };

  const saveMapping = async () => {
    if (!job) return;
    setBusy(true);
    try {
      const updated = await adminApi.setImportMapping(job.id, mapping);
      setJob({ ...updated, headers });
      notify('success', 'Mapping saved');
    } catch (err) {
      notify('error', errorMessage(err, 'Could not save the mapping'));
    } finally {
      setBusy(false);
    }
  };

  const validate = async () => {
    if (!job) return;
    setBusy(true);
    try {
      await adminApi.setImportMapping(job.id, mapping);
      const validated = await adminApi.validateImport(job.id);
      setJob({ ...validated, headers });
      notify(
        validated.errorRows > 0 ? 'info' : 'success',
        `${validated.validRows} valid, ${validated.errorRows} with errors`,
      );
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Validation failed'));
    } finally {
      setBusy(false);
    }
  };

  const commit = async () => {
    if (!job) return;
    if (!window.confirm(
      `Commit ${job.validRows} valid row(s)? ${job.errorRows > 0 ? `${job.errorRows} row(s) with errors will be skipped.` : ''}`,
    )) return;

    setBusy(true);
    try {
      const committed = await adminApi.commitImport(job.id);
      setJob({ ...committed, headers });
      notify('success', `Committed ${committed.created ?? job.validRows} row(s)`);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'The commit failed'));
    } finally {
      setBusy(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const csv = await adminApi.importTemplate(entityKey);
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${entityKey}-template.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      notify('error', errorMessage(err, 'Could not fetch the template'));
    }
  };

  const reset = () => {
    setJob(null);
    setMapping({});
    if (fileInput.current) fileInput.current.value = '';
  };

  const openJob = async (id: string) => {
    setBusy(true);
    try {
      const fetched = await adminApi.getImport(id);
      setJob(fetched);
      setMapping(fetched.mapping ?? {});
      setEntityKey(fetched.entity);
    } catch (err) {
      notify('error', errorMessage(err, 'Could not open that job'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState label="Loading the import wizard" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const errorRowNumbers = new Set((job?.errors ?? []).map((e) => e.row));

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Integration &amp; Import</span>
          <h1 className="adm-page-title">
            <Upload size={22} color="var(--green)" /> Import Wizard
          </h1>
          <p className="adm-page-sub">
            Upload → map → validate → preview errors → commit. Nothing is written until the
            final step, and rows with errors are skipped rather than failing the batch.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="subtle" icon={<Download size={14} />} onClick={downloadTemplate}>
            Template
          </Button>
          {job && (
            <Button variant="subtle" icon={<RotateCcw size={14} />} onClick={reset}>
              New import
            </Button>
          )}
        </div>
      </div>

      <div className="adm-steps">
        {WIZARD_STEPS.map((label, index) => (
          <React.Fragment key={label}>
            {index > 0 && <span className="adm-step-line" />}
            <div
              className={`adm-step ${index === step ? 'is-current' : index < step ? 'is-done' : ''}`}
            >
              <span className="adm-step-num">
                {index < step ? <CheckCircle2 size={11} /> : index + 1}
              </span>
              {label}
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="adm-grid-side">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Step 1 — upload */}
          {!job && (
            <Panel title="Choose what to import" subtitle="Pick an entity, then drop its CSV.">
              <Field label="Entity">
                <Select value={entityKey} onChange={(e) => setEntityKey(e.target.value)}>
                  {entities.map((e) => <option key={e.key} value={e.key}>{e.label}</option>)}
                </Select>
              </Field>

              <div
                className={`adm-drop ${dragging ? 'is-over' : ''}`}
                onClick={() => fileInput.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) void handleFile(file);
                }}
              >
                <FileSpreadsheet size={26} color="var(--green)" />
                <span className="adm-drop-title">
                  {busy ? 'Reading file…' : 'Drop a CSV here, or click to browse'}
                </span>
                <span className="adm-drop-hint">
                  Expected columns: {entityDef?.fields.map((f) => f.key).join(', ')}
                </span>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".csv,text/csv"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFile(file);
                  }}
                />
              </div>
            </Panel>
          )}

          {/* Step 2 — map */}
          {job && job.status !== 'COMMITTED' && (
            <Panel
              title="Map columns"
              subtitle={`${job.fileName} · ${job.totalRows} row(s) · matching headers were mapped for you`}
              actions={
                <>
                  <Button variant="subtle" loading={busy} onClick={saveMapping}>Save mapping</Button>
                  <Button variant="primary" loading={busy} onClick={validate}>Validate rows</Button>
                </>
              }
            >
              {entityDef?.fields.map((field) => (
                <div className="adm-map-row" key={field.key}>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>
                      {field.label}
                      {field.required && <span style={{ color: 'var(--red)' }}> *</span>}
                    </div>
                    <div className="adm-row-sub adm-cell-mono">
                      {field.key}
                      {field.hint ? ` · ${field.hint}` : ''}
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--text-3)" />
                  <Select
                    value={mapping[field.key] ?? ''}
                    onChange={(e) =>
                      setMapping((m) => {
                        const next = { ...m };
                        if (e.target.value) next[field.key] = e.target.value;
                        else delete next[field.key];
                        return next;
                      })
                    }
                  >
                    <option value="">— Not mapped —</option>
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </Select>
                </div>
              ))}
            </Panel>
          )}

          {/* Steps 3-4 — preview errors */}
          {job && job.status === 'VALIDATED' && (
            <Panel
              title="Preview"
              subtitle={`${job.validRows} row(s) will be committed, ${job.errorRows} will be skipped`}
              actions={
                <Button
                  variant="primary"
                  loading={busy}
                  disabled={job.validRows === 0}
                  onClick={commit}
                >
                  Commit {job.validRows} row(s)
                </Button>
              }
              padded={false}
            >
              <div className="adm-table-wrap" style={{ maxHeight: 420, overflowY: 'auto' }}>
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      {entityDef?.fields.map((f) => <th key={f.key}>{f.label}</th>)}
                      <th>Issue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.rows.map((raw, index) => {
                      const rowNumber = index + 1;
                      const rowErrors = job.errors.filter((e) => e.row === rowNumber);
                      const bad = errorRowNumbers.has(rowNumber);
                      return (
                        <tr key={rowNumber} className={bad ? 'adm-err-row' : ''}>
                          <td className="adm-cell-mono">{rowNumber}</td>
                          {entityDef?.fields.map((field) => {
                            const column = mapping[field.key];
                            const value = column ? raw[column] : '';
                            const fieldBad = rowErrors.some((e) => e.field === field.key);
                            return (
                              <td key={field.key} className={fieldBad ? 'adm-cell-bad' : ''}>
                                {value || <span style={{ color: 'var(--text-3)' }}>—</span>}
                              </td>
                            );
                          })}
                          <td>
                            {rowErrors.length === 0 ? (
                              <Badge tone="green">OK</Badge>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {rowErrors.map((e, i) => (
                                  <span key={i} style={{ fontSize: 11, color: 'var(--red)' }}>
                                    {e.field}: {e.message}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {/* Step 5 — committed */}
          {job && job.status === 'COMMITTED' && (
            <Panel title="Committed">
              <div className="adm-sod is-clean" style={{ alignItems: 'center' }}>
                <CheckCircle2 size={16} />
                <div>
                  <strong>{job.fileName} committed</strong>
                  <div style={{ marginTop: 3 }}>
                    {job.created ?? job.validRows} row(s) written to {job.entity}
                    {job.errorRows > 0 ? `, ${job.errorRows} skipped for errors` : ''}. The
                    wizard steps are chained in the audit log.
                  </div>
                </div>
              </div>
              <Button variant="subtle" icon={<RotateCcw size={14} />} onClick={reset} style={{ marginTop: 16 }}>
                Start another import
              </Button>
            </Panel>
          )}

          {job && job.status === 'FAILED' && (
            <Panel title="Failed">
              <div className="adm-sod is-conflict" style={{ alignItems: 'center' }}>
                <XCircle size={16} />
                <span>
                  This job failed during commit. Nothing further was written — start a new import.
                </span>
              </div>
            </Panel>
          )}
        </div>

        <Panel title="Recent jobs" subtitle="Click to reopen" padded={false}>
          {jobs.length === 0 ? (
            <EmptyState title="No imports yet" hint="Your uploads will show up here." />
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <tbody>
                  {jobs.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => void openJob(row.id)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: job?.id === row.id ? 'var(--green-glow)' : undefined,
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{row.fileName}</div>
                        <div className="adm-row-sub">
                          {row.entity} · {row.totalRows} rows ·{' '}
                          {new Date(row.createdAt).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td style={{ width: 80 }}>
                        <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
};
