import pg from 'pg';
import mssql from 'mssql';
import fs from 'fs';

const pgClient = new pg.Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await pgClient.connect();
const cfgRes = await pgClient.query('SELECT * FROM "fnGetSQLServerConfig"()');
const cfg = cfgRes.rows[0];
await pgClient.end();

await mssql.connect({
  server: cfg.servidor,
  database: cfg.base_datos,
  user: cfg.usuario,
  password: cfg.clave,
  port: cfg.puerto ? parseInt(cfg.puerto) : 1433,
  options: { encrypt: false, trustServerCertificate: true },
  requestTimeout: 60000
});

console.log('Deploying spCotizacionesCrear to SQL Server...');
const sql = fs.readFileSync('./SQL/SP/spCotizacionesCrear.sql', 'utf8');

// Dividir por GO si es necesario, o ejecutar directamente si no tiene GOs problemáticos
// Tedious a veces no soporta GO en una sola consulta. Separamos por GO.
const batches = sql.split(/^\s*GO\s*$/mi);
for (const batch of batches) {
  if (batch.trim()) {
    await mssql.query(batch);
  }
}

console.log('Deployed spCotizacionesCrear OK!');
await mssql.close();
