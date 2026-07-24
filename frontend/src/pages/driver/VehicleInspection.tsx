import React, { useState } from 'react';
import { initialInspections } from './driverDataStore';
import type { VehicleInspectionRecord, VehicleInspectionItem } from './driverDataStore';
import {
  ClipboardCheck,
  Plus,
  CheckCircle,
  XCircle,
  Camera,
  Mic,
  Save,
  Send,
  X,
} from 'lucide-react';

export const VehicleInspection: React.FC = () => {
  const [inspections, setInspections] = useState<VehicleInspectionRecord[]>(initialInspections);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<VehicleInspectionRecord | null>(null);

  const [vehicleNumber, setVehicleNumber] = useState('MH-12-PQ-9021');
  const [overallRemarks, setOverallRemarks] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordedVoiceDuration, setRecordedVoiceDuration] = useState<string | null>(null);
  const [photoUploaded, setPhotoUploaded] = useState<string | null>(null);

  const [checklist, setChecklist] = useState<VehicleInspectionItem[]>([
    { id: 'ext-1', name: 'Tyres Pressure & Tread Depth', category: 'Exterior', passed: true },
    { id: 'ext-2', name: 'Headlights & High Beams', category: 'Exterior', passed: true },
    { id: 'ext-3', name: 'Indicators & Brake Lights', category: 'Exterior', passed: true },
    { id: 'ext-4', name: 'Side Mirrors & Rearview Visibility', category: 'Exterior', passed: true },
    { id: 'ext-5', name: 'Body Damage / Scratches', category: 'Exterior', passed: true },
    { id: 'int-1', name: 'Dashboard Gauges & Telematics Console', category: 'Interior', passed: true },
    { id: 'int-2', name: 'Dual Air Horn', category: 'Interior', passed: true },
    { id: 'int-3', name: 'Air-Suspension Seat Adjustment', category: 'Interior', passed: true },
    { id: 'int-4', name: 'Seatbelt Lock & Tensioner', category: 'Interior', passed: true },
    { id: 'saf-1', name: 'ABC Dry Powder Fire Extinguisher (2kg)', category: 'Safety', passed: true },
    { id: 'saf-2', name: 'Sealed First Aid Kit', category: 'Safety', passed: true },
    { id: 'saf-3', name: 'Reflective Emergency Warning Triangles', category: 'Safety', passed: true },
  ]);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, passed: !item.passed } : item))
    );
  };

  const handleVoiceRecordToggle = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      setTimeout(() => {
        setIsRecordingVoice(false);
        setRecordedVoiceDuration('0:24');
      }, 2500);
    }
  };

  const handleSaveInspection = (status: 'Draft' | 'Submitted') => {
    const newRecord: VehicleInspectionRecord = {
      id: `INSP-${Math.floor(100 + Math.random() * 900)}`,
      inspectionId: `INSP-${Math.floor(100 + Math.random() * 900)}`,
      vehicleNumber,
      date: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status,
      checklist,
      overallRemarks: overallRemarks || 'Pre-trip vehicle inspection completed.',
      photoUrl: photoUploaded || 'inspection-front-photo.jpg',
      voiceNoteUrl: recordedVoiceDuration ? 'voice-note-recording.mp3' : undefined,
      voiceNoteDuration: recordedVoiceDuration || undefined,
    };

    setInspections((prev) => [newRecord, ...prev]);
    setShowNewModal(false);
    alert(`Inspection ${status === 'Draft' ? 'saved as Draft' : 'Submitted successfully'}!`);
  };

  return (
    <div>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text-1)' }}>Vehicle Inspection Logs</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-2)' }}>
            Pre-trip safety checklists, exterior/interior inspections, damage photos & voice notes.
          </p>
        </div>
        <button className="driver-btn-primary" onClick={() => setShowNewModal(true)}>
          <Plus size={16} /> New Inspection
        </button>
      </div>

      {/* Table */}
      <div className="driver-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="driver-table">
          <thead>
            <tr>
              <th>Inspection ID</th>
              <th>Vehicle Number</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Pass Rate</th>
              <th>Media Uploads</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inspections.map((insp) => {
              const passedCount = insp.checklist.filter((c) => c.passed).length;
              const totalCount = insp.checklist.length;
              return (
                <tr key={insp.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--text-1)' }}>{insp.inspectionId}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--green)' }}>{insp.vehicleNumber}</span>
                  </td>
                  <td>{insp.date}</td>
                  <td>
                    <span
                      className={`driver-status-pill ${
                        insp.status === 'Submitted'
                          ? 'approved'
                          : insp.status === 'Draft'
                          ? 'pending'
                          : 'completed'
                      }`}
                    >
                      {insp.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: passedCount === totalCount ? 'var(--green)' : 'var(--amber)' }}>
                      {passedCount} / {totalCount} Passed
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-2)' }}>
                      {insp.photoUrl && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Camera size={12} color="var(--green)" /> Photo</span>}
                      {insp.voiceNoteUrl && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mic size={12} color="#3B82F6" /> Voice ({insp.voiceNoteDuration})</span>}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="driver-btn-secondary"
                      onClick={() => setSelectedInspection(insp)}
                      style={{ padding: '5px 10px', fontSize: 11 }}
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal View */}
      {selectedInspection && (
        <div className="driver-modal-overlay">
          <div className="driver-modal" style={{ maxWidth: 640 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ClipboardCheck color="var(--green)" size={22} />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Inspection Report: {selectedInspection.inspectionId}</h3>
              </div>
              <button onClick={() => setSelectedInspection(null)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>
              Vehicle: <strong style={{ color: 'var(--green)', fontFamily: 'monospace' }}>{selectedInspection.vehicleNumber}</strong> | Date: <strong>{selectedInspection.date}</strong>
            </div>

            <div style={{ background: 'var(--panel-2)', padding: 12, borderRadius: 10, marginBottom: 16, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', marginBottom: 4 }}>OVERALL DRIVER REMARKS</div>
              <div style={{ fontSize: 13, color: 'var(--text-1)' }}>{selectedInspection.overallRemarks}</div>
            </div>

            {['Exterior', 'Interior', 'Safety'].map((cat) => (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {cat} Checklist
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {selectedInspection.checklist
                    .filter((c) => c.category === cat)
                    .map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: 'var(--panel-2)',
                          padding: '8px 12px',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 12,
                        }}
                      >
                        <span style={{ color: 'var(--text-1)' }}>{item.name}</span>
                        {item.passed ? (
                          <span style={{ color: 'var(--green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle size={14} /> PASS
                          </span>
                        ) : (
                          <span style={{ color: 'var(--red)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <XCircle size={14} /> FAIL
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="driver-btn-secondary" onClick={() => setSelectedInspection(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal New */}
      {showNewModal && (
        <div className="driver-modal-overlay">
          <div className="driver-modal" style={{ maxWidth: 680 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ClipboardCheck color="var(--green)" size={22} />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>New Pre-Trip Vehicle Inspection</h3>
              </div>
              <button onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className="driver-form-group">
              <label>Vehicle Registration Number</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                required
              />
            </div>

            {['Exterior', 'Interior', 'Safety'].map((cat) => (
              <div key={cat} style={{ marginBottom: 16, background: 'var(--panel-2)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--green)', marginBottom: 10, textTransform: 'uppercase' }}>
                  {cat} Inspection Items
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {checklist
                    .filter((c) => c.category === cat)
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: item.passed ? 'rgba(46, 204, 113, 0.08)' : 'rgba(229, 72, 77, 0.08)',
                          border: `1px solid ${item.passed ? 'var(--green)' : 'var(--red)'}`,
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{item.name}</span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: item.passed ? 'var(--green)' : 'var(--red)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {item.passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {item.passed ? 'PASSED' : 'DEFECT / ISSUE'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}

            <div className="driver-form-group">
              <label>Overall Remarks / Defect Details</label>
              <textarea
                rows={3}
                placeholder="Enter any observed damage, tyre wear, or mechanical issues..."
                value={overallRemarks}
                onChange={(e) => setOverallRemarks(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'var(--panel-2)', padding: 12, borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>PHOTO EVIDENCE</div>
                <button
                  type="button"
                  className="driver-btn-secondary"
                  onClick={() => setPhotoUploaded('photo-vehicle-inspection.jpg')}
                  style={{ width: '100%', fontSize: 12 }}
                >
                  <Camera size={14} /> {photoUploaded ? 'Photo Uploaded ✓' : 'Upload Inspection Photo'}
                </button>
              </div>

              <div style={{ background: 'var(--panel-2)', padding: 12, borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>VOICE NOTE RECORDING</div>
                <button
                  type="button"
                  className="driver-btn-secondary"
                  onClick={handleVoiceRecordToggle}
                  style={{
                    width: '100%',
                    fontSize: 12,
                    background: isRecordingVoice ? 'rgba(239, 68, 68, 0.2)' : undefined,
                    color: isRecordingVoice ? 'var(--red)' : undefined,
                  }}
                >
                  <Mic size={14} /> {isRecordingVoice ? 'Recording... (Speak Now)' : recordedVoiceDuration ? `Voice Note (${recordedVoiceDuration}) ✓` : 'Record Voice Note'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="driver-btn-secondary" onClick={() => handleSaveInspection('Draft')}>
                <Save size={16} /> Save Draft
              </button>
              <button className="driver-btn-primary" onClick={() => handleSaveInspection('Submitted')}>
                <Send size={16} /> Submit Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
