import prisma from './src/lib/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
  const sqlFile = path.join(process.cwd(), 'SQL', 'SP', 'spCotizacionActualizarEstado.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');
  console.log('Running SQL from:', sqlFile);
  await prisma.$executeRawUnsafe(sql);
  
  // Also fix the state column here just in case psql didn't work (which it didn't)
  console.log('Adding state column if missing...');
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "state" VARCHAR(25) DEFAULT \'NUEVO\';');
    await prisma.$executeRawUnsafe('UPDATE "Quotation" SET "state" = \'NUEVO\' WHERE "state" IS NULL;');
  } catch(e: any) { console.error('Error adding column:', e.message) }
  
  const sqlActualizar = fs.readFileSync(path.join(process.cwd(), 'SQL', 'SP', 'spCotizacionActualizar.sql'), 'utf8');
  await prisma.$executeRawUnsafe(sqlActualizar);
  console.log('spCotizacionActualizar updated.');

  const sqlCrear = fs.readFileSync(path.join(process.cwd(), 'SQL', 'SP', 'spCotizacionCrear.sql'), 'utf8');
  await prisma.$executeRawUnsafe(sqlCrear);
  console.log('All SQL procedures updated successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
