const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    try {
        // Fix Joins for QuotationValor
        const res = await client.query(`
            UPDATE public."ReportJoins" 
            SET join_condition = 't_quotationproduct."prestadoraId" = t_prestadora."id"'
            WHERE report_id IN (SELECT id FROM public."Report" WHERE name = 'CotizacionValor')
            AND table_name = 'Prestadora'
            AND join_condition LIKE 't1.%';
        `);
        console.log('Fixed ReportJoins:', res.rowCount);
    } finally {
        await client.end();
    }
}

run().catch(console.error);
