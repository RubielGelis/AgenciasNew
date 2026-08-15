import pg from 'pg';
import mssql from 'mssql';
const { Client } = pg;

const pgExport = new Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await pgExport.connect();
const exportRes = await pgExport.query(`CALL public.spExportQuotation($1, $2, $3)`, ['3', 5, '']);
const xml = exportRes.rows[0].mensaje_resultado;
await pgExport.end();

const cfgPg = new Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await cfgPg.connect();
const cfg = cfgRes => cfgRes.rows[0];
const cfgData = (await cfgPg.query('SELECT * FROM "fnGetSQLServerConfig"()')).rows[0];
await cfgPg.end();

await mssql.connect({
  server: cfgData.servidor, database: cfgData.base_datos,
  user: cfgData.usuario, password: cfgData.clave,
  port: cfgData.puerto ? parseInt(cfgData.puerto) : 1433,
  options: { encrypt: false, trustServerCertificate: true }
});

console.log('Ejecutando spCotizacionesCrear paso a paso para ver el error real...');
try {
  const req = new mssql.Request();
  req.input('xml', mssql.VarChar(mssql.MAX), xml);
  // Ejecutamos con una query directa que atrape el error e intente hacer ROLLBACK si hay mismatch
  const res = await req.query(`
    BEGIN TRY
      EXEC dbo.spCotizacionesCrear @xml;
    END TRY
    BEGIN CATCH
      SELECT 
        ERROR_NUMBER() AS ErrorNumber,
        ERROR_MESSAGE() AS ErrorMessage,
        ERROR_LINE() AS ErrorLine,
        ERROR_PROCEDURE() AS ErrorProcedure;
      IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    END CATCH
  `);
  console.log('Resultado del Catch:', JSON.stringify(res.recordset, null, 2));
} catch (err) {
  console.error('Error capturado en Node:', err.message);
}

await mssql.close();
