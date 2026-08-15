import pg from 'pg';
import fs from 'fs';
import path from 'path';

const client = new pg.Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await client.connect();

const sqlPath = path.join(process.cwd(), 'SQL/Function/fnRptCotizacion.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

console.log('Eliminando función anterior fnRptCotizacion...');
await client.query('DROP FUNCTION IF EXISTS public."fnRptCotizacion"(integer, integer)');

console.log('Desplegando fnRptCotizacion en PostgreSQL...');
await client.query(sql);
console.log('fnRptCotizacion desplegada con éxito en PostgreSQL!');
await client.end();
