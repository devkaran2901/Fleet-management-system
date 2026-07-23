import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check, CircleAlert, FileStack, FlaskConical, Plus, Rocket, Trash2, X,
} from 'lucide-react';
import { adminApi, errorMessage } from '../../services/adminApi';
import type {
  PackRule, RulePack, RulePackVersion, SimulationResult,
} from '../../services/adminApi';
import {
  Badge, Button, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Panel,
  Select, useToast,
} from '../../components/admin/ui';
import type { BadgeTone } from '../../components/admin/ui';

const OPERATORS: PackRule['operator'][] = ['lte', 'gte', 'eq', 'required'];

const STATUS_TONE: Record<RulePackVersion['status'], BadgeTone> = {
  ACTIVE: 'green',
  DRAFT: 'amber',
  RETIRED: 'grey',
};

const OUTCOME_TONE: Record<SimulationResult['outcome'], BadgeTone> = {
  PASS: 'green',
  WARN: 'amber',
  BLOCKED: 'red',
};

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const toDateInput = (iso: string) => new Date(iso).toISOString().slice(0, 10);

export const RulePacks: React.FC = () => {
  const { notify } = useToast();
  const [packs, setPacks] = useState<RulePack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  const [draftRules, setDraftRules] = useState<PackRule[]>([]);
  const [draftFrom, setDraftFrom] = useState('');
  const [saving, setSaving] = useState(false);

  const [creatingPack, setCreatingPack] = useState(false);
  const [newPack, setNewPack] = useState({ key: '', name: '', stateCode: '' });
  const [draftingVersion, setDraftingVersion] = useState(false);
  const [newVersionFrom, setNewVersionFrom] = useState('');

  const [simOpen, setSimOpen] = useState(false);
  const [simInput, setSimInput] = useState('');
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simError, setSimError] = useState('');
  const [simulating, setSimulating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.rulePacks();
      setPacks(data);
      setSelectedPackId((current) => current ?? data[0]?.id ?? null);
    } catch (err) {
      setError(errorMessage(err, 'Could not load the rule packs'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selectedPack = packs.find((p) => p.id === selectedPackId) ?? null;

  const selectedVersion = useMemo(() => {
    if (!selectedPack) return null;
    return (
      selectedPack.versions.find((v) => v.id === selectedVersionId) ??
      selectedPack.versions.find((v) => v.status === 'ACTIVE') ??
      selectedPack.versions[0] ??
      null
    );
  }, [selectedPack, selectedVersionId]);

  // Load the chosen version into the editable draft.
  useEffect(() => {
    if (!selectedVersion) {
      setDraftRules([]);
      setDraftFrom('');
      return;
    }
    setDraftRules(selectedVersion.rules ?? []);
    setDraftFrom(toDateInput(selectedVersion.effectiveFrom));
  }, [selectedVersion?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDraft = selectedVersion?.status === 'DRAFT';

  const dirty = useMemo(() => {
    if (!selectedVersion) return false;
    return (
      JSON.stringify(selectedVersion.rules ?? []) !== JSON.stringify(draftRules) ||
      toDateInput(selectedVersion.effectiveFrom) !== draftFrom
    );
  }, [selectedVersion, draftRules, draftFrom]);

  const saveDraft = async () => {
    if (!selectedVersion) return;
    setSaving(true);
    try {
      await adminApi.updateRulePackVersion(selectedVersion.id, {
        effectiveFrom: new Date(draftFrom).toISOString(),
        rules: draftRules,
      });
      notify('success', `Saved v${selectedVersion.version}`);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not save the version'));
    } finally {
      setSaving(false);
    }
  };

  const activate = async () => {
    if (!selectedVersion) return;
    if (!window.confirm(
      `Activate v${selectedVersion.version}? The current active version will be retired and closed at ${formatDate(selectedVersion.effectiveFrom)}.`,
    )) return;

    try {
      await adminApi.activateRulePackVersion(selectedVersion.id);
      notify('success', `v${selectedVersion.version} is now active`);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not activate the version'));
    }
  };

  const createPack = async () => {
    setSaving(true);
    try {
      const pack = await adminApi.createRulePack({
        key: newPack.key.trim().toUpperCase(),
        name: newPack.name.trim(),
        stateCode: newPack.stateCode.trim().toUpperCase(),
      });
      notify('success', `Created ${pack.name}`);
      setCreatingPack(false);
      setNewPack({ key: '', name: '', stateCode: '' });
      await load();
      setSelectedPackId(pack.id);
    } catch (err) {
      notify('error', errorMessage(err, 'Could not create the pack'));
    } finally {
      setSaving(false);
    }
  };

  const draftVersion = async () => {
    if (!selectedPack) return;
    setSaving(true);
    try {
      // New drafts start from the currently displayed rules, which is the usual
      // "amend the active pack" workflow.
      const version = await adminApi.createRulePackVersion(selectedPack.id, {
        effectiveFrom: new Date(newVersionFrom).toISOString(),
        rules: draftRules,
      });
      notify('success', `Drafted v${version.version}`);
      setDraftingVersion(false);
      await load();
      setSelectedVersionId(version.id);
    } catch (err) {
      notify('error', errorMessage(err, 'Could not draft a version'));
    } finally {
      setSaving(false);
    }
  };

  const runSimulation = async () => {
    if (!selectedVersion) return;
    setSimulating(true);
    setSimError('');
    setSimResult(null);
    try {
      const sample = JSON.parse(simInput || '{}');
      const result = await adminApi.simulateRulePackVersion(selectedVersion.id, sample);
      setSimResult(result);
    } catch (err) {
      if (err instanceof SyntaxError) setSimError(`That is not valid JSON: ${err.message}`);
      else setSimError(errorMessage(err, 'The simulation failed'));
    } finally {
      setSimulating(false);
    }
  };

  /** Seeds the simulator with every field the version's rules reference. */
  const openSimulator = () => {
    const sample: Record<string, unknown> = {};
    draftRules.forEach((rule) => {
      sample[rule.field] =
        rule.operator === 'required' ? '' : typeof rule.value === 'number' ? 0 : '';
    });
    setSimInput(JSON.stringify(sample, null, 2));
    setSimResult(null);
    setSimError('');
    setSimOpen(true);
  };

  const updateRule = (index: number, patch: Partial<PackRule>) =>
    setDraftRules((rules) => rules.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  if (loading) return <LoadingState label="Loading rule packs" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Compliance Suite</span>
          <h1 className="adm-page-title">
            <FileStack size={22} color="var(--green)" /> Rule Packs
          </h1>
          <p className="adm-page-sub">
            India rule packs with state profiles. Versions are effective-dated and immutable
            once active — amend by drafting a new version, then simulate before you activate.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setCreatingPack(true)}>
          New rule pack
        </Button>
      </div>

      <div className="adm-grid-side">
        <Panel
          title={selectedVersion ? `Rule editor · v${selectedVersion.version}` : 'Rule editor'}
          subtitle={
            selectedVersion
              ? isDraft
                ? 'This draft is editable. Activating it retires the current active version.'
                : 'Active and retired versions are read-only — draft a new version to amend.'
              : 'Select a pack to edit its rules'
          }
          actions={
            selectedVersion && (
              <>
                <Button variant="subtle" icon={<FlaskConical size={14} />} onClick={openSimulator}>
                  Simulate
                </Button>
                {isDraft && (
                  <>
                    <Button variant="subtle" loading={saving} disabled={!dirty} onClick={saveDraft}>
                      {dirty ? 'Save draft' : 'Saved'}
                    </Button>
                    <Button variant="primary" icon={<Rocket size={14} />} onClick={activate}>
                      Activate
                    </Button>
                  </>
                )}
              </>
            )
          }
        >
          {!selectedVersion ? (
            <EmptyState
              title="No version selected"
              hint="Pick a pack on the right, then choose one of its versions."
            />
          ) : (
            <>
              <div className="adm-form-row" style={{ marginBottom: 18 }}>
                <Field label="Effective from">
                  <Input
                    type="date"
                    value={draftFrom}
                    disabled={!isDraft}
                    onChange={(e) => setDraftFrom(e.target.value)}
                  />
                </Field>
                <Field label="Effective to">
                  <Input value={formatDate(selectedVersion.effectiveTo)} disabled />
                </Field>
              </div>

              {draftRules.length === 0 ? (
                <EmptyState title="This version has no rules yet" hint="Add one below." />
              ) : (
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Rule</th>
                        <th>Field</th>
                        <th>Test</th>
                        <th>Value</th>
                        <th>Severity</th>
                        {isDraft && <th />}
                      </tr>
                    </thead>
                    <tbody>
                      {draftRules.map((rule, index) => (
                        <tr key={index}>
                          <td style={{ width: 96 }}>
                            <Input
                              className="adm-input-mono"
                              value={rule.code}
                              disabled={!isDraft}
                              onChange={(e) => updateRule(index, { code: e.target.value })}
                            />
                          </td>
                          <td style={{ minWidth: 180 }}>
                            <Input
                              value={rule.label}
                              disabled={!isDraft}
                              onChange={(e) => updateRule(index, { label: e.target.value })}
                            />
                          </td>
                          <td style={{ width: 132 }}>
                            <Input
                              className="adm-input-mono"
                              value={rule.field}
                              disabled={!isDraft}
                              onChange={(e) => updateRule(index, { field: e.target.value })}
                            />
                          </td>
                          <td style={{ width: 96 }}>
                            <Select
                              value={rule.operator}
                              disabled={!isDraft}
                              onChange={(e) =>
                                updateRule(index, { operator: e.target.value as PackRule['operator'] })
                              }
                            >
                              {OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
                            </Select>
                          </td>
                          <td style={{ width: 104 }}>
                            <Input
                              className="adm-input-mono"
                              value={rule.operator === 'required' ? '' : String(rule.value ?? '')}
                              disabled={!isDraft || rule.operator === 'required'}
                              placeholder={rule.operator === 'required' ? 'n/a' : ''}
                              onChange={(e) => {
                                const raw = e.target.value;
                                const num = Number(raw);
                                updateRule(index, {
                                  value: raw !== '' && !Number.isNaN(num) ? num : raw,
                                });
                              }}
                            />
                          </td>
                          <td style={{ width: 104 }}>
                            <Select
                              value={rule.severity}
                              disabled={!isDraft}
                              onChange={(e) =>
                                updateRule(index, { severity: e.target.value as PackRule['severity'] })
                              }
                            >
                              <option value="BLOCK">BLOCK</option>
                              <option value="WARN">WARN</option>
                            </Select>
                          </td>
                          {isDraft && (
                            <td style={{ width: 34 }}>
                              <button
                                className="adm-icon-btn is-danger"
                                title="Remove rule"
                                onClick={() =>
                                  setDraftRules((rules) => rules.filter((_, i) => i !== index))
                                }
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {isDraft && (
                <Button
                  variant="subtle"
                  icon={<Plus size={14} />}
                  style={{ marginTop: 14 }}
                  onClick={() =>
                    setDraftRules((rules) => [
                      ...rules,
                      {
                        code: `BR-CMP-${(rules.length + 1) * 10}`,
                        label: 'New rule',
                        field: 'fieldName',
                        operator: 'required',
                        severity: 'BLOCK',
                      },
                    ])
                  }
                >
                  Add rule
                </Button>
              )}
            </>
          )}
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Panel title="Rule packs" padded={false}>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <tbody>
                  {packs.map((pack) => (
                    <tr
                      key={pack.id}
                      onClick={() => { setSelectedPackId(pack.id); setSelectedVersionId(null); }}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedPackId === pack.id ? 'var(--green-glow)' : undefined,
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 600 }}>{pack.name}</div>
                        <div className="adm-row-sub">
                          {pack.key} · {pack.versions.length} version
                          {pack.versions.length === 1 ? '' : 's'}
                        </div>
                      </td>
                      <td style={{ width: 60 }}>
                        <Badge tone="blue">{pack.stateCode}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            title="Versions"
            subtitle={selectedPack?.name}
            actions={
              selectedPack && (
                <Button
                  variant="subtle"
                  size="sm"
                  icon={<Plus size={13} />}
                  onClick={() => {
                    setNewVersionFrom(new Date().toISOString().slice(0, 10));
                    setDraftingVersion(true);
                  }}
                >
                  Draft
                </Button>
              )
            }
            padded={false}
          >
            {!selectedPack || selectedPack.versions.length === 0 ? (
              <EmptyState title="No versions" hint="Draft the first version of this pack." />
            ) : (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <tbody>
                    {selectedPack.versions.map((version) => (
                      <tr
                        key={version.id}
                        onClick={() => setSelectedVersionId(version.id)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor:
                            selectedVersion?.id === version.id ? 'var(--green-glow)' : undefined,
                        }}
                      >
                        <td style={{ width: 44 }}>
                          <span className="adm-cell-mono" style={{ fontWeight: 700 }}>
                            v{version.version}
                          </span>
                        </td>
                        <td>
                          <Badge tone={STATUS_TONE[version.status]}>{version.status}</Badge>
                          <div className="adm-row-sub" style={{ marginTop: 4 }}>
                            {formatDate(version.effectiveFrom)} → {formatDate(version.effectiveTo)}
                          </div>
                        </td>
                        <td style={{ width: 48 }} className="adm-cell-mono">
                          {(version.rules ?? []).length} rules
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* Simulator */}
      <Modal
        open={simOpen}
        wide
        title="Simulate rule pack"
        subtitle={
          selectedVersion
            ? `${selectedPack?.name} · v${selectedVersion.version} — nothing is persisted`
            : undefined
        }
        onClose={() => setSimOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSimOpen(false)}>Close</Button>
            <Button
              variant="primary"
              icon={<FlaskConical size={14} />}
              loading={simulating}
              onClick={runSimulation}
            >
              Run simulation
            </Button>
          </>
        }
      >
        <div className="adm-grid-2">
          <Field label="Sample consignment (JSON)" hint="Pre-filled with every field the rules reference.">
            <textarea
              className="adm-input adm-input-mono"
              rows={12}
              value={simInput}
              onChange={(e) => setSimInput(e.target.value)}
              spellCheck={false}
            />
          </Field>

          <div>
            <span className="adm-field-label mono-label">Result</span>
            {simError && (
              <div className="adm-sod is-conflict" style={{ marginBottom: 12 }}>
                <CircleAlert size={15} />
                <span>{simError}</span>
              </div>
            )}
            {!simResult && !simError && (
              <EmptyState title="Not run yet" hint="Adjust the sample and run the simulation." />
            )}
            {simResult && (
              <>
                <div
                  className={`adm-sod ${simResult.outcome === 'PASS' ? 'is-clean' : 'is-conflict'}`}
                  style={{ marginBottom: 12, alignItems: 'center' }}
                >
                  <Badge tone={OUTCOME_TONE[simResult.outcome]}>{simResult.outcome}</Badge>
                  <span>
                    {simResult.passedCount} of {simResult.totalCount} rules passed
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {simResult.results.map((r) => (
                    <div
                      key={r.code}
                      className={`adm-cap-row ${r.passed ? 'is-on' : 'is-conflict'}`}
                    >
                      {r.passed ? (
                        <Check size={14} color="var(--green)" />
                      ) : (
                        <X size={14} color="var(--red)" />
                      )}
                      <div className="adm-cap-label">
                        {r.label}
                        <span className="adm-cap-key">
                          {r.code} · {r.field} {r.operator}{' '}
                          {r.expected !== null ? String(r.expected) : ''} · got{' '}
                          {r.actual === null || r.actual === '' ? '(empty)' : String(r.actual)}
                        </span>
                      </div>
                      <Badge tone={r.severity === 'BLOCK' ? 'red' : 'amber'}>{r.severity}</Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* New pack */}
      <Modal
        open={creatingPack}
        title="New rule pack"
        onClose={() => setCreatingPack(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreatingPack(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={saving}
              disabled={!newPack.key.trim() || !newPack.name.trim() || !newPack.stateCode.trim()}
              onClick={createPack}
            >
              Create pack
            </Button>
          </>
        }
      >
        <Field label="Key" hint="Unique identifier, e.g. IN-KA.">
          <Input
            autoFocus
            className="adm-input-mono"
            value={newPack.key}
            onChange={(e) => setNewPack({ ...newPack, key: e.target.value })}
            placeholder="IN-KA"
          />
        </Field>
        <div className="adm-form-row">
          <Field label="Name">
            <Input
              value={newPack.name}
              onChange={(e) => setNewPack({ ...newPack, name: e.target.value })}
              placeholder="Karnataka State Profile"
            />
          </Field>
          <Field label="State code">
            <Input
              className="adm-input-mono"
              value={newPack.stateCode}
              onChange={(e) => setNewPack({ ...newPack, stateCode: e.target.value })}
              placeholder="KA"
            />
          </Field>
        </div>
      </Modal>

      {/* Draft version */}
      <Modal
        open={draftingVersion}
        title="Draft a new version"
        subtitle={
          selectedPack
            ? `Copies the ${draftRules.length} rule(s) currently shown into a new editable draft of ${selectedPack.name}.`
            : undefined
        }
        onClose={() => setDraftingVersion(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDraftingVersion(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} disabled={!newVersionFrom} onClick={draftVersion}>
              Create draft
            </Button>
          </>
        }
      >
        <Field label="Effective from" hint="Activating this draft retires the active version at this date.">
          <Input
            type="date"
            value={newVersionFrom}
            onChange={(e) => setNewVersionFrom(e.target.value)}
          />
        </Field>
      </Modal>
    </>
  );
};
