const { Pool } = require('pg');
const pool = new Pool({ connectionString: "postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public" });

async function main() {
    try {
        const resDoc = await pool.query('SELECT * FROM public."DocumentResolution"');
        console.log('DocumentResolution:', resDoc.rows);

        const resConsec = await pool.query('SELECT * FROM public."TransactionConsecutive"');
        console.log('TransactionConsecutive:', resConsec.rows);

        const resLastInvoices = await pool.query('SELECT id, "internalNumber", serie, consecutivo, "clientId" FROM public."Invoices" ORDER BY id DESC LIMIT 5');
        console.log('Last Invoices:', resLastInvoices.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

main();
