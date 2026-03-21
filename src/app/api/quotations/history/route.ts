import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const results: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM public.fnCotizacionHistorial()`
        );
        const history = results.map(row => row.fncotizacionhistorial);
        return NextResponse.json(history)
    } catch (error) {
        console.error('Error fetching quotation history:', error)
        return NextResponse.json({ message: 'Error fetching history' }, { status: 500 })
    }
}
