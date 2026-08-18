import { NextRequest, NextResponse } from 'next/server'
import { getSQLServerConnection } from '@/lib/sqlserver'
import mssql from 'mssql'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    let pool: mssql.ConnectionPool | null = null

    try {
        const { searchParams } = new URL(req.url)
        let spName = (searchParams.get('spName') || '').trim()

        if (!spName) {
            return NextResponse.json({ message: 'El parámetro "spName" es requerido.' }, { status: 400 })
        }

        console.log(`[DETECT_PARAMS_API] Consultando parámetros para SP: "${spName}"`);

        pool = await getSQLServerConnection()
        const request = pool.request()
        request.input('spName', mssql.VarChar, spName)

        // Query parameters metadata directly from sys.parameters in SQL Server
        const query = `
            SELECT 
                p.name AS param_name,
                t.name AS type_name,
                p.max_length,
                p.is_output
            FROM sys.parameters p
            JOIN sys.types t ON p.user_type_id = t.user_type_id
            WHERE p.object_id = OBJECT_ID(@spName)
               OR p.object_id = OBJECT_ID('dbo.' + REPLACE(REPLACE(@spName, 'dbo.', ''), '[', ''))
            ORDER BY p.parameter_id
        `

        const result = await request.query(query)
        const recordset = result.recordset || []

        if (recordset.length === 0) {
            return NextResponse.json({
                success: false,
                message: `No se encontraron parámetros en SQL Server para "${spName}". Verifica que el nombre del procedimiento almacenado exista exactamente en la base de datos.`
            }, { status: 404 })
        }

        // Known lookup mappings for master table fields
        const knownLookups: Record<string, string> = {
            cd_sucursal: 'sucursales',
            cd_implante: 'implantes',
            cd_cliente: 'clientes',
            cd_vendedor: 'vendedores',
            cd_proveedor: 'proveedores',
            cd_tercero: 'terceros',
            grupo_empresarial: 'gruposempresariales',
            cd_conceptofacturacion: 'conceptos',
            cd_tiqueteador: 'tiqueteadores',
            id_segmento: 'segmentos',
            ds_etapascotizacion: 'etapas',
            ds_tipoventa: 'tipoventa',
            ds_categorias: 'categorias',
            ds_cargosdescadicional: 'cargosdesc',
            ds_impretadicional: 'impret',
            ds_conceptosadicional: 'conceptos',
            ds_conceptosunificados: 'conceptos'
        }

        // Known boolean / select options fields
        const selectFields = [
            'nacionalidad',
            'remision',
            'remfacturadas',
            'facgeneradasrem',
            'soloconceptosventa',
            'nomostrarfeeocultos',
            'mostrarcombustible',
            'mostrartaocemcolumnas',
            'mostraranulacion',
            'porfechadocumento'
        ]

        const formattedParams = recordset.map((row: any) => {
            const rawName = (row.param_name || '').replace(/^@/, '')
            const lowerName = rawName.toLowerCase()
            const typeName = (row.type_name || '').toLowerCase()

            // 1. Label Formatting
            let label = rawName
                .replace(/_/g, ' ')
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/^cd /, 'Código ')
                .replace(/^ds /, 'Descripción ')
                .replace(/^id /, 'ID ')
            label = label.charAt(0).toUpperCase() + label.slice(1)

            // 2. Type Detection
            let type: 'text' | 'date' | 'select' | 'number' = 'text'
            let options: { label: string; value: string }[] | undefined = undefined
            let defaultValue = ''

            if (typeName.includes('date') || typeName.includes('time') || lowerName.includes('fecha')) {
                type = 'date'
                if (lowerName.includes('inicio') || lowerName.includes('start') || lowerName.includes('desde')) {
                    defaultValue = 'FIRST_DAY_OF_MONTH'
                } else if (lowerName.includes('fin') || lowerName.includes('end') || lowerName.includes('hasta')) {
                    defaultValue = 'TODAY'
                }
            } else if (selectFields.some((f) => lowerName.includes(f))) {
                type = 'select'
                if (lowerName === 'nacionalidad') {
                    options = [
                        { label: 'Todos / Ambas', value: '' },
                        { label: 'Nacional', value: 'Nacional' },
                        { label: 'Internacional', value: 'Internacional' }
                    ]
                } else {
                    options = [
                        { label: 'Seleccionar...', value: '' },
                        { label: 'Sí', value: 'SI' },
                        { label: 'No', value: 'NO' }
                    ]
                    defaultValue = lowerName === 'mostrarcombustible' ? 'SI' : 'NO'
                }
            } else if (typeName.includes('int') || typeName.includes('decimal') || typeName.includes('numeric') || typeName.includes('float')) {
                type = 'number'
            }

            // 3. Lookup Type Assignment
            const lookupType = knownLookups[lowerName] || undefined

            // 4. Section Categorization
            let section = 'Filtros Generales'
            if (type === 'date' || lowerName.includes('fech')) {
                section = 'Fechas'
            } else if (lowerName.includes('remision') || lowerName.includes('concepto') || lowerName.includes('factura') || lowerName.includes('cargo') || lowerName.includes('impuesto')) {
                section = 'Documentos & Conceptos'
            } else if (lowerName.includes('mostrar') || lowerName.includes('categoria') || lowerName.includes('variable') || lowerName.includes('etapa') || lowerName.includes('venta')) {
                section = 'Opciones de Reporte'
            }

            return {
                name: rawName,
                label,
                type,
                lookupType,
                section,
                defaultValue,
                options,
                required: false
            }
        })

        return NextResponse.json({
            success: true,
            spName,
            count: formattedParams.length,
            parameters: formattedParams
        })
    } catch (error: any) {
        console.error('[DETECT_PARAMS_API] Error al detectar parámetros:', error)
        return NextResponse.json({
            success: false,
            message: error.message || 'Error al conectar con SQL Server para detectar los parámetros del procedimiento.'
        }, { status: 500 })
    } finally {
        if (pool) {
            try {
                await pool.close()
            } catch (err) {}
        }
    }
}
