import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RulePackStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditActor } from './audit.service';

/** A single compliance rule inside a pack version. */
export interface PackRule {
  code: string;
  label: string;
  field: string;
  operator: 'lte' | 'gte' | 'eq' | 'required';
  value?: number | string;
  severity: 'BLOCK' | 'WARN';
}

@Injectable()
export class RulePacksService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.rulePack.findMany({
      orderBy: { name: 'asc' },
      include: { versions: { orderBy: { version: 'desc' } } },
    });
  }

  async createPack(
    dto: { key: string; name: string; stateCode: string },
    actor: AuditActor,
  ) {
    const pack = await this.prisma.rulePack.create({ data: dto });
    await this.audit.record({
      actor,
      action: 'rulepack.created',
      entity: 'RulePack',
      entityId: pack.id,
      payload: { key: pack.key, name: pack.name, stateCode: pack.stateCode },
    });
    return pack;
  }

  /** Drafts the next version of a pack. Versions are immutable once activated. */
  async createVersion(
    packId: string,
    dto: { effectiveFrom: string; rules: PackRule[] },
    actor: AuditActor,
  ) {
    const pack = await this.prisma.rulePack.findUnique({
      where: { id: packId },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });
    if (!pack) throw new NotFoundException(`Rule pack ${packId} not found`);

    const nextVersion = (pack.versions[0]?.version ?? 0) + 1;
    const version = await this.prisma.rulePackVersion.create({
      data: {
        rulePackId: packId,
        version: nextVersion,
        status: RulePackStatus.DRAFT,
        effectiveFrom: new Date(dto.effectiveFrom),
        rules: dto.rules as any,
      },
    });

    await this.audit.record({
      actor,
      action: 'rulepack.version.drafted',
      entity: 'RulePackVersion',
      entityId: version.id,
      payload: { pack: pack.key, version: nextVersion, ruleCount: dto.rules.length },
    });

    return version;
  }

  async updateVersion(
    versionId: string,
    dto: { effectiveFrom?: string; rules?: PackRule[] },
    actor: AuditActor,
  ) {
    const existing = await this.prisma.rulePackVersion.findUnique({
      where: { id: versionId },
    });
    if (!existing) throw new NotFoundException(`Version ${versionId} not found`);
    if (existing.status !== RulePackStatus.DRAFT) {
      throw new BadRequestException(
        'Only DRAFT versions can be edited — draft a new version instead',
      );
    }

    const version = await this.prisma.rulePackVersion.update({
      where: { id: versionId },
      data: {
        ...(dto.effectiveFrom ? { effectiveFrom: new Date(dto.effectiveFrom) } : {}),
        ...(dto.rules ? { rules: dto.rules as any } : {}),
      },
    });

    await this.audit.record({
      actor,
      action: 'rulepack.version.updated',
      entity: 'RulePackVersion',
      entityId: versionId,
      payload: { version: version.version },
    });

    return version;
  }

  /**
   * Activates a draft. The currently active version is retired and its
   * effectiveTo is closed at the new version's effectiveFrom, so the pack always
   * has exactly one version in force at any instant.
   */
  async activateVersion(versionId: string, actor: AuditActor) {
    const version = await this.prisma.rulePackVersion.findUnique({
      where: { id: versionId },
      include: { rulePack: true },
    });
    if (!version) throw new NotFoundException(`Version ${versionId} not found`);
    if (version.status === RulePackStatus.ACTIVE) {
      throw new BadRequestException('Version is already active');
    }

    const current = await this.prisma.rulePackVersion.findFirst({
      where: { rulePackId: version.rulePackId, status: RulePackStatus.ACTIVE },
    });

    await this.prisma.$transaction([
      ...(current
        ? [
            this.prisma.rulePackVersion.update({
              where: { id: current.id },
              data: { status: RulePackStatus.RETIRED, effectiveTo: version.effectiveFrom },
            }),
          ]
        : []),
      this.prisma.rulePackVersion.update({
        where: { id: versionId },
        data: { status: RulePackStatus.ACTIVE, effectiveTo: null },
      }),
    ]);

    await this.audit.record({
      actor,
      action: 'rulepack.version.activated',
      entity: 'RulePackVersion',
      entityId: versionId,
      payload: {
        pack: version.rulePack.key,
        version: version.version,
        retiredVersionId: current?.id ?? null,
      },
    });

    return this.prisma.rulePackVersion.findUnique({ where: { id: versionId } });
  }

  /**
   * Dry-runs a version's rules against a sample payload without persisting
   * anything — backs the "simulate" button in the rule-pack editor.
   */
  async simulate(versionId: string, sample: Record<string, any>) {
    const version = await this.prisma.rulePackVersion.findUnique({
      where: { id: versionId },
      include: { rulePack: true },
    });
    if (!version) throw new NotFoundException(`Version ${versionId} not found`);

    const rules = (version.rules as unknown as PackRule[]) ?? [];
    const results = rules.map((rule) => {
      const actual = sample[rule.field];
      const passed = this.evaluate(rule, actual);
      return {
        code: rule.code,
        label: rule.label,
        field: rule.field,
        operator: rule.operator,
        expected: rule.value ?? null,
        actual: actual ?? null,
        severity: rule.severity,
        passed,
      };
    });

    const blocking = results.filter((r) => !r.passed && r.severity === 'BLOCK');
    const warnings = results.filter((r) => !r.passed && r.severity === 'WARN');

    return {
      pack: version.rulePack.key,
      version: version.version,
      status: version.status,
      effectiveFrom: version.effectiveFrom,
      outcome: blocking.length > 0 ? 'BLOCKED' : warnings.length > 0 ? 'WARN' : 'PASS',
      passedCount: results.filter((r) => r.passed).length,
      totalCount: results.length,
      results,
    };
  }

  private evaluate(rule: PackRule, actual: any): boolean {
    switch (rule.operator) {
      case 'required':
        return actual !== undefined && actual !== null && actual !== '';
      case 'eq':
        return actual === rule.value;
      case 'lte':
        return typeof actual === 'number' && actual <= Number(rule.value);
      case 'gte':
        return typeof actual === 'number' && actual >= Number(rule.value);
      default:
        return false;
    }
  }
}
