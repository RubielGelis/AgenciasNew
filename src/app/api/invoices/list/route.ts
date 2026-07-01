import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const results: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM public."fnInvoicesListar"()`
        );
        const invoices = results;
        return NextResponse.json(invoices)
    } catch (error) {
        return NextResponse.json({ message: 'Error retrieving invoices' }, { status: 500 })
    }
}
