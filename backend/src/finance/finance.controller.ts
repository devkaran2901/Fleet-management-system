import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('kpis')
  getKPIs() {
    return this.financeService.getKPIs();
  }

  @Get('widgets')
  getDashboardWidgets() {
    return this.financeService.getDashboardWidgets();
  }

  @Get('budget')
  getBudgets(
    @Query('month') month?: string,
    @Query('costCenter') costCenter?: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
  ) {
    return this.financeService.getBudgets({ month, costCenter, department, status });
  }

  @Get('budget/:id')
  getBudgetById(@Param('id') id: string) {
    return this.financeService.getBudgetById(id);
  }

  @Get('vendor-bills')
  getVendorBills(
    @Query('status') status?: string,
    @Query('vendor') vendor?: string,
    @Query('autoMatchStatus') autoMatchStatus?: string,
  ) {
    return this.financeService.getVendorBills({ status, vendor, autoMatchStatus });
  }

  @Get('vendor-bills/:id')
  getVendorBillById(@Param('id') id: string) {
    return this.financeService.getVendorBillById(id);
  }

  @Post('vendor-bills/:id/verify')
  verifyVendorBill(@Param('id') id: string) {
    return this.financeService.verifyVendorBill(id);
  }

  @Post('vendor-bills/:id/approve')
  approveVendorBill(@Param('id') id: string) {
    return this.financeService.approveVendorBill(id);
  }

  @Post('vendor-bills/:id/reject')
  rejectVendorBill(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.financeService.rejectVendorBill(id, body.reason);
  }

  @Get('customer-invoices')
  getCustomerInvoices(
    @Query('status') status?: string,
    @Query('customer') customer?: string,
    @Query('paymentStatus') paymentStatus?: string,
  ) {
    return this.financeService.getCustomerInvoices({ status, customer, paymentStatus });
  }

  @Get('customer-invoices/:id')
  getCustomerInvoiceById(@Param('id') id: string) {
    return this.financeService.getCustomerInvoiceById(id);
  }

  @Post('customer-invoices/:id/release')
  releaseCustomerInvoice(@Param('id') id: string) {
    return this.financeService.releaseCustomerInvoice(id);
  }

  @Get('customer-invoices/:id/export')
  exportCustomerInvoice(@Param('id') id: string) {
    return this.financeService.exportCustomerInvoice(id);
  }

  @Get('payments')
  getPaymentRuns(
    @Query('status') status?: string,
    @Query('vendor') vendor?: string,
  ) {
    return this.financeService.getPaymentRuns({ status, vendor });
  }

  @Get('payments/:id')
  getPaymentRunById(@Param('id') id: string) {
    return this.financeService.getPaymentRunById(id);
  }

  @Post('payments/:id/release')
  releasePaymentRun(@Param('id') id: string) {
    return this.financeService.releasePaymentRun(id);
  }

  @Post('payments/batch-create')
  createPaymentRunBatch(@Body() body: any) {
    return this.financeService.createPaymentRunBatch(body);
  }

  @Get('driver-settlements')
  getDriverSettlements(
    @Query('status') status?: string,
    @Query('driverName') driverName?: string,
  ) {
    return this.financeService.getDriverSettlements({ status, driverName });
  }

  @Get('approvals')
  getApprovals(
    @Query('flowCode') flowCode?: string,
    @Query('status') status?: string,
  ) {
    return this.financeService.getApprovals({ flowCode, status });
  }

  @Post('approvals/:id/approve')
  approveFinancialApproval(@Param('id') id: string, @Body() body?: { comment?: string }) {
    return this.financeService.approveFinancialApproval(id, body?.comment);
  }

  @Post('approvals/:id/reject')
  rejectFinancialApproval(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.financeService.rejectFinancialApproval(id, body.reason);
  }

  @Get('reports')
  getReports() {
    return this.financeService.getReports();
  }

  @Get('exports')
  getExports() {
    return this.financeService.getExports();
  }

  @Post('exports/trigger')
  triggerErpExport(@Body() body: { entityType: string; format: string }) {
    return this.financeService.triggerErpExport(body);
  }
}
