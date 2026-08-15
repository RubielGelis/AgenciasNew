import pg from 'pg';
import mssql from 'mssql';
const { Client } = pg;

const pgClient = new Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await pgClient.connect();

// 1. Verificar que la cotización 3 tiene formas de pago en Postgres
const fpCheck = await pgClient.query(`
  SELECT qpp.id, qpp."quotationProductId", qpp."paymentMethod", qpp."amount", qpp."cardNumber", qpp."reference"
  FROM public."QuotationProductPayment" qpp
  JOIN public."QuotationProduct" qp ON qp.id = qpp."quotationProductId"
  WHERE qp."quotationId" = 3
`);
console.log('=== Formas de pago en Postgres (Quotation 3) ===');
console.log(JSON.stringify(fpCheck.rows, null, 2));

// 2. Ejecutar la exportación
const exportRes = await pgClient.query(`CALL public.spExportQuotation($1, $2, $3)`, ['3', 5, '']);
const xml = exportRes.rows[0].mensaje_resultado;

if (xml.startsWith('ERROR')) {
  console.error('Error en exportación:', xml);
  await pgClient.end();
  process.exit(1);
}

console.log('\n=== XML exportado (primeros 2000 chars) ===');
console.log(xml.substring(0, 2000));

// Verificar si tiene nodos de FormasPago
const hasFormasPago = xml.includes('<CotizacionServiciosFormasPago>');
console.log('\n¿XML contiene nodos CotizacionServiciosFormasPago?', hasFormasPago);

// Contar cuántos nodos hay
const count = (xml.match(/<CotizacionServiciosFormasPago>/g) || []).length;
console.log('Cantidad de nodos FormasPago en XML:', count);

await pgClient.end();

// 3. Enviar a SQL Server
const cfgClient = new Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await cfgClient.connect();
const cfgRes = await cfgClient.query('SELECT * FROM "fnGetSQLServerConfig"()');
const cfg = cfgRes.rows[0];
await cfgClient.end();

await mssql.connect({
  server: cfg.servidor, database: cfg.base_datos,
  user: cfg.usuario, password: cfg.clave,
  port: cfg.puerto ? parseInt(cfg.puerto) : 1433,
  options: { encrypt: false, trustServerCertificate: true },
  requestTimeout: 60000
});

console.log('\n=== Ejecutando spCotizacionesCrear en SQL Server ===');
const req = new mssql.Request();
req.input('xml', mssql.VarChar(mssql.MAX), xml);
const result = await req.execute('dbo.spCotizacionesCrear');
console.log('Resultado SP:', JSON.stringify(result.recordsets[0], null, 2));

// 4. Verificar datos insertados en CotizacionServiciosFormasPago
const check = await mssql.query(`
  SELECT TOP 20 
    fp.id, fp.id_CotizacionServicios, fp.Id_Cotizacion, fp.id_FormasPago,
    fp.ds_FPnm, fp.bl_FPrepresenta, fp.am_valor, fp.am_valor_ME,
    fp.ds_tcnumber, fp.ds_tcvoucher, fp.ds_referencia, fp.ds_tcautorizacion,
    fpm.cd_codigo AS codigo_forma_pago
  FROM dbo.CotizacionServiciosFormasPago fp
  LEFT JOIN dbo.FormasPago fpm ON fpm.id = fp.id_FormasPago
  ORDER BY fp.id DESC
`);
console.log('\n=== Registros en dbo.CotizacionServiciosFormasPago (últimos insertados) ===');
console.log(JSON.stringify(check.recordset, null, 2));

await mssql.close();
