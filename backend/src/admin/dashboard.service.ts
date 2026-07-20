import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * A metric the UI can render. `available: false` means nothing in this system
 * produces the number yet — the widget shows "no data source" rather than a
 * fabricated figure.
 */
export interface Metric {
  value: number | null;
  available: boolean;
  /** Why the number is missing, shown as a tooltip on unavailable tiles. */
  reason?: string;
}

const real = (value: number): Metric => ({ value, available: true });
const noSource = (reason: string): Metric => ({ value: null, available: false, reason });

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async summary() {
    const since = new Date();
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalConnectors,
      healthyConnectors,
      failedConnectors,
      approvalFlows,
      notificationPolicies,
      orgNodes,
      roles,
      rulePacks,
      activeRulePackVersions,
      importJobs,
      auditCount,
      totalVehicles,
      activeVehicles,
      maintenanceVehicles,
      blockedVehicles,
      idleVehicles,
      totalDrivers,
      onDutyDrivers,
      offDutyDrivers
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: since } } }),
      this.prisma.connector.count(),
      this.prisma.connector.count({ where: { status: 'HEALTHY' } }),
      this.prisma.connector.count({ where: { status: { in: ['DOWN', 'DEGRADED'] } } }),
      this.prisma.approvalFlow.count({ where: { isActive: true } }),
      this.prisma.notificationPolicy.count(),
      this.prisma.orgNode.count(),
      this.prisma.role.count(),
      this.prisma.rulePack.count(),
      this.prisma.rulePackVersion.count({ where: { status: 'ACTIVE' } }),
      this.prisma.importJob.count(),
      this.prisma.auditEvent.count(),
      this.prisma.vehicle.count(),
      this.prisma.vehicle.count({ where: { status: 'Available' } }),
      this.prisma.vehicle.count({ where: { status: 'Maintenance' } }),
      this.prisma.vehicle.count({ where: { status: 'Blocked' } }),
      this.prisma.vehicle.count({ where: { status: 'Available', currentTripId: null } }),
      this.prisma.driver.count(),
      this.prisma.driver.count({ where: { status: 'On Duty' } }),
      this.prisma.driver.count({ where: { status: 'Available' } }),
    ]);

    const driversWithWarnings = await this.prisma.driver.findMany();
    const expiringLicenses = driversWithWarnings.filter(d => {
      try {
        const warnings = JSON.parse(d.warnings as string);
        return warnings.some((w: string) => w.toLowerCase().includes('expired') || w.toLowerCase().includes('license') || w.toLowerCase().includes('suspend'));
      } catch {
        return false;
      }
    }).length;

    return {
      users: {
        total: real(totalUsers),
        active: real(activeUsers),
        disabled: real(totalUsers - activeUsers),
        newThisMonth: real(newUsers),
        // Auth records no failed-login events, so there is nothing to count.
        failedLogins: noSource('Login attempts are not recorded — no auth event log yet'),
      },
      fleet: {
        total: real(totalVehicles),
        active: real(activeVehicles),
        inMaintenance: real(maintenanceVehicles),
        complianceBlocked: real(blockedVehicles),
        idle: real(idleVehicles),
      },
      drivers: {
        total: real(totalDrivers),
        onDuty: real(onDutyDrivers),
        offDuty: real(offDutyDrivers),
        expiringLicenses: real(expiringLicenses),
      },
      system: {
        apiRequestsToday: noSource('No request-counting middleware installed'),
        failedApiRequests: noSource('No request-counting middleware installed'),
        activeIntegrations: real(healthyConnectors),
        failedIntegrations: real(failedConnectors),
        totalIntegrations: real(totalConnectors),
      },
      workflow: {
        // Approval *instances* don't exist yet — only the flow definitions do.
        pendingApprovals: noSource('Approval requests are not modelled — only flow definitions exist'),
        escalatedApprovals: noSource('Approval requests are not modelled — only flow definitions exist'),
        pendingNotifications: noSource('No delivery queue — policies define routing only'),
        activeFlows: real(approvalFlows),
        notificationPolicies: real(notificationPolicies),
      },
      governance: {
        orgNodes: real(orgNodes),
        roles: real(roles),
        rulePacks: real(rulePacks),
        activeRulePackVersions: real(activeRulePackVersions),
        importJobs: real(importJobs),
        auditEvents: real(auditCount),
      },
    };
  }

  /** The recent activity feed — real admin actions straight off the audit chain. */
  async recentActivity(take = 12) {
    const events = await this.prisma.auditEvent.findMany({
      orderBy: { seq: 'desc' },
      take,
    });

    return events.map((event) => ({
      id: event.id,
      seq: event.seq,
      actorEmail: event.actorEmail,
      action: event.action,
      entity: event.entity,
      entityId: event.entityId,
      payload: event.payload,
      createdAt: event.createdAt,
    }));
  }
}
