import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditActor } from './audit.service';

export interface VehicleDto {
  vehicleNumber: string;
  capacity: string;
  currentLocation: string;
  fuel: number;
  status: string;
  complianceFASTag?: boolean;
  compliancePM?: boolean;
  complianceGPS?: boolean;
  complianceInspection?: boolean;
  complianceInsurance?: boolean;
  complianceFitness?: boolean;
  compliancePermit?: boolean;
  utilization?: number;
  category?: string;
  vendorName?: string | null;
  gpsDeviceStatus?: string;
  lastPingAge?: string;
  site?: string;
  class?: string;
  alerts?: string; // stringified JSON array
}

@Injectable()
export class VehiclesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.vehicle.findMany({
      orderBy: { vehicleNumber: 'asc' },
    });
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException(`Vehicle with ID ${id} not found`);
    return vehicle;
  }

  async create(dto: VehicleDto, actor: AuditActor) {
    const existing = await this.prisma.vehicle.findUnique({
      where: { vehicleNumber: dto.vehicleNumber },
    });
    if (existing) {
      throw new BadRequestException(`Vehicle with number ${dto.vehicleNumber} already exists`);
    }

    const vehicle = await this.prisma.vehicle.create({
      data: {
        vehicleNumber: dto.vehicleNumber,
        capacity: dto.capacity,
        currentLocation: dto.currentLocation,
        fuel: Number(dto.fuel),
        status: dto.status,
        complianceFASTag: dto.complianceFASTag !== undefined ? dto.complianceFASTag : true,
        compliancePM: dto.compliancePM !== undefined ? dto.compliancePM : true,
        complianceGPS: dto.complianceGPS !== undefined ? dto.complianceGPS : true,
        complianceInspection: dto.complianceInspection !== undefined ? dto.complianceInspection : true,
        complianceInsurance: dto.complianceInsurance !== undefined ? dto.complianceInsurance : true,
        complianceFitness: dto.complianceFitness !== undefined ? dto.complianceFitness : true,
        compliancePermit: dto.compliancePermit !== undefined ? dto.compliancePermit : true,
        utilization: dto.utilization !== undefined ? Number(dto.utilization) : 0,
        category: dto.category || 'Owned',
        vendorName: dto.vendorName || null,
        gpsDeviceStatus: dto.gpsDeviceStatus || 'Online',
        lastPingAge: dto.lastPingAge || '1m ago',
        site: dto.site || dto.currentLocation || 'Delhi Hub',
        class: dto.class || 'Container',
        alerts: dto.alerts || '[]',
      },
    });

    await this.audit.record({
      actor,
      action: 'vehicle.created',
      entity: 'Vehicle',
      entityId: vehicle.id,
      payload: { vehicleNumber: vehicle.vehicleNumber, status: vehicle.status },
    });

    return vehicle;
  }

  async update(id: string, dto: Partial<VehicleDto>, actor: AuditActor) {
    const existing = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Vehicle with ID ${id} not found`);

    if (dto.vehicleNumber && dto.vehicleNumber !== existing.vehicleNumber) {
      const conflict = await this.prisma.vehicle.findUnique({
        where: { vehicleNumber: dto.vehicleNumber },
      });
      if (conflict) {
        throw new BadRequestException(`Vehicle with number ${dto.vehicleNumber} already exists`);
      }
    }

    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(dto.vehicleNumber !== undefined ? { vehicleNumber: dto.vehicleNumber } : {}),
        ...(dto.capacity !== undefined ? { capacity: dto.capacity } : {}),
        ...(dto.currentLocation !== undefined ? { currentLocation: dto.currentLocation } : {}),
        ...(dto.fuel !== undefined ? { fuel: Number(dto.fuel) } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.complianceFASTag !== undefined ? { complianceFASTag: dto.complianceFASTag } : {}),
        ...(dto.compliancePM !== undefined ? { compliancePM: dto.compliancePM } : {}),
        ...(dto.complianceGPS !== undefined ? { complianceGPS: dto.complianceGPS } : {}),
        ...(dto.complianceInspection !== undefined ? { complianceInspection: dto.complianceInspection } : {}),
        ...(dto.complianceInsurance !== undefined ? { complianceInsurance: dto.complianceInsurance } : {}),
        ...(dto.complianceFitness !== undefined ? { complianceFitness: dto.complianceFitness } : {}),
        ...(dto.compliancePermit !== undefined ? { compliancePermit: dto.compliancePermit } : {}),
        ...(dto.utilization !== undefined ? { utilization: Number(dto.utilization) } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.vendorName !== undefined ? { vendorName: dto.vendorName || null } : {}),
        ...(dto.gpsDeviceStatus !== undefined ? { gpsDeviceStatus: dto.gpsDeviceStatus } : {}),
        ...(dto.lastPingAge !== undefined ? { lastPingAge: dto.lastPingAge } : {}),
        ...(dto.site !== undefined ? { site: dto.site } : {}),
        ...(dto.class !== undefined ? { class: dto.class } : {}),
        ...(dto.alerts !== undefined ? { alerts: dto.alerts } : {}),
      },
    });

    await this.audit.record({
      actor,
      action: 'vehicle.updated',
      entity: 'Vehicle',
      entityId: id,
      payload: { ...dto },
    });

    return vehicle;
  }

  async remove(id: string, actor: AuditActor) {
    const existing = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Vehicle with ID ${id} not found`);

    await this.prisma.vehicle.delete({ where: { id } });

    await this.audit.record({
      actor,
      action: 'vehicle.deleted',
      entity: 'Vehicle',
      entityId: id,
      payload: { vehicleNumber: existing.vehicleNumber },
    });

    return { id };
  }
}
