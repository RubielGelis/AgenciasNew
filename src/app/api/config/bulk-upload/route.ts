import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const type = formData.get('type') as string

        if (!file) {
            return NextResponse.json({ message: 'No se subió ningún archivo' }, { status: 400 })
        }

        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(sheet) as any[]

        if (data.length === 0) {
            return NextResponse.json({ message: 'El archivo está vacío' }, { status: 400 })
        }

        // Convert JSON data to Delimited Text (Rows by \n, Cols by ^)
        // We match column names to what the SP expect for each type
        const textData = data.map((item: any) => {
            let cols: any[] = []
            if (type === 'sucursales') {
                cols = [item.code, item.name]
            } else if (type === 'implants') {
                cols = [item.code, item.name, item.branchCode]
            } else if (type === 'vendedores') {
                cols = [item.name, item.email, item.code]
            } else if (type === 'tiqueteadores') {
                cols = [item.name, item.email, item.code]
            } else if (type === 'impuestos') {
                // New Format: code^name^type^valueType^value^inNationality
                cols = [item.code || '', item.name, item.type, item.valueType, item.value, item.inNationality || '1']
            } else if (type === 'clientes') {
                cols = [item.document, item.name, item.contactInfo, item.address]
            } else if (type === 'proveedores') {
                cols = [item.name, item.contactInfo, item.code]
            } else if (type === 'productos') {
                cols = [item.description, item.basePrice, item.code, item.type, item.billingConcept, item.serviceType]
            } else if (type === 'prestadoras') {
                cols = [item.name, item.providerNM || item.providerName, item.code, item.category || item.stars, item.location]
            } else if (type === 'usuarios') {
                cols = [item.email, item.name, item.roleName, item.password]
            }
            return cols.map(c => (c !== undefined && c !== null ? c.toString().replace(/\^/g, ' ') : '')).join('^')
        }).join('\n')

        // Call the Stored Procedure with TEXT data
        const results: any[] = await prisma.$queryRawUnsafe(
            `CALL public.spMaestroImportar($1::TEXT, $2::TEXT, $3::INT, $4::TEXT)`,
            type,
            textData,
            actingUserId,
            '' // p_mensaje_resultado
        );

        const message = results[0]?.p_mensaje_resultado || '';

        import('@/lib/logger').then(({ logSystemEvent }) => {
            logSystemEvent({ 
                userId: actingUserId, 
                action: 'IMPORT', 
                module: type.toUpperCase(), 
                description: `Importación masiva de ${type} vía SP (Texto). Resultado: ${message}`, 
                metadata: { type, message } 
            });
        });

        if (message.startsWith('ERROR')) {
            throw new Error(message);
        }

        return NextResponse.json({
            message: message.startsWith('SUCCESS') ? message : `Importación completada: ${message}`
        })

    } catch (error: any) {
        console.error('Bulk upload error (SP Text):', error)
        return NextResponse.json({ message: 'Error al procesar la importación masiva: ' + error.message }, { status: 500 })
    }
}
