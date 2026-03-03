const { Client } = require('pg');
const connectionString = "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public";

async function checkColumns() {
    const client = new Client({ connectionString });
    await client.connect();
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'User'");
    console.log(res.rows.map(r => r.column_name));
    await client.end();
}

checkColumns().catch(console.error);
