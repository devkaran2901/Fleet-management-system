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

  await seedOrgTree();
  await seedCapabilities(dbRoles);
  await seedRulePacks();
  await seedApprovalFlows();
  await seedNotificationPolicies();
  await seedConnectors();

  console.log('Seeding finished.');
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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
