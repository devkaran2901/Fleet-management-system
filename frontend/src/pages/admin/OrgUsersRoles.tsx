import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2, ChevronDown, ChevronRight, Network, Pencil, Plus, ShieldAlert,
  ShieldCheck, Trash2, Users,
} from 'lucide-react';
import {
  adminApi, errorConflicts, errorMessage,
} from '../../services/adminApi';
import type {
  AdminRole, AdminUser, Capability, CapabilityScope, OrgNode, OrgNodeType,
  SegregationConflict, SegregationRule,
} from '../../services/adminApi';
import {
  Badge, Button, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Panel,
  Select, Toggle, useToast,
} from '../../components/admin/ui';

const NODE_TYPES: OrgNodeType[] = ['ORG', 'REGION', 'HUB', 'DEPOT', 'TEAM'];
const SCOPES: CapabilityScope[] = ['GLOBAL', 'REGION', 'HUB', 'SELF'];

const TYPE_TONE: Record<OrgNodeType, 'green' | 'blue' | 'amber' | 'grey'> = {
  ORG: 'green',
  REGION: 'blue',
  HUB: 'amber',
  DEPOT: 'grey',
  TEAM: 'grey',
};

const countNodes = (nodes: OrgNode[]): number =>
  nodes.reduce((sum, node) => sum + 1 + countNodes(node.children), 0);

// --- Org tree ---------------------------------------------------------------

const TreeBranch: React.FC<{
  nodes: OrgNode[];
  selectedId: string | null;
  onSelect: (node: OrgNode) => void;
  onAddChild: (node: OrgNode) => void;
  onEdit: (node: OrgNode) => void;
  onDelete: (node: OrgNode) => void;
}> = ({ nodes, selectedId, onSelect, onAddChild, onEdit, onDelete }) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <ul className="adm-tree">
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isCollapsed = collapsed[node.id];

        return (
          <li key={node.id}>
            <div
              className={`adm-tree-row ${selectedId === node.id ? 'is-selected' : ''}`}
              onClick={() => onSelect(node)}
            >
              {hasChildren ? (
                <button
                  className="adm-tree-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCollapsed((c) => ({ ...c, [node.id]: !c[node.id] }));
                  }}
                  aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                >
                  {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </button>
              ) : (
                <span style={{ width: 14 }} />
              )}

              <Building2 size={14} color="var(--text-3)" />
              <div>
                <span className="adm-tree-name">{node.name}</span>
                <span className="adm-tree-code">{node.code}</span>
              </div>
              <Badge tone={TYPE_TONE[node.type]}>{node.type}</Badge>

              <div className="adm-tree-actions">
                <button
                  className="adm-icon-btn"
                  title="Add child node"
                  onClick={(e) => { e.stopPropagation(); onAddChild(node); }}
                >
                  <Plus size={13} />
                </button>
                <button
                  className="adm-icon-btn"
                  title="Edit node"
                  onClick={(e) => { e.stopPropagation(); onEdit(node); }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  className="adm-icon-btn is-danger"
                  title="Delete node"
                  onClick={(e) => { e.stopPropagation(); onDelete(node); }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {hasChildren && !isCollapsed && (
              <TreeBranch
                nodes={node.children}
                selectedId={selectedId}
                onSelect={onSelect}
                onAddChild={onAddChild}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};

// --- Page -------------------------------------------------------------------

type Tab = 'org' | 'roles' | 'users';

export const OrgUsersRoles: React.FC = () => {
  const { notify } = useToast();
  const [tab, setTab] = useState<Tab>('org');

  const [tree, setTree] = useState<OrgNode[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [sodRules, setSodRules] = useState<SegregationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [treeData, roleData, userData, capData, sodData] = await Promise.all([
        adminApi.orgTree(),
        adminApi.roles(),
        adminApi.users(),
        adminApi.capabilities(),
        adminApi.segregationRules(),
      ]);
      setTree(treeData);
      setRoles(roleData);
      setUsers(userData);
      setCapabilities(capData);
      setSodRules(sodData);
    } catch (err) {
      setError(errorMessage(err, 'Could not load the org, role and user data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingState label="Loading identity data" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">P-01 · Identity, RBAC &amp; Org</span>
          <h1 className="adm-page-title">
            <Network size={22} color="var(--green)" /> Org, Users &amp; Roles
          </h1>
          <p className="adm-page-sub">
            Edit the org hierarchy, build roles as a capability × scope matrix with the
            segregation validator inline, and stack roles onto users.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['org', 'roles', 'users'] as Tab[]).map((t) => (
            <Button
              key={t}
              variant={tab === t ? 'primary' : 'subtle'}
              onClick={() => setTab(t)}
            >
              {t === 'org' ? 'Org tree' : t === 'roles' ? 'Role builder' : 'Users'}
            </Button>
          ))}
        </div>
      </div>

      <div className="adm-stats">
        <Stat icon={<Building2 size={15} color="var(--green)" />} value={countNodes(tree)} label="Org nodes" />
        <Stat icon={<ShieldCheck size={15} color="var(--green)" />} value={roles.length} label="Roles" />
        <Stat icon={<Users size={15} color="var(--green)" />} value={users.length} label="Users" />
        <Stat icon={<ShieldAlert size={15} color="var(--amber)" />} value={sodRules.length} label="Segregation rules" />
      </div>

      {tab === 'org' && (
        <OrgTab
          tree={tree}
          selectedNode={selectedNode}
          onSelect={setSelectedNode}
          onChanged={load}
          notify={notify}
        />
      )}
      {tab === 'roles' && (
        <RolesTab roles={roles} capabilities={capabilities} sodRules={sodRules} onChanged={load} notify={notify} />
      )}
      {tab === 'users' && <UsersTab users={users} roles={roles} onChanged={load} notify={notify} />}
    </>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; value: number | string; label: string }> = ({
  icon, value, label,
}) => (
  <div className="adm-stat">
    <span className="adm-stat-icon">{icon}</span>
    <span className="adm-stat-value">{value}</span>
    <span className="adm-stat-label">{label}</span>
  </div>
);

// --- Org tab ----------------------------------------------------------------

interface NodeForm {
  id?: string;
  name: string;
  code: string;
  type: OrgNodeType;
  parentId: string | null;
}

const flatten = (nodes: OrgNode[], depth = 0): { node: OrgNode; depth: number }[] =>
  nodes.flatMap((node) => [{ node, depth }, ...flatten(node.children, depth + 1)]);

const OrgTab: React.FC<{
  tree: OrgNode[];
  selectedNode: OrgNode | null;
  onSelect: (n: OrgNode | null) => void;
  onChanged: () => Promise<void>;
  notify: (tone: 'success' | 'error' | 'info', msg: string) => void;
}> = ({ tree, selectedNode, onSelect, onChanged, notify }) => {
  const [form, setForm] = useState<NodeForm | null>(null);
  const [saving, setSaving] = useState(false);
  const flat = useMemo(() => flatten(tree), [tree]);

  const submit = async () => {
    if (!form) return;
    setSaving(true);
    try {
      if (form.id) {
        await adminApi.updateOrgNode(form.id, {
          name: form.name, code: form.code, type: form.type, parentId: form.parentId,
        });
        notify('success', `Updated ${form.name}`);
      } else {
        await adminApi.createOrgNode({
          name: form.name, code: form.code, type: form.type, parentId: form.parentId,
        });
        notify('success', `Created ${form.name}`);
      }
      setForm(null);
      await onChanged();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not save the node'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (node: OrgNode) => {
    const childCount = countNodes(node.children);
    const warning = childCount > 0
      ? `\n\nThis also deletes ${childCount} node(s) beneath it.`
      : '';
    if (!window.confirm(`Delete "${node.name}"?${warning}`)) return;
    try {
      await adminApi.deleteOrgNode(node.id);
      notify('success', `Deleted ${node.name}`);
      if (selectedNode?.id === node.id) onSelect(null);
      await onChanged();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not delete the node'));
    }
  };

  return (
    <div className="adm-grid-side">
      <Panel
        title="Org tree editor"
        subtitle="Click a node to inspect it; use the row actions to nest, rename or remove."
        actions={
          <Button
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => setForm({ name: '', code: '', type: 'REGION', parentId: null })}
          >
            New node
          </Button>
        }
      >
        {tree.length === 0 ? (
          <EmptyState title="No org nodes yet" hint="Create a root node to start the hierarchy." />
        ) : (
          <TreeBranch
            nodes={tree}
            selectedId={selectedNode?.id ?? null}
            onSelect={onSelect}
            onAddChild={(node) =>
              setForm({ name: '', code: '', type: 'HUB', parentId: node.id })
            }
            onEdit={(node) =>
              setForm({
                id: node.id, name: node.name, code: node.code,
                type: node.type, parentId: node.parentId,
              })
            }
            onDelete={remove}
          />
        )}
      </Panel>

      <Panel title="Node detail">
        {selectedNode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Detail label="Name" value={selectedNode.name} />
            <Detail label="Code" value={selectedNode.code} mono />
            <Detail label="Type" value={<Badge tone={TYPE_TONE[selectedNode.type]}>{selectedNode.type}</Badge>} />
            <Detail label="Direct children" value={String(selectedNode.children.length)} mono />
            <Detail label="Nodes beneath" value={String(countNodes(selectedNode.children))} mono />
            <Button
              variant="subtle"
              icon={<Pencil size={13} />}
              onClick={() =>
                setForm({
                  id: selectedNode.id, name: selectedNode.name, code: selectedNode.code,
                  type: selectedNode.type, parentId: selectedNode.parentId,
                })
              }
            >
              Edit this node
            </Button>
          </div>
        ) : (
          <EmptyState title="No node selected" hint="Pick a node in the tree to see its detail." />
        )}
      </Panel>

      <Modal
        open={form !== null}
        title={form?.id ? 'Edit org node' : 'New org node'}
        subtitle="Codes are unique across the whole hierarchy."
        onClose={() => setForm(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setForm(null)}>Cancel</Button>
            <Button
              variant="primary"
              loading={saving}
              disabled={!form?.name.trim() || !form?.code.trim()}
              onClick={submit}
            >
              {form?.id ? 'Save changes' : 'Create node'}
            </Button>
          </>
        }
      >
        {form && (
          <>
            <Field label="Name">
              <Input
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jaipur Hub"
              />
            </Field>
            <div className="adm-form-row">
              <Field label="Code">
                <Input
                  className="adm-input-mono"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="HUB-JAI"
                />
              </Field>
              <Field label="Type">
                <Select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as OrgNodeType })}
                >
                  {NODE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Parent" hint="Leave as “No parent” to make this a root node.">
              <Select
                value={form.parentId ?? ''}
                onChange={(e) => setForm({ ...form, parentId: e.target.value || null })}
              >
                <option value="">— No parent (root) —</option>
                {flat
                  .filter(({ node }) => node.id !== form.id)
                  .map(({ node, depth }) => (
                    <option key={node.id} value={node.id}>
                      {' '.repeat(depth * 3)}
                      {node.name} ({node.code})
                    </option>
                  ))}
              </Select>
            </Field>
          </>
        )}
      </Modal>
    </div>
  );
};

const Detail: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({
  label, value, mono,
}) => (
  <div>
    <span className="adm-field-label mono-label">{label}</span>
    <div className={mono ? 'adm-cell-mono' : ''} style={{ fontSize: 13, color: 'var(--text-1)' }}>
      {value}
    </div>
  </div>
);

// --- Roles tab --------------------------------------------------------------

const RolesTab: React.FC<{
  roles: AdminRole[];
  capabilities: Capability[];
  sodRules: SegregationRule[];
  onChanged: () => Promise<void>;
  notify: (tone: 'success' | 'error' | 'info', msg: string) => void;
}> = ({ roles, capabilities, sodRules, onChanged, notify }) => {
  const [selectedId, setSelectedId] = useState<number | null>(roles[0]?.id ?? null);
  const [draft, setDraft] = useState<Record<string, CapabilityScope>>({});
  const [conflicts, setConflicts] = useState<SegregationConflict[]>([]);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  const selected = roles.find((r) => r.id === selectedId) ?? null;

  // Reset the draft matrix whenever a different role is opened.
  useEffect(() => {
    if (!selected) return setDraft({});
    const next: Record<string, CapabilityScope> = {};
    selected.capabilities.forEach((c) => { next[c.capabilityKey] = c.scope; });
    setDraft(next);
  }, [selectedId, roles]); // eslint-disable-line react-hooks/exhaustive-deps

  // The validator runs live against the draft, not the saved role.
  useEffect(() => {
    const keys = Object.keys(draft);
    if (keys.length === 0) return setConflicts([]);

    let cancelled = false;
    adminApi
      .validateSegregation(keys)
      .then((found) => { if (!cancelled) setConflicts(found); })
      .catch(() => { if (!cancelled) setConflicts([]); });

    return () => { cancelled = true; };
  }, [draft]);

  const conflictKeys = useMemo(() => {
    const keys = new Set<string>();
    conflicts.forEach((c) => { keys.add(c.capabilityA); keys.add(c.capabilityB); });
    return keys;
  }, [conflicts]);

  const grouped = useMemo(() => {
    const map = new Map<string, Capability[]>();
    capabilities.forEach((cap) => {
      map.set(cap.group, [...(map.get(cap.group) ?? []), cap]);
    });
    return [...map.entries()];
  }, [capabilities]);

  const dirty = useMemo(() => {
    if (!selected) return false;
    const saved: Record<string, CapabilityScope> = {};
    selected.capabilities.forEach((c) => { saved[c.capabilityKey] = c.scope; });
    return JSON.stringify(saved) !== JSON.stringify(draft);
  }, [selected, draft]);

  const toggle = (key: string) =>
    setDraft((d) => {
      const next = { ...d };
      if (key in next) delete next[key];
      else next[key] = 'HUB';
      return next;
    });

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminApi.setRoleCapabilities(
        selected.id,
        Object.entries(draft).map(([capabilityKey, scope]) => ({ capabilityKey, scope })),
      );
      notify('success', `Saved the capability matrix for ${selected.name}`);
      await onChanged();
    } catch (err) {
      const found = errorConflicts(err);
      if (found.length > 0) {
        setConflicts(found);
        notify('error', 'Blocked: this set violates segregation of duties');
      } else {
        notify('error', errorMessage(err, 'Could not save the role'));
      }
    } finally {
      setSaving(false);
    }
  };

  const createRole = async () => {
    setSaving(true);
    try {
      const created = await adminApi.createRole({
        name: newRole.name.trim().toUpperCase(),
        description: newRole.description.trim() || undefined,
      });
      notify('success', `Created role ${created.name}`);
      setCreating(false);
      setNewRole({ name: '', description: '' });
      await onChanged();
      setSelectedId(created.id);
    } catch (err) {
      notify('error', errorMessage(err, 'Could not create the role'));
    } finally {
      setSaving(false);
    }
  };

  const removeRole = async (role: AdminRole) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try {
      await adminApi.deleteRole(role.id);
      notify('success', `Deleted ${role.name}`);
      if (selectedId === role.id) setSelectedId(null);
      await onChanged();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not delete the role'));
    }
  };

  return (
    <div className="adm-grid-side">
      <Panel
        title="Role builder"
        subtitle={
          selected
            ? `Capability × scope matrix for ${selected.name}`
            : 'Pick a role to edit its matrix'
        }
        actions={
          selected && (
            <Button
              variant="primary"
              loading={saving}
              disabled={!dirty || conflicts.length > 0}
              onClick={save}
            >
              {conflicts.length > 0 ? 'Resolve conflicts to save' : dirty ? 'Save matrix' : 'Saved'}
            </Button>
          )
        }
      >
        {!selected ? (
          <EmptyState title="No role selected" hint="Choose a role from the list on the right." />
        ) : (
          <>
            <div
              className={`adm-sod ${conflicts.length > 0 ? 'is-conflict' : 'is-clean'}`}
              style={{ marginBottom: 18 }}
            >
              {conflicts.length > 0 ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
              <div>
                <strong>
                  {conflicts.length > 0
                    ? `${conflicts.length} segregation conflict${conflicts.length > 1 ? 's' : ''}`
                    : 'Segregation validator: clean'}
                </strong>
                {conflicts.length > 0 ? (
                  <ul className="adm-sod-list">
                    {conflicts.map((c) => (
                      <li key={`${c.capabilityA}-${c.capabilityB}`}>· {c.message}</li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ marginTop: 3 }}>
                    This set holds {Object.keys(draft).length} capabilit
                    {Object.keys(draft).length === 1 ? 'y' : 'ies'} and breaks none of the{' '}
                    {sodRules.length} rules.
                  </div>
                )}
              </div>
            </div>

            {grouped.map(([group, caps]) => (
              <div className="adm-matrix-group" key={group}>
                <span className="adm-matrix-group-title mono-label">{group}</span>
                {caps.map((cap) => {
                  const on = cap.key in draft;
                  const bad = on && conflictKeys.has(cap.key);
                  return (
                    <div
                      key={cap.key}
                      className={`adm-cap-row ${on ? 'is-on' : ''} ${bad ? 'is-conflict' : ''}`}
                    >
                      <input
                        type="checkbox"
                        className="adm-checkbox"
                        checked={on}
                        onChange={() => toggle(cap.key)}
                        aria-label={cap.label}
                      />
                      <div className="adm-cap-label">
                        {cap.label}
                        <span className="adm-cap-key">{cap.key}</span>
                      </div>
                      {bad && <ShieldAlert size={14} color="var(--red)" />}
                      <Select
                        className="adm-scope-select"
                        value={draft[cap.key] ?? ''}
                        disabled={!on}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, [cap.key]: e.target.value as CapabilityScope }))
                        }
                      >
                        {!on && <option value="">—</option>}
                        {SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </Select>
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}
      </Panel>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Panel
          title="Roles"
          actions={
            <Button variant="subtle" size="sm" icon={<Plus size={13} />} onClick={() => setCreating(true)}>
              New
            </Button>
          }
          padded={false}
        >
          <div className="adm-table-wrap">
            <table className="adm-table">
              <tbody>
                {roles.map((role) => (
                  <tr
                    key={role.id}
                    onClick={() => setSelectedId(role.id)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedId === role.id ? 'var(--green-glow)' : undefined,
                    }}
                  >
                    <td>
                      <div style={{ fontWeight: 600 }}>{role.name}</div>
                      <div className="adm-row-sub">
                        {role.capabilities.length} capabilities · {role.userCount} user
                        {role.userCount === 1 ? '' : 's'}
                      </div>
                    </td>
                    <td style={{ width: 40 }}>
                      <div className="adm-cell-actions">
                        <button
                          className="adm-icon-btn is-danger"
                          title="Delete role"
                          onClick={(e) => { e.stopPropagation(); void removeRole(role); }}
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

        <Panel title="Segregation rules" subtitle="Capability pairs no single role may hold.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sodRules.map((rule) => (
              <div key={rule.id} style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                  <span className="adm-hash">{rule.capabilityA}</span>
                  <span style={{ color: 'var(--text-3)' }}>×</span>
                  <span className="adm-hash">{rule.capabilityB}</span>
                </div>
                {rule.message}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Modal
        open={creating}
        title="New role"
        onClose={() => setCreating(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} disabled={!newRole.name.trim()} onClick={createRole}>
              Create role
            </Button>
          </>
        }
      >
        <Field label="Name" hint="Stored uppercase, e.g. FINANCE_CONTROLLER.">
          <Input
            autoFocus
            className="adm-input-mono"
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            placeholder="FINANCE_CONTROLLER"
          />
        </Field>
        <Field label="Description">
          <Input
            value={newRole.description}
            onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
            placeholder="Approves settlements for the west region"
          />
        </Field>
      </Modal>
    </div>
  );
};

// --- Users tab --------------------------------------------------------------

const UsersTab: React.FC<{
  users: AdminUser[];
  roles: AdminRole[];
  onChanged: () => Promise<void>;
  notify: (tone: 'success' | 'error' | 'info', msg: string) => void;
}> = ({ users, roles, onChanged, notify }) => {
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [draftRoles, setDraftRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(query.toLowerCase()),
  );

  const openEditor = (user: AdminUser) => {
    setEditing(user);
    setDraftRoles(user.roles);
  };

  const saveRoles = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await adminApi.setUserRoles(editing.id, draftRoles);
      notify('success', `Updated roles for ${editing.email}`);
      setEditing(null);
      await onChanged();
    } catch (err) {
      const conflicts = errorConflicts(err);
      notify(
        'error',
        conflicts.length > 0
          ? `Blocked — ${conflicts[0].message}`
          : errorMessage(err, 'Could not update the roles'),
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user: AdminUser) => {
    try {
      await adminApi.setUserActive(user.id, !user.isActive);
      notify('success', `${user.email} is now ${user.isActive ? 'inactive' : 'active'}`);
      await onChanged();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not change the user status'));
    }
  };

  return (
    <Panel
      title="Users"
      subtitle="Role stacking is validated against segregation of duties on save."
      actions={
        <Input
          style={{ width: 220 }}
          placeholder="Search name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      }
      padded={false}
    >
      {filtered.length === 0 ? (
        <EmptyState title="No users match" hint="Try a different search term." />
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Roles</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="adm-avatar">
                        {`${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="adm-row-sub">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {user.roles.length === 0 ? (
                        <span className="adm-row-sub">No roles</span>
                      ) : (
                        user.roles.map((r) => <Badge key={r} tone="green">{r}</Badge>)
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge tone={user.isActive ? 'green' : 'grey'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <div className="adm-cell-actions" style={{ alignItems: 'center' }}>
                      <Toggle
                        checked={user.isActive}
                        onChange={() => void toggleActive(user)}
                        label={`Toggle ${user.email}`}
                      />
                      <Button variant="subtle" size="sm" onClick={() => openEditor(user)}>
                        Roles
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={editing !== null}
        title="Assign roles"
        subtitle={editing?.email}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={saveRoles}>Save roles</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {roles.map((role) => {
            const on = draftRoles.includes(role.name);
            return (
              <div key={role.id} className={`adm-cap-row ${on ? 'is-on' : ''}`}>
                <input
                  type="checkbox"
                  className="adm-checkbox"
                  checked={on}
                  onChange={() =>
                    setDraftRoles((r) =>
                      on ? r.filter((n) => n !== role.name) : [...r, role.name],
                    )
                  }
                  aria-label={role.name}
                />
                <div className="adm-cap-label">
                  {role.name}
                  <span className="adm-cap-key">
                    {role.capabilities.length} capabilities
                    {role.description ? ` · ${role.description}` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </Panel>
  );
};
