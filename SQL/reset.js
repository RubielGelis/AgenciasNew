const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public'
});

async function reset() {
    await client.connect();
    await client.query('UPDATE public."Menu" SET activo = true;');
    await client.query('UPDATE public."Master" SET inactivo = false;');
    console.log('RESET SUCCESS: All modules and masters are now ACTIVE.');
    await client.end();
}

reset().catch(err => {
    console.error('Reset error:', err);
    process.exit(1);
});
