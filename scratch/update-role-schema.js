const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public'
});

async function run() {
    await client.connect();
    console.log('Actualizando tabla Role en PostgreSQL local...');
    await client.query(`
        ALTER TABLE public."Role" 
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS permissions JSONB;
    `);
    console.log('✅ Columnas description y permissions agregadas a public."Role" en PostgreSQL.');
    await client.end();
}

run().catch(console.error);
