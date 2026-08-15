import pg from 'pg';
import mssql from 'mssql';

const pgClient = new pg.Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await pgClient.connect();
const cfgRes = await pgClient.query('SELECT * FROM "fnGetSQLServerConfig"()');
const cfg = cfgRes.rows[0];
await pgClient.end();

await mssql.connect({
  server: cfg.servidor, database: cfg.base_datos,
  user: cfg.usuario, password: cfg.clave,
  port: cfg.puerto ? parseInt(cfg.puerto) : 1433,
  options: { encrypt: false, trustServerCertificate: true }
});

console.log('=== CLIENTES EXISTENTES EN SQL SERVER ===');
const c = await mssql.query('SELECT TOP 10 * FROM dbo.CLIENTES');
console.log('CLIENTES:', Object.keys(c.recordset[0]));

console.log('=== VENDEDORES EXISTENTES IN SQL SERVER ===');
const v = await mssql.query('SELECT TOP 5 * FROM dbo.MAEVENDE');
console.log('MAEVENDE:', Object.keys(v.recordset[0]));

console.log('=== PROVEEDORES EXISTENTES IN SQL SERVER ===');
const p = await mssql.query('SELECT TOP 5 * FROM dbo.PROVEEDORES');
console.log('PROVEEDORES:', Object.keys(p.recordset[0]));

await mssql.close();
