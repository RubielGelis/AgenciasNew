import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const { Pool } = pg;

const connectionString = "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  try {
    const ticketTypes = await prisma.ticketType.findMany({ where: { isActive: true } });
    console.log("Prisma Ticket Types:", ticketTypes);
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();
