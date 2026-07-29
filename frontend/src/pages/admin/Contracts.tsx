import React, { useState } from 'react';
import { FileSignature, Plus, Search } from 'lucide-react';
import { Button, Panel, Badge, Modal, Input, Field } from '../../components/admin/ui';
import type { ContractItem } from '../../services/adminApi';

const INITIAL_CONTRACTS: ContractItem[] = [
  {
    id: 'cnt-1',
    contractNumber: 'CTR-2026-0891',
    title: 'Interstate Heavy Freight Carrier Agreement',
    partyName: 'Apex Logistics Corp',
    partyType: 'Vendor',
    startDate: '2026-01-01',
    endDate: '2027-12-31',
    rateType: 'Per KM',
    monthlyValue: 4800000,
    status: 'Active',
    escalationClause: 'Fuel Price Indexation: +₹0.50/KM per ₹2/L fuel hike',
  },
  {
    id: 'cnt-2',
    contractNumber: 'CTR-2026-0412',
    title: 'Container Movement Service Level Agreement',
    partyName: 'Reliance Retail Logistics',
    partyType: 'Customer',
    startDate: '2025-06-15',
    endDate: '2026-08-31',
    rateType: 'Fixed Route',
    monthlyValue: 12500000,
    status: 'Expiring Soon',
    escalationClause: 'Quarterly inflation adjustment + 3%',
  },
  {
    id: 'cnt-3',
    contractNumber: 'CTR-2026-0904',
    title: 'Secondary Distribution Dedicated Fleet SLA',
    partyName: 'VRL Transport Services',
    partyType: 'Vendor',
    startDate: '2026-03-01',
    endDate: '2028-02-28',
    rateType: 'Monthly Retainer',
    monthlyValue: 3200000,
    status: 'Active',
    escalationClause: 'Fixed rate with zero escalation for 12 months',
  },
];

export const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<ContractItem[]>(INITIAL_CONTRACTS);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    contractNumber: '',
    title: '',
    partyName: '',
    partyType: 'Vendor' as 'Vendor' | 'Customer',
    monthlyValue: 1000000,
    rateType: 'Per KM' as 'Fixed Route' | 'Per KM' | 'Monthly Retainer',
    escalationClause: '',
  });

  const filtered = contracts.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.partyName.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newContract: ContractItem = {
      id: `cnt-${Date.now()}`,
      contractNumber: formData.contractNumber || `CTR-2026-${Date.now().toString().slice(-4)}`,
      title: formData.title,
      partyName: formData.partyName,
      partyType: formData.partyType,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2027-12-31',
      rateType: formData.rateType,
      monthlyValue: Number(formData.monthlyValue),
      status: 'Active',
      escalationClause: formData.escalationClause || 'Fuel Price Indexation',
    };
    setContracts([newContract, ...contracts]);
    setModalOpen(false);
  };

  return (
    <>
      <div className="adm-page-head">
        <div>
          <span className="adm-spec-chip mono-label">Master Data / M-07</span>
          <h1 className="adm-page-title">
            <FileSignature size={22} color="var(--green)" /> Contracts & Rate Cards
          </h1>
          <p className="adm-page-sub">
            Master contracts with vendors and customers, escalation formulas, and version control.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
          New Contract
        </Button>
      </div>

      <Panel title="Commercial Agreements Register">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search contract number, title, party name..."
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
                <th>Contract Code & Title</th>
                <th>Counterparty</th>
                <th>Rate Model</th>
                <th>Monthly Value</th>
                <th>Validity Window</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ct) => (
                <tr key={ct.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{ct.title}</div>
                    <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>
                      {ct.contractNumber}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{ct.partyName}</div>
                    <Badge tone={ct.partyType === 'Vendor' ? 'blue' : 'green'}>{ct.partyType}</Badge>
                  </td>
                  <td>
                    <Badge tone="grey">{ct.rateType}</Badge>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-1)' }}>
                    ₹{(ct.monthlyValue / 100000).toFixed(2)} Lakhs/mo
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-2)' }}>
                    {ct.startDate} → {ct.endDate}
                  </td>
                  <td>
                    <Badge tone={ct.status === 'Active' ? 'green' : ct.status === 'Expiring Soon' ? 'amber' : 'grey'}>
                      {ct.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New Contract">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Contract Number">
            <Input value={formData.contractNumber} placeholder="CTR-2026-XXXX" onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })} required />
          </Field>
          <Field label="Agreement Title">
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </Field>
          <Field label="Party Name">
            <Input value={formData.partyName} onChange={(e) => setFormData({ ...formData, partyName: e.target.value })} required />
          </Field>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Party Type</label>
              <select
                value={formData.partyType}
                onChange={(e) => setFormData({ ...formData, partyType: e.target.value as any })}
                style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--border-soft)', backgroundColor: 'var(--panel-2)', color: 'var(--text-1)' }}
              >
                <option value="Vendor">Vendor</option>
                <option value="Customer">Customer</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Rate Card Model</label>
              <select
                value={formData.rateType}
                onChange={(e) => setFormData({ ...formData, rateType: e.target.value as any })}
                style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--border-soft)', backgroundColor: 'var(--panel-2)', color: 'var(--text-1)' }}
              >
                <option value="Per KM">Per KM Rate</option>
                <option value="Fixed Route">Fixed Route Tariff</option>
                <option value="Monthly Retainer">Monthly Retainer</option>
              </select>
            </div>
          </div>

          <Field label="Estimated Monthly Value (₹)">
            <Input type="number" value={formData.monthlyValue} onChange={(e) => setFormData({ ...formData, monthlyValue: Number(e.target.value) })} required />
          </Field>
          <Field label="Escalation Clause Formula">
            <Input value={formData.escalationClause} placeholder="Fuel Indexation formula..." onChange={(e) => setFormData({ ...formData, escalationClause: e.target.value })} />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <Button variant="subtle" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Contract</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
