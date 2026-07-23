import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, TrendingUp, Trash2, Wallet } from 'lucide-react';
import { adminApi, errorMessage } from '../../services/adminApi';
import type { AdminUser, CostCenter, OrgNode } from '../../services/adminApi';
import {
  Badge, Button, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Panel,
  Select, useToast,
} from '../../components/admin/ui';
import { Stat, flatten } from './orgShared';

const rupees = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
    .format(value);

interface CentreForm {
  original?: string;
  code: string;
  name: string;
  department: string;
  managerId: string;
  orgNodeId: string;
  budgetAllocated: string;
  budgetUsed: string;
}

const blank: CentreForm = {
  code: '', name: '', department: '', managerId: '', orgNodeId: '',
  budgetAllocated: '', budgetUsed: '0',
};

export const CostCenters: React.FC = () => {
  const { notify } = useToast();
  const [centers, setCenters] = useState<CostCenter[]>([]);
  const [tree, setTree] = useState<OrgNode[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState<CentreForm | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [centreData, treeData, userData] = await Promise.all([
        adminApi.costCenters(),
        adminApi.orgTree(),
        adminApi.users(),
      ]);
      setCenters(centreData);
      setTree(treeData);
      setUsers(userData);
    } catch (err) {
      setError(errorMessage(err, 'Could not load the cost centres'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const flat = useMemo(() => flatten(tree), [tree]);

  const totals = useMemo(
    () => ({
      allocated: centers.reduce((sum, c) => sum + c.budgetAllocated, 0),
      used: centers.reduce((sum, c) => sum + c.budgetUsed, 0),
      overspent: centers.filter((c) => c.budgetUsed > c.budgetAllocated).length,
    }),
    [centers],
  );

  const submit = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        department: form.department.trim(),
        managerId: form.managerId || null,
        orgNodeId: form.orgNodeId || null,
        budgetAllocated: Number(form.budgetAllocated || 0),
        budgetUsed: Number(form.budgetUsed || 0),
      };

      if (form.original) {
        await adminApi.updateCostCenter(form.original, body);
        notify('success', `Updated ${form.name}`);
      } else {
        await adminApi.createCostCenter({ code: form.code.trim().toUpperCase(), ...body });
        notify('success', `Created ${form.name}`);
      }
      setForm(null);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not save the cost centre'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (centre: CostCenter) => {
    if (!window.confirm(`Delete cost centre "${centre.name}" (${centre.code})?`)) return;
    try {
      await adminApi.deleteCostCenter(centre.code);
      notify('success', `Deleted ${centre.name}`);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not delete the cost centre'));
    }
  };

  if (loading) return <LoadingState label="Loading cost centres" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const utilisationTone = (pct: number) => (pct > 100 ? 'red' : pct > 90 ? 'amber' : 'green');
  const barColor = (pct: number) =>
    pct > 100 ? 'var(--red)' : pct > 90 ? 'var(--amber)' : 'var(--green)';

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Identity, RBAC &amp; Org</span>
          <h1 className="adm-page-title">
            <Wallet size={22} color="var(--green)" /> Cost Centers
          </h1>
          <p className="adm-page-sub">
            Budget owners attached to the org tree. Allocation and spend are tracked here;
            cost allocation to vehicles and trips arrives with Master Data.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setForm({ ...blank })}>
          New cost centre
        </Button>
      </div>

      <div className="adm-stats">
        <Stat icon={<Wallet size={15} color="var(--green)" />} value={centers.length} label="Cost centres" />
        <Stat icon={<TrendingUp size={15} color="var(--green)" />} value={rupees(totals.allocated)} label="Total allocated" />
        <Stat icon={<TrendingUp size={15} color="var(--amber)" />} value={rupees(totals.used)} label="Total used" />
        <Stat
          icon={<TrendingUp size={15} color={totals.overspent > 0 ? 'var(--red)' : 'var(--text-3)'} />}
          value={totals.overspent}
          label="Over budget"
        />
      </div>

      <Panel title="Cost centres" subtitle="Budget utilisation across the org" padded={false}>
        {centers.length === 0 ? (
          <EmptyState title="No cost centres yet" hint="Create one to start tracking budget." />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Cost centre</th>
                  <th>Department</th>
                  <th>Org node</th>
                  <th>Allocated</th>
                  <th>Used</th>
                  <th>Remaining</th>
                  <th style={{ width: 150 }}>Utilisation</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {centers.map((centre) => (
                  <tr key={centre.code}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{centre.name}</div>
                      <div className="adm-row-sub adm-cell-mono">{centre.code}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{centre.department}</td>
                    <td>
                      {centre.orgNode ? (
                        <Badge tone="blue">{centre.orgNode.code}</Badge>
                      ) : (
                        <span className="adm-row-sub">Unassigned</span>
                      )}
                    </td>
                    <td className="adm-cell-mono">{rupees(centre.budgetAllocated)}</td>
                    <td className="adm-cell-mono">{rupees(centre.budgetUsed)}</td>
                    <td
                      className="adm-cell-mono"
                      style={{ color: centre.budgetRemaining < 0 ? 'var(--red)' : undefined }}
                    >
                      {rupees(centre.budgetRemaining)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="adm-budget-track">
                          <div
                            className="adm-budget-fill"
                            style={{
                              width: `${Math.min(centre.utilisation, 100)}%`,
                              backgroundColor: barColor(centre.utilisation),
                            }}
                          />
                        </div>
                        <Badge tone={utilisationTone(centre.utilisation)}>
                          {centre.utilisation}%
                        </Badge>
                      </div>
                    </td>
                    <td style={{ width: 66 }}>
                      <div className="adm-cell-actions">
                        <button
                          className="adm-icon-btn"
                          title="Edit"
                          onClick={() =>
                            setForm({
                              original: centre.code,
                              code: centre.code,
                              name: centre.name,
                              department: centre.department,
                              managerId: centre.managerId ?? '',
                              orgNodeId: centre.orgNodeId ?? '',
                              budgetAllocated: String(centre.budgetAllocated),
                              budgetUsed: String(centre.budgetUsed),
                            })
                          }
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="adm-icon-btn is-danger"
                          title="Delete"
                          onClick={() => void remove(centre)}
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
        )}
      </Panel>

      <Modal
        open={form !== null}
        title={form?.original ? 'Edit cost centre' : 'New cost centre'}
        onClose={() => setForm(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setForm(null)}>Cancel</Button>
            <Button
              variant="primary"
              loading={saving}
              disabled={!form?.name.trim() || !form?.code.trim() || !form?.department.trim()}
              onClick={submit}
            >
              {form?.original ? 'Save changes' : 'Create'}
            </Button>
          </>
        }
      >
        {form && (
          <>
            <div className="adm-form-row">
              <Field label="Code" hint={form.original ? 'The code cannot be changed.' : 'Unique, e.g. CC-OPS.'}>
                <Input
                  autoFocus={!form.original}
                  className="adm-input-mono"
                  value={form.code}
                  disabled={Boolean(form.original)}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="CC-OPS"
                />
              </Field>
              <Field label="Department">
                <Input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="Operations"
                />
              </Field>
            </div>

            <Field label="Name">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="North Region Running"
              />
            </Field>

            <Field label="Org node" hint="Which part of the hierarchy owns this budget.">
              <Select
                value={form.orgNodeId}
                onChange={(e) => setForm({ ...form, orgNodeId: e.target.value })}
              >
                <option value="">— Unassigned —</option>
                {flat.map(({ node, depth }) => (
                  <option key={node.id} value={node.id}>
                    {' '.repeat(depth * 3)}
                    {node.name} ({node.code})
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Manager">
              <Select
                value={form.managerId}
                onChange={(e) => setForm({ ...form, managerId: e.target.value })}
              >
                <option value="">— No manager —</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </Select>
            </Field>

            <div className="adm-form-row">
              <Field label="Budget allocated (₹)">
                <Input
                  type="number"
                  className="adm-input-mono"
                  value={form.budgetAllocated}
                  onChange={(e) => setForm({ ...form, budgetAllocated: e.target.value })}
                  placeholder="1000000"
                />
              </Field>
              <Field label="Budget used (₹)">
                <Input
                  type="number"
                  className="adm-input-mono"
                  value={form.budgetUsed}
                  onChange={(e) => setForm({ ...form, budgetUsed: e.target.value })}
                  placeholder="0"
                />
              </Field>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};
