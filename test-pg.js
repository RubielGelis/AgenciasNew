const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public"
});

async function main() {
    try {
        const res = await pool.query('SELECT * FROM public."fnAirportListar"()');
        console.log(res.rows);
    } catch (e) {
        console.error("PG error:", e);
    } finally {
        await pool.end();
    }
}

main();
