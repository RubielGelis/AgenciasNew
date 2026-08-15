const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function fixProcedures() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL...');

        console.log('Dropping old and new versions of spMonedaCrear and spMonedaActualizar...');
        
        // Drops for spMonedaActualizar
        await client.query('DROP PROCEDURE IF EXISTS public.spMonedaActualizar(integer, text, text, double precision, integer, text);');
        await client.query('DROP PROCEDURE IF EXISTS public.spMonedaActualizar(integer, text, text, double precision, integer, integer, text);');
        
        // Drops for spMonedaCrear
        await client.query('DROP PROCEDURE IF EXISTS public.spMonedaCrear(text, text, double precision, integer, integer, text);');
        await client.query('DROP PROCEDURE IF EXISTS public.spMonedaCrear(text, text, double precision, integer, integer, integer, text);');

        console.log('Clean up successful.');
    } catch (err) {
        console.error('Error executing cleanup:', err);
    } finally {
        await client.end();
    }
}

fixProcedures();
