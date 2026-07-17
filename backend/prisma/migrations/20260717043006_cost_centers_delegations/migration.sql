-- CreateTable
CREATE TABLE "cost_centers" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "managerId" TEXT,
    "budgetAllocated" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "budgetUsed" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "orgNodeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "delegations" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delegations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cost_centers_orgNodeId_idx" ON "cost_centers"("orgNodeId");

-- CreateIndex
CREATE INDEX "delegations_fromUserId_idx" ON "delegations"("fromUserId");

-- CreateIndex
CREATE INDEX "delegations_toUserId_idx" ON "delegations"("toUserId");

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_orgNodeId_fkey" FOREIGN KEY ("orgNodeId") REFERENCES "org_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delegations" ADD CONSTRAINT "delegations_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delegations" ADD CONSTRAINT "delegations_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
