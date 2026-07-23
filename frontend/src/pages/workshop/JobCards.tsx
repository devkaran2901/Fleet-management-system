import React, { useEffect, useState } from 'react';
import { Search, Plus, Eye, Edit, UserPlus, ArrowRight, Printer } from 'lucide-react';
import { workshopApi } from '../../services/workshopApi';
import type { JobCard } from '../../services/workshopApi';
import {
  Panel,
  Button,
  Badge,
  Input,
  Select,
  Modal,
  LoadingState,
  ErrorState,
  Field,
  useToast,
} from '../../components/admin/ui';

export const JobCards: React.FC = () => {
  const { notify } = useToast();
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [vehicleSearch, setVehicleSearch] = useState<string>('');
  const [mechanicSearch, setMechanicSearch] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  // Modals
  const [viewCard, setViewCard] = useState<JobCard | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [assignCard, setAssignCard] = useState<JobCard | null>(null);
  const [moveStatusCard, setMoveStatusCard] = useState<JobCard | null>(null);

  // New Job Card Form State
  const [newVehicle, setNewVehicle] = useState('');
  const [newComplaint, setNewComplaint] = useState('');
  const [newPriority, setNewPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newOdometer, setNewOdometer] = useState(100000);
  const [newCustomer, setNewCustomer] = useState('Internal Fleet');

  // Assign Form State
  const [assignBay, setAssignBay] = useState('');
  const [assignMechanicName, setAssignMechanicName] = useState('');

  // Move Status Form State
  const [nextStatus, setNextStatus] = useState<JobCard['status']>('In Progress');

  const fetchJobCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workshopApi.getJobCards({
        status: statusFilter || undefined,
        vehicle: vehicleSearch || undefined,
        mechanic: mechanicSearch || undefined,
        priority: priorityFilter || undefined,
      });
      setJobCards(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch job cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobCards();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobCards();
  };

  const handleCreateJobCard = async () => {
    if (!newVehicle || !newComplaint) {
      notify('error', 'Please provide Vehicle Number and Complaint');
      return;
    }
    try {
      await workshopApi.createJobCard({
        vehicleNumber: newVehicle.toUpperCase(),
        complaint: newComplaint,
        priority: newPriority,
        odometer: newOdometer,
        customer: newCustomer,
        status: 'Open',
      });
      notify('success', 'Job Card created successfully');
      setCreateOpen(false);
      setNewVehicle('');
      setNewComplaint('');
      fetchJobCards();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to create Job Card');
    }
  };

  const handleAssignSubmit = async () => {
    if (!assignCard) return;
    try {
      await workshopApi.updateJobCard(assignCard.id, {
        bayName: assignBay || assignCard.bayName,
        mechanicName: assignMechanicName || assignCard.mechanicName,
      });
      notify('success', 'Mechanic and Bay assigned successfully');
      setAssignCard(null);
      fetchJobCards();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to assign');
    }
  };

  const handleMoveStatusSubmit = async () => {
    if (!moveStatusCard) return;
    try {
      await workshopApi.updateJobCard(moveStatusCard.id, {
        status: nextStatus,
      });
      notify('success', `Job Card moved to ${nextStatus}`);
      setMoveStatusCard(null);
      fetchJobCards();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to update status');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const parseJSON = (data: any) => {
    if (!data) return [];
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return data;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
            Job Card Pipeline
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            Lifecycle: Draft → Open → In Progress → Waiting Parts → QC → Road Test → Completed → Cost Posted
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
          New Job Card
        </Button>
      </div>

      {/* Filter Bar */}
      <Panel padded={false}>
        <form onSubmit={handleSearchSubmit} style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Input
              placeholder="Search by Vehicle Number..."
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
            />
          </div>
          <div style={{ width: 160 }}>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting Parts">Waiting Parts</option>
              <option value="QC">QC</option>
              <option value="Road Test">Road Test</option>
              <option value="Completed">Completed</option>
              <option value="Cost Posted">Cost Posted</option>
            </Select>
          </div>
          <div style={{ width: 150 }}>
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </Select>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <Input
              placeholder="Filter by Mechanic..."
              value={mechanicSearch}
              onChange={(e) => setMechanicSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="subtle" icon={<Search size={14} />}>
            Search
          </Button>
        </form>
      </Panel>

      {/* Table */}
      {loading ? (
        <LoadingState label="Loading Job Cards" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchJobCards} />
      ) : (
        <Panel padded={false}>
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Job Card #</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Bay</th>
                  <th>Mechanic</th>
                  <th>Estimate</th>
                  <th>Actual Cost</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobCards.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 30 }}>
                      No Job Cards found matching criteria.
                    </td>
                  </tr>
                ) : (
                  jobCards.map((jc) => (
                    <tr key={jc.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>{jc.jobCardNumber}</td>
                      <td style={{ fontWeight: 600 }}>{jc.vehicleNumber}</td>
                      <td>
                        <Badge
                          tone={
                            jc.status === 'Completed' || jc.status === 'Cost Posted'
                              ? 'green'
                              : jc.status === 'In Progress'
                              ? 'blue'
                              : jc.status === 'Waiting Parts'
                              ? 'amber'
                              : jc.status === 'QC'
                              ? 'grey'
                              : 'grey'
                          }
                        >
                          {jc.status}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          tone={
                            jc.priority === 'CRITICAL'
                              ? 'red'
                              : jc.priority === 'HIGH'
                              ? 'amber'
                              : 'grey'
                          }
                        >
                          {jc.priority}
                        </Badge>
                      </td>
                      <td>{jc.bayName || '—'}</td>
                      <td>{jc.mechanicName || 'Unassigned'}</td>
                      <td>₹{jc.estimateTotal.toLocaleString()}</td>
                      <td>₹{jc.actualCost.toLocaleString()}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        {new Date(jc.createdDate).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <Button variant="ghost" size="sm" icon={<Eye size={12} />} onClick={() => setViewCard(jc)}>
                            View
                          </Button>
                          <Button variant="ghost" size="sm" icon={<Edit size={12} />} onClick={() => setViewCard(jc)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" icon={<UserPlus size={12} />} onClick={() => setAssignCard(jc)}>
                            Assign
                          </Button>
                          <Button variant="ghost" size="sm" icon={<ArrowRight size={12} />} onClick={() => setMoveStatusCard(jc)}>
                            Move
                          </Button>
                          <Button variant="ghost" size="sm" icon={<Printer size={12} />} onClick={() => handlePrint()}>
                            Print
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* --- View Job Card Details Modal --- */}
      {viewCard && (
        <Modal open wide title={`Job Card Details — ${viewCard.jobCardNumber}`} onClose={() => setViewCard(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, backgroundColor: 'var(--panel-2)', padding: 14, borderRadius: 8 }}>
              <div>
                <span className="mono-label" style={{ fontSize: 9 }}>VEHICLE</span>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>{viewCard.vehicleNumber}</div>
              </div>
              <div>
                <span className="mono-label" style={{ fontSize: 9 }}>STATUS</span>
                <div><Badge tone="blue">{viewCard.status}</Badge></div>
              </div>
              <div>
                <span className="mono-label" style={{ fontSize: 9 }}>PRIORITY</span>
                <div><Badge tone={viewCard.priority === 'CRITICAL' ? 'red' : 'amber'}>{viewCard.priority}</Badge></div>
              </div>
              <div>
                <span className="mono-label" style={{ fontSize: 9 }}>CUSTOMER / LINE</span>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{viewCard.customer}</div>
              </div>
            </div>

            {/* Complaint & Root Cause */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ border: '1px solid var(--border-soft)', padding: 12, borderRadius: 6 }}>
                <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>DRIVER COMPLAINT</span>
                <p style={{ margin: '6px 0 0 0', fontSize: 13, color: 'var(--text-1)' }}>{viewCard.complaint}</p>
              </div>
              <div style={{ border: '1px solid var(--border-soft)', padding: 12, borderRadius: 6 }}>
                <span className="mono-label" style={{ fontSize: 9, color: 'var(--text-3)' }}>ROOT CAUSE ANALYSIS</span>
                <p style={{ margin: '6px 0 0 0', fontSize: 13, color: 'var(--text-1)' }}>{viewCard.rootCause || 'Under Diagnosis'}</p>
              </div>
            </div>

            {/* Assigned Bay & Mechanic */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, backgroundColor: 'var(--panel-2)', padding: 12, borderRadius: 6 }}>
              <div>
                <span className="mono-label" style={{ fontSize: 9 }}>ASSIGNED BAY</span>
                <div style={{ fontWeight: 600 }}>{viewCard.bayName || 'Not Assigned'}</div>
              </div>
              <div>
                <span className="mono-label" style={{ fontSize: 9 }}>LEAD MECHANIC</span>
                <div style={{ fontWeight: 600 }}>{viewCard.mechanicName || 'Unassigned'}</div>
              </div>
              <div>
                <span className="mono-label" style={{ fontSize: 9 }}>ODOMETER</span>
                <div style={{ fontWeight: 600 }}>{viewCard.odometer.toLocaleString()} KM</div>
              </div>
              <div>
                <span className="mono-label" style={{ fontSize: 9 }}>ENGINE HOURS</span>
                <div style={{ fontWeight: 600 }}>{viewCard.hours} hrs</div>
              </div>
            </div>

            {/* Tasks Section */}
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: 'var(--text-1)' }}>Work Order Tasks</h4>
              <table className="adm-table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>Task ID</th>
                    <th>Description</th>
                    <th>Mechanic</th>
                    <th>Std Hours</th>
                    <th>Actual Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parseJSON(viewCard.tasks).length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-3)' }}>No tasks defined.</td></tr>
                  ) : (
                    parseJSON(viewCard.tasks).map((t: any, idx: number) => (
                      <tr key={t.id || idx}>
                        <td>{t.id || `T-${idx + 1}`}</td>
                        <td>{t.description}</td>
                        <td>{t.mechanic || viewCard.mechanicName}</td>
                        <td>{t.stdHours} hrs</td>
                        <td>{t.actualHours || 0} hrs</td>
                        <td><Badge tone={t.status === 'Completed' ? 'green' : 'amber'}>{t.status || 'Pending'}</Badge></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Parts Reserved & Outside Work */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: 'var(--text-1)' }}>Parts Demand & Issued</h4>
                <table className="adm-table" style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>Part #</th>
                      <th>Name</th>
                      <th>Qty</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseJSON(viewCard.parts).length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-3)' }}>No parts attached.</td></tr>
                    ) : (
                      parseJSON(viewCard.parts).map((p: any, idx: number) => (
                        <tr key={idx}>
                          <td>{p.partNumber}</td>
                          <td>{p.name}</td>
                          <td>{p.qty}</td>
                          <td>₹{p.totalCost.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: 'var(--text-1)' }}>Outside Work Requests</h4>
                <table className="adm-table" style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>Vendor</th>
                      <th>Reason</th>
                      <th>Estimate</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseJSON(viewCard.outsideWork).length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-3)' }}>No outside work.</td></tr>
                    ) : (
                      parseJSON(viewCard.outsideWork).map((ow: any, idx: number) => (
                        <tr key={idx}>
                          <td>{ow.vendor}</td>
                          <td>{ow.reason}</td>
                          <td>₹{ow.estimate.toLocaleString()}</td>
                          <td><Badge tone={ow.status === 'Completed' ? 'green' : 'amber'}>{ow.status}</Badge></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cost Summary & Approvals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, backgroundColor: 'var(--panel-2)', padding: 14, borderRadius: 8 }}>
              <div>
                <span className="mono-label" style={{ fontSize: 9 }}>COST SUMMARY</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
                  <span>Approved Estimate:</span>
                  <span style={{ fontWeight: 700 }}>₹{viewCard.estimateTotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
                  <span>Actual Cost Booked:</span>
                  <span style={{ fontWeight: 700, color: 'var(--green)' }}>₹{viewCard.actualCost.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="mono-label" style={{ fontSize: 9 }}>APPROVALS & GATES</span>
                <div style={{ fontSize: 12, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div>Estimate Approval: <Badge tone="green">Approved</Badge></div>
                  <div>Technical Parallel Approval: <Badge tone="green">Passed</Badge></div>
                  <div>QC Sign-off: <Badge tone={viewCard.qcStatus === 'Approved' ? 'green' : 'amber'}>{viewCard.qcStatus}</Badge></div>
                  <div>Road Test Gate: <Badge tone={viewCard.roadTestStatus === 'Passed' ? 'green' : 'grey'}>{viewCard.roadTestStatus}</Badge></div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* --- Create Job Card Modal --- */}
      <Modal open={createOpen} title="Open New Job Card" onClose={() => setCreateOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Vehicle Registration Number">
            <Input placeholder="e.g. MH-12-AB-1234" value={newVehicle} onChange={(e) => setNewVehicle(e.target.value)} />
          </Field>

          <Field label="Driver Complaint / Symptom">
            <Input placeholder="Describe fault or maintenance trigger" value={newComplaint} onChange={(e) => setNewComplaint(e.target.value)} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Priority Level">
              <Select value={newPriority} onChange={(e) => setNewPriority(e.target.value as any)}>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </Select>
            </Field>

            <Field label="Odometer (KM)">
              <Input type="number" value={newOdometer} onChange={(e) => setNewOdometer(Number(e.target.value))} />
            </Field>
          </div>

          <Field label="Customer / Division">
            <Input value={newCustomer} onChange={(e) => setNewCustomer(e.target.value)} />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateJobCard}>Open Job Card</Button>
          </div>
        </div>
      </Modal>

      {/* --- Assign Bay / Mechanic Modal --- */}
      {assignCard && (
        <Modal open title={`Assign Bay & Mechanic — ${assignCard.jobCardNumber}`} onClose={() => setAssignCard(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Assign Bay">
              <Select value={assignBay} onChange={(e) => setAssignBay(e.target.value)}>
                <option value="">-- Select Workshop Bay --</option>
                <option value="Bay 01 - Heavy Repair">Bay 01 - Heavy Repair</option>
                <option value="Bay 02 - Quick Service">Bay 02 - Quick Service</option>
                <option value="Bay 03 - Electrical & HVAC">Bay 03 - Electrical & HVAC</option>
                <option value="Bay 04 - PM Service">Bay 04 - PM Service</option>
                <option value="Bay 05 - Transmission & Axle">Bay 05 - Transmission & Axle</option>
                <option value="Bay 06 - Inspection">Bay 06 - Inspection</option>
              </Select>
            </Field>

            <Field label="Assign Lead Mechanic">
              <Select value={assignMechanicName} onChange={(e) => setAssignMechanicName(e.target.value)}>
                <option value="">-- Select Mechanic --</option>
                <option value="Rajesh Sharma">Rajesh Sharma (Engine Specialist)</option>
                <option value="Sunil Kumar">Sunil Kumar (General Tech)</option>
                <option value="Vikram Singh">Vikram Singh (Electrical & HVAC)</option>
                <option value="Amit Verma">Amit Verma (Hydraulics & Transmission)</option>
                <option value="Ramesh Patel">Ramesh Patel (Tyre & Suspension)</option>
                <option value="Praveen Yadav">Praveen Yadav (General Tech)</option>
              </Select>
            </Field>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
              <Button variant="ghost" onClick={() => setAssignCard(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleAssignSubmit}>Save Assignment</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- Move Status Modal --- */}
      {moveStatusCard && (
        <Modal open title={`Move Stage — ${moveStatusCard.jobCardNumber}`} onClose={() => setMoveStatusCard(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
              Current Stage: <strong style={{ color: 'var(--text-1)' }}>{moveStatusCard.status}</strong>
            </p>

            <Field label="Select Next Stage">
              <Select value={nextStatus} onChange={(e) => setNextStatus(e.target.value as any)}>
                <option value="Draft">Draft</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting Parts">Waiting Parts</option>
                <option value="QC">QC</option>
                <option value="Road Test">Road Test</option>
                <option value="Completed">Completed</option>
                <option value="Cost Posted">Cost Posted</option>
              </Select>
            </Field>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
              <Button variant="ghost" onClick={() => setMoveStatusCard(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleMoveStatusSubmit}>Move Stage</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
