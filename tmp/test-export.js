const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testExport() {
  try {
    const ids = '1,2'; // Suponer algunos IDs si existen
    const userId = 1;
    console.log(`Executing: CALL public.spExportQuotation('${ids}', ${userId}, '')`);
    const result = await prisma.$queryRawUnsafe(`CALL public.spExportQuotation($1, $2, $3)`, ids, userId, '');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('SERVER_ERROR_CAUGHT:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testExport();
