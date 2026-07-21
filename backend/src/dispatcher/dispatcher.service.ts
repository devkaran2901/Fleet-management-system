import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DispatcherService {
  constructor(private prisma: PrismaService) {}

  // Get Today's KPIs
  async getKPIs() {
    const [
      totalTrips,
      activeTrips,
      vehiclesAvailable,
      vehiclesInTransit,
      pendingRequests,
      unassignedRequests,
      exceptionsCount,
      gateQueueCount,
      activeDrivers,
    ] = await Promise.all([
      this.prisma.trip.count(),
      this.prisma.trip.count({ where: { status: 'In Transit' } }),
      this.prisma.vehicle.count({ where: { status: 'Available' } }),
      this.prisma.vehicle.count({ where: { status: 'In Transit' } }),
      this.prisma.transportRequest.count({ where: { approvalStatus: 'PENDING' } }),
      this.prisma.transportRequest.count({ where: { status: 'Unassigned' } }),
      this.prisma.exceptionAlert.count({ where: { status: 'Open' } }),
      this.prisma.gateQueueEntry.count({ where: { status: { in: ['Waiting', 'Entered'] } } }),
      this.prisma.driver.count({ where: { status: 'On Duty' } }),
    ]);

    return {
      todayTrips: totalTrips,
      activeTrips,
      vehiclesAvailable,
      vehiclesInTransit,
      pendingRequests,
      unassignedRequests,
      exceptions: exceptionsCount,
      gateQueue: gateQueueCount,
      activeDrivers,
    };
  }

  // Requests
  async getRequests() {
    return this.prisma.transportRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRequest(data: any) {
    return this.prisma.transportRequest.create({
      data: {
        id: data.id,
        customer: data.customer,
        pickup: data.pickup,
        destination: data.destination,
        vehicleType: data.vehicleType,
        capacityRequired: data.capacityRequired,
        timeWindow: data.timeWindow,
        priority: data.priority || 'MEDIUM',
        approvalStatus: data.approvalStatus || 'PENDING',
        tripType: data.tripType || 'Secondary',
        status: 'Unassigned',
        date: new Date(data.date || Date.now()),
        distance: Number(data.distance || 50),
        eta: data.eta || '2h 0m',
        ineligibleReasons: data.ineligibleReasons || '{}',
      },
    });
  }

  async assignRequest(requestId: string, vehicleId: string, driverId: string) {
    const request = await this.prisma.transportRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException(`Request ${requestId} not found`);
    if (request.status !== 'Unassigned') {
      throw new BadRequestException(`Request is already in status: ${request.status}`);
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle) throw new NotFoundException(`Vehicle ${vehicleId} not found`);
    if (vehicle.status !== 'Available') {
      throw new BadRequestException(`Vehicle ${vehicle.vehicleNumber} is not Available (current status: ${vehicle.status})`);
    }

    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });
    if (!driver) throw new NotFoundException(`Driver ${driverId} not found`);
    if (driver.status !== 'Available') {
      throw new BadRequestException(`Driver ${driver.name} is not Available (current status: ${driver.status})`);
    }

    // Generate unique Trip ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const tripIdStr = `TRIP-2026-${randomSuffix}`;

    const defaultTimeline = [
      { name: 'Origin Check-in', status: 'Done', timestamp: new Date().toISOString() },
      { name: 'Loading Completed', status: 'Pending', timestamp: null },
      { name: 'Gate Exit', status: 'Pending', timestamp: null },
      { name: 'En-route', status: 'Pending', timestamp: null },
      { name: 'Destination Reached', status: 'Pending', timestamp: null },
    ];

    const defaultDocs = [
      { name: 'Gate Pass', url: '#', status: 'Pending' },
      { name: 'Loading Slip', url: '#', status: 'Pending' },
      { name: 'POD Signoff', url: '#', status: 'Pending' },
    ];

    const defaultExpenses = [
      { category: 'Toll', amount: 500.0, status: 'Approved' },
      { category: 'Driver Bhatta', amount: 1000.0, status: 'Approved' },
    ];

    const defaultGateEvents = [
      { event: 'ANPR Entry Expected', timestamp: new Date().toISOString() },
    ];

    const defaultAudit = [
      { user: 'dispatcher@fleetos.com', action: 'Trip assigned and dispatched', timestamp: new Date().toISOString() },
    ];

    // Transaction
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          tripId: tripIdStr,
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          driverId: driver.id,
          driverName: driver.name,
          status: 'Scheduled',
          routeName: `${request.pickup} to ${request.destination}`,
          pickup: request.pickup,
          destination: request.destination,
          eta: request.eta,
          distance: request.distance,
          startDateTime: new Date(),
          cost: 15000.0,
          timeline: JSON.stringify(defaultTimeline),
          documents: JSON.stringify(defaultDocs),
          expenses: JSON.stringify(defaultExpenses),
          fuelEntries: '[]',
          gateEvents: JSON.stringify(defaultGateEvents),
          stateTimeline: JSON.stringify([
            { state: 'Created', timestamp: new Date().toISOString() },
          ]),
          auditTrail: JSON.stringify(defaultAudit),
        },
      });

      await tx.transportRequest.update({
        where: { id: requestId },
        data: { status: 'Assigned' },
      });

      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'In Transit', currentTripId: trip.id },
      });

      await tx.driver.update({
        where: { id: driverId },
        data: { status: 'On Duty', currentTripId: trip.id },
      });

      // Add to Gate Queue as Expected
      await tx.gateQueueEntry.create({
        data: {
          vehicleNumber: vehicle.vehicleNumber,
          status: 'Expected',
          gatePassNumber: `GP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          eta: 'Scheduled',
        },
      });

      // Create Audit Log
      await tx.auditEvent.create({
        data: {
          actorEmail: 'dispatcher@fleetos.com',
          action: 'trip.created',
          entity: 'Trip',
          entityId: trip.id,
          payload: { tripId: tripIdStr, vehicleNumber: vehicle.vehicleNumber, driverName: driver.name },
          hash: 'HASH-' + Math.random(),
          prevHash: 'PREV-HASH-' + Math.random(),
        },
      });

      return trip;
    });
  }

  async splitRequest(requestId: string) {
    const request = await this.prisma.transportRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException(`Request ${requestId} not found`);
    if (request.status !== 'Unassigned') {
      throw new BadRequestException('Can only split unassigned requests');
    }

    // Example capacity: "10 Ton" -> split to "5 Ton" each
    const capacityVal = parseInt(request.capacityRequired);
    const numericPart = isNaN(capacityVal) ? 10 : capacityVal;
    const half = Math.floor(numericPart / 2);
    const unit = request.capacityRequired.replace(String(numericPart), '').trim() || 'Ton';

    return this.prisma.$transaction(async (tx) => {
      // Update original request
      const reqA = await tx.transportRequest.update({
        where: { id: requestId },
        data: {
          id: `${requestId}-A`,
          capacityRequired: `${half} ${unit}`,
          status: 'Unassigned',
        },
      });

      // Create split request
      const reqB = await tx.transportRequest.create({
        data: {
          id: `${requestId}-B`,
          customer: request.customer,
          pickup: request.pickup,
          destination: request.destination,
          vehicleType: request.vehicleType,
          capacityRequired: `${half} ${unit}`,
          timeWindow: request.timeWindow,
          priority: request.priority,
          approvalStatus: request.approvalStatus,
          tripType: request.tripType,
          status: 'Unassigned',
          date: request.date,
          distance: request.distance,
          eta: request.eta,
          ineligibleReasons: request.ineligibleReasons as any,
        },
      });

      return [reqA, reqB];
    });
  }

  async mergeRequests(requestIds: string[]) {
    if (requestIds.length < 2) throw new BadRequestException('Need at least 2 requests to merge');
    const reqs = await this.prisma.transportRequest.findMany({
      where: { id: { in: requestIds } },
    });
    if (reqs.length !== requestIds.length) throw new NotFoundException('Some requests not found');
    if (reqs.some((r) => r.status !== 'Unassigned')) {
      throw new BadRequestException('All requests must be unassigned to merge');
    }

    const first = reqs[0];
    const totalCap = reqs.reduce((sum, r) => sum + (parseInt(r.capacityRequired) || 0), 0);
    const unit = first.capacityRequired.replace(String(parseInt(first.capacityRequired) || 0), '').trim() || 'Ton';
    const mergedId = `TR-MERGE-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.$transaction(async (tx) => {
      // Mark old as Merged
      await tx.transportRequest.updateMany({
        where: { id: { in: requestIds } },
        data: { status: 'Merged' },
      });

      // Create new merged request
      return tx.transportRequest.create({
        data: {
          id: mergedId,
          customer: `${first.customer} (+${reqs.length - 1} merged)`,
          pickup: first.pickup,
          destination: first.destination,
          vehicleType: first.vehicleType,
          capacityRequired: `${totalCap} ${unit}`,
          timeWindow: first.timeWindow,
          priority: 'HIGH',
          approvalStatus: 'APPROVED',
          tripType: first.tripType,
          status: 'Unassigned',
          date: first.date,
          distance: first.distance,
          eta: first.eta,
        },
      });
    });
  }

  async vendorSpill(requestId: string, vendorId: string) {
    const request = await this.prisma.transportRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException(`Request ${requestId} not found`);

    const tripIdStr = `TRIP-VND-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          tripId: tripIdStr,
          status: 'Scheduled',
          routeName: `${request.pickup} to ${request.destination}`,
          pickup: request.pickup,
          destination: request.destination,
          eta: request.eta,
          distance: request.distance,
          cost: 18000.0,
          vendorName: vendorId, // selected vendor
          timeline: JSON.stringify([
            { name: 'Indent Sent', status: 'Done', timestamp: new Date().toISOString() },
            { name: 'Acceptance Tracked', status: 'Pending', timestamp: null },
          ]),
          documents: '[]',
          expenses: '[]',
          fuelEntries: '[]',
          gateEvents: '[]',
          stateTimeline: JSON.stringify([
            { state: 'Vendor Indent', timestamp: new Date().toISOString() },
          ]),
          auditTrail: JSON.stringify([
            { user: 'dispatcher@fleetos.com', action: `Vendor Indent raised to ${vendorId}`, timestamp: new Date().toISOString() },
          ]),
        },
      });

      await tx.transportRequest.update({
        where: { id: requestId },
        data: { status: 'Assigned' },
      });

      return trip;
    });
  }

  // Vehicles
  async getVehicles() {
    return this.prisma.vehicle.findMany({
      orderBy: { vehicleNumber: 'asc' },
    });
  }

  // Drivers
  async getDrivers() {
    return this.prisma.driver.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // Trips & Replanning
  async getTrips() {
    return this.prisma.trip.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTrip(id: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundException(`Trip ${id} not found`);
    return trip;
  }

  async createTrip(data: any) {
    return this.prisma.trip.create({
      data: {
        tripId: data.tripId,
        vehicleId: data.vehicleId,
        vehicleNumber: data.vehicleNumber,
        driverId: data.driverId,
        driverName: data.driverName,
        status: data.status || 'Scheduled',
        routeName: data.routeName,
        pickup: data.pickup,
        destination: data.destination,
        eta: data.eta,
        distance: Number(data.distance),
        cost: Number(data.cost || 0),
        vendorName: data.vendorName || null,
        timeline: data.timeline || '[]',
        documents: data.documents || '[]',
        expenses: data.expenses || '[]',
        fuelEntries: data.fuelEntries || '[]',
        gateEvents: data.gateEvents || '[]',
        stateTimeline: JSON.stringify([{ state: 'Created', timestamp: new Date().toISOString() }]),
        auditTrail: JSON.stringify([{ user: 'dispatcher@fleetos.com', action: 'Trip Manual Entry', timestamp: new Date().toISOString() }]),
      },
    });
  }

  async updateTrip(id: string, data: any) {
    const trip = await this.prisma.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundException(`Trip ${id} not found`);

    return this.prisma.trip.update({
      where: { id },
      data,
    });
  }

  async replanTrip(tripId: string, data: { action: string; vehicleId?: string; driverId?: string; notes?: string }) {
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new NotFoundException(`Trip ${tripId} not found`);

    return this.prisma.$transaction(async (tx) => {
      const audit = JSON.parse(trip.auditTrail as string || '[]');
      const states = JSON.parse(trip.stateTimeline as string || '[]');

      if (data.action === 'SWAP_VEHICLE' && data.vehicleId) {
        const newVehicle = await tx.vehicle.findUnique({ where: { id: data.vehicleId } });
        if (!newVehicle) throw new NotFoundException('New vehicle not found');

        // Release old vehicle
        if (trip.vehicleId) {
          await tx.vehicle.update({
            where: { id: trip.vehicleId },
            data: { status: 'Available', currentTripId: null },
          });
        }

        // Occupy new vehicle
        await tx.vehicle.update({
          where: { id: data.vehicleId },
          data: { status: 'In Transit', currentTripId: trip.id },
        });

        audit.push({
          user: 'dispatcher@fleetos.com',
          action: `Vehicle Swapped: ${trip.vehicleNumber} -> ${newVehicle.vehicleNumber}. Reason: ${data.notes || 'None'}`,
          timestamp: new Date().toISOString(),
        });

        states.push({
          state: 'Vehicle Re-assigned',
          timestamp: new Date().toISOString(),
        });

        return tx.trip.update({
          where: { id: tripId },
          data: {
            vehicleId: newVehicle.id,
            vehicleNumber: newVehicle.vehicleNumber,
            auditTrail: JSON.stringify(audit),
            stateTimeline: JSON.stringify(states),
          },
        });
      }

      if (data.action === 'SWAP_DRIVER' && data.driverId) {
        const newDriver = await tx.driver.findUnique({ where: { id: data.driverId } });
        if (!newDriver) throw new NotFoundException('New driver not found');

        // Release old driver
        if (trip.driverId) {
          await tx.driver.update({
            where: { id: trip.driverId },
            data: { status: 'Available', currentTripId: null },
          });
        }

        // Occupy new driver
        await tx.driver.update({
          where: { id: data.driverId },
          data: { status: 'On Duty', currentTripId: trip.id },
        });

        audit.push({
          user: 'dispatcher@fleetos.com',
          action: `Driver Swapped: ${trip.driverName} -> ${newDriver.name}. Reason: ${data.notes || 'None'}`,
          timestamp: new Date().toISOString(),
        });

        states.push({
          state: 'Driver Re-assigned',
          timestamp: new Date().toISOString(),
        });

        return tx.trip.update({
          where: { id: tripId },
          data: {
            driverId: newDriver.id,
            driverName: newDriver.name,
            auditTrail: JSON.stringify(audit),
            stateTimeline: JSON.stringify(states),
          },
        });
      }

      if (data.action === 'CANCEL') {
        // Release assets
        if (trip.vehicleId) {
          await tx.vehicle.update({
            where: { id: trip.vehicleId },
            data: { status: 'Available', currentTripId: null },
          });
        }
        if (trip.driverId) {
          await tx.driver.update({
            where: { id: trip.driverId },
            data: { status: 'Available', currentTripId: null },
          });
        }

        audit.push({
          user: 'dispatcher@fleetos.com',
          action: `Trip Cancelled. Justification: ${data.notes || 'None'}`,
          timestamp: new Date().toISOString(),
        });

        states.push({
          state: 'Cancelled',
          timestamp: new Date().toISOString(),
        });

        return tx.trip.update({
          where: { id: tripId },
          data: {
            status: 'Cancelled',
            auditTrail: JSON.stringify(audit),
            stateTimeline: JSON.stringify(states),
          },
        });
      }

      throw new BadRequestException(`Unknown action: ${data.action}`);
    });
  }

  // Gate Queue
  async getGateQueue() {
    return this.prisma.gateQueueEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateGateQueueEntry(id: string, data: any) {
    const entry = await this.prisma.gateQueueEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException(`Gate entry ${id} not found`);

    // Handle status transitions to release/occupy vehicles
    if (data.status === 'Exited') {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { vehicleNumber: entry.vehicleNumber } });
      if (vehicle) {
        await this.prisma.vehicle.update({
          where: { id: vehicle.id },
          data: { status: 'Available', currentTripId: null },
        });
      }
    }

    return this.prisma.gateQueueEntry.update({
      where: { id },
      data: {
        ...data,
        enteredAt: data.status === 'Entered' ? new Date() : entry.enteredAt,
        exitedAt: data.status === 'Exited' ? new Date() : entry.exitedAt,
      },
    });
  }

  // Exceptions
  async getExceptions() {
    return this.prisma.exceptionAlert.findMany({
      orderBy: { timestamp: 'desc' },
    });
  }

  async resolveException(id: string) {
    const exception = await this.prisma.exceptionAlert.findUnique({ where: { id } });
    if (!exception) throw new NotFoundException(`Exception alert ${id} not found`);

    return this.prisma.exceptionAlert.update({
      where: { id },
      data: { status: 'Resolved' },
    });
  }

  // Reports
  async getReports() {
    return {
      dailyDispatch: [
        { date: '2026-07-15', ownedCount: 14, vendorCount: 5, total: 19 },
        { date: '2026-07-16', ownedCount: 16, vendorCount: 8, total: 24 },
        { date: '2026-07-17', ownedCount: 12, vendorCount: 6, total: 18 },
        { date: '2026-07-18', ownedCount: 15, vendorCount: 4, total: 19 },
        { date: '2026-07-19', ownedCount: 18, vendorCount: 9, total: 27 },
        { date: '2026-07-20', ownedCount: 10, vendorCount: 3, total: 13 },
      ],
      planStability: {
        totalPlanned: 120,
        swappedVehicles: 8,
        swappedDrivers: 5,
        cancelledTrips: 4,
        vendorTransfers: 6,
        stabilityScore: 81.6, // %
      },
      exceptionSummary: [
        { type: 'Overspeed', count: 18, critical: 12 },
        { type: 'GPS Offline', count: 32, critical: 5 },
        { type: 'Breakdown', count: 3, critical: 3 },
        { type: 'FASTag Low Balance', count: 14, critical: 0 },
        { type: 'Driver No Show', count: 5, critical: 5 },
      ],
      vendorFailures: [
        { vendor: 'Gati Logistics', indentsSent: 40, accepted: 38, placementFailures: 2, placementRate: 95 },
        { vendor: 'Safexpress', indentsSent: 30, accepted: 27, placementFailures: 3, placementRate: 90 },
        { vendor: 'VRL Logistics', indentsSent: 50, accepted: 49, placementFailures: 1, placementRate: 98 },
        { vendor: 'Blue Dart Cab', indentsSent: 20, accepted: 16, placementFailures: 4, placementRate: 80 },
      ],
    };
  }

  async updateVehicle(id: string, data: any) {
    const existing = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Vehicle ${id} not found`);

    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.utilization !== undefined ? { utilization: Number(data.utilization) } : {}),
        ...(data.fuel !== undefined ? { fuel: Number(data.fuel) } : {}),
        ...(data.currentLocation !== undefined ? { currentLocation: data.currentLocation } : {}),
        ...(data.alerts !== undefined ? { alerts: typeof data.alerts === 'string' ? data.alerts : JSON.stringify(data.alerts) } : {}),
      },
    });
  }

  async updateDriver(id: string, data: any) {
    const existing = await this.prisma.driver.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Driver ${id} not found`);

    return this.prisma.driver.update({
      where: { id },
      data: {
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.dutyHours !== undefined ? { dutyHours: Number(data.dutyHours) } : {}),
        ...(data.restHours !== undefined ? { restHours: Number(data.restHours) } : {}),
        ...(data.safetyScore !== undefined ? { safetyScore: Number(data.safetyScore) } : {}),
        ...(data.warnings !== undefined ? { warnings: typeof data.warnings === 'string' ? data.warnings : JSON.stringify(data.warnings) } : {}),
      },
    });
  }

  async getRoutes() {
    return this.prisma.route.findMany({
      orderBy: { routeName: 'asc' },
    });
  }
}
