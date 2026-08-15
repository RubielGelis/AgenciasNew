import pg from 'pg';
import mssql from 'mssql';

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
  options: { encrypt: false, trustServerCertificate: true }
});

console.log('=== Columnas de dbo.Cotizacion ===');
const c = await mssql.query('SELECT TOP 1 * FROM dbo.Cotizacion');
console.log(Object.keys(c.recordset[0]));

await mssql.close();
