import React, { useState } from 'react';
import { Building2, ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import type { CapabilityScope, OrgNode, OrgNodeType } from '../../services/adminApi';
import { Badge } from '../../components/admin/ui';
import type { BadgeTone } from '../../components/admin/ui';

export const NODE_TYPES: OrgNodeType[] = ['ORG', 'REGION', 'HUB', 'DEPOT', 'TEAM'];
export const SCOPES: CapabilityScope[] = ['GLOBAL', 'REGION', 'HUB', 'SELF'];

export const TYPE_TONE: Record<OrgNodeType, BadgeTone> = {
  ORG: 'green',
  REGION: 'blue',
  HUB: 'amber',
  DEPOT: 'grey',
  TEAM: 'grey',
};

/** Total nodes in a forest, including every descendant. */
export const countNodes = (nodes: OrgNode[]): number =>
  nodes.reduce((sum, node) => sum + 1 + countNodes(node.children), 0);

/** Depth-first flatten, used to build parent pickers. */
export const flatten = (nodes: OrgNode[], depth = 0): { node: OrgNode; depth: number }[] =>
  nodes.flatMap((node) => [{ node, depth }, ...flatten(node.children, depth + 1)]);

export const Stat: React.FC<{ icon: React.ReactNode; value: number | string; label: string }> = ({
  icon, value, label,
}) => (
  <div className="adm-stat">
    <span className="adm-stat-icon">{icon}</span>
    <span className="adm-stat-value">{value}</span>
    <span className="adm-stat-label">{label}</span>
  </div>
);

export const Detail: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({
  label, value, mono,
}) => (
  <div>
    <span className="adm-field-label mono-label">{label}</span>
    <div className={mono ? 'adm-cell-mono' : ''} style={{ fontSize: 13, color: 'var(--text-1)' }}>
      {value}
    </div>
  </div>
);

export const TreeBranch: React.FC<{
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
