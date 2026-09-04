import { NextResponse } from 'next/server'
import { getSQLServerConnection } from '@/lib/sqlserver'

export const dynamic = 'force-dynamic'

export async function GET() {
    let pool;
    try {
        pool = await getSQLServerConnection()
        
        // 1. Tipos de Conceptos
        const resTipos = await pool.request().query(`
            SELECT id, cd_codigo AS codigo, ds_nombre AS nombre 
            FROM dbo.TiposConceptFac WITH (NOLOCK)
            ORDER BY ds_nombre ASC
        `)

        // 2. Conceptos de Facturación
        const resConceptos = await pool.request().query(`
            SELECT id, id_TiposConceptoFacturacion AS id_tipo_concepto, cd_codigo AS codigo, ds_nombre AS nombre 
            FROM dbo.ConceptoFacturacion WITH (NOLOCK)
            ORDER BY ds_nombre ASC
        `)

        // 3. Clientes (principales)
        const resClientes = await pool.request().query(`
            SELECT DISTINCT TOP 200 cd_cliente_codigo AS codigo, RTRIM(ds_cliente_nombre) AS nombre 
            FROM dbo.fac_factura WITH (NOLOCK)
            WHERE cd_cliente_codigo IS NOT NULL AND RTRIM(cd_cliente_codigo) <> ''
            ORDER BY RTRIM(ds_cliente_nombre) ASC
        `)

        await pool.close()

        return NextResponse.json({
            tiposConcepto: resTipos.recordset || [],
            conceptos: resConceptos.recordset || [],
            clientes: resClientes.recordset || []
        })
    } catch (error: any) {
        console.error('Error fetching filters from SQL Server:', error)
        if (pool) {
            try { await pool.close() } catch (e) {}
        }
        return NextResponse.json({ message: error.message || 'Error consultando filtros en SQL Server' }, { status: 500 })
    }
}