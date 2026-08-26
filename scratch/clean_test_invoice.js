const { Pool } = require('pg');
const pool = new Pool({ connectionString: "postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public" });

async function main() {
    await pool.query('DELETE FROM public."InvoicesProduct" WHERE "invoiceId" = 6');
    await pool.query('DELETE FROM public."Invoices" WHERE id = 6');
    await pool.query('UPDATE public."DocumentResolution" SET "currentNumber" = 1001 WHERE id = 1');
    console.log('Cleaned up test data!');
}

main().finally(() => pool.end());
