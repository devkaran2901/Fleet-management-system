import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Bell, Clock, GitBranch, Plus, Power, SlidersHorizontal, Trash2, UserCheck, Users,
} from 'lucide-react';
import { adminApi, errorMessage } from '../../services/adminApi';
import type {
  AdminRole, ApprovalFlow, ApprovalStep, ApprovalStepType, FlowSimulation,
} from '../../services/adminApi';
import {
  Badge, Button, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Panel,
  Select, useToast,
} from '../../components/admin/ui';

const STEP_TYPES: ApprovalStepType[] = ['APPROVAL', 'THRESHOLD', 'PARALLEL', 'NOTIFY'];

const STEP_ICON: Record<ApprovalStepType, React.ReactNode> = {
  APPROVAL: <UserCheck size={13} />,
  THRESHOLD: <SlidersHorizontal size={13} />,
  PARALLEL: <Users size={13} />,
  NOTIFY: <Bell size={13} />,
};

const rupees = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
    .format(value);

export const ApprovalFlows: React.FC = () => {
  const { notify } = useToast();
  const [flows, setFlows] = useState<ApprovalFlow[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ApprovalStep[]>([]);
  const [saving, setSaving] = useState(false);

  const [creating, setCreating] = useState(false);
  const [newFlow, setNewFlow] = useState({ name: '', entity: 'Expense' });

  const [simAmount, setSimAmount] = useState('50000');
  const [sim, setSim] = useState<FlowSimulation | null>(null);
  const [simulating, setSimulating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [flowData, roleData] = await Promise.all([adminApi.approvalFlows(), adminApi.roles()]);
      setFlows(flowData);
      setRoles(roleData);
      setSelectedId((current) => current ?? flowData[0]?.id ?? null);
    } catch (err) {
      setError(errorMessage(err, 'Could not load the approval flows'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selected = flows.find((f) => f.id === selectedId) ?? null;

  useEffect(() => {
    setDraft(selected ? selected.steps.map((s) => ({ ...s })) : []);
    setSim(null);
  }, [selectedId, flows]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = useMemo(() => {
    if (!selected) return false;
    const strip = (steps: ApprovalStep[]) =>
      steps.map((s) => ({
        order: s.order,
        type: s.type,
        roleName: s.roleName,
        thresholdAmount: s.thresholdAmount === null ? null : Number(s.thresholdAmount),
        slaHours: Number(s.slaHours),
      }));
    return JSON.stringify(strip(selected.steps)) !== JSON.stringify(strip(draft));
  }, [selected, draft]);

  const totalSla = draft.reduce((sum, s) => sum + Number(s.slaHours || 0), 0);

  const updateStep = (index: number, patch: Partial<ApprovalStep>) =>
    setDraft((steps) => steps.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const addStep = () =>
    setDraft((steps) => [
      ...steps,
      {
        order: steps.length + 1,
        type: 'APPROVAL',
        roleName: roles[0]?.name ?? 'ADMIN',
        thresholdAmount: null,
        slaHours: 24,
      },
    ]);

  /** Removes a step and closes the gap so `order` stays 1..n and contiguous. */
  const removeStep = (index: number) =>
    setDraft((steps) =>
      steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 })),
    );

  const saveSteps = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminApi.setApprovalFlowSteps(
        selected.id,
        draft.map((s, i) => ({
          order: i + 1,
          type: s.type,
          roleName: s.roleName,
          thresholdAmount:
            s.type === 'THRESHOLD' && s.thresholdAmount !== null
              ? Number(s.thresholdAmount)
              : null,
          slaHours: Number(s.slaHours),
        })),
      );
      notify('success', `Saved the chain for ${selected.name}`);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not save the chain'));
    } finally {
      setSaving(false);
    }
  };

  const createFlow = async () => {
    setSaving(true);
    try {
      const flow = await adminApi.createApprovalFlow({
        name: newFlow.name.trim(),
        entity: newFlow.entity.trim(),
        steps: [],
      });
      notify('success', `Created ${flow.name}`);
      setCreating(false);
      setNewFlow({ name: '', entity: 'Expense' });
      await load();
      setSelectedId(flow.id);
    } catch (err) {
      notify('error', errorMessage(err, 'Could not create the flow'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (flow: ApprovalFlow) => {
    try {
      await adminApi.updateApprovalFlow(flow.id, { isActive: !flow.isActive });
      notify('success', `${flow.name} is now ${flow.isActive ? 'inactive' : 'active'}`);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not change the flow status'));
    }
  };

  const removeFlow = async (flow: ApprovalFlow) => {
    if (!window.confirm(`Delete "${flow.name}" and its ${flow.steps.length} step(s)?`)) return;
    try {
      await adminApi.deleteApprovalFlow(flow.id);
      notify('success', `Deleted ${flow.name}`);
      if (selectedId === flow.id) setSelectedId(null);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not delete the flow'));
    }
  };

  const runSim = async () => {
    if (!selected) return;
    if (dirty) {
      notify('info', 'Save the chain first — the simulation runs against the saved steps.');
      return;
    }
    setSimulating(true);
    try {
      setSim(await adminApi.simulateApprovalFlow(selected.id, Number(simAmount) || 0));
    } catch (err) {
      notify('error', errorMessage(err, 'The simulation failed'));
    } finally {
      setSimulating(false);
    }
  };

  if (loading) return <LoadingState label="Loading approval flows" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Approvals Engine</span>
          <h1 className="adm-page-title">
            <GitBranch size={22} color="var(--green)" /> Approval Flows
          </h1>
          <p className="adm-page-sub">
            Visual chain builder with threshold nodes and SLA timers. Threshold steps only
            engage once a request reaches their amount — simulate to see which fire.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setCreating(true)}>
          New flow
        </Button>
      </div>

      <div className="adm-grid-side">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Panel
            title={selected ? `Chain · ${selected.name}` : 'Chain designer'}
            subtitle={
              selected
                ? `${draft.length} step(s) · ${totalSla}h total SLA if every step engages`
                : 'Select a flow to design its chain'
            }
            actions={
              selected && (
                <Button variant="primary" loading={saving} disabled={!dirty} onClick={saveSteps}>
                  {dirty ? 'Save chain' : 'Saved'}
                </Button>
              )
            }
          >
            {!selected ? (
              <EmptyState title="No flow selected" hint="Choose a flow from the list." />
            ) : draft.length === 0 ? (
              <EmptyState
                title="This chain has no steps"
                hint="Add the first approval step below."
                action={<Button variant="subtle" icon={<Plus size={14} />} onClick={addStep}>Add step</Button>}
              />
            ) : (
              <>
                <div className="adm-flow-canvas">
                  <div className="adm-flow-track">
                    <div className="adm-flow-node">
                      <div className="adm-flow-node-head">
                        <span className="adm-flow-role">Request</span>
                        <Badge tone="blue">START</Badge>
                      </div>
                      <span className="adm-flow-meta">{selected.entity} submitted</span>
                    </div>

                    {draft.map((step, index) => {
                      const simStep = sim?.path.find((p) => p.order === step.order);
                      const engaged = simStep?.engaged;
                      return (
                        <React.Fragment key={index}>
                          <div className={`adm-flow-arrow ${engaged ? 'is-live' : ''}`}>
                            <ArrowRight size={16} />
                          </div>
                          <div
                            className={[
                              'adm-flow-node',
                              step.type === 'THRESHOLD' ? 'is-threshold' : '',
                              sim ? (engaged ? 'is-engaged' : 'is-skipped') : '',
                            ].join(' ')}
                          >
                            <div className="adm-flow-node-head">
                              <span className="adm-flow-role">{step.roleName}</span>
                              <Badge tone={step.type === 'THRESHOLD' ? 'amber' : 'grey'}>
                                {STEP_ICON[step.type]} {step.type}
                              </Badge>
                            </div>
                            <span className="adm-flow-meta">
                              <Clock size={9} style={{ verticalAlign: -1 }} /> SLA {step.slaHours}h
                            </span>
                            {step.type === 'THRESHOLD' && step.thresholdAmount !== null && (
                              <span className="adm-flow-meta">
                                Engages ≥ {rupees(Number(step.thresholdAmount))}
                              </span>
                            )}
                            {simStep && (
                              <span
                                className="adm-flow-meta"
                                style={{ color: engaged ? 'var(--green)' : 'var(--text-3)' }}
                              >
                                {engaged ? `Cumulative ${simStep.cumulativeSlaHours}h` : 'Skipped'}
                              </span>
                            )}
                          </div>
                        </React.Fragment>
                      );
                    })}

                    <div className={`adm-flow-arrow ${sim ? 'is-live' : ''}`}>
                      <ArrowRight size={16} />
                    </div>
                    <div className="adm-flow-node">
                      <div className="adm-flow-node-head">
                        <span className="adm-flow-role">Approved</span>
                        <Badge tone="green">END</Badge>
                      </div>
                      <span className="adm-flow-meta">
                        {sim ? `${sim.totalSlaHours}h worst case` : 'Run a simulation'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 20 }}>
                  <span className="adm-field-label mono-label">Steps</span>
                  {draft.map((step, index) => (
                    <div className="adm-flow-step-editor" key={index}>
                      <span className="adm-step-index">{index + 1}</span>
                      <Select
                        value={step.type}
                        onChange={(e) => {
                          const type = e.target.value as ApprovalStepType;
                          updateStep(index, {
                            type,
                            thresholdAmount:
                              type === 'THRESHOLD' ? (step.thresholdAmount ?? 25000) : null,
                          });
                        }}
                      >
                        {STEP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </Select>
                      <Select
                        value={step.roleName}
                        onChange={(e) => updateStep(index, { roleName: e.target.value })}
                      >
                        {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
                      </Select>
                      <Input
                        type="number"
                        className="adm-input-mono"
                        placeholder={step.type === 'THRESHOLD' ? 'Threshold ₹' : 'n/a'}
                        disabled={step.type !== 'THRESHOLD'}
                        value={step.thresholdAmount === null ? '' : String(step.thresholdAmount)}
                        onChange={(e) =>
                          updateStep(index, {
                            thresholdAmount: e.target.value === '' ? null : Number(e.target.value),
                          })
                        }
                      />
                      <Input
                        type="number"
                        className="adm-input-mono"
                        placeholder="SLA hours"
                        min={1}
                        value={String(step.slaHours)}
                        onChange={(e) => updateStep(index, { slaHours: Number(e.target.value) })}
                      />
                      <button
                        className="adm-icon-btn is-danger"
                        title="Remove step"
                        onClick={() => removeStep(index)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <Button variant="subtle" icon={<Plus size={14} />} onClick={addStep} style={{ marginTop: 8 }}>
                    Add step
                  </Button>
                </div>
              </>
            )}
          </Panel>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Panel title="Flows" padded={false}>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <tbody>
                  {flows.map((flow) => (
                    <tr
                      key={flow.id}
                      onClick={() => setSelectedId(flow.id)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedId === flow.id ? 'var(--green-glow)' : undefined,
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 600 }}>{flow.name}</div>
                        <div className="adm-row-sub">
                          {flow.entity} · {flow.steps.length} step{flow.steps.length === 1 ? '' : 's'}
                        </div>
                      </td>
                      <td style={{ width: 70 }}>
                        <Badge tone={flow.isActive ? 'green' : 'grey'}>
                          {flow.isActive ? 'Active' : 'Off'}
                        </Badge>
                      </td>
                      <td style={{ width: 60 }}>
                        <div className="adm-cell-actions">
                          <button
                            className="adm-icon-btn"
                            title={flow.isActive ? 'Deactivate' : 'Activate'}
                            onClick={(e) => { e.stopPropagation(); void toggleActive(flow); }}
                          >
                            <Power size={13} />
                          </button>
                          <button
                            className="adm-icon-btn is-danger"
                            title="Delete flow"
                            onClick={(e) => { e.stopPropagation(); void removeFlow(flow); }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Simulate" subtitle="Dry-run an amount through the saved chain.">
            <Field label="Request amount (₹)">
              <Input
                type="number"
                className="adm-input-mono"
                value={simAmount}
                onChange={(e) => setSimAmount(e.target.value)}
              />
            </Field>
            <Button
              variant="primary"
              loading={simulating}
              disabled={!selected || draft.length === 0}
              onClick={runSim}
              style={{ width: '100%' }}
            >
              Run simulation
            </Button>

            {sim && (
              <div style={{ marginTop: 16 }}>
                <div className="adm-sod is-clean" style={{ marginBottom: 12 }}>
                  <Clock size={15} />
                  <div>
                    <strong>{sim.engagedSteps} of {sim.path.length} steps engage</strong>
                    <div style={{ marginTop: 3 }}>
                      {rupees(sim.amount)} clears in {sim.totalSlaHours}h worst case.
                    </div>
                  </div>
                </div>
                <ul className="adm-lineage">
                  {sim.path.map((step) => (
                    <li
                      key={step.order}
                      className={`adm-lineage-item ${step.engaged ? 'is-origin' : ''}`}
                      style={{ opacity: step.engaged ? 1 : 0.5, paddingBottom: 14 }}
                    >
                      <span className="adm-lineage-node" />
                      <div style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>
                        {step.roleName}
                      </div>
                      <div className="adm-row-sub">
                        {step.type}
                        {step.threshold !== null ? ` · ≥ ${rupees(step.threshold)}` : ''} ·{' '}
                        {step.engaged ? `engages, +${step.slaHours}h` : 'skipped'}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>
        </div>
      </div>

      <Modal
        open={creating}
        title="New approval flow"
        onClose={() => setCreating(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} disabled={!newFlow.name.trim()} onClick={createFlow}>
              Create flow
            </Button>
          </>
        }
      >
        <Field label="Name">
          <Input
            autoFocus
            value={newFlow.name}
            onChange={(e) => setNewFlow({ ...newFlow, name: e.target.value })}
            placeholder="Fuel card top-up approval"
          />
        </Field>
        <Field label="Entity" hint="The record type this chain governs.">
          <Select
            value={newFlow.entity}
            onChange={(e) => setNewFlow({ ...newFlow, entity: e.target.value })}
          >
            {['Expense', 'Payment', 'Route', 'Trip', 'Vendor'].map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </Select>
        </Field>
      </Modal>
    </>
  );
};
