const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function applyProcedures() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL...');

        // 1. Drop old functions/procedures just in case
        console.log('Dropping routines to avoid conflicts...');
        await client.query('DROP PROCEDURE IF EXISTS public.spMonedaCrear(text, text, double precision, integer, integer, text);');
        await client.query('DROP PROCEDURE IF EXISTS public.spMonedaCrear(text, text, double precision, integer, integer, integer, text);');
        await client.query('DROP PROCEDURE IF EXISTS public.spMonedaActualizar(integer, text, text, double precision, integer, text);');
        await client.query('DROP PROCEDURE IF EXISTS public.spMonedaActualizar(integer, text, text, double precision, integer, integer, text);');
        
        await client.query('DROP FUNCTION IF EXISTS public."fnMonedaListar"(integer);');
        await client.query('DROP FUNCTION IF EXISTS public.fnMonedaListar(integer);');
        await client.query('DROP FUNCTION IF EXISTS public."fnMonedaListar"();');
        await client.query('DROP FUNCTION IF EXISTS public.fnMonedaListar();');

        // 2. Read new definitions
        console.log('Reading updated SQL files...');
        const fnListarSql = fs.readFileSync(path.join(__dirname, '..', 'SQL', 'Function', 'fnMonedaListar.sql'), 'utf8');
        const spCrearSql = fs.readFileSync(path.join(__dirname, '..', 'SQL', 'SP', 'spMonedaCrear.sql'), 'utf8');
        const spActualizarSql = fs.readFileSync(path.join(__dirname, '..', 'SQL', 'SP', 'spMonedaActualizar.sql'), 'utf8');

        // 3. Inject them
        console.log('Injecting fnMonedaListar...');
        await client.query(fnListarSql);
        
        console.log('Injecting spMonedaCrear...');
        await client.query(spCrearSql);

        console.log('Injecting spMonedaActualizar...');
        await client.query(spActualizarSql);

        // 4. Verify signatures
        const res = await client.query(`
            SELECT proname, pg_get_function_arguments(oid) as args
            FROM pg_proc 
            WHERE proname IN ('spmonedacrear', 'spmonedaactualizar', 'fnmonedalistar')
        `);
        console.log('Updated Procedures in Database:');
        console.table(res.rows);

        console.log('Compilation completed successfully.');
    } catch (err) {
        console.error('Error applying procedures:', err);
    } finally {
        await client.end();
    }
}

applyProcedures();
