import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/executions/presets?procedureId=X
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const procedureId = searchParams.get('procedureId')

        if (!procedureId) {
            return NextResponse.json({ message: 'El parámetro "procedureId" es requerido.' }, { status: 400 })
        }

        const presets = await prisma.executionPreset.findMany({
            where: { procedureId: Number(procedureId) },
            orderBy: { name: 'asc' }
        })

        return NextResponse.json(presets)
    } catch (error: any) {
        console.error('Error fetching execution presets:', error)
        return NextResponse.json({ message: 'Error al obtener plantillas guardadas.', error: error.message }, { status: 500 })
    }
}

// POST /api/executions/presets
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, name, procedureId, description, filterValues, filterConfig, columnConfigs, selectedTotals } = body

        if (!name || !procedureId) {
            return NextResponse.json({ message: 'El nombre y el ID del procedimiento son obligatorios.' }, { status: 400 })
        }

        if (id) {
            const updated = await prisma.executionPreset.update({
                where: { id: Number(id) },
                data: {
                    name,
                    description,
                    filterValues: filterValues || {},
                    filterConfig: filterConfig || {},
                    columnConfigs: columnConfigs || [],
                    selectedTotals: selectedTotals || []
                }
            })
            return NextResponse.json(updated)
        } else {
            const created = await prisma.executionPreset.create({
                data: {
                    name,
                    procedureId: Number(procedureId),
                    description,
                    filterValues: filterValues || {},
                    filterConfig: filterConfig || {},
                    columnConfigs: columnConfigs || [],
                    selectedTotals: selectedTotals || []
                }
            })
            return NextResponse.json(created)
        }
    } catch (error: any) {
        console.error('Error saving execution preset:', error)
        return NextResponse.json({ message: error.message || 'Error al guardar la plantilla.' }, { status: 500 })
    }
}

// DELETE /api/executions/presets?id=X
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ message: 'El ID de la plantilla es requerido.' }, { status: 400 })
        }

        await prisma.executionPreset.delete({
            where: { id: Number(id) }
        })

        return NextResponse.json({ success: true, message: 'Plantilla eliminada con éxito.' })
    } catch (error: any) {
        console.error('Error deleting execution preset:', error)
        return NextResponse.json({ message: error.message || 'Error al eliminar la plantilla.' }, { status: 500 })
    }
}
