import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create roles
  const roles = [
    { name: 'ADMIN', description: 'System Administrator with full access' },
    { name: 'DISPATCHER', description: 'Fleet Dispatcher managing runs and drivers' },
    { name: 'DRIVER', description: 'Fleet Driver performing transport operations' },
    { name: 'FLEET_MANAGER', description: 'Fleet Manager managing assets and maintenance' },
    { name: 'COMPLIANCE_MANAGER', description: 'Compliance Manager overseeing regulatory compliance, challans, insurance and incidents' },
  ];

  const dbRoles: Role[] = [];
  for (const role of roles) {
    const dbRole = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: { name: role.name, description: role.description },
    });
    dbRoles.push(dbRole);
    console.log(`Role ${role.name} seeded successfully.`);
  }

  // Seed (or update) the default administrator account.
  const adminEmail = 'admin@fleetos.com';
  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword, isActive: true },
    create: {
      email: adminEmail,
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true,
    },
  });

  const adminRole = dbRoles.find((r) => r.name === 'ADMIN');
  if (adminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: adminUser.id, roleId: adminRole.id },
      },
      update: {},
      create: { userId: adminUser.id, roleId: adminRole.id },
    });
  }

  console.log(`Administrator account ready: ${adminEmail}`);

  // Seed dispatcher user
  const dispatcherEmail = 'dispatcher@fleetos.com';
  const dispatcherUser = await prisma.user.upsert({
    where: { email: dispatcherEmail },
    update: { password: hashedPassword, isActive: true },
    create: {
      email: dispatcherEmail,
      password: hashedPassword,
      firstName: 'Lead',
      lastName: 'Dispatcher',
      isActive: true,
    },
  });

  const dispatcherRole = dbRoles.find((r) => r.name === 'DISPATCHER');
  if (dispatcherRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: dispatcherUser.id, roleId: dispatcherRole.id },
      },
      update: {},
      create: { userId: dispatcherUser.id, roleId: dispatcherRole.id },
    });
  }
  console.log(`Dispatcher account ready: ${dispatcherEmail}`);

  // Seed fleet manager user
  const managerEmail = 'manager@fleetos.com';
  const managerUser = await prisma.user.upsert({
    where: { email: managerEmail },
    update: { password: hashedPassword, isActive: true },
    create: {
      email: managerEmail,
      password: hashedPassword,
      firstName: 'Fleet',
      lastName: 'Manager',
      isActive: true,
    },
  });

  const managerRole = dbRoles.find((r) => r.name === 'FLEET_MANAGER');
  if (managerRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: managerUser.id, roleId: managerRole.id },
      },
      update: {},
      create: { userId: managerUser.id, roleId: managerRole.id },
    });
  }
  console.log(`Fleet Manager account ready: ${managerEmail}`);

  // Seed compliance manager user
  const complianceEmail = 'compliance@fleetos.com';
  const complianceUser = await prisma.user.upsert({
    where: { email: complianceEmail },
    update: { password: hashedPassword, isActive: true },
    create: {
      email: complianceEmail,
      password: hashedPassword,
      firstName: 'Compliance',
      lastName: 'Manager',
      isActive: true,
    },
  });

  const complianceRole = dbRoles.find((r) => r.name === 'COMPLIANCE_MANAGER');
  if (complianceRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: complianceUser.id, roleId: complianceRole.id },
      },
      update: {},
      create: { userId: complianceUser.id, roleId: complianceRole.id },
    });
  }
  console.log(`Compliance Manager account ready: ${complianceEmail}`);

  await seedOrgTree();
  await seedCapabilities(dbRoles);
  await seedRulePacks();
  await seedApprovalFlows();
  await seedNotificationPolicies();
  await seedConnectors();
  await seedCostCenters();
  await seedDispatcherData();

  console.log('Seeding finished.');
}

async function seedCostCenters() {
  const centers = [
    { code: 'CC-OPS', name: 'Operations', department: 'Operations', orgCode: 'ARGO', budgetAllocated: 12000000, budgetUsed: 7450000 },
    { code: 'CC-MNT', name: 'Maintenance', department: 'Workshop', orgCode: 'HUB-DEL', budgetAllocated: 4500000, budgetUsed: 3980000 },
    { code: 'CC-HR', name: 'Human Resources', department: 'HR', orgCode: 'ARGO', budgetAllocated: 2200000, budgetUsed: 910000 },
    { code: 'CC-FIN', name: 'Finance', department: 'Finance', orgCode: 'ARGO', budgetAllocated: 1800000, budgetUsed: 640000 },
    { code: 'CC-NORTH', name: 'North Region Running', department: 'Operations', orgCode: 'NORTH', budgetAllocated: 6000000, budgetUsed: 5820000 },
  ];

  for (const center of centers) {
    const orgNode = await prisma.orgNode.findUnique({ where: { code: center.orgCode } });
    await prisma.costCenter.upsert({
      where: { code: center.code },
      update: { name: center.name, department: center.department },
      create: {
        code: center.code,
        name: center.name,
        department: center.department,
        orgNodeId: orgNode?.id ?? null,
        budgetAllocated: center.budgetAllocated,
        budgetUsed: center.budgetUsed,
      },
    });
  }

  console.log(`Cost centres seeded (${centers.length} centres).`);
}

// --- P-01 Identity, RBAC & Org ---------------------------------------------

async function seedOrgTree() {
  const nodes = [
    { code: 'ARGO', name: 'ArgoLogics', type: 'ORG' as const, parentCode: null },
    { code: 'NORTH', name: 'North Region', type: 'REGION' as const, parentCode: 'ARGO' },
    { code: 'WEST', name: 'West Region', type: 'REGION' as const, parentCode: 'ARGO' },
    { code: 'HUB-DEL', name: 'Delhi Hub', type: 'HUB' as const, parentCode: 'NORTH' },
    { code: 'HUB-GGN', name: 'Gurugram Hub', type: 'HUB' as const, parentCode: 'NORTH' },
    { code: 'HUB-JAI', name: 'Jaipur Hub', type: 'HUB' as const, parentCode: 'NORTH' },
    { code: 'HUB-MUM', name: 'Mumbai Hub', type: 'HUB' as const, parentCode: 'WEST' },
    { code: 'DEP-DEL-1', name: 'Delhi Depot 1', type: 'DEPOT' as const, parentCode: 'HUB-DEL' },
    { code: 'DEP-DEL-2', name: 'Delhi Depot 2', type: 'DEPOT' as const, parentCode: 'HUB-DEL' },
    { code: 'TEAM-DISPATCH', name: 'Dispatch Team', type: 'TEAM' as const, parentCode: 'DEP-DEL-1' },
  ];

  for (const node of nodes) {
    await prisma.orgNode.upsert({
      where: { code: node.code },
      update: { name: node.name, type: node.type },
      create: { code: node.code, name: node.name, type: node.type },
    });
  }

  // Second pass so parents exist regardless of declaration order.
  for (const node of nodes) {
    if (!node.parentCode) continue;
    const parent = await prisma.orgNode.findUnique({ where: { code: node.parentCode } });
    if (parent) {
      await prisma.orgNode.update({
        where: { code: node.code },
        data: { parentId: parent.id },
      });
    }
  }

  console.log(`Org tree seeded (${nodes.length} nodes).`);
}

async function seedCapabilities(dbRoles: Role[]) {
  const capabilities = [
    { key: 'fleet.view', label: 'View fleet', group: 'Fleet' },
    { key: 'fleet.edit', label: 'Edit fleet', group: 'Fleet' },
    { key: 'route.dispatch', label: 'Dispatch routes', group: 'Fleet' },
    { key: 'driver.manage', label: 'Manage drivers', group: 'Fleet' },
    { key: 'trip.record', label: 'Record trips', group: 'Operations' },
    { key: 'expense.submit', label: 'Submit expenses', group: 'Finance' },
    { key: 'expense.approve', label: 'Approve expenses', group: 'Finance' },
    { key: 'payment.release', label: 'Release payments', group: 'Finance' },
    { key: 'vendor.manage', label: 'Manage vendors', group: 'Finance' },
    { key: 'user.manage', label: 'Manage users', group: 'Admin' },
    { key: 'role.manage', label: 'Manage roles', group: 'Admin' },
    { key: 'rulepack.manage', label: 'Manage rule packs', group: 'Admin' },
    { key: 'connector.manage', label: 'Manage integrations', group: 'Admin' },
    { key: 'import.commit', label: 'Commit imports', group: 'Admin' },
    { key: 'audit.read', label: 'Read audit log', group: 'Admin' },
  ];

  for (const cap of capabilities) {
    await prisma.capability.upsert({
      where: { key: cap.key },
      update: { label: cap.label, group: cap.group },
      create: cap,
    });
  }

  // Segregation of duties: nobody both raises and clears the same money.
  const segregation = [
    {
      capabilityA: 'expense.submit',
      capabilityB: 'expense.approve',
      message: 'A role cannot both submit and approve expenses.',
    },
    {
      capabilityA: 'expense.approve',
      capabilityB: 'payment.release',
      message: 'Approving an expense and releasing its payment must be separate roles.',
    },
    {
      capabilityA: 'vendor.manage',
      capabilityB: 'payment.release',
      message: 'Vendor master data and payment release must be held separately.',
    },
    {
      capabilityA: 'role.manage',
      capabilityB: 'audit.read',
      message: 'Whoever grants permissions should not also curate the audit trail.',
    },
  ];

  for (const rule of segregation) {
    await prisma.segregationRule.upsert({
      where: {
        capabilityA_capabilityB: {
          capabilityA: rule.capabilityA,
          capabilityB: rule.capabilityB,
        },
      },
      update: { message: rule.message },
      create: rule,
    });
  }

  const grants: Record<string, { key: string; scope: 'GLOBAL' | 'REGION' | 'HUB' | 'SELF' }[]> = {
    ADMIN: [
      { key: 'fleet.view', scope: 'GLOBAL' },
      { key: 'fleet.edit', scope: 'GLOBAL' },
      { key: 'user.manage', scope: 'GLOBAL' },
      { key: 'role.manage', scope: 'GLOBAL' },
      { key: 'rulepack.manage', scope: 'GLOBAL' },
      { key: 'connector.manage', scope: 'GLOBAL' },
      { key: 'import.commit', scope: 'GLOBAL' },
    ],
    DISPATCHER: [
      { key: 'fleet.view', scope: 'HUB' },
      { key: 'route.dispatch', scope: 'HUB' },
      { key: 'driver.manage', scope: 'HUB' },
      { key: 'expense.approve', scope: 'HUB' },
    ],
    DRIVER: [
      { key: 'fleet.view', scope: 'SELF' },
      { key: 'trip.record', scope: 'SELF' },
      { key: 'expense.submit', scope: 'SELF' },
    ],
    FLEET_MANAGER: [
      { key: 'fleet.view', scope: 'GLOBAL' },
      { key: 'fleet.edit', scope: 'GLOBAL' },
      { key: 'driver.manage', scope: 'GLOBAL' },
      { key: 'expense.approve', scope: 'GLOBAL' },
    ],
  };

  for (const role of dbRoles) {
    const caps = grants[role.name];
    if (!caps) continue;
    await prisma.roleCapability.deleteMany({ where: { roleId: role.id } });
    await prisma.roleCapability.createMany({
      data: caps.map((c) => ({ roleId: role.id, capabilityKey: c.key, scope: c.scope })),
    });
  }

  console.log(
    `Capabilities seeded (${capabilities.length} caps, ${segregation.length} SoD rules).`,
  );
}

// --- M-21 Compliance Suite --------------------------------------------------

async function seedRulePacks() {
  const packs = [
    {
      key: 'IN-CENTRAL',
      name: 'India Central Rule Pack',
      stateCode: 'IN',
      rules: [
        { code: 'BR-CMP-10', label: 'E-way bill required above threshold', field: 'consignmentValue', operator: 'lte', value: 50000, severity: 'BLOCK' },
        { code: 'BR-CMP-11', label: 'Driver licence must be present', field: 'licenceNumber', operator: 'required', severity: 'BLOCK' },
        { code: 'BR-CMP-12', label: 'Vehicle insurance must be valid', field: 'insuranceValid', operator: 'eq', value: 'true', severity: 'BLOCK' },
        { code: 'BR-CMP-13', label: 'Daily driving hours cap', field: 'drivingHours', operator: 'lte', value: 10, severity: 'WARN' },
      ],
    },
    {
      key: 'IN-RJ',
      name: 'Rajasthan State Profile',
      stateCode: 'RJ',
      rules: [
        { code: 'BR-CMP-15', label: 'State border permit on file', field: 'permitNumber', operator: 'required', severity: 'BLOCK' },
        { code: 'BR-CMP-16', label: 'Gross vehicle weight limit', field: 'grossWeightKg', operator: 'lte', value: 49000, severity: 'BLOCK' },
        { code: 'BR-CMP-17', label: 'Night movement advisory', field: 'nightMovement', operator: 'eq', value: 'false', severity: 'WARN' },
      ],
    },
    {
      key: 'IN-MH',
      name: 'Maharashtra State Profile',
      stateCode: 'MH',
      rules: [
        { code: 'BR-CMP-20', label: 'Octroi declaration present', field: 'octroiRef', operator: 'required', severity: 'WARN' },
        { code: 'BR-CMP-21', label: 'Gross vehicle weight limit', field: 'grossWeightKg', operator: 'lte', value: 46000, severity: 'BLOCK' },
      ],
    },
  ];

  for (const pack of packs) {
    const dbPack = await prisma.rulePack.upsert({
      where: { key: pack.key },
      update: { name: pack.name, stateCode: pack.stateCode },
      create: { key: pack.key, name: pack.name, stateCode: pack.stateCode },
    });

    const existing = await prisma.rulePackVersion.findFirst({
      where: { rulePackId: dbPack.id, version: 1 },
    });
    if (!existing) {
      await prisma.rulePackVersion.create({
        data: {
          rulePackId: dbPack.id,
          version: 1,
          status: 'ACTIVE',
          effectiveFrom: new Date('2026-01-01T00:00:00Z'),
          rules: pack.rules,
        },
      });
    }
  }

  console.log(`Rule packs seeded (${packs.length} packs).`);
}

// --- P-02 Approvals Engine --------------------------------------------------

async function seedApprovalFlows() {
  const flows = [
    {
      name: 'Trip expense approval',
      entity: 'Expense',
      steps: [
        { order: 1, type: 'APPROVAL' as const, roleName: 'DISPATCHER', thresholdAmount: null, slaHours: 12 },
        { order: 2, type: 'THRESHOLD' as const, roleName: 'ADMIN', thresholdAmount: 25000, slaHours: 24 },
      ],
    },
    {
      name: 'Vendor payment release',
      entity: 'Payment',
      steps: [
        { order: 1, type: 'APPROVAL' as const, roleName: 'DISPATCHER', thresholdAmount: null, slaHours: 8 },
        { order: 2, type: 'THRESHOLD' as const, roleName: 'ADMIN', thresholdAmount: 100000, slaHours: 24 },
        { order: 3, type: 'NOTIFY' as const, roleName: 'ADMIN', thresholdAmount: null, slaHours: 1 },
      ],
    },
    {
      name: 'Route deviation regularization',
      entity: 'Route',
      steps: [
        { order: 1, type: 'APPROVAL' as const, roleName: 'DISPATCHER', thresholdAmount: null, slaHours: 4 },
      ],
    },
  ];

  for (const flow of flows) {
    const existing = await prisma.approvalFlow.findFirst({ where: { name: flow.name } });
    if (existing) continue;
    await prisma.approvalFlow.create({
      data: {
        name: flow.name,
        entity: flow.entity,
        steps: { create: flow.steps },
      },
    });
  }

  console.log(`Approval flows seeded (${flows.length} flows).`);
}

// --- P-03 Notifications -----------------------------------------------------

async function seedNotificationPolicies() {
  const policies = [
    { eventKey: 'route.delayed', label: 'Route delayed', severity: 'WARNING' as const, channels: ['EMAIL', 'IN_APP'], audienceRole: 'DISPATCHER', quietHours: true, digest: false },
    { eventKey: 'vehicle.breakdown', label: 'Vehicle breakdown', severity: 'CRITICAL' as const, channels: ['SMS', 'PUSH', 'IN_APP'], audienceRole: 'DISPATCHER', quietHours: false, digest: false },
    { eventKey: 'expense.submitted', label: 'Expense submitted', severity: 'INFO' as const, channels: ['IN_APP'], audienceRole: 'DISPATCHER', quietHours: true, digest: true },
    { eventKey: 'approval.sla.breached', label: 'Approval SLA breached', severity: 'CRITICAL' as const, channels: ['EMAIL', 'PUSH'], audienceRole: 'ADMIN', quietHours: false, digest: false },
    { eventKey: 'compliance.blocked', label: 'Compliance rule blocked a trip', severity: 'CRITICAL' as const, channels: ['EMAIL', 'IN_APP', 'WEBHOOK'], audienceRole: 'ADMIN', quietHours: false, digest: false },
    { eventKey: 'import.committed', label: 'Import committed', severity: 'INFO' as const, channels: ['EMAIL'], audienceRole: 'ADMIN', quietHours: true, digest: true },
    { eventKey: 'driver.checkin', label: 'Driver checked in', severity: 'INFO' as const, channels: ['IN_APP'], audienceRole: 'DISPATCHER', quietHours: true, digest: true },
  ];

  for (const policy of policies) {
    await prisma.notificationPolicy.upsert({
      where: { eventKey: policy.eventKey },
      update: {},
      create: policy,
    });
  }

  console.log(`Notification policies seeded (${policies.length} policies).`);
}

// --- P-06 Integration & Import ----------------------------------------------

async function seedConnectors() {
  const connectors = [
    { key: 'erp-sap', name: 'SAP ERP', category: 'ERP', status: 'HEALTHY' as const, config: { endpoint: 'https://erp.internal/api', requiredKeys: ['endpoint', 'apiKey'], apiKey: 'set' } },
    { key: 'hrms-darwinbox', name: 'Darwinbox HRMS', category: 'HRMS', status: 'HEALTHY' as const, config: { endpoint: 'https://hrms.internal/api', requiredKeys: ['endpoint', 'apiKey'], apiKey: 'set' } },
    { key: 'weighbridge', name: 'Weighbridge Gateway', category: 'Telemetry', status: 'DEGRADED' as const, config: { endpoint: 'https://wb.internal', requiredKeys: ['endpoint', 'siteId'] } },
    { key: 'omc-fuel', name: 'OMC Fuel Cards', category: 'Fuel', status: 'HEALTHY' as const, config: { endpoint: 'https://omc.example/api', requiredKeys: ['endpoint', 'merchantId'], merchantId: 'ARG-77' } },
    { key: 'fastag', name: 'FASTag Toll Feed', category: 'Tolling', status: 'HEALTHY' as const, config: { endpoint: 'https://fastag.example/api', requiredKeys: ['endpoint', 'walletId'], walletId: 'W-2210' } },
    { key: 'ewb', name: 'E-Way Bill Portal', category: 'Compliance', status: 'DOWN' as const, config: { endpoint: 'https://ewaybill.gov.in/api', requiredKeys: ['endpoint', 'gstin'] } },
    { key: 'insurer', name: 'Insurance Partner', category: 'Compliance', status: 'DISCONNECTED' as const, config: { requiredKeys: ['endpoint', 'policyPrefix'] } },
    { key: 'verify-aggregator', name: 'KYC Verification Aggregator', category: 'Verification', status: 'HEALTHY' as const, config: { endpoint: 'https://kyc.example/api', requiredKeys: ['endpoint', 'clientId'], clientId: 'argo-prod' } },
  ];

  for (const connector of connectors) {
    await prisma.connector.upsert({
      where: { key: connector.key },
      update: { name: connector.name, category: connector.category },
      create: {
        key: connector.key,
        name: connector.name,
        category: connector.category,
        status: connector.status,
        config: connector.config,
        lastSyncAt: connector.status === 'DISCONNECTED' ? null : new Date(),
      },
    });
  }

  console.log(`Connectors seeded (${connectors.length} connectors).`);
}

async function seedDispatcherData() {
  console.log('Seeding dispatcher data...');

  // 1. Seed Vehicles
  const vehicles = [
    { vehicleNumber: 'DL-01-MA-1234', capacity: '10 Ton', currentLocation: 'Delhi Hub', fuel: 85, status: 'Available', utilization: 65.5, category: 'Owned', gpsDeviceStatus: 'Online', lastPingAge: '1m ago', site: 'Delhi Hub', class: 'Container', complianceFASTag: true, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true },
    { vehicleNumber: 'DL-01-MB-5678', capacity: '32 Ft MX', currentLocation: 'Delhi Hub', fuel: 92, status: 'Available', utilization: 72.0, category: 'Owned', gpsDeviceStatus: 'Online', lastPingAge: '2m ago', site: 'Delhi Hub', class: 'Open Body', complianceFASTag: true, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true },
    { vehicleNumber: 'HR-55-A-9901', capacity: '20 Ton', currentLocation: 'Gurugram Hub', fuel: 45, status: 'In Transit', utilization: 88.0, category: 'Owned', gpsDeviceStatus: 'Online', lastPingAge: '30s ago', site: 'Gurugram Hub', class: 'Flatbed', complianceFASTag: true, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true },
    { vehicleNumber: 'MH-12-PQ-4321', capacity: '15 Ton', currentLocation: 'Mumbai Hub', fuel: 70, status: 'Available', utilization: 40.0, category: 'Owned', gpsDeviceStatus: 'Online', lastPingAge: '5m ago', site: 'Mumbai Hub', class: 'Container', complianceFASTag: true, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true },
    { vehicleNumber: 'GJ-01-XX-1122', capacity: '10 Ton', currentLocation: 'Jaipur Hub', fuel: 80, status: 'Maintenance', utilization: 0.0, category: 'Owned', gpsDeviceStatus: 'Offline', lastPingAge: '14h ago', site: 'Jaipur Hub', class: 'Container', complianceFASTag: true, compliancePM: false, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true, alerts: ['PM Overdue by 1,200 km'] },
    { vehicleNumber: 'DL-02-C-8877', capacity: '32 Ft MX', currentLocation: 'Delhi Hub', fuel: 60, status: 'Blocked', utilization: 0.0, category: 'Owned', gpsDeviceStatus: 'Online', lastPingAge: '1m ago', site: 'Delhi Hub', class: 'Container', complianceFASTag: true, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: false, complianceFitness: true, compliancePermit: true, alerts: ['Insurance expired (Rule BR-CMP-03)'] },
    { vehicleNumber: 'UP-16-T-3344', capacity: '10 Ton', currentLocation: 'Delhi Hub', fuel: 15, status: 'Available', utilization: 50.0, category: 'Vendor', vendorName: 'Gati Logistics', gpsDeviceStatus: 'Online', lastPingAge: '4m ago', site: 'Delhi Hub', class: 'Container', complianceFASTag: true, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true },
    { vehicleNumber: 'HR-38-Y-7788', capacity: '20 Ton', currentLocation: 'Gurugram Hub', fuel: 90, status: 'Available', utilization: 82.0, category: 'Vendor', vendorName: 'VRL Logistics', gpsDeviceStatus: 'Online', lastPingAge: '10m ago', site: 'Gurugram Hub', class: 'Flatbed', complianceFASTag: true, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true },
    { vehicleNumber: 'MH-43-R-8899', capacity: '15 Ton', currentLocation: 'Mumbai Hub', fuel: 50, status: 'In Transit', utilization: 90.0, category: 'Vendor', vendorName: 'Safexpress', gpsDeviceStatus: 'Tampered', lastPingAge: '1m ago', site: 'Mumbai Hub', class: 'Container', complianceFASTag: true, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true },
    { vehicleNumber: 'DL-01-MC-9012', capacity: '32 Ft MX', currentLocation: 'Delhi Hub', fuel: 35, status: 'Available', utilization: 60.0, category: 'Owned', gpsDeviceStatus: 'Online', lastPingAge: '2m ago', site: 'Delhi Hub', class: 'Container', complianceFASTag: false, compliancePM: true, complianceGPS: true, complianceInspection: true, complianceInsurance: true, complianceFitness: true, compliancePermit: true, alerts: ['FASTag Low Balance (₹150)'] }
  ];

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { vehicleNumber: v.vehicleNumber },
      update: {},
      create: {
        ...v,
        alerts: v.alerts ? JSON.stringify(v.alerts) : '[]',
      },
    });
  }

  // 2. Seed Drivers
  const drivers = [
    { name: 'Ramesh Kumar', license: 'DL-1420100098765', licenseType: 'Heavy Commercial', dutyHours: 4.5, restHours: 12.0, safetyScore: 92, status: 'Available', site: 'Delhi Hub' },
    { name: 'Suresh Singh', license: 'HR-2620120034567', licenseType: 'Heavy Commercial', dutyHours: 7.2, restHours: 2.5, safetyScore: 85, status: 'Available', site: 'Delhi Hub', warnings: ['Approaching max driving hours (Rule BR-DRV-05)'] },
    { name: 'Amit Patel', license: 'GJ-0120150067890', licenseType: 'Heavy Commercial', dutyHours: 0.0, restHours: 24.0, safetyScore: 95, status: 'Available', site: 'Jaipur Hub' },
    { name: 'Vijay Patil', license: 'MH-1220110011223', licenseType: 'Heavy Commercial', dutyHours: 6.0, restHours: 8.5, safetyScore: 78, status: 'On Duty', site: 'Mumbai Hub' },
    { name: 'Satnam Singh', license: 'PB-0220080055443', licenseType: 'Heavy Commercial', dutyHours: 3.0, restHours: 15.0, safetyScore: 98, status: 'Available', site: 'Delhi Hub' },
    { name: 'Rajesh Sharma', license: 'UP-1620140088997', licenseType: 'Heavy Commercial', dutyHours: 8.5, restHours: 0.5, safetyScore: 88, status: 'Suspended', site: 'Delhi Hub', warnings: ['Suspended: Multiple overspeed breaches'] },
    { name: 'Karan Johar', license: 'DL-0120160022334', licenseType: 'Heavy Commercial', dutyHours: 2.0, restHours: 10.0, safetyScore: 89, status: 'Available', site: 'Delhi Hub' },
    { name: 'Mohammad Ali', license: 'HR-5520130099887', licenseType: 'Heavy Commercial', dutyHours: 5.5, restHours: 4.0, safetyScore: 91, status: 'On Duty', site: 'Gurugram Hub' },
    { name: 'Vikram Rathore', license: 'RJ-1420170066554', licenseType: 'Heavy Commercial', dutyHours: 0.0, restHours: 36.0, safetyScore: 94, status: 'Off Duty', site: 'Jaipur Hub' },
    { name: 'Sunil Dutt', license: 'MH-4320180011335', licenseType: 'Heavy Commercial', dutyHours: 1.5, restHours: 14.0, safetyScore: 90, status: 'Available', site: 'Mumbai Hub' }
  ];

  for (const d of drivers) {
    await prisma.driver.create({
      data: {
        ...d,
        warnings: d.warnings ? JSON.stringify(d.warnings) : '[]',
      }
    });
  }

  // 3. Seed Transport Requests
  const requests = [
    { id: 'TR-2026-001', customer: 'Amazon India', pickup: 'Delhi Hub', destination: 'Gurugram Hub', vehicleType: 'Container', capacityRequired: '10 Ton', timeWindow: '12:00 - 18:00', priority: 'CRITICAL', approvalStatus: 'APPROVED', tripType: 'Secondary', status: 'Unassigned', date: new Date(), distance: 45.0, eta: '1h 30m' },
    { id: 'TR-2026-002', customer: 'Flipkart', pickup: 'Delhi Hub', destination: 'Jaipur Hub', vehicleType: 'Open Body', capacityRequired: '32 Ft MX', timeWindow: '08:00 - 14:00', priority: 'HIGH', approvalStatus: 'APPROVED', tripType: 'FCL', status: 'Unassigned', date: new Date(), distance: 260.0, eta: '5h 15m' },
    { id: 'TR-2026-003', customer: 'Samsung Electronics', pickup: 'Gurugram Hub', destination: 'Mumbai Hub', vehicleType: 'Flatbed', capacityRequired: '20 Ton', timeWindow: '06:00 - 22:00', priority: 'CRITICAL', approvalStatus: 'APPROVED', tripType: 'FCL', status: 'Unassigned', date: new Date(), distance: 1410.0, eta: '28h 0m' },
    { id: 'TR-2026-004', customer: 'Delhivery', pickup: 'Delhi Hub', destination: 'Mumbai Hub', vehicleType: 'Container', capacityRequired: '15 Ton', timeWindow: '10:00 - 18:00', priority: 'MEDIUM', approvalStatus: 'PENDING', tripType: 'LCL', status: 'Unassigned', date: new Date(), distance: 1420.0, eta: '28h 30m' },
    { id: 'TR-2026-005', customer: 'Tata Motors', pickup: 'Jaipur Hub', destination: 'Delhi Hub', vehicleType: 'Container', capacityRequired: '10 Ton', timeWindow: '14:00 - 20:00', priority: 'LOW', approvalStatus: 'APPROVED', tripType: 'Secondary', status: 'Unassigned', date: new Date(), distance: 265.0, eta: '5h 30m' },
    { id: 'TR-2026-006', customer: 'Reliance Retail', pickup: 'Delhi Hub', destination: 'Delhi Depot 1', vehicleType: 'Container', capacityRequired: '10 Ton', timeWindow: '16:00 - 22:00', priority: 'HIGH', approvalStatus: 'APPROVED', tripType: 'Secondary', status: 'Hold', date: new Date(), distance: 25.0, eta: '1h 0m' },
    { id: 'TR-2026-007', customer: 'DHL Express', pickup: 'Mumbai Hub', destination: 'Delhi Hub', vehicleType: 'Container', capacityRequired: '15 Ton', timeWindow: '09:00 - 17:00', priority: 'CRITICAL', approvalStatus: 'APPROVED', tripType: 'FCL', status: 'Unassigned', date: new Date(), distance: 1420.0, eta: '28h 0m' },
    { id: 'TR-2026-008', customer: 'Maruti Suzuki', pickup: 'Gurugram Hub', destination: 'Jaipur Hub', vehicleType: 'Flatbed', capacityRequired: '20 Ton', timeWindow: '11:00 - 19:00', priority: 'MEDIUM', approvalStatus: 'APPROVED', tripType: 'FCL', status: 'Deferred', date: new Date(), distance: 225.0, eta: '4h 45m' }
  ];

  for (const r of requests) {
    const reasons: Record<string, string> = {
      'GJ-01-XX-1122': 'Vehicle in Maintenance (PM Overdue)',
      'DL-02-C-8877': 'Compliance block: Insurance expired (Rule BR-CMP-03)',
      'HR-55-A-9901': 'Vehicle currently In Transit on another trip'
    };
    await prisma.transportRequest.upsert({
      where: { id: r.id },
      update: {},
      create: {
        ...r,
        ineligibleReasons: JSON.stringify(reasons),
      },
    });
  }

  // 4. Seed Trips
  const trips = [
    { tripId: 'TRIP-2026-001', vehicleNumber: 'DL-01-MA-1234', driverName: 'Ramesh Kumar', status: 'Completed', routeName: 'Delhi Hub to Gurugram Hub', pickup: 'Delhi Hub', destination: 'Gurugram Hub', eta: 'Reached', distance: 45.0, startDateTime: new Date(Date.now() - 36000000), endDateTime: new Date(Date.now() - 30600000), cost: 4500.0, vendorName: null },
    { tripId: 'TRIP-2026-002', vehicleNumber: 'HR-55-A-9901', driverName: 'Vijay Patil', status: 'In Transit', routeName: 'Gurugram Hub to Jaipur Hub', pickup: 'Gurugram Hub', destination: 'Jaipur Hub', eta: '1h 15m', distance: 225.0, startDateTime: new Date(Date.now() - 7200000), cost: 18000.0, vendorName: null },
    { tripId: 'TRIP-2026-003', vehicleNumber: 'MH-43-R-8899', driverName: 'Mohammad Ali', status: 'In Transit', routeName: 'Mumbai Hub to Pune Depot', pickup: 'Mumbai Hub', destination: 'Pune Depot', eta: '3h 30m', distance: 150.0, startDateTime: new Date(Date.now() - 5400000), cost: 12000.0, vendorName: 'Safexpress' },
    { tripId: 'TRIP-2026-004', vehicleNumber: 'DL-01-MB-5678', driverName: 'Suresh Singh', status: 'Scheduled', routeName: 'Delhi Hub to Jaipur Hub', pickup: 'Delhi Hub', destination: 'Jaipur Hub', eta: 'Departure at 14:00', distance: 260.0, startDateTime: null, cost: 22000.0, vendorName: null }
  ];

  for (const t of trips) {
    const defaultTimeline = [
      { name: 'Origin Check-in', status: 'Done', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { name: 'Loading Completed', status: 'Done', timestamp: new Date(Date.now() - 5400000).toISOString() },
      { name: 'Gate Exit', status: 'Done', timestamp: new Date(Date.now() - 4800000).toISOString() },
      { name: 'Checkpoint 1 (Toll)', status: t.status === 'In Transit' ? 'Active' : 'Pending', timestamp: null },
      { name: 'Destination Gate', status: 'Pending', timestamp: null }
    ];

    const defaultDocs = [
      { name: 'Gate Pass', url: '#', status: 'Verified' },
      { name: 'Loading Slip', url: '#', status: 'Verified' },
      { name: 'POD Signoff', url: '#', status: t.status === 'Completed' ? 'Verified' : 'Pending' }
    ];

    const defaultExpenses = [
      { category: 'Toll', amount: 850.0, status: 'Approved' },
      { category: 'Driver Bhatta', amount: 1500.0, status: 'Approved' },
      { category: 'Loading Charges', amount: 1200.0, status: 'Pending' }
    ];

    const defaultFuel = [
      { odo: 124500, liters: 80, cost: 7200.0, station: 'IOCL Delhi Depot' }
    ];

    const defaultGate = [
      { event: 'ANPR Entry Detected', timestamp: new Date(Date.now() - 10000000).toISOString() },
      { event: 'Manual Gate Out Checked', timestamp: new Date(Date.now() - 4800000).toISOString() }
    ];

    const defaultAudit = [
      { user: 'dispatcher@fleetos.com', action: 'Trip Created and Vehicle Assigned', timestamp: new Date(Date.now() - 12000000).toISOString() },
      { user: 'gate_delhi@fleetos.com', action: 'ANPR Entry Logged', timestamp: new Date(Date.now() - 10000000).toISOString() }
    ];

    await prisma.trip.upsert({
      where: { tripId: t.tripId },
      update: {},
      create: {
        ...t,
        timeline: JSON.stringify(defaultTimeline),
        documents: JSON.stringify(defaultDocs),
        expenses: JSON.stringify(defaultExpenses),
        fuelEntries: JSON.stringify(defaultFuel),
        gateEvents: JSON.stringify(defaultGate),
        stateTimeline: JSON.stringify([
          { state: 'Created', timestamp: new Date(Date.now() - 12000000).toISOString() },
          { state: 'Dispatched', timestamp: new Date(Date.now() - 4800000).toISOString() }
        ]),
        auditTrail: JSON.stringify(defaultAudit)
      }
    });
  }

  // 5. Seed Gate Queue
  const gateEntries = [
    { vehicleNumber: 'DL-01-MA-1234', status: 'Exited', gatePassNumber: 'GP-2026-0044', eta: 'Reached', enteredAt: new Date(Date.now() - 7200000), exitedAt: new Date(Date.now() - 6000000), detentionTimer: 20 },
    { vehicleNumber: 'HR-55-A-9901', status: 'Entered', gatePassNumber: 'GP-2026-0045', eta: 'In Yard', enteredAt: new Date(Date.now() - 1800000), exitedAt: null, detentionTimer: 30 },
    { vehicleNumber: 'UP-16-T-3344', status: 'Waiting', gatePassNumber: 'GP-2026-0046', eta: 'At Gate', enteredAt: null, exitedAt: null, detentionTimer: 0 },
    { vehicleNumber: 'DL-01-MB-5678', status: 'Expected', gatePassNumber: 'GP-2026-0047', eta: '10 mins', enteredAt: null, exitedAt: null, detentionTimer: 0 },
    { vehicleNumber: 'DL-02-C-8877', status: 'Blocked', gatePassNumber: 'GP-2026-0048', eta: 'At Gate', enteredAt: null, exitedAt: null, detentionTimer: 0, checklistPhotos: JSON.stringify({ load: null, seal: null, odo: null }) }
  ];

  for (const ge of gateEntries) {
    await prisma.gateQueueEntry.create({
      data: {
        ...ge,
        checklistPhotos: ge.checklistPhotos ?? '[]'
      }
    });
  }

  // 6. Seed Exception Alerts
  const exceptions = [
    { type: 'Overspeed', vehicleNumber: 'HR-55-A-9901', driverName: 'Vijay Patil', tripId: 'TRIP-2026-002', status: 'Open', severity: 'CRITICAL', details: 'Vehicle clocked 94 km/h (Limit: 80 km/h) on NH-48' },
    { type: 'GPS Offline', vehicleNumber: 'GJ-01-XX-1122', driverName: 'Amit Patel', tripId: null, status: 'Open', severity: 'WARNING', details: 'GPS device offline for 14 hours' },
    { type: 'Document Expiry', vehicleNumber: 'DL-02-C-8877', driverName: 'Rajesh Sharma', tripId: null, status: 'Open', severity: 'CRITICAL', details: 'Insurance expired on 2026-07-19 (Rule BR-CMP-03)' },
    { type: 'FASTag Low Balance', vehicleNumber: 'DL-01-MC-9012', driverName: 'Karan Johar', tripId: null, status: 'Open', severity: 'WARNING', details: 'FASTag balance low (₹150). Recommended minimum ₹500' },
    { type: 'Driver No Show', vehicleNumber: 'DL-01-MB-5678', driverName: 'Suresh Singh', tripId: 'TRIP-2026-004', status: 'Open', severity: 'CRITICAL', details: 'Driver did not check in for scheduled trip (Scheduled: 14:00)' }
  ];

  for (const ex of exceptions) {
    await prisma.exceptionAlert.create({
      data: ex
    });
  }

  console.log('Dispatcher data seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
