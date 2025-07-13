-- CreateTable
CREATE TABLE "user_details" (
    "id" TEXT NOT NULL,
    "nome" TEXT,
    "preco" DOUBLE PRECISION,
    "cpfCnpj" TEXT,
    "telefone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "user_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_details_userId_key" ON "user_details"("userId");

-- AddForeignKey
ALTER TABLE "user_details" ADD CONSTRAINT "user_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
