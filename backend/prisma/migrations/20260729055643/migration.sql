-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "costCenter" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "budgetAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "committedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "variance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Normal',
    "costCentersJson" JSONB NOT NULL DEFAULT '[]',
    "monthlyTrendJson" JSONB NOT NULL DEFAULT '[]',
    "historyJson" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_bills" (
    "id" TEXT NOT NULL,
    "billNumber" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "tripReference" TEXT NOT NULL,
    "contract" TEXT NOT NULL,
    "expectedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "billedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tolerance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deviation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "autoMatchStatus" TEXT NOT NULL DEFAULT 'Matched',
    "expectedVsBilledJson" JSONB NOT NULL DEFAULT '{}',
    "toleranceCheckJson" JSONB NOT NULL DEFAULT '{}',
    "deviationQueueJson" JSONB NOT NULL DEFAULT '{}',
    "debitNotesJson" JSONB NOT NULL DEFAULT '[]',
    "taxSummaryJson" JSONB NOT NULL DEFAULT '{}',
    "rateComputationJson" JSONB NOT NULL DEFAULT '{}',
    "dieselEscalationJson" JSONB NOT NULL DEFAULT '{}',
    "detentionJson" JSONB NOT NULL DEFAULT '{}',
    "penaltiesJson" JSONB NOT NULL DEFAULT '{}',
    "approvalTimelineJson" JSONB NOT NULL DEFAULT '[]',
    "auditTrailJson" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "tripsJson" JSONB NOT NULL DEFAULT '[]',
    "invoiceAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "paymentStatus" TEXT NOT NULL DEFAULT 'Unpaid',
    "podTriggerJson" JSONB NOT NULL DEFAULT '{}',
    "annexureJson" JSONB NOT NULL DEFAULT '{}',
    "disputedLinesJson" JSONB NOT NULL DEFAULT '[]',
    "gstFieldsJson" JSONB NOT NULL DEFAULT '{}',
    "auditTrailJson" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_runs" (
    "id" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentMode" TEXT NOT NULL DEFAULT 'Bank Transfer',
    "approval" TEXT NOT NULL DEFAULT 'Pending Maker',
    "status" TEXT NOT NULL DEFAULT 'Queued',
    "releaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billsIncludedJson" JSONB NOT NULL DEFAULT '[]',
    "bankStatusJson" JSONB NOT NULL DEFAULT '{}',
    "paymentQueueJson" JSONB NOT NULL DEFAULT '{}',
    "makerCheckerJson" JSONB NOT NULL DEFAULT '{}',
    "upiBatchJson" JSONB NOT NULL DEFAULT '{}',
    "vendorPaymentsJson" JSONB NOT NULL DEFAULT '[]',
    "fastagLedgerJson" JSONB NOT NULL DEFAULT '{}',
    "fuelCardLedgerJson" JSONB NOT NULL DEFAULT '{}',
    "approvalTimelineJson" JSONB NOT NULL DEFAULT '[]',
    "releaseStatusJson" JSONB NOT NULL DEFAULT '{}',
    "auditTrailJson" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_settlements" (
    "id" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverId" TEXT,
    "tripId" TEXT NOT NULL,
    "advance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expense" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bhatta" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recovery" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "incentive" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "settlement" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "settlementDraftJson" JSONB NOT NULL DEFAULT '{}',
    "disputeStatusJson" JSONB NOT NULL DEFAULT '{}',
    "payrollExportStatusJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_approvals" (
    "id" TEXT NOT NULL,
    "approvalNumber" TEXT NOT NULL,
    "flowCode" TEXT NOT NULL,
    "flowName" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityRef" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "requestedBy" TEXT NOT NULL,
    "approver" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "reason" TEXT,
    "budgetCommitmentJson" JSONB NOT NULL DEFAULT '{}',
    "timelineJson" JSONB NOT NULL DEFAULT '[]',
    "historyJson" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "erp_exports" (
    "id" TEXT NOT NULL,
    "exportNumber" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "amountTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Completed',
    "exportedBy" TEXT NOT NULL,
    "historyJson" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "erp_exports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "budgets_budgetId_key" ON "budgets"("budgetId");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_bills_billNumber_key" ON "vendor_bills"("billNumber");

-- CreateIndex
CREATE UNIQUE INDEX "customer_invoices_invoiceNumber_key" ON "customer_invoices"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "payment_runs_batchNumber_key" ON "payment_runs"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "financial_approvals_approvalNumber_key" ON "financial_approvals"("approvalNumber");

-- CreateIndex
CREATE UNIQUE INDEX "erp_exports_exportNumber_key" ON "erp_exports"("exportNumber");
