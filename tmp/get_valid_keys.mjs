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

console.log('=== CLIENTE VALIDO ===');
const c = await mssql.query('SELECT TOP 1 IDCLIENTE FROM dbo.CLIENTES');
console.log(c.recordset[0]);

console.log('=== VENDEDOR VALIDO ===');
const v = await mssql.query('SELECT TOP 1 IDVENDE FROM dbo.MAEVENDE');
console.log(v.recordset[0]);

console.log('=== PROVEEDOR VALIDO ===');
const p = await mssql.query('SELECT TOP 1 IDPROVE FROM dbo.PROVEEDORES');
console.log(p.recordset[0]);

console.log('=== TIQUETEADOR VALIDO ===');
const t = await mssql.query('SELECT TOP 1 cd_codigo FROM dbo.Tiqueteadores');
console.log(t.recordset[0]);

console.log('=== SUCURSAL VALIDA ===');
const s = await mssql.query('SELECT TOP 1 cd_codigo FROM dbo.Sucursales');
console.log(s.recordset[0]);

await mssql.close();
