const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public"
});

async function main() {
    try {
        const query = `
            ALTER TABLE public."User" 
            ADD COLUMN IF NOT EXISTS "canEditReports" BOOLEAN DEFAULT false;
        `;
        await pool.query(query);
        console.log("Columna canEditReports agregada a la tabla User en PostgreSQL.");
    } catch (e) {
        console.error("PG Error:", e);
    } finally {
        await pool.end();
    }
}

main();
