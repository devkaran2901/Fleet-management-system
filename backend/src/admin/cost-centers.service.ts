import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditActor } from './audit.service';

export interface CostCenterDto {
  code: string;
  name: string;
  department: string;
  managerId?: string | null;
  orgNodeId?: string | null;
  budgetAllocated: number;
  budgetUsed?: number;
}

@Injectable()
export class CostCentersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll() {
    const centers = await this.prisma.costCenter.findMany({
      orderBy: { code: 'asc' },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true, email: true } },
        orgNode: { select: { id: true, name: true, code: true } },
      },
    });

    return centers.map((center) => {
      const allocated = Number(center.budgetAllocated);
      const used = Number(center.budgetUsed);
      return {
        ...center,
        budgetAllocated: allocated,
        budgetUsed: used,
        budgetRemaining: allocated - used,
        utilisation: allocated > 0 ? Math.round((used / allocated) * 100) : 0,
      };
    });
  }

  async create(dto: CostCenterDto, actor: AuditActor) {
    this.assertBudget(dto);

    const existing = await this.prisma.costCenter.findUnique({ where: { code: dto.code } });
    if (existing) throw new BadRequestException(`Cost centre ${dto.code} already exists`);

    const center = await this.prisma.costCenter.create({
      data: {
        code: dto.code,
        name: dto.name,
        department: dto.department,
        managerId: dto.managerId || null,
        orgNodeId: dto.orgNodeId || null,
        budgetAllocated: dto.budgetAllocated,
        budgetUsed: dto.budgetUsed ?? 0,
      },
    });

    await this.audit.record({
      actor,
      action: 'costcenter.created',
      entity: 'CostCenter',
      entityId: center.code,
      payload: { name: center.name, budgetAllocated: dto.budgetAllocated },
    });

    return center;
  }

  async update(code: string, dto: Partial<CostCenterDto>, actor: AuditActor) {
    const existing = await this.prisma.costCenter.findUnique({ where: { code } });
    if (!existing) throw new NotFoundException(`Cost centre ${code} not found`);
    this.assertBudget({ ...existing, ...dto } as CostCenterDto);

    const center = await this.prisma.costCenter.update({
      where: { code },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.department !== undefined ? { department: dto.department } : {}),
        ...(dto.managerId !== undefined ? { managerId: dto.managerId || null } : {}),
        ...(dto.orgNodeId !== undefined ? { orgNodeId: dto.orgNodeId || null } : {}),
        ...(dto.budgetAllocated !== undefined ? { budgetAllocated: dto.budgetAllocated } : {}),
        ...(dto.budgetUsed !== undefined ? { budgetUsed: dto.budgetUsed } : {}),
      },
    });

    await this.audit.record({
      actor,
      action: 'costcenter.updated',
      entity: 'CostCenter',
      entityId: code,
      payload: { ...dto },
    });

    return center;
  }

  async remove(code: string, actor: AuditActor) {
    const center = await this.prisma.costCenter.findUnique({ where: { code } });
    if (!center) throw new NotFoundException(`Cost centre ${code} not found`);

    await this.prisma.costCenter.delete({ where: { code } });
    await this.audit.record({
      actor,
      action: 'costcenter.deleted',
      entity: 'CostCenter',
      entityId: code,
      payload: { name: center.name },
    });

    return { code };
  }

  private assertBudget(dto: CostCenterDto) {
    const allocated = Number(dto.budgetAllocated ?? 0);
    const used = Number(dto.budgetUsed ?? 0);
    if (allocated < 0 || used < 0) {
      throw new BadRequestException('Budget figures cannot be negative');
    }
  }
}
