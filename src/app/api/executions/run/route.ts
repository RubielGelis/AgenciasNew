import { NextRequest, NextResponse } from 'next/server'
import { getSQLServerConnection } from '@/lib/sqlserver'
import mssql from 'mssql'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // Allow long-running stored procedures up to 5 mins

export async function POST(req: NextRequest) {
    let pool: mssql.ConnectionPool | null = null
    const startTime = Date.now()

    try {
        const body = await req.json()
        const { spName, parameters } = body

        if (!spName) {
            return NextResponse.json({ message: 'El nombre del Stored Procedure es requerido.' }, { status: 400 })
        }

        console.log(`[EXECUTION_API] Ejecutando SP: ${spName}`);
        console.log(`[EXECUTION_API] Parámetros recibidos:`, JSON.stringify(parameters));

        // 1. Obtener conexión a SQL Server
        pool = await getSQLServerConnection()
        
        // 2. Consultar parámetros reales de sys.parameters para evitar enviar parámetros inexistentes (como @param1)
        const checkRequest = pool.request()
        checkRequest.input('spName', mssql.VarChar, spName)
        const sysParamsResult = await checkRequest.query(`
            SELECT p.name AS param_name
            FROM sys.parameters p
            WHERE p.object_id = OBJECT_ID(@spName)
               OR p.object_id = OBJECT_ID('dbo.' + REPLACE(REPLACE(@spName, 'dbo.', ''), '[', ''))
        `)

        const validParamSet = new Set<string>()
        if (sysParamsResult.recordset && sysParamsResult.recordset.length > 0) {
            sysParamsResult.recordset.forEach((r: any) => {
                const cleanName = (r.param_name || '').replace(/^@/, '').toLowerCase()
                validParamSet.add(cleanName)
            })
        }

        console.log(`[EXECUTION_API] Parámetros reales en SQL Server (${validParamSet.size}):`, Array.from(validParamSet));

        // 3. Preparar la solicitud de ejecución
        const execRequest = pool.request()
        ;(execRequest as any).timeout = 180000 // 3 minutes timeout

        // 4. Agregar sólo parámetros válidos que existan en el procedimiento
        if (parameters && typeof parameters === 'object') {
            Object.keys(parameters).forEach((key) => {
                const lowerKey = key.toLowerCase()

                // Si se conocen los parámetros del SP y la llave no existe, la ignoramos para evitar errores
                if (validParamSet.size > 0 && !validParamSet.has(lowerKey)) {
                    console.warn(`[EXECUTION_API] Omitiendo parámetro "@${key}" porque no existe en el SP ${spName}.`);
                    return
                }

                let val = parameters[key]

                // Normalizar nulos o cadenas vacías
                if (val === undefined || val === null) {
                    val = null
                } else if (typeof val === 'string') {
                    val = val.trim()
                    if (val === '') val = null
                }

                execRequest.input(key, mssql.VarChar(mssql.MAX), val)
            })
        }

        // 5. Ejecutar el Stored Procedure
        const result = await execRequest.execute(spName)
        const recordset = result.recordset || []
        const elapsedTime = Date.now() - startTime

        console.log(`[EXECUTION_API] SP ${spName} ejecutado con éxito. Registros devueltos: ${recordset.length} (${elapsedTime}ms)`);

        // Extraer nombres de columnas si existen registros
        const columns = recordset.length > 0 ? Object.keys(recordset[0]) : []

        return NextResponse.json({
            success: true,
            spName,
            recordCount: recordset.length,
            elapsedTimeMs: elapsedTime,
            columns,
            data: recordset
        })
    } catch (error: any) {
        console.error('[EXECUTION_API] Error al ejecutar el Stored Procedure:', error)
        const elapsedTime = Date.now() - startTime
        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Error durante la ejecución en SQL Server.',
                detail: error.originalError?.message || error.code || '',
                elapsedTimeMs: elapsedTime
            },
            { status: 500 }
        )
    } finally {
        if (pool) {
            try {
                await pool.close()
            } catch (closeErr) {
                console.error('[EXECUTION_API] Error al cerrar pool SQL Server:', closeErr)
            }
        }
    }
}
