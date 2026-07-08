const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public"
});
async function main() {
    try {
        await pool.query('ALTER TABLE public."InvoicesProduct" ADD COLUMN airline varchar(100);');
        console.log("Column added successfully.");
    } catch (e) {
        if (e.code === '42701') {
            console.log("Column already exists.");
        } else {
            console.error("PG error:", e);
        }
    } finally {
        await pool.end();
    }
}
main();
