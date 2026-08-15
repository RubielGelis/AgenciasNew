const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function verify() {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT proname, oid, pg_get_function_arguments(oid) as args
            FROM pg_proc 
            WHERE proname IN ('spmonedacrear', 'spmonedaactualizar')
        `);
        console.log('Procedures in Database:');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

verify();
