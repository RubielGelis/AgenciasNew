const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    try {
        const res = await client.query(`
            SELECT r.name, c.column_name, c.table_alias 
            FROM public."ReportColumns" c
            JOIN public."Report" r ON c.report_id = r.id
            WHERE c.column_name ILIKE '%prestadoraId%'
        `);
        console.log('Results:', JSON.stringify(res.rows, null, 2));
    } finally {
        await client.end();
    }
}

run().catch(console.error);
