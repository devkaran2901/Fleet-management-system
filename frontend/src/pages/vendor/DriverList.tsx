import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, UserCheck } from 'lucide-react';
import { initialDrivers } from './vendorDataStore';
import type { Driver } from './vendorDataStore';
import '../../styles/vendor.css';

export const DriverList: React.FC = () => {
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Verified' | 'Pending' | 'Rejected'>('ALL');

  // Add Driver Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLic, setNewLic] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleAddDriver = () => {
    if (!newName || !newLic || !newPhone) {
      alert('Please complete all driver details.');
      return;
    }
    const created: Driver = {
      id: `D-0${drivers.length + 1}`,
      name: newName,
      licenseNumber: newLic,
      phone: newPhone,
      verificationStatus: 'Pending',
      documents: {
        dl: '2029-12-31',
        aadhaarStatus: 'Pending',
        medicalCertStatus: 'Pending',
      },
    };
    setDrivers([created, ...drivers]);
    initialDrivers.unshift(created);
    setShowAddModal(false);
    setNewName(''); setNewLic(''); setNewPhone('');
    alert(`Driver ${created.name} added to roster and sent to Verification Workbench!`);
  };

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || d.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="vp-driver-list" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="vp-page-header">
        <div>
          <div className="vp-page-title">
            <Users color="var(--vendor-accent)" /> Driver Management (UI Spec V-06)
          </div>
          <div className="vp-page-subtitle">
            Manage your driver roster, monitor Driving License (DL), Aadhaar, Medical Certs, and track background verification states.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="vp-btn vp-btn-secondary" onClick={() => navigate('/vendor/drivers/verification')}>
            <UserCheck size={16} /> Verification Workbench
          </button>
          <button className="vp-btn vp-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add New Driver
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-3)' }} />
          <input
            type="text"
            placeholder="Search driver name, license, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="vp-input"
            style={{ paddingLeft: 36, width: 300 }}
          />
        </div>

        <div className="vp-tabs" style={{ marginBottom: 0 }}>
          <button className={`vp-tab ${statusFilter === 'ALL' ? 'active' : ''}`} onClick={() => setStatusFilter('ALL')}>
            All Drivers ({drivers.length})
          </button>
          <button className={`vp-tab ${statusFilter === 'Verified' ? 'active' : ''}`} onClick={() => setStatusFilter('Verified')}>
            Verified ({drivers.filter((d) => d.verificationStatus === 'Verified').length})
          </button>
          <button className={`vp-tab ${statusFilter === 'Pending' ? 'active' : ''}`} onClick={() => setStatusFilter('Pending')}>
            Pending ({drivers.filter((d) => d.verificationStatus === 'Pending').length})
          </button>
          <button className={`vp-tab ${statusFilter === 'Rejected' ? 'active' : ''}`} onClick={() => setStatusFilter('Rejected')}>
            Rejected ({drivers.filter((d) => d.verificationStatus === 'Rejected').length})
          </button>
        </div>
      </div>

      {/* Driver List Table */}
      <div className="vp-table-wrap">
        <table className="vp-table">
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>DL Number</th>
              <th>Contact Phone</th>
              <th>Verification Status</th>
              <th>Assigned Vehicle</th>
              <th>Documents</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map((driver) => (
              <tr key={driver.id}>
                <td style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--vendor-accent-light)',
                      color: 'var(--vendor-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {driver.name[0]}
                  </div>
                  {driver.name}
                </td>
                <td style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>{driver.licenseNumber}</td>
                <td>{driver.phone}</td>
                <td>
                  <span
                    className={`vp-badge ${
                      driver.verificationStatus === 'Verified'
                        ? 'vp-badge-success'
                        : driver.verificationStatus === 'Pending'
                        ? 'vp-badge-warning'
                        : 'vp-badge-danger'
                    }`}
                  >
                    {driver.verificationStatus}
                  </span>
                </td>
                <td>
                  {driver.assignedVehicle ? (
                    <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{driver.assignedVehicle}</span>
                  ) : (
                    <span style={{ color: 'var(--text-3)', fontSize: 12 }}>Unassigned</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span className="vp-badge vp-badge-info" style={{ fontSize: 9 }}>DL Valid</span>
                    <span className={`vp-badge ${driver.documents.aadhaarStatus === 'Verified' ? 'vp-badge-success' : 'vp-badge-warning'}`} style={{ fontSize: 9 }}>Aadhaar</span>
                  </div>
                </td>
                <td>
                  <button
                    className="vp-btn vp-btn-secondary"
                    style={{ padding: '4px 10px', fontSize: 11 }}
                    onClick={() => navigate(`/vendor/drivers/${driver.id}`)}
                  >
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD DRIVER MODAL */}
      {showAddModal && (
        <div className="vp-modal-overlay">
          <div className="vp-modal">
            <div className="vp-modal-header">
              <div className="vp-modal-title">Add Driver to Roster</div>
              <button className="adm-icon-btn" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <div className="vp-form-group">
              <label className="vp-label">Driver Full Name:</label>
              <input
                type="text"
                className="vp-input"
                placeholder="Ramesh Kumar"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="vp-form-group">
              <label className="vp-label">Driving License Number:</label>
              <input
                type="text"
                className="vp-input"
                placeholder="MH-1220180098441"
                value={newLic}
                onChange={(e) => setNewLic(e.target.value)}
              />
            </div>

            <div className="vp-form-group">
              <label className="vp-label">Phone Contact Number:</label>
              <input
                type="text"
                className="vp-input"
                placeholder="+91 98765 43210"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="vp-btn vp-btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="vp-btn vp-btn-primary" onClick={handleAddDriver}>
                Save & Submit for Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
