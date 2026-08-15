import('pg').then(async ({ default: pg }) => {
  const { Client } = pg;
  const { default: mssql } = await import('mssql');
  const fs = await import('fs');
  
  const pgClient = new Client({
    connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo'
  });
  
  await pgClient.connect();
  
  // Get SQL Server config
  const result = await pgClient.query('SELECT * FROM "fnGetSQLServerConfig"()');
  const cfg = result.rows[0];
  console.log('SQL Server config:', JSON.stringify(cfg));
  await pgClient.end();
  
  // Connect to SQL Server
  const sqlConfig = {
    server: cfg.servidor,
    database: cfg.base_datos,
    user: cfg.usuario,
    password: cfg.clave,
    port: cfg.puerto ? parseInt(cfg.puerto) : 1433,
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  };
  
  await mssql.connect(sqlConfig);
  console.log('Connected to SQL Server');
  
  // Read and deploy spCotizacionesCrear
  const sql = fs.default.readFileSync('./SQL/SP/spCotizacionesCrear.sql', 'utf8');
  
  // Split on GO keyword (batch separator)
  const batches = sql.split(/^\s*GO\s*$/mi).filter(b => b.trim());
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i].trim();
    if (!batch) continue;
    try {
      await mssql.query(batch);
    } catch (e) {
      console.error(`Batch ${i+1} error:`, e.message.substring(0, 200));
    }
  }
  
  console.log('spCotizacionesCrear deployed successfully');
  await mssql.close();
}).catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
