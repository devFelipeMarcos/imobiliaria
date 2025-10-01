-- CreateTable
CREATE TABLE "lead_observacao" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "observacao" TEXT NOT NULL,
    "statusAnterior" TEXT,
    "statusNovo" TEXT,
    "tipoAcao" TEXT NOT NULL DEFAULT 'OBSERVACAO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_observacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lead_observacao" ADD CONSTRAINT "lead_observacao_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_observacao" ADD CONSTRAINT "lead_observacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;