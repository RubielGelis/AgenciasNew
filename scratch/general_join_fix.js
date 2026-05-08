const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    try {
        const reportName = 'CotizacionValor';
        const res = await client.query(`
            UPDATE public."ReportJoins" 
            SET join_condition = REPLACE(join_condition, 't1.', 't_quotationproduct.')
            WHERE report_id IN (SELECT id FROM public."Report" WHERE name = $1)
            AND table_name IN ('Provider', 'Prestadora', 'Product', 'Quotation')
            AND join_condition LIKE 't1.%';
        `, [reportName]);
        console.log('General Join Fixes:', res.rowCount);
    } finally {
        await client.end();
    }
}

run().catch(console.error);
