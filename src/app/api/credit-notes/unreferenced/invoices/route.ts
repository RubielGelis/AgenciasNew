import { NextRequest, NextResponse } from 'next/server'
import { getSQLServerConnection } from '@/lib/sqlserver'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    let pool;
    try {
        const { searchParams } = new URL(req.url)
        const fechaDesde = searchParams.get('fechaDesde') || null
        const fechaHasta = searchParams.get('fechaHasta') || null
        const cliente = searchParams.get('cliente') || null
        const idTipoConcepto = searchParams.get('idTipoConcepto') ? parseInt(searchParams.get('idTipoConcepto')!) : null
        const idConcepto = searchParams.get('idConcepto') ? parseInt(searchParams.get('idConcepto')!) : null

        const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '1000'))
        const offset = (page - 1) * pageSize

        pool = await getSQLServerConnection()
        const request = pool.request()

        request.input('dt_fecha_desde', fechaDesde)
        request.input('dt_fecha_hasta', fechaHasta)
        request.input('cd_cliente', cliente)
        request.input('id_tipo_concepto', idTipoConcepto)
        request.input('id_concepto', idConcepto)
        request.input('offset', offset)
        request.input('pageSize', pageSize)

        const query = `
            WITH RankedData AS (
                SELECT 
                    id_factura,
                    fuente,
                    serie,
                    consecutivo,
                    numero,
                    fecha,
                    fecha_contable,
                    estado,
                    cliente_codigo,
                    cliente_nombre,
                    tercero_codigo,
                    tercero_nombre,
                    fuente_nc,
                    serie_nc,
                    numero_nc,
                    fecha_nc,
                    id_concepto,
                    codigo_concepto,
                    nombre_concepto,
                    id_tipo_concepto,
                    codigo_tipo_concepto,
                    nombre_tipo_concepto,
                    id_sucursal,
                    id_implante,
                    COUNT(*) OVER() AS total_count
                FROM dbo.fnFacturacionesListar(@dt_fecha_desde, @dt_fecha_hasta, @cd_cliente, @id_tipo_concepto, @id_concepto)
            )
            SELECT *
            FROM RankedData
            ORDER BY id_factura DESC
            OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;
        `

        const result = await request.query(query)
        await pool.close()

        const rows = result.recordset || []
        const total = rows.length > 0 ? (rows[0].total_count || rows.length) : 0

        // Remover columna interna total_count de los objetos individuales
        const cleanedRows = rows.map((r: any) => {
            const { total_count, ...rest } = r
            return rest
        })

        return NextResponse.json({
            data: cleanedRows,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        })
    } catch (error: any) {
        console.error('Error fetching invoices from SQL Server:', error)
        if (pool) {
            try { await pool.close() } catch (e) {}
        }
        return NextResponse.json({ message: error.message || 'Error consultando facturas en SQL Server' }, { status: 500 })
    }
}