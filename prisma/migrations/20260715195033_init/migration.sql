-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Carrier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "mcNumber" TEXT,
    "dotNumber" TEXT,
    "contact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Load" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loadNumber" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "pickupAddress" TEXT NOT NULL,
    "shipperName" TEXT,
    "deliveryAddress" TEXT NOT NULL,
    "receiverName" TEXT,
    "pickupScheduledAt" DATETIME NOT NULL,
    "deliveryScheduledAt" DATETIME NOT NULL,
    "pieces" INTEGER,
    "weight" INTEGER,
    "commodity" TEXT,
    "equipment" TEXT NOT NULL,
    "modeType" TEXT NOT NULL,
    "customerRate" REAL NOT NULL,
    "carrierRate" REAL,
    "customerId" TEXT NOT NULL,
    "carrierId" TEXT,
    "truckNumber" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Load_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Load_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Load_loadNumber_key" ON "Load"("loadNumber");
