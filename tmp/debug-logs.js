const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    console.log('1. Checking SystemLog table exists...');
    const count = await prisma.$queryRawUnsafe('SELECT count(*) FROM public."SystemLog"');
    console.log('Logs count:', count);

    console.log('\n2. Testing spLogListar(100, 0, null, null)...');
    const logs = await prisma.$queryRawUnsafe('SELECT * FROM public."spLogListar"(100, 0, null, null)');
    console.log('Logs results (first 2):', JSON.stringify(logs.slice(0, 2), null, 2));

    console.log('\n3. Testing spLogRegistrar call (with explicit user constant)...');
    await prisma.$queryRawUnsafe('CALL public."spLogRegistrar"(1, $1, $2, $3, $4)', 'TEST', 'ACTION', 'Description', '{}');
    console.log('Log entry recorded successfully.');

  } catch (err) {
    console.error('\nERROR_CAUGHT:', err.message);
    if (err.message.includes('relation "public.SystemLog" does not exist')) {
        console.log('The table name in Postgres is likely lowercase: "SystemLog" vs "systemlog"');
    }
  } finally {
    await prisma.$disconnect();
  }
}

check();
