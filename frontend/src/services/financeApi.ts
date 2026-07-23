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

export const financeApi = {
  getKPIs: () => unwrap<FinanceKPIs>(api.get('/finance/kpis')),

  getDashboardWidgets: () => unwrap<any>(api.get('/finance/widgets')),

  getBudgets: (params?: { month?: string; costCenter?: string; department?: string; status?: string }) =>
    unwrap<BudgetRecord[]>(api.get('/finance/budget', { params })),

  getBudgetById: (id: string) => unwrap<BudgetRecord>(api.get(`/finance/budget/${id}`)),

  getVendorBills: (params?: { status?: string; vendor?: string; autoMatchStatus?: string }) =>
    unwrap<VendorBillRecord[]>(api.get('/finance/vendor-bills', { params })),

  getVendorBillById: (id: string) => unwrap<VendorBillRecord>(api.get(`/finance/vendor-bills/${id}`)),

  verifyVendorBill: (id: string) => unwrap<VendorBillRecord>(api.post(`/finance/vendor-bills/${id}/verify`)),

  approveVendorBill: (id: string) => unwrap<VendorBillRecord>(api.post(`/finance/vendor-bills/${id}/approve`)),

  rejectVendorBill: (id: string, reason: string) =>
    unwrap<VendorBillRecord>(api.post(`/finance/vendor-bills/${id}/reject`, { reason })),

  getCustomerInvoices: (params?: { status?: string; customer?: string; paymentStatus?: string }) =>
    unwrap<CustomerInvoiceRecord[]>(api.get('/finance/customer-invoices', { params })),

  getCustomerInvoiceById: (id: string) => unwrap<CustomerInvoiceRecord>(api.get(`/finance/customer-invoices/${id}`)),

  releaseCustomerInvoice: (id: string) => unwrap<CustomerInvoiceRecord>(api.post(`/finance/customer-invoices/${id}/release`)),

  exportCustomerInvoice: (id: string) => unwrap<any>(api.get(`/finance/customer-invoices/${id}/export`)),

  getPaymentRuns: (params?: { status?: string; vendor?: string }) =>
    unwrap<PaymentRunRecord[]>(api.get('/finance/payments', { params })),

  getPaymentRunById: (id: string) => unwrap<PaymentRunRecord>(api.get(`/finance/payments/${id}`)),

  releasePaymentRun: (id: string) => unwrap<PaymentRunRecord>(api.post(`/finance/payments/${id}/release`)),

  createPaymentRunBatch: (body: any) => unwrap<PaymentRunRecord>(api.post('/finance/payments/batch-create', body)),

  getDriverSettlements: (params?: { status?: string; driverName?: string }) =>
    unwrap<DriverSettlementRecord[]>(api.get('/finance/driver-settlements', { params })),

  getApprovals: (params?: { flowCode?: string; status?: string }) =>
    unwrap<FinancialApprovalRecord[]>(api.get('/finance/approvals', { params })),

  approveFinancialApproval: (id: string, comment?: string) =>
    unwrap<FinancialApprovalRecord>(api.post(`/finance/approvals/${id}/approve`, { comment })),

  rejectFinancialApproval: (id: string, reason: string) =>
    unwrap<FinancialApprovalRecord>(api.post(`/finance/approvals/${id}/reject`, { reason })),

  getReports: () => unwrap<any>(api.get('/finance/reports')),

  getExports: () => unwrap<ErpExportRecord[]>(api.get('/finance/exports')),

  triggerErpExport: (body: { entityType: string; format: string }) =>
    unwrap<ErpExportRecord>(api.post('/finance/exports/trigger', body)),
};
