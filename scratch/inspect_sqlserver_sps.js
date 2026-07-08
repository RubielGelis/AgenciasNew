require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const mssql = require('mssql');

const pgPool = new Pool({ connectionString: 'postgresql://postgres:111985@localhost:5432/agencias_new?schema=public' });
const adapter = new PrismaPg(pgPool);
const prisma = new PrismaClient({ adapter });

async function getSQLServerConfig() {
  const result = await prisma.$queryRawUnsafe('SELECT * FROM "fnGetSQLServerConfig"()');
  console.log('PostgresConfig Row:', result[0]);
  return result[0];
}

async function run() {
  try {
    await getSQLServerConfig();
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
    await pgPool.end();
  }
}
run();
