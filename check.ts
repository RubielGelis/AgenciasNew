import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const q = await prisma.quotation.findUnique({ where: { id: 31 } });
  console.log('Quotation 31:', JSON.stringify(q));
}

main().catch(console.error).finally(() => prisma.$disconnect());
