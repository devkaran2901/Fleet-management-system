import { Injectable, NotFoundException } from '@nestjs/common';
import { CapabilityScope } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Broadest scope wins when several roles grant the same capability. */
const SCOPE_RANK: Record<CapabilityScope, number> = {
  SELF: 0,
  HUB: 1,
  REGION: 2,
  GLOBAL: 3,
};

export interface EffectiveCapability {
  capabilityKey: string;
  label: string;
  group: string;
  scope: CapabilityScope;
  /** Roles that contributed this capability, and at what scope. */
  grantedBy: { roleName: string; scope: CapabilityScope }[];
  /** True when this arrived via an active delegation rather than the user's own roles. */
  viaDelegation: boolean;
  delegatedFrom?: string;
}

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Resolves what a user can actually do right now: their own stacked roles,
   * unioned with anything delegated to them by an in-window delegation. Where
   * two roles grant the same capability, the broadest scope wins.
   */
  async effectiveFor(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: { include: { capabilities: { include: { capability: true } } } },
          },
        },
      },
    });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    const merged = new Map<string, EffectiveCapability>();

    const absorb = (
      caps: { capabilityKey: string; scope: CapabilityScope; capability: { label: string; group: string } }[],
      roleName: string,
      delegatedFrom?: string,
    ) => {
      for (const cap of caps) {
        const existing = merged.get(cap.capabilityKey);
        if (!existing) {
          merged.set(cap.capabilityKey, {
            capabilityKey: cap.capabilityKey,
            label: cap.capability.label,
            group: cap.capability.group,
            scope: cap.scope,
            grantedBy: [{ roleName, scope: cap.scope }],
            viaDelegation: Boolean(delegatedFrom),
            delegatedFrom,
          });
          continue;
        }

        existing.grantedBy.push({ roleName, scope: cap.scope });
        if (SCOPE_RANK[cap.scope] > SCOPE_RANK[existing.scope]) existing.scope = cap.scope;
        // A capability the user already holds directly is not "via delegation".
        if (!delegatedFrom) {
          existing.viaDelegation = false;
          existing.delegatedFrom = undefined;
        }
      }
    };

    for (const ur of user.roles) absorb(ur.role.capabilities, ur.role.name);

    const now = new Date();
    const delegations = await this.prisma.delegation.findMany({
      where: {
        toUserId: userId,
        revokedAt: null,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        fromUser: {
          include: {
            roles: {
              include: {
                role: { include: { capabilities: { include: { capability: true } } } },
              },
            },
          },
        },
      },
    });

    for (const delegation of delegations) {
      for (const ur of delegation.fromUser.roles) {
        absorb(ur.role.capabilities, `${ur.role.name} (delegated)`, delegation.fromUser.email);
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        roles: user.roles.map((ur) => ur.role.name),
      },
      activeDelegations: delegations.map((d) => ({
        id: d.id,
        from: d.fromUser.email,
        endDate: d.endDate,
      })),
      capabilities: [...merged.values()].sort((a, b) =>
        a.group === b.group ? a.label.localeCompare(b.label) : a.group.localeCompare(b.group),
      ),
    };
  }

  /**
   * Answers "can user X do Y?" — the permission simulator. An inactive user is
   * denied outright regardless of what their roles say.
   */
  async simulate(userId: string, capabilityKey: string) {
    const effective = await this.effectiveFor(userId);
    const match = effective.capabilities.find((c) => c.capabilityKey === capabilityKey);

    if (!effective.user.isActive) {
      return {
        allowed: false,
        scope: null,
        reason: `${effective.user.email} is deactivated, so every capability is denied.`,
        grantedBy: [],
        viaDelegation: false,
      };
    }

    if (!match) {
      return {
        allowed: false,
        scope: null,
        reason:
          effective.user.roles.length === 0
            ? `${effective.user.email} holds no roles, so they have no capabilities.`
            : `None of ${effective.user.roles.join(', ')} grant "${capabilityKey}".`,
        grantedBy: [],
        viaDelegation: false,
      };
    }

    return {
      allowed: true,
      scope: match.scope,
      reason: match.viaDelegation
        ? `Granted at ${match.scope} scope via a delegation from ${match.delegatedFrom}.`
        : `Granted at ${match.scope} scope by ${match.grantedBy.map((g) => g.roleName).join(', ')}.`,
      grantedBy: match.grantedBy,
      viaDelegation: match.viaDelegation,
    };
  }

  /** The full capability × role grid backing the Permissions matrix view. */
  async matrix() {
    const [capabilities, roles] = await Promise.all([
      this.prisma.capability.findMany({ orderBy: [{ group: 'asc' }, { label: 'asc' }] }),
      this.prisma.role.findMany({
        orderBy: { name: 'asc' },
        include: { capabilities: true },
      }),
    ]);

    return {
      capabilities,
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        grants: Object.fromEntries(role.capabilities.map((c) => [c.capabilityKey, c.scope])),
      })),
    };
  }
}
