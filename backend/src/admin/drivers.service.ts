import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditActor } from './audit.service';

export interface DriverDto {
  name: string;
  license: string;
  licenseType: string;
  dutyHours?: number;
  restHours?: number;
  safetyScore?: number;
  status: string;
  warnings?: string; // stringified JSON array
  site?: string;
}

@Injectable()
export class DriversService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.driver.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const driver = await this.prisma.driver.findUnique({ where: { id } });
    if (!driver) throw new NotFoundException(`Driver with ID ${id} not found`);
    return driver;
  }

  async create(dto: DriverDto, actor: AuditActor) {
    const driver = await this.prisma.driver.create({
      data: {
        name: dto.name,
        license: dto.license,
        licenseType: dto.licenseType,
        dutyHours: dto.dutyHours !== undefined ? Number(dto.dutyHours) : 0,
        restHours: dto.restHours !== undefined ? Number(dto.restHours) : 0,
        safetyScore: dto.safetyScore !== undefined ? Number(dto.safetyScore) : 90,
        status: dto.status,
        warnings: dto.warnings || '[]',
        site: dto.site || 'Delhi Hub',
      },
    });

    await this.audit.record({
      actor,
      action: 'driver.created',
      entity: 'Driver',
      entityId: driver.id,
      payload: { name: driver.name, license: driver.license, status: driver.status },
    });

    return driver;
  }

  async update(id: string, dto: Partial<DriverDto>, actor: AuditActor) {
    const existing = await this.prisma.driver.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Driver with ID ${id} not found`);

    const driver = await this.prisma.driver.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.license !== undefined ? { license: dto.license } : {}),
        ...(dto.licenseType !== undefined ? { licenseType: dto.licenseType } : {}),
        ...(dto.dutyHours !== undefined ? { dutyHours: Number(dto.dutyHours) } : {}),
        ...(dto.restHours !== undefined ? { restHours: Number(dto.restHours) } : {}),
        ...(dto.safetyScore !== undefined ? { safetyScore: Number(dto.safetyScore) } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.warnings !== undefined ? { warnings: dto.warnings } : {}),
        ...(dto.site !== undefined ? { site: dto.site } : {}),
      },
    });

    await this.audit.record({
      actor,
      action: 'driver.updated',
      entity: 'Driver',
      entityId: id,
      payload: { ...dto },
    });

    return driver;
  }

  async remove(id: string, actor: AuditActor) {
    const existing = await this.prisma.driver.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Driver with ID ${id} not found`);

    await this.prisma.driver.delete({ where: { id } });

    await this.audit.record({
      actor,
      action: 'driver.deleted',
      entity: 'Driver',
      entityId: id,
      payload: { name: existing.name },
    });

    return { id };
  }
}
