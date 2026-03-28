import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { registerLog } from '@/lib/logger'
import { executeSQLServerProcedure } from '@/lib/sqlserver'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    const userIdHeader = req.headers.get('X-User-Id');
    const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1;

    try {
        const rows = await req.json()
        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ message: 'El archivo está vacío o no es válido' }, { status: 400 })
        }

        // 1. Convertir el array de objetos a un string delimitado (Texto Plano)
        const textData = rows.map((row: any) => {
            const cols = [
                row.Grupo_Cotizacion || '',
                row.Cliente_Documento || '',
                row.Sucursal_Codigo || '',
                row.Implant_Codigo || '',
                row.Vendedor_Codigo || '',
                row.Tiqueteador_Codigo || '',
                row.Moneda || '',
                row.Tasa_Cambio || '',
                row.Comision_Global_Pct || '',
                row.Cargos_A_Cotizacion || '',
                row.Producto_Codigo || '',
                '', // Proveedor_Nombre
                row.Proveedor_Codigo || '',
                row.Prestadora_Codigo || row.Hotel_Codigo || row.Hotel_id || '', // Soporte para alias de columna
                row.Impuestos_Nombres_Y_Valores || '',
                row.Variables_Codigos_Y_Valores || '',
                row.Pasajeros || '',
                row.Precio_Unitario || '',
                row.Cantidad || '',
                row.CheckIn || '',
                row.CheckOut || '',
                row.Pax_Adultos || '',
                row.Pax_Ninos || '',
                row.Destino || '',
                row.Tipo_Servicio || '',
                row.Reserva || '',
                row.Comision_Vendedor_Producto || '',
                row.Comision_Tiqueteador_Producto || '',
                row.Combo_Codigos || '',
                row.Nacionalidad || '1',
                row.Cargo_Principal || ''
            ];
            // Limpieza profunda: evitar que caracteres especiales rompan el formato caret (^)
            return cols.map(c => (c !== undefined && c !== null ? c.toString().replace(/\^/g, ' ') : '')).join('^');
        }).join('\n');

        // 2. Ejecutar el Stored Procedure enviando el TEXTO
        // Usamos $queryRaw para llamar al SP y capturar el parámetro INOUT
        const result: any[] = await prisma.$queryRawUnsafe(
            `CALL public."spImportQuotation"($1::TEXT, $2::INT, $3::TEXT)`,
            textData,
            actingUserId,
            null // Valor inicial para el INOUT
        );

        // Extraer mensaje (algunas versiones de Prisma/PG devuelven nombres distintos)
        const rowData = result && result.length > 0 ? result[0] : null;
        const dbMessage = (rowData?.p_mensaje_resultado || rowData?.mensaje_resultado || (rowData ? Object.values(rowData)[0] : '')) as string;
        
        console.log('[Import API] SP Result:', dbMessage);

        if (dbMessage.startsWith('ERROR')) {
            throw new Error(dbMessage);
        }

        // 3. Extraer IDs de las cotizaciones creadas (Formato SUCCESS: ... ID_LIST[1,2,3])
        const idMatch = dbMessage.match(/ID_LIST\[(.*?)\]/);
        const createdIdsStr = idMatch ? idMatch[1] : '';
        const createdIds = createdIdsStr ? createdIdsStr.split(',').map((id: string) => parseInt(id.trim())) : [];

        // 4. Auditoría de la importación
        await registerLog(
            actingUserId,
            'QUOTATION',
            'IMPORT',
            `Importación masiva mediante SP. Filas: ${rows.length}. IDs creados: ${createdIdsStr}`,
            { rowCount: rows.length, dbMessage, createdIds }
        );

        // 5. Exportación automática a SQL Server si se requiere
        let autoExportResult = null;
        if (createdIds.length > 0) {
            const autoExportParam = await prisma.systemParameter.findUnique({
                where: { code: 'EnviarCotizacionesAutoSQLserver' }
            });

            if (autoExportParam?.value === '1') {
                try {
                    console.log(`[AUTO_EXPORT] Iniciando exportación automática para IDs: ${createdIdsStr}`);
                    
                    // Obtener XML desde Postgres
                    const exportResult = await prisma.$queryRawUnsafe<any[]>(
                        `CALL spexportquotation($1::TEXT, $2::INT, $3::TEXT)`,
                        createdIdsStr,
                        actingUserId,
                        ''
                    );

                    const row = exportResult && exportResult.length > 0 ? exportResult[0] : null;
                    const xmlStr = (row?.mensaje_resultado || row?.p_mensaje_resultado || (row && typeof row === 'object' ? Object.values(row)[0] : '')) as string;

                    if (xmlStr && typeof xmlStr === 'string' && !xmlStr.startsWith('ERROR')) {
                        const sqlResult = await executeSQLServerProcedure('spCotizacionesCrear', { xml: xmlStr });
                        
                        autoExportResult = { success: true, message: 'Exportado automáticamente a SQL Server', sqlResult };
                        await registerLog(actingUserId, 'QUOTATION', 'AUTO_EXPORT_SUCCESS', `ID(s) ${createdIdsStr}: Exportación automática exitosa`, { sqlResult });
                    } else {
                        autoExportResult = { success: false, message: 'No se generó XML válido para exportación automática' };
                        await registerLog(actingUserId, 'QUOTATION', 'AUTO_EXPORT_ERROR', `ID(s) ${createdIdsStr}: Error en generación de XML`, { xml: xmlStr });
                    }
                } catch (exportError: any) {
                    console.error('[AUTO_EXPORT] Error:', exportError.message);
                    autoExportResult = { success: false, error: exportError.message };
                    await registerLog(actingUserId, 'QUOTATION', 'AUTO_EXPORT_SQL_ERROR', `ID(s) ${createdIdsStr}: ${exportError.message}`, { error: exportError.message });
                }
            }
        }

        return NextResponse.json({ 
            message: 'Importación finalizada',
            detail: dbMessage,
            importedCount: rows.length,
            createdIds,
            autoExport: autoExportResult
        })
    } catch (error: any) {
        console.error('Import error (via SP TEXT):', error);
        
        // Registrar error catastrófico en auditoría
        await registerLog(userIdHeader ? parseInt(userIdHeader) : 1, 'QUOTATION', 'IMPORT_CRITICAL_ERROR', error.message, { stack: error.stack });

        return NextResponse.json({ 
            message: `Error durante la importación: ${error.message}`, 
            error: error.message,
            detail: error.toString()
        }, { status: 500 })
    }
}
