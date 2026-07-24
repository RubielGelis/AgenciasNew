import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id: paramId } = await context.params
        const id = parseInt(paramId)
        if (isNaN(id)) return NextResponse.json({ message: 'ID inválido' }, { status: 400 })

        const results: any[] = await prisma.$queryRawUnsafe(
            `SELECT public.fnCotizacion($1::INT) as data`,
            id
        )

        const quotationData = results[0]?.data

        if (!quotationData) {
            return NextResponse.json({ message: 'Cotización no encontrada' }, { status: 404 })
        }

        return NextResponse.json(quotationData)
    } catch (error: any) {
        console.error('Error executing fnCotizacion API:', error)
        return NextResponse.json({ message: 'Error al consultar fnCotizacion: ' + (error.message || 'Error desconocido') }, { status: 500 })
    }
}
