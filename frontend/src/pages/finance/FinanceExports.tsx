import React, { useEffect, useState } from 'react';
import { Download, Plus, RefreshCw } from 'lucide-react';
import { financeApi } from '../../services/financeApi';
import type { ErpExportRecord } from '../../services/financeApi';
import { Panel, Button, Badge, Select, Modal, LoadingState, ErrorState, useToast } from '../../components/admin/ui';

export const FinanceExports: React.FC = () => {
  const [exportsList, setExportsList] = useState<ErpExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerModal, setTriggerModal] = useState(false);
  const [entityType, setEntityType] = useState('General Ledger');
  const [format, setFormat] = useState<'SAP' | 'Oracle' | 'Tally' | 'Excel' | 'CSV' | 'PDF'>('SAP');
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useToast();

  const loadExports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeApi.getExports();
      setExportsList(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load ERP exports history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExports();
  }, []);

  const handleTriggerSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await financeApi.triggerErpExport({ entityType, format });
      notify('success', `Triggered ERP export ${res.exportNumber} (${format} format)`);
      setTriggerModal(false);
      loadExports();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to trigger ERP export');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = (exp: ErpExportRecord) => {
    const payload = {
      exportNumber: exp.exportNumber,
      entityType: exp.entityType,
      format: exp.format,
      recordCount: exp.recordCount,
      amountTotal: exp.amountTotal,
      exportedBy: exp.exportedBy,
      exportedAt: exp.createdAt,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exp.exportNumber}_${exp.format}.${exp.format.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
    notify('success', `Downloaded file ${exp.exportNumber}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
            ERP & Ledger Exports
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            ERP export history, format generation (SAP, Oracle, Tally, Excel, CSV, PDF), and export status.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" icon={<RefreshCw size={14} />} onClick={loadExports}>
            Refresh
          </Button>
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => setTriggerModal(true)}>
            Trigger New Export
          </Button>
        </div>
      </div>

      {/* Exports History Table */}
      {loading ? (
        <LoadingState label="Loading ERP Export Records" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadExports} />
      ) : (
        <Panel title="Export History & Status Audit" padded={false}>
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Export Number</th>
                  <th>Entity Type</th>
                  <th>Format</th>
                  <th>Record Count</th>
                  <th>Total Value</th>
                  <th>Exported By</th>
                  <th>Export Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exportsList.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: 24, color: 'var(--text-3)' }}>
                      No export records found.
                    </td>
                  </tr>
                ) : (
                  exportsList.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{e.exportNumber}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{e.entityType}</span>
                      </td>
                      <td>
                        <Badge tone={e.format === 'SAP' ? 'blue' : e.format === 'Oracle' ? 'amber' : e.format === 'Tally' ? 'green' : 'grey'}>
                          {e.format}
                        </Badge>
                      </td>
                      <td>{e.recordCount} Records</td>
                      <td style={{ fontWeight: 700 }}>₹{e.amountTotal.toLocaleString()}</td>
                      <td>
                        <span style={{ fontSize: 12 }}>{e.exportedBy}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 11 }}>{new Date(e.createdAt).toLocaleString()}</span>
                      </td>
                      <td>
                        <Badge tone={e.status === 'Completed' ? 'green' : 'red'}>{e.status}</Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Download size={13} />}
                          onClick={() => handleDownload(e)}
                        >
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Trigger Export Modal */}
      {triggerModal && (
        <Modal
          open={triggerModal}
          title="Trigger ERP Export File"
          subtitle="Generate ERP-native payload or financial export"
          onClose={() => setTriggerModal(false)}
          footer={
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setTriggerModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleTriggerSubmit} disabled={submitting}>
                Generate & Export
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 4 }}>
                Entity Type to Export
              </label>
              <Select value={entityType} onChange={(e) => setEntityType(e.target.value)}>
                <option value="General Ledger Recharges">General Ledger Recharges (BP-27)</option>
                <option value="AP Invoices">Accounts Payable (AP) Invoices</option>
                <option value="AR Invoices">Accounts Receivable (AR) Invoices</option>
                <option value="Driver Payroll">Driver Trip Payroll</option>
                <option value="Vendor Payment Batches">Vendor Payment Batches</option>
              </Select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 4 }}>
                Export Target Format
              </label>
              <Select value={format} onChange={(e) => setFormat(e.target.value as any)}>
                <option value="SAP">SAP iDoc / IDOC_ACC_INVOICE</option>
                <option value="Oracle">Oracle Fusion Financials XML</option>
                <option value="Tally">Tally ERP Prime XML</option>
                <option value="Excel">Excel Worksheet (.xlsx)</option>
                <option value="CSV">Comma-Separated Values (.csv)</option>
                <option value="PDF">PDF Summary Report (.pdf)</option>
              </Select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
