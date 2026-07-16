import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalStepType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditActor } from './audit.service';

export interface ApprovalStepDto {
  order: number;
  type: ApprovalStepType;
  roleName: string;
  thresholdAmount?: number | null;
  slaHours: number;
}

@Injectable()
export class ApprovalFlowsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.approvalFlow.findMany({
      orderBy: { name: 'asc' },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
  }

  async create(
    dto: { name: string; entity: string; steps?: ApprovalStepDto[] },
    actor: AuditActor,
  ) {
    const steps = dto.steps ?? [];
    this.assertStepsValid(steps);

    const flow = await this.prisma.approvalFlow.create({
      data: {
        name: dto.name,
        entity: dto.entity,
        steps: { create: steps.map((s) => this.toStepData(s)) },
      },
      include: { steps: { orderBy: { order: 'asc' } } },
    });

    await this.audit.record({
      actor,
      action: 'approvalflow.created',
      entity: 'ApprovalFlow',
      entityId: flow.id,
      payload: { name: flow.name, entity: flow.entity, stepCount: steps.length },
    });

    return flow;
  }

  /** Replaces the whole chain — the designer saves the canvas as one unit. */
  async setSteps(flowId: string, steps: ApprovalStepDto[], actor: AuditActor) {
    const flow = await this.prisma.approvalFlow.findUnique({ where: { id: flowId } });
    if (!flow) throw new NotFoundException(`Approval flow ${flowId} not found`);
    this.assertStepsValid(steps);

    await this.prisma.$transaction([
      this.prisma.approvalStep.deleteMany({ where: { flowId } }),
      this.prisma.approvalStep.createMany({
        data: steps.map((s) => ({ flowId, ...this.toStepData(s) })),
      }),
    ]);

    await this.audit.record({
      actor,
      action: 'approvalflow.steps.changed',
      entity: 'ApprovalFlow',
      entityId: flowId,
      payload: { name: flow.name, steps },
    });

    return this.prisma.approvalFlow.findUnique({
      where: { id: flowId },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
  }

  async update(
    flowId: string,
    dto: { name?: string; entity?: string; isActive?: boolean },
    actor: AuditActor,
  ) {
    const flow = await this.prisma.approvalFlow.findUnique({ where: { id: flowId } });
    if (!flow) throw new NotFoundException(`Approval flow ${flowId} not found`);

    const updated = await this.prisma.approvalFlow.update({
      where: { id: flowId },
      data: dto,
      include: { steps: { orderBy: { order: 'asc' } } },
    });

    await this.audit.record({
      actor,
      action: 'approvalflow.updated',
      entity: 'ApprovalFlow',
      entityId: flowId,
      payload: { ...dto },
    });

    return updated;
  }

  async remove(flowId: string, actor: AuditActor) {
    const flow = await this.prisma.approvalFlow.findUnique({ where: { id: flowId } });
    if (!flow) throw new NotFoundException(`Approval flow ${flowId} not found`);

    await this.prisma.approvalFlow.delete({ where: { id: flowId } });
    await this.audit.record({
      actor,
      action: 'approvalflow.deleted',
      entity: 'ApprovalFlow',
      entityId: flowId,
      payload: { name: flow.name },
    });

    return { id: flowId };
  }

  /**
   * Dry-runs a request amount through the chain, reporting which steps engage
   * and the cumulative SLA — powers the designer's preview panel.
   */
  async simulate(flowId: string, sample: { amount?: number }) {
    const flow = await this.prisma.approvalFlow.findUnique({
      where: { id: flowId },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
    if (!flow) throw new NotFoundException(`Approval flow ${flowId} not found`);

    const amount = sample.amount ?? 0;
    let cumulativeHours = 0;

    const path = flow.steps.map((step) => {
      const threshold = step.thresholdAmount ? Number(step.thresholdAmount) : null;
      // Threshold nodes only engage once the amount reaches their limit.
      const engaged = step.type !== 'THRESHOLD' || threshold === null || amount >= threshold;
      if (engaged) cumulativeHours += step.slaHours;

      return {
        order: step.order,
        type: step.type,
        roleName: step.roleName,
        threshold,
        slaHours: step.slaHours,
        engaged,
        cumulativeSlaHours: cumulativeHours,
      };
    });

    return {
      flow: flow.name,
      entity: flow.entity,
      amount,
      engagedSteps: path.filter((p) => p.engaged).length,
      totalSlaHours: cumulativeHours,
      path,
    };
  }

  private toStepData(step: ApprovalStepDto) {
    return {
      order: step.order,
      type: step.type,
      roleName: step.roleName,
      thresholdAmount: step.thresholdAmount ?? null,
      slaHours: step.slaHours,
    };
  }

  private assertStepsValid(steps: ApprovalStepDto[]) {
    const orders = new Set<number>();
    for (const step of steps) {
      if (orders.has(step.order)) {
        throw new BadRequestException(`Duplicate step order ${step.order}`);
      }
      orders.add(step.order);

      if (step.type === 'THRESHOLD' && (step.thresholdAmount ?? null) === null) {
        throw new BadRequestException(
          `Step ${step.order} is a THRESHOLD node but has no threshold amount`,
        );
      }
      if (step.slaHours <= 0) {
        throw new BadRequestException(`Step ${step.order} needs a positive SLA`);
      }
    }
  }
}
