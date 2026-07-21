import React, { useState } from 'react';
import { Upload, ShieldCheck, AlertTriangle, Check, X, RefreshCw, Layers } from 'lucide-react';
import { Panel, Badge, Button, useToast } from '../../components/admin/ui';

interface OCRDoc {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  confidence: number;
  status: 'Matched' | 'Discrepancy' | 'Failed' | 'Pending Review';
  ocrFields: Record<string, string>;
  dbFields: Record<string, string>;
}

const OCR_HISTORY: OCRDoc[] = [
  {
    id: 'OCR-912',
    name: 'ICICI_Lombard_Insurance_MH43.pdf',
    type: 'Insurance Policy',
    uploadedAt: '2026-07-20 14:32',
    confidence: 98.6,
    status: 'Matched',
    ocrFields: {
      'Policy Number': 'INS-990-2210-44',
      'Insurer': 'ICICI Lombard Gen Insurance',
      'Effective Date': '2026-07-21',
      'Expiry Date': '2027-07-20',
      'IDV Amount': '₹14,50,000'
    },
    dbFields: {
      'Policy Number': 'INS-990-2210-44',
      'Insurer': 'ICICI Lombard Gen Insurance',
      'Effective Date': '2026-07-21',
      'Expiry Date': '2027-07-20',
      'IDV Amount': '₹14,50,000'
    }
  },
  {
    id: 'OCR-911',
    name: 'Fitness_Cert_Delhi_DL01.jpg',
    type: 'Fitness Certificate',
    uploadedAt: '2026-07-19 11:15',
    confidence: 94.2,
    status: 'Discrepancy',
    ocrFields: {
      'Certificate Serial': 'FIT-88910-RTO-DEL',
      'Effective Date': '2026-09-06',
      'Expiry Date': '2027-09-05',
      'RTO Office': 'Delhi RTO Zone-02'
    },
    dbFields: {
      'Certificate Serial': 'FIT-88910-DEL',
      'Effective Date': '2026-09-06',
      'Expiry Date': '2027-09-05',
      'RTO Office': 'Delhi South RTO'
    }
  },
  {
    id: 'OCR-910',
    name: 'PUC_Valid_NCR_HR55.png',
    type: 'PUC Certificate',
    uploadedAt: '2026-07-18 09:44',
    confidence: 96.5,
    status: 'Matched',
    ocrFields: {
      'Certificate ID': 'PUC-887719-X',
      'Expiry Date': '2026-08-31',
      'Co2 Reading': '0.12 % vol'
    },
    dbFields: {
      'Certificate ID': 'PUC-887719-X',
      'Expiry Date': '2026-08-31',
      'Co2 Reading': '0.12 % vol'
    }
  }
];

export const OCRVerification: React.FC = () => {
  const { notify } = useToast();
  const [history, setHistory] = useState<OCRDoc[]>(OCR_HISTORY);
  const [selectedId, setSelectedId] = useState<string>('OCR-911');
  const [uploading, setUploading] = useState(false);

  const selectedDoc = history.find(d => d.id === selectedId) || history[0];

  const handleSimulateUpload = () => {
    setUploading(true);
    setTimeout(() => {
      const newDoc: OCRDoc = {
        id: `OCR-${Math.floor(913 + Math.random() * 80)}`,
        name: 'Road_Permit_National_GJ01.pdf',
        type: 'Road Permit',
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        confidence: 95.8,
        status: 'Pending Review',
        ocrFields: {
          'Permit Number': 'PERMIT-GJ-8877-K',
          'Permit Type': 'National Goods Permit',
          'Expiry Date': '2028-07-21',
          'Authorizing Body': 'Gujarat Transport Dept'
        },
        dbFields: {
          'Permit Number': '',
          'Permit Type': '',
          'Expiry Date': '',
          'Authorizing Body': ''
        }
      };

      setHistory([newDoc, ...history]);
      setSelectedId(newDoc.id);
      setUploading(false);
      notify('success', 'Document uploaded and parsed successfully. Values queued for verification.');
    }, 1500);
  };

  const handleVerify = (id: string, approve: boolean) => {
    setHistory(history.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: approve ? 'Matched' : 'Discrepancy',
          // Align dbFields on approval
          dbFields: approve ? { ...d.ocrFields } : d.dbFields
        };
      }
      return d;
    }));
    notify('success', approve ? 'Values matched and marked as verified in system DB' : 'Discrepancy flagged. Task routed back to administrative queue.');
  };

  const getStatusTone = (status: string) => {
    if (status === 'Matched') return 'green';
    if (status === 'Discrepancy') return 'amber';
    if (status === 'Failed') return 'red';
    return 'blue';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>OCR Document Verification Center</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
          Compare parsed OCR certificate values side-by-side with database mappings and resolve discrepancies.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left column: Upload and Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Upload panel */}
          <Panel title="Upload Statutory Scans" subtitle="Drag any compliance certificate for automated parse">
            <div style={{
              border: '2px dashed var(--border)',
              padding: 24,
              borderRadius: 8,
              textAlign: 'center',
              backgroundColor: 'var(--panel-2)',
              cursor: 'pointer'
            }}>
              <Upload size={32} style={{ color: 'var(--text-3)', marginBottom: 12, marginLeft: 'auto', marginRight: 'auto' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Drag PDF or images here</div>
              <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '4px 0 16px 0' }}>Supports Fitness, Insurance, Permit & PUC formats up to 15MB</p>
              
              <Button variant="primary" style={{ width: '100%' }} onClick={handleSimulateUpload} disabled={uploading}>
                {uploading ? (
                  <>
                    <RefreshCw size={14} className="adm-spin" style={{ marginRight: 6 }} />
                    Running OCR Bounding Engine...
                  </>
                ) : 'Select & Scan Document'}
              </Button>
            </div>
          </Panel>

          {/* Verification queue */}
          <Panel title="OCR Processing Queue" padded={false}>
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 400, overflowY: 'auto' }}>
              {history.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedId(doc.id)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-soft)',
                    cursor: 'pointer',
                    backgroundColor: doc.id === selectedId ? 'var(--panel-2)' : 'transparent',
                    borderLeft: doc.id === selectedId ? '3px solid var(--green)' : '3px solid transparent',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 220 }}>
                      {doc.name}
                    </strong>
                    <Badge tone={getStatusTone(doc.status)}>{doc.status}</Badge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)' }}>
                    <span>Type: <strong>{doc.type}</strong></span>
                    <span>Confidence: <strong style={{ color: doc.confidence >= 95 ? 'var(--green)' : 'var(--amber)' }}>{doc.confidence}%</strong></span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 6, display: 'flex', justifySelf: 'flex-end' }}>
                    Uploaded: {doc.uploadedAt}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Right column: Document details side-by-side */}
        {selectedDoc ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* OCR Main View */}
            <Panel padded={false}>
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--border-soft)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--panel-2)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>PARSING METADATA FOR: {selectedDoc.id}</span>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{selectedDoc.name}</h3>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Confidence Score:</span>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    backgroundColor: selectedDoc.confidence >= 95 ? 'var(--green-glow)' : 'rgba(232, 163, 61, 0.08)',
                    color: selectedDoc.confidence >= 95 ? 'var(--green)' : 'var(--amber)',
                    fontWeight: 700,
                    fontSize: 13,
                    border: `1px solid ${selectedDoc.confidence >= 95 ? 'rgba(46, 204, 113, 0.2)' : 'rgba(232, 163, 61, 0.2)'}`
                  }}>
                    {selectedDoc.confidence}%
                  </div>
                </div>
              </div>

              <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Visual crop scanner */}
                <Panel title="Scanned Bounding Box Mapping" padded={false} style={{ height: '100%', backgroundColor: 'var(--void)' }}>
                  <div style={{
                    padding: 30,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 320,
                    color: 'var(--text-3)'
                  }}>
                    {/* Simulated document layout */}
                    <div style={{
                      width: 200,
                      height: 260,
                      backgroundColor: 'var(--panel)',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      padding: 16,
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}>
                      <div style={{ width: '100%', height: 16, backgroundColor: 'var(--border-soft)', borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <span style={{ fontSize: 7, fontWeight: 700, color: 'var(--text-3)' }}>GOVERNMENT REGISTRY</span>
                      </div>
                      
                      {/* Bounding box simulators */}
                      <div style={{
                        marginTop: 10,
                        width: '90%',
                        height: 14,
                        border: '1px solid var(--green)',
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        position: 'relative'
                      }}>
                        <span style={{ position: 'absolute', top: -14, left: 0, fontSize: 6, color: 'var(--green)', fontWeight: 700 }}>99.2% MATCH</span>
                      </div>
                      <div style={{
                        width: '70%',
                        height: 14,
                        border: '1px solid var(--green)',
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        position: 'relative'
                      }}>
                        <span style={{ position: 'absolute', top: -14, left: 0, fontSize: 6, color: 'var(--green)', fontWeight: 700 }}>98.6% MATCH</span>
                      </div>
                      <div style={{
                        width: '80%',
                        height: 14,
                        border: selectedDoc.status === 'Discrepancy' ? '1px solid var(--amber)' : '1px solid var(--green)',
                        backgroundColor: selectedDoc.status === 'Discrepancy' ? 'rgba(232, 163, 61, 0.1)' : 'rgba(46, 204, 113, 0.1)',
                        position: 'relative',
                        marginTop: 10
                      }}>
                        <span style={{ position: 'absolute', top: -14, left: 0, fontSize: 6, color: selectedDoc.status === 'Discrepancy' ? 'var(--amber)' : 'var(--green)', fontWeight: 700 }}>
                          {selectedDoc.status === 'Discrepancy' ? '82.4% WARNING' : '96.2% MATCH'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 4, width: '100%', marginTop: 'auto' }}>
                        <div style={{ flex: 1, height: 10, backgroundColor: 'var(--border-soft)', borderRadius: 1 }} />
                        <div style={{ flex: 2, height: 10, backgroundColor: 'var(--border-soft)', borderRadius: 1 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Layers size={11} /> Green highlight indicates high-confidence OCR extract.
                    </span>
                  </div>
                </Panel>

                {/* Side-by-side fields comparator */}
                <Panel title="Data Comparison Checklist" subtitle="Compare Extracted Value vs. Manual DB record">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {Object.keys(selectedDoc.ocrFields).map((key) => {
                        const ocrVal = selectedDoc.ocrFields[key];
                        const dbVal = selectedDoc.dbFields[key];
                        const matches = ocrVal.toLowerCase() === dbVal.toLowerCase();

                        return (
                          <div 
                            key={key}
                            style={{
                              padding: 12,
                              backgroundColor: 'var(--panel-2)',
                              borderRadius: 6,
                              border: '1px solid var(--border-soft)'
                            }}
                          >
                            <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>
                              {key.toUpperCase()}
                            </span>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontSize: 10, color: 'var(--text-3)', display: 'block' }}>OCR Parsed:</span>
                                <strong style={{ fontSize: 13, color: 'var(--text-1)' }}>{ocrVal}</strong>
                              </div>
                              <div style={{ width: 1, height: 28, backgroundColor: 'var(--border)' }} />
                              <div style={{ flex: 1 }}>
                                <span style={{ fontSize: 10, color: 'var(--text-3)', display: 'block' }}>Manual Entry:</span>
                                <strong style={{ fontSize: 13, color: dbVal ? 'var(--text-2)' : 'var(--red)' }}>
                                  {dbVal || 'Empty'}
                                </strong>
                              </div>
                              <div>
                                {dbVal ? (
                                  matches ? (
                                    <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'var(--green-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
                                      <Check size={12} />
                                    </div>
                                  ) : (
                                    <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'rgba(232, 163, 61, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)' }} title="Discrepancy">
                                      <AlertTriangle size={12} />
                                    </div>
                                  )
                                ) : (
                                  <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'rgba(229, 72, 77, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)' }} title="Unlinked Field">
                                    <X size={12} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedDoc.status === 'Discrepancy' && (
                      <div style={{ display: 'flex', gap: 8, backgroundColor: 'rgba(232, 163, 61, 0.08)', padding: 10, borderRadius: 6, border: '1px solid rgba(232, 163, 61, 0.2)', fontSize: 12 }}>
                        <AlertTriangle size={15} color="var(--amber)" style={{ flexShrink: 0, marginTop: 1 }} />
                        <span style={{ color: 'var(--text-2)' }}>
                          <strong>Discrepancy detected:</strong> Serial/Office value mismatched. Verify which value is correct.
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid var(--border-soft)', paddingTop: 16 }}>
                      <Button variant="danger" icon={<X size={14} style={{ marginRight: 4 }} />} onClick={() => handleVerify(selectedDoc.id, false)}>
                        Flag Discrepancy
                      </Button>
                      <Button variant="primary" icon={<ShieldCheck size={14} style={{ marginRight: 4 }} />} onClick={() => handleVerify(selectedDoc.id, true)}>
                        Approve & Map Values
                      </Button>
                    </div>
                  </div>
                </Panel>
              </div>
            </Panel>
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
            Select an OCR queue item to view.
          </div>
        )}
      </div>
    </div>
  );
};
