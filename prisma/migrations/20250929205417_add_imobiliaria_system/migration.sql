/*
  Warnings:

  - A unique constraint covering the columns `[nome,imobiliariaId]` on the table `status_custom` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `imobiliariaId` to the `lead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- DropIndex
DROP INDEX "status_custom_nome_key";

-- CreateTable
CREATE TABLE "imobiliaria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "logo" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imobiliaria_pkey" PRIMARY KEY ("id")
);

-- Primeiro, criar uma imobiliária padrão
INSERT INTO "imobiliaria" ("id", "nome", "ativo", "createdAt", "updatedAt") 
VALUES ('default-imobiliaria-id', 'Imobiliária Padrão', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable - Adicionar coluna como opcional primeiro
ALTER TABLE "lead" ADD COLUMN     "imobiliariaId" TEXT;

-- Atualizar todos os leads existentes para usar a imobiliária padrão
UPDATE "lead" SET "imobiliariaId" = 'default-imobiliaria-id' WHERE "imobiliariaId" IS NULL;

-- Agora tornar a coluna obrigatória
ALTER TABLE "lead" ALTER COLUMN "imobiliariaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "status_custom" ADD COLUMN     "imobiliariaId" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "imobiliariaId" TEXT;

-- CreateTable
CREATE TABLE "corretor_imobiliaria" (
    "id" TEXT NOT NULL,
    "corretorId" TEXT NOT NULL,
    "imobiliariaId" TEXT NOT NULL,
    "comissao" DOUBLE PRECISION DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corretor_imobiliaria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "imobiliaria_cnpj_key" ON "imobiliaria"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "corretor_imobiliaria_corretorId_imobiliariaId_key" ON "corretor_imobiliaria"("corretorId", "imobiliariaId");

-- CreateIndex
CREATE UNIQUE INDEX "status_custom_nome_imobiliariaId_key" ON "status_custom"("nome", "imobiliariaId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_imobiliariaId_fkey" FOREIGN KEY ("imobiliariaId") REFERENCES "imobiliaria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corretor_imobiliaria" ADD CONSTRAINT "corretor_imobiliaria_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "corretor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corretor_imobiliaria" ADD CONSTRAINT "corretor_imobiliaria_imobiliariaId_fkey" FOREIGN KEY ("imobiliariaId") REFERENCES "imobiliaria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_imobiliariaId_fkey" FOREIGN KEY ("imobiliariaId") REFERENCES "imobiliaria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_custom" ADD CONSTRAINT "status_custom_imobiliariaId_fkey" FOREIGN KEY ("imobiliariaId") REFERENCES "imobiliaria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
