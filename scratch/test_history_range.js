require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Testing fnCotizacionHistorial...');

  console.log('\n--- Test 1: All records (Default order by ID ASC) ---');
  const allRes = await prisma.$queryRawUnsafe('SELECT * FROM public.fnCotizacionHistorial()');
  const allHistory = allRes.map(r => r.fncotizacionhistorial);
  console.log(`Found ${allHistory.length} records. IDs:`, allHistory.map(h => h.id));

  if (allHistory.length > 0) {
    const ids = allHistory.map(h => h.id);
    const minId = Math.min(...ids);
    const maxId = Math.max(...ids);

    console.log(`\n--- Test 2: Single ID (${minId}) ---`);
    const singleRes = await prisma.$queryRawUnsafe('SELECT * FROM public.fnCotizacionHistorial($1::varchar)', String(minId));
    const singleHistory = singleRes.map(r => r.fncotizacionhistorial);
    console.log(`Found ${singleHistory.length} record(s):`, singleHistory.map(h => h.id));

    console.log(`\n--- Test 3: Range IDs (${minId}-${maxId}) ---`);
    const rangeStr = `${minId}-${maxId}`;
    const rangeRes = await prisma.$queryRawUnsafe('SELECT * FROM public.fnCotizacionHistorial($1::varchar)', rangeStr);
    const rangeHistory = rangeRes.map(r => r.fncotizacionhistorial);
    console.log(`Range "${rangeStr}" found ${rangeHistory.length} record(s):`, rangeHistory.map(h => h.id));

    console.log(`\n--- Test 4: Range IDs formatted with 'a' (${minId} a ${maxId}) ---`);
    const rangeAStr = `${minId} a ${maxId}`;
    const rangeARes = await prisma.$queryRawUnsafe('SELECT * FROM public.fnCotizacionHistorial($1::varchar)', rangeAStr);
    const rangeAHistory = rangeARes.map(r => r.fncotizacionhistorial);
    console.log(`Range "${rangeAStr}" found ${rangeAHistory.length} record(s):`, rangeAHistory.map(h => h.id));
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
