const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

async function main() {
    console.log("Connecting directly to PostgreSQL...");
    const connectionString = process.env.DATABASE_URL || "postgresql://postgres:zzeusagencias@localhost:5432/Korex_test?schema=public";
    console.log("Using URL:", connectionString);

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log("Checking client count...");
        const clientCount = await prisma.client.count();
        console.log("Client count:", clientCount);

        console.log("Checking quotation count...");
        const quotationCount = await prisma.quotation.count();
        console.log("Quotation count:", quotationCount);

        if (quotationCount > 0) {
            console.log("Fetching first quotation...");
            const firstQ = await prisma.quotation.findFirst({
                include: {
                    client: true,
                    products: true
                }
            });
            console.log("First quotation ID:", firstQ.id, "Internal Number:", firstQ.internalNumber);
        }

        console.log("Running public.fnCotizacionListar()...");
        const results = await prisma.$queryRawUnsafe('SELECT * FROM public.fnCotizacionListar()');
        console.log("fnCotizacionListar returned rows:", results.length);
        if (results.length > 0) {
            console.log("First row from fnCotizacionListar:", JSON.stringify(results[0], null, 2));
        }

    } catch (err) {
        console.error("Database query failed:", err);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
