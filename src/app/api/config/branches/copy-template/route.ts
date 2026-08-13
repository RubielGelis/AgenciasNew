import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { syncCellCustomization } from '@/lib/cell-customization'
import { generateHtmlTemplate } from '@/lib/excel-to-html'
import { logSystemEvent } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * POST /api/config/branches/copy-template
 * Copia el template, templateConfig y cellCustomizations de una sucursal origen a una destino.
 * Body: { sourceBranchId: number, targetBranchId: number }
 */
export async function POST(req: NextRequest) {
    try {
        const { sourceBranchId, targetBranchId } = await req.json()
        const userIdHeader = req.headers.get('X-User-Id')
        const actingUserId = userIdHeader ? parseInt(userIdHeader) : 1

        if (!sourceBranchId || !targetBranchId) {
            return NextResponse.json({ message: 'sourceBranchId y targetBranchId son requeridos' }, { status: 400 })
        }
        if (sourceBranchId === targetBranchId) {
            return NextResponse.json({ message: 'La sucursal origen y destino no pueden ser la misma' }, { status: 400 })
        }

        // Cargar la sucursal origen con todo su formato
        const source = await prisma.branch.findUnique({
            where: { id: sourceBranchId },
            include: { cellCustomizations: true }
        })
        if (!source) {
            return NextResponse.json({ message: `Sucursal origen con ID ${sourceBranchId} no encontrada` }, { status: 404 })
        }
        if (!source.template && !source.templateConfig) {
            return NextResponse.json({ message: `La sucursal origen "${source.name}" no tiene un formato de plantilla configurado` }, { status: 422 })
        }

        // Verificar sucursal destino
        const target = await prisma.branch.findUnique({ where: { id: targetBranchId }, select: { id: true, name: true, logo: true } })
        if (!target) {
            return NextResponse.json({ message: `Sucursal destino con ID ${targetBranchId} no encontrada` }, { status: 404 })
        }

        // Regenerar HTML template para la sucursal destino
        // (puede tener logo diferente, usamos el logo de la destino si existe)
        let htmlTemplate: string | null = null
        if (source.template) {
            try {
                const logoBuffer = target.logo ? Buffer.from(target.logo as any) : (source.logo ? Buffer.from(source.logo as any) : null)
                htmlTemplate = await generateHtmlTemplate(
                    Buffer.from(source.template as any),
                    source.templateConfig as any,
                    logoBuffer
                )
            } catch (err: any) {
                console.warn('Warning: could not regenerate HTML template during copy:', err.message)
                // No bloqueamos la operación, simplemente no actualizamos el htmlTemplate
            }
        }

        // Actualizar la sucursal destino con el template de la origen
        await prisma.branch.update({
            where: { id: targetBranchId },
            data: {
                template: source.template,
                templateConfig: source.templateConfig,
                ...(htmlTemplate ? { htmlTemplate } : {})
            }
        })

        // Copiar también las cellCustomizations (mapeo de celdas individuales)
        if (source.cellCustomizations.length > 0) {
            await syncCellCustomization(targetBranchId, null, source.templateConfig as any)
        }

        const sourceName = source.name
        const targetName = target.name

        logSystemEvent({
            userId: actingUserId,
            action: 'UPDATE',
            module: 'MASTER_DATA',
            description: `Formato de plantilla copiado de sucursal "${sourceName}" (ID:${sourceBranchId}) → "${targetName}" (ID:${targetBranchId}).`
        })

        return NextResponse.json({
            message: `Formato copiado exitosamente desde "${sourceName}" hacia "${targetName}".`,
            sourceBranchId,
            targetBranchId
        })
    } catch (error: any) {
        console.error('Error copying branch template:', error)
        return NextResponse.json({ message: 'Error al copiar formato: ' + error.message }, { status: 500 })
    }
}
