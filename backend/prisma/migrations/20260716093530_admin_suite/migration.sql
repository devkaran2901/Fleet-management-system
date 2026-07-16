-- CreateEnum
CREATE TYPE "OrgNodeType" AS ENUM ('ORG', 'REGION', 'HUB', 'DEPOT', 'TEAM');

-- CreateEnum
CREATE TYPE "CapabilityScope" AS ENUM ('GLOBAL', 'REGION', 'HUB', 'SELF');

-- CreateEnum
CREATE TYPE "RulePackStatus" AS ENUM ('DRAFT', 'ACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "ApprovalStepType" AS ENUM ('APPROVAL', 'THRESHOLD', 'PARALLEL', 'NOTIFY');

-- CreateEnum
CREATE TYPE "NotificationSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ConnectorStatus" AS ENUM ('HEALTHY', 'DEGRADED', 'DOWN', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('MAPPING', 'VALIDATED', 'COMMITTED', 'FAILED');

-- CreateTable
CREATE TABLE "org_nodes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "OrgNodeType" NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "org_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capabilities" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "group" TEXT NOT NULL,

    CONSTRAINT "capabilities_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "role_capabilities" (
    "roleId" INTEGER NOT NULL,
    "capabilityKey" TEXT NOT NULL,
    "scope" "CapabilityScope" NOT NULL DEFAULT 'HUB',

    CONSTRAINT "role_capabilities_pkey" PRIMARY KEY ("roleId","capabilityKey")
);

-- CreateTable
CREATE TABLE "segregation_rules" (
    "id" SERIAL NOT NULL,
    "capabilityA" TEXT NOT NULL,
    "capabilityB" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "segregation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_packs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL,

    CONSTRAINT "rule_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_pack_versions" (
    "id" TEXT NOT NULL,
    "rulePackId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "RulePackStatus" NOT NULL DEFAULT 'DRAFT',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "rules" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rule_pack_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_flows" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "approval_flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_steps" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "ApprovalStepType" NOT NULL DEFAULT 'APPROVAL',
    "roleName" TEXT NOT NULL,
    "thresholdAmount" DECIMAL(14,2),
    "slaHours" INTEGER NOT NULL DEFAULT 24,

    CONSTRAINT "approval_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_policies" (
    "id" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "severity" "NotificationSeverity" NOT NULL DEFAULT 'INFO',
    "channels" TEXT[],
    "audienceRole" TEXT NOT NULL,
    "quietHours" BOOLEAN NOT NULL DEFAULT false,
    "digest" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notification_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connectors" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "ConnectorStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "config" JSONB NOT NULL DEFAULT '{}',
    "lastSyncAt" TIMESTAMP(3),

    CONSTRAINT "connectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_jobs" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'MAPPING',
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "validRows" INTEGER NOT NULL DEFAULT 0,
    "errorRows" INTEGER NOT NULL DEFAULT 0,
    "mapping" JSONB NOT NULL DEFAULT '{}',
    "rows" JSONB NOT NULL DEFAULT '[]',
    "errors" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "committedAt" TIMESTAMP(3),

    CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "seq" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "parentId" TEXT,
    "hash" TEXT NOT NULL,
    "prevHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("seq")
);

-- CreateIndex
CREATE UNIQUE INDEX "org_nodes_code_key" ON "org_nodes"("code");

-- CreateIndex
CREATE INDEX "org_nodes_parentId_idx" ON "org_nodes"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "segregation_rules_capabilityA_capabilityB_key" ON "segregation_rules"("capabilityA", "capabilityB");

-- CreateIndex
CREATE UNIQUE INDEX "rule_packs_key_key" ON "rule_packs"("key");

-- CreateIndex
CREATE UNIQUE INDEX "rule_pack_versions_rulePackId_version_key" ON "rule_pack_versions"("rulePackId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "approval_steps_flowId_order_key" ON "approval_steps"("flowId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "notification_policies_eventKey_key" ON "notification_policies"("eventKey");

-- CreateIndex
CREATE UNIQUE INDEX "connectors_key_key" ON "connectors"("key");

-- CreateIndex
CREATE UNIQUE INDEX "audit_events_id_key" ON "audit_events"("id");

-- CreateIndex
CREATE INDEX "audit_events_entity_entityId_idx" ON "audit_events"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_events_parentId_idx" ON "audit_events"("parentId");

-- AddForeignKey
ALTER TABLE "org_nodes" ADD CONSTRAINT "org_nodes_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "org_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_capabilities" ADD CONSTRAINT "role_capabilities_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_capabilities" ADD CONSTRAINT "role_capabilities_capabilityKey_fkey" FOREIGN KEY ("capabilityKey") REFERENCES "capabilities"("key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_pack_versions" ADD CONSTRAINT "rule_pack_versions_rulePackId_fkey" FOREIGN KEY ("rulePackId") REFERENCES "rule_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_steps" ADD CONSTRAINT "approval_steps_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "approval_flows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
