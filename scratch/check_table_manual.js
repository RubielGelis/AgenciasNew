require('dotenv').config();
const { Client } = require('pg');

async function main() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        const res = await client.query(`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='QuotationManualService')`);
        console.log('QuotationManualService exists in local DB:', res.rows[0].exists);
    } catch (e) {
        console.error('DB Check error:', e.message);
    } finally {
        await client.end();
    }
}

main();
