import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CapabilityScope } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditActor } from './audit.service';

export interface RoleCapabilityDto {
  capabilityKey: string;
  scope: CapabilityScope;
}

export interface SegregationConflict {
  capabilityA: string;
  capabilityB: string;
  message: string;
}

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async capabilities() {
    return this.prisma.capability.findMany({ orderBy: [{ group: 'asc' }, { label: 'asc' }] });
  }

  async segregationRules() {
    return this.prisma.segregationRule.findMany({ orderBy: { id: 'asc' } });
  }

  async findAll() {
    const roles = await this.prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: {
        capabilities: { include: { capability: true } },
        _count: { select: { users: true } },
      },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      userCount: role._count.users,
      capabilities: role.capabilities.map((rc) => ({
        capabilityKey: rc.capabilityKey,
        label: rc.capability.label,
        group: rc.capability.group,
        scope: rc.scope,
      })),
    }));
  }

  /**
   * Checks a proposed capability set against the segregation-of-duties rules.
   * Pure read — the role builder calls this live as the matrix is edited.
   */
  async validateSegregation(capabilityKeys: string[]): Promise<SegregationConflict[]> {
    const held = new Set(capabilityKeys);
    const rules = await this.segregationRules();

    return rules
      .filter((rule) => held.has(rule.capabilityA) && held.has(rule.capabilityB))
      .map((rule) => ({
        capabilityA: rule.capabilityA,
        capabilityB: rule.capabilityB,
        message: rule.message,
      }));
  }

  async create(dto: { name: string; description?: string }, actor: AuditActor) {
    const existing = await this.prisma.role.findUnique({ where: { name: dto.name } });
    if (existing) throw new BadRequestException(`Role ${dto.name} already exists`);

    const role = await this.prisma.role.create({
      data: { name: dto.name, description: dto.description ?? null },
    });

    await this.audit.record({
      actor,
      action: 'role.created',
      entity: 'Role',
      entityId: String(role.id),
      payload: { name: role.name },
    });

    return role;
  }

  /** Replaces a role's capability matrix, refusing sets that violate SoD. */
  async setCapabilities(roleId: number, caps: RoleCapabilityDto[], actor: AuditActor) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException(`Role ${roleId} not found`);

    const conflicts = await this.validateSegregation(caps.map((c) => c.capabilityKey));
    if (conflicts.length > 0) {
      throw new BadRequestException({
        message: 'Segregation of duties violation',
        conflicts,
      });
    }

    const known = await this.prisma.capability.findMany({
      where: { key: { in: caps.map((c) => c.capabilityKey) } },
      select: { key: true },
    });
    const knownKeys = new Set(known.map((k) => k.key));
    const unknown = caps.filter((c) => !knownKeys.has(c.capabilityKey));
    if (unknown.length > 0) {
      throw new BadRequestException(
        `Unknown capabilities: ${unknown.map((u) => u.capabilityKey).join(', ')}`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.roleCapability.deleteMany({ where: { roleId } }),
      this.prisma.roleCapability.createMany({
        data: caps.map((c) => ({
          roleId,
          capabilityKey: c.capabilityKey,
          scope: c.scope,
        })),
      }),
    ]);

    await this.audit.record({
      actor,
      action: 'role.permissions.changed',
      entity: 'Role',
      entityId: String(roleId),
      payload: { name: role.name, capabilities: caps },
    });

    return this.findAll().then((roles) => roles.find((r) => r.id === roleId));
  }

  async remove(id: number, actor: AuditActor) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    if (role._count.users > 0) {
      throw new BadRequestException(
        `Role ${role.name} is still assigned to ${role._count.users} user(s)`,
      );
    }

    await this.prisma.role.delete({ where: { id } });
    await this.audit.record({
      actor,
      action: 'role.deleted',
      entity: 'Role',
      entityId: String(id),
      payload: { name: role.name },
    });

    return { id };
  }

  // --- Users -------------------------------------------------------------

  async users() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      include: { roles: { include: { role: true } } },
    });

    return users.map(({ password, ...user }) => ({
      ...user,
      roles: user.roles.map((ur) => ur.role.name),
    }));
  }

  /** Role stacking: a user may hold several roles, validated together for SoD. */
  async setUserRoles(userId: string, roleNames: string[], actor: AuditActor) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const roles = await this.prisma.role.findMany({
      where: { name: { in: roleNames } },
      include: { capabilities: true },
    });
    if (roles.length !== roleNames.length) {
      const found = new Set(roles.map((r) => r.name));
      throw new BadRequestException(
        `Unknown roles: ${roleNames.filter((n) => !found.has(n)).join(', ')}`,
      );
    }

    const stackedCaps = roles.flatMap((r) => r.capabilities.map((c) => c.capabilityKey));
    const conflicts = await this.validateSegregation(stackedCaps);
    if (conflicts.length > 0) {
      throw new BadRequestException({
        message: 'Stacked roles violate segregation of duties',
        conflicts,
      });
    }

    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId } }),
      this.prisma.userRole.createMany({
        data: roles.map((r) => ({ userId, roleId: r.id })),
      }),
    ]);

    await this.audit.record({
      actor,
      action: 'user.roles.changed',
      entity: 'User',
      entityId: userId,
      payload: { email: user.email, roles: roleNames },
    });

    return { userId, roles: roleNames };
  }

  async setUserActive(userId: string, isActive: boolean, actor: AuditActor) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    await this.prisma.user.update({ where: { id: userId }, data: { isActive } });

    await this.audit.record({
      actor,
      action: isActive ? 'user.activated' : 'user.deactivated',
      entity: 'User',
      entityId: userId,
      payload: { email: user.email },
    });

    return { userId, isActive };
  }
}
