require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function main() {
    try {
        console.log("Adding manualDescription column to Quotation table...");
        await pool.query(`
            ALTER TABLE public."Quotation"
            ADD COLUMN IF NOT EXISTS "manualDescription" TEXT;
        `);
        console.log("Column 'manualDescription' added successfully.");
    } catch (e) {
        console.error("Error migrating table:", e);
    } finally {
        await pool.end();
    }
}

main();
