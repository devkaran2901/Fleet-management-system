import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConnectorStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuditService } from './audit.service';
import { OrgService } from './org.service';
import type { OrgNodeDto } from './org.service';
import { RolesService } from './roles.service';
import type { RoleCapabilityDto } from './roles.service';
import { RulePacksService } from './rule-packs.service';
import type { PackRule } from './rule-packs.service';
import { ApprovalFlowsService } from './approval-flows.service';
import type { ApprovalStepDto } from './approval-flows.service';
import { NotificationPoliciesService } from './notification-policies.service';
import type {
  NotificationPolicyDto,
  NotificationChannel,
} from './notification-policies.service';
import { ConnectorsService } from './connectors.service';
import { ImportsService } from './imports.service';
import { DashboardService } from './dashboard.service';
import { CostCentersService } from './cost-centers.service';
import type { CostCenterDto } from './cost-centers.service';
import { DelegationsService } from './delegations.service';
import type { DelegationDto } from './delegations.service';
import { PermissionsService } from './permissions.service';
import { HealthService } from './health.service';

/** The JWT payload shape produced by JwtStrategy.validate. */
interface JwtUser {
  id: string;
  email: string;
  roles: string[];
}

const actorOf = (user: JwtUser) => ({ id: user.id, email: user.email });

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private org: OrgService,
    private roles: RolesService,
    private rulePacks: RulePacksService,
    private approvalFlows: ApprovalFlowsService,
    private notificationPolicies: NotificationPoliciesService,
    private connectors: ConnectorsService,
    private imports: ImportsService,
    private audit: AuditService,
    private dashboard: DashboardService,
    private costCenters: CostCentersService,
    private delegations: DelegationsService,
    private permissions: PermissionsService,
    private health: HealthService,
  ) {}

  // --- Dashboard ----------------------------------------------------------

  @Get('dashboard')
  dashboardSummary() {
    return this.dashboard.summary();
  }

  @Get('dashboard/activity')
  dashboardActivity(@Query('take') take?: string) {
    return this.dashboard.recentActivity(take ? Number(take) : undefined);
  }

  // --- Cost centres -------------------------------------------------------

  @Get('cost-centers')
  listCostCenters() {
    return this.costCenters.findAll();
  }

  @Post('cost-centers')
  createCostCenter(@Body() body: CostCenterDto, @CurrentUser() user: JwtUser) {
    return this.costCenters.create(body, actorOf(user));
  }

  @Patch('cost-centers/:code')
  updateCostCenter(
    @Param('code') code: string,
    @Body() body: Partial<CostCenterDto>,
    @CurrentUser() user: JwtUser,
  ) {
    return this.costCenters.update(code, body, actorOf(user));
  }

  @Delete('cost-centers/:code')
  deleteCostCenter(@Param('code') code: string, @CurrentUser() user: JwtUser) {
    return this.costCenters.remove(code, actorOf(user));
  }

  // --- Delegations --------------------------------------------------------

  @Get('delegations')
  listDelegations() {
    return this.delegations.findAll();
  }

  @Post('delegations')
  createDelegation(@Body() body: DelegationDto, @CurrentUser() user: JwtUser) {
    return this.delegations.create(body, actorOf(user));
  }

  @Post('delegations/:id/revoke')
  revokeDelegation(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.delegations.revoke(id, actorOf(user));
  }

  @Delete('delegations/:id')
  deleteDelegation(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.delegations.remove(id, actorOf(user));
  }

  // --- Permissions --------------------------------------------------------

  @Get('permissions/matrix')
  permissionMatrix() {
    return this.permissions.matrix();
  }

  @Get('permissions/effective/:userId')
  effectivePermissions(@Param('userId') userId: string) {
    return this.permissions.effectiveFor(userId);
  }

  @Post('permissions/simulate')
  simulatePermission(@Body() body: { userId: string; capabilityKey: string }) {
    return this.permissions.simulate(body.userId, body.capabilityKey);
  }

  // --- System health ------------------------------------------------------

  @Get('health')
  systemHealth() {
    return this.health.snapshot();
  }

  // --- Org / Users / Roles ------------------------------------------------

  @Get('org/tree')
  orgTree() {
    return this.org.tree();
  }

  @Post('org/nodes')
  createOrgNode(@Body() body: OrgNodeDto, @CurrentUser() user: JwtUser) {
    return this.org.create(body, actorOf(user));
  }

  @Patch('org/nodes/:id')
  updateOrgNode(
    @Param('id') id: string,
    @Body() body: Partial<OrgNodeDto>,
    @CurrentUser() user: JwtUser,
  ) {
    return this.org.update(id, body, actorOf(user));
  }

  @Delete('org/nodes/:id')
  deleteOrgNode(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.org.remove(id, actorOf(user));
  }

  @Get('capabilities')
  capabilities() {
    return this.roles.capabilities();
  }

  @Get('segregation-rules')
  segregationRules() {
    return this.roles.segregationRules();
  }

  @Post('roles/validate')
  validateSegregation(@Body() body: { capabilityKeys: string[] }) {
    return this.roles.validateSegregation(body.capabilityKeys ?? []);
  }

  @Get('roles')
  listRoles() {
    return this.roles.findAll();
  }

  @Post('roles')
  createRole(
    @Body() body: { name: string; description?: string },
    @CurrentUser() user: JwtUser,
  ) {
    return this.roles.create(body, actorOf(user));
  }

  @Put('roles/:id/capabilities')
  setRoleCapabilities(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { capabilities: RoleCapabilityDto[] },
    @CurrentUser() user: JwtUser,
  ) {
    return this.roles.setCapabilities(id, body.capabilities ?? [], actorOf(user));
  }

  @Delete('roles/:id')
  deleteRole(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtUser) {
    return this.roles.remove(id, actorOf(user));
  }

  @Get('users')
  listUsers() {
    return this.roles.users();
  }

  @Put('users/:id/roles')
  setUserRoles(
    @Param('id') id: string,
    @Body() body: { roles: string[] },
    @CurrentUser() user: JwtUser,
  ) {
    return this.roles.setUserRoles(id, body.roles ?? [], actorOf(user));
  }

  @Patch('users/:id/active')
  setUserActive(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
    @CurrentUser() user: JwtUser,
  ) {
    return this.roles.setUserActive(id, body.isActive, actorOf(user));
  }

  // --- Rule packs ---------------------------------------------------------

  @Get('rule-packs')
  listRulePacks() {
    return this.rulePacks.findAll();
  }

  @Post('rule-packs')
  createRulePack(
    @Body() body: { key: string; name: string; stateCode: string },
    @CurrentUser() user: JwtUser,
  ) {
    return this.rulePacks.createPack(body, actorOf(user));
  }

  @Post('rule-packs/:id/versions')
  createRulePackVersion(
    @Param('id') id: string,
    @Body() body: { effectiveFrom: string; rules: PackRule[] },
    @CurrentUser() user: JwtUser,
  ) {
    return this.rulePacks.createVersion(id, body, actorOf(user));
  }

  @Patch('rule-pack-versions/:id')
  updateRulePackVersion(
    @Param('id') id: string,
    @Body() body: { effectiveFrom?: string; rules?: PackRule[] },
    @CurrentUser() user: JwtUser,
  ) {
    return this.rulePacks.updateVersion(id, body, actorOf(user));
  }

  @Post('rule-pack-versions/:id/activate')
  activateRulePackVersion(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.rulePacks.activateVersion(id, actorOf(user));
  }

  @Post('rule-pack-versions/:id/simulate')
  simulateRulePackVersion(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.rulePacks.simulate(id, body?.sample ?? {});
  }

  // --- Approval flows -----------------------------------------------------

  @Get('approval-flows')
  listApprovalFlows() {
    return this.approvalFlows.findAll();
  }

  @Post('approval-flows')
  createApprovalFlow(
    @Body() body: { name: string; entity: string; steps?: ApprovalStepDto[] },
    @CurrentUser() user: JwtUser,
  ) {
    return this.approvalFlows.create(body, actorOf(user));
  }

  @Patch('approval-flows/:id')
  updateApprovalFlow(
    @Param('id') id: string,
    @Body() body: { name?: string; entity?: string; isActive?: boolean },
    @CurrentUser() user: JwtUser,
  ) {
    return this.approvalFlows.update(id, body, actorOf(user));
  }

  @Put('approval-flows/:id/steps')
  setApprovalFlowSteps(
    @Param('id') id: string,
    @Body() body: { steps: ApprovalStepDto[] },
    @CurrentUser() user: JwtUser,
  ) {
    return this.approvalFlows.setSteps(id, body.steps ?? [], actorOf(user));
  }

  @Post('approval-flows/:id/simulate')
  simulateApprovalFlow(@Param('id') id: string, @Body() body: { amount?: number }) {
    return this.approvalFlows.simulate(id, body ?? {});
  }

  @Delete('approval-flows/:id')
  deleteApprovalFlow(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.approvalFlows.remove(id, actorOf(user));
  }

  // --- Notification policies ----------------------------------------------

  @Get('notification-policies')
  listNotificationPolicies() {
    return this.notificationPolicies.findAll();
  }

  @Get('notification-channels')
  notificationChannels() {
    return this.notificationPolicies.channels();
  }

  @Post('notification-policies')
  createNotificationPolicy(
    @Body() body: NotificationPolicyDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.notificationPolicies.create(body, actorOf(user));
  }

  @Patch('notification-policies/:id')
  updateNotificationPolicy(
    @Param('id') id: string,
    @Body() body: Partial<NotificationPolicyDto>,
    @CurrentUser() user: JwtUser,
  ) {
    return this.notificationPolicies.update(id, body, actorOf(user));
  }

  @Post('notification-policies/:id/toggle')
  toggleNotificationChannel(
    @Param('id') id: string,
    @Body() body: { channel: NotificationChannel },
    @CurrentUser() user: JwtUser,
  ) {
    return this.notificationPolicies.toggleChannel(id, body.channel, actorOf(user));
  }

  @Delete('notification-policies/:id')
  deleteNotificationPolicy(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.notificationPolicies.remove(id, actorOf(user));
  }

  // --- Connectors ---------------------------------------------------------

  @Get('connectors')
  listConnectors() {
    return this.connectors.findAll();
  }

  @Post('connectors')
  createConnector(
    @Body() body: { key: string; name: string; category: string; config?: Record<string, unknown> },
    @CurrentUser() user: JwtUser,
  ) {
    return this.connectors.create(body, actorOf(user));
  }

  @Patch('connectors/:id')
  updateConnector(
    @Param('id') id: string,
    @Body() body: { name?: string; config?: Record<string, unknown> },
    @CurrentUser() user: JwtUser,
  ) {
    return this.connectors.update(id, body, actorOf(user));
  }

  @Post('connectors/:id/test')
  testConnector(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.connectors.testConnection(id, actorOf(user));
  }

  @Patch('connectors/:id/status')
  setConnectorStatus(
    @Param('id') id: string,
    @Body() body: { status: ConnectorStatus },
    @CurrentUser() user: JwtUser,
  ) {
    return this.connectors.setStatus(id, body.status, actorOf(user));
  }

  @Delete('connectors/:id')
  deleteConnector(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.connectors.remove(id, actorOf(user));
  }

  // --- Imports ------------------------------------------------------------

  @Get('imports/entities')
  importEntities() {
    return this.imports.entities();
  }

  @Get('imports/template')
  @Header('Content-Type', 'text/csv')
  importTemplate(@Query('entity') entity: string) {
    return this.imports.template(entity);
  }

  @Get('imports')
  listImports() {
    return this.imports.findAll();
  }

  @Get('imports/:id')
  getImport(@Param('id') id: string) {
    return this.imports.findOne(id);
  }

  @Post('imports')
  uploadImport(
    @Body() body: { entity: string; fileName: string; csv: string },
    @CurrentUser() user: JwtUser,
  ) {
    return this.imports.upload(body, actorOf(user));
  }

  @Put('imports/:id/mapping')
  setImportMapping(
    @Param('id') id: string,
    @Body() body: { mapping: Record<string, string> },
    @CurrentUser() user: JwtUser,
  ) {
    return this.imports.setMapping(id, body.mapping ?? {}, actorOf(user));
  }

  @Post('imports/:id/validate')
  validateImport(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.imports.validate(id, actorOf(user));
  }

  @Post('imports/:id/commit')
  commitImport(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.imports.commit(id, actorOf(user));
  }

  // --- Audit --------------------------------------------------------------

  @Get('audit-events')
  listAuditEvents(
    @Query('entity') entity?: string,
    @Query('action') action?: string,
    @Query('actorEmail') actorEmail?: string,
    @Query('take') take?: string,
  ) {
    return this.audit.findAll({
      entity,
      action,
      actorEmail,
      take: take ? Number(take) : undefined,
    });
  }

  @Get('audit-events/verify')
  verifyAuditChain() {
    return this.audit.verifyChain();
  }

  @Get('audit-events/:id/lineage')
  auditLineage(@Param('id') id: string) {
    return this.audit.lineage(id);
  }
}
