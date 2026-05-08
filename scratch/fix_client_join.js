const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    try {
        const reportName = 'CotizacionValor';
        
        // Fix Client Join
        const res = await client.query(`
            UPDATE public."ReportJoins" 
            SET join_condition = 't_quotation."clientId" = t_client."id"'
            WHERE report_id IN (SELECT id FROM public."Report" WHERE name = $1)
            AND table_name = 'Client'
            AND join_condition LIKE 't1.%';
        `, [reportName]);
        console.log('Fixed Client Join:', res.rowCount);
    } finally {
        await client.end();
    }
}

run().catch(console.error);
