import api from './api';

const unwrap = <T>(promise: Promise<{ data: T }>) => promise.then((res) => res.data);

export interface WorkshopKPIs {
  openJobCards: number;
  waitingParts: number;
  inProgressJobs: number;
  qcQueue: number;
  vehiclesDown: number;
  pmDueToday: number;
  estimatePendingApproval: number;
  activeBays: number;

  pmCompliance: number;
  breakdowns: number;
  mttrHours: number;
  firstTimeFixRate: number;
  estimateAccuracy: number;
  waitingPartsHours: number;
}

export interface JobCardTask {
  id: string;
  description: string;
  mechanic: string;
  stdHours: number;
  actualHours: number;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface JobCardPart {
  partNumber: string;
  name: string;
  qty: number;
  unitCost: number;
  totalCost: number;
  status: 'Reserved' | 'Issued' | 'Backordered';
}

export interface OutsideWorkItem {
  vendor: string;
  reason: string;
  estimate: number;
  status: 'Pending' | 'Completed' | 'In Progress';
}

export interface QCChecklistItem {
  item: string;
  passed: boolean;
  notes?: string;
}

export interface JobCard {
  id: string;
  jobCardNumber: string;
  vehicleId?: string | null;
  vehicleNumber: string;
  status: 'Draft' | 'Open' | 'In Progress' | 'Waiting Parts' | 'QC' | 'Road Test' | 'Completed' | 'Cost Posted';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  bayId?: string | null;
  bayName?: string | null;
  mechanicId?: string | null;
  mechanicName?: string | null;
  complaint: string;
  rootCause?: string | null;
  odometer: number;
  hours: number;
  customer: string;
  estimateTotal: number;
  actualCost: number;
  tasks: string | JobCardTask[]; // stringified JSON in DB
  parts: string | JobCardPart[]; // stringified JSON in DB
  outsideWork: string | OutsideWorkItem[]; // stringified JSON in DB
  qcChecklist: string | QCChecklistItem[]; // stringified JSON in DB
  qcStatus: 'Pending' | 'Approved' | 'Rejected';
  roadTestStatus: 'Not Required' | 'Pending' | 'Passed' | 'Failed';
  roadTestNotes?: string | null;
  surveyorHeld: boolean;
  warrantyClaimed: boolean;
  auditTrail: string | any[]; // stringified JSON
  createdDate: string;
  updatedAt: string;
}

export interface WorkshopBay {
  id: string;
  name: string;
  status: 'Available' | 'Busy' | 'Waiting Parts' | 'QC';
  currentJobCardId?: string | null;
  currentVehicleId?: string | null;
  vehicleNumber?: string | null;
  mechanicId?: string | null;
  mechanicName?: string | null;
  estimatedFinish?: string | null;
}

export interface WorkshopMechanic {
  id: string;
  name: string;
  skill: string;
  currentJobCardId?: string | null;
  assignedBay?: string | null;
  status: 'Available' | 'Busy' | 'On Break';
  productivity: number;
}

export interface PmSchedule {
  id: string;
  vehicleId?: string | null;
  vehicleNumber: string;
  currentOdometer: number;
  dueKm: number;
  dueDate: string;
  dueHours: number;
  triggerType: 'KM' | 'Hours' | 'Time' | 'Condition' | 'Statutory';
  status: 'Normal' | 'Due' | 'Overdue' | 'Grace' | 'Lock';
  slotNegotiation: string | any;
  autoJobCardId?: string | null;
  maintenanceGrace: boolean;
  maintenanceLock: boolean;
  overrideApproved: boolean;
}

export interface Estimate {
  id: string;
  estimateNumber: string;
  jobCardId: string;
  vehicleNumber: string;
  labourCost: number;
  partsCost: number;
  outsideWorkCost: number;
  tax: number;
  totalAmount: number;
  approvalStatus: 'Draft' | 'PendingApproval' | 'Approved' | 'Rejected' | 'RevisionRequired';
  technicalApproval: 'Pending' | 'Approved' | 'Rejected';
  approvalTimeline: string | any[];
  createdAt: string;
  updatedAt: string;
}

export interface PartsDemandItem {
  id: string;
  jobCardId: string;
  vehicleNumber: string;
  partNumber: string;
  partName: string;
  quantityRequired: number;
  quantityAvailable: number;
  reservationStatus: 'Unreserved' | 'Reserved' | 'Partial';
  demandStatus: 'Pending' | 'Requested' | 'Fulfilled';
  createdAt: string;
}

export interface OutsideWorkRequest {
  id: string;
  jobCardId: string;
  vehicleNumber: string;
  vendor: string;
  reason: string;
  estimate: number;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  completionStatus: 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface WorkshopReports {
  downtimeByVehicle: { vehicleNumber: string; jobCard: string; downtimeHours: number; reason: string; status: string }[];
  jobCostVsEstimate: { jobCardNumber: string; vehicleNumber: string; estimateTotal: number; actualCost: number; variance: number; accuracy: number }[];
  waitingPartsAging: { jobCardNumber: string; vehicleNumber: string; partName: string; partNumber: string; daysWaiting: number; supplier: string }[];
  warrantyRecovered: { jobCardNumber: string; vehicleNumber: string; claimNumber: string; claimedAmount: number; status: string; oem: string }[];
}

export const workshopApi = {
  getKPIs: () => unwrap<WorkshopKPIs>(api.get('/workshop/kpis')),

  getDashboardWidgets: () => unwrap<{
    bayBoard: WorkshopBay[];
    waitingPartsQueue: PartsDemandItem[];
    estimateApprovalQueue: Estimate[];
    qcQueue: JobCard[];
  }>(api.get('/workshop/widgets')),

  getJobCards: (query?: { status?: string; vehicle?: string; mechanic?: string; priority?: string }) =>
    unwrap<JobCard[]>(api.get('/workshop/job-cards', { params: query })),

  getJobCardById: (id: string) => unwrap<JobCard>(api.get(`/workshop/job-cards/${id}`)),

  createJobCard: (data: Partial<JobCard>) => unwrap<JobCard>(api.post('/workshop/job-cards', data)),

  updateJobCard: (id: string, data: Partial<JobCard> & { updatedBy?: string }) =>
    unwrap<JobCard>(api.patch(`/workshop/job-cards/${id}`, data)),

  getBays: () => unwrap<WorkshopBay[]>(api.get('/workshop/bays')),

  updateBay: (id: string, data: Partial<WorkshopBay>) =>
    unwrap<WorkshopBay>(api.patch(`/workshop/bays/${id}`, data)),

  getMechanics: () => unwrap<WorkshopMechanic[]>(api.get('/workshop/mechanics')),

  assignMechanic: (id: string, payload: { jobCardNumber?: string; bayName?: string }) =>
    unwrap<WorkshopMechanic>(api.post(`/workshop/mechanics/${id}/assign`, payload)),

  getPmSchedules: () => unwrap<PmSchedule[]>(api.get('/workshop/pm-due')),

  schedulePmSlot: (id: string, payload: { proposedSlot: string; confirmedSlot?: string; notes?: string }) =>
    unwrap<PmSchedule>(api.post(`/workshop/pm-due/${id}/schedule`, payload)),

  createJobCardFromPm: (id: string) => unwrap<JobCard>(api.post(`/workshop/pm-due/${id}/create-job-card`)),

  requestPmOverride: (id: string, reason: string) =>
    unwrap<PmSchedule>(api.post(`/workshop/pm-due/${id}/override`, { reason })),

  getEstimates: () => unwrap<Estimate[]>(api.get('/workshop/estimates')),

  createEstimate: (data: Partial<Estimate>) => unwrap<Estimate>(api.post('/workshop/estimates', data)),

  updateEstimate: (id: string, data: Partial<Estimate>) =>
    unwrap<Estimate>(api.patch(`/workshop/estimates/${id}`, data)),

  getPartsDemand: () => unwrap<PartsDemandItem[]>(api.get('/workshop/parts-demand')),

  requestPartDemand: (id: string) => unwrap<PartsDemandItem>(api.post(`/workshop/parts-demand/${id}/request`)),

  reservePart: (id: string) => unwrap<PartsDemandItem>(api.post(`/workshop/parts-demand/${id}/reserve`)),

  getOutsideWorkRequests: () => unwrap<OutsideWorkRequest[]>(api.get('/workshop/outside-work')),

  createOutsideWorkRequest: (data: Partial<OutsideWorkRequest>) =>
    unwrap<OutsideWorkRequest>(api.post('/workshop/outside-work', data)),

  getQCQueue: () => unwrap<JobCard[]>(api.get('/workshop/qc-queue')),

  approveQC: (id: string, data: { checklist: QCChecklistItem[]; passed: boolean; notes?: string }) =>
    unwrap<JobCard>(api.post(`/workshop/job-cards/${id}/qc-approve`, data)),

  recordRoadTest: (id: string, data: { passed: boolean; notes: string }) =>
    unwrap<JobCard>(api.post(`/workshop/job-cards/${id}/road-test`, data)),

  getReports: () => unwrap<WorkshopReports>(api.get('/workshop/reports')),
};
