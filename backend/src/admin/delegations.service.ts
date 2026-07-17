import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditActor } from './audit.service';

export interface DelegationDto {
  fromUserId: string;
  toUserId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

const userSelect = { id: true, firstName: true, lastName: true, email: true };

@Injectable()
export class DelegationsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll() {
    const delegations = await this.prisma.delegation.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        fromUser: { select: userSelect },
        toUser: { select: userSelect },
      },
    });

    const now = new Date();
    return delegations.map((d) => ({ ...d, status: this.statusOf(d, now) }));
  }

  /** ACTIVE only inside the window and not revoked; otherwise SCHEDULED/EXPIRED/REVOKED. */
  private statusOf(
    d: { startDate: Date; endDate: Date; revokedAt: Date | null },
    now: Date,
  ): 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'REVOKED' {
    if (d.revokedAt) return 'REVOKED';
    if (now < d.startDate) return 'SCHEDULED';
    if (now > d.endDate) return 'EXPIRED';
    return 'ACTIVE';
  }

  async create(dto: DelegationDto, actor: AuditActor) {
    if (dto.fromUserId === dto.toUserId) {
      throw new BadRequestException('A user cannot delegate to themselves');
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Start and end dates must be valid');
    }
    if (end <= start) {
      throw new BadRequestException('The end date must be after the start date');
    }

    const [fromUser, toUser] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: dto.fromUserId } }),
      this.prisma.user.findUnique({ where: { id: dto.toUserId } }),
    ]);
    if (!fromUser) throw new NotFoundException('The delegating user was not found');
    if (!toUser) throw new NotFoundException('The delegate was not found');
    if (!toUser.isActive) {
      throw new BadRequestException('Authority cannot be delegated to an inactive user');
    }

    // Two live delegations from the same person would make authority ambiguous.
    const overlap = await this.prisma.delegation.findFirst({
      where: {
        fromUserId: dto.fromUserId,
        revokedAt: null,
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });
    if (overlap) {
      throw new BadRequestException(
        `${fromUser.email} already has a delegation overlapping that window`,
      );
    }

    const delegation = await this.prisma.delegation.create({
      data: {
        fromUserId: dto.fromUserId,
        toUserId: dto.toUserId,
        startDate: start,
        endDate: end,
        reason: dto.reason || null,
      },
    });

    await this.audit.record({
      actor,
      action: 'delegation.created',
      entity: 'Delegation',
      entityId: delegation.id,
      payload: {
        from: fromUser.email,
        to: toUser.email,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        reason: dto.reason ?? null,
      },
    });

    return delegation;
  }

  async revoke(id: string, actor: AuditActor) {
    const delegation = await this.prisma.delegation.findUnique({
      where: { id },
      include: { fromUser: { select: userSelect }, toUser: { select: userSelect } },
    });
    if (!delegation) throw new NotFoundException(`Delegation ${id} not found`);
    if (delegation.revokedAt) throw new BadRequestException('This delegation is already revoked');

    const updated = await this.prisma.delegation.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    await this.audit.record({
      actor,
      action: 'delegation.revoked',
      entity: 'Delegation',
      entityId: id,
      payload: { from: delegation.fromUser.email, to: delegation.toUser.email },
    });

    return updated;
  }

  async remove(id: string, actor: AuditActor) {
    const delegation = await this.prisma.delegation.findUnique({ where: { id } });
    if (!delegation) throw new NotFoundException(`Delegation ${id} not found`);

    await this.prisma.delegation.delete({ where: { id } });
    await this.audit.record({
      actor,
      action: 'delegation.deleted',
      entity: 'Delegation',
      entityId: id,
      payload: {},
    });

    return { id };
  }
}
