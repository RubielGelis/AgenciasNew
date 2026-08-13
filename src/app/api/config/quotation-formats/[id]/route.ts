import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateHtmlTemplate } from '@/lib/excel-to-html'

export const dynamic = 'force-dynamic'

// GET: Obtener un formato específico con su plantilla (para exportación o edición)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        if (isNaN(id)) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

        const format = await prisma.quotationFormat.findUnique({
            where: { id },
            include: {
                FormatCellCustomization: true,
                Branch: { select: { id: true, name: true, code: true } },
                Implant: { select: { id: true, name: true, code: true } },
            }
        })

        if (!format) return NextResponse.json({ message: 'Formato no encontrado' }, { status: 404 })

        const { searchParams } = new URL(req.url)
        const exportMode = searchParams.get('export') === 'true'

        if (exportMode) {
            // Exportar como JSON completo (con plantilla en base64)
            const exportData = {
                name: format.name,
                description: format.description,
                templateConfig: format.templateConfig,
                template: format.template ? Buffer.from(format.template as any).toString('base64') : null,
                cellCustomizations: format.FormatCellCustomization.map(c => ({
                    code: c.code,
                    name: c.name,
                    value: c.value,
                })),
                exportedAt: new Date().toISOString(),
                version: '1.0',
            }

            const jsonStr = JSON.stringify(exportData, null, 2)
            const safeFilename = format.name.replace(/[^a-zA-Z0-9_-]/g, '_')
            return new NextResponse(jsonStr, {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename=formato_${safeFilename}.json`,
                }
            })
        }

        // Retornar para edición (sin binario del template para ahorrar payload)
        return NextResponse.json({
            ...format,
            template: undefined,
            hasTemplate: !!format.template,
        })
    } catch (error: any) {
        console.error('Error fetching quotation format:', error)
        return NextResponse.json({ message: 'Error al obtener el formato', error: error.message }, { status: 500 })
    }
}

// PUT: Actualizar un formato existente
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        if (isNaN(id)) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

        const body = await req.json()
        const { name, description, template, templateConfig, cellCustomizations } = body

        const existingFormat = await prisma.quotationFormat.findUnique({ where: { id } })
        if (!existingFormat) return NextResponse.json({ message: 'Formato no encontrado' }, { status: 404 })

        // Procesar plantilla si se envió una nueva
        let templateBuffer: any = undefined
        let htmlTemplate: string | null | undefined = undefined

        if (template !== undefined) {
            if (template) {
                const cleanBase64 = template.split(';base64,').pop() || template
                templateBuffer = Buffer.from(cleanBase64, 'base64')

                try {
                    htmlTemplate = await generateHtmlTemplate(templateBuffer as Buffer, templateConfig || existingFormat.templateConfig, null)
                } catch (htmlErr: any) {
                    console.error('Error generating HTML template on update:', htmlErr)
                    htmlTemplate = null
                }
            } else {
                templateBuffer = null
                htmlTemplate = null
            }
        }

        const updateData: any = {
            updatedAt: new Date(),
        }
        if (name !== undefined) updateData.name = name
        if (description !== undefined) updateData.description = description
        if (templateBuffer !== undefined) updateData.template = templateBuffer
        if (htmlTemplate !== undefined) updateData.htmlTemplate = htmlTemplate
        if (templateConfig !== undefined) updateData.templateConfig = templateConfig

        await prisma.quotationFormat.update({
            where: { id },
            data: updateData,
        })

        // Sincronizar las customizaciones de celdas si se enviaron
        if (cellCustomizations !== undefined && Array.isArray(cellCustomizations)) {
            // Eliminar las existentes y volver a crear
            await prisma.formatCellCustomization.deleteMany({ where: { formatId: id } })
            if (cellCustomizations.length > 0) {
                await prisma.formatCellCustomization.createMany({
                    data: cellCustomizations.map((c: any) => ({
                        formatId: id,
                        code: c.code,
                        name: c.name,
                        value: c.value || null,
                    })),
                    skipDuplicates: true,
                })
            }
        }

        return NextResponse.json({ message: 'Formato de cotización actualizado exitosamente' })
    } catch (error: any) {
        console.error('Error updating quotation format:', error)
        return NextResponse.json({ message: 'Error al actualizar el formato', error: error.message }, { status: 500 })
    }
}

// DELETE: Eliminar un formato
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        if (isNaN(id)) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

        const existingFormat = await prisma.quotationFormat.findUnique({ where: { id } })
        if (!existingFormat) return NextResponse.json({ message: 'Formato no encontrado' }, { status: 404 })

        await prisma.quotationFormat.delete({ where: { id } })

        return NextResponse.json({ message: 'Formato de cotización eliminado exitosamente' })
    } catch (error: any) {
        console.error('Error deleting quotation format:', error)
        return NextResponse.json({ message: 'Error al eliminar el formato', error: error.message }, { status: 500 })
    }
}
