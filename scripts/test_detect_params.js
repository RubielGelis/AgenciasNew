require('dotenv').config();
const { getSQLServerConnection } = require('../src/lib/sqlserver');

async function testDetect(spName) {
    let pool;
    try {
        pool = await getSQLServerConnection();
        console.log(`Checking parameters for ${spName}...`);

        const query = `
            SELECT 
                p.name AS param_name,
                t.name AS type_name,
                p.max_length,
                p.is_output,
                p.has_default_value,
                p.default_value
            FROM sys.parameters p
            JOIN sys.types t ON p.user_type_id = t.user_type_id
            WHERE p.object_id = OBJECT_ID(@spName)
            ORDER BY p.parameter_id
        `;

        const request = pool.request();
        request.input('spName', spName);
        const result = await request.query(query);

        console.log(`Parameters found (${result.recordset.length}):`, result.recordset);
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        if (pool) await pool.close();
    }
}

// Test with Zeus®spze_VentasFareBasis or Zeus®spze_VentasDetalladasPorConceptos
testDetect('dbo.[Zeus®spze_VentasFareBasis]');
