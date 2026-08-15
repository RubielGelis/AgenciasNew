const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public"
});

async function main() {
    try {
        const query = `
        CREATE TABLE IF NOT EXISTS public."QuotationManualService" (
            id SERIAL PRIMARY KEY,
            "quotationId" INT NOT NULL REFERENCES public."Quotation"(id) ON DELETE CASCADE,
            "providerName" VARCHAR(255),
            "serviceName" VARCHAR(255),
            "cost" DOUBLE PRECISION DEFAULT 0,
            "salePrice" DOUBLE PRECISION DEFAULT 0,
            "utility" DOUBLE PRECISION DEFAULT 0,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `;
        await pool.query(query);
        console.log("Tabla QuotationManualService creada o ya existente.");
    } catch (e) {
        console.error("PG Error:", e);
    } finally {
        await pool.end();
    }
}

main();
