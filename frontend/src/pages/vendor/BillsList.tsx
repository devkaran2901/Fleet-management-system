import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Eye } from 'lucide-react';
import { initialBills } from './vendorDataStore';
import type { Bill } from './vendorDataStore';
import '../../styles/vendor.css';

export const BillsList: React.FC = () => {
  const navigate = useNavigate();
  const [bills] = useState<Bill[]>(initialBills);
  const [activeTab, setActiveTab] = useState<'ALL' | Bill['status']>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const totalApproved = bills.filter((b) => b.status === 'Approved' || b.status === 'Paid').reduce((s, b) => s + b.submittedAmount, 0);
  const totalPending = bills.filter((b) => ['Submitted', 'Under Verification', 'Deviation Found'].includes(b.status)).reduce((s, b) => s + b.submittedAmount, 0);

  const filteredBills = bills.filter((b) => {
    const matchTab = activeTab === 'ALL' || b.status === activeTab;
    const matchSearch =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  const statusBadge = (status: Bill['status']) => {
    const map: Record<string, string> = {
      Draft: 'vp-badge-info',
      Submitted: 'vp-badge-purple',
      'Under Verification': 'vp-badge-warning',
      'Deviation Found': 'vp-badge-danger',
      Approved: 'vp-badge-success',
      Paid: 'vp-badge-success',
    };
    return map[status] || 'vp-badge-info';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="vp-page-header">
        <div>
          <div className="vp-page-title">
            <FileText color="var(--vendor-accent)" /> Bills Workbench
          </div>
          <div className="vp-page-subtitle">
            Manage all freight invoices from draft through submission, verification, deviation resolution, and final payment.
          </div>
        </div>
        <button className="vp-btn vp-btn-primary" onClick={() => navigate('/vendor/bills/new')}>
          <Plus size={16} /> Create New Bill
        </button>
      </div>

      {/* Summary Strip */}
      <div className="vp-grid-3">
        <div className="vp-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>TOTAL BILLED (APPROVED)</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--vendor-accent)', marginTop: 4, fontFamily: 'JetBrains Mono' }}>
            ₹{totalApproved.toLocaleString()}
          </div>
        </div>
        <div className="vp-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>UNDER REVIEW / PENDING</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--vendor-warning)', marginTop: 4, fontFamily: 'JetBrains Mono' }}>
            ₹{totalPending.toLocaleString()}
          </div>
        </div>
        <div className="vp-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>TOTAL BILLS</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)', marginTop: 4, fontFamily: 'JetBrains Mono' }}>
            {bills.length}
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-3)' }} />
          <input
            type="text"
            placeholder="Search Bill ID or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="vp-input"
            style={{ paddingLeft: 36, width: 280 }}
          />
        </div>

        <div className="vp-tabs" style={{ marginBottom: 0 }}>
          {(['ALL', 'Draft', 'Submitted', 'Under Verification', 'Deviation Found', 'Approved', 'Paid'] as const).map((t) => (
            <button key={t} className={`vp-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Bills Table */}
      <div className="vp-table-wrap">
        <table className="vp-table">
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Customer</th>
              <th>Route</th>
              <th>Vehicle</th>
              <th>Expected Amount</th>
              <th>Submitted Amount</th>
              <th>Difference</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map((bill) => (
              <tr key={bill.id}>
                <td style={{ fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{bill.id}</td>
                <td>{bill.customer}</td>
                <td style={{ fontSize: 12 }}>{bill.route}</td>
                <td style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>{bill.vehicleNumber}</td>
                <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-1)', fontWeight: 600 }}>
                  ₹{bill.expectedAmount.toLocaleString()}
                </td>
                <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: bill.submittedAmount > bill.expectedAmount ? 'var(--vendor-warning)' : 'var(--vendor-accent)' }}>
                  ₹{bill.submittedAmount.toLocaleString()}
                </td>
                <td>
                  {bill.difference !== 0 ? (
                    <span className="vp-badge vp-badge-danger">
                      +₹{Math.abs(bill.difference).toLocaleString()} deviation
                    </span>
                  ) : (
                    <span className="vp-badge vp-badge-success" style={{ fontSize: 9 }}>No Deviation</span>
                  )}
                </td>
                <td>
                  <span className={`vp-badge ${statusBadge(bill.status)}`}>{bill.status}</span>
                </td>
                <td>
                  <button
                    className="vp-btn vp-btn-secondary"
                    style={{ padding: '4px 10px', fontSize: 11 }}
                    onClick={() => navigate(`/vendor/bills/${bill.id}`)}
                  >
                    <Eye size={13} /> Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
