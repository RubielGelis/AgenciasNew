require('dotenv').config();
const { Client } = require('pg');

async function main() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        
        // 1. Check if table exists
        const tblRes = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='QuotationPrintCustomization'`);
        console.log("QuotationPrintCustomization exists:", tblRes.rows.length > 0);

        if (tblRes.rows.length === 0) {
            console.log("Creating QuotationPrintCustomization table...");
            await client.query(`
                CREATE TABLE public."QuotationPrintCustomization" (
                    id SERIAL PRIMARY KEY,
                    "quotationId" INTEGER NOT NULL UNIQUE REFERENCES public."Quotation"(id) ON DELETE CASCADE,
                    "html" TEXT NOT NULL,
                    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
                );
            `);
        } else {
            // Check unique constraint
            const uniqueRes = await client.query(`
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE table_name = 'QuotationPrintCustomization' AND constraint_type = 'UNIQUE';
            `);
            console.log("Unique constraints on QuotationPrintCustomization:", uniqueRes.rows);

            if (uniqueRes.rows.length === 0) {
                console.log("Adding UNIQUE constraint on quotationId...");
                await client.query(`
                    ALTER TABLE public."QuotationPrintCustomization" ADD CONSTRAINT "QuotationPrintCustomization_quotationId_key" UNIQUE ("quotationId");
                `);
                console.log("UNIQUE constraint added successfully!");
            }
        }
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await client.end();
    }
}

main();
