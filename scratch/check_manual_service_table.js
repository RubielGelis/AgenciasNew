require('dotenv').config();
const { Client } = require('pg');

async function main() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='QuotationManualService'`);
        console.log("QuotationManualService exists in local DB:", res.rows.length > 0);
        
        if (res.rows.length === 0) {
            console.log("Creating QuotationManualService table in local DB...");
            await client.query(`
                CREATE TABLE IF NOT EXISTS public."QuotationManualService" (
                    "id" SERIAL PRIMARY KEY,
                    "quotationId" INTEGER NOT NULL REFERENCES public."Quotation"(id) ON DELETE CASCADE,
                    "providerName" VARCHAR(255),
                    "serviceName" VARCHAR(255),
                    "cost" DOUBLE PRECISION DEFAULT 0,
                    "salePrice" DOUBLE PRECISION DEFAULT 0,
                    "utility" DOUBLE PRECISION DEFAULT 0,
                    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log("Table QuotationManualService created successfully in local DB!");
        }
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await client.end();
    }
}

main();
