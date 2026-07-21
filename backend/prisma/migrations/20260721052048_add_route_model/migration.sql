-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "photo" TEXT,
    "vehicleNumber" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "currentLocation" TEXT NOT NULL,
    "currentTripId" TEXT,
    "fuel" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "complianceFASTag" BOOLEAN NOT NULL DEFAULT true,
    "compliancePM" BOOLEAN NOT NULL DEFAULT true,
    "complianceGPS" BOOLEAN NOT NULL DEFAULT true,
    "complianceInspection" BOOLEAN NOT NULL DEFAULT true,
    "complianceInsurance" BOOLEAN NOT NULL DEFAULT true,
    "complianceFitness" BOOLEAN NOT NULL DEFAULT true,
    "compliancePermit" BOOLEAN NOT NULL DEFAULT true,
    "utilization" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 'Owned',
    "vendorName" TEXT,
    "gpsDeviceStatus" TEXT NOT NULL DEFAULT 'Online',
    "lastPingAge" TEXT NOT NULL DEFAULT '2m ago',
    "site" TEXT NOT NULL DEFAULT 'Delhi Hub',
    "class" TEXT NOT NULL DEFAULT 'Container',
    "alerts" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "photo" TEXT,
    "name" TEXT NOT NULL,
    "license" TEXT NOT NULL,
    "licenseType" TEXT NOT NULL,
    "dutyHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "restHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "safetyScore" INTEGER NOT NULL DEFAULT 90,
    "currentTripId" TEXT,
    "status" TEXT NOT NULL,
    "warnings" JSONB NOT NULL DEFAULT '[]',
    "site" TEXT NOT NULL DEFAULT 'Delhi Hub',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_requests" (
    "id" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "pickup" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "capacityRequired" TEXT NOT NULL,
    "timeWindow" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "approvalStatus" TEXT NOT NULL,
    "tripType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "eta" TEXT NOT NULL,
    "ineligibleReasons" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "vehicleNumber" TEXT,
    "driverId" TEXT,
    "driverName" TEXT,
    "status" TEXT NOT NULL,
    "routeName" TEXT NOT NULL,
    "pickup" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "eta" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "startDateTime" TIMESTAMP(3),
    "endDateTime" TIMESTAMP(3),
    "cost" DOUBLE PRECISION NOT NULL,
    "vendorName" TEXT,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "expenses" JSONB NOT NULL DEFAULT '[]',
    "fuelEntries" JSONB NOT NULL DEFAULT '[]',
    "gateEvents" JSONB NOT NULL DEFAULT '[]',
    "stateTimeline" JSONB NOT NULL DEFAULT '[]',
    "auditTrail" JSONB NOT NULL DEFAULT '[]',
    "timeline" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gate_queue_entries" (
    "id" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "gatePassNumber" TEXT NOT NULL,
    "eta" TEXT NOT NULL,
    "enteredAt" TIMESTAMP(3),
    "exitedAt" TIMESTAMP(3),
    "detentionTimer" INTEGER,
    "checklistPhotos" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gate_queue_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exception_alerts" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "tripId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "severity" TEXT NOT NULL DEFAULT 'WARNING',
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exception_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "routeName" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "eta" TEXT NOT NULL,
    "stops" JSONB NOT NULL DEFAULT '[]',
    "restrictions" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vehicleNumber_key" ON "vehicles"("vehicleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "trips_tripId_key" ON "trips"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "routes_code_key" ON "routes"("code");
