const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getParams() {
  try {
    const params = await prisma.parameter.findMany({
      where: {
        code: { contains: 'SQLServer' }
      }
    });
    console.log('PARAM_LIST:', JSON.stringify(params, null, 2));
  } catch (err) {
    console.error('ERROR_PARAMS:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

getParams();
