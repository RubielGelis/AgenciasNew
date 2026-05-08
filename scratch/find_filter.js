const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    try {
        const res = await client.query(`
            SELECT r.name, f.column_name, f.table_alias 
            FROM public."ReportFilters" f
            JOIN public."Report" r ON f.report_id = r.id
            WHERE f.column_name ILIKE '%prestadoraId%'
        `);
        console.log('Results:', JSON.stringify(res.rows, null, 2));
    } finally {
        await client.end();
    }
}

run().catch(console.error);
