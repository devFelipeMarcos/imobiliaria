const { PrismaClient } = require('../src/generated/prisma');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function main() {
  const instances = await prisma.whatsAppInstance.findMany({
    where: { token: null }
  });

  for (const inst of instances) {
    const token = randomUUID().toUpperCase();
    await prisma.whatsAppInstance.update({
      where: { id: inst.id },
      data: { token }
    });
    console.log(`Updated instance ${inst.instanceName} with token ${token}`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});