const { PrismaClient } = require('@prisma/client');
const mssql = require('mssql');
const prisma = new PrismaClient();

async function testExport(id) {
    console.log(`--- INICIANDO PRUEBA DE EXPORTACIÓN (ID: ${id}) ---`);
    try {
        // 1. Obtener XML de Postgres
        console.log('1. Generando XML en PostgreSQL (spExportQuotation)...');
        const pgResult = await prisma.$queryRawUnsafe(`CALL spExportQuotation($1, $2, $3)`, id.toString(), 1, '');
        
        const row = pgResult && pgResult.length > 0 ? pgResult[0] : null;
        let xmlStr = (row?.mensaje_resultado || row?.p_mensaje_resultado || (row && typeof row === 'object' ? Object.values(row)[0] : ''));
        
        if (!xmlStr || typeof xmlStr !== 'string' || xmlStr.startsWith('ERROR')) {
            throw new Error(`Error en Postgres: ${xmlStr || 'Sin respuesta'}`);
        }
        console.log('✔ XML generado correctamente (Primeros 100 caracteres):', xmlStr.substring(0, 100));

        // 2. Obtener Configuración de SQL Server
        console.log('\n2. Buscando parámetros en SystemParameter...');
        const params = await prisma.systemParameter.findMany({
            where: { code: { in: ['ServidorSQLServer', 'UsuarioSQLServer', 'ClaveSQLServer', 'BaseSQLServer', 'PuertoSQLServer'] } }
        });
        
        const config = {
            server: params.find(p => p.code === 'ServidorSQLServer')?.value,
            user: params.find(p => p.code === 'UsuarioSQLServer')?.value,
            password: params.find(p => p.code === 'ClaveSQLServer')?.value,
            database: params.find(p => p.code === 'BaseSQLServer')?.value,
            port: parseInt(params.find(p => p.code === 'PuertoSQLServer')?.value || '1433'),
            options: { encrypt: false, trustServerCertificate: true }
        };

        if (!config.server || !config.user) {
            console.error('Parámetros encontrados:', params.map(p => p.code));
            throw new Error('Configuración de SQL Server incompleta.');
        }

        // 3. Conectar a SQL Server y ejecutar SP
        console.log(`\n3. Conectando a SQL Server (${config.server})...`);
        const pool = await mssql.connect({
            user: config.user,
            password: config.password,
            server: config.server,
            database: config.database,
            port: config.port,
            options: config.options
        });

        console.log('4. Ejecutando spCotizacionesCrear en SQL Server...');
        const request = pool.request();
        request.input('xml', mssql.VarChar(mssql.MAX), xmlStr);
        const sqlResult = await request.execute('spCotizacionesCrear');
        
        console.log('\n--- RESULTADO DE SQL SERVER ---');
        console.table(sqlResult.recordset);

        await pool.close();
        
    } catch (err) {
        console.error('\n❌ ERROR EN LA PRUEBA:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

testExport(14);
