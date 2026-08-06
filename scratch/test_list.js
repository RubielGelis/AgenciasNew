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
        const results = await prisma.$queryRawUnsafe('SELECT * FROM public.fnCotizacionListar()');
        console.log("Returned rows length:", results.length);
        const quotations = results.map(row => row.fncotizacionlistar);
        console.log("Mapped quotations length:", quotations.length);
        console.log("First mapped quotation:", JSON.stringify(quotations[0], null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
main();
