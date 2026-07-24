import React, { useState } from 'react';
import { initialExpenseClaims } from './driverDataStore';
import type { ExpenseClaim } from './driverDataStore';
import {
  Receipt,
  Plus,
  CheckCircle,
  FileText,
  X,
  Camera,
} from 'lucide-react';

export const ExpenseClaims: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseClaim[]>(initialExpenseClaims);
  const [showNewModal, setShowNewModal] = useState(false);

  const [type, setType] = useState<'Fuel' | 'Toll' | 'Parking' | 'Food' | 'Repair' | 'Miscellaneous'>('Fuel');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [receiptUploaded, setReceiptUploaded] = useState<string | null>(null);

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    const newClaim: ExpenseClaim = {
      id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      expenseId: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      type,
      amount: parseFloat(amount),
      date,
      description,
      receiptUrl: receiptUploaded || 'receipt-bill-scan.jpg',
      status: 'Pending',
    };

    setExpenses((prev) => [newClaim, ...prev]);
    setShowNewModal(false);
    setAmount('');
    setDescription('');
    setReceiptUploaded(null);
    alert('Expense claim submitted successfully for approval.');
  };

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text-1)' }}>En-Route Expense Claims</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-2)' }}>
            Submit fuel, toll, parking, food & emergency repair receipts for quick reimbursement.
          </p>
        </div>
        <button className="driver-btn-primary" onClick={() => setShowNewModal(true)}>
          <Plus size={16} /> New Expense Claim
        </button>
      </div>

      {/* Expense History Table */}
      <div className="driver-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-soft)', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Receipt color="var(--green)" size={18} /> EXPENSE CLAIM HISTORY & APPROVAL STATUS
        </div>

        <table className="driver-table">
          <thead>
            <tr>
              <th>Expense ID</th>
              <th>Category Type</th>
              <th>Amount (₹)</th>
              <th>Claim Date</th>
              <th>Description</th>
              <th>Receipt</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id}>
                <td>
                  <span style={{ fontWeight: 800, color: 'var(--text-1)' }}>{exp.expenseId}</span>
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: 'var(--green)' }}>{exp.type}</span>
                </td>
                <td style={{ fontWeight: 800, color: 'var(--text-1)' }}>₹{exp.amount.toLocaleString()}</td>
                <td>{exp.date}</td>
                <td style={{ maxWidth: 300 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-1)' }}>{exp.description}</div>
                </td>
                <td>
                  {exp.receiptUrl ? (
                    <span style={{ color: '#3B82F6', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FileText size={13} /> {exp.receiptUrl}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-2)', fontSize: 12 }}>No receipt</span>
                  )}
                </td>
                <td>
                  <span
                    className={`driver-status-pill ${
                      exp.status === 'Approved'
                        ? 'approved'
                        : exp.status === 'Rejected'
                        ? 'rejected'
                        : 'pending'
                    }`}
                  >
                    {exp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showNewModal && (
        <div className="driver-modal-overlay">
          <div className="driver-modal" style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Receipt color="var(--green)" size={22} />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Submit New Expense Claim</h3>
              </div>
              <button onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitClaim}>
              <div className="driver-form-group">
                <label>Expense Category Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)}>
                  <option value="Fuel">⛽ Fuel / Diesel</option>
                  <option value="Toll">🛣️ Toll Plaza / Fastag Cash</option>
                  <option value="Parking">🅿️ Truck Parking Fee</option>
                  <option value="Food">🍲 Food / Daily Allowance</option>
                  <option value="Repair">🛠️ Emergency Vehicle Repair</option>
                  <option value="Miscellaneous">📦 Miscellaneous / Loading Support</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="driver-form-group">
                  <label>Amount (₹ INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="driver-form-group">
                  <label>Expense Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="driver-form-group">
                <label>Expense Description</label>
                <textarea
                  rows={3}
                  placeholder="Enter details like pump name, toll plaza location, puncture repair..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="driver-form-group">
                <label>Bill / Receipt Upload</label>
                <button
                  type="button"
                  className="driver-btn-secondary"
                  onClick={() => setReceiptUploaded('receipt-bill-photo.jpg')}
                  style={{ width: '100%', fontSize: 13, justifyContent: 'center' }}
                >
                  <Camera size={16} /> {receiptUploaded ? 'Bill Receipt Uploaded ✓' : 'Upload Receipt Photo'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" className="driver-btn-secondary" onClick={() => setShowNewModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="driver-btn-primary">
                  <CheckCircle size={16} /> Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
