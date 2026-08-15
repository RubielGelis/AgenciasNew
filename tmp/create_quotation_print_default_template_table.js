const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public"
});

async function main() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS public."QuotationPrintDefaultTemplate" (
                "id" SERIAL PRIMARY KEY,
                "html" TEXT NOT NULL,
                "name" VARCHAR(100) DEFAULT 'Default',
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
            );
        `;
        await pool.query(query);
        console.log("Tabla QuotationPrintDefaultTemplate creada en PostgreSQL.");
    } catch (e) {
        console.error("PG Error:", e);
    } finally {
        await pool.end();
    }
}

main();
