-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'INACTIVE';
