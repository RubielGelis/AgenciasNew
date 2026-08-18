require('dotenv').config();
const { getSQLServerConnection } = require('../src/lib/sqlserver');

async function checkTables() {
    try {
        const pool = await getSQLServerConnection();
        console.log('SQL Server Connected Successfully!');

        // Check if common tables exist
        const tables = ['Sucursales', 'Implantes', 'ConceptoFacturacion', 'CLIENTES', 'MAEVENDE', 'PROVEEDORES', 'Tiqueteadores', 'Segmento', 'Etapas', 'TipoVenta'];
        for (const t of tables) {
            try {
                const res = await pool.request().query(`SELECT TOP 3 * FROM dbo.[${t}]`);
                console.log(`Table [${t}] FOUND! Sample rows:`, res.recordset.length);
            } catch (err) {
                console.log(`Table [${t}] not found or error:`, err.message);
            }
        }

        await pool.close();
    } catch (e) {
        console.error('Error connecting to SQL Server:', e.message);
    }
}

checkTables();
