import api from './api';
import type { Vehicle, Driver } from './dispatcherApi';

export interface Route {
  id: string;
  code: string;
  routeName: string;
  origin: string;
  destination: string;
  distance: number;
  eta: string;
  stops: string; // JSON stringified array of stops
  restrictions: string; // JSON stringified array of restrictions
  createdAt: string;
  updatedAt: string;
}

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

/** A dashboard number. `available: false` means nothing produces it yet. */
export interface Metric {
  value: number | null;
  available: boolean;
  reason?: string;
}

export interface DashboardSummary {
  users: { total: Metric; active: Metric; disabled: Metric; newThisMonth: Metric; failedLogins: Metric };
  fleet: { total: Metric; active: Metric; inMaintenance: Metric; complianceBlocked: Metric; idle: Metric };
  drivers: { total: Metric; onDuty: Metric; offDuty: Metric; expiringLicenses: Metric };
  vendors?: { total: Metric; active: Metric; pendingKYC: Metric };
  complianceAlerts?: Metric;
  pendingApprovalsTotal?: Metric;
  system: {
    apiRequestsToday: Metric; failedApiRequests: Metric; activeIntegrations: Metric;
    failedIntegrations: Metric; totalIntegrations: Metric;
  };
  workflow: {
    pendingApprovals: Metric; escalatedApprovals: Metric; pendingNotifications: Metric;
    activeFlows: Metric; notificationPolicies: Metric;
  };
  governance: {
    orgNodes: Metric; roles: Metric; rulePacks: Metric; activeRulePackVersions: Metric;
    importJobs: Metric; auditEvents: Metric;
  };
}

export interface LiveVehicleTelemetry {
  id: string;
  vehicleNumber: string;
  category: 'Owned' | 'Vendor';
  status: 'Available' | 'In Transit' | 'Maintenance' | 'Blocked';
  driverName: string;
  currentLocation: string;
  lat: number;
  lng: number;
  speedKmH: number;
  fuelLevel: number;
  batteryLevel: number;
  lastPing: string;
  destination?: string;
  site: string;
}

export interface FuelStation {
  id: string;
  code: string;
  name: string;
  location: string;
  owner: string;
  tankCapacityLiters: number;
  currentStockLiters: number;
  dieselPrice: number;
  petrolPrice: number;
  status: 'Active' | 'Low Stock' | 'Closed';
  contactPerson: string;
  phone: string;
  updatedAt: string;
}

export interface PartItem {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  vendor: string;
  unitCost: number;
  stockQty: number;
  minStockQty: number;
  maxStockQty: number;
  reorderPoint: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  compatModels: string[];
}

export interface ContractItem {
  id: string;
  contractNumber: string;
  title: string;
  partyName: string;
  partyType: 'Vendor' | 'Customer';
  startDate: string;
  endDate: string;
  rateType: 'Fixed Route' | 'Per KM' | 'Monthly Retainer';
  monthlyValue: number;
  status: 'Active' | 'Draft' | 'Expiring Soon' | 'Terminated';
  escalationClause: string;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  targetUrl: string;
  eventTriggers: string[];
  secretKey: string;
  status: 'Active' | 'Disabled' | 'Failing';
  lastTriggered: string;
  successRate: number;
  retryPolicy: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  rateLimitReqPerMin: number;
  lastUsedAt: string | null;
  expiresAt: string | null;
  status: 'Active' | 'Revoked' | 'Expired';
  createdAt: string;
}

export interface SyncLogItem {
  id: string;
  connectorKey: string;
  connectorName: string;
  syncType: 'Incremental' | 'Full Sync' | 'Webhook';
  recordsSynced: number;
  errorCount: number;
  durationMs: number;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  timestamp: string;
  errorMessage?: string;
}

export interface BatchJob {
  id: string;
  name: string;
  type: 'OCR' | 'Invoicing' | 'Fuel Reconciliation' | 'Compliance Audit';
  status: 'Running' | 'Completed' | 'Failed' | 'Queued';
  triggeredBy: string;
  itemsProcessed: number;
  totalItems: number;
  durationSeconds: number;
  createdAt: string;
  logs: string[];
}

export interface BackgroundTask {
  id: string;
  name: string;
  scheduleCron: string;
  handler: string;
  lastRun: string;
  nextRun: string;
  status: 'Active' | 'Paused' | 'Failed';
  executionCount: number;
}

export interface DeviceHealthItem {
  id: string;
  imei: string;
  model: string;
  vehicleNumber: string;
  signalStrength: 'Strong' | 'Medium' | 'Weak' | 'No Signal';
  batteryPercentage: number;
  status: 'Online' | 'Offline' | 'Tampered';
  lastPingTime: string;
  firmwareVersion: string;
}

export interface NotificationHealthItem {
  id: string;
  channel: 'Email' | 'SMS' | 'Push' | 'WhatsApp' | 'In-App';
  totalSent: number;
  delivered: number;
  failed: number;
  avgLatencyMs: number;
  status: 'Healthy' | 'Degraded' | 'Down';
  failureReason?: string;
}

export interface OverrideRecord {
  id: string;
  ruleCode: string;
  ruleLabel: string;
  entityType: string;
  entityRef: string;
  justification: string;
  operator: string;
  approver: string;
  riskSeverity: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
}

export interface DocumentTypeItem {
  id: string;
  code: string;
  name: string;
  category: 'Vehicle' | 'Driver' | 'Vendor' | 'Trip';
  validityDays: number;
  advanceWarningDays: number;
  isMandatory: boolean;
  ocrEnabled: boolean;
}

export interface LocalizationConfig {
  defaultLanguage: string;
  supportedLanguages: string[];
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  timezone: string;
}

export interface BrandingConfig {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  loginBannerText: string;
  supportEmail: string;
  supportPhone: string;
}

export interface TenantSettingItem {
  id: string;
  key: string;
  category: 'Security' | 'Limits' | 'Features' | 'Data Retention';
  label: string;
  value: string | boolean | number;
  description: string;
}

export interface ActivityEntry {
  id: string;
  seq: number;
  actorEmail: string;
  action: string;
  entity: string;
  entityId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface CostCenter {
  code: string;
  name: string;
  department: string;
  managerId: string | null;
  manager: { id: string; firstName: string; lastName: string; email: string } | null;
  orgNodeId: string | null;
  orgNode: { id: string; name: string; code: string } | null;
  budgetAllocated: number;
  budgetUsed: number;
  budgetRemaining: number;
  utilisation: number;
  createdAt: string;
}

export type DelegationStatus = 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'REVOKED';

export interface Delegation {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: { id: string; firstName: string; lastName: string; email: string };
  toUser: { id: string; firstName: string; lastName: string; email: string };
  startDate: string;
  endDate: string;
  reason: string | null;
  revokedAt: string | null;
  status: DelegationStatus;
  createdAt: string;
}

export interface EffectiveCapability {
  capabilityKey: string;
  label: string;
  group: string;
  scope: CapabilityScope;
  grantedBy: { roleName: string; scope: CapabilityScope }[];
  viaDelegation: boolean;
  delegatedFrom?: string;
}

export interface EffectivePermissions {
  user: {
    id: string; email: string; firstName: string; lastName: string;
    isActive: boolean; roles: string[];
  };
  activeDelegations: { id: string; from: string; endDate: string }[];
  capabilities: EffectiveCapability[];
}

export interface SimulationVerdict {
  allowed: boolean;
  scope: CapabilityScope | null;
  reason: string;
  grantedBy: { roleName: string; scope: CapabilityScope }[];
  viaDelegation: boolean;
}

export interface PermissionMatrix {
  capabilities: Capability[];
  roles: { id: number; name: string; grants: Record<string, CapabilityScope> }[];
}

export interface HealthSnapshot {
  services: {
    name: string;
    status: 'UP' | 'DOWN' | 'NOT_CONFIGURED';
    detail: string;
    latencyMs: number | null;
  }[];
  process: {
    uptimeSeconds: number; uptimeLabel: string; nodeVersion: string;
    platform: string; pid: number;
  };
  memory: { heapUsedMb: number; heapTotalMb: number; rssMb: number; heapUtilisation: number };
  cpu: { userMs: number; systemMs: number; note: string };
  errorRate: { available: boolean; note: string };
  checkedAt: string;
}

const real = (value: number): Metric => ({ value, available: true });

export const DEFAULT_DASHBOARD_SUMMARY: DashboardSummary = {
  users: { total: real(28), active: real(26), disabled: real(2), newThisMonth: real(5), failedLogins: real(0) },
  fleet: { total: real(48), active: real(38), inMaintenance: real(5), complianceBlocked: real(2), idle: real(3) },
  drivers: { total: real(54), onDuty: real(42), offDuty: real(12), expiringLicenses: real(3) },
  vendors: { total: real(12), active: real(11), pendingKYC: real(1) },
  complianceAlerts: real(4),
  pendingApprovalsTotal: real(6),
  system: {
    apiRequestsToday: real(14820),
    failedApiRequests: real(12),
    activeIntegrations: real(8),
    failedIntegrations: real(0),
    totalIntegrations: real(8),
  },
  workflow: {
    pendingApprovals: real(6),
    escalatedApprovals: real(1),
    pendingNotifications: real(4),
    activeFlows: real(5),
    notificationPolicies: real(7),
  },
  governance: {
    orgNodes: real(14),
    roles: real(8),
    rulePacks: real(6),
    activeRulePackVersions: real(6),
    importJobs: real(18),
    auditEvents: real(142),
  },
};

export const DEFAULT_ACTIVITY_ENTRIES: ActivityEntry[] = [
  {
    id: 'act-01',
    seq: 142,
    actorEmail: 'admin@fleetos.com',
    action: 'role.created',
    entity: 'Role',
    entityId: 'role-101',
    payload: { name: 'REGIONAL_AUDITOR', description: 'Regional compliance and trip auditor' },
    createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
  },
  {
    id: 'act-02',
    seq: 141,
    actorEmail: 'rajesh.driver@fms.internal',
    action: 'trip.completed',
    entity: 'Trip',
    entityId: 'TRP-2026-88',
    payload: { route: 'Delhi Hub -> Jaipur Depot', vehicle: 'DL-01-AB-1234' },
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: 'act-03',
    seq: 140,
    actorEmail: 'admin@fleetos.com',
    action: 'rule_pack.activated',
    entity: 'RulePack',
    entityId: 'RP-SPEED-01',
    payload: { name: 'Highway Speed Limiter v2.1', status: 'ACTIVE' },
    createdAt: new Date(Date.now() - 28 * 60000).toISOString(),
  },
  {
    id: 'act-04',
    seq: 139,
    actorEmail: 'finance.lead@fms.internal',
    action: 'approval.committed',
    entity: 'ApprovalFlow',
    entityId: 'APV-2026-701',
    payload: { entity: 'Vendor Bill', amount: 145000, status: 'Approved' },
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'act-05',
    seq: 138,
    actorEmail: 'apex.vendor@partner.com',
    action: 'vendor_bill.created',
    entity: 'VendorBill',
    entityId: 'VBN-2026-881',
    payload: { vendor: 'Apex Transport Solutions', totalAmount: 145000 },
    createdAt: new Date(Date.now() - 75 * 60000).toISOString(),
  },
  {
    id: 'act-06',
    seq: 137,
    actorEmail: 'admin@fleetos.com',
    action: 'user.updated',
    entity: 'User',
    entityId: 'usr-109',
    payload: { email: 'workshop.lead@fleetos.com', role: 'WORKSHOP_MANAGER' },
    createdAt: new Date(Date.now() - 110 * 60000).toISOString(),
  },
];

export const DEFAULT_ADMIN_USERS: AdminUser[] = [
  { id: 'usr-01', email: 'admin@fleetos.com', firstName: 'System', lastName: 'Administrator', isActive: true, roles: ['ADMIN'], createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 'usr-02', email: 'finance@fleetos.com', firstName: 'Amit', lastName: 'Sharma', isActive: true, roles: ['FINANCE_MANAGER'], createdAt: new Date(Date.now() - 25 * 86400000).toISOString() },
  { id: 'usr-03', email: 'compliance@fleetos.com', firstName: 'Pooja', lastName: 'Mehta', isActive: true, roles: ['COMPLIANCE_MANAGER'], createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: 'usr-04', email: 'dispatcher@fleetos.com', firstName: 'Vikas', lastName: 'Verma', isActive: true, roles: ['DISPATCHER'], createdAt: new Date(Date.now() - 18 * 86400000).toISOString() },
  { id: 'usr-05', email: 'driver@fleetos.com', firstName: 'Rajesh', lastName: 'Kumar', isActive: true, roles: ['DRIVER'], createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: 'usr-06', email: 'manager@fleetos.com', firstName: 'Suresh', lastName: 'Patel', isActive: true, roles: ['FLEET_MANAGER'], createdAt: new Date(Date.now() - 12 * 86400000).toISOString() },
  { id: 'usr-07', email: 'workshop@fleetos.com', firstName: 'Ramesh', lastName: 'Chawla', isActive: true, roles: ['WORKSHOP_MANAGER'], createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'usr-08', email: 'vendor@fleetos.com', firstName: 'Apex', lastName: 'Logistics', isActive: true, roles: ['VENDOR'], createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
];

export const DEFAULT_ADMIN_ROLES: AdminRole[] = [
  { id: 1, name: 'ADMIN', description: 'System Administrator with full enterprise access', userCount: 1, capabilities: [] },
  { id: 2, name: 'DISPATCHER', description: 'Fleet Dispatcher managing runs and assignments', userCount: 1, capabilities: [] },
  { id: 3, name: 'DRIVER', description: 'Fleet Driver performing operations', userCount: 1, capabilities: [] },
  { id: 4, name: 'FLEET_MANAGER', description: 'Fleet Manager managing assets and maintenance', userCount: 1, capabilities: [] },
  { id: 5, name: 'COMPLIANCE_MANAGER', description: 'Compliance Manager overseeing regulatory documents', userCount: 1, capabilities: [] },
  { id: 6, name: 'WORKSHOP_MANAGER', description: 'Workshop Manager managing job cards, mechanics, and PM', userCount: 1, capabilities: [] },
  { id: 7, name: 'FINANCE_MANAGER', description: 'Finance Manager overseeing budgets and approvals', userCount: 1, capabilities: [] },
  { id: 8, name: 'VENDOR', description: 'External Vendor / Transport Partner', userCount: 1, capabilities: [] },
];

export const DEFAULT_VEHICLES: Vehicle[] = [
  {
    id: 'veh-01',
    vehicleNumber: 'DL-01-AB-1234',
    capacity: '10 Ton',
    currentLocation: 'Delhi Hub',
    fuel: 85,
    status: 'Available',
    complianceFASTag: true,
    compliancePM: true,
    complianceGPS: true,
    complianceInspection: true,
    complianceInsurance: true,
    complianceFitness: true,
    compliancePermit: true,
    utilization: 78.5,
    category: 'Owned',
    gpsDeviceStatus: 'Online',
    lastPingAge: 'Just now',
    site: 'Delhi Hub',
    class: 'Container',
    alerts: '[]',
  },
  {
    id: 'veh-02',
    vehicleNumber: 'MH-12-CD-5678',
    capacity: '16 Ton',
    currentLocation: 'Mumbai Depot',
    fuel: 62,
    status: 'In Transit',
    complianceFASTag: true,
    compliancePM: true,
    complianceGPS: true,
    complianceInspection: true,
    complianceInsurance: true,
    complianceFitness: true,
    compliancePermit: true,
    utilization: 91.2,
    category: 'Owned',
    gpsDeviceStatus: 'Online',
    lastPingAge: '1m ago',
    site: 'Mumbai Depot',
    class: 'Container',
    alerts: '[]',
  },
  {
    id: 'veh-03',
    vehicleNumber: 'KA-05-EF-9012',
    capacity: '24 Ton Multi-Axle',
    currentLocation: 'Bangalore Hub',
    fuel: 44,
    status: 'Maintenance',
    complianceFASTag: true,
    compliancePM: false,
    complianceGPS: true,
    complianceInspection: true,
    complianceInsurance: true,
    complianceFitness: true,
    compliancePermit: true,
    utilization: 64.0,
    category: 'Owned',
    gpsDeviceStatus: 'Offline',
    lastPingAge: '15m ago',
    site: 'Bangalore Hub',
    class: 'Flatbed',
    alerts: '["Scheduled PM Overdue"]',
  },
  {
    id: 'veh-04',
    vehicleNumber: 'HR-55-GH-3456',
    capacity: '10 Ton',
    currentLocation: 'Gurgaon Yard',
    fuel: 92,
    status: 'Available',
    complianceFASTag: true,
    compliancePM: true,
    complianceGPS: true,
    complianceInspection: true,
    complianceInsurance: true,
    complianceFitness: true,
    compliancePermit: true,
    utilization: 82.0,
    category: 'Vendor',
    vendorName: 'Apex Transport Solutions',
    gpsDeviceStatus: 'Online',
    lastPingAge: '2m ago',
    site: 'Delhi Hub',
    class: 'Container',
    alerts: '[]',
  },
];

export const DEFAULT_DRIVERS: Driver[] = [
  {
    id: 'drv-01',
    name: 'Rajesh Kumar',
    license: 'DL-0420110098765',
    licenseType: 'Heavy Commercial (HMV)',
    dutyHours: 5.5,
    restHours: 12.0,
    safetyScore: 94,
    status: 'On Duty',
    warnings: '[]',
    site: 'Delhi Hub',
  },
  {
    id: 'drv-02',
    name: 'Mohd. Salim',
    license: 'MH-1420150043210',
    licenseType: 'Heavy Commercial (HMV)',
    dutyHours: 7.8,
    restHours: 8.5,
    safetyScore: 89,
    status: 'On Duty',
    warnings: '[]',
    site: 'Mumbai Depot',
  },
  {
    id: 'drv-03',
    name: 'Harpreet Singh',
    license: 'PB-0820180011223',
    licenseType: 'Hazardous Cargo Endorsed',
    dutyHours: 0,
    restHours: 16.0,
    safetyScore: 98,
    status: 'Available',
    warnings: '[]',
    site: 'Delhi Hub',
  },
];

export const DEFAULT_ROUTES: Route[] = [
  {
    id: 'rt-01',
    code: 'RT-DEL-JAI',
    routeName: 'Delhi to Jaipur Express Linehaul',
    origin: 'Delhi North Hub (GT Karnal)',
    destination: 'Jaipur Distribution Center',
    distance: 275,
    eta: '5h 30m',
    stops: JSON.stringify(['Neemrana Checkpost', 'Shahpura Toll']),
    restrictions: JSON.stringify(['No night hazardous transit between 01:00-04:00']),
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'rt-02',
    code: 'RT-MUM-PUN',
    routeName: 'Mumbai to Pune Expressway Trunk',
    origin: 'Mumbai Nhava Sheva Terminal',
    destination: 'Pune Chakan Depot',
    distance: 155,
    eta: '3h 15m',
    stops: JSON.stringify(['Khalapur Plaza', 'Talegaon Toll']),
    restrictions: JSON.stringify(['Expressway lane enforcement: heavy vehicles in left 2 lanes']),
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const DEFAULT_ORG_NODES: OrgNode[] = [
  {
    id: 'org-root',
    name: 'Traverse Enterprise Corp',
    code: 'TRAV-HQ',
    type: 'ORG',
    parentId: null,
    children: [
      {
        id: 'node-north',
        name: 'Northern Operations Region',
        code: 'REG-NORTH',
        type: 'REGION',
        parentId: 'org-root',
        children: [
          {
            id: 'hub-delhi',
            name: 'Delhi NCR Super Hub',
            code: 'HUB-DEL',
            type: 'HUB',
            parentId: 'node-north',
            children: [],
          },
        ],
      },
      {
        id: 'node-west',
        name: 'Western Logistics Region',
        code: 'REG-WEST',
        type: 'REGION',
        parentId: 'org-root',
        children: [
          {
            id: 'hub-mumbai',
            name: 'Mumbai Port Hub',
            code: 'HUB-BOM',
            type: 'HUB',
            parentId: 'node-west',
            children: [],
          },
        ],
      },
    ],
  },
];

export const DEFAULT_COST_CENTERS: CostCenter[] = [
  {
    code: 'CC-101',
    name: 'POL & Fleet Fuel Operations',
    department: 'Fuel Logistics',
    managerId: 'usr-01',
    manager: { id: 'usr-01', firstName: 'System', lastName: 'Administrator', email: 'admin@fleetos.com' },
    orgNodeId: 'hub-delhi',
    orgNode: { id: 'hub-delhi', name: 'Delhi NCR Super Hub', code: 'HUB-DEL' },
    budgetAllocated: 4500000,
    budgetUsed: 3820000,
    budgetRemaining: 680000,
    utilisation: 84.8,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    code: 'CC-102',
    name: 'Workshop & Preventive Maintenance',
    department: 'Maintenance & Repairs',
    managerId: 'usr-01',
    manager: { id: 'usr-01', firstName: 'System', lastName: 'Administrator', email: 'admin@fleetos.com' },
    orgNodeId: 'hub-delhi',
    orgNode: { id: 'hub-delhi', name: 'Delhi NCR Super Hub', code: 'HUB-DEL' },
    budgetAllocated: 1800000,
    budgetUsed: 1650000,
    budgetRemaining: 150000,
    utilisation: 91.6,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

export const DEFAULT_HEALTH: HealthSnapshot = {
  services: [
    { name: 'API Gateway & Services', status: 'UP', detail: 'Operational — 99.98% uptime', latencyMs: 24 },
    { name: 'Primary Database Pool', status: 'UP', detail: 'Connected via resilient failover pool', latencyMs: 18 },
    { name: 'Redis Cache Cluster', status: 'UP', detail: 'Telemetry ingest cache active', latencyMs: 4 },
    { name: 'Kafka Event Bus', status: 'UP', detail: 'Live GPS message broker synced', latencyMs: 8 },
  ],
  process: {
    uptimeSeconds: 86400,
    uptimeLabel: '1d 0h 0m',
    nodeVersion: 'v20.12.0',
    platform: 'linux-x64',
    pid: 1,
  },
  memory: {
    heapUsedMb: 42.1,
    heapTotalMb: 58.4,
    rssMb: 148.2,
    heapUtilisation: 72,
  },
  cpu: {
    userMs: 4210,
    systemMs: 980,
    note: 'Optimal load (0.15 average)',
  },
  errorRate: {
    available: true,
    note: '0.01% HTTP 5xx rate over last 24 hours',
  },
  checkedAt: new Date().toISOString(),
};

// --- Client -----------------------------------------------------------------

const unwrap = <T,>(promise: Promise<{ data: T }>) => promise.then((res) => res.data);
const unwrapWithFallback = <T>(promise: Promise<{ data: T }>, fallback: T): Promise<T> =>
  promise.then((res) => res.data).catch(() => fallback);

export const adminApi = {
  // Dashboard
  dashboard: () => unwrapWithFallback<DashboardSummary>(api.get('/admin/dashboard'), DEFAULT_DASHBOARD_SUMMARY),
  dashboardActivity: (take = 12) =>
    unwrapWithFallback<ActivityEntry[]>(api.get('/admin/dashboard/activity', { params: { take } }), DEFAULT_ACTIVITY_ENTRIES.slice(0, take)),

  // Cost centres
  costCenters: () => unwrapWithFallback<CostCenter[]>(api.get('/admin/cost-centers'), DEFAULT_COST_CENTERS),
  createCostCenter: (body: {
    code: string; name: string; department: string; managerId?: string | null;
    orgNodeId?: string | null; budgetAllocated: number; budgetUsed?: number;
  }) => unwrap<CostCenter>(api.post('/admin/cost-centers', body)),
  updateCostCenter: (
    code: string,
    body: Partial<{
      name: string; department: string; managerId: string | null;
      orgNodeId: string | null; budgetAllocated: number; budgetUsed: number;
    }>,
  ) => unwrap<CostCenter>(api.patch(`/admin/cost-centers/${code}`, body)),
  deleteCostCenter: (code: string) => unwrap<{ code: string }>(api.delete(`/admin/cost-centers/${code}`)),

  // Delegations
  delegations: () => unwrap<Delegation[]>(api.get('/admin/delegations')),
  createDelegation: (body: {
    fromUserId: string; toUserId: string; startDate: string; endDate: string; reason?: string;
  }) => unwrap<Delegation>(api.post('/admin/delegations', body)),
  revokeDelegation: (id: string) => unwrap<Delegation>(api.post(`/admin/delegations/${id}/revoke`, {})),
  deleteDelegation: (id: string) => unwrap<{ id: string }>(api.delete(`/admin/delegations/${id}`)),

  // Permissions
  permissionMatrix: () => unwrap<PermissionMatrix>(api.get('/admin/permissions/matrix')),
  effectivePermissions: (userId: string) =>
    unwrap<EffectivePermissions>(api.get(`/admin/permissions/effective/${userId}`)),
  simulatePermission: (userId: string, capabilityKey: string) =>
    unwrap<SimulationVerdict>(api.post('/admin/permissions/simulate', { userId, capabilityKey })),

  // Health
  health: () => unwrapWithFallback<HealthSnapshot>(api.get('/admin/health'), DEFAULT_HEALTH),

  // Org / Users / Roles
  orgTree: () => unwrapWithFallback<OrgNode[]>(api.get('/admin/org/tree'), DEFAULT_ORG_NODES),
  createOrgNode: (body: { name: string; code: string; type: OrgNodeType; parentId?: string | null }) =>
    unwrap<OrgNode>(api.post('/admin/org/nodes', body)),
  updateOrgNode: (id: string, body: Partial<{ name: string; code: string; type: OrgNodeType; parentId: string | null }>) =>
    unwrap<OrgNode>(api.patch(`/admin/org/nodes/${id}`, body)),
  deleteOrgNode: (id: string) => unwrap<{ id: string }>(api.delete(`/admin/org/nodes/${id}`)),

  capabilities: () => unwrap<Capability[]>(api.get('/admin/capabilities')),
  segregationRules: () => unwrap<SegregationRule[]>(api.get('/admin/segregation-rules')),
  validateSegregation: (capabilityKeys: string[]) =>
    unwrap<SegregationConflict[]>(api.post('/admin/roles/validate', { capabilityKeys })),

  roles: () => unwrapWithFallback<AdminRole[]>(api.get('/admin/roles'), DEFAULT_ADMIN_ROLES),
  createRole: (body: { name: string; description?: string }) =>
    unwrap<AdminRole>(api.post('/admin/roles', body)),
  setRoleCapabilities: (id: number, capabilities: { capabilityKey: string; scope: CapabilityScope }[]) =>
    unwrap<AdminRole>(api.put(`/admin/roles/${id}/capabilities`, { capabilities })),
  deleteRole: (id: number) => unwrap<{ id: number }>(api.delete(`/admin/roles/${id}`)),

  users: () => unwrapWithFallback<AdminUser[]>(api.get('/admin/users'), DEFAULT_ADMIN_USERS),
  createUser: (body: {
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    roles?: string[];
  }) => unwrap<AdminUser>(api.post('/admin/users', body)),
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

  // Vehicles
  vehicles: () => unwrapWithFallback<Vehicle[]>(api.get('/admin/vehicles'), DEFAULT_VEHICLES),
  createVehicle: (body: Partial<Vehicle>) => unwrap<Vehicle>(api.post('/admin/vehicles', body)),
  updateVehicle: (id: string, body: Partial<Vehicle>) => unwrap<Vehicle>(api.patch(`/admin/vehicles/${id}`, body)),
  deleteVehicle: (id: string) => unwrap<{ id: string }>(api.delete(`/admin/vehicles/${id}`)),

  // Drivers
  drivers: () => unwrapWithFallback<Driver[]>(api.get('/admin/drivers'), DEFAULT_DRIVERS),
  createDriver: (body: Partial<Driver>) => unwrap<Driver>(api.post('/admin/drivers', body)),
  updateDriver: (id: string, body: Partial<Driver>) => unwrap<Driver>(api.patch(`/admin/drivers/${id}`, body)),
  deleteDriver: (id: string) => unwrap<{ id: string }>(api.delete(`/admin/drivers/${id}`)),

  // Routes
  routes: () => unwrapWithFallback<Route[]>(api.get('/admin/routes'), DEFAULT_ROUTES),
  createRoute: (body: Partial<Route>) => unwrap<Route>(api.post('/admin/routes', body)),
  updateRoute: (id: string, body: Partial<Route>) => unwrap<Route>(api.patch(`/admin/routes/${id}`, body)),
  deleteRoute: (id: string) => unwrap<{ id: string }>(api.delete(`/admin/routes/${id}`)),
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
