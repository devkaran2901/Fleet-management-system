import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, Layers, Network, Pencil, Plus, Wallet } from 'lucide-react';
import { adminApi, errorMessage } from '../../services/adminApi';
import type { CostCenter, OrgNode, OrgNodeType } from '../../services/adminApi';
import {
  Badge, Button, EmptyState, ErrorState, Field, Input, LoadingState, Modal, Panel,
  Select, useToast,
} from '../../components/admin/ui';
import { Detail, NODE_TYPES, Stat, TreeBranch, TYPE_TONE, countNodes, flatten } from './orgShared';

interface NodeForm {
  id?: string;
  name: string;
  code: string;
  type: OrgNodeType;
  parentId: string | null;
}

export const OrgTree: React.FC = () => {
  const { notify } = useToast();
  const [tree, setTree] = useState<OrgNode[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selected, setSelected] = useState<OrgNode | null>(null);
  const [form, setForm] = useState<NodeForm | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [treeData, centers] = await Promise.all([adminApi.orgTree(), adminApi.costCenters()]);
      setTree(treeData);
      setCostCenters(centers);
      // Keep the selection pointing at fresh data after a reload.
      setSelected((current) =>
        current ? flatten(treeData).find((f) => f.node.id === current.id)?.node ?? null : null,
      );
    } catch (err) {
      setError(errorMessage(err, 'Could not load the org tree'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

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
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not save the node'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (node: OrgNode) => {
    const childCount = countNodes(node.children);
    const warning = childCount > 0 ? `\n\nThis also deletes ${childCount} node(s) beneath it.` : '';
    if (!window.confirm(`Delete "${node.name}"?${warning}`)) return;
    try {
      await adminApi.deleteOrgNode(node.id);
      notify('success', `Deleted ${node.name}`);
      if (selected?.id === node.id) setSelected(null);
      await load();
    } catch (err) {
      notify('error', errorMessage(err, 'Could not delete the node'));
    }
  };

  if (loading) return <LoadingState label="Loading the org tree" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const byType = (type: OrgNodeType) => flat.filter((f) => f.node.type === type).length;
  const nodeCentres = selected
    ? costCenters.filter((c) => c.orgNode?.id === selected.id)
    : [];

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Identity, RBAC &amp; Org</span>
          <h1 className="adm-page-title">
            <Network size={22} color="var(--green)" /> Org Tree
          </h1>
          <p className="adm-page-sub">
            The company hierarchy. A node can be moved by changing its parent — the API
            refuses moves that would place a node beneath one of its own descendants.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={14} />}
          onClick={() => setForm({ name: '', code: '', type: 'REGION', parentId: null })}
        >
          New node
        </Button>
      </div>

      <div className="adm-stats">
        <Stat icon={<Layers size={15} color="var(--green)" />} value={countNodes(tree)} label="Total nodes" />
        <Stat icon={<Building2 size={15} color="var(--green)" />} value={byType('REGION')} label="Regions" />
        <Stat icon={<Building2 size={15} color="var(--amber)" />} value={byType('HUB')} label="Hubs" />
        <Stat icon={<Building2 size={15} color="var(--text-3)" />} value={byType('DEPOT')} label="Depots" />
      </div>

      <div className="adm-grid-side">
        <Panel
          title="Org tree editor"
          subtitle="Click a node to inspect it; hover a row for nest, rename and remove."
        >
          {tree.length === 0 ? (
            <EmptyState title="No org nodes yet" hint="Create a root node to start the hierarchy." />
          ) : (
            <TreeBranch
              nodes={tree}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
              onAddChild={(node) => setForm({ name: '', code: '', type: 'HUB', parentId: node.id })}
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
          {selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Detail label="Name" value={selected.name} />
              <Detail label="Code" value={selected.code} mono />
              <Detail label="Type" value={<Badge tone={TYPE_TONE[selected.type]}>{selected.type}</Badge>} />
              <Detail label="Direct children" value={String(selected.children.length)} mono />
              <Detail label="Nodes beneath" value={String(countNodes(selected.children))} mono />

              <div>
                <span className="adm-field-label mono-label">Cost centres here</span>
                {nodeCentres.length === 0 ? (
                  <span className="adm-row-sub">None attached to this node</span>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                    {nodeCentres.map((centre) => (
                      <div
                        key={centre.code}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}
                      >
                        <Wallet size={13} color="var(--text-3)" />
                        <span style={{ color: 'var(--text-1)' }}>{centre.name}</span>
                        <Badge tone={centre.utilisation > 90 ? 'red' : 'grey'}>
                          {centre.utilisation}% used
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant="subtle"
                icon={<Pencil size={13} />}
                onClick={() =>
                  setForm({
                    id: selected.id, name: selected.name, code: selected.code,
                    type: selected.type, parentId: selected.parentId,
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
      </div>

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
    </>
  );
};
