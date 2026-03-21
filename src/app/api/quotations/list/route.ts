import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const results: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM public.fnCotizacionListar()`
        );
        const quotations = results.map(row => row.fncotizacionlistar);
        return NextResponse.json(quotations)
    } catch (error) {
        return NextResponse.json({ message: 'Error retrieving quotations' }, { status: 500 })
    }
}
