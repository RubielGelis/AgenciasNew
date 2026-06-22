const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const sql = fs.readFileSync('SQL/alter_html_template_columns.sql', 'utf8');
  console.log("Executing migration SQL...");
  await prisma.$executeRawUnsafe(sql);
  console.log("Migration executed successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
