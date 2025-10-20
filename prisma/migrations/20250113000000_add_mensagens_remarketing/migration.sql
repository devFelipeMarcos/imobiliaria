-- CreateTable
CREATE TABLE "mensagem_remarketing" (
    "id" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "idcorretor" TEXT NOT NULL,
    "datacriada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dias_disparo" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "ultima_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mensagem_remarketing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mensagem_remarketing_idcorretor_dias_disparo_key" ON "mensagem_remarketing"("idcorretor", "dias_disparo");

-- AddForeignKey
ALTER TABLE "mensagem_remarketing" ADD CONSTRAINT "mensagem_remarketing_idcorretor_fkey" FOREIGN KEY ("idcorretor") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;