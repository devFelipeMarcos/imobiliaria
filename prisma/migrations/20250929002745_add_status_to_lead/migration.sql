-- AlterTable
ALTER TABLE "lead" ADD COLUMN     "statusId" TEXT;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "status_custom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
