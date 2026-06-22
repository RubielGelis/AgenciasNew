const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("=== BRANCHES ===");
    const branches = await prisma.branch.findMany({
        select: { id: true, code: true, name: true, templateConfig: true }
    });
    console.log(JSON.stringify(branches, null, 2));

    console.log("\n=== IMPLANTS ===");
    const implants = await prisma.implant.findMany({
        select: { id: true, code: true, name: true, templateConfig: true }
    });
    console.log(JSON.stringify(implants, null, 2));
}

main().catch(console.error).finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
