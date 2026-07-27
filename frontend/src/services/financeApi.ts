import api from './api';

const unwrap = <T>(promise: Promise<{ data: T }>) => promise.then((res) => res.data);

export interface FinanceKPIs {
  budgetVsActualCommitment: {
    allocated: number;
    actual: number;
    committed: number;
    variancePercent: number;
  };
  pendingPaymentRuns: number;
  pendingApprovals: number;
  vendorBillsPending: number;
  customerInvoicesPending: number;
  budgetExceptions: number;
  workingCapitalCycleDays: number;
  costTraceabilityPercent: number;
  costPerKm: number;
  budgetVariancePercent: number;
}

export interface BudgetCostCenterItem {
  head: string;
  allocated: number;
  actual: number;
  committed: number;
  variance: number;
}

export interface MonthlyTrendItem {
  month: string;
  budget: number;
  actual: number;
}

export interface BudgetHistoryItem {
  date: string;
  event: string;
  amount: number;
  user: string;
}

export interface BudgetRecord {
  id: string;
  budgetId: string;
  costCenter: string;
  department: string;
  month: string;
  budgetAmount: number;
  actualAmount: number;
  committedAmount: number;
  variance: number;
  percentage: number;
  status: 'Normal' | 'Warning' | 'Exception';
  costCentersJson: string | BudgetCostCenterItem[];
  monthlyTrendJson: string | MonthlyTrendItem[];
  historyJson: string | BudgetHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface VendorBillRecord {
  id: string;
  billNumber: string;
  vendor: string;
  tripReference: string;
  contract: string;
  expectedAmount: number;
  billedAmount: number;
  tolerance: number;
  deviation: number;
  tax: number;
  status: 'Pending' | 'Verified' | 'Approved' | 'Rejected' | 'Paid';
  autoMatchStatus: 'Matched' | 'Mismatch' | 'ManualReview';
  expectedVsBilledJson: string | any;
  toleranceCheckJson: string | any;
  deviationQueueJson: string | any;
  debitNotesJson: string | any[];
  taxSummaryJson: string | any;
  rateComputationJson: string | any;
  dieselEscalationJson: string | any;
  detentionJson: string | any;
  penaltiesJson: string | any;
  approvalTimelineJson: string | any[];
  auditTrailJson: string | any[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInvoiceRecord {
  id: string;
  invoiceNumber: string;
  customer: string;
  tripsJson: string | string[];
  invoiceAmount: number;
  gst: number;
  invoiceDate: string;
  status: 'Draft' | 'Approved' | 'Released' | 'Cancelled';
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid' | 'Disputed';
  podTriggerJson: string | any;
  annexureJson: string | any;
  disputedLinesJson: string | any[];
  gstFieldsJson: string | any;
  auditTrailJson: string | any[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRunRecord {
  id: string;
  batchNumber: string;
  vendor: string;
  amount: number;
  paymentMode: 'Bank Transfer' | 'UPI Batch' | 'FASTag Ledger' | 'Fuel Card Ledger';
  approval: 'Pending Maker' | 'Pending Checker' | 'Approved' | 'Released' | 'Rejected';
  status: 'Queued' | 'Processing' | 'Released' | 'Failed';
  releaseDate: string;
  billsIncludedJson: string | string[];
  bankStatusJson: string | any;
  paymentQueueJson: string | any;
  makerCheckerJson: string | any;
  upiBatchJson: string | any;
  vendorPaymentsJson: string | any[];
  fastagLedgerJson: string | any;
  fuelCardLedgerJson: string | any;
  approvalTimelineJson: string | any[];
  releaseStatusJson: string | any;
  auditTrailJson: string | any[];
  createdAt: string;
  updatedAt: string;
}

export interface DriverSettlementRecord {
  id: string;
  driverName: string;
  driverId?: string | null;
  tripId: string;
  advance: number;
  expense: number;
  bhatta: number;
  recovery: number;
  incentive: number;
  settlement: number;
  status: 'Draft' | 'Approved' | 'Disputed' | 'Paid';
  settlementDraftJson: string | any;
  disputeStatusJson: string | any;
  payrollExportStatusJson: string | any;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialApprovalRecord {
  id: string;
  approvalNumber: string;
  flowCode: 'AF-07' | 'AF-11';
  flowName: string;
  entityType: string;
  entityId: string;
  entityRef: string;
  amount: number;
  requestedBy: string;
  approver?: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string | null;
  budgetCommitmentJson: string | any;
  timelineJson: string | any[];
  historyJson: string | any[];
  createdAt: string;
  updatedAt: string;
}

export interface ErpExportRecord {
  id: string;
  exportNumber: string;
  entityType: string;
  format: 'SAP' | 'Oracle' | 'Tally' | 'Excel' | 'CSV' | 'PDF';
  recordCount: number;
  amountTotal: number;
  status: 'Completed' | 'Failed' | 'In Progress';
  exportedBy: string;
  historyJson: string | any[];
  createdAt: string;
  updatedAt: string;
}

const unwrapWithFallback = <T>(promise: Promise<{ data: T }>, fallback: T): Promise<T> =>
  promise.then((res) => res.data).catch(() => fallback);

const MOCK_KPIS: FinanceKPIs = {
  budgetVsActualCommitment: { allocated: 8800000, actual: 7570000, committed: 1050000, variancePercent: 5.2 },
  pendingPaymentRuns: 4,
  pendingApprovals: 6,
  vendorBillsPending: 8,
  customerInvoicesPending: 12,
  budgetExceptions: 2,
  workingCapitalCycleDays: 28,
  costTraceabilityPercent: 98.4,
  costPerKm: 38.45,
  budgetVariancePercent: -4.8,
};

const MOCK_WIDGETS = {
  budgetOverview: [
    { id: 'b-01', budgetId: 'BDG-2026-CC101', costCenter: 'CC-101', department: 'POL Fuel Logistics', month: '2026-07', budgetAmount: 4500000, actualAmount: 3820000, committedAmount: 450000, variance: 230000, percentage: 84.8, status: 'Normal' },
    { id: 'b-02', budgetId: 'BDG-2026-CC102', costCenter: 'CC-102', department: 'Fleet Workshop & Maintenance', month: '2026-07', budgetAmount: 1800000, actualAmount: 1650000, committedAmount: 320000, variance: -170000, percentage: 109.4, status: 'Exception' },
  ],
  paymentQueue: [
    { id: 'pr-01', batchNumber: 'PAY-BATCH-2026-101', vendor: 'Mahalaxmi Transport Services', amount: 3250000, paymentMode: 'Bank Transfer', approval: 'Pending Checker', status: 'Queued' },
  ],
  approvalQueue: [
    { id: 'fa-01', approvalNumber: 'APV-2026-701', flowCode: 'AF-07', flowName: 'Vendor Bill High-Value Approval', entityType: 'Vendor Bill', entityRef: 'VBN-2026-881', amount: 145000, requestedBy: 'Vendor Portal', status: 'Pending' },
  ],
  closeBlockers: [
    { id: 'BLK-01', title: 'Cost-sweep exception CC-102', category: 'BP-27 Variance', status: 'Blocked', action: 'Requires AF-11 approval' },
    { id: 'BLK-02', title: 'Unmatched vendor bills (DEV-OVERBILL-HIGH)', category: 'Vendor Bill Match', status: 'Blocked', action: 'R-12 negotiation pending' },
    { id: 'BLK-03', title: 'Unassigned trip freight claims (3 trips)', category: 'Trip Reconciliation', status: 'Warning', action: 'Dispatcher signoff needed' },
  ],
  monthlySpend: [
    { month: 'Apr', pol: 3950000, maintenance: 1550000, hire: 2150000, bhatta: 450000 },
    { month: 'May', pol: 4100000, maintenance: 1680000, hire: 2280000, bhatta: 480000 },
    { month: 'Jun', pol: 4250000, maintenance: 1720000, hire: 2350000, bhatta: 510000 },
    { month: 'Jul', pol: 3820000, maintenance: 1650000, hire: 2100000, bhatta: 470000 },
  ],
  budgetVariance: [
    { department: 'POL Fuel Logistics', costCenter: 'CC-101', allocated: 4500000, actual: 3820000, committed: 450000, variance: 230000, status: 'Normal' },
    { department: 'Fleet Workshop', costCenter: 'CC-102', allocated: 1800000, actual: 1650000, committed: 320000, variance: -170000, status: 'Exception' },
  ],
};

const MOCK_BUDGETS: BudgetRecord[] = [
  {
    id: 'b-01',
    budgetId: 'BDG-2026-CC101',
    costCenter: 'CC-101',
    department: 'POL Fuel Logistics',
    month: '2026-07',
    budgetAmount: 4500000,
    actualAmount: 3820000,
    committedAmount: 450000,
    variance: 230000,
    percentage: 84.8,
    status: 'Normal',
    costCentersJson: [
      { head: 'Diesel Procurement', allocated: 3500000, actual: 3020000, committed: 350000, variance: 130000 },
      { head: 'AdBlue / Lubricants', allocated: 1000000, actual: 800000, committed: 100000, variance: 100000 },
    ],
    monthlyTrendJson: [
      { month: 'Apr', budget: 4200000, actual: 3950000 },
      { month: 'May', budget: 4400000, actual: 4100000 },
      { month: 'Jun', budget: 4500000, actual: 4250000 },
      { month: 'Jul', budget: 4500000, actual: 3820000 },
    ],
    historyJson: [{ date: '2026-07-01', event: 'Monthly Budget Allocated', amount: 4500000, user: 'Finance Director' }],
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-24T00:00:00Z',
  },
  {
    id: 'b-02',
    budgetId: 'BDG-2026-CC102',
    costCenter: 'CC-102',
    department: 'Fleet Workshop & Maintenance',
    month: '2026-07',
    budgetAmount: 1800000,
    actualAmount: 1650000,
    committedAmount: 320000,
    variance: -170000,
    percentage: 109.4,
    status: 'Exception',
    costCentersJson: [
      { head: 'Spare Parts Inventory', allocated: 1000000, actual: 950000, committed: 200000, variance: -150000 },
      { head: 'Outside Vendor Jobcards', allocated: 800000, actual: 700000, committed: 120000, variance: -20000 },
    ],
    monthlyTrendJson: [
      { month: 'Apr', budget: 1600000, actual: 1550000 },
      { month: 'May', budget: 1700000, actual: 1680000 },
      { month: 'Jun', budget: 1750000, actual: 1720000 },
      { month: 'Jul', budget: 1800000, actual: 1650000 },
    ],
    historyJson: [{ date: '2026-07-15', event: 'AF-11 Budget Exception Triggered', amount: 170000, user: 'Workshop Lead' }],
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-24T00:00:00Z',
  },
];

const MOCK_VENDOR_BILLS: VendorBillRecord[] = [
  {
    id: 'vb-01',
    billNumber: 'VBN-2026-881',
    vendor: 'Mahalaxmi Transport Services',
    tripReference: 'TRIP-2026-4401',
    contract: 'CTR-MH-009',
    expectedAmount: 145000,
    billedAmount: 145000,
    tolerance: 2.0,
    deviation: 0,
    tax: 26100,
    status: 'Pending',
    autoMatchStatus: 'Matched',
    expectedVsBilledJson: { expectedFreight: 140000, billedFreight: 140000, detentionExpected: 5000, detentionBilled: 5000 },
    toleranceCheckJson: { autoPassed: true, deviationPercent: 0 },
    deviationQueueJson: { queue: 'None' },
    debitNotesJson: [],
    taxSummaryJson: { gstRate: '18%', cgst: 13050, sgst: 13050 },
    rateComputationJson: { baseRatePerKm: 32, distanceKm: 437.5 },
    dieselEscalationJson: { baseDieselPrice: 90, currentDieselPrice: 94.5, escalationClause: '3.5%' },
    detentionJson: { freeHours: 24, detentionHours: 10, ratePerHour: 500 },
    penaltiesJson: { SLA_Delay: 0, POD_Damage: 0 },
    approvalTimelineJson: [{ step: 'Submission', status: 'Passed', timestamp: '2026-07-23' }],
    auditTrailJson: [{ user: 'Vendor Portal', action: 'Bill Submitted', timestamp: '2026-07-23' }],
    createdAt: '2026-07-23T10:00:00Z',
    updatedAt: '2026-07-24T00:00:00Z',
  },
];

const MOCK_CUSTOMER_INVOICES: CustomerInvoiceRecord[] = [
  {
    id: 'ci-01',
    invoiceNumber: 'INV-2026-301',
    customer: 'Flipkart India Pvt Ltd',
    tripsJson: ['TRIP-2026-4401', 'TRIP-2026-4402'],
    invoiceAmount: 385000,
    gst: 69300,
    invoiceDate: '2026-07-20T00:00:00Z',
    status: 'Approved',
    paymentStatus: 'Unpaid',
    podTriggerJson: { ePodVerified: true, verifiedAt: '2026-07-19 16:30' },
    annexureJson: { totalTrips: 2, totalWeightMT: 48, ratePerMT: 8020 },
    disputedLinesJson: [],
    gstFieldsJson: { gstin: '27AAACF1234F1Z0', hsnCode: '996511', placeOfSupply: 'Maharashtra (27)' },
    auditTrailJson: [{ user: 'Billing Lead', action: 'POD Verified & Invoice Generated', timestamp: '2026-07-20' }],
    createdAt: '2026-07-20T00:00:00Z',
    updatedAt: '2026-07-24T00:00:00Z',
  },
];

const MOCK_PAYMENT_RUNS: PaymentRunRecord[] = [
  {
    id: 'pr-01',
    batchNumber: 'PAY-BATCH-2026-101',
    vendor: 'Mahalaxmi Transport & Express Logistics',
    amount: 3250000,
    paymentMode: 'Bank Transfer',
    approval: 'Pending Checker',
    status: 'Queued',
    releaseDate: '2026-07-25T00:00:00Z',
    billsIncludedJson: ['VBN-2026-881', 'VBN-2026-882'],
    bankStatusJson: { bank: 'HDFC Bank Corporate AP', account: 'XXXX-XXXX-8812', status: 'File Validated' },
    paymentQueueJson: { priority: 'High', scheduledTime: '2026-07-25 11:00 AM' },
    makerCheckerJson: { maker: 'R-14 Finance Executive', makerApprovedAt: '2026-07-24 09:30', checker: 'R-14 Finance Manager', checkerStatus: 'Pending Signoff' },
    upiBatchJson: {},
    vendorPaymentsJson: [
      { vendor: 'Mahalaxmi Transport', amount: 1450000, bankAccount: 'HDFC0001234' },
      { vendor: 'Express Logistics', amount: 1800000, bankAccount: 'ICIC0005678' }
    ],
    fastagLedgerJson: {},
    fuelCardLedgerJson: {},
    approvalTimelineJson: [{ step: 'Maker Batch Creation', status: 'Completed', timestamp: '2026-07-24 09:30' }],
    auditTrailJson: [{ user: 'Finance Executive', action: 'Created Batch PAY-BATCH-2026-101', timestamp: '2026-07-24' }],
    createdAt: '2026-07-24T09:30:00Z',
    updatedAt: '2026-07-24T00:00:00Z',
  },
];

const MOCK_DRIVER_SETTLEMENTS: DriverSettlementRecord[] = [
  {
    id: 'ds-01',
    driverName: 'Rajesh Kumar',
    driverId: 'DRV-401',
    tripId: 'TRIP-2026-4401',
    advance: 12000,
    expense: 4500,
    bhatta: 3500,
    recovery: 500,
    incentive: 1000,
    settlement: 20500,
    status: 'Approved',
    settlementDraftJson: { fuelCardSpent: 8500, tollSpent: 1200, foodBhatta: 3500 },
    disputeStatusJson: { disputed: false },
    payrollExportStatusJson: { exportedToPayroll: true, month: '2026-07' },
    createdAt: '2026-07-22T00:00:00Z',
    updatedAt: '2026-07-24T00:00:00Z',
  },
];

const MOCK_APPROVALS: FinancialApprovalRecord[] = [
  {
    id: 'fa-01',
    approvalNumber: 'APV-2026-701',
    flowCode: 'AF-07',
    flowName: 'Vendor Bill High-Value Approval',
    entityType: 'Vendor Bill',
    entityId: 'vb-01',
    entityRef: 'VBN-2026-881',
    amount: 145000,
    requestedBy: 'Vendor Portal (Auto Match)',
    approver: null,
    status: 'Pending',
    reason: 'Bill exceeds threshold ₹1,00,000 for auto-release',
    budgetCommitmentJson: { costCenter: 'CC-103', impact: 'Committed against Freight Hire budget' },
    timelineJson: [{ step: 'AF-07 Trigger', timestamp: '2026-07-23 11:00' }],
    historyJson: [],
    createdAt: '2026-07-23T11:00:00Z',
    updatedAt: '2026-07-24T00:00:00Z',
  },
];

const MOCK_EXPORTS: ErpExportRecord[] = [
  {
    id: 'ee-01',
    exportNumber: 'ERP-EXP-2026-091',
    entityType: 'AP Invoices',
    format: 'SAP',
    recordCount: 14,
    amountTotal: 1850000,
    status: 'Completed',
    exportedBy: 'Finance Manager',
    historyJson: [
      { action: 'Export Triggered', timestamp: '2026-07-21 18:00', format: 'SAP iDoc' },
      { action: 'File Transferred to SAP FTP', timestamp: '2026-07-21 18:02', status: 'ACK-RECEIVED' }
    ],
    createdAt: '2026-07-21T18:00:00Z',
    updatedAt: '2026-07-21T18:02:00Z',
  },
];

const MOCK_REPORTS = {
  budgetVsActual: [
    { category: 'POL Fuel Logistics', allocated: 4500000, actual: 3820000, committed: 450000, variance: 230000, status: 'Normal' },
    { category: 'Fleet Workshop & Maintenance', allocated: 1800000, actual: 1650000, committed: 320000, variance: -170000, status: 'Exception' },
    { category: 'Market Hired Freight', allocated: 2500000, actual: 2100000, committed: 280000, variance: 120000, status: 'Warning' },
  ],
  costPerKm: [
    { vehicleType: 'Multi-Axle Container (32ft)', totalKm: 48200, totalCost: 1850000, costPerKm: 38.38, benchmark: 40.0 },
    { vehicleType: 'Open Body Truck (16ft)', totalKm: 24100, totalCost: 780000, costPerKm: 32.36, benchmark: 34.5 },
    { vehicleType: 'Cold Chain Reefer', totalKm: 18500, totalCost: 890000, costPerKm: 48.11, benchmark: 46.0 },
  ],
  workingCapital: {
    dsoDays: 28,
    dpoDays: 34,
    workingCapitalGap: -6,
    cashConversionCycle: 18,
  },
  paymentStatus: [
    { mode: 'Bank Transfer (RTGS/NEFT)', count: 42, amount: 6450000, status: 'Completed' },
    { mode: 'Fuel Card Auto-Ledger', count: 128, amount: 2890000, status: 'Completed' },
    { mode: 'FASTag Toll Batches', count: 310, amount: 480000, status: 'Completed' },
    { mode: 'UPI Batch Release', count: 18, amount: 220000, status: 'Queued' },
  ],
  costTraceability: {
    totalTripExpenses: 8800000,
    fullyTraced: 8660000,
    unallocated: 140000,
    traceabilityScore: 98.4,
  },
  vendorPaymentSummary: [
    { vendor: 'Mahalaxmi Transport Services', grossBilled: 1450000, tdsDeducted: 29000, netPaid: 1421000, pending: 145200 },
    { vendor: 'Express Logistics Corp', grossBilled: 1890000, tdsDeducted: 37800, netPaid: 1654200, pending: 198000 },
  ],
  invoiceSummary: [
    { customer: 'Flipkart India Pvt Ltd', totalBilled: 3850000, totalPaid: 3465000, outstanding: 385000, dsoDays: 24 },
    { customer: 'Amazon Transportation Services', totalBilled: 2890000, totalPaid: 2650000, outstanding: 240000, dsoDays: 31 },
  ],
};

export const financeApi = {
  getKPIs: () => unwrapWithFallback<FinanceKPIs>(api.get('/finance/kpis'), MOCK_KPIS),

  getDashboardWidgets: () => unwrapWithFallback<any>(api.get('/finance/widgets'), MOCK_WIDGETS),

  getBudgets: (params?: { month?: string; costCenter?: string; department?: string; status?: string }) =>
    unwrapWithFallback<BudgetRecord[]>(api.get('/finance/budget', { params }), MOCK_BUDGETS),

  getBudgetById: (id: string) => unwrapWithFallback<BudgetRecord>(api.get(`/finance/budget/${id}`), MOCK_BUDGETS[0]),

  getVendorBills: (params?: { status?: string; vendor?: string; autoMatchStatus?: string }) =>
    unwrapWithFallback<VendorBillRecord[]>(api.get('/finance/vendor-bills', { params }), MOCK_VENDOR_BILLS),

  getVendorBillById: (id: string) => unwrapWithFallback<VendorBillRecord>(api.get(`/finance/vendor-bills/${id}`), MOCK_VENDOR_BILLS[0]),

  verifyVendorBill: (id: string) => unwrapWithFallback<VendorBillRecord>(api.post(`/finance/vendor-bills/${id}/verify`), { ...MOCK_VENDOR_BILLS[0], status: 'Verified' }),

  approveVendorBill: (id: string) => unwrapWithFallback<VendorBillRecord>(api.post(`/finance/vendor-bills/${id}/approve`), { ...MOCK_VENDOR_BILLS[0], status: 'Approved' }),

  rejectVendorBill: (id: string, reason: string) =>
    unwrapWithFallback<VendorBillRecord>(api.post(`/finance/vendor-bills/${id}/reject`, { reason }), { ...MOCK_VENDOR_BILLS[0], status: 'Rejected' }),

  getCustomerInvoices: (params?: { status?: string; customer?: string; paymentStatus?: string }) =>
    unwrapWithFallback<CustomerInvoiceRecord[]>(api.get('/finance/customer-invoices', { params }), MOCK_CUSTOMER_INVOICES),

  getCustomerInvoiceById: (id: string) => unwrapWithFallback<CustomerInvoiceRecord>(api.get(`/finance/customer-invoices/${id}`), MOCK_CUSTOMER_INVOICES[0]),

  releaseCustomerInvoice: (id: string) => unwrapWithFallback<CustomerInvoiceRecord>(api.post(`/finance/customer-invoices/${id}/release`), { ...MOCK_CUSTOMER_INVOICES[0], status: 'Released' }),

  exportCustomerInvoice: (id: string) => unwrapWithFallback<any>(api.get(`/finance/customer-invoices/${id}/export`), { invoiceNumber: 'INV-2026-301', customer: 'Flipkart India Pvt Ltd', amount: 385000, gst: 69300, total: 454300 }),

  getPaymentRuns: (params?: { status?: string; vendor?: string }) =>
    unwrapWithFallback<PaymentRunRecord[]>(api.get('/finance/payments', { params }), MOCK_PAYMENT_RUNS),

  getPaymentRunById: (id: string) => unwrapWithFallback<PaymentRunRecord>(api.get(`/finance/payments/${id}`), MOCK_PAYMENT_RUNS[0]),

  releasePaymentRun: (id: string) => unwrapWithFallback<PaymentRunRecord>(api.post(`/finance/payments/${id}/release`), { ...MOCK_PAYMENT_RUNS[0], status: 'Released', approval: 'Released' }),

  createPaymentRunBatch: (body: any) => unwrapWithFallback<PaymentRunRecord>(api.post('/finance/payments/batch-create', body), { ...MOCK_PAYMENT_RUNS[0], id: `pr-${Date.now()}` }),

  getDriverSettlements: (params?: { status?: string; driverName?: string }) =>
    unwrapWithFallback<DriverSettlementRecord[]>(api.get('/finance/driver-settlements', { params }), MOCK_DRIVER_SETTLEMENTS),

  getApprovals: (params?: { flowCode?: string; status?: string }) =>
    unwrapWithFallback<FinancialApprovalRecord[]>(api.get('/finance/approvals', { params }), MOCK_APPROVALS),

  approveFinancialApproval: (id: string, comment?: string) =>
    unwrapWithFallback<FinancialApprovalRecord>(api.post(`/finance/approvals/${id}/approve`, { comment }), { ...MOCK_APPROVALS[0], status: 'Approved' }),

  rejectFinancialApproval: (id: string, reason: string) =>
    unwrapWithFallback<FinancialApprovalRecord>(api.post(`/finance/approvals/${id}/reject`, { reason }), { ...MOCK_APPROVALS[0], status: 'Rejected' }),

  getReports: () => unwrapWithFallback<any>(api.get('/finance/reports'), MOCK_REPORTS),

  getExports: () => unwrapWithFallback<ErpExportRecord[]>(api.get('/finance/exports'), MOCK_EXPORTS),

  triggerErpExport: (body: { entityType: string; format: string }) =>
    unwrapWithFallback<ErpExportRecord>(api.post('/finance/exports/trigger', body), { ...MOCK_EXPORTS[0], exportNumber: `ERP-EXP-2026-${Math.floor(100 + Math.random() * 900)}` }),
};

