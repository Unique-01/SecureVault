/*
  Warnings:

  - A unique constraint covering the columns `[txHash]` on the table `VaultEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "VaultEvent" ALTER COLUMN "amount" DROP NOT NULL;

-- CreateTable
CREATE TABLE "IndexerState" (
    "id" TEXT NOT NULL,
    "lastBlock" BIGINT NOT NULL,

    CONSTRAINT "IndexerState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VaultEvent_txHash_key" ON "VaultEvent"("txHash");
