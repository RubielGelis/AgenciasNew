import pg from 'pg';
import mssql from 'mssql';
import fs from 'fs';
const { Client } = pg;

// 1. Deploy spExportQuotation
console.log('=== Desplegando spExportQuotation en Postgres ===');
const pgDeploy = new Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await pgDeploy.connect();
const sqlExport = fs.readFileSync('./SQL/SP/spExportQuotation.sql', 'utf8');
await pgDeploy.query(sqlExport);
console.log('spExportQuotation desplegado OK');
await pgDeploy.end();

// 2. Exportar cotización 3
console.log('\n=== Exportando cotización 3 ===');
const pgExport = new Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await pgExport.connect();

// Verificar formas de pago
const fpCheck = await pgExport.query(`
  SELECT qpp.id, qpp."quotationProductId", qpp."paymentMethod", qpp."amount"
  FROM public."QuotationProductPayment" qpp
  JOIN public."QuotationProduct" qp ON qp.id = qpp."quotationProductId"
  WHERE qp."quotationId" = 3
`);
console.log('Formas de pago en Postgres:', JSON.stringify(fpCheck.rows));

const exportRes = await pgExport.query(`CALL public.spExportQuotation($1, $2, $3)`, ['3', 5, '']);
const xml = exportRes.rows[0].mensaje_resultado;
await pgExport.end();

if (xml.startsWith('ERROR')) {
  console.error('Error en exportación:', xml);
  process.exit(1);
}

const hasFormasPago = xml.includes('<CotizacionServiciosFormasPago>');
const count = (xml.match(/<CotizacionServiciosFormasPago>/g) || []).length;
console.log('¿XML contiene FormasPago?', hasFormasPago, '| Cantidad:', count);

// Mostrar el segmento del XML con FormasPago
const idx = xml.indexOf('<CotizacionServiciosFormasPago>');
if (idx >= 0) {
  console.log('\nNodo FormasPago en XML:');
  console.log(xml.substring(idx, idx + 500));
}

// 3. Enviar a SQL Server
const cfgPg = new Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await cfgPg.connect();
const cfgRes = await cfgPg.query('SELECT * FROM "fnGetSQLServerConfig"()');
const cfg = cfgRes.rows[0];
await cfgPg.end();

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
console.log('Resultado SP:', JSON.stringify(result.recordsets[0]));

// 4. Verificar CotizacionServiciosFormasPago
const check = await mssql.query(`
  SELECT TOP 10
    fp.id, fp.id_CotizacionServicios, fp.Id_Cotizacion,
    fp.id_FormasPago, fp.ds_FPnm, fp.am_valor, fp.am_valor_ME,
    fpm.cd_codigo AS codigo_fp
  FROM dbo.CotizacionServiciosFormasPago fp
  LEFT JOIN dbo.FormasPago fpm ON fpm.id = fp.id_FormasPago
  ORDER BY fp.id DESC
`);
console.log('\n=== Registros en dbo.CotizacionServiciosFormasPago (últimos) ===');
console.table(check.recordset);

await mssql.close();
