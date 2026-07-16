import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationSeverity } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditActor } from './audit.service';

export const NOTIFICATION_CHANNELS = ['EMAIL', 'SMS', 'PUSH', 'WEBHOOK', 'IN_APP'] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export interface NotificationPolicyDto {
  eventKey: string;
  label: string;
  severity: NotificationSeverity;
  channels: NotificationChannel[];
  audienceRole: string;
  quietHours: boolean;
  digest: boolean;
}

@Injectable()
export class NotificationPoliciesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.notificationPolicy.findMany({ orderBy: { eventKey: 'asc' } });
  }

  channels() {
    return NOTIFICATION_CHANNELS;
  }

  async create(dto: NotificationPolicyDto, actor: AuditActor) {
    this.assertValid(dto);

    const existing = await this.prisma.notificationPolicy.findUnique({
      where: { eventKey: dto.eventKey },
    });
    if (existing) {
      throw new BadRequestException(`A policy for ${dto.eventKey} already exists`);
    }

    const policy = await this.prisma.notificationPolicy.create({ data: dto });
    await this.audit.record({
      actor,
      action: 'notificationpolicy.created',
      entity: 'NotificationPolicy',
      entityId: policy.id,
      payload: { eventKey: policy.eventKey, channels: policy.channels },
    });

    return policy;
  }

  async update(id: string, dto: Partial<NotificationPolicyDto>, actor: AuditActor) {
    const existing = await this.prisma.notificationPolicy.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Policy ${id} not found`);
    this.assertValid({ ...existing, ...dto } as NotificationPolicyDto);

    const policy = await this.prisma.notificationPolicy.update({
      where: { id },
      data: dto,
    });

    await this.audit.record({
      actor,
      action: 'notificationpolicy.updated',
      entity: 'NotificationPolicy',
      entityId: id,
      payload: { eventKey: policy.eventKey, ...dto },
    });

    return policy;
  }

  /** Toggles one channel in the matrix grid — the most common single edit. */
  async toggleChannel(id: string, channel: NotificationChannel, actor: AuditActor) {
    const policy = await this.prisma.notificationPolicy.findUnique({ where: { id } });
    if (!policy) throw new NotFoundException(`Policy ${id} not found`);
    if (!NOTIFICATION_CHANNELS.includes(channel)) {
      throw new BadRequestException(`Unknown channel ${channel}`);
    }

    const enabled = policy.channels.includes(channel);
    const channels = enabled
      ? policy.channels.filter((c) => c !== channel)
      : [...policy.channels, channel];

    if (channels.length === 0 && policy.severity === 'CRITICAL') {
      throw new BadRequestException(
        'A CRITICAL event must keep at least one delivery channel',
      );
    }

    const updated = await this.prisma.notificationPolicy.update({
      where: { id },
      data: { channels },
    });

    await this.audit.record({
      actor,
      action: 'notificationpolicy.channel.toggled',
      entity: 'NotificationPolicy',
      entityId: id,
      payload: { eventKey: policy.eventKey, channel, enabled: !enabled },
    });

    return updated;
  }

  async remove(id: string, actor: AuditActor) {
    const policy = await this.prisma.notificationPolicy.findUnique({ where: { id } });
    if (!policy) throw new NotFoundException(`Policy ${id} not found`);

    await this.prisma.notificationPolicy.delete({ where: { id } });
    await this.audit.record({
      actor,
      action: 'notificationpolicy.deleted',
      entity: 'NotificationPolicy',
      entityId: id,
      payload: { eventKey: policy.eventKey },
    });

    return { id };
  }

  private assertValid(dto: NotificationPolicyDto) {
    const unknown = (dto.channels ?? []).filter(
      (c) => !NOTIFICATION_CHANNELS.includes(c),
    );
    if (unknown.length > 0) {
      throw new BadRequestException(`Unknown channels: ${unknown.join(', ')}`);
    }
    if (dto.severity === 'CRITICAL' && (dto.channels ?? []).length === 0) {
      throw new BadRequestException(
        'A CRITICAL event must have at least one delivery channel',
      );
    }
    if (dto.severity === 'CRITICAL' && dto.quietHours) {
      throw new BadRequestException(
        'CRITICAL events cannot be suppressed by quiet hours',
      );
    }
  }
}
