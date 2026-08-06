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
        const results = await prisma.$queryRawUnsafe('SELECT * FROM public.fnCotizacionHistorial()');
        console.log("Returned history rows length:", results.length);
        if (results.length > 0) {
            console.log("First history row keys:", Object.keys(results[0]));
            const history = results.map(row => row.fncotizacionhistorial);
            console.log("Mapped history length:", history.length);
            console.log("First mapped history row:", JSON.stringify(history[0], null, 2));
        }
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
main();
