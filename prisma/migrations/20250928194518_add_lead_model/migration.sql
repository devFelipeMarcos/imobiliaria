-- CreateTable
CREATE TABLE "lead" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "corretorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "corretor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
