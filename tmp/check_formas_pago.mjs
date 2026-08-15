import('pg').then(async ({ default: pg }) => {
  const { default: mssql } = await import('mssql');
  const { Client } = pg;
  
  const pgClient = new Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
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
  
  // Check FormasPago columns
  const cols = await mssql.query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'FormasPago' ORDER BY ORDINAL_POSITION`);
  console.log('FormasPago columns:', JSON.stringify(cols.recordset));
  
  if (cols.recordset.length > 0) {
    // Get top rows using first column  
    const firstCol = cols.recordset[0].COLUMN_NAME;
    const secondCol = cols.recordset.length > 1 ? cols.recordset[1].COLUMN_NAME : firstCol;
    const rows = await mssql.query(`SELECT TOP 5 ${firstCol}, ${secondCol} FROM dbo.FormasPago`);
    console.log('FormasPago rows:', JSON.stringify(rows.recordset));
  }
  
  // Check CotizacionServiciosFormasPago
  const csfp = await mssql.query(`SELECT OBJECT_ID('dbo.CotizacionServiciosFormasPago','U') as tbl_id`);
  console.log('CotizacionServiciosFormasPago exists:', csfp.recordset[0].tbl_id !== null);
  
  await mssql.close();
}).catch(e => { console.error('Error:', e.message); process.exit(1); });
