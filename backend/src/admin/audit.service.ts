import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditActor {
  id?: string;
  email: string;
}

export interface RecordAuditInput {
  actor: AuditActor;
  action: string;
  entity: string;
  entityId?: string;
  payload?: Record<string, unknown>;
  /** Event this one was caused by, forming the lineage chain. */
  parentId?: string;
}

const GENESIS_HASH = '0'.repeat(64);

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Appends an event to the tamper-evident chain. Each row's hash covers its own
   * content plus the previous row's hash, so any edit to history invalidates
   * every hash after it (surfaced by `verifyChain`).
   */
  async record(input: RecordAuditInput) {
    const previous = await this.prisma.auditEvent.findFirst({
      orderBy: { seq: 'desc' },
      select: { hash: true },
    });
    const prevHash = previous?.hash ?? GENESIS_HASH;

    const createdAt = new Date();
    const payload = input.payload ?? {};
    const hash = this.digest({
      actorEmail: input.actor.email,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      payload,
      parentId: input.parentId ?? null,
      createdAt: createdAt.toISOString(),
      prevHash,
    });

    return this.prisma.auditEvent.create({
      data: {
        actorId: input.actor.id ?? null,
        actorEmail: input.actor.email,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        payload: payload as any,
        parentId: input.parentId ?? null,
        hash,
        prevHash,
        createdAt,
      },
    });
  }

  private digest(content: Record<string, unknown>) {
    return createHash('sha256').update(JSON.stringify(content)).digest('hex');
  }

  async findAll(query: {
    entity?: string;
    action?: string;
    actorEmail?: string;
    take?: number;
  }) {
    const where: any = {};
    if (query.entity) where.entity = query.entity;
    if (query.action) where.action = { contains: query.action, mode: 'insensitive' };
    if (query.actorEmail) {
      where.actorEmail = { contains: query.actorEmail, mode: 'insensitive' };
    }

    return this.prisma.auditEvent.findMany({
      where,
      orderBy: { seq: 'desc' },
      take: Math.min(query.take ?? 100, 500),
    });
  }

  /**
   * Walks `parentId` backwards from an event to the originating request —
   * e.g. pick any payment and see the chain that produced it.
   */
  async lineage(id: string) {
    const chain: any[] = [];
    const seen = new Set<string>();
    let cursor = await this.prisma.auditEvent.findUnique({ where: { id } });

    while (cursor && !seen.has(cursor.id)) {
      seen.add(cursor.id);
      chain.push(cursor);
      if (!cursor.parentId) break;
      cursor = await this.prisma.auditEvent.findUnique({
        where: { id: cursor.parentId },
      });
    }

    // Oldest (originating request) first.
    return chain.reverse();
  }

  /** Re-computes every hash in order and reports the first divergence. */
  async verifyChain() {
    const events = await this.prisma.auditEvent.findMany({
      orderBy: { seq: 'asc' },
    });

    let prevHash = GENESIS_HASH;
    for (const event of events) {
      const expected = this.digest({
        actorEmail: event.actorEmail,
        action: event.action,
        entity: event.entity,
        entityId: event.entityId,
        payload: event.payload,
        parentId: event.parentId,
        createdAt: event.createdAt.toISOString(),
        prevHash,
      });

      if (event.prevHash !== prevHash || event.hash !== expected) {
        return {
          valid: false,
          checked: events.length,
          brokenAtSeq: event.seq,
          brokenAtId: event.id,
        };
      }
      prevHash = event.hash;
    }

    return { valid: true, checked: events.length, brokenAtSeq: null, brokenAtId: null };
  }
}
