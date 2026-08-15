const { Client } = require('pg');
const mssql = require('mssql');

async function main() {
  const pgConnectionString = "postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public";
  const pgClient = new Client({ connectionString: pgConnectionString });
  
  try {
    await pgClient.connect();
    
    // Get SQL Server config
    const configRes = await pgClient.query('SELECT * FROM "fnGetSQLServerConfig"()');
    const configRow = configRes.rows[0];
    let serverVal = (configRow.servidor || '').trim();
    if (serverVal.includes('/')) serverVal = serverVal.replace('/', '\\');
    
    let host = serverVal;
    let instanceName = undefined;
    if (serverVal.includes('\\')) {
      const parts = serverVal.split('\\');
      host = parts[0];
      instanceName = parts[1];
    }
    if (host.toLowerCase() === 'localhost') host = '127.0.0.1';
    
    const sqlConfig = {
      user: (configRow.usuario || '').trim(),
      password: (configRow.clave || '').trim(),
      server: host,
      database: (configRow.base_datos || '').trim(),
      port: configRow.puerto ? parseInt(configRow.puerto) : 1433,
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    };
    if (instanceName && !configRow.puerto) {
      sqlConfig.options.instanceName = instanceName;
    }
    
    const pool = await mssql.connect(sqlConfig);
    
    // Query column definitions for dbo.PROVEEDORES
    const colsRes = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'PROVEEDORES'
    `);
    console.log('dbo.PROVEEDORES columns:', colsRes.recordset);
    
    await pool.close();

  } catch (err) {
    console.error(err);
  } finally {
    await pgClient.end();
  }
}

main();
