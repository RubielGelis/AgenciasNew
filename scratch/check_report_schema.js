const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Report' 
            AND table_schema = 'public'
        `);
        console.log(res.rows.map(r => r.column_name));
    } finally {
        await client.end();
    }
}
run();
