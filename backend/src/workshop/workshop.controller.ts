import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workshop')
@UseGuards(JwtAuthGuard)
export class WorkshopController {
  constructor(private readonly workshopService: WorkshopService) {}

  @Get('kpis')
  getKPIs() {
    return this.workshopService.getKPIs();
  }

  @Get('widgets')
  getDashboardWidgets() {
    return this.workshopService.getDashboardWidgets();
  }

  @Get('job-cards')
  getJobCards(
    @Query('status') status?: string,
    @Query('vehicle') vehicle?: string,
    @Query('mechanic') mechanic?: string,
    @Query('priority') priority?: string,
  ) {
    return this.workshopService.getJobCards({ status, vehicle, mechanic, priority });
  }

  @Get('job-cards/:id')
  getJobCardById(@Param('id') id: string) {
    return this.workshopService.getJobCardById(id);
  }

  @Post('job-cards')
  createJobCard(@Body() body: any) {
    return this.workshopService.createJobCard(body);
  }

  @Patch('job-cards/:id')
  updateJobCard(@Param('id') id: string, @Body() body: any) {
    return this.workshopService.updateJobCard(id, body);
  }

  @Get('bays')
  getBays() {
    return this.workshopService.getBays();
  }

  @Patch('bays/:id')
  updateBay(@Param('id') id: string, @Body() body: any) {
    return this.workshopService.updateBay(id, body);
  }

  @Get('mechanics')
  getMechanics() {
    return this.workshopService.getMechanics();
  }

  @Post('mechanics/:id/assign')
  assignMechanic(@Param('id') id: string, @Body() body: any) {
    return this.workshopService.assignMechanic(id, body);
  }

  @Get('pm-due')
  getPmSchedules() {
    return this.workshopService.getPmSchedules();
  }

  @Post('pm-due/:id/schedule')
  schedulePmSlot(@Param('id') id: string, @Body() body: any) {
    return this.workshopService.schedulePmSlot(id, body);
  }

  @Post('pm-due/:id/create-job-card')
  createJobCardFromPm(@Param('id') id: string) {
    return this.workshopService.createJobCardFromPm(id);
  }

  @Post('pm-due/:id/override')
  requestPmOverride(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.workshopService.requestPmOverride(id, body.reason);
  }

  @Get('estimates')
  getEstimates() {
    return this.workshopService.getEstimates();
  }

  @Post('estimates')
  createEstimate(@Body() body: any) {
    return this.workshopService.createEstimate(body);
  }

  @Patch('estimates/:id')
  updateEstimate(@Param('id') id: string, @Body() body: any) {
    return this.workshopService.updateEstimate(id, body);
  }

  @Get('parts-demand')
  getPartsDemand() {
    return this.workshopService.getPartsDemand();
  }

  @Post('parts-demand/:id/request')
  requestPartDemand(@Param('id') id: string) {
    return this.workshopService.requestPartDemand(id);
  }

  @Post('parts-demand/:id/reserve')
  reservePart(@Param('id') id: string) {
    return this.workshopService.reservePart(id);
  }

  @Get('outside-work')
  getOutsideWorkRequests() {
    return this.workshopService.getOutsideWorkRequests();
  }

  @Post('outside-work')
  createOutsideWorkRequest(@Body() body: any) {
    return this.workshopService.createOutsideWorkRequest(body);
  }

  @Get('qc-queue')
  getQCQueue() {
    return this.workshopService.getQCQueue();
  }

  @Post('job-cards/:id/qc-approve')
  approveQC(@Param('id') id: string, @Body() body: any) {
    return this.workshopService.approveQC(id, body);
  }

  @Post('job-cards/:id/road-test')
  recordRoadTest(@Param('id') id: string, @Body() body: any) {
    return this.workshopService.recordRoadTest(id, body);
  }

  @Get('reports')
  getReports() {
    return this.workshopService.getReports();
  }
}
