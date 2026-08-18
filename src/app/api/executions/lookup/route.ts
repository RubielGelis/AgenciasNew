import { NextRequest, NextResponse } from 'next/server'
import { getSQLServerConnection } from '@/lib/sqlserver'
import mssql from 'mssql'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    let pool: mssql.ConnectionPool | null = null

    try {
        const { searchParams } = new URL(req.url)
        const type = (searchParams.get('type') || '').toLowerCase().trim()
        const search = (searchParams.get('search') || '').trim()

        if (!type) {
            return NextResponse.json({ message: 'El parámetro "type" es requerido.' }, { status: 400 })
        }

        console.log(`[LOOKUP_API] Solicitando tipo: ${type} | Búsqueda: "${search}"`);

        pool = await getSQLServerConnection()
        const request = pool.request()

        let query = ''
        let searchClause = ''

        if (search) {
            request.input('search', mssql.VarChar, `%${search}%`)
        }

        switch (type) {
            case 'sucursales':
                searchClause = search ? 'WHERE cd_codigo LIKE @search OR ds_nombre LIKE @search' : ''
                query = `SELECT TOP 200 cd_codigo AS code, ds_nombre AS name FROM dbo.Sucursales ${searchClause} ORDER BY cd_codigo`
                break

            case 'implantes':
                searchClause = search ? 'WHERE cd_codigo LIKE @search OR ds_nombre LIKE @search' : ''
                query = `SELECT TOP 200 cd_codigo AS code, ds_nombre AS name FROM dbo.Implantes ${searchClause} ORDER BY cd_codigo`
                break

            case 'clientes':
                searchClause = search ? 'WHERE IDCLIENTE LIKE @search OR RAZONCIAL LIKE @search' : ''
                query = `SELECT TOP 200 IDCLIENTE AS code, RAZONCIAL AS name FROM dbo.CLIENTES ${searchClause} ORDER BY IDCLIENTE`
                break

            case 'vendedores':
                searchClause = search ? 'WHERE IDVENDE LIKE @search OR NOMBVENDE LIKE @search' : ''
                query = `SELECT TOP 200 IDVENDE AS code, NOMBVENDE AS name FROM dbo.MAEVENDE ${searchClause} ORDER BY IDVENDE`
                break

            case 'proveedores':
                searchClause = search ? 'WHERE IDPROVE LIKE @search OR RAZONCIAL LIKE @search' : ''
                query = `SELECT TOP 200 IDPROVE AS code, RAZONCIAL AS name FROM dbo.PROVEEDORES ${searchClause} ORDER BY IDPROVE`
                break

            case 'terceros':
                searchClause = search ? 'WHERE IDTERCERO LIKE @search OR NOMBRETER LIKE @search' : ''
                query = `SELECT TOP 200 IDTERCERO AS code, NOMBRETER AS name FROM dbo.Terceros ${searchClause} ORDER BY IDTERCERO`
                break

            case 'conceptos':
                searchClause = search ? 'WHERE cd_codigo LIKE @search OR ds_nombre LIKE @search' : ''
                query = `SELECT TOP 200 cd_codigo AS code, ds_nombre AS name FROM dbo.ConceptoFacturacion ${searchClause} ORDER BY cd_codigo`
                break

            case 'tiqueteadores':
                searchClause = search ? 'WHERE cd_codigo LIKE @search OR ds_nombre LIKE @search' : ''
                query = `SELECT TOP 200 cd_codigo AS code, ds_nombre AS name FROM dbo.Tiqueteadores ${searchClause} ORDER BY cd_codigo`
                break

            case 'segmentos':
                searchClause = search ? 'WHERE IDSEGMENTO LIKE @search OR DESSEGMENTO LIKE @search' : ''
                query = `SELECT TOP 200 IDSEGMENTO AS code, DESSEGMENTO AS name FROM dbo.Segmento ${searchClause} ORDER BY IDSEGMENTO`
                break

            case 'etapas':
                searchClause = search ? 'WHERE cd_codigo LIKE @search OR ds_nombre LIKE @search' : ''
                query = `SELECT TOP 200 cd_codigo AS code, ds_nombre AS name FROM dbo.Etapas ${searchClause} ORDER BY cd_codigo`
                break

            case 'tipoventa':
                searchClause = search ? 'WHERE cd_codigo LIKE @search OR ds_nombre LIKE @search' : ''
                query = `SELECT TOP 200 cd_codigo AS code, ds_nombre AS name FROM dbo.TipoVenta ${searchClause} ORDER BY cd_codigo`
                break

            case 'gruposempresariales':
                searchClause = search ? 'WHERE CodigoGrEmpresarial LIKE @search OR Nombre LIKE @search' : ''
                query = `SELECT TOP 200 CodigoGrEmpresarial AS code, Nombre AS name FROM dbo.GREmpresarial ${searchClause} ORDER BY CodigoGrEmpresarial`
                break

            case 'categorias':
                searchClause = search ? 'WHERE cd_codigo LIKE @search OR ds_nombre LIKE @search' : ''
                query = `SELECT TOP 200 cd_codigo AS code, ds_nombre AS name FROM dbo.Categorias ${searchClause} ORDER BY cd_codigo`
                break

            case 'cargosdesc':
                searchClause = search ? 'WHERE cd_codigo LIKE @search OR ds_nombre LIKE @search' : ''
                query = `SELECT TOP 200 cd_codigo AS code, ds_nombre AS name FROM dbo.CargosDesc ${searchClause} ORDER BY cd_codigo`
                break

            case 'impret':
                searchClause = search ? 'WHERE cd_codigo LIKE @search OR ds_nombre LIKE @search' : ''
                query = `SELECT TOP 200 cd_codigo AS code, ds_nombre AS name FROM dbo.ImpRet ${searchClause} ORDER BY cd_codigo`
                break

            default:
                return NextResponse.json({ message: `Tipo de consulta "${type}" no soportado.` }, { status: 400 })
        }

        const result = await request.query(query)
        const recordset = result.recordset || []

        const data = recordset.map((r: any) => ({
            code: (r.code || '').toString().trim(),
            name: (r.name || '').toString().trim()
        }))

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('[LOOKUP_API] Error al consultar tabla:', error)
        return NextResponse.json({ message: error.message || 'Error al consultar tabla en SQL Server.' }, { status: 500 })
    } finally {
        if (pool) {
            try {
                await pool.close()
            } catch (err) {}
        }
    }
}
