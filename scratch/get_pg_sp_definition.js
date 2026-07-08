const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pgPool = new Pool({ connectionString: 'postgresql://postgres:111985@localhost:5432/agencias_new?schema=public' });
const adapter = new PrismaPg(pgPool);
const prisma = new PrismaClient({ adapter });

async function run() {
  try {
    const res = await prisma.$queryRawUnsafe(`
      SELECT proname, pg_get_functiondef(pg_proc.oid) as definition
      FROM pg_proc
      JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
      WHERE proname = 'spLogRegistrar' OR proname = 'splogregistrar'
    `);
    if (res.length > 0) {
      console.log('Definition of spLogRegistrar:', res[0].definition);
    } else {
      console.log('spLogRegistrar not found');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
    await pgPool.end();
  }
}
run();
