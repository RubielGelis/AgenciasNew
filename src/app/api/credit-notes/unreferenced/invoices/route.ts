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

        pool = await getSQLServerConnection()
        const request = pool.request()

        request.input('dt_fecha_desde', fechaDesde)
        request.input('dt_fecha_hasta', fechaHasta)
        request.input('cd_cliente', cliente)
        request.input('id_tipo_concepto', idTipoConcepto)
        request.input('id_concepto', idConcepto)

        const query = `
            SELECT TOP 500
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
                id_implante
            FROM dbo.fnFacturacionesListar(@dt_fecha_desde, @dt_fecha_hasta, @cd_cliente, @id_tipo_concepto, @id_concepto)
            ORDER BY id_factura DESC;
        `

        const result = await request.query(query)
        await pool.close()

        return NextResponse.json(result.recordset || [])
    } catch (error: any) {
        console.error('Error fetching invoices from SQL Server:', error)
        if (pool) {
            try { await pool.close() } catch (e) {}
        }
        return NextResponse.json({ message: error.message || 'Error consultando facturas en SQL Server' }, { status: 500 })
    }
}