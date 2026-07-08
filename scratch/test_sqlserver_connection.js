const mssql = require('mssql');

async function main() {
    console.log("Connecting to SQL Server using parameters from agencias_db...");
    
    // Config normalizer logic from sqlserver.ts
    const host = '127.0.0.1'; // local IP
    const instanceName = 'RUBIEL';
    
    const config = {
        user: 'sa',
        password: '111985*',
        server: host,
        database: 'Agencias',
        options: {
            encrypt: false,
            trustServerCertificate: true,
            enableArithAbort: true,
            instanceName: instanceName
        },
        connectionTimeout: 10000,
        requestTimeout: 10000
    };
    
    try {
        const pool = await mssql.connect(config);
        console.log("Successfully connected to SQL Server!");
        const res = await pool.request().query("SELECT @@VERSION as version");
        console.log("SQL Server version:", res.recordset[0].version);
        await pool.close();
    } catch (e) {
        console.error("SQL Server Connection Error:", e.message);
    }
}
main();
