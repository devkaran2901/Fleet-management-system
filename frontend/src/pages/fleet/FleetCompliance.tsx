import React, { useEffect, useState } from 'react';
import { 
  Upload, Sparkles
} from 'lucide-react';
import { Panel, Badge, Button, LoadingState, useToast } from '../../components/admin/ui';
import '../../styles/admin.css';

export const FleetCompliance: React.FC = () => {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'matrix' | 'renewals' | 'challans'>('matrix');

  // Document upload sim state
  const [uploading, setUploading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  const handleSimulateOCR = () => {
    setUploading(true);
    setOcrResult(null);
    setTimeout(() => {
      setUploading(false);
      setOcrResult({
        extracted: {
          policyNumber: 'INS-990-2210-44',
          idv: '₹14,50,000',
          expiryDate: '2027-07-20',
          insurer: 'ICICI Lombard General Insurance',
          confidence: '98.5%'
        }
      });
      notify('success', 'Document OCR extraction completed successfully!');
    }, 1000);
  };

  const handleApproveDocument = () => {
    notify('success', 'Insurance document verified and updated in database');
    setOcrResult(null);
  };

  if (loading) {
    return <LoadingState label="Loading Compliance Center" />;
  }

  const complianceMatrix = [
    { vehicle: 'DL-01-MA-1234', fitness: true, insurance: true, tax: true, permit: true, puc: true },
    { vehicle: 'DL-01-MB-5678', fitness: true, insurance: true, tax: true, permit: true, puc: true },
    { vehicle: 'HR-55-A-9901', fitness: true, insurance: true, tax: true, permit: true, puc: true },
    { vehicle: 'MH-12-PQ-4321', fitness: true, insurance: true, tax: true, permit: true, puc: true },
    { vehicle: 'GJ-01-XX-1122', fitness: true, insurance: true, tax: true, permit: true, puc: false }, // PM/PUC warning
    { vehicle: 'DL-02-C-8877', fitness: true, insurance: false, tax: true, permit: true, puc: true }, // insurance expired
    { vehicle: 'UP-16-T-3344', fitness: true, insurance: true, tax: true, permit: true, puc: true },
    { vehicle: 'HR-38-Y-7788', fitness: true, insurance: true, tax: true, permit: true, puc: true },
    { vehicle: 'MH-43-R-8899', fitness: true, insurance: true, tax: true, permit: true, puc: true },
    { vehicle: 'DL-01-MC-9012', fitness: true, insurance: true, tax: true, permit: true, puc: false }
  ];

  const challans = [
    { id: 'CH-99120', vehicle: 'MH-43-R-8899', type: 'Overspeeding', amount: '₹2,000', date: '2026-07-15', status: 'Unpaid', details: 'NH-48 Corridor radar flash' },
    { id: 'CH-99081', vehicle: 'GJ-01-XX-1122', type: 'No Entry Violation', amount: '₹5,000', date: '2026-07-12', status: 'Contested', details: 'Jaipur city bypass restriction' },
    { id: 'CH-98776', vehicle: 'DL-01-MA-1234', type: 'Lane Discipline', amount: '₹1,000', date: '2026-07-08', status: 'Paid', details: 'Delhi Ring Road CCTV clip' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>Compliance Control Center</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>Monitor statutory document calendars, verify uploads, and check challans.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-soft)', paddingBottom: 1 }}>
        <button 
          onClick={() => setActiveTab('matrix')}
          style={{
            padding: '10px 16px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'matrix' ? '2px solid var(--green)' : 'none',
            color: activeTab === 'matrix' ? 'var(--text-1)' : 'var(--text-3)',
            fontWeight: activeTab === 'matrix' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          Expiry Matrix
        </button>
        <button 
          onClick={() => setActiveTab('renewals')}
          style={{
            padding: '10px 16px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'renewals' ? '2px solid var(--green)' : 'none',
            color: activeTab === 'renewals' ? 'var(--text-1)' : 'var(--text-3)',
            fontWeight: activeTab === 'renewals' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          Document Renewals (OCR)
        </button>
        <button 
          onClick={() => setActiveTab('challans')}
          style={{
            padding: '10px 16px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'challans' ? '2px solid var(--green)' : 'none',
            color: activeTab === 'challans' ? 'var(--text-1)' : 'var(--text-3)',
            fontWeight: activeTab === 'challans' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          Challans ({challans.filter(c => c.status === 'Unpaid').length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'matrix' && (
        <Panel title="Statutory Expiry Grid (Fitness, Insurance, PUC, Tax, Permit)">
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-soft)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>VEHICLE NUMBER</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>FITNESS</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>INSURANCE</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>TAX</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>ROAD PERMIT</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>PUC STATUS</th>
                </tr>
              </thead>
              <tbody>
                {complianceMatrix.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{item.vehicle}</td>
                    <td style={{ padding: '12px 16px' }}><Badge tone={item.fitness ? 'green' : 'red'}>{item.fitness ? 'Verified' : 'Expired'}</Badge></td>
                    <td style={{ padding: '12px 16px' }}><Badge tone={item.insurance ? 'green' : 'red'}>{item.insurance ? 'Verified' : 'Expired'}</Badge></td>
                    <td style={{ padding: '12px 16px' }}><Badge tone={item.tax ? 'green' : 'red'}>{item.tax ? 'Verified' : 'Expired'}</Badge></td>
                    <td style={{ padding: '12px 16px' }}><Badge tone={item.permit ? 'green' : 'red'}>{item.permit ? 'Verified' : 'Expired'}</Badge></td>
                    <td style={{ padding: '12px 16px' }}><Badge tone={item.puc ? 'green' : 'red'}>{item.puc ? 'Verified' : 'Expired'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {activeTab === 'renewals' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Document upload side */}
          <Panel title="Upload Certificate & OCR Parse">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', justifyContent: 'center', padding: '40px 20px', border: '2px dashed var(--border-soft)', borderRadius: 8, backgroundColor: 'var(--panel-2)' }}>
              <Upload size={32} color="var(--text-3)" />
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Drag document here or click to select</span>
                <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '4px 0 0 0' }}>Supports PDF, JPG and PNG up to 10MB. Autofills insurance or fitness details.</p>
              </div>
              <Button variant="primary" onClick={handleSimulateOCR} disabled={uploading}>
                {uploading ? 'Processing OCR extraction...' : 'Simulate Insurance Upload'}
              </Button>
            </div>
          </Panel>

          {/* OCR Result verification panel */}
          <Panel title="OCR Verification Checklist">
            {ocrResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'var(--panel-green)', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border-green)' }}>
                  <Sparkles size={16} color="var(--green)" />
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>Confidence score: {ocrResult.extracted.confidence}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, backgroundColor: 'var(--panel-2)', padding: 16, borderRadius: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-3)', fontSize: 12 }}>INSURER NAME</span>
                    <strong style={{ fontSize: 13 }}>{ocrResult.extracted.insurer}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-3)', fontSize: 12 }}>POLICY NUMBER</span>
                    <strong style={{ fontSize: 13 }}>{ocrResult.extracted.policyNumber}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-3)', fontSize: 12 }}>DECLARED VALUE (IDV)</span>
                    <strong style={{ fontSize: 13 }}>{ocrResult.extracted.idv}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-3)', fontSize: 12 }}>EXPIRY DATE</span>
                    <strong style={{ fontSize: 13 }}>{ocrResult.extracted.expiryDate}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid var(--border-soft)', paddingTop: 16 }}>
                  <Button variant="subtle" onClick={() => setOcrResult(null)}>Reject</Button>
                  <Button variant="primary" onClick={handleApproveDocument}>Approve & Save</Button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px' }}>
                Upload a document to parse key fields
              </div>
            )}
          </Panel>
        </div>
      )}

      {activeTab === 'challans' && (
        <Panel title="Traffic Challan Resolution Workbench">
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-soft)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>CHALLAN ID</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>VEHICLE</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>VIOLATION TYPE</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>AMOUNT</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>DATE</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>STATUS</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 12 }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{c.id}</td>
                    <td style={{ padding: '12px 16px' }}>{c.vehicle}</td>
                    <td style={{ padding: '12px 16px' }}>{c.type} <br/><span style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.details}</span></td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{c.amount}</td>
                    <td style={{ padding: '12px 16px' }}>{c.date}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge tone={c.status === 'Paid' ? 'green' : (c.status === 'Contested' ? 'blue' : 'red')}>
                        {c.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {c.status === 'Unpaid' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button size="sm" variant="primary" onClick={() => notify('success', `Payment released for challan ${c.id}`)}>Pay</Button>
                          <Button size="sm" variant="subtle" onClick={() => notify('info', `Challan ${c.id} marked as contested`)}>Contest</Button>
                        </div>
                      )}
                      {c.status !== 'Unpaid' && (
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
};
