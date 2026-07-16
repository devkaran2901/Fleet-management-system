import api from './api';

// --- Shared types -----------------------------------------------------------

export type OrgNodeType = 'ORG' | 'REGION' | 'HUB' | 'DEPOT' | 'TEAM';
export type CapabilityScope = 'GLOBAL' | 'REGION' | 'HUB' | 'SELF';
export type RulePackStatus = 'DRAFT' | 'ACTIVE' | 'RETIRED';
export type ApprovalStepType = 'APPROVAL' | 'THRESHOLD' | 'PARALLEL' | 'NOTIFY';
export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'WEBHOOK' | 'IN_APP';
export type ConnectorStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'DISCONNECTED';
export type ImportStatus = 'MAPPING' | 'VALIDATED' | 'COMMITTED' | 'FAILED';

export interface OrgNode {
  id: string;
  name: string;
  code: string;
  type: OrgNodeType;
  parentId: string | null;
  children: OrgNode[];
}

export interface Capability {
  key: string;
  label: string;
  group: string;
}

export interface SegregationRule {
  id: number;
  capabilityA: string;
  capabilityB: string;
  message: string;
}

export interface SegregationConflict {
  capabilityA: string;
  capabilityB: string;
  message: string;
}

export interface RoleCapability {
  capabilityKey: string;
  label: string;
  group: string;
  scope: CapabilityScope;
}

export interface AdminRole {
  id: number;
  name: string;
  description: string | null;
  userCount: number;
  capabilities: RoleCapability[];
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  roles: string[];
}

export interface PackRule {
  code: string;
  label: string;
  field: string;
  operator: 'lte' | 'gte' | 'eq' | 'required';
  value?: number | string;
  severity: 'BLOCK' | 'WARN';
}

export interface RulePackVersion {
  id: string;
  rulePackId: string;
  version: number;
  status: RulePackStatus;
  effectiveFrom: string;
  effectiveTo: string | null;
  rules: PackRule[];
  createdAt: string;
}

export interface RulePack {
  id: string;
  key: string;
  name: string;
  stateCode: string;
  versions: RulePackVersion[];
}

export interface SimulationResult {
  pack: string;
  version: number;
  status: RulePackStatus;
  effectiveFrom: string;
  outcome: 'PASS' | 'WARN' | 'BLOCKED';
  passedCount: number;
  totalCount: number;
  results: {
    code: string;
    label: string;
    field: string;
    operator: string;
    expected: string | number | null;
    actual: string | number | null;
    severity: 'BLOCK' | 'WARN';
    passed: boolean;
  }[];
}

export interface ApprovalStep {
  id?: string;
  order: number;
  type: ApprovalStepType;
  roleName: string;
  thresholdAmount: string | number | null;
  slaHours: number;
}

export interface ApprovalFlow {
  id: string;
  name: string;
  entity: string;
  isActive: boolean;
  steps: ApprovalStep[];
}

export interface FlowSimulation {
  flow: string;
  entity: string;
  amount: number;
  engagedSteps: number;
  totalSlaHours: number;
  path: {
    order: number;
    type: ApprovalStepType;
    roleName: string;
    threshold: number | null;
    slaHours: number;
    engaged: boolean;
    cumulativeSlaHours: number;
  }[];
}

export interface NotificationPolicy {
  id: string;
  eventKey: string;
  label: string;
  severity: NotificationSeverity;
  channels: NotificationChannel[];
  audienceRole: string;
  quietHours: boolean;
  digest: boolean;
}

export interface Connector {
  id: string;
  key: string;
  name: string;
  category: string;
  status: ConnectorStatus;
  config: Record<string, unknown>;
  lastSyncAt: string | null;
}

export interface ImportFieldDef {
  key: string;
  label: string;
  required: boolean;
  hint?: string;
}

export interface ImportEntityDef {
  key: string;
  label: string;
  fields: ImportFieldDef[];
}

export interface RowError {
  row: number;
  field: string;
  message: string;
}

export interface ImportJob {
  id: string;
  entity: string;
  fileName: string;
  status: ImportStatus;
  totalRows: number;
  validRows: number;
  errorRows: number;
  mapping: Record<string, string>;
  rows: Record<string, string>[];
  errors: RowError[];
  createdAt: string;
  committedAt: string | null;
  headers?: string[];
  created?: number;
  skipped?: number;
}

export interface AuditEvent {
  seq: number;
  id: string;
  actorId: string | null;
  actorEmail: string;
  action: string;
  entity: string;
  entityId: string | null;
  payload: Record<string, unknown>;
  parentId: string | null;
  hash: string;
  prevHash: string;
  createdAt: string;
}

export interface ChainVerification {
  valid: boolean;
  checked: number;
  brokenAtSeq: number | null;
  brokenAtId: string | null;
}

// --- Client -----------------------------------------------------------------

const unwrap = <T,>(promise: Promise<{ data: T }>) => promise.then((res) => res.data);

export const adminApi = {
  // Org / Users / Roles
  orgTree: () => unwrap<OrgNode[]>(api.get('/admin/org/tree')),
  createOrgNode: (body: { name: string; code: string; type: OrgNodeType; parentId?: string | null }) =>
    unwrap<OrgNode>(api.post('/admin/org/nodes', body)),
  updateOrgNode: (id: string, body: Partial<{ name: string; code: string; type: OrgNodeType; parentId: string | null }>) =>
    unwrap<OrgNode>(api.patch(`/admin/org/nodes/${id}`, body)),
  deleteOrgNode: (id: string) => unwrap<{ id: string }>(api.delete(`/admin/org/nodes/${id}`)),

  capabilities: () => unwrap<Capability[]>(api.get('/admin/capabilities')),
  segregationRules: () => unwrap<SegregationRule[]>(api.get('/admin/segregation-rules')),
  validateSegregation: (capabilityKeys: string[]) =>
    unwrap<SegregationConflict[]>(api.post('/admin/roles/validate', { capabilityKeys })),

  roles: () => unwrap<AdminRole[]>(api.get('/admin/roles')),
  createRole: (body: { name: string; description?: string }) =>
    unwrap<AdminRole>(api.post('/admin/roles', body)),
  setRoleCapabilities: (id: number, capabilities: { capabilityKey: string; scope: CapabilityScope }[]) =>
    unwrap<AdminRole>(api.put(`/admin/roles/${id}/capabilities`, { capabilities })),
  deleteRole: (id: number) => unwrap<{ id: number }>(api.delete(`/admin/roles/${id}`)),

  users: () => unwrap<AdminUser[]>(api.get('/admin/users')),
  setUserRoles: (id: string, roles: string[]) =>
    unwrap<{ userId: string; roles: string[] }>(api.put(`/admin/users/${id}/roles`, { roles })),
  setUserActive: (id: string, isActive: boolean) =>
    unwrap<{ userId: string; isActive: boolean }>(api.patch(`/admin/users/${id}/active`, { isActive })),

  // Rule packs
  rulePacks: () => unwrap<RulePack[]>(api.get('/admin/rule-packs')),
  createRulePack: (body: { key: string; name: string; stateCode: string }) =>
    unwrap<RulePack>(api.post('/admin/rule-packs', body)),
  createRulePackVersion: (packId: string, body: { effectiveFrom: string; rules: PackRule[] }) =>
    unwrap<RulePackVersion>(api.post(`/admin/rule-packs/${packId}/versions`, body)),
  updateRulePackVersion: (id: string, body: { effectiveFrom?: string; rules?: PackRule[] }) =>
    unwrap<RulePackVersion>(api.patch(`/admin/rule-pack-versions/${id}`, body)),
  activateRulePackVersion: (id: string) =>
    unwrap<RulePackVersion>(api.post(`/admin/rule-pack-versions/${id}/activate`, {})),
  simulateRulePackVersion: (id: string, sample: Record<string, unknown>) =>
    unwrap<SimulationResult>(api.post(`/admin/rule-pack-versions/${id}/simulate`, { sample })),

  // Approval flows
  approvalFlows: () => unwrap<ApprovalFlow[]>(api.get('/admin/approval-flows')),
  createApprovalFlow: (body: { name: string; entity: string; steps?: ApprovalStep[] }) =>
    unwrap<ApprovalFlow>(api.post('/admin/approval-flows', body)),
  updateApprovalFlow: (id: string, body: { name?: string; entity?: string; isActive?: boolean }) =>
    unwrap<ApprovalFlow>(api.patch(`/admin/approval-flows/${id}`, body)),
  setApprovalFlowSteps: (id: string, steps: ApprovalStep[]) =>
    unwrap<ApprovalFlow>(api.put(`/admin/approval-flows/${id}/steps`, { steps })),
  simulateApprovalFlow: (id: string, amount: number) =>
    unwrap<FlowSimulation>(api.post(`/admin/approval-flows/${id}/simulate`, { amount })),
  deleteApprovalFlow: (id: string) => unwrap<{ id: string }>(api.delete(`/admin/approval-flows/${id}`)),

  // Notification policies
  notificationPolicies: () => unwrap<NotificationPolicy[]>(api.get('/admin/notification-policies')),
  notificationChannels: () => unwrap<NotificationChannel[]>(api.get('/admin/notification-channels')),
  createNotificationPolicy: (body: Omit<NotificationPolicy, 'id'>) =>
    unwrap<NotificationPolicy>(api.post('/admin/notification-policies', body)),
  updateNotificationPolicy: (id: string, body: Partial<Omit<NotificationPolicy, 'id'>>) =>
    unwrap<NotificationPolicy>(api.patch(`/admin/notification-policies/${id}`, body)),
  toggleNotificationChannel: (id: string, channel: NotificationChannel) =>
    unwrap<NotificationPolicy>(api.post(`/admin/notification-policies/${id}/toggle`, { channel })),
  deleteNotificationPolicy: (id: string) =>
    unwrap<{ id: string }>(api.delete(`/admin/notification-policies/${id}`)),

  // Connectors
  connectors: () => unwrap<Connector[]>(api.get('/admin/connectors')),
  createConnector: (body: { key: string; name: string; category: string; config?: Record<string, unknown> }) =>
    unwrap<Connector>(api.post('/admin/connectors', body)),
  updateConnector: (id: string, body: { name?: string; config?: Record<string, unknown> }) =>
    unwrap<Connector>(api.patch(`/admin/connectors/${id}`, body)),
  testConnector: (id: string) =>
    unwrap<{ connector: Connector; ok: boolean; missing: string[]; message: string }>(
      api.post(`/admin/connectors/${id}/test`, {}),
    ),
  setConnectorStatus: (id: string, status: ConnectorStatus) =>
    unwrap<Connector>(api.patch(`/admin/connectors/${id}/status`, { status })),
  deleteConnector: (id: string) => unwrap<{ id: string }>(api.delete(`/admin/connectors/${id}`)),

  // Imports
  importEntities: () => unwrap<ImportEntityDef[]>(api.get('/admin/imports/entities')),
  importTemplate: (entity: string) =>
    unwrap<string>(api.get(`/admin/imports/template`, { params: { entity }, responseType: 'text' })),
  imports: () => unwrap<ImportJob[]>(api.get('/admin/imports')),
  getImport: (id: string) => unwrap<ImportJob>(api.get(`/admin/imports/${id}`)),
  uploadImport: (body: { entity: string; fileName: string; csv: string }) =>
    unwrap<ImportJob>(api.post('/admin/imports', body)),
  setImportMapping: (id: string, mapping: Record<string, string>) =>
    unwrap<ImportJob>(api.put(`/admin/imports/${id}/mapping`, { mapping })),
  validateImport: (id: string) => unwrap<ImportJob>(api.post(`/admin/imports/${id}/validate`, {})),
  commitImport: (id: string) => unwrap<ImportJob>(api.post(`/admin/imports/${id}/commit`, {})),

  // Audit
  auditEvents: (params: { entity?: string; action?: string; actorEmail?: string; take?: number }) =>
    unwrap<AuditEvent[]>(api.get('/admin/audit-events', { params })),
  verifyAuditChain: () => unwrap<ChainVerification>(api.get('/admin/audit-events/verify')),
  auditLineage: (id: string) => unwrap<AuditEvent[]>(api.get(`/admin/audit-events/${id}/lineage`)),
};

/** Pulls the human-readable message out of a Nest error response. */
export const errorMessage = (err: any, fallback = 'Something went wrong'): string => {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data.message === 'string') return data.message;
  if (Array.isArray(data.message)) return data.message.join(', ');
  if (typeof data.message?.message === 'string') return data.message.message;
  return fallback;
};

/** Segregation conflicts travel inside the 400 body when a save is rejected. */
export const errorConflicts = (err: any): SegregationConflict[] =>
  err?.response?.data?.message?.conflicts ?? err?.response?.data?.conflicts ?? [];
