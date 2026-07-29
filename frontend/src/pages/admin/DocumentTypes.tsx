import React, { useState } from 'react';
import { FileBadge, Plus, Search } from 'lucide-react';
import { Button, Panel, Badge, Modal, Input, Field } from '../../components/admin/ui';
import type { DocumentTypeItem } from '../../services/adminApi';

const INITIAL_DOCS: DocumentTypeItem[] = [
  {
    id: 'doc-1',
    code: 'DOC-INS',
    name: 'Commercial Vehicle Comprehensive Insurance Policy',
    category: 'Vehicle',
    validityDays: 365,
    advanceWarningDays: 30,
    isMandatory: true,
    ocrEnabled: true,
  },
  {
    id: 'doc-2',
    code: 'DOC-FIT',
    name: 'RTO Vehicle Fitness Certificate',
    category: 'Vehicle',
    validityDays: 365,
    advanceWarningDays: 45,
    isMandatory: true,
    ocrEnabled: true,
  },
  {
    id: 'doc-3',
    code: 'DOC-PUC',
    name: 'Pollution Under Control (PUC) Certificate',
    category: 'Vehicle',
    validityDays: 180,
    advanceWarningDays: 15,
    isMandatory: true,
    ocrEnabled: true,
  },
  {
    id: 'doc-4',
    code: 'DOC-DL',
    name: 'Commercial Heavy Motor Vehicle Driving License',
    category: 'Driver',
    validityDays: 1095,
    advanceWarningDays: 60,
    isMandatory: true,
    ocrEnabled: true,
  },
];

export const DocumentTypes: React.FC = () => {
  const [docs, setDocs] = useState<DocumentTypeItem[]>(INITIAL_DOCS);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Vehicle' as DocumentTypeItem['category'],
    validityDays: 365,
    advanceWarningDays: 30,
    isMandatory: true,
    ocrEnabled: true,
  });

  const filtered = docs.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: DocumentTypeItem = {
      id: `doc-${Date.now()}`,
      code: formData.code || `DOC-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      category: formData.category,
      validityDays: Number(formData.validityDays),
      advanceWarningDays: Number(formData.advanceWarningDays),
      isMandatory: formData.isMandatory,
      ocrEnabled: formData.ocrEnabled,
    };
    setDocs([newDoc, ...docs]);
    setModalOpen(false);
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Settings / P-09</span>
          <h1 className="adm-page-title">
            <FileBadge size={22} color="var(--green)" /> Compliance Document Types
          </h1>
          <p className="adm-page-sub">
            Master document type catalog (Insurance, Fitness, PUC, Driving License), expiration rules and OCR auto-extraction configuration.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
          Add Document Type
        </Button>
      </div>

      <Panel title="Configured Statutory Document Types">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search document name, code, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                fontSize: 13,
                borderRadius: 6,
                border: '1px solid var(--border-soft)',
                backgroundColor: 'var(--panel-2)',
                color: 'var(--text-1)',
              }}
            />
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Document Code & Name</th>
                <th>Category</th>
                <th>Validity Period</th>
                <th>Advance Warning Threshold</th>
                <th>Mandatory</th>
                <th>OCR Auto-Verify</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{d.name}</div>
                    <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>
                      {d.code}
                    </span>
                  </td>
                  <td>
                    <Badge tone="blue">{d.category}</Badge>
                  </td>
                  <td style={{ fontSize: 12, fontWeight: 600 }}>{d.validityDays} days</td>
                  <td style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>
                    Warn {d.advanceWarningDays} days prior
                  </td>
                  <td>
                    <Badge tone={d.isMandatory ? 'red' : 'grey'}>
                      {d.isMandatory ? 'Mandatory' : 'Optional'}
                    </Badge>
                  </td>
                  <td>
                    <Badge tone={d.ocrEnabled ? 'green' : 'grey'}>
                      {d.ocrEnabled ? 'Enabled' : 'Manual'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Define New Document Type">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Document Type Code"><Input value={formData.code} placeholder="DOC-PERMIT" onChange={(e) => setFormData({ ...formData, code: e.target.value })} required /></Field>
          <Field label="Document Name"><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></Field>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Target Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--border-soft)', backgroundColor: 'var(--panel-2)', color: 'var(--text-1)' }}
              >
                <option value="Vehicle">Vehicle</option>
                <option value="Driver">Driver</option>
                <option value="Vendor">Vendor</option>
                <option value="Trip">Trip</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <Field label="Validity (Days)"><Input type="number" value={formData.validityDays} onChange={(e) => setFormData({ ...formData, validityDays: Number(e.target.value) })} required /></Field>
            </div>
          </div>

          <Field label="Advance Warning Alert (Days Before Expiry)"><Input type="number" value={formData.advanceWarningDays} onChange={(e) => setFormData({ ...formData, advanceWarningDays: Number(e.target.value) })} required /></Field>

          <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.isMandatory} onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })} />
              Is Mandatory for Compliance
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.ocrEnabled} onChange={(e) => setFormData({ ...formData, ocrEnabled: e.target.checked })} />
              Enable OCR AI Verification
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <Button variant="subtle" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Document Type</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
