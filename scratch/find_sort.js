const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    try {
        const res = await client.query(`
            SELECT r.name, s.column_expr 
            FROM public."ReportSorts" s
            JOIN public."Report" r ON s.report_id = r.id
            WHERE s.column_expr ILIKE '%prestadoraId%'
        `);
        console.log('Results:', JSON.stringify(res.rows, null, 2));
    } finally {
        await client.end();
    }
}

run().catch(console.error);
