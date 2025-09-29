/*
  Warnings:

  - You are about to drop the column `ordem` on the `status_custom` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `status_custom` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "status_custom" DROP COLUMN "ordem",
DROP COLUMN "tipo";

-- DropEnum
DROP TYPE "StatusType";
