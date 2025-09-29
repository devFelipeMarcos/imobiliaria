-- CreateEnum
CREATE TYPE "StatusType" AS ENUM ('LEAD', 'PROSPECT', 'CLIENTE', 'NEGOCIACAO', 'FECHADO', 'PERDIDO');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CORRETOR';

-- CreateTable
CREATE TABLE "corretor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "cpf" TEXT,
    "creci" TEXT,
    "comissao" DOUBLE PRECISION DEFAULT 0,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "corretor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_custom" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "cor" TEXT DEFAULT '#6B7280',
    "tipo" "StatusType" NOT NULL DEFAULT 'LEAD',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "status_custom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "corretor_email_key" ON "corretor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "corretor_cpf_key" ON "corretor"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "corretor_creci_key" ON "corretor"("creci");

-- CreateIndex
CREATE UNIQUE INDEX "corretor_userId_key" ON "corretor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "status_custom_nome_key" ON "status_custom"("nome");

-- AddForeignKey
ALTER TABLE "corretor" ADD CONSTRAINT "corretor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
