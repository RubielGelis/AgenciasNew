import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { executeSQLServerProcedure } from '@/lib/sqlserver'
import { registerLog } from '@/lib/logger'

export async function POST(req: NextRequest) {
    try {
        const { ids, userId } = await req.json()

        if (!ids || (Array.isArray(ids) && ids.length === 0)) {
            return NextResponse.json({ message: 'No quotation IDs provided' }, { status: 400 })
        }

        const idsStr = Array.isArray(ids) ? ids.join(',') : ids.toString();

        // 1. Obtener XML desde Postgres
        const result = await prisma.$queryRawUnsafe<any[]>(
            `CALL spExportQuotation($1, $2, $3)`,
            idsStr,
            userId ? Number(userId) : 0,
            '' 
        )

        const row = result && result.length > 0 ? result[0] : null;
        let xmlStr = (row?.mensaje_resultado || row?.p_mensaje_resultado || (row && typeof row === 'object' ? Object.values(row)[0] : '')) as string;
        
        if (!xmlStr || typeof xmlStr !== 'string') {
            await registerLog(userId, 'QUOTATION', 'EXPORT_ERROR', 'No se generó XML desde Postgres', { ids: idsStr });
            return NextResponse.json({ message: 'Error en generación de XML Postgres' }, { status: 500 })
        }

        // 2. Integración Directa con SQL Server (Nueva versión)
        let sqlServerMsg = 'Enviado exitosamente a SQL Server';
        let success = true;
        let spResult: any[] = [];

        try {
            console.log(`[EXPORT_API] Iniciando carga en SQL Server para ID: ${idsStr}`);
            
            const sqlResult = await executeSQLServerProcedure('spCotizacionesCrear', {
                xml: xmlStr
            });

            // El SP devuelve un recordset con el estado de cada cotización procesada
            if (Array.isArray(sqlResult)) {
                spResult = sqlResult;
            } else if (sqlResult && typeof sqlResult === 'object') {
                spResult = [sqlResult];
            }

            // Si el SP devolvió una fila con campo "Respuesta" es un error de validación
            if (spResult.length > 0 && spResult[0]?.Respuesta) {
                success = false;
                sqlServerMsg = spResult[0].Respuesta;
            }

            await registerLog(userId, 'QUOTATION', success ? 'EXPORT_SUCCESS' : 'EXPORT_SP_ERROR', 
                `ID ${idsStr}: ${sqlServerMsg}`, { spResult, xml: xmlStr });

        } catch (sqlError: any) {
            console.error('[EXPORT_API] Error SQL Server:', sqlError.message);
            success = false;
            sqlServerMsg = sqlError.message;
            await registerLog(userId, 'QUOTATION', 'EXPORT_SQL_ERROR', `ID ${idsStr}: ${sqlServerMsg}`, { error: sqlError.message, xml: xmlStr });
        }

        // 3. Respuesta JSON para el Dashboard
        return NextResponse.json({ 
            success: success,
            message: success ? 'Exportación completada exitosamente' : sqlServerMsg,
            spResult: spResult,   // ← resultado del SP (Estado por cotización)
            xml: xmlStr
        });

    } catch (error: any) {
        console.error('Fatal Error calling export process:', error)
        return NextResponse.json({ message: 'Error fatal en servidor', details: error.message }, { status: 500 })
    }
}
