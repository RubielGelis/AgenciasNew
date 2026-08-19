const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public'
});

async function run() {
    await client.connect();
    const res = await client.query('SELECT * FROM public."fnMasterList"()');
    console.log('Total Maestros:', res.rows.length);
    console.log(res.rows);
    await client.end();
}

run().catch(console.error);
