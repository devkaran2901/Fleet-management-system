import React, { useEffect, useState } from 'react';
import { Eye, Send, Download, Filter, RefreshCw } from 'lucide-react';
import { financeApi } from '../../services/financeApi';
import type { CustomerInvoiceRecord } from '../../services/financeApi';
import { Panel, Button, Badge, Input, Select, Modal, LoadingState, ErrorState, useToast } from '../../components/admin/ui';

export const CustomerInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<CustomerInvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoiceRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useToast();

  // Filters
  const [customerFilter, setCustomerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.getCustomerInvoices({
        customer: customerFilter || undefined,
        status: statusFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined,
      });
      setInvoices(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load customer invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [customerFilter, statusFilter, paymentStatusFilter]);

  const handleRelease = async (id: string) => {
    try {
      setSubmitting(true);
      await financeApi.releaseCustomerInvoice(id);
      notify('success', 'Customer invoice released successfully');
      loadInvoices();
      if (selectedInvoice?.id === id) {
        setSelectedInvoice(null);
      }
    } catch (err: any) {
      notify('error', err?.message || 'Failed to release customer invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async (id: string) => {
    try {
      const data = await financeApi.exportCustomerInvoice(id);
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Customer_Invoice_${data.invoiceNumber}.json`;
      a.click();
      URL.revokeObjectURL(url);
      notify('success', `Exported Customer Invoice ${data.invoiceNumber}`);
    } catch (err: any) {
      notify('error', err?.message || 'Failed to export invoice');
    }
  };

  const parseJson = (val: any) => {
    if (!val) return [];
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return val;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
            Customer Invoices & Billing
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            POD-triggered invoicing, Annexure generation, GST treatment, and dispute management.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" icon={<RefreshCw size={14} />} onClick={loadInvoices}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Panel padded={false} style={{ backgroundColor: 'var(--panel-2)', border: '1px solid var(--border-soft)', padding: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={15} color="var(--text-3)" />
          <span className="mono-label" style={{ fontSize: 10 }}>FILTERS:</span>
          
          <Input
            placeholder="Search Customer..."
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            style={{ width: 180 }}
          />

          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 140 }}>
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Approved">Approved</option>
            <option value="Released">Released</option>
            <option value="Cancelled">Cancelled</option>
          </Select>

          <Select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)} style={{ width: 150 }}>
            <option value="">All Payment Status</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
            <option value="Disputed">Disputed</option>
          </Select>

          {(customerFilter || statusFilter || paymentStatusFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCustomerFilter('');
                setStatusFilter('');
                setPaymentStatusFilter('');
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </Panel>

      {/* Customer Invoices Table */}
      {loading ? (
        <LoadingState label="Loading Customer Invoices" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadInvoices} />
      ) : (
        <Panel padded={false}>
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Customer</th>
                  <th>Trips Included</th>
                  <th>Invoice Date</th>
                  <th>Invoice Amount</th>
                  <th>GST Amount</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Payment Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: 24, color: 'var(--text-3)' }}>
                      No customer invoices match the selected filters.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const tripsArr = parseJson(inv.tripsJson);
                    return (
                      <tr key={inv.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{inv.invoiceNumber}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500 }}>{inv.customer}</span>
                        </td>
                        <td>
                          <span className="mono-label" style={{ fontSize: 11 }}>
                            {Array.isArray(tripsArr) ? `${tripsArr.length} Trips (${tripsArr[0] || ''})` : '—'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 11 }}>{new Date(inv.invoiceDate).toLocaleDateString()}</span>
                        </td>
                        <td style={{ fontWeight: 600 }}>₹{inv.invoiceAmount.toLocaleString()}</td>
                        <td style={{ color: 'var(--text-3)' }}>₹{inv.gst.toLocaleString()}</td>
                        <td style={{ fontWeight: 700, color: 'var(--green)' }}>
                          ₹{(inv.invoiceAmount + inv.gst).toLocaleString()}
                        </td>
                        <td>
                          <Badge tone={inv.status === 'Released' ? 'green' : inv.status === 'Approved' ? 'blue' : 'amber'}>
                            {inv.status}
                          </Badge>
                        </td>
                        <td>
                          <Badge tone={inv.paymentStatus === 'Paid' ? 'green' : inv.paymentStatus === 'Disputed' ? 'red' : inv.paymentStatus === 'Partial' ? 'amber' : 'grey'}>
                            {inv.paymentStatus}
                          </Badge>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Eye size={13} />}
                              onClick={() => setSelectedInvoice(inv)}
                            >
                              View
                            </Button>
                            {inv.status !== 'Released' && (
                              <Button
                                variant="subtle"
                                size="sm"
                                icon={<Send size={13} />}
                                onClick={() => handleRelease(inv.id)}
                                disabled={submitting}
                              >
                                Release
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Download size={13} />}
                              onClick={() => handleExport(inv.id)}
                            >
                              Export
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Customer Invoice Detail Modal */}
      {selectedInvoice && (
        <Modal
          open={!!selectedInvoice}
          title={`Customer Invoice Details — ${selectedInvoice.invoiceNumber}`}
          subtitle={`Customer: ${selectedInvoice.customer}`}
          onClose={() => setSelectedInvoice(null)}
          wide
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button variant="ghost" onClick={() => setSelectedInvoice(null)}>Close</Button>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="ghost" icon={<Download size={14} />} onClick={() => handleExport(selectedInvoice.id)}>
                  Export Annexure
                </Button>
                {selectedInvoice.status !== 'Released' && (
                  <Button variant="primary" icon={<Send size={14} />} onClick={() => handleRelease(selectedInvoice.id)} disabled={submitting}>
                    Release Invoice
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Invoice Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>BASE FREIGHT</span>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, color: 'var(--text-1)' }}>
                  ₹{selectedInvoice.invoiceAmount.toLocaleString()}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>GST AMOUNT</span>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, color: 'var(--text-1)' }}>
                  ₹{selectedInvoice.gst.toLocaleString()}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>TOTAL INVOICE VALUE</span>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, color: 'var(--green)' }}>
                  ₹{(selectedInvoice.invoiceAmount + selectedInvoice.gst).toLocaleString()}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <span className="mono-label" style={{ fontSize: 9 }}>POD VERIFICATION</span>
                <div style={{ marginTop: 4 }}>
                  <Badge tone="green">POD Verified</Badge>
                </div>
              </div>
            </div>

            {/* Annexure & GST Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text-1)' }}>Invoice Annexure Summary</h4>
                {(() => {
                  const ann = typeof selectedInvoice.annexureJson === 'string' ? JSON.parse(selectedInvoice.annexureJson || '{}') : selectedInvoice.annexureJson;
                  return (
                    <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div>Total Distance: <strong>{ann?.totalKm} km</strong></div>
                      <div>Tonnage: <strong>{ann?.weightTons} Tons</strong></div>
                      <div>Ton-Km Rate: <strong>₹{ann?.ratePerTonKm}</strong></div>
                      <div>Fuel Price Index: <strong>{ann?.fuelPriceIndex}</strong></div>
                    </div>
                  );
                })()}
              </div>

              <div style={{ backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text-1)' }}>GST Details</h4>
                {(() => {
                  const gst = typeof selectedInvoice.gstFieldsJson === 'string' ? JSON.parse(selectedInvoice.gstFieldsJson || '{}') : selectedInvoice.gstFieldsJson;
                  return (
                    <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div>HSN/SAC Code: <strong>{gst?.hsnSac}</strong></div>
                      <div>GST Type: <strong>{gst?.gstType}</strong></div>
                      {gst?.cgst && <div>CGST + SGST: <strong>₹{gst.cgst} + ₹{gst.sgst}</strong></div>}
                      {gst?.igst && <div>IGST: <strong>₹{gst.igst}</strong></div>}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Disputed Lines */}
            {(() => {
              const disp = parseJson(selectedInvoice.disputedLinesJson);
              if (disp.length === 0) return null;
              return (
                <div>
                  <h4 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 6px 0', color: '#ef4444' }}>Disputed Invoice Lines</h4>
                  <div style={{ backgroundColor: 'var(--panel-2)', padding: 10, borderRadius: 6, border: '1px solid #ef4444' }}>
                    {disp.map((d: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span>Line #{d.lineNo} — {d.item} (Claimed: ₹{d.claimed}, Accepted: ₹{d.accepted})</span>
                        <Badge tone="red">{d.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Audit Trail */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-1)' }}>
                Audit Chain & Release History
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(parseJson(selectedInvoice.auditTrailJson) || []).map((a: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--panel-2)', borderRadius: 6, fontSize: 12 }}>
                    <span><strong>{a.action}</strong> by {a.user}</span>
                    <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>{a.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
