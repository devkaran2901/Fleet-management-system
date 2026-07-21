import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { DispatcherService } from './dispatcher.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dispatcher')
@UseGuards(JwtAuthGuard)
export class DispatcherController {
  constructor(private readonly dispatcherService: DispatcherService) {}

  @Get('kpis')
  getKPIs() {
    return this.dispatcherService.getKPIs();
  }

  @Get('requests')
  getRequests() {
    return this.dispatcherService.getRequests();
  }

  @Post('requests')
  createRequest(@Body() body: any) {
    return this.dispatcherService.createRequest(body);
  }

  @Post('requests/:id/assign')
  assignRequest(
    @Param('id') id: string,
    @Body() body: { vehicleId: string; driverId: string },
  ) {
    return this.dispatcherService.assignRequest(id, body.vehicleId, body.driverId);
  }

  @Post('requests/:id/split')
  splitRequest(@Param('id') id: string) {
    return this.dispatcherService.splitRequest(id);
  }

  @Post('requests/merge')
  mergeRequests(@Body() body: { requestIds: string[] }) {
    return this.dispatcherService.mergeRequests(body.requestIds);
  }

  @Post('requests/:id/vendor-spill')
  vendorSpill(
    @Param('id') id: string,
    @Body() body: { vendorId: string },
  ) {
    return this.dispatcherService.vendorSpill(id, body.vendorId);
  }

  @Get('vehicles')
  getVehicles() {
    return this.dispatcherService.getVehicles();
  }

  @Patch('vehicles/:id')
  updateVehicle(@Param('id') id: string, @Body() body: any) {
    return this.dispatcherService.updateVehicle(id, body);
  }

  @Get('drivers')
  getDrivers() {
    return this.dispatcherService.getDrivers();
  }

  @Patch('drivers/:id')
  updateDriver(@Param('id') id: string, @Body() body: any) {
    return this.dispatcherService.updateDriver(id, body);
  }

  @Get('routes')
  getRoutes() {
    return this.dispatcherService.getRoutes();
  }

  @Get('trips')
  getTrips() {
    return this.dispatcherService.getTrips();
  }

  @Get('trips/:id')
  getTrip(@Param('id') id: string) {
    return this.dispatcherService.getTrip(id);
  }

  @Post('trips')
  createTrip(@Body() body: any) {
    return this.dispatcherService.createTrip(body);
  }

  @Patch('trips/:id')
  updateTrip(@Param('id') id: string, @Body() body: any) {
    return this.dispatcherService.updateTrip(id, body);
  }

  @Post('trips/:id/replan')
  replanTrip(
    @Param('id') id: string,
    @Body() body: { action: string; vehicleId?: string; driverId?: string; notes?: string },
  ) {
    return this.dispatcherService.replanTrip(id, body);
  }

  @Get('gate-queue')
  getGateQueue() {
    return this.dispatcherService.getGateQueue();
  }

  @Patch('gate-queue/:id')
  updateGateQueueEntry(@Param('id') id: string, @Body() body: any) {
    return this.dispatcherService.updateGateQueueEntry(id, body);
  }

  @Get('exceptions')
  getExceptions() {
    return this.dispatcherService.getExceptions();
  }

  @Post('exceptions/:id/resolve')
  resolveException(@Param('id') id: string) {
    return this.dispatcherService.resolveException(id);
  }

  @Get('reports')
  getReports() {
    return this.dispatcherService.getReports();
  }
}
