const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    try {
        const res = await client.query(`
            SELECT id, table_name, alias, join_condition 
            FROM public."ReportJoins" 
            WHERE report_id IN (SELECT id FROM public."Report" WHERE name = 'CotizacionValor')
        `);
        console.log('Joins:', JSON.stringify(res.rows, null, 2));
    } finally {
        await client.end();
    }
}

run().catch(console.error);
