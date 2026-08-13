require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function main() {
    try {
        console.log("Applying ALTER TABLE migrations for Quotation and QuotationProduct...");
        
        // Alter Quotation Table
        await pool.query(`
            ALTER TABLE public."Quotation"
            ADD COLUMN IF NOT EXISTS "destination" VARCHAR(255),
            ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP,
            ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP,
            ADD COLUMN IF NOT EXISTS "passenger" VARCHAR(255),
            ADD COLUMN IF NOT EXISTS "paxAdults" INTEGER,
            ADD COLUMN IF NOT EXISTS "paxChildren" INTEGER,
            ADD COLUMN IF NOT EXISTS "reservationCode" VARCHAR(255),
            ADD COLUMN IF NOT EXISTS "copyFieldsToProducts" BOOLEAN DEFAULT TRUE;
        `);
        console.log("Table 'Quotation' updated successfully.");

        // Alter QuotationProduct Table
        await pool.query(`
            ALTER TABLE public."QuotationProduct"
            ADD COLUMN IF NOT EXISTS "passenger" VARCHAR(255);
        `);
        console.log("Table 'QuotationProduct' updated successfully.");

    } catch (e) {
        console.error("Error migrating tables:", e);
    } finally {
        await pool.end();
    }
}

main();
