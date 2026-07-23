import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getKPIs() {
    const budgets = await this.prisma.budget.findMany();
    const vendorBills = await this.prisma.vendorBill.findMany();
    const customerInvoices = await this.prisma.customerInvoice.findMany();
    const paymentRuns = await this.prisma.paymentRun.findMany();
    const approvals = await this.prisma.financialApproval.findMany({ where: { status: 'Pending' } });

    const totalBudget = budgets.reduce((acc, b) => acc + b.budgetAmount, 0);
    const totalActual = budgets.reduce((acc, b) => acc + b.actualAmount, 0);
    const totalCommitted = budgets.reduce((acc, b) => acc + b.committedAmount, 0);

    const pendingPaymentRuns = paymentRuns.filter((p) => p.status === 'Queued' || p.approval === 'Pending Checker').length;
    const pendingApprovals = approvals.length;
    const vendorBillsPending = vendorBills.filter((v) => v.status === 'Pending' || v.status === 'Verified').length;
    const customerInvoicesPending = customerInvoices.filter((c) => c.paymentStatus === 'Unpaid' || c.status === 'Approved').length;
    const budgetExceptions = budgets.filter((b) => b.status === 'Exception').length + approvals.filter((a) => a.flowCode === 'AF-11').length;

    return {
      budgetVsActualCommitment: {
        allocated: totalBudget || 8800000,
        actual: totalActual || 7570000,
        committed: totalCommitted || 1050000,
        variancePercent: 5.2,
      },
      pendingPaymentRuns,
      pendingApprovals,
      vendorBillsPending,
      customerInvoicesPending,
      budgetExceptions,
      workingCapitalCycleDays: 28,
      costTraceabilityPercent: 98.4,
      costPerKm: 38.45,
      budgetVariancePercent: -4.8,
    };
  }

  async getDashboardWidgets() {
    const budgets = await this.prisma.budget.findMany();
    const paymentRuns = await this.prisma.paymentRun.findMany();
    const approvals = await this.prisma.financialApproval.findMany({ where: { status: 'Pending' } });
    const vendorBills = await this.prisma.vendorBill.findMany({ where: { autoMatchStatus: 'Mismatch' } });

    return {
      budgetOverview: budgets,
      paymentQueue: paymentRuns,
      approvalQueue: approvals,
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
      budgetVariance: budgets.map((b) => ({
        department: b.department,
        costCenter: b.costCenter,
        allocated: b.budgetAmount,
        actual: b.actualAmount,
        committed: b.committedAmount,
        variance: b.variance,
        status: b.status,
      })),
    };
  }

  // 1. Budget
  async getBudgets(query?: { month?: string; costCenter?: string; department?: string; status?: string }) {
    const where: any = {};
    if (query?.month) where.month = query.month;
    if (query?.costCenter) where.costCenter = query.costCenter;
    if (query?.department) where.department = query.department;
    if (query?.status) where.status = query.status;

    return this.prisma.budget.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async getBudgetById(id: string) {
    const budget = await this.prisma.budget.findUnique({ where: { id } });
    if (!budget) {
      const budgetByCode = await this.prisma.budget.findUnique({ where: { budgetId: id } });
      if (!budgetByCode) throw new NotFoundException(`Budget ${id} not found`);
      return budgetByCode;
    }
    return budget;
  }

  // 2. Vendor Bills
  async getVendorBills(query?: { status?: string; vendor?: string; autoMatchStatus?: string }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.vendor) where.vendor = { contains: query.vendor, mode: 'insensitive' };
    if (query?.autoMatchStatus) where.autoMatchStatus = query.autoMatchStatus;

    return this.prisma.vendorBill.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async getVendorBillById(id: string) {
    const bill = await this.prisma.vendorBill.findUnique({ where: { id } });
    if (!bill) {
      const billByNo = await this.prisma.vendorBill.findUnique({ where: { billNumber: id } });
      if (!billByNo) throw new NotFoundException(`Vendor Bill ${id} not found`);
      return billByNo;
    }
    return bill;
  }

  async verifyVendorBill(id: string) {
    const bill = await this.getVendorBillById(id);
    return this.prisma.vendorBill.update({
      where: { id: bill.id },
      data: {
        status: 'Verified',
        auditTrailJson: JSON.stringify([
          ...JSON.parse(typeof bill.auditTrailJson === 'string' ? bill.auditTrailJson : JSON.stringify(bill.auditTrailJson || [])),
          { user: 'R-14 Finance Manager', action: '3-Way Match Verified', timestamp: new Date().toISOString() },
        ]),
      },
    });
  }

  async approveVendorBill(id: string) {
    const bill = await this.getVendorBillById(id);
    return this.prisma.vendorBill.update({
      where: { id: bill.id },
      data: {
        status: 'Approved',
        approvalTimelineJson: JSON.stringify([
          ...JSON.parse(typeof bill.approvalTimelineJson === 'string' ? bill.approvalTimelineJson : JSON.stringify(bill.approvalTimelineJson || [])),
          { step: 'AF-07 Vendor Bill Approval', status: 'Approved by R-14 Finance Manager', timestamp: new Date().toISOString() },
        ]),
        auditTrailJson: JSON.stringify([
          ...JSON.parse(typeof bill.auditTrailJson === 'string' ? bill.auditTrailJson : JSON.stringify(bill.auditTrailJson || [])),
          { user: 'R-14 Finance Manager', action: 'Approved Bill for Payment Queue (AF-07)', timestamp: new Date().toISOString() },
        ]),
      },
    });
  }

  async rejectVendorBill(id: string, reason: string) {
    const bill = await this.getVendorBillById(id);
    return this.prisma.vendorBill.update({
      where: { id: bill.id },
      data: {
        status: 'Rejected',
        auditTrailJson: JSON.stringify([
          ...JSON.parse(typeof bill.auditTrailJson === 'string' ? bill.auditTrailJson : JSON.stringify(bill.auditTrailJson || [])),
          { user: 'R-14 Finance Manager', action: `Rejected Bill: ${reason}`, timestamp: new Date().toISOString() },
        ]),
      },
    });
  }

  // 3. Customer Invoices
  async getCustomerInvoices(query?: { status?: string; customer?: string; paymentStatus?: string }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.customer) where.customer = { contains: query.customer, mode: 'insensitive' };
    if (query?.paymentStatus) where.paymentStatus = query.paymentStatus;

    return this.prisma.customerInvoice.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async getCustomerInvoiceById(id: string) {
    const inv = await this.prisma.customerInvoice.findUnique({ where: { id } });
    if (!inv) {
      const invByNo = await this.prisma.customerInvoice.findUnique({ where: { invoiceNumber: id } });
      if (!invByNo) throw new NotFoundException(`Customer Invoice ${id} not found`);
      return invByNo;
    }
    return inv;
  }

  async releaseCustomerInvoice(id: string) {
    const inv = await this.getCustomerInvoiceById(id);
    return this.prisma.customerInvoice.update({
      where: { id: inv.id },
      data: {
        status: 'Released',
        auditTrailJson: JSON.stringify([
          ...JSON.parse(typeof inv.auditTrailJson === 'string' ? inv.auditTrailJson : JSON.stringify(inv.auditTrailJson || [])),
          { user: 'R-14 Finance Manager', action: 'Invoice Released to Customer Portal', timestamp: new Date().toISOString() },
        ]),
      },
    });
  }

  async exportCustomerInvoice(id: string) {
    const inv = await this.getCustomerInvoiceById(id);
    return {
      invoiceNumber: inv.invoiceNumber,
      customer: inv.customer,
      amount: inv.invoiceAmount,
      gst: inv.gst,
      total: inv.invoiceAmount + inv.gst,
      invoiceDate: inv.invoiceDate,
      trips: typeof inv.tripsJson === 'string' ? JSON.parse(inv.tripsJson) : inv.tripsJson,
      annexure: typeof inv.annexureJson === 'string' ? JSON.parse(inv.annexureJson) : inv.annexureJson,
      gstFields: typeof inv.gstFieldsJson === 'string' ? JSON.parse(inv.gstFieldsJson) : inv.gstFieldsJson,
      exportFormat: 'PDF Annexure',
      generatedAt: new Date().toISOString(),
    };
  }

  // 4. Payments
  async getPaymentRuns(query?: { status?: string; vendor?: string }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.vendor) where.vendor = { contains: query.vendor, mode: 'insensitive' };

    return this.prisma.paymentRun.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async getPaymentRunById(id: string) {
    const pr = await this.prisma.paymentRun.findUnique({ where: { id } });
    if (!pr) {
      const prByNo = await this.prisma.paymentRun.findUnique({ where: { batchNumber: id } });
      if (!prByNo) throw new NotFoundException(`Payment Run ${id} not found`);
      return prByNo;
    }
    return pr;
  }

  async releasePaymentRun(id: string) {
    const pr = await this.getPaymentRunById(id);
    return this.prisma.paymentRun.update({
      where: { id: pr.id },
      data: {
        approval: 'Released',
        status: 'Released',
        releaseStatusJson: JSON.stringify({ released: true, releasedBy: 'R-14 Finance Manager', bankTxnId: `TXN-HDFC-${Math.floor(100000 + Math.random() * 900000)}` }),
        auditTrailJson: JSON.stringify([
          ...JSON.parse(typeof pr.auditTrailJson === 'string' ? pr.auditTrailJson : JSON.stringify(pr.auditTrailJson || [])),
          { user: 'R-14 Finance Manager', action: 'Checker Batch Released (AF-07 Dual Authorization)', timestamp: new Date().toISOString() },
        ]),
      },
    });
  }

  async createPaymentRunBatch(body: any) {
    const batchNumber = `PAY-BATCH-2026-${Math.floor(100 + Math.random() * 900)}`;
    return this.prisma.paymentRun.create({
      data: {
        batchNumber,
        vendor: body.vendor || 'Multiple Vendors Batch',
        amount: body.amount || 500000,
        paymentMode: body.paymentMode || 'Bank Transfer',
        approval: 'Pending Checker',
        status: 'Queued',
        releaseDate: new Date(),
        billsIncludedJson: JSON.stringify(body.bills || []),
        bankStatusJson: JSON.stringify({ bank: body.bank || 'HDFC Enterprise AP', accountNo: 'XXXX-XXXX-8812' }),
        paymentQueueJson: JSON.stringify({ priority: body.priority || 'Normal' }),
        makerCheckerJson: JSON.stringify({ maker: 'R-14 Finance Engine', makerTimestamp: new Date().toISOString(), checkerStatus: 'Pending Signoff' }),
        vendorPaymentsJson: JSON.stringify(body.vendorPayments || []),
        approvalTimelineJson: JSON.stringify([{ step: 'Maker Batch Creation', status: 'Completed', timestamp: new Date().toISOString() }]),
        auditTrailJson: JSON.stringify([{ user: 'R-14 Finance Manager', action: `Created Batch ${batchNumber}`, timestamp: new Date().toISOString() }]),
      },
    });
  }

  // 5. Driver Settlements
  async getDriverSettlements(query?: { status?: string; driverName?: string }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.driverName) where.driverName = { contains: query.driverName, mode: 'insensitive' };

    return this.prisma.driverSettlement.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  // 6. Approvals (AF-07, AF-11)
  async getApprovals(query?: { flowCode?: string; status?: string }) {
    const where: any = {};
    if (query?.flowCode) where.flowCode = query.flowCode;
    if (query?.status) where.status = query.status;

    return this.prisma.financialApproval.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async approveFinancialApproval(id: string, comment?: string) {
    const apv = await this.prisma.financialApproval.findUnique({ where: { id } });
    if (!apv) throw new NotFoundException(`Approval ${id} not found`);

    return this.prisma.financialApproval.update({
      where: { id },
      data: {
        status: 'Approved',
        reason: comment || apv.reason,
        approver: 'R-14 Finance Manager',
        historyJson: JSON.stringify([
          ...JSON.parse(typeof apv.historyJson === 'string' ? apv.historyJson : JSON.stringify(apv.historyJson || [])),
          { action: 'Approved', user: 'R-14 Finance Manager', timestamp: new Date().toISOString(), comment },
        ]),
      },
    });
  }

  async rejectFinancialApproval(id: string, reason: string) {
    const apv = await this.prisma.financialApproval.findUnique({ where: { id } });
    if (!apv) throw new NotFoundException(`Approval ${id} not found`);

    return this.prisma.financialApproval.update({
      where: { id },
      data: {
        status: 'Rejected',
        reason,
        approver: 'R-14 Finance Manager',
        historyJson: JSON.stringify([
          ...JSON.parse(typeof apv.historyJson === 'string' ? apv.historyJson : JSON.stringify(apv.historyJson || [])),
          { action: 'Rejected', user: 'R-14 Finance Manager', timestamp: new Date().toISOString(), reason },
        ]),
      },
    });
  }

  // 7. Reports
  async getReports() {
    return {
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
  }

  // 8. Exports
  async getExports() {
    return this.prisma.erpExport.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async triggerErpExport(body: { entityType: string; format: string }) {
    const exportNumber = `ERP-EXP-2026-${Math.floor(100 + Math.random() * 900)}`;
    return this.prisma.erpExport.create({
      data: {
        exportNumber,
        entityType: body.entityType || 'General Ledger',
        format: body.format || 'SAP',
        recordCount: Math.floor(10 + Math.random() * 50),
        amountTotal: Math.floor(500000 + Math.random() * 2000000),
        status: 'Completed',
        exportedBy: 'R-14 Finance Manager',
        historyJson: JSON.stringify([
          { action: `${body.format || 'SAP'} Export Triggered`, timestamp: new Date().toISOString() },
          { action: 'File Generated and Audited', timestamp: new Date().toISOString() },
        ]),
      },
    });
  }
}
