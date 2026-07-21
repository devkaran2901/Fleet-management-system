import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Upload, Sparkles, User, AlertCircle, 
  RefreshCw, CheckCircle
} from 'lucide-react';
import { Panel, Badge, Button, useToast } from '../../components/admin/ui';

interface RenewalTask {
  id: string;
  vehicleNo: string;
  docType: 'Fitness' | 'Insurance' | 'Permit' | 'PUC' | 'Tax';
  expiryDate: string;
  status: 'Pending' | 'In Progress' | 'Submitted' | 'Approved' | 'Rejected' | 'Completed';
  assignedTo: string;
  daysRemaining: number;
}

const INITIAL_RENEWAL_TASKS: RenewalTask[] = [
  { id: 'RT-001', vehicleNo: 'RJ-14-AB-1234', docType: 'Permit', expiryDate: '2026-07-25', status: 'In Progress', assignedTo: 'Suresh Kumar', daysRemaining: 4 },
  { id: 'RT-002', vehicleNo: 'RJ-14-AB-5678', docType: 'Fitness', expiryDate: '2026-07-21', status: 'Pending', assignedTo: 'Rajesh Sharma', daysRemaining: 0 },
  { id: 'RT-003', vehicleNo: 'GJ-01-XX-1122', docType: 'PUC', expiryDate: '2026-07-31', status: 'Pending', assignedTo: 'Amit Patel', daysRemaining: 10 },
  { id: 'RT-004', vehicleNo: 'DL-02-C-8877', docType: 'Insurance', expiryDate: '2026-07-29', status: 'Submitted', assignedTo: 'Vikas Verma', daysRemaining: 8 },
  { id: 'RT-005', vehicleNo: 'MH-43-R-8899', docType: 'Tax', expiryDate: '2026-08-15', status: 'Completed', assignedTo: 'Suresh Kumar', daysRemaining: 25 },
  { id: 'RT-006', vehicleNo: 'DL-01-MA-1234', docType: 'Fitness', expiryDate: '2026-09-05', status: 'In Progress', assignedTo: 'Karan Singh', daysRemaining: 46 },
];

export const RenewalTasks: React.FC = () => {
  const { notify } = useToast();
  const [searchParams] = useSearchParams();
  
  const [tasks, setTasks] = useState<RenewalTask[]>(INITIAL_RENEWAL_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('RT-001');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Checklist state (dependency checklist per selected task)
  const [checklist, setChecklist] = useState<Record<string, { label: string; checked: boolean }[]>>({
    'RT-001': [
      { label: 'AIS-140 GPRS active ping verify', checked: true },
      { label: 'Green Tax validity checks', checked: true },
      { label: 'Insurance policy linked', checked: false },
      { label: 'Required KYC documents upload', checked: false },
    ],
    'RT-002': [
      { label: 'Speed Governor Calibration Certificate', checked: false },
      { label: 'Tax receipts check', checked: false },
      { label: 'Insurance policy verification', checked: false },
      { label: 'Chassis emboss photo upload', checked: false },
    ],
    'RT-003': [
      { label: 'Gas leakage sensor test (for CNG)', checked: true },
      { label: 'Required Documents (RC Copy)', checked: false },
    ],
    'RT-004': [
      { label: 'AIS-140 verification', checked: true },
      { label: 'Tax validation', checked: true },
      { label: 'Insurance PDF uploaded', checked: true },
      { label: 'Government RTO clearance', checked: false },
    ],
  });

  // Fee management state
  const [feeDetails, setFeeDetails] = useState<Record<string, { fee: number; penalty: number; charges: number }>>({
    'RT-001': { fee: 3500, penalty: 0, charges: 500 },
    'RT-002': { fee: 5000, penalty: 1200, charges: 800 },
    'RT-003': { fee: 800, penalty: 0, charges: 100 },
    'RT-004': { fee: 12000, penalty: 0, charges: 1200 },
  });

  // Scheduler state
  const [schedules, setSchedules] = useState<Record<string, { date: string; time: string; location: string }>>({
    'RT-001': { date: '2026-07-24', time: '10:30', location: 'Delhi RTO (South Zone)' },
    'RT-002': { date: '', time: '', location: '' },
    'RT-003': { date: '', time: '', location: '' },
    'RT-004': { date: '2026-07-28', time: '14:00', location: 'Vahan Fitness Hub, Noida' },
  });

  // OCR state
  const [uploading, setUploading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any | null>(null);

  // If redirected from compliance dashboard with params, auto select/find task
  useEffect(() => {
    const vehicle = searchParams.get('vehicle');
    const type = searchParams.get('type');
    if (vehicle && type) {
      const found = tasks.find(t => t.vehicleNo.toLowerCase() === vehicle.toLowerCase() && t.docType.toLowerCase() === type.toLowerCase());
      if (found) {
        setSelectedTaskId(found.id);
      }
    }
  }, [searchParams, tasks]);

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || tasks[0];

  const handleSimulateOCR = () => {
    setUploading(true);
    setOcrResult(null);
    setTimeout(() => {
      setUploading(false);
      // Construct OCR results according to docType
      if (selectedTask.docType === 'Insurance') {
        setOcrResult({
          confidence: '98.6%',
          fields: [
            { field: 'Policy Number', ocrValue: 'INS-990-2210-44', manualValue: 'INS-990-2210-44', match: true },
            { field: 'Insurer', ocrValue: 'ICICI Lombard Gen Insurance', manualValue: 'ICICI Lombard General', match: true },
            { field: 'Expiry Date', ocrValue: '2027-07-20', manualValue: '2027-07-20', match: true },
            { field: 'IDV Amount', ocrValue: '₹14,50,000', manualValue: '₹14,50,000', match: true }
          ]
        });
      } else if (selectedTask.docType === 'Fitness') {
        setOcrResult({
          confidence: '94.2%',
          fields: [
            { field: 'Certificate Serial', ocrValue: 'FIT-88910-RTO-DEL', manualValue: 'FIT-88910-DEL', match: false },
            { field: 'Expiry Date', ocrValue: '2027-09-05', manualValue: '2027-09-05', match: true },
            { field: 'RTO Office', ocrValue: 'Delhi RTO Zone-02', manualValue: 'Delhi South RTO', match: true }
          ]
        });
      } else {
        setOcrResult({
          confidence: '96.5%',
          fields: [
            { field: 'Document ID', ocrValue: `DOC-${selectedTask.vehicleNo.replace(/-/g, '')}`, manualValue: `DOC-${selectedTask.vehicleNo.replace(/-/g, '')}`, match: true },
            { field: 'Expiry Date', ocrValue: selectedTask.expiryDate, manualValue: selectedTask.expiryDate, match: true }
          ]
        });
      }
      notify('success', 'Document OCR parsing complete!');
    }, 1200);
  };

  const handleUpdateChecklist = (idx: number) => {
    if (!selectedTask) return;
    const items = [...(checklist[selectedTask.id] || [])];
    items[idx].checked = !items[idx].checked;
    setChecklist({
      ...checklist,
      [selectedTask.id]: items
    });
  };

  const handleFeeChange = (field: 'fee' | 'penalty' | 'charges', val: string) => {
    if (!selectedTask) return;
    const numVal = parseFloat(val) || 0;
    const current = feeDetails[selectedTask.id] || { fee: 0, penalty: 0, charges: 0 };
    setFeeDetails({
      ...feeDetails,
      [selectedTask.id]: {
        ...current,
        [field]: numVal
      }
    });
  };

  const handleScheduleChange = (field: 'date' | 'time' | 'location', val: string) => {
    if (!selectedTask) return;
    const current = schedules[selectedTask.id] || { date: '', time: '', location: '' };
    setSchedules({
      ...schedules,
      [selectedTask.id]: {
        ...current,
        [field]: val
      }
    });
  };

  const handleApproveDocument = () => {
    notify('success', `OCR values successfully matched and document verified for task ${selectedTask.id}.`);
    // Update task status to Submitted
    setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: 'Submitted' } : t));
    setOcrResult(null);
  };

  const handleSaveFee = () => {
    notify('success', `Renewal fees finalized for vehicle ${selectedTask.vehicleNo}.`);
  };

  const handleSaveSchedule = () => {
    const sch = schedules[selectedTask.id];
    if (sch && sch.date && sch.location) {
      notify('success', `Appointment scheduled on ${sch.date} at ${sch.location}.`);
      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: 'In Progress' } : t));
    } else {
      notify('error', 'Please fill in date and location');
    }
  };

  // Helper status badge color mapping
  const statusBadges = {
    'Pending': 'red',
    'In Progress': 'amber',
    'Submitted': 'blue',
    'Approved': 'green',
    'Rejected': 'red',
    'Completed': 'green',
  } as const;

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (statusFilter === 'all') return true;
    return t.status.toLowerCase() === statusFilter.toLowerCase();
  });

  // Calculate current selected task fee split
  const activeFee = feeDetails[selectedTask?.id] || { fee: 0, penalty: 0, charges: 0 };
  const totalCost = activeFee.fee + activeFee.penalty + activeFee.charges;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Document Renewal Task 360°</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
          Steer statutory document lifecycle operations, verify document OCRs, and schedule appointments.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Tasks List */}
        <Panel 
          title="Active Renewals Queue"
          padded={false}
          actions={
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '4px 8px', backgroundColor: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text-1)', fontSize: 11, borderRadius: 4 }}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="completed">Completed</option>
            </select>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 600, overflowY: 'auto' }}>
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedTaskId(t.id);
                  setOcrResult(null);
                }}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border-soft)',
                  cursor: 'pointer',
                  backgroundColor: t.id === selectedTaskId ? 'var(--panel-2)' : 'transparent',
                  borderLeft: t.id === selectedTaskId ? '3px solid var(--green)' : '3px solid transparent',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: 14 }}>{t.vehicleNo}</strong>
                  <Badge tone={statusBadges[t.status]}>{t.status}</Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)' }}>
                  <span>Doc: <strong>{t.docType}</strong></span>
                  <span>Days: <strong style={{ color: t.daysRemaining <= 7 ? 'var(--red)' : 'var(--text-2)' }}>{t.daysRemaining} days left</strong></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
                  <span>Task ID: {t.id}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={10} /> {t.assignedTo}</span>
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
                No renewal tasks in this status filter.
              </div>
            )}
          </div>
        </Panel>

        {/* Right Column: Task detail 360 */}
        {selectedTask ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Detail Header Panel */}
            <Panel padded={false}>
              <div style={{
                padding: '20px 24px',
                background: 'linear-gradient(135deg, var(--panel-2) 0%, var(--panel) 100%)',
                borderBottom: '1px solid var(--border-soft)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="mono-label" style={{ fontSize: 10, color: 'var(--text-3)' }}>VEHICLE RENEWAL OVERVIEW</span>
                  <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{selectedTask.vehicleNo}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                    <span>Document: <strong>{selectedTask.docType}</strong></span>
                    <span>•</span>
                    <span>Task ID: <strong>{selectedTask.id}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <Badge tone={statusBadges[selectedTask.status]}>{selectedTask.status} Status</Badge>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: selectedTask.daysRemaining <= 7 ? 'var(--red)' : 'var(--green)',
                    backgroundColor: selectedTask.daysRemaining <= 7 ? 'rgba(229, 72, 77, 0.08)' : 'var(--green-glow)',
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: `1px solid ${selectedTask.daysRemaining <= 7 ? 'rgba(229, 72, 77, 0.2)' : 'rgba(46, 204, 113, 0.2)'}`
                  }}>
                    {selectedTask.daysRemaining === 0 ? 'Expired Today' : `${selectedTask.daysRemaining} Days Remaining`}
                  </div>
                </div>
              </div>

              {/* Grid sections for detailing */}
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  
                  {/* Step 1: Dependency Checklist */}
                  <Panel title="1. Dependency Checklist" subtitle="Check prerequisites before submitting document" style={{ height: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(checklist[selectedTask.id] || [
                        { label: 'Verify vehicle record in register', checked: true },
                        { label: 'Ensure no unpaid challans exist', checked: false }
                      ]).map((item, idx) => (
                        <label 
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            backgroundColor: 'var(--panel-2)',
                            borderRadius: 6,
                            border: '1px solid var(--border-soft)',
                            cursor: 'pointer',
                            fontSize: 13
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={item.checked}
                            onChange={() => handleUpdateChecklist(idx)}
                            style={{ width: 15, height: 15, accentColor: 'var(--green)' }}
                          />
                          <span style={{
                            textDecoration: item.checked ? 'line-through' : 'none',
                            color: item.checked ? 'var(--text-3)' : 'var(--text-1)',
                            fontWeight: 500
                          }}>{item.label}</span>
                        </label>
                      ))}
                      
                      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                        <Badge tone={(checklist[selectedTask.id]?.filter(c => c.checked).length === checklist[selectedTask.id]?.length) ? 'green' : 'amber'}>
                          Checklist Progress: {checklist[selectedTask.id]?.filter(c => c.checked).length ?? 0} / {checklist[selectedTask.id]?.length ?? 0}
                        </Badge>
                      </div>
                    </div>
                  </Panel>

                  {/* Step 2: Fee Management */}
                  <Panel title="2. Fee Management" subtitle="Finalize government fee details and penalties" style={{ height: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>RENEWAL FEE (₹)</span>
                          <input 
                            type="number" 
                            value={activeFee.fee}
                            onChange={(e) => handleFeeChange('fee', e.target.value)}
                            className="adm-input"
                            style={{ width: '100%', fontSize: 13 }}
                          />
                        </div>
                        <div>
                          <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>PENALTY CHARGE (₹)</span>
                          <input 
                            type="number" 
                            value={activeFee.penalty}
                            onChange={(e) => handleFeeChange('penalty', e.target.value)}
                            className="adm-input"
                            style={{ width: '100%', fontSize: 13 }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>SERVICE & AGENT CHARGES (₹)</span>
                        <input 
                          type="number" 
                          value={activeFee.charges}
                          onChange={(e) => handleFeeChange('charges', e.target.value)}
                          className="adm-input"
                          style={{ width: '100%', fontSize: 13 }}
                        />
                      </div>

                      <div style={{ 
                        marginTop: 8,
                        padding: 12,
                        backgroundColor: 'var(--panel-2)',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>TOTAL COST COMPUTED:</span>
                        <strong style={{ fontSize: 16, color: 'var(--green)' }}>₹ {totalCost.toLocaleString()}</strong>
                      </div>

                      <Button size="sm" variant="subtle" onClick={handleSaveFee} style={{ alignSelf: 'flex-end', marginTop: 4 }}>
                        Save Fee Allocation
                      </Button>
                    </div>
                  </Panel>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {/* Step 3: Appointment Scheduler */}
                  <Panel title="3. Appointment Scheduler" subtitle="Schedule government RTO fitness or permit test" style={{ height: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>APPOINTMENT DATE</span>
                          <input 
                            type="date" 
                            value={schedules[selectedTask.id]?.date || ''}
                            onChange={(e) => handleScheduleChange('date', e.target.value)}
                            className="adm-input"
                            style={{ width: '100%', fontSize: 13 }}
                          />
                        </div>
                        <div>
                          <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>APPOINTMENT TIME</span>
                          <input 
                            type="time" 
                            value={schedules[selectedTask.id]?.time || ''}
                            onChange={(e) => handleScheduleChange('time', e.target.value)}
                            className="adm-input"
                            style={{ width: '100%', fontSize: 13 }}
                          />
                        </div>
                      </div>

                      <div>
                        <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>GOVERNMENT RTO LOCATION</span>
                        <input 
                          type="text" 
                          placeholder="Select RTO or physical test site..."
                          value={schedules[selectedTask.id]?.location || ''}
                          onChange={(e) => handleScheduleChange('location', e.target.value)}
                          className="adm-input"
                          style={{ width: '100%', fontSize: 13 }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                        {schedules[selectedTask.id]?.date ? (
                          <span style={{ fontSize: 11, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle size={12} /> Appointment set!
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertCircle size={12} /> No appointment scheduled yet
                          </span>
                        )}
                        <Button variant="primary" size="sm" onClick={handleSaveSchedule}>
                          Confirm Appointment
                        </Button>
                      </div>
                    </div>
                  </Panel>

                  {/* Step 4: Document Upload & OCR Verify */}
                  <Panel title="4. Document Upload & OCR" subtitle="Upload certified document and verify values" style={{ height: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ 
                        border: '2px dashed var(--border)', 
                        padding: 20, 
                        borderRadius: 8, 
                        textAlign: 'center',
                        backgroundColor: 'var(--panel-2)',
                        cursor: 'pointer'
                      }}>
                        <Upload size={24} style={{ color: 'var(--text-3)', marginBottom: 8 }} />
                        <div style={{ fontSize: 13, fontWeight: 600 }}>Drag PDF or images here</div>
                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Scan and extract registration data automatically</span>
                        
                        <div style={{ marginTop: 12 }}>
                          <Button size="sm" variant="primary" onClick={handleSimulateOCR} disabled={uploading}>
                            {uploading ? (
                              <>
                                <RefreshCw size={13} className="adm-spin" style={{ marginRight: 6 }} />
                                Parsing document OCR...
                              </>
                            ) : 'Upload & Simulate OCR'}
                          </Button>
                        </div>
                      </div>

                      {ocrResult && (
                        <div style={{ 
                          padding: 12, 
                          backgroundColor: 'rgba(46, 204, 113, 0.04)', 
                          borderRadius: 8, 
                          border: '1px solid rgba(46, 204, 113, 0.15)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Sparkles size={13} /> OCR Extracted Results
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Confidence: <strong>{ocrResult.confidence}</strong></span>
                          </div>

                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-soft)', textAlign: 'left' }}>
                                <th style={{ padding: '4px 0', color: 'var(--text-3)' }}>FIELD</th>
                                <th style={{ padding: '4px 0', color: 'var(--text-3)' }}>OCR PARSED</th>
                                <th style={{ padding: '4px 0', color: 'var(--text-3)' }}>MANUAL DATA</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ocrResult.fields.map((f: any, idx: number) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                                  <td style={{ padding: '6px 0', fontWeight: 600 }}>{f.field}</td>
                                  <td style={{ padding: '6px 0', color: f.match ? 'var(--text-1)' : 'var(--amber)' }}>{f.ocrValue}</td>
                                  <td style={{ padding: '6px 0', color: 'var(--text-2)' }}>{f.manualValue}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                            <Button size="sm" variant="subtle" onClick={() => setOcrResult(null)}>Reject</Button>
                            <Button size="sm" variant="primary" onClick={handleApproveDocument}>Approve & Save</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Panel>
                </div>
              </div>
            </Panel>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80, backgroundColor: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <span style={{ color: 'var(--text-3)' }}>Select a renewal task to see its 360° details workbench.</span>
          </div>
        )}
      </div>
    </div>
  );
};
