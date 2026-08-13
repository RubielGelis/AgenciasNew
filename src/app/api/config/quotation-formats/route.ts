import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateHtmlTemplate } from '@/lib/excel-to-html'

export const dynamic = 'force-dynamic'

// GET: Listar todos los formatos de cotización (por branchId o implantId)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const branchId = searchParams.get('branchId')
        const implantId = searchParams.get('implantId')

        const where: any = {}
        if (branchId) where.branchId = parseInt(branchId)
        if (implantId) where.implantId = parseInt(implantId)

        const formats = await prisma.quotationFormat.findMany({
            where,
            include: {
                FormatCellCustomization: true,
                Branch: { select: { id: true, name: true, code: true } },
                Implant: { select: { id: true, name: true, code: true } },
            },
            orderBy: { createdAt: 'asc' }
        })

        // No enviar el binario de la plantilla en el listado para reducir el payload
        const result = formats.map(f => ({
            ...f,
            template: undefined,
            hasTemplate: !!f.template,
            htmlTemplate: undefined,
        }))

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Error fetching quotation formats:', error)
        return NextResponse.json({ message: 'Error al obtener los formatos de cotización', error: error.message }, { status: 500 })
    }
}

// POST: Crear un nuevo formato de cotización
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, description, branchId, implantId, template, templateConfig, cellCustomizations } = body

        if (!name) {
            return NextResponse.json({ message: 'El nombre del formato es requerido' }, { status: 400 })
        }
        if (!branchId && !implantId) {
            return NextResponse.json({ message: 'Se requiere una sucursal o un implant' }, { status: 400 })
        }

        let templateBuffer: any = null
        if (template) {
            const cleanBase64 = template.split(';base64,').pop() || template
            templateBuffer = Buffer.from(cleanBase64, 'base64')
        }

        let htmlTemplate: string | null = null
        if (templateBuffer) {
            try {
                htmlTemplate = await generateHtmlTemplate(templateBuffer as Buffer, templateConfig, null)
            } catch (htmlErr: any) {
                console.error('Error generating HTML template:', htmlErr)
                // No fallar si no se puede generar el HTML - puede configurarse después
            }
        }

        const format = await prisma.quotationFormat.create({
            data: {
                name,
                description: description || null,
                template: templateBuffer,
                templateConfig: templateConfig || null,
                htmlTemplate,
                branchId: branchId ? parseInt(branchId) : null,
                implantId: implantId ? parseInt(implantId) : null,
            }
        })

        // Crear customizaciones de celdas si se enviaron
        if (cellCustomizations && Array.isArray(cellCustomizations) && cellCustomizations.length > 0) {
            await prisma.formatCellCustomization.createMany({
                data: cellCustomizations.map((c: any) => ({
                    formatId: format.id,
                    code: c.code,
                    name: c.name,
                    value: c.value || null,
                })),
                skipDuplicates: true,
            })
        }

        return NextResponse.json({ id: format.id, message: 'Formato de cotización creado exitosamente' }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating quotation format:', error)
        return NextResponse.json({ message: 'Error al crear el formato de cotización', error: error.message }, { status: 500 })
    }
}

// PUT: Importar un formato desde JSON (operación de importación masiva)
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, description, branchId, implantId, template, templateConfig, cellCustomizations } = body

        if (!name || (!branchId && !implantId)) {
            return NextResponse.json({ message: 'Nombre, y sucursal o implant son requeridos para la importación' }, { status: 400 })
        }

        let templateBuffer: any = null
        if (template) {
            const cleanBase64 = template.split(';base64,').pop() || template
            templateBuffer = Buffer.from(cleanBase64, 'base64')
        }

        let htmlTemplate: string | null = null
        if (templateBuffer && templateConfig) {
            try {
                htmlTemplate = await generateHtmlTemplate(templateBuffer as Buffer, templateConfig, null)
            } catch (htmlErr: any) {
                console.error('Error regenerating HTML on import:', htmlErr)
            }
        }

        // Crear el formato
        const format = await prisma.quotationFormat.create({
            data: {
                name,
                description: description || null,
                template: templateBuffer,
                templateConfig: templateConfig || null,
                htmlTemplate,
                branchId: branchId ? parseInt(branchId) : null,
                implantId: implantId ? parseInt(implantId) : null,
            }
        })

        // Importar configuraciones de celda
        if (cellCustomizations && Array.isArray(cellCustomizations) && cellCustomizations.length > 0) {
            await prisma.formatCellCustomization.createMany({
                data: cellCustomizations.map((c: any) => ({
                    formatId: format.id,
                    code: c.code,
                    name: c.name,
                    value: c.value || null,
                })),
                skipDuplicates: true,
            })
        }

        return NextResponse.json({
            id: format.id,
            message: `Formato "${name}" importado exitosamente con ${cellCustomizations?.length || 0} configuraciones de celda`
        }, { status: 201 })
    } catch (error: any) {
        console.error('Error importing quotation format:', error)
        return NextResponse.json({ message: 'Error al importar el formato de cotización', error: error.message }, { status: 500 })
    }
}
