import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    const workbook = XLSX.utils.book_new()
    let data: any[] = []
    let filename = 'plantilla'

    switch (type) {
        case 'sucursales':
            data = [{ code: 'SUC-001', name: 'Sede Norte' }]
            filename = 'plantilla_sucursales'
            break
        case 'implants':
            data = [{ code: 'IMP-001', name: 'Implant Bogotá', branchCode: 'SUC-001' }]
            filename = 'plantilla_implants'
            break
        case 'vendedores':
        case 'tiqueteadores':
            data = [{ name: 'Juan Perez', email: 'juan@correo.com', code: 'COD-001' }]
            filename = `plantilla_${type}`
            break
        case 'clientes':
            data = [{ document: '12345678', name: 'Cliente Ejemplo', contactInfo: '3001234567', address: 'Calle 123 #45' }]
            filename = 'plantilla_clientes'
            break
        case 'proveedores':
            data = [{ name: 'Proveedor Ejemplo', contactInfo: 'reservas@proveedor.com', code: 'AMADEUS' }]
            filename = 'plantilla_proveedores'
            break
        case 'productos':
            data = [{ description: 'Habitación Estándar', basePrice: 150000, code: 'P-001', type: 'HOTEL', billingConcept: 'ALOS', serviceType: 'ALOJAMIENTO' }]
            filename = 'plantilla_productos'
            break
        case 'impuestos':
            data = [{ code: 'IVA-19', name: 'IVA 19%', type: 'TAX', valueType: 'PERCENTAGE', value: 19, inNationality: 1 }]
            filename = 'plantilla_impuestos'
            break
        case 'prestadoras':
            data = [{ name: 'Prestadora San Luis', providerName: 'Decameron', code: 'H-001', category: '4*', location: 'San Andrés', type: 'HOTEL' }]
            filename = 'plantilla_prestadoras'
            break
        case 'variables':
            data = [{ code: 'VAR-001', name: 'Variable Ejemplo' }]
            filename = 'plantilla_variables'
            break
        case 'parametros':
            data = [{ code: 'PAR-001', name: 'Parametro Ejemplo', value: 'Valor' }]
            filename = 'plantilla_parametros'
            break
        case 'usuarios':
            data = [{ email: 'ejemplo@correo.com', name: 'Usuario Nuevo', roleName: 'Admin', password: 'password123' }]
            filename = 'plantilla_usuarios'
            break
        case 'combos':
            data = [{ code: 'CMB-001', name: 'Combo Básico', cupos: 10, currencyCode: 'USD' }]
            filename = 'plantilla_combos'
            break
        case 'resoluciones':
            data = [{ code: 'RES-001', name: 'Resolución Facturación Principal', autoriza: '187600000000', prefijo: 'FE', inicial: 1, end: 5000, alerta: 50, day: 15, permitir: 0 }]
            filename = 'plantilla_resoluciones'
            break
        case 'sysconsecutivos':
            data = [{ code: 'FAC', name: 'Consecutivo Facturas', fuente: 'FAC', serie: '001', consecutivo: 1, branchName: 'Sede Norte', implantName: '' }]
            filename = 'plantilla_sysconsecutivos'
            break
        default:
            return NextResponse.json({ message: 'Tipo no válido' }, { status: 400 })
    }

    const worksheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla')

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buf, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=${filename}.xlsx`
        }
    })
}
