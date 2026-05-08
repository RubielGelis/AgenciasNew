const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    try {
        const res = await client.query(`
            SELECT r.name, j.join_condition 
            FROM public."ReportJoins" j
            JOIN public."Report" r ON j.report_id = r.id
            WHERE j.join_condition ILIKE '%prestadoraId%'
        `);
        console.log('Results:', JSON.stringify(res.rows, null, 2));
    } finally {
        await client.end();
    }
}

run().catch(console.error);
