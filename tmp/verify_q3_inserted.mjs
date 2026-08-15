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

console.log('=== VERIFICANDO LA COTIZACION CREADA 23138 ===');
const c = await mssql.query(`
  SELECT id, cd_consecutivo, ds_cliente_nombre, ds_FormaDePago FROM dbo.Cotizacion WHERE id = 23138
`);
console.table(c.recordset);

console.log('=== SERVICIOS CREADOS EN SQL SERVER PARA LA COTIZACION 23138 ===');
const cs = await mssql.query(`
  SELECT id, Id_Cotizacion, cd_Consecutivo_VariablesAdicionales, ds_servicio 
  FROM dbo.CotizacionServicios 
  WHERE Id_Cotizacion = 23138
`);
console.table(cs.recordset);

const idsServicios = cs.recordset.map(x => x.id).join(',');

console.log('=== FORMAS DE PAGO CREADAS EN SQL SERVER PARA LA COTIZACION 23138 ===');
if (idsServicios) {
  const fp = await mssql.query(`
    SELECT 
      fp.id, fp.id_CotizacionServicios, fp.Id_Cotizacion, fp.id_FormasPago,
      fp.ds_FPnm, fp.am_valor, fp.am_valor_ME, fpm.cd_codigo AS codigo_fp
    FROM dbo.CotizacionServiciosFormasPago fp
    LEFT JOIN dbo.FormasPago fpm ON fpm.id = fp.id_FormasPago
    WHERE fp.Id_Cotizacion = 23138 OR fp.id_CotizacionServicios IN (${idsServicios})
  `);
  console.table(fp.recordset);
} else {
  console.log('No se encontraron servicios.');
}

await mssql.close();
