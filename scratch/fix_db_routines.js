const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function fixRoutines() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database...');
        
        console.log('Dropping fnRptCotizacion with (integer, integer) signature...');
        await client.query('DROP FUNCTION IF EXISTS public."fnRptCotizacion"(integer, integer);');
        
        console.log('Successfully dropped routine.');
    } catch (err) {
        console.error('Error fixing routine:', err);
    } finally {
        await client.end();
    }
}

fixRoutines();
