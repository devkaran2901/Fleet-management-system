import { Injectable, NotFoundException } from '@nestjs/common';
import { ConnectorStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditActor } from './audit.service';

@Injectable()
export class ConnectorsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.connector.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
  }

  async create(
    dto: { key: string; name: string; category: string; config?: Record<string, unknown> },
    actor: AuditActor,
  ) {
    const connector = await this.prisma.connector.create({
      data: {
        key: dto.key,
        name: dto.name,
        category: dto.category,
        config: (dto.config ?? {}) as any,
        status: ConnectorStatus.DISCONNECTED,
      },
    });

    await this.audit.record({
      actor,
      action: 'connector.created',
      entity: 'Connector',
      entityId: connector.id,
      payload: { key: connector.key, category: connector.category },
    });

    return connector;
  }

  async update(
    id: string,
    dto: { name?: string; config?: Record<string, unknown> },
    actor: AuditActor,
  ) {
    await this.assertExists(id);

    const connector = await this.prisma.connector.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.config ? { config: dto.config as any } : {}),
      },
    });

    await this.audit.record({
      actor,
      action: 'connector.updated',
      entity: 'Connector',
      entityId: id,
      payload: { key: connector.key },
    });

    return connector;
  }

  /**
   * Runs a health probe and records the outcome on the card. Connectors here are
   * configuration records rather than live sockets, so the probe checks that the
   * connector is configured and refreshes lastSyncAt.
   */
  async testConnection(id: string, actor: AuditActor) {
    const connector = await this.assertExists(id);

    const config = (connector.config ?? {}) as Record<string, unknown>;
    const required = (config.requiredKeys as string[]) ?? ['endpoint'];
    const missing = required.filter((key) => !config[key]);

    const status =
      missing.length === 0 ? ConnectorStatus.HEALTHY : ConnectorStatus.DEGRADED;

    const updated = await this.prisma.connector.update({
      where: { id },
      data: { status, lastSyncAt: new Date() },
    });

    await this.audit.record({
      actor,
      action: 'connector.tested',
      entity: 'Connector',
      entityId: id,
      payload: { key: connector.key, status, missing },
    });

    return {
      connector: updated,
      ok: missing.length === 0,
      missing,
      message:
        missing.length === 0
          ? 'Connection healthy — all required settings present.'
          : `Missing configuration: ${missing.join(', ')}`,
    };
  }

  async setStatus(id: string, status: ConnectorStatus, actor: AuditActor) {
    const connector = await this.assertExists(id);

    const updated = await this.prisma.connector.update({
      where: { id },
      data: { status },
    });

    await this.audit.record({
      actor,
      action: 'connector.status.changed',
      entity: 'Connector',
      entityId: id,
      payload: { key: connector.key, from: connector.status, to: status },
    });

    return updated;
  }

  async remove(id: string, actor: AuditActor) {
    const connector = await this.assertExists(id);
    await this.prisma.connector.delete({ where: { id } });

    await this.audit.record({
      actor,
      action: 'connector.deleted',
      entity: 'Connector',
      entityId: id,
      payload: { key: connector.key },
    });

    return { id };
  }

  private async assertExists(id: string) {
    const connector = await this.prisma.connector.findUnique({ where: { id } });
    if (!connector) throw new NotFoundException(`Connector ${id} not found`);
    return connector;
  }
}
