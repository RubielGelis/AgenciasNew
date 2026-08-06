import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const referencia = searchParams.get('referencia') || null
        const fechaDesde = searchParams.get('fechaDesde') || null
        const fechaHasta = searchParams.get('fechaHasta') || null
        const cliente = searchParams.get('cliente') || null
        const elaboradoPor = searchParams.get('elaboradoPor') || null
        const montoTotalStr = searchParams.get('montoTotal')
        const montoTotal = (montoTotalStr && !isNaN(parseFloat(montoTotalStr))) ? parseFloat(montoTotalStr) : null
        const estado = searchParams.get('estado') || null

        const results: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM public.fnCotizacionListar($1::varchar, $2::date, $3::date, $4::varchar, $5::varchar, $6::numeric, $7::varchar)`,
            referencia,
            fechaDesde,
            fechaHasta,
            cliente,
            elaboradoPor,
            montoTotal,
            estado
        );
        const quotations = results.map(row => row.fncotizacionlistar);
        return NextResponse.json(quotations)
    } catch (error) {
        console.error('Error retrieving quotations:', error)
        return NextResponse.json({ message: 'Error retrieving quotations' }, { status: 500 })
    }
}
