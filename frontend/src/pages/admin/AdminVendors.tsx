import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  CheckCircle,
  FileCheck,
  UserPlus,
} from 'lucide-react';
import { initialVendors, initialVendorUsers } from '../vendor/vendorDataStore';
import type { EmpanelledVendor, VendorUser } from '../vendor/vendorDataStore';
import '../../styles/admin.css';

export const AdminVendors: React.FC = () => {
  const [vendors, setVendors] = useState<EmpanelledVendor[]>(initialVendors);
  const [vendorUsers, setVendorUsers] = useState<VendorUser[]>(initialVendorUsers);

  const [activeTab, setActiveTab] = useState<'ALL' | EmpanelledVendor['status']>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVendorForKyc, setSelectedVendorForKyc] = useState<EmpanelledVendor | null>(null);
  const [selectedVendorForUser, setSelectedVendorForUser] = useState<EmpanelledVendor | null>(null);
  const [createdUserSuccess, setCreatedUserSuccess] = useState<VendorUser | null>(null);

  // New Vendor Form State
  const [newVendorForm, setNewVendorForm] = useState({
    name: '',
    gstin: '',
    pan: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    bankName: '',
    bankAccount: '',
    ifsc: '',
  });

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    email: '',
    role: 'Operations' as 'Owner' | 'Operations' | 'Billing',
  });

  // Filtering
  const filteredVendors = vendors.filter((v) => {
    const matchesTab = activeTab === 'ALL' || v.status === activeTab;
    const matchesQuery =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorForm.name || !newVendorForm.gstin) return;

    const newVendor: EmpanelledVendor = {
      id: `VND-${Date.now().toString().slice(-3)}`,
      vendorCode: `VND-${newVendorForm.name.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 90 + 10)}`,
      name: newVendorForm.name,
      gstin: newVendorForm.gstin,
      pan: newVendorForm.pan || newVendorForm.gstin.slice(2, 12),
      address: newVendorForm.address || 'Address provided during KYC',
      contactPerson: newVendorForm.contactPerson,
      phone: newVendorForm.phone,
      email: newVendorForm.email,
      bankName: newVendorForm.bankName || 'HDFC Bank',
      bankAccount: newVendorForm.bankAccount || '502000' + Math.floor(10000000 + Math.random() * 90000000),
      ifsc: newVendorForm.ifsc || 'HDFC0000123',
      status: 'Pending Verification',
      kycDocuments: {
        gstCertificate: true,
        panCard: true,
        companyRegistration: true,
        cancelledCheque: true,
        addressProof: false,
        insurance: true,
      },
      createdAt: new Date().toISOString().split('T')[0],
    };

    setVendors([newVendor, ...vendors]);
    setShowAddModal(false);
    setNewVendorForm({
      name: '',
      gstin: '',
      pan: '',
      address: '',
      contactPerson: '',
      phone: '',
      email: '',
      bankName: '',
      bankAccount: '',
      ifsc: '',
    });
  };

  const handleEmpanel = (vendorId: string) => {
    setVendors(
      vendors.map((v) =>
        v.id === vendorId
          ? {
              ...v,
              status: 'Empanelled',
              empanelledAt: new Date().toISOString().split('T')[0],
              kycDocuments: { ...v.kycDocuments, addressProof: true },
            }
          : v
      )
    );
    setSelectedVendorForKyc(null);
  };

  const handleReject = (vendorId: string, reason: string) => {
    setVendors(
      vendors.map((v) => (v.id === vendorId ? { ...v, status: 'Rejected', rejectionReason: reason } : v))
    );
    setSelectedVendorForKyc(null);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForUser || !newUserForm.email) return;

    const username = `vendor.${newUserForm.email.split('@')[0]}${Math.floor(100 + Math.random() * 900)}`;
    const tempPassword = `FleetOS@${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser: VendorUser = {
      id: `VU-${Date.now().toString().slice(-3)}`,
      vendorId: selectedVendorForUser.id,
      vendorName: selectedVendorForUser.name,
      fullName: newUserForm.fullName,
      email: newUserForm.email,
      username,
      role: newUserForm.role,
      status: 'Pending First Login',
      temporaryPassword: tempPassword,
      isFirstLogin: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setVendorUsers([newUser, ...vendorUsers]);
    setCreatedUserSuccess(newUser);
    setNewUserForm({ fullName: '', email: '', role: 'Operations' });
  };

  const empanelledCount = vendors.filter((v) => v.status === 'Empanelled').length;
  const pendingCount = vendors.filter((v) => v.status === 'Pending Verification').length;

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12))',
          border: '1px solid var(--border-soft)',
          borderRadius: 14,
          padding: 24,
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--green)',
              }}
            >
              <Building2 size={22} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
              Vendor Management & Empanelment Pipeline
            </h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, maxWidth: 780 }}>
            Phase 1 & 2 Workflow: Manage vendor applications, KYC document verification, empanelment approval, and provision vendor user credentials.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            backgroundColor: 'var(--green)',
            color: '#000',
            fontWeight: 700,
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          <Plus size={16} /> New Vendor Application
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={{ background: 'var(--panel-1)', border: '1px solid var(--border-soft)', padding: 18, borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>TOTAL REGISTERED VENDORS</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', marginTop: 6 }}>{vendors.length}</div>
        </div>

        <div style={{ background: 'var(--panel-1)', border: '1px solid var(--border-soft)', padding: 18, borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>EMPANELLED VENDORS (PHASE 1)</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--green)', marginTop: 6 }}>{empanelledCount}</div>
        </div>

        <div style={{ background: 'var(--panel-1)', border: '1px solid var(--border-soft)', padding: 18, borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 600 }}>PENDING KYC VERIFICATION</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--amber)', marginTop: 6 }}>{pendingCount}</div>
        </div>

        <div style={{ background: 'var(--panel-1)', border: '1px solid var(--border-soft)', padding: 18, borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>PROVISIONED VENDOR USERS</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--blue)', marginTop: 6 }}>{vendorUsers.length}</div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div
        style={{
          background: 'var(--panel-1)',
          border: '1px solid var(--border-soft)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['ALL', 'Pending Verification', 'Empanelled', 'Draft', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === tab ? 'var(--panel-3)' : 'transparent',
                color: activeTab === tab ? 'var(--text-1)' : 'var(--text-3)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: 280 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-3)' }} />
          <input
            type="text"
            placeholder="Search name, GSTIN, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 12px 6px 32px',
              backgroundColor: 'var(--panel-2)',
              border: '1px solid var(--border-soft)',
              borderRadius: 6,
              color: 'var(--text-1)',
              fontSize: 12,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Vendors Table */}
      <div style={{ background: 'var(--panel-1)', border: '1px solid var(--border-soft)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-3)', fontSize: 11, textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 16px' }}>Vendor Code & Name</th>
              <th style={{ padding: '12px 16px' }}>GSTIN / PAN</th>
              <th style={{ padding: '12px 16px' }}>Contact Person</th>
              <th style={{ padding: '12px 16px' }}>Bank Details</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-1)' }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>{v.vendorCode}</div>
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <div style={{ color: 'var(--text-1)', fontFamily: 'monospace', fontSize: 12 }}>{v.gstin}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>PAN: {v.pan}</div>
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <div style={{ color: 'var(--text-1)', fontWeight: 600 }}>{v.contactPerson}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{v.phone} • {v.email}</div>
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <div style={{ color: 'var(--text-1)', fontSize: 12 }}>{v.bankName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>
                    {v.bankAccount} ({v.ifsc})
                  </div>
                </td>

                <td style={{ padding: '14px 16px' }}>
                  {v.status === 'Empanelled' && (
                    <span style={{ padding: '3px 10px', borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--green)', fontSize: 11, fontWeight: 700 }}>
                      ✓ Empanelled
                    </span>
                  )}
                  {v.status === 'Pending Verification' && (
                    <span style={{ padding: '3px 10px', borderRadius: 12, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', fontSize: 11, fontWeight: 700 }}>
                      ⏳ Pending KYC
                    </span>
                  )}
                  {v.status === 'Draft' && (
                    <span style={{ padding: '3px 10px', borderRadius: 12, backgroundColor: 'rgba(148, 163, 184, 0.15)', color: 'var(--text-3)', fontSize: 11, fontWeight: 700 }}>
                      Draft
                    </span>
                  )}
                  {v.status === 'Rejected' && (
                    <span style={{ padding: '3px 10px', borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: 11, fontWeight: 700 }}>
                      Rejected
                    </span>
                  )}
                </td>

                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setSelectedVendorForKyc(v)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: 'var(--panel-2)',
                        border: '1px solid var(--border-soft)',
                        borderRadius: 6,
                        color: 'var(--text-1)',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <FileCheck size={12} /> KYC Review
                    </button>

                    {v.status === 'Empanelled' && (
                      <button
                        onClick={() => {
                          setSelectedVendorForUser(v);
                          setCreatedUserSuccess(null);
                        }}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: 6,
                          color: '#3b82f6',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <UserPlus size={12} /> Add Users
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Provisioned Users Section */}
      <div style={{ marginTop: 36 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 16 }}>
          Phase 2: Provisioned Vendor User Credentials
        </h3>
        <div style={{ background: 'var(--panel-1)', border: '1px solid var(--border-soft)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--panel-2)', borderBottom: '1px solid var(--border-soft)', color: 'var(--text-3)', fontSize: 11, textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Vendor Company</th>
                <th style={{ padding: '12px 16px' }}>User Full Name</th>
                <th style={{ padding: '12px 16px' }}>Role</th>
                <th style={{ padding: '12px 16px' }}>Username</th>
                <th style={{ padding: '12px 16px' }}>Temp Password</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {vendorUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-1)' }}>{u.vendorName}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-1)' }}>
                    {u.fullName}
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, background: 'var(--panel-2)', fontSize: 11 }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--green)' }}>{u.username}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--amber)' }}>
                    {u.temporaryPassword || '••••••••'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {u.isFirstLogin ? (
                      <span style={{ color: 'var(--amber)', fontSize: 11, fontWeight: 700 }}>⏳ Force Change Password on Login</span>
                    ) : (
                      <span style={{ color: 'var(--green)', fontSize: 11, fontWeight: 700 }}>Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer: New Vendor Application (Phase 1) */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--panel-1)', border: '1px solid var(--border-soft)', borderRadius: 14, width: '100%', maxWidth: 600, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text-1)' }}>
              Phase 1: Initiate Vendor Onboarding Application
            </h2>
            <form onSubmit={handleCreateVendor} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Vendor Company Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. ABC Transport Pvt Ltd"
                  value={newVendorForm.name}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>GSTIN *</label>
                  <input
                    required
                    type="text"
                    placeholder="27AAACA1234A1Z5"
                    value={newVendorForm.gstin}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, gstin: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>PAN</label>
                  <input
                    type="text"
                    placeholder="AAACA1234A"
                    value={newVendorForm.pan}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, pan: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Contact Person</label>
                  <input
                    type="text"
                    placeholder="Rakesh Sharma"
                    value={newVendorForm.contactPerson}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, contactPerson: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98200 88990"
                    value={newVendorForm.phone}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Email</label>
                <input
                  type="email"
                  placeholder="ops@abctransport.com"
                  value={newVendorForm.email}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, email: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Bank Name</label>
                  <input
                    type="text"
                    placeholder="HDFC Bank"
                    value={newVendorForm.bankName}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, bankName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Account No</label>
                  <input
                    type="text"
                    placeholder="50200012345678"
                    value={newVendorForm.bankAccount}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, bankAccount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>IFSC</label>
                  <input
                    type="text"
                    placeholder="HDFC0000123"
                    value={newVendorForm.ifsc}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, ifsc: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: 'var(--green)', color: '#000', fontWeight: 700, border: 'none', borderRadius: 6, cursor: 'pointer' }}
                >
                  Submit Application (Draft → Pending)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer: KYC Review Modal */}
      {selectedVendorForKyc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--panel-1)', border: '1px solid var(--border-soft)', borderRadius: 14, width: '100%', maxWidth: 650, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-1)' }}>
              KYC Document Verification: {selectedVendorForKyc.name}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>
              Verify submitted documents before empanelment approval.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {Object.entries(selectedVendorForKyc.kycDocuments).map(([doc, status]) => (
                <div key={doc} style={{ padding: 12, background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, textTransform: 'capitalize', color: 'var(--text-1)' }}>{doc.replace(/([A-Z])/g, ' $1')}</span>
                  {status ? (
                    <span style={{ color: 'var(--green)', fontSize: 11, fontWeight: 700 }}>✓ Verified</span>
                  ) : (
                    <span style={{ color: 'var(--amber)', fontSize: 11, fontWeight: 700 }}>⏳ Pending Upload</span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedVendorForKyc(null)}
                style={{ padding: '8px 16px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                onClick={() => handleReject(selectedVendorForKyc.id, 'KYC Document discrepancy found')}
                style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
              >
                Reject Application
              </button>
              <button
                onClick={() => handleEmpanel(selectedVendorForKyc.id)}
                style={{ padding: '8px 20px', background: 'var(--green)', color: '#000', fontWeight: 700, border: 'none', borderRadius: 6, cursor: 'pointer' }}
              >
                Approve & Empanel Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: User Provisioning (Phase 2) */}
      {selectedVendorForUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--panel-1)', border: '1px solid var(--border-soft)', borderRadius: 14, width: '100%', maxWidth: 500, padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: 'var(--text-1)' }}>
              Phase 2: Provision Vendor Account Users
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
              Create user credentials for <strong style={{ color: 'var(--text-1)' }}>{selectedVendorForUser.name}</strong>.
            </p>

            {createdUserSuccess ? (
              <div style={{ padding: 16, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 10, marginBottom: 16 }}>
                <div style={{ color: 'var(--green)', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={16} /> User Provisioned Successfully!
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-1)' }}>
                  <div><strong>Username:</strong> <code style={{ color: 'var(--green)' }}>{createdUserSuccess.username}</code></div>
                  <div><strong>Temp Password:</strong> <code style={{ color: 'var(--amber)' }}>{createdUserSuccess.temporaryPassword}</code></div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
                  Welcome email containing temporary login link sent to {createdUserSuccess.email}.
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Amit Verma"
                    value={newUserForm.fullName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="ops@abctransport.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', fontSize: 13 }}
                  >
                    <option value="Owner">Owner</option>
                    <option value="Operations">Operations</option>
                    <option value="Billing">Billing</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => setSelectedVendorForUser(null)}
                    style={{ padding: '8px 16px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', cursor: 'pointer' }}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '8px 20px', background: '#3b82f6', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 6, cursor: 'pointer' }}
                  >
                    Generate Login Credentials
                  </button>
                </div>
              </form>
            )}

            {createdUserSuccess && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button
                  onClick={() => setSelectedVendorForUser(null)}
                  style={{ padding: '8px 20px', background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: 6, color: 'var(--text-1)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
