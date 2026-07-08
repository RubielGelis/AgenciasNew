const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const keys = Object.keys(prisma).filter(k => k[0] !== '$' && k[0] !== '_');
    console.log("PRISMA MODEL KEYS:", keys);
}

main().catch(console.error).finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
