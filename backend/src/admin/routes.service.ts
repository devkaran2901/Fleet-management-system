import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditActor } from './audit.service';

export interface RouteDto {
  code: string;
  routeName: string;
  origin: string;
  destination: string;
  distance: number;
  eta: string;
  stops?: string; // stringified JSON array of stops
  restrictions?: string; // stringified JSON array of restrictions
}

@Injectable()
export class RoutesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.route.findMany({
      orderBy: { routeName: 'asc' },
    });
  }

  async findOne(id: string) {
    const route = await this.prisma.route.findUnique({ where: { id } });
    if (!route) throw new NotFoundException(`Route with ID ${id} not found`);
    return route;
  }

  async create(dto: RouteDto, actor: AuditActor) {
    const existing = await this.prisma.route.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new BadRequestException(`Route with code ${dto.code} already exists`);
    }

    const route = await this.prisma.route.create({
      data: {
        code: dto.code,
        routeName: dto.routeName,
        origin: dto.origin,
        destination: dto.destination,
        distance: Number(dto.distance),
        eta: dto.eta,
        stops: dto.stops || '[]',
        restrictions: dto.restrictions || '[]',
      },
    });

    await this.audit.record({
      actor,
      action: 'route.created',
      entity: 'Route',
      entityId: route.id,
      payload: { code: route.code, routeName: route.routeName },
    });

    return route;
  }

  async update(id: string, dto: Partial<RouteDto>, actor: AuditActor) {
    const existing = await this.prisma.route.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Route with ID ${id} not found`);

    if (dto.code && dto.code !== existing.code) {
      const conflict = await this.prisma.route.findUnique({
        where: { code: dto.code },
      });
      if (conflict) {
        throw new BadRequestException(`Route with code ${dto.code} already exists`);
      }
    }

    const route = await this.prisma.route.update({
      where: { id },
      data: {
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.routeName !== undefined ? { routeName: dto.routeName } : {}),
        ...(dto.origin !== undefined ? { origin: dto.origin } : {}),
        ...(dto.destination !== undefined ? { destination: dto.destination } : {}),
        ...(dto.distance !== undefined ? { distance: Number(dto.distance) } : {}),
        ...(dto.eta !== undefined ? { eta: dto.eta } : {}),
        ...(dto.stops !== undefined ? { stops: dto.stops } : {}),
        ...(dto.restrictions !== undefined ? { restrictions: dto.restrictions } : {}),
      },
    });

    await this.audit.record({
      actor,
      action: 'route.updated',
      entity: 'Route',
      entityId: id,
      payload: { ...dto },
    });

    return route;
  }

  async remove(id: string, actor: AuditActor) {
    const existing = await this.prisma.route.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Route with ID ${id} not found`);

    await this.prisma.route.delete({ where: { id } });

    await this.audit.record({
      actor,
      action: 'route.deleted',
      entity: 'Route',
      entityId: id,
      payload: { code: existing.code, routeName: existing.routeName },
    });

    return { id };
  }
}
