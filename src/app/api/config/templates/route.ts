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
            data = [{ code: 'COD-001', name: 'Juan Perez', email: 'juan@correo.com' }]
            filename = `plantilla_${type}`
            break
        case 'clientes':
            data = [{ document: '12345678', name: 'Cliente Ejemplo', contactInfo: '3001234567', address: 'Calle 123 #45' }]
            filename = 'plantilla_clientes'
            break
        case 'proveedores':
            data = [{ code: 'AMADEUS', name: 'Proveedor Ejemplo', contactInfo: 'reservas@proveedor.com' }]
            filename = 'plantilla_proveedores'
            break
        case 'productos':
            data = [{ code: 'P-001', type: 'HOTEL', description: 'Habitación Estándar', basePrice: 150000 }]
            filename = 'plantilla_productos'
            break
        case 'impuestos':
            data = [{ name: 'IVA 19%', type: 'TAX', valueType: 'PERCENTAGE', value: 19 }]
            filename = 'plantilla_impuestos'
            break
        case 'hoteles':
            data = [{ code: 'H-001', name: 'Hotel San Luis', category: '4*', providerName: 'Decameron' }]
            filename = 'plantilla_hoteles'
            break
        case 'usuarios':
            data = [{ email: 'ejemplo@correo.com', name: 'Usuario Nuevo', roleName: 'Admin', password: 'password123' }]
            filename = 'plantilla_usuarios'
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
