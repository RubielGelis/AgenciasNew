const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// Use the local PostgreSQL connection string
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Creating QuotationPrintCustomization table in PostgreSQL...");
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS public."QuotationPrintCustomization" (
                id SERIAL PRIMARY KEY,
                "quotationId" INTEGER UNIQUE NOT NULL,
                html TEXT NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
            );
        `);
        console.log("Table created successfully!");
    } catch (e) {
        console.error("Error creating table:", e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
