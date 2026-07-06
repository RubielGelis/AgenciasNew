import mssql from 'mssql'
import prisma from './prisma'

/**
 * Obtiene la conexión a SQL Server usando la función de Postgres.
 */
export async function getSQLServerConnection() {
    console.log('[SQL_CONN] Llamando a "fnGetSQLServerConfig"() en Postgres...');
    
    // 1. Obtener datos desde Postgres
    const result = await prisma.$queryRawUnsafe<any[]>('SELECT * FROM "fnGetSQLServerConfig"()');
    
    if (!result || result.length === 0) {
        throw new Error('No se pudo obtener la configuración desde "fnGetSQLServerConfig"()');
    }

    const configRow = result[0];
    let serverVal = (configRow.servidor || '').trim();
    
    // Normalizar barras
    if (serverVal.includes('/')) serverVal = serverVal.replace('/', '\\');

    const userVal = (configRow.usuario || '').trim();
    const passVal = (configRow.clave || '').trim();
    const dbVal = (configRow.base_datos || '').trim();
    const portVal = (configRow.puerto || '').trim();

    if (!serverVal) throw new Error('Servidor no configurado.');

    let host = serverVal;
    let instanceName = undefined;

    // Si tiene barra \, es instancia nombrada
    if (serverVal.includes('\\')) {
        const parts = serverVal.split('\\');
        host = parts[0];
        instanceName = parts[1];
    }

    // Si host es localhost, a veces es mejor usar 127.0.0.1 en Node.js
    if (host.toLowerCase() === 'localhost') {
        host = '127.0.0.1';
    }

    const sqlConfig: any = {
        user: userVal,
        password: passVal,
        server: host,
        database: dbVal,
        options: {
            encrypt: false,
            trustServerCertificate: true,
            enableArithAbort: true
        },
        connectionTimeout: 20000,
        requestTimeout: 60000
    };

    // Lógica inteligente de Puerto vs Instancia
    if (portVal && portVal !== '') {
        sqlConfig.port = parseInt(portVal);
        delete sqlConfig.options.instanceName;
        console.log(`[SQL_DEBUG] Conectando por PUERTO: ${host}:${sqlConfig.port}`);
    } else if (instanceName) {
        sqlConfig.options.instanceName = instanceName;
        console.log(`[SQL_DEBUG] Conectando por INSTANCIA: ${host}\\${instanceName} (Vía SQL Browser)`);
    } else {
        // Si no hay nada, puerto por defecto
        sqlConfig.port = 1433;
        console.log(`[SQL_DEBUG] Conectando por DEFECTO (1433): ${host}`);
    }

    try {
        const pool = await mssql.connect(sqlConfig);
        console.log('[SQL_CONN] ¡EXITO!');
        return pool;
    } catch (error: any) {
        console.error('[SQL_CONN] ERROR:', error.message);
        throw error;
    }
}

/**
 * Ejecuta un Stored Procedure en SQL Server.
 */
export async function executeSQLServerProcedure(spName: string, params: any) {
    let pool;
    try {
        console.log(`[SQL_SERVER_EXEC] Procedimiento: ${spName} | Parámetros:`, JSON.stringify(params));
        pool = await getSQLServerConnection();
        const request = pool.request();

        if (params) {
            Object.keys(params).forEach(key => {
                request.input(key, mssql.VarChar(mssql.MAX), params[key]);
            });
        }

        const result = await request.execute(spName);
        await pool.close();
        return result.recordset || result.rowsAffected;
    } catch (err: any) {
        if (pool) await pool.close();
        throw err;
    }
}
