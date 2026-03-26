import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const rows = await req.json()
        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ message: 'El archivo está vacío o no es válido' }, { status: 400 })
        }

        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        // 1. Convertir el array de objetos a un string delimitado (Texto Plano)
        const textData = rows.map(row => {
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
                '', // Proveedor_Nombre (Empty)
                row.Proveedor_Codigo || '',
                row.Prestadora_Codigo || '',
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
                row.Nacionalidad || '1'
            ];
            return cols.join('^');
        }).join('\n');

        // 2. Ejecutar el Stored Procedure enviando el TEXTO
        // Usamos $queryRaw para llamar al SP y capturar el parámetro INOUT
        const result: any[] = await prisma.$queryRawUnsafe(
            `CALL public."spImportQuotation"($1::TEXT, $2::INT, $3::TEXT)`,
            textData,
            actingUserId,
            null // Valor inicial para el INOUT
        );

        // PostgreSQL cuando usa CALL devuelve una fila con los valores de salida
        const dbMessage = result[0]?.p_mensaje_resultado || 'Importación completada';
        console.log('[Import API] SP Result:', dbMessage);

        if (dbMessage.startsWith('ERROR')) {
            throw new Error(dbMessage);
        }

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({
                userId: actingUserId,
                action: 'IMPORT',
                module: 'QUOTATION',
                description: `Importación masiva mediante SP (Versión Texto). Filas enviadas: ${rows.length}`,
                metadata: { rowCount: rows.length, dbMessage }
            });
        });

        return NextResponse.json({ 
            message: 'Importación finalizada',
            detail: dbMessage,
            importedCount: rows.length
        })
    } catch (error: any) {
        console.error('Import error (via SP TEXT):', error);
        return NextResponse.json({ 
            message: 'Error durante la importación (Texto)', 
            error: error.message,
            detail: error.toString()
        }, { status: 500 })
    }
}
