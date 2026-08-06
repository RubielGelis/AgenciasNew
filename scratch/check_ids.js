const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

async function main() {
    const connectionString = process.env.DATABASE_URL || "postgresql://postgres:zzeusagencias@localhost:5432/Korex_test?schema=public";
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const ids = await prisma.quotation.findMany({
            select: { id: true }
        });
        console.log("All Quotation IDs in DB:", ids.map(q => q.id).sort((a,b)=>a-b));
        
        const q1 = await prisma.quotation.findUnique({
            where: { id: 1 }
        });
        console.log("Quotation with ID 1 exists?", !!q1);
        if (q1) {
            console.log("Quotation 1:", JSON.stringify(q1, null, 2));
        }
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
main();
