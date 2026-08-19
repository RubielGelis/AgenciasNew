const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public'
});

async function run() {
    await client.connect();
    const expiredKey = 'KOR1.eyJjIjoiQWdlbmNpYSBQcnVlYmEgRXhwaXJhZGEiLCJuIjoiOTAwMTIzNDU2LTEiLCJlIjoiMjAyNi0wOC0xNyIsImkiOiIyMDI2LTA4LTE4In0.fb7de5d9053817d15fdd229abab9d38be28123b8b7e7aaa8a1975e9cbb329d8a';
    
    await client.query(`
        INSERT INTO public."SystemParameter" (code, name, value) 
        VALUES ('LICENSE_KEY', 'Clave de Licencia del Sistema', $1),
               ('LICENSE_EXPIRATION_DATE', 'Fecha Expiracion', '2026-08-17') 
        ON CONFLICT (code) DO UPDATE SET value = EXCLUDED.value
    `, [expiredKey]);
    
    console.log('✅ Licencia Expirada (2026-08-17) grabada exitosamente en la BD PostgreSQL local.');
    await client.end();
}

run().catch(console.error);
