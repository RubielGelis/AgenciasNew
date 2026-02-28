import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const quotations = await prisma.quotation.findMany({
            include: {
                client: true,
                provider: true,
                hotel: true,
                products: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        })

        return NextResponse.json(quotations)
    } catch (error) {
        console.error('Error fetching quotations:', error)
        return NextResponse.json({ message: 'Error al obtener las cotizaciones' }, { status: 500 })
    }
}
