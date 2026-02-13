-- CreateTable
CREATE TABLE "VaultEvent" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "txHash" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaultEvent_pkey" PRIMARY KEY ("id")
);
