import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminController } from './admin.controller';
import { AuditService } from './audit.service';
import { OrgService } from './org.service';
import { RolesService } from './roles.service';
import { RulePacksService } from './rule-packs.service';
import { ApprovalFlowsService } from './approval-flows.service';
import { NotificationPoliciesService } from './notification-policies.service';
import { ConnectorsService } from './connectors.service';
import { ImportsService } from './imports.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [
    AuditService,
    OrgService,
    RolesService,
    RulePacksService,
    ApprovalFlowsService,
    NotificationPoliciesService,
    ConnectorsService,
    ImportsService,
  ],
  exports: [AuditService],
})
export class AdminModule {}
