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
const c = await mssql.query('SELECT TOP 5 IDCLIENTE, ds_nombre FROM dbo.CLIENTES');
console.table(c.recordset);

console.log('=== VENDEDORES EXISTENTES IN SQL SERVER ===');
const v = await mssql.query('SELECT TOP 5 IDVENDE, ds_nombre FROM dbo.MAEVENDE');
console.table(v.recordset);

console.log('=== PROVEEDORES EXISTENTES IN SQL SERVER ===');
const p = await mssql.query('SELECT TOP 5 IDPROVE, ds_nombre FROM dbo.PROVEEDORES');
console.table(p.recordset);

console.log('=== SUCURSALES EXISTENTES IN SQL SERVER ===');
const s = await mssql.query('SELECT TOP 5 cd_codigo, ds_nombre FROM dbo.Sucursales');
console.table(s.recordset);

await mssql.close();
