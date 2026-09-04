import { NextRequest, NextResponse } from 'next/server'
import { getSQLServerConnection } from '@/lib/sqlserver'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    let pool;
    try {
        const body = await req.json()
        const { facturas, userId = 1, observaciones = 'Nota Credito No Referenciada' } = body

        if (!facturas || !Array.isArray(facturas) || facturas.length === 0) {
            return NextResponse.json({ message: 'No se seleccionaron facturas para procesar.' }, { status: 400 })
        }

        // 1. Construir XML para enviar a SQL Server
        let xmlStr = '<Facturas>'
        for (const fac of facturas) {
            xmlStr += `<Factura>`
            xmlStr += `<id>${fac.id_factura || fac.id || ''}</id>`
            xmlStr += `<fuente>${fac.fuente || ''}</fuente>`
            xmlStr += `<serie>${fac.serie || ''}</serie>`
            xmlStr += `<consecutivo>${fac.consecutivo || ''}</consecutivo>`
            xmlStr += `<numero>${fac.numero || ''}</numero>`
            xmlStr += `<id_sucursal>${fac.id_sucursal || 1}</id_sucursal>`
            xmlStr += `<id_implante>${fac.id_implante || ''}</id_implante>`
            xmlStr += `<fecha_contable>${fac.fecha_contable ? new Date(fac.fecha_contable).toISOString().slice(0, 10) : ''}</fecha_contable>`
            xmlStr += `</Factura>`
        }
        xmlStr += '</Facturas>'

        console.log('[NC_NO_REF] Ejecutando spNotasCreditoNoRef_Crear en SQL Server...');

        // 2. Conectar y ejecutar SP en SQL Server
        pool = await getSQLServerConnection()
        const request = pool.request()

        request.input('xml', xmlStr)
        request.input('id_usuario', userId)
        request.input('ds_observaciones', observaciones)

        const spResult = await request.execute('dbo.spNotasCreditoNoRef_Crear')
        const sqlRows = spResult.recordset || []
        await pool.close()
        pool = null

        console.log('[NC_NO_REF] Resultado SQL Server:', JSON.stringify(sqlRows, null, 2));

        // 3. Filtrar las que fueron creadas exitosamente y prepararlas para PostgreSQL
        const exitosas = sqlRows.filter((r: any) => r.estado === 'EXITO' && r.consecutivo_nc)

        let pgResultMsg = 'Sin registros para insertar en Postgres';
        let pgInsertedCount = 0;

        if (exitosas.length > 0) {
            const pgData = exitosas.map((r: any) => ({
                fuente: (r.fuente_nc || '').trim(),
                serie: (r.serie_nc || '').trim(),
                consecutivo: (r.consecutivo_nc || '').trim(),
                factura_fuente: (r.factura_fuente || '').trim(),
                factura_serie: (r.factura_serie || '').trim(),
                factura_numero: (r.factura_numero || '').trim(),
                fecha: r.fecha ? new Date(r.fecha).toISOString() : new Date().toISOString()
            }))

            console.log('[NC_NO_REF] Insertando en Postgres spNotaCreditoNoRef_Insertar...', JSON.stringify(pgData));

            const pgRes: any[] = await prisma.$queryRawUnsafe(
                `CALL public.spNotaCreditoNoRef_Insertar($1::JSONB, $2::INT, $3::TEXT)`,
                JSON.stringify(pgData),
                0,
                ''
            )

            pgInsertedCount = pgRes[0]?.p_inserted_count || 0
            pgResultMsg = pgRes[0]?.p_mensaje_resultado || ''
        }

        return NextResponse.json({
            success: true,
            totalProcesadas: sqlRows.length,
            exitosasCount: exitosas.length,
            pgInsertedCount,
            resultados: sqlRows,
            pgResultMsg
        })
    } catch (error: any) {
        console.error('Error in credit notes creation:', error)
        if (pool) {
            try { await pool.close() } catch (e) {}
        }
        return NextResponse.json({ message: error.message || 'Error procesando notas crédito no referenciadas' }, { status: 500 })
    }
}