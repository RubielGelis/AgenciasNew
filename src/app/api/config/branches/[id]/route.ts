import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface Params {
    id: string
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        if (isNaN(id)) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

        const branch = await prisma.branch.findUnique({
            where: { id },
            include: {
                cellCustomizations: true
            }
        })

        if (!branch) return NextResponse.json({ message: 'Sucursal no encontrada' }, { status: 404 })

        const { searchParams } = new URL(req.url)
        const exportMode = searchParams.get('export') === 'true'

        if (exportMode) {
            // Export as format configuration JSON
            const exportData = {
                name: `Formato Sucursal: ${branch.name}`,
                description: `Exportado desde la configuración de sucursal ${branch.name}`,
                templateConfig: branch.templateConfig || {},
                template: branch.template ? Buffer.from(branch.template as any).toString('base64') : null,
                cellCustomizations: branch.cellCustomizations.map(c => ({
                    code: c.code,
                    name: c.name,
                    value: c.value,
                })),
                exportedAt: new Date().toISOString(),
                version: '1.0',
            }

            const jsonStr = JSON.stringify(exportData, null, 2)
            const safeFilename = branch.name.replace(/[^a-zA-Z0-9_-]/g, '_')
            return new NextResponse(jsonStr, {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename=formato_sucursal_${safeFilename}.json`,
                }
            })
        }

        // Standard GET (not export mode)
        return NextResponse.json({
            id: branch.id,
            code: branch.code,
            name: branch.name,
            hasTemplate: !!branch.template,
            templateConfig: branch.templateConfig,
        })
    } catch (error: any) {
        console.error('Error fetching/exporting branch:', error)
        return NextResponse.json({ message: 'Error al procesar sucursal', error: error.message }, { status: 500 })
    }
}
