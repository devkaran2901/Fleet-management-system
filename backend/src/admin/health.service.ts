import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ServiceStatus {
  name: string;
  status: 'UP' | 'DOWN' | 'NOT_CONFIGURED';
  detail: string;
  latencyMs: number | null;
}

const bytesToMb = (bytes: number) => Math.round((bytes / 1024 / 1024) * 10) / 10;

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  /**
   * Real process and database health. Redis and Kafka are reported as
   * NOT_CONFIGURED rather than invented — this stack does not run them.
   */
  async snapshot() {
    const services: ServiceStatus[] = [];

    services.push({
      name: 'API',
      status: 'UP',
      detail: `Responding — uptime ${this.formatUptime(process.uptime())}`,
      latencyMs: 0,
    });

    const started = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      services.push({
        name: 'Database',
        status: 'UP',
        detail: 'Postgres responded to SELECT 1',
        latencyMs: Date.now() - started,
      });
    } catch (err) {
      services.push({
        name: 'Database',
        status: 'DOWN',
        detail: (err as Error).message,
        latencyMs: Date.now() - started,
      });
    }

    services.push({
      name: 'Redis',
      status: 'NOT_CONFIGURED',
      detail: 'No Redis in this deployment',
      latencyMs: null,
    });
    services.push({
      name: 'Kafka',
      status: 'NOT_CONFIGURED',
      detail: 'No Kafka in this deployment',
      latencyMs: null,
    });

    const memory = process.memoryUsage();

    return {
      services,
      process: {
        uptimeSeconds: Math.round(process.uptime()),
        uptimeLabel: this.formatUptime(process.uptime()),
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid,
      },
      memory: {
        heapUsedMb: bytesToMb(memory.heapUsed),
        heapTotalMb: bytesToMb(memory.heapTotal),
        rssMb: bytesToMb(memory.rss),
        heapUtilisation: Math.round((memory.heapUsed / memory.heapTotal) * 100),
      },
      // Per-process CPU time, not host load — labelled as such in the UI.
      cpu: {
        userMs: Math.round(process.cpuUsage().user / 1000),
        systemMs: Math.round(process.cpuUsage().system / 1000),
        note: 'Cumulative CPU time for this API process; host-level load is not collected.',
      },
      errorRate: {
        available: false,
        note: 'No request-counting middleware — error rate is not tracked yet.',
      },
      checkedAt: new Date().toISOString(),
    };
  }

  private formatUptime(seconds: number) {
    const s = Math.floor(seconds);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const mins = Math.floor((s % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m ${s % 60}s`;
  }
}
