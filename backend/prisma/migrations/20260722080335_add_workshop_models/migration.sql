-- CreateTable
CREATE TABLE "job_cards" (
    "id" TEXT NOT NULL,
    "jobCardNumber" TEXT NOT NULL,
    "vehicleId" TEXT,
    "vehicleNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "bayId" TEXT,
    "bayName" TEXT,
    "mechanicId" TEXT,
    "mechanicName" TEXT,
    "complaint" TEXT NOT NULL,
    "rootCause" TEXT,
    "odometer" INTEGER NOT NULL DEFAULT 0,
    "hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customer" TEXT NOT NULL DEFAULT 'Internal Fleet',
    "estimateTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tasks" JSONB NOT NULL DEFAULT '[]',
    "parts" JSONB NOT NULL DEFAULT '[]',
    "outsideWork" JSONB NOT NULL DEFAULT '[]',
    "qcChecklist" JSONB NOT NULL DEFAULT '[]',
    "qcStatus" TEXT NOT NULL DEFAULT 'Pending',
    "roadTestStatus" TEXT NOT NULL DEFAULT 'Not Required',
    "roadTestNotes" TEXT,
    "surveyorHeld" BOOLEAN NOT NULL DEFAULT false,
    "warrantyClaimed" BOOLEAN NOT NULL DEFAULT false,
    "auditTrail" JSONB NOT NULL DEFAULT '[]',
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshop_bays" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "currentJobCardId" TEXT,
    "currentVehicleId" TEXT,
    "vehicleNumber" TEXT,
    "mechanicId" TEXT,
    "mechanicName" TEXT,
    "estimatedFinish" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workshop_bays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshop_mechanics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "currentJobCardId" TEXT,
    "assignedBay" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "productivity" INTEGER NOT NULL DEFAULT 90,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workshop_mechanics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm_schedules" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT,
    "vehicleNumber" TEXT NOT NULL,
    "currentOdometer" INTEGER NOT NULL,
    "dueKm" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "dueHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "triggerType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Normal',
    "slotNegotiation" JSONB NOT NULL DEFAULT '{}',
    "autoJobCardId" TEXT,
    "maintenanceGrace" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceLock" BOOLEAN NOT NULL DEFAULT false,
    "overrideApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pm_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimates" (
    "id" TEXT NOT NULL,
    "estimateNumber" TEXT NOT NULL,
    "jobCardId" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "labourCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "partsCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "outsideWorkCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "approvalStatus" TEXT NOT NULL DEFAULT 'Draft',
    "technicalApproval" TEXT NOT NULL DEFAULT 'Pending',
    "approvalTimeline" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parts_demands" (
    "id" TEXT NOT NULL,
    "jobCardId" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "quantityRequired" INTEGER NOT NULL,
    "quantityAvailable" INTEGER NOT NULL,
    "reservationStatus" TEXT NOT NULL DEFAULT 'Unreserved',
    "demandStatus" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parts_demands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outside_work_requests" (
    "id" TEXT NOT NULL,
    "jobCardId" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "estimate" DOUBLE PRECISION NOT NULL,
    "approvalStatus" TEXT NOT NULL DEFAULT 'Pending',
    "completionStatus" TEXT NOT NULL DEFAULT 'In Progress',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outside_work_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_cards_jobCardNumber_key" ON "job_cards"("jobCardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "workshop_bays_name_key" ON "workshop_bays"("name");

-- CreateIndex
CREATE UNIQUE INDEX "estimates_estimateNumber_key" ON "estimates"("estimateNumber");
