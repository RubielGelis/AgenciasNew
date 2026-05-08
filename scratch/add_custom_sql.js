const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
        await client.query('ALTER TABLE public."Report" ADD COLUMN IF NOT EXISTS custom_sql TEXT');
        console.log('Column custom_sql added to Report table');
    } finally {
        await client.end();
    }
}
run();
