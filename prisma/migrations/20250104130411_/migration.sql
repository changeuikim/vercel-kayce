/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_providerIdHash_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "updatedAt";

-- CreateIndex
CREATE INDEX "User_providerIdHash_isDeleted_idx" ON "User"("providerIdHash", "isDeleted");

-- CreateIndex
CREATE INDEX "User_createdAt_isDeleted_idx" ON "User"("createdAt", "isDeleted");
