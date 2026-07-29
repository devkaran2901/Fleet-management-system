import React, { useState } from 'react';
import { Boxes, Plus, Search, ShoppingCart } from 'lucide-react';
import { Button, Panel, Badge, Modal, Input, Field } from '../../components/admin/ui';
import type { PartItem } from '../../services/adminApi';

const INITIAL_PARTS: PartItem[] = [
  {
    id: 'p-1',
    partNumber: 'PRT-FLT-1002',
    name: 'Heavy Duty Oil Filter Element',
    category: 'Filters',
    vendor: 'Bosch Automotive',
    unitCost: 1250,
    stockQty: 48,
    minStockQty: 20,
    maxStockQty: 100,
    reorderPoint: 25,
    status: 'In Stock',
    compatModels: ['Tata Signa 5530', 'BharatBenz 2823C'],
  },
  {
    id: 'p-2',
    partNumber: 'PRT-BRK-4001',
    name: 'Brake Drum Assembly Rear',
    category: 'Braking System',
    vendor: 'Brembo Commercial',
    unitCost: 8400,
    stockQty: 4,
    minStockQty: 10,
    maxStockQty: 30,
    reorderPoint: 12,
    status: 'Low Stock',
    compatModels: ['Tata Prima 4928', 'Ashok Leyland 3520'],
  },
  {
    id: 'p-3',
    partNumber: 'PRT-TYR-9902',
    name: 'Radial Tubeless Tyre 295/80 R22.5',
    category: 'Tyres & Wheels',
    vendor: 'MRF Commercial',
    unitCost: 24500,
    stockQty: 18,
    minStockQty: 15,
    maxStockQty: 60,
    reorderPoint: 20,
    status: 'In Stock',
    compatModels: ['All Heavy Freight Trailers'],
  },
];

export const Parts: React.FC = () => {
  const [parts, setParts] = useState<PartItem[]>(INITIAL_PARTS);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    partNumber: '',
    name: '',
    category: 'Engine',
    vendor: '',
    unitCost: 1000,
    stockQty: 20,
    minStockQty: 5,
    reorderPoint: 10,
  });

  const filtered = parts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.partNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newPart: PartItem = {
      id: `p-${Date.now()}`,
      partNumber: formData.partNumber || `PRT-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      category: formData.category,
      vendor: formData.vendor,
      unitCost: Number(formData.unitCost),
      stockQty: Number(formData.stockQty),
      minStockQty: Number(formData.minStockQty),
      maxStockQty: Number(formData.minStockQty) * 4,
      reorderPoint: Number(formData.reorderPoint),
      status: Number(formData.stockQty) <= Number(formData.reorderPoint) ? 'Low Stock' : 'In Stock',
      compatModels: ['Universal Truck Fleet'],
    };
    setParts([newPart, ...parts]);
    setModalOpen(false);
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Master Data / M-05</span>
          <h1 className="adm-page-title">
            <Boxes size={22} color="var(--green)" /> Parts Master & Inventory
          </h1>
          <p className="adm-page-sub">
            Spare parts catalog, stock levels, reorder point thresholds, and vendor cross-references.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
          Add Part Item
        </Button>
      </div>

      <Panel title="Parts Inventory Catalog">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search part number, description, category, vendor..."
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
                <th>Part Code & Description</th>
                <th>Category</th>
                <th>Vendor</th>
                <th>Unit Cost</th>
                <th>Stock / Reorder</th>
                <th>Status</th>
                <th>Reorder Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pt) => (
                <tr key={pt.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{pt.name}</div>
                    <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>
                      {pt.partNumber}
                    </span>
                  </td>
                  <td>
                    <Badge tone="grey">{pt.category}</Badge>
                  </td>
                  <td style={{ fontSize: 12 }}>{pt.vendor}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>
                    ₹{pt.unitCost.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>
                      {pt.stockQty} pcs <span style={{ fontSize: 10, color: 'var(--text-3)' }}>(Min: {pt.minStockQty})</span>
                    </div>
                  </td>
                  <td>
                    <Badge tone={pt.status === 'In Stock' ? 'green' : 'red'}>{pt.status}</Badge>
                  </td>
                  <td>
                    <Button
                      variant="subtle"
                      size="sm"
                      icon={<ShoppingCart size={12} />}
                      onClick={() => alert(`Purchase requisition triggered for ${pt.name}`)}
                    >
                      Reorder
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Part to Catalogue">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Part Number">
            <Input value={formData.partNumber} placeholder="PRT-XXX-001" onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })} required />
          </Field>
          <Field label="Part Description">
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </Field>
          <Field label="Vendor Name">
            <Input value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} required />
          </Field>
          <Field label="Unit Cost (₹)">
            <Input type="number" value={formData.unitCost} onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })} required />
          </Field>
          <Field label="Current Stock Quantity">
            <Input type="number" value={formData.stockQty} onChange={(e) => setFormData({ ...formData, stockQty: Number(e.target.value) })} required />
          </Field>
          <Field label="Reorder Threshold">
            <Input type="number" value={formData.reorderPoint} onChange={(e) => setFormData({ ...formData, reorderPoint: Number(e.target.value) })} required />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <Button variant="subtle" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Part</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
